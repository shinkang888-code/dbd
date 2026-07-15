/** 역직구 HQ 도메인 타입 — docs/lexi-dropship-integration-spec.md §1 */

export type Supplier = {
  id: number;
  code: string;
  name: string;
  homepage?: string;
  connectorKind: "api" | "agent" | "scrape" | "mock";
  currency: string;
  leadTimeDays: number;
  asCenterUrl?: string;
  asPolicy?: string;
  legalNote?: string;
  status: "active" | "paused";
  createdAt: string;
};

export type SupplierProduct = {
  id: number;
  supplierId: number;
  externalId: string;
  url?: string;
  rawTitle: string;
  rawDescriptionHtml?: string;
  rawCategoryPath: string[];
  priceOriginal: number;
  currency: string;
  stock: number;
  sellerName?: string;
  sellerInfo?: Record<string, unknown>;
  images: { url: string }[];
  optionSchema?: Record<string, unknown>;
  contentHash: string;
  fetchedAt: string;
  syncStatus: "ok" | "stale" | "gone";
};

export type Collection = {
  id: number;
  slug: string;
  name: string;
  note?: string;
  createdAt: string;
};

export type CollectionItem = {
  id: number;
  collectionId: number;
  supplierProductId: number;
  decision: "candidate" | "approved" | "rejected";
  pinnedAt: string;
};

export type DesignBlock =
  | { type: "hero"; headline: string; sub?: string; assetIndex: number }
  | { type: "usp"; items: string[] }
  | { type: "gallery"; assetIndexes: number[] }
  | { type: "spec-table"; rows: [string, string][] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "cta"; label: string };

export type ListingDraft = {
  id: number;
  supplierProductId: number;
  collectionId?: number;
  version: number;
  title: string;
  subtitle?: string;
  descriptionHtml: string;
  seoKeywords: string[];
  designDoc: { blocks: DesignBlock[] };
  renderedHtml: string;
  assets: { kind: "hero" | "detail" | "thumb"; url: string; source: "ai" | "edited" | "template" }[];
  aiModel: string;
  generationJobId?: string;
  status: "draft" | "review" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
};

export type MarginPolicy = { type: "rate" | "fixed"; value: number; minMarginUsd: number };

export type Listing = {
  id: number;
  draftId: number;
  productSlug: string;
  marginPolicy: MarginPolicy;
  supplierCostUsd: number;
  sellPriceUsd: number;
  status: "ready" | "published" | "paused" | "retired";
  createdAt: string;
};

export type Channel = {
  id: number;
  code: string;
  kind: "own" | "cafe24" | "coupang" | "shopee" | "lazada" | "qoo10" | "amazon" | "tiktok" | "marketplace";
  name: string;
  config: {
    tradeModel?: "reverse-dropship" | "purchase-agency";
    firstLineSupport?: boolean;
    currency?: string;
    feeRate?: number; // 채널 수수료율
    headerMap?: Record<string, string>;
  };
};

export type ChannelListing = {
  id: number;
  listingId: number;
  channelId: number;
  externalRef?: string;
  publishState: "queued" | "pushed" | "live" | "failed" | "delisted";
  lastPushedAt?: string;
  lastError?: string;
  retryCount: number;
};

export type ImportBatch = {
  id: number;
  channelId: number;
  filename: string;
  rowCount: number;
  okCount: number;
  errorRows: { line: number; error: string }[];
  importedBy?: string;
  importedAt: string;
};

export type PurchaseRequest = {
  id: number;
  channelId: number;
  importBatchId?: number;
  externalOrderRef: string;
  channelListingId?: number;
  rawRow?: Record<string, string>;
  buyerName?: string;
  buyerCountry?: string;
  shippingAddress?: Record<string, string>;
  qty: number;
  channelPaidAmount: number;
  channelCurrency: string;
  status:
    | "received" | "matched" | "vetted" | "sourcing"
    | "fulfilled" | "closed" | "rejected" | "refund_delegated";
  vettedBy?: string;
  vettedAt?: string;
  rejectReason?: string;
  createdAt: string;
};

export type SourcingOrder = {
  id: number;
  purchaseRequestId: number;
  supplierId: number;
  supplierProductId: number;
  orderPayload?: Record<string, unknown>;
  supplierOrderRef?: string;
  trackingNo?: string;
  carrier?: string;
  costUsd: number;
  shippingUsd: number;
  status:
    | "requested" | "confirmed" | "shipped" | "delivered"
    | "settled" | "failed" | "cancelled" | "as_delegated";
  asTicketRef?: string;
  createdAt: string;
};

export type Settlement = {
  id: number;
  sourcingOrderId: number;
  revenueUsd: number;
  costUsd: number;
  shippingUsd: number;
  channelFeeUsd: number;
  pgFeeUsd: number;
  marginUsd: number;
  fxRate: number;
  settledAt?: string;
  status: "pending" | "confirmed";
  createdAt: string;
};

export type AuditEntry = {
  id: number;
  entity: string;
  entityId: string;
  fromState?: string;
  toState: string;
  actor: string;
  meta?: Record<string, unknown>;
  createdAt: string;
};

/** USD 기준 환율 (usdPerUnit: 해당 통화 1단위 = X USD) */
export const DEFAULT_FX: Record<string, number> = {
  USD: 1,
  CNY: 0.14,
  KRW: 0.00072,
  JPY: 0.0066,
  SGD: 0.75,
};

export function toUsd(amount: number, currency: string, fx: Record<string, number> = DEFAULT_FX) {
  const rate = fx[currency?.toUpperCase()] ?? 1;
  return +(amount * rate).toFixed(2);
}

/** 판매가 산출: (원가+배송버퍼)*(1+마진율) → .9 단위 올림, fixed는 원가+고정액 */
export function computeSellPrice(costUsd: number, policy: MarginPolicy, shipBufferUsd = 3) {
  const base =
    policy.type === "rate"
      ? (costUsd + shipBufferUsd) * (1 + policy.value)
      : costUsd + shipBufferUsd + policy.value;
  const priced = Math.max(base, costUsd + shipBufferUsd + policy.minMarginUsd);
  return +(Math.ceil(priced) - 0.1).toFixed(2); // x.9 프라이싱
}
