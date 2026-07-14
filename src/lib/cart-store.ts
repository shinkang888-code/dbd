// filepath: src/lib/cart-store.ts
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { cartItems, products } from "@/db/schema";
import { getProductBySlug, finalPrice, type Product } from "@/lib/catalog";

export const CART_COOKIE = "lexi_cart_token";

export type CartLine = { slug: string; qty: number; product: Product; lineTotal: number };

function newToken() {
  return `c_${crypto.randomUUID().replace(/-/g, "")}`;
}

export async function getCartToken(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;
  return newToken();
}

export async function ensureCartToken(): Promise<string> {
  const jar = await cookies();
  let token = jar.get(CART_COOKIE)?.value;
  if (!token) {
    token = newToken();
    jar.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return token;
}

/** DB 우선, 실패 시 쿠키 JSON 폴백 `lexi_cart_json` */
export async function readCart(): Promise<CartLine[]> {
  const token = await getCartToken();
  if (hasDb()) {
    try {
      const rows = await db()
        .select({
          qty: cartItems.qty,
          slug: products.slug,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartToken, token));

      const lines: CartLine[] = [];
      for (const r of rows) {
        const product = await getProductBySlug(r.slug);
        if (!product) continue;
        lines.push({
          slug: r.slug,
          qty: r.qty,
          product,
          lineTotal: +(finalPrice(product) * r.qty).toFixed(2),
        });
      }
      if (lines.length) return lines;
    } catch {
      /* fall through */
    }
  }

  const jar = await cookies();
  const raw = jar.get("lexi_cart_json")?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { items: { slug: string; qty: number }[] };
    const lines: CartLine[] = [];
    for (const it of parsed.items ?? []) {
      const product = await getProductBySlug(it.slug);
      if (!product) continue;
      lines.push({
        slug: it.slug,
        qty: it.qty,
        product,
        lineTotal: +(finalPrice(product) * it.qty).toFixed(2),
      });
    }
    return lines;
  } catch {
    return [];
  }
}

async function writeJsonFallback(items: { slug: string; qty: number }[]) {
  const jar = await cookies();
  jar.set("lexi_cart_json", encodeURIComponent(JSON.stringify({ items })), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function setCartItem(slug: string, qty: number) {
  const token = await ensureCartToken();
  const product = await getProductBySlug(slug);
  if (!product) throw new Error("product not found");

  // Cafe24 Front Cart 미러 (실패해도 로컬 카트 유지)
  try {
    const cafe24No = (product as { cafe24ProductNo?: number }).cafe24ProductNo;
    if (cafe24No && qty > 0) {
      const { cafe24AddToCart } = await import("@/lib/cafe24/carts");
      const { cafe24Mode } = await import("@/lib/cafe24/config");
      if (cafe24Mode() !== "off") {
        await cafe24AddToCart({ productNo: cafe24No, quantity: qty }).catch(() => undefined);
      }
    }
  } catch {
    /* local cart continues */
  }

  if (hasDb()) {
    try {
      const [row] = await db()
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);

      if (row) {
        if (qty <= 0) {
          await db()
            .delete(cartItems)
            .where(and(eq(cartItems.cartToken, token), eq(cartItems.productId, row.id)));
        } else {
          const existing = await db()
            .select({ id: cartItems.id })
            .from(cartItems)
            .where(and(eq(cartItems.cartToken, token), eq(cartItems.productId, row.id)))
            .limit(1);
          if (existing[0]) {
            await db()
              .update(cartItems)
              .set({ qty, updatedAt: new Date() })
              .where(eq(cartItems.id, existing[0].id));
          } else {
            await db().insert(cartItems).values({ cartToken: token, productId: row.id, qty });
          }
        }
        return readCart();
      }
    } catch {
      /* json fallback */
    }
  }

  const current = await readCart();
  const map = new Map(current.map((l) => [l.slug, l.qty]));
  if (qty <= 0) map.delete(slug);
  else map.set(slug, qty);
  await writeJsonFallback([...map.entries()].map(([s, q]) => ({ slug: s, qty: q })));
  return readCart();
}

export async function clearCart() {
  const token = await getCartToken();
  if (hasDb()) {
    try {
      await db().delete(cartItems).where(eq(cartItems.cartToken, token));
    } catch {
      /* ignore */
    }
  }
  const jar = await cookies();
  jar.set("lexi_cart_json", encodeURIComponent(JSON.stringify({ items: [] })), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
