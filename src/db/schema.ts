/**
 * LEXI Neon DB 스키마 — docs/lexi-master-spec.md §4.2
 * + 쇼핑몰 백엔드 이식: cart / wishlist / auth_user_id / guest order
 */
import {
  bigint,
  boolean,
  char,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();
const dummyCols = {
  isDummy: boolean("is_dummy").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
};

export const brands = pgTable("brands", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  story: text("story"),
  logoUrl: text("logo_url"),
  ...dummyCols,
});

export const categories = pgTable("categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: bigint("parent_id", { mode: "number" }),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable("products", {
  id: id(),
  slug: text("slug").notNull().unique(),
  brandId: bigint("brand_id", { mode: "number" }).notNull(),
  categoryId: bigint("category_id", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  discountRate: smallint("discount_rate").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  ratingAvg: numeric("rating_avg", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count").notNull().default(0),
  /** Cafe24 product_no (헤드리스 동기화/매핑용) */
  cafe24ProductNo: integer("cafe24_product_no"),
  ...dummyCols,
});

export const productImages = pgTable("product_images", {
  id: id(),
  productId: bigint("product_id", { mode: "number" }).notNull(),
  url: text("url").notNull(),
  sort: integer("sort").notNull().default(0),
  ...dummyCols,
});

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  /** Neon Auth `neon_auth.user.id` (UUID) */
  authUserId: uuid("auth_user_id"),
  name: text("name"),
  image: text("image"),
  country: char("country", { length: 2 }),
  tier: text("tier").notNull().default("bronze"),
  points: integer("points").notNull().default(0),
  ...dummyCols,
});

export const reviews = pgTable("reviews", {
  id: id(),
  productId: bigint("product_id", { mode: "number" }).notNull(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  rating: smallint("rating").notNull(),
  body: text("body"),
  photoUrls: text("photo_urls").array(),
  ...dummyCols,
});

export const orders = pgTable("orders", {
  id: id(),
  userId: bigint("user_id", { mode: "number" }),
  guestEmail: text("guest_email"),
  country: char("country", { length: 2 }).default("US"),
  /** pending_payment → paid → preparing → … / cancelled / payment_failed */
  status: text("status").notNull().default("pending_payment"),
  totalUsd: numeric("total_usd", { precision: 10, scale: 2 }).notNull(),
  /** 국내 PG(토스·다날)용 KRW 청구액 */
  amountKrw: integer("amount_krw"),
  dutyUsd: numeric("duty_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  shippingUsd: numeric("shipping_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  shippingAddress: jsonb("shipping_address"),
  /** mock | stripe | toss | danal */
  paymentProvider: text("payment_provider"),
  /** 외부 주문키 (토스/다날 orderId, Stripe session id 등) */
  paymentOrderId: text("payment_order_id"),
  paymentRef: text("payment_ref"),
  ...dummyCols,
});

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: bigint("order_id", { mode: "number" }).notNull(),
  productId: bigint("product_id", { mode: "number" }).notNull(),
  qty: integer("qty").notNull().default(1),
  unitPriceUsd: numeric("unit_price_usd", { precision: 10, scale: 2 }).notNull(),
  ...dummyCols,
});

