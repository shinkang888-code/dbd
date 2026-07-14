/**
 * LEXI Neon DB 스키마 — docs/lexi-master-spec.md §4.2
 * 모든 콘텐츠 테이블은 is_dummy + deleted_at(soft delete) 공통 컬럼을 가진다.
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
  country: char("country", { length: 2 }),
  tier: text("tier").notNull().default("bronze"),
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
  userId: bigint("user_id", { mode: "number" }).notNull(),
  status: text("status").notNull().default("paid"), // paid→preparing→shipped→customs→delivered / cancelled
  totalUsd: numeric("total_usd", { precision: 10, scale: 2 }).notNull(),
  dutyUsd: numeric("duty_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  shippingUsd: numeric("shipping_usd", { precision: 10, scale: 2 }).notNull().default("0"),
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
  slot: text("slot").notNull(), // hero | timedeal | look
  imageUrl: text("image_url").notNull(),
  headline: text("headline"),
  href: text("href"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  ...dummyCols,
});

/** Dummy/Real 모드의 단일 진실 원천 */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

/** 전환 이력 감사 로그 */
export const dataModeAudit = pgTable("data_mode_audit", {
  id: id(),
  fromMode: text("from_mode"),
  toMode: text("to_mode"),
  strategy: text("strategy"), // 'soft' | 'hard'
  affected: jsonb("affected"),
  actor: text("actor"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
