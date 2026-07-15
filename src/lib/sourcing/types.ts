/** 공급처 커넥터 인터페이스 — 스펙 §2 P1 */

export type RemoteProduct = {
  externalId: string;
  url?: string;
  title: string;
  descriptionHtml?: string;
  categoryPath: string[];
  price: number;
  currency: string;
  stock: number;
  sellerName?: string;
  sellerInfo?: Record<string, unknown>;
  images: { url: string }[];
  optionSchema?: Record<string, unknown>;
};

export type SourcingOrderPayload = {
  externalId: string;
  qty: number;
  shippingAddress: Record<string, string>;
  note?: string;
};

export interface SupplierConnector {
  code: string;
  /** 카탈로그 페이지 수집 */
  listProducts(q: { category?: string; page: number; pageSize?: number }): Promise<RemoteProduct[]>;
  /** 단건 상세 (재고/판매자정보 갱신) */
  getProduct(externalId: string): Promise<RemoteProduct | null>;
  /** URL 단건 임포트 (타오바오/1688 보조 경로) */
  importByUrl?(url: string): Promise<RemoteProduct | null>;
  /** 발주 — 미지원 커넥터는 수동 발주로 폴백 */
  placeOrder?(req: SourcingOrderPayload): Promise<{ supplierOrderRef: string }>;
  /** 트래킹 조회 */
  getTracking?(supplierOrderRef: string): Promise<{ trackingNo?: string; carrier?: string; status?: string } | null>;
}

export function contentHashOf(p: RemoteProduct) {
  const basis = `${p.title}|${p.price}|${p.stock}|${p.images.map((i) => i.url).join(",")}`;
  let h = 0;
  for (let i = 0; i < basis.length; i++) h = (h * 31 + basis.charCodeAt(i)) | 0;
  return `h${(h >>> 0).toString(36)}`;
}