/** 게스트/로그인 공통 장바구니 (세션 쿠키 cart_token 과 매칭) */
export const cartItems = pgTable("cart_items", {
  id: id(),
  cartToken: text("cart_token").notNull(),
  userId: bigint("user_id", { mode: "number" }),
  productId: bigint("product_id", { mode: "number" }).notNull(),
  qty: integer("qty").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: id(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  productId: bigint("product_id", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ugcPosts = pgTable("ugc_posts", {
  id: id(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  productIds: bigint("product_ids", { mode: "number" }).array(),
  ...dummyCols,
});

export const banners = pgTable("banners", {
  id: id(),
  slot: text("slot").notNull(),
  imageUrl: text("image_url").notNull(),
  headline: text("headline"),
  href: text("href"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  ...dummyCols,
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export const dataModeAudit = pgTable("data_mode_audit", {
  id: id(),
  fromMode: text("from_mode"),
  toMode: text("to_mode"),
  strategy: text("strategy"),
  affected: jsonb("affected"),
  actor: text("actor"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============================================================
 * 역직구 대리점 도메인 — docs/lexi-dropship-integration-spec.md §1
 * ============================================================ */

/** 공급처 마스터 */
export const suppliers = pgTable("suppliers", {
  id: id(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  homepage: text("homepage"),
  connectorKind: text("connector_kind").notNull().default("mock"), // api|agent|scrape|mock
  connectorConfig: jsonb("connector_config"),
  currency: char("currency", { length: 3 }).notNull().default("USD"),
  leadTimeDays: integer("lead_time_days").notNull().default(7),
  asCenterUrl: text("as_center_url"),
  asPolicy: text("as_policy"),
  legalNote: text("legal_note"),
  status: text("status").notNull().default("active"),
  ...dummyCols,
});

/** 원본 상품 스냅샷 */
export const supplierProducts = pgTable("supplier_products", {
  id: id(),
  supplierId: bigint("supplier_id", { mode: "number" }).notNull(),
  externalId: text("external_id").notNull(),
  url: text("url"),
  rawTitle: text("raw_title").notNull(),
  rawDescriptionHtml: text("raw_description_html"),
  rawCategoryPath: text("raw_category_path").array(),
  priceOriginal: numeric("price_original", { precision: 12, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 }).notNull().default("USD"),
  stock: integer("stock").notNull().default(0),
  sellerName: text("seller_name"),
  sellerInfo: jsonb("seller_info"),
  images: jsonb("images"),
  optionSchema: jsonb("option_schema"),
  contentHash: text("content_hash"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }),
  syncStatus: text("sync_status").notNull().default("ok"), // ok|stale|gone
  ...dummyCols,
});

/** 즐겨찾기(소싱 컬렉션) */
export const collections = pgTable("collections", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  note: text("note"),
  sort: integer("sort").notNull().default(0),
  ownerEmail: text("owner_email"),
  ...dummyCols,
});

export const collectionItems = pgTable("collection_items", {
  id: id(),
  collectionId: bigint("collection_id", { mode: "number" }).notNull(),
  supplierProductId: bigint("supplier_product_id", { mode: "number" }).notNull(),
  decision: text("decision").notNull().default("candidate"), // candidate|approved|rejected
  pinnedAt: timestamp("pinned_at", { withTimezone: true }).notNull().defaultNow(),
});

/** AI 리뉴얼 산출물(리스팅 초안) */
export const listingDrafts = pgTable("listing_drafts", {
  id: id(),
  supplierProductId: bigint("supplier_product_id", { mode: "number" }).notNull(),
  collectionId: bigint("collection_id", { mode: "number" }),
  version: integer("version").notNull().default(1),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  descriptionHtml: text("description_html"),
  seoKeywords: text("seo_keywords").array(),
  designDoc: jsonb("design_doc"),
  renderedHtml: text("rendered_html"),
  assets: jsonb("assets"),
  aiModel: text("ai_model"),
  promptRef: text("prompt_ref"),
  generationJobId: text("generation_job_id"),
  costUsd: numeric("cost_usd", { precision: 10, scale: 4 }),
  status: text("status").notNull().default("draft"), // draft|review|approved|rejected
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...dummyCols,
});

/** 게시 확정본 */
export const listings = pgTable("listings", {
  id: id(),
  draftId: bigint("draft_id", { mode: "number" }).notNull().unique(),
  productId: bigint("product_id", { mode: "number" }),
  productSlug: text("product_slug"),
  marginPolicy: jsonb("margin_policy"), // {type:'rate'|'fixed', value, minMarginUsd}
  supplierCostUsd: numeric("supplier_cost_usd", { precision: 12, scale: 2 }),
  sellPriceUsd: numeric("sell_price_usd", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("ready"), // ready|published|paused|retired
  ...dummyCols,
});

/** 판매채널 */
export const channels = pgTable("channels", {
  id: id(),
  code: text("code").notNull().unique(),
  kind: text("kind").notNull(), // own|cafe24|coupang|shopee|lazada|qoo10|amazon|tiktok|marketplace
  name: text("name").notNull(),
  config: jsonb("config"), // {tradeModel, firstLineSupport, headerMap, ...}
  ...dummyCols,
});

export const channelListings = pgTable("channel_listings", {
  id: id(),
  listingId: bigint("listing_id", { mode: "number" }).notNull(),
  channelId: bigint("channel_id", { mode: "number" }).notNull(),
  externalRef: text("external_ref"),
  categoryOverride: jsonb("category_override"),
  publishState: text("publish_state").notNull().default("queued"), // queued|pushed|live|failed|delisted
  lastPushedAt: timestamp("last_pushed_at", { withTimezone: true }),
  lastError: text("last_error"),
  retryCount: integer("retry_count").notNull().default(0),
  ...dummyCols,
});

/** 구매요청 인입 배치(엑셀/CSV) */
export const importBatches = pgTable("import_batches", {
  id: id(),
  channelId: bigint("channel_id", { mode: "number" }).notNull(),
  filename: text("filename"),
  rowCount: integer("row_count").notNull().default(0),
  okCount: integer("ok_count").notNull().default(0),
  errorRows: jsonb("error_rows"),
  importedBy: text("imported_by"),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 판매채널 구매요청 */
export const purchaseRequests = pgTable("purchase_requests", {
  id: id(),
  channelId: bigint("channel_id", { mode: "number" }).notNull(),
  importBatchId: bigint("import_batch_id", { mode: "number" }),
  externalOrderRef: text("external_order_ref").notNull(),
  channelListingId: bigint("channel_listing_id", { mode: "number" }),
  rawRow: jsonb("raw_row"),
  buyerName: text("buyer_name"),
  buyerCountry: char("buyer_country", { length: 2 }),
  shippingAddress: jsonb("shipping_address"),
  qty: integer("qty").notNull().default(1),
  channelPaidAmount: numeric("channel_paid_amount", { precision: 12, scale: 2 }),
  channelCurrency: char("channel_currency", { length: 3 }),
  status: text("status").notNull().default("received"),
  // received|matched|vetted|sourcing|fulfilled|closed|rejected|refund_delegated
  vettedBy: text("vetted_by"),
  vettedAt: timestamp("vetted_at", { withTimezone: true }),
  rejectReason: text("reject_reason"),
  ...dummyCols,
});

/** 공급처 발주 */
export const sourcingOrders = pgTable("sourcing_orders", {
  id: id(),
  purchaseRequestId: bigint("purchase_request_id", { mode: "number" }).notNull().unique(),
  supplierId: bigint("supplier_id", { mode: "number" }).notNull(),
  supplierProductId: bigint("supplier_product_id", { mode: "number" }).notNull(),
  orderPayload: jsonb("order_payload"),
  supplierOrderRef: text("supplier_order_ref"),
  trackingNo: text("tracking_no"),
  carrier: text("carrier"),
  costUsd: numeric("cost_usd", { precision: 12, scale: 2 }),
  shippingUsd: numeric("shipping_usd", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("requested"),
  // requested|confirmed|shipped|delivered|settled|failed|cancelled|as_delegated
  asTicketRef: text("as_ticket_ref"),
  ...dummyCols,
});

/** 정산(마진 원장) */
export const settlements = pgTable("settlements", {
  id: id(),
  sourcingOrderId: bigint("sourcing_order_id", { mode: "number" }).notNull().unique(),
  revenueUsd: numeric("revenue_usd", { precision: 12, scale: 2 }),
  costUsd: numeric("cost_usd", { precision: 12, scale: 2 }),
  shippingUsd: numeric("shipping_usd", { precision: 12, scale: 2 }),
  channelFeeUsd: numeric("channel_fee_usd", { precision: 12, scale: 2 }),
  pgFeeUsd: numeric("pg_fee_usd", { precision: 12, scale: 2 }),
  marginUsd: numeric("margin_usd", { precision: 12, scale: 2 }),
  fxRate: numeric("fx_rate", { precision: 12, scale: 6 }),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  status: text("status").notNull().default("pending"), // pending|confirmed
  ...dummyCols,
});

/** 환율 (기준통화 USD) */
export const fxRates = pgTable("fx_rates", {
  currency: char("currency", { length: 3 }).primaryKey(),
  usdPerUnit: numeric("usd_per_unit", { precision: 14, scale: 8 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 커머스 상태 전이 감사 로그 */
export const commerceAudit = pgTable("commerce_audit", {
  id: id(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull(),
  fromState: text("from_state"),
  toState: text("to_state"),
  actor: text("actor"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * HQ 런타임 스냅샷 (v1 내구화 계층)
 * v1은 메모리 스토어 상태를 JSON 스냅샷으로 저장/복원한다.
 * 관계형 테이블로의 완전 이관은 M7(스펙 §7 이후 단계).
 */
export const hqState = pgTable("hq_state", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============================================================
 * LEXI Studio — Cafe24 Design CMS + Creator
 * ============================================================ */

export const designThemes = pgTable("design_themes", {
  id: id(),
  name: text("name").notNull(),
  tokens: jsonb("tokens").notNull(),
  status: text("status").notNull().default("draft"), // draft|published|archived
  version: integer("version").notNull().default(1),
  createdBy: text("created_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const designSections = pgTable("design_sections", {
  id: id(),
  slot: text("slot").notNull(), // hero|categories|ranking|timedeal|look|brand|ugc
  title: text("title").notNull(),
  payload: jsonb("payload").notNull(),
  sort: integer("sort").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft|published|archived
  version: integer("version").notNull().default(1),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: text("created_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentDocuments = pgTable("content_documents", {
  id: id(),
  kind: text("kind").notNull(), // pdp|editorial|campaign|home_section
  title: text("title").notNull(),
  locale: text("locale").notNull().default("ko"),
  cafe24MallId: text("cafe24_mall_id"),
  cafe24ShopNo: integer("cafe24_shop_no"),
  cafe24ProductNo: integer("cafe24_product_no"),
  currentVersion: integer("current_version").notNull().default(1),
  status: text("status").notNull().default("draft"),
  body: jsonb("body").notNull(),
  renderedHtml: text("rendered_html"),
  createdBy: text("created_by"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentVersions = pgTable("content_versions", {
  id: id(),
  documentId: bigint("document_id", { mode: "number" }).notNull(),
  version: integer("version").notNull(),
  body: jsonb("body").notNull(),
  renderedHtml: text("rendered_html"),
  status: text("status").notNull(),
  note: text("note"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: id(),
  kind: text("kind").notNull(), // image|video|html|document
  name: text("name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type"),
  bytes: bigint("bytes", { mode: "number" }),
  width: integer("width"),
  height: integer("height"),
  durationMs: integer("duration_ms"),
  alt: text("alt"),
  tags: text("tags").array(),
  source: text("source").notNull().default("manual"),
  metadata: jsonb("metadata"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const generationJobs = pgTable("generation_jobs", {
  id: id(),
  kind: text("kind").notNull(), // pdp|image|cardnews|storyboard|video|copy
  status: text("status").notNull().default("queued"),
  documentId: bigint("document_id", { mode: "number" }),
  cafe24ProductNo: integer("cafe24_product_no"),
  input: jsonb("input").notNull(),
  output: jsonb("output"),
  provider: text("provider").notNull().default("deterministic"),
  model: text("model"),
  costUsd: numeric("cost_usd", { precision: 10, scale: 4 }),
  error: text("error"),
  requestedBy: text("requested_by"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const publishEvents = pgTable("publish_events", {
  id: id(),
  documentId: bigint("document_id", { mode: "number" }).notNull(),
  version: integer("version").notNull(),
  target: text("target").notNull(), // cafe24_product_description|cafe24_skin|...
  status: text("status").notNull().default("queued"),
  remoteRef: text("remote_ref"),
  requestPayload: jsonb("request_payload"),
  responsePayload: jsonb("response_payload"),
  previousSnapshot: jsonb("previous_snapshot"),
  metrics: jsonb("metrics"),
  error: text("error"),
  publishedBy: text("published_by"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const decisionQueue = pgTable("decision_queue", {
  id: id(),
  code: text("code").notNull().unique(),
  priority: text("priority").notNull().default("medium"),
  question: text("question").notNull(),
  defaultDecision: text("default_decision").notNull(),
  finalDecision: text("final_decision"),
  impact: text("impact"),
  status: text("status").notNull().default("open"),
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
