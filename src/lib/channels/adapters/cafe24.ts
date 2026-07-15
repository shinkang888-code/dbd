/** Cafe24 어댑터 — 기존 lexistyle cafe24 모듈 재사용. 스펙 §4 */
import type { ChannelAdapter, PublishInput } from "../types";

let mockSeq = 70000;

export const cafe24Adapter: ChannelAdapter = {
  code: "cafe24",

  async publish({ listing, draft }: PublishInput) {
    const hasToken = Boolean(process.env.CAFE24_ACCESS_TOKEN && process.env.CAFE24_MALL_ID);
    if (!hasToken) {
      return { externalRef: `C24-MOCK-${listing.id}-${++mockSeq}` };
    }
    const { cafe24AdminCreateProduct } = await import("@/lib/cafe24/admin-products");
    const priceKrw = Math.round(listing.sellPriceUsd / 0.00072 / 10) * 10;
    const created = (await cafe24AdminCreateProduct({
      name: draft.title,
      priceKrw,
      description: draft.renderedHtml,
    })) as { product?: { product_no?: number } };
    return { externalRef: String(created?.product?.product_no ?? `C24-${listing.id}`) };
  },
};
