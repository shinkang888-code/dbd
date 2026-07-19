// filepath: src/lib/cafe24/admin-products.ts
import { cafe24AdminConfigured, cafe24ShopNo } from "./config";
import { cafe24Fetch } from "./client";

export async function cafe24AdminListProducts(limit = 100) {
  if (!cafe24AdminConfigured()) return null;
  try {
    return await cafe24Fetch<{ products?: unknown[] }>({
      scope: "admin",
      path: "/products",
      query: { limit },
    });
  } catch (e) {
    console.error("[cafe24.admin.products]", e);
    return null;
  }
}

export async function cafe24AdminCreateProduct(input: {
  name: string;
  priceKrw: number;
  description?: string;
}) {
  if (!cafe24AdminConfigured()) throw new Error("Cafe24 Admin token required");
  return cafe24Fetch({
    scope: "admin",
    method: "POST",
    path: "/products",
    body: {
      shop_no: cafe24ShopNo(),
      request: {
        display: "T",
        selling: "T",
        product_name: input.name,
        price: String(input.priceKrw),
        supply_price: String(input.priceKrw),
        description: input.description ?? "",
      },
    },
  });
}

export async function cafe24AdminGetProduct(productNo: number) {
  if (!cafe24AdminConfigured()) throw new Error("Cafe24 Admin token required");
  return cafe24Fetch<{
    product?: {
      product_no: number;
      product_name?: string;
      description?: string;
      summary_description?: string;
    };
  }>({
    scope: "admin",
    path: `/products/${productNo}`,
  });
}

/**
 * Studio 승인 PDP 게시용 — 상품 상세 HTML(+선택 SEO 필드)만 갱신.
 * 스킨 파일 직접 수정은 D-002 기본값에 따라 하지 않는다.
 */
export async function cafe24AdminUpdateProductDescription(input: {
  productNo: number;
  description: string;
  productName?: string;
  summaryDescription?: string;
}) {
  if (!cafe24AdminConfigured()) throw new Error("Cafe24 Admin token required");
  const request: Record<string, string> = {
    description: input.description,
  };
  if (input.productName) request.product_name = input.productName;
  if (input.summaryDescription) request.summary_description = input.summaryDescription;
  return cafe24Fetch({
    scope: "admin",
    method: "PUT",
    path: `/products/${input.productNo}`,
    body: {
      shop_no: cafe24ShopNo(),
      request,
    },
  });
}
