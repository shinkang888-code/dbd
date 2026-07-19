/**
 * HQ M7 — 관계형 테이블 hydrate / persist.
 * getState: 관계형 우선 → hq_state 스냅샷 → seed.
 * Cafe24 상품 상세 HTML 갱신은 Studio publish 경로만 사용 (원장 이중화 방지).
 */
import { neon } from "@neondatabase/serverless";
import { hasDb } from "@/db";
import type {
  Channel,
  Collection,
  Listing,
  ListingDraft,
  Supplier,
  SupplierProduct,
} from "./types";

export type RelationalCore = {
  seq: number;
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
  collections: Collection[];
  drafts: ListingDraft[];
  listings: Listing[];
  channels: Channel[];
};

export async function loadRelationalCore(): Promise<RelationalCore | null> {
  if (!hasDb()) return null;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [supplierRows, productRows, collectionRows, draftRows, listingRows, channelRows] =
      await Promise.all([
        sql`SELECT id, code, name, homepage, connector_kind, currency, lead_time_days,
                   as_center_url, as_policy, legal_note, status, created_at
            FROM suppliers WHERE deleted_at IS NULL ORDER BY id`,
        sql`SELECT id, supplier_id, external_id, url, raw_title, raw_description_html,
                   raw_category_path, price_original, currency, stock, seller_name,
                   seller_info, images, option_schema, content_hash, fetched_at, sync_status
            FROM supplier_products WHERE deleted_at IS NULL ORDER BY id`,
        sql`SELECT id, slug, name, note, created_at FROM collections WHERE deleted_at IS NULL ORDER BY id`,
        sql`SELECT id, supplier_product_id, collection_id, version, title, subtitle,
                   description_html, seo_keywords, design_doc, rendered_html, assets,
                   ai_model, generation_job_id, status, reviewed_by, reviewed_at, created_at
            FROM listing_drafts WHERE deleted_at IS NULL ORDER BY id`,
        sql`SELECT id, draft_id, product_slug, margin_policy, supplier_cost_usd,
                   sell_price_usd, status, created_at
            FROM listings WHERE deleted_at IS NULL ORDER BY id`,
        sql`SELECT id, code, kind, name, config FROM channels WHERE deleted_at IS NULL ORDER BY id`,
      ]);

    if (!supplierRows.length && !channelRows.length) return null;

    const suppliers: Supplier[] = supplierRows.map((r) => ({
      id: Number(r.id),
      code: String(r.code),
      name: String(r.name),
      homepage: r.homepage ? String(r.homepage) : undefined,
      connectorKind: r.connector_kind as Supplier["connectorKind"],
      currency: String(r.currency),
      leadTimeDays: Number(r.lead_time_days ?? 7),
      asCenterUrl: r.as_center_url ? String(r.as_center_url) : undefined,
      asPolicy: r.as_policy ? String(r.as_policy) : undefined,
      legalNote: r.legal_note ? String(r.legal_note) : undefined,
      status: (r.status === "paused" ? "paused" : "active") as Supplier["status"],
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));

    const supplierProducts: SupplierProduct[] = productRows.map((r) => ({
      id: Number(r.id),
      supplierId: Number(r.supplier_id),
      externalId: String(r.external_id),
      url: r.url ? String(r.url) : undefined,
      rawTitle: String(r.raw_title),
      rawDescriptionHtml: r.raw_description_html ? String(r.raw_description_html) : undefined,
      rawCategoryPath: (r.raw_category_path as string[]) ?? [],
      priceOriginal: Number(r.price_original),
      currency: String(r.currency),
      stock: Number(r.stock ?? 0),
      sellerName: r.seller_name ? String(r.seller_name) : undefined,
      sellerInfo: (r.seller_info as Record<string, unknown>) ?? undefined,
      images: (r.images as { url: string }[]) ?? [],
      optionSchema: (r.option_schema as Record<string, unknown>) ?? undefined,
      contentHash: String(r.content_hash ?? ""),
      fetchedAt: r.fetched_at ? new Date(String(r.fetched_at)).toISOString() : new Date().toISOString(),
      syncStatus: (r.sync_status as SupplierProduct["syncStatus"]) ?? "ok",
    }));

    const collections: Collection[] = collectionRows.map((r) => ({
      id: Number(r.id),
      slug: String(r.slug),
      name: String(r.name),
      note: r.note ? String(r.note) : undefined,
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));

    const drafts: ListingDraft[] = draftRows.map((r) => ({
      id: Number(r.id),
      supplierProductId: Number(r.supplier_product_id),
      collectionId: r.collection_id ? Number(r.collection_id) : undefined,
      version: Number(r.version ?? 1),
      title: String(r.title),
      subtitle: r.subtitle ? String(r.subtitle) : undefined,
      descriptionHtml: String(r.description_html ?? ""),
      seoKeywords: (r.seo_keywords as string[]) ?? [],
      designDoc: (r.design_doc as ListingDraft["designDoc"]) ?? { blocks: [] },
      renderedHtml: String(r.rendered_html ?? ""),
      assets: (r.assets as ListingDraft["assets"]) ?? [],
      aiModel: String(r.ai_model ?? "unknown"),
      generationJobId: r.generation_job_id ? String(r.generation_job_id) : undefined,
      status: r.status as ListingDraft["status"],
      reviewedBy: r.reviewed_by ? String(r.reviewed_by) : undefined,
      reviewedAt: r.reviewed_at ? new Date(String(r.reviewed_at)).toISOString() : undefined,
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));

    const listings: Listing[] = listingRows.map((r) => ({
      id: Number(r.id),
      draftId: Number(r.draft_id),
      productSlug: String(r.product_slug ?? ""),
      marginPolicy: (r.margin_policy as Listing["marginPolicy"]) ?? {
        type: "rate",
        value: 0.3,
        minMarginUsd: 5,
      },
      supplierCostUsd: Number(r.supplier_cost_usd ?? 0),
      sellPriceUsd: Number(r.sell_price_usd ?? 0),
      status: r.status as Listing["status"],
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));

    const channels: Channel[] = channelRows.map((r) => ({
      id: Number(r.id),
      code: String(r.code),
      kind: r.kind as Channel["kind"],
      name: String(r.name),
      config: (r.config as Channel["config"]) ?? {},
    }));

    const maxId = Math.max(
      100,
      ...suppliers.map((x) => x.id),
      ...supplierProducts.map((x) => x.id),
      ...collections.map((x) => x.id),
      ...drafts.map((x) => x.id),
      ...listings.map((x) => x.id),
      ...channels.map((x) => x.id),
    );

    return {
      seq: maxId + 1,
      suppliers,
      supplierProducts,
      collections,
      drafts,
      listings,
      channels,
    };
  } catch (e) {
    console.error("[hq.m7] relational load failed", e);
    return null;
  }
}

type Persistable = {
  suppliers: Supplier[];
  channels: Channel[];
  collections: Collection[];
  supplierProducts: SupplierProduct[];
};

/** 핵심 마스터를 code/slug 기준 upsert (identity id는 DB 생성) */
export async function persistRelationalCore(state: Persistable): Promise<void> {
  if (!hasDb()) return;
  try {
    const sql = neon(process.env.DATABASE_URL!);

    for (const s of state.suppliers) {
      await sql`
        INSERT INTO suppliers (
          code, name, homepage, connector_kind, currency, lead_time_days,
          as_center_url, as_policy, legal_note, status
        ) VALUES (
          ${s.code}, ${s.name}, ${s.homepage ?? null}, ${s.connectorKind},
          ${s.currency}, ${s.leadTimeDays}, ${s.asCenterUrl ?? null}, ${s.asPolicy ?? null},
          ${s.legalNote ?? null}, ${s.status}
        )
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          homepage = EXCLUDED.homepage,
          connector_kind = EXCLUDED.connector_kind,
          currency = EXCLUDED.currency,
          lead_time_days = EXCLUDED.lead_time_days,
          as_center_url = EXCLUDED.as_center_url,
          as_policy = EXCLUDED.as_policy,
          legal_note = EXCLUDED.legal_note,
          status = EXCLUDED.status`;
    }

    for (const c of state.channels) {
      await sql`
        INSERT INTO channels (code, kind, name, config)
        VALUES (
          ${c.code}, ${c.kind}, ${c.name},
          ${JSON.stringify(c.config)}::jsonb
        )
        ON CONFLICT (code) DO UPDATE SET
          kind = EXCLUDED.kind,
          name = EXCLUDED.name,
          config = EXCLUDED.config`;
    }

    for (const col of state.collections) {
      await sql`
        INSERT INTO collections (slug, name, note)
        VALUES (${col.slug}, ${col.name}, ${col.note ?? null})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          note = EXCLUDED.note`;
    }

    await sql`
      INSERT INTO hq_state (key, value, updated_at)
      VALUES (
        'm7_relational',
        ${JSON.stringify({
          syncedAt: new Date().toISOString(),
          suppliers: state.suppliers.length,
          products: state.supplierProducts.length,
          channels: state.channels.length,
          note: "Cafe24 PDP HTML updates use Studio publish only; HQ cafe24 adapter creates product shells",
        })}::jsonb,
        now()
      )
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  } catch (e) {
    console.error("[hq.m7] relational persist failed", e);
  }
}
