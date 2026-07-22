/**
 * Cafe24 어댑터 — HQ 리스팅 → Cafe24 상품 셸 생성.
 * 이후 PDP HTML/SEO 갱신은 Studio `publishDocumentToCafe24` 전용 (원장·콘텐츠 이중화 방지).
 */
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
    // 초기 description만 심고, 승인된 콘텐츠 재게시는 Studio 경로를 사용한다.
    const created = (await cafe24AdminCreateProduct({
      name: draft.title,
      priceKrw,
      description:
        draft.renderedHtml ||
        `<p>LEXI HQ listing #${listing.id}. PDP 콘텐츠는 Studio에서 승인 후 게시합니다.</p>`,
    })) as { product?: { product_no?: number } };
    return { externalRef: String(created?.product?.product_no ?? `C24-${listing.id}`) };
  },
};
