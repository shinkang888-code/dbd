/** 자사몰(LEXI) 어댑터 — 게시 = 내부 카탈로그 upsert. 스펙 §2 P4 */
import { neon } from "@neondatabase/serverless";
import { hasDb } from "@/db";
import type { ChannelAdapter, PublishInput } from "../types";

function slugify(title: string, id: number) {
  return (
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) + `-hq${id}`
  );
}

export const lexiAdapter: ChannelAdapter = {
  code: "lexi",

  async publish({ listing, draft }: PublishInput) {
    const slug = listing.productSlug || slugify(draft.title, listing.id);
    if (hasDb()) {
      // DB 모드: products 테이블에 실제 upsert → 스토어프론트 카탈로그에 즉시 노출
      const sql = neon(process.env.DATABASE_URL!);
      await sql`
        INSERT INTO brands (slug, name, is_dummy) VALUES ('lexi-sourcing', 'LEXI Sourcing', false)
        ON CONFLICT (slug) DO NOTHING`;
      await sql`
        INSERT INTO categories (slug, name) VALUES ('sourced', 'Sourced')
        ON CONFLICT (slug) DO NOTHING`;
      await sql`
        INSERT INTO products (slug, brand_id, category_id, name, description, price_usd, stock, is_dummy)
        SELECT ${slug}, b.id, c.id, ${draft.title}, ${draft.descriptionHtml}, ${listing.sellPriceUsd}, 100, false
        FROM brands b, categories c WHERE b.slug='lexi-sourcing' AND c.slug='sourced'
        ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, price_usd=EXCLUDED.price_usd, deleted_at=NULL`;
      if (draft.assets[0]) {
        await sql`
          INSERT INTO product_images (product_id, url, sort)
          SELECT id, ${draft.assets[0].url}, 0 FROM products WHERE slug=${slug}
          ON CONFLICT DO NOTHING`;
      }
    }
    // 메모리 모드: externalRef만 발급(스토어프론트 노출은 DB 연결 후) — 스펙 §4 한계 명시
    return { externalRef: `lexi:${slug}` };
  },
};
