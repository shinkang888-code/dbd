// filepath: src/lib/catalog.ts
/**
 * 카탈로그 어댑터 우선순위:
 * 1) Cafe24 Front API (CAFE24_* 설정 시)
 * 2) Neon Drizzle
 * 3) dummy-data
 */
import { and, count, eq, isNull } from "drizzle-orm";
import { db, hasDb } from "@/db";
import {
  brands,
  categories,
  orders,
  productImages,
  products as productsTable,
  users,
} from "@/db/schema";
import {
  products as dummyProducts,
  bySlug as dummyBySlug,
  finalPrice,
  type Product,
} from "@/lib/dummy-data";
import {
  getCafe24ProductBySlug,
  listCafe24Products,
  searchCafe24Products,
} from "@/lib/cafe24/catalog";
import { cafe24Mode, cafe24StatusPayload } from "@/lib/cafe24/config";

export type { Product };
export { finalPrice };

async function fromDb(): Promise<Product[] | null> {
  if (!hasDb()) return null;
  try {
    const rows = await db()
      .select({
        slug: productsTable.slug,
        name: productsTable.name,
        brand: brands.name,
        category: categories.slug,
        price: productsTable.priceUsd,
        discountRate: productsTable.discountRate,
        rating: productsTable.ratingAvg,
        reviewCount: productsTable.reviewCount,
        image: productImages.url,
      })
      .from(productsTable)
      .innerJoin(brands, eq(productsTable.brandId, brands.id))
      .innerJoin(categories, eq(productsTable.categoryId, categories.id))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, productsTable.id), eq(productImages.sort, 0)),
      )
      .where(and(isNull(productsTable.deletedAt), isNull(brands.deletedAt)));

    if (!rows.length) return null;

    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      brand: r.brand,
      category: (r.category as Product["category"]) || "beauty",
      price: Number(r.price),
      discountRate: r.discountRate,
      rating: Number(r.rating ?? 0),
      reviewCount: r.reviewCount,
      image:
        r.image ||
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    }));
  } catch {
    return null;
  }
}

export async function listProducts(filter?: {
  category?: string;
  saleOnly?: boolean;
}): Promise<Product[]> {
  if (cafe24Mode() !== "off") {
    const cafe = await listCafe24Products(filter);
    if (cafe && cafe.length) return cafe;
  }
  const all = (await fromDb()) ?? dummyProducts;
  let list = all;
  if (filter?.category) list = list.filter((p) => p.category === filter.category);
  if (filter?.saleOnly) list = list.filter((p) => p.discountRate > 0);
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (cafe24Mode() !== "off") {
    const cafe = await getCafe24ProductBySlug(slug);
    if (cafe) return cafe;
  }
  const all = (await fromDb()) ?? dummyProducts;
  return all.find((p) => p.slug === slug) ?? dummyBySlug(slug);
}

export async function searchProducts(q: string): Promise<Product[]> {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  if (cafe24Mode() !== "off") {
    const cafe = await searchCafe24Products(q);
    if (cafe.length) return cafe;
  }
  const all = await listProducts();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(needle) ||
      p.brand.toLowerCase().includes(needle) ||
      p.slug.includes(needle),
  );
}

export async function adminStats() {
  const cafe = cafe24StatusPayload();
  if (cafe24Mode() !== "off") {
    const cafeProducts = await listCafe24Products();
    if (cafeProducts) {
      return {
        products: cafeProducts.length,
        brands: new Set(cafeProducts.map((p) => p.brand)).size,
        orders: 0,
        users: 0,
        source: "cafe24" as const,
        cafe24: cafe,
      };
    }
  }

  if (!hasDb()) {
    return {
      products: dummyProducts.length,
      brands: new Set(dummyProducts.map((p) => p.brand)).size,
      orders: 0,
      users: 0,
      source: "dummy" as const,
      cafe24: cafe,
    };
  }
  try {
    const d = db();
    const [p] = await d
      .select({ c: count() })
      .from(productsTable)
      .where(isNull(productsTable.deletedAt));
    const [b] = await d.select({ c: count() }).from(brands).where(isNull(brands.deletedAt));
    const [o] = await d.select({ c: count() }).from(orders).where(isNull(orders.deletedAt));
    const [u] = await d.select({ c: count() }).from(users).where(isNull(users.deletedAt));
    return {
      products: Number(p?.c ?? 0),
      brands: Number(b?.c ?? 0),
      orders: Number(o?.c ?? 0),
      users: Number(u?.c ?? 0),
      source: "neon" as const,
      cafe24: cafe,
    };
  } catch {
    return {
      products: dummyProducts.length,
      brands: new Set(dummyProducts.map((p) => p.brand)).size,
      orders: 0,
      users: 0,
      source: "dummy" as const,
      cafe24: cafe,
    };
  }
}
