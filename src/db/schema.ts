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
