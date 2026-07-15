/**
 * Coupang Wing Open API 어댑터 (P0 1호 채널) — 스펙 §9.2/§9.3
 * 인증: CEA HMAC-SHA256 — message = signedDate + method + path + query
 * env(COUPANG_VENDOR_ID/ACCESS_KEY/SECRET_KEY) 미설정 시 목업 모드.
 */
import { createHmac } from "crypto";
import type { ChannelAdapter, PublishInput, PulledOrder } from "../types";
import type { Channel, ChannelListing } from "@/lib/hq/types";

const HOST = "https://api-gateway.coupang.com";

const configured = () =>
  Boolean(process.env.COUPANG_VENDOR_ID && process.env.COUPANG_ACCESS_KEY && process.env.COUPANG_SECRET_KEY);

function signedHeaders(method: string, path: string, query = "") {
  const signedDate = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "").replace(/^\d{2}/, ""); // yyMMdd'T'HHmmss'Z'
  const message = signedDate + method + path + query;
  const signature = createHmac("sha256", process.env.COUPANG_SECRET_KEY!).update(message).digest("hex");
  return {
    Authorization: `CEA algorithm=HmacSHA256, access-key=${process.env.COUPANG_ACCESS_KEY}, signed-date=${signedDate}, signature=${signature}`,
    "Content-Type": "application/json;charset=UTF-8",
    "X-EXTENDED-TIMEOUT": "90000",
  };
}

async function coupang(method: "GET" | "POST" | "PUT", path: string, query = "", body?: unknown) {
  const res = await fetch(`${HOST}${path}${query ? `?${query}` : ""}`, {
    method,
    headers: signedHeaders(method, path, query),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json.code && json.code !== "SUCCESS" && json.code !== 200)) {
    throw new Error(`coupang ${path}: ${json.message ?? res.status}`);
  }
  return json.data ?? json;
}

const usdToKrw = (usd: number) => Math.round((usd / 0.00072) / 10) * 10;

let mockSeq = 90000;

export const coupangAdapter: ChannelAdapter = {
  code: "coupang",

  async publish({ listing, draft }: PublishInput) {
    if (!configured()) {
      return { externalRef: `CP-MOCK-${listing.id}-${++mockSeq}` };
    }
    const vendorId = process.env.COUPANG_VENDOR_ID!;
    const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products`;
    const data = await coupang("POST", path, "", {
      displayCategoryCode: 0, // categoryOverride로 대체 — 카테고리 추천 API 연동 지점
      sellerProductName: draft.title,
      vendorId,
      saleStartedAt: new Date().toISOString().slice(0, 19),
      saleEndedAt: "2099-12-31T23:59:59",
      brand: "LEXI",
      deliveryMethod: "AGENT_BUY", // 구매대행
      deliveryChargeType: "FREE",
      items: [
        {
          itemName: draft.title,
          originalPrice: usdToKrw(listing.sellPriceUsd * 1.15),
          salePrice: usdToKrw(listing.sellPriceUsd),
          maximumBuyCount: 5,
          outboundShippingTimeDay: 7,
          images: draft.assets.map((a, i) => ({
            imageOrder: i,
            imageType: i === 0 ? "REPRESENTATION" : "DETAIL",
            vendorPath: a.url,
          })),
          contents: [{ contentsType: "HTML", contentDetails: [{ content: draft.renderedHtml, detailType: "TEXT" }] }],
        },
      ],
    });
    return { externalRef: String(data?.sellerProductId ?? data) };
  },

  async pullOrders(channel: Channel, { liveListings }: { liveListings: ChannelListing[] }): Promise<PulledOrder[]> {
    if (!configured()) {
      // 목업: live 리스팅 중 첫 건에 대해 데모 주문 1건 생성
      const target = liveListings[0];
      if (!target) return [];
      return [
        {
          externalOrderRef: `CPORD-${Date.now().toString().slice(-8)}`,
          externalListingRef: target.externalRef,
          buyerName: "김구매",
          buyerCountry: "KR",
          shippingAddress: { name: "김구매", country: "KR", city: "서울", addr1: "강남구 테헤란로 1", zip: "06000", phone: "010-0000-0000" },
          qty: 1,
          paidAmount: 25900,
          currency: "KRW",
          raw: { mock: true, channel: channel.code },
        },
      ];
    }
    const vendorId = process.env.COUPANG_VENDOR_ID!;
    const path = `/v2/providers/openapi/apis/api/v4/vendors/${vendorId}/ordersheets`;
    const today = new Date().toISOString().slice(0, 10);
    const query = `createdAtFrom=${today}&createdAtTo=${today}&status=ACCEPT`;
    const data = await coupang("GET", path, query);
    return ((data ?? []) as Record<string, any>[]).map((o) => ({
      externalOrderRef: String(o.orderId),
      externalListingRef: String(o.orderItems?.[0]?.sellerProductId ?? ""),
      buyerName: o.receiver?.name ?? "",
      buyerCountry: "KR",
      shippingAddress: {
        name: o.receiver?.name ?? "", country: "KR",
        addr1: o.receiver?.addr1 ?? "", addr2: o.receiver?.addr2 ?? "",
        zip: o.receiver?.postCode ?? "", phone: o.receiver?.safeNumber ?? "",
      },
      qty: Number(o.orderItems?.[0]?.shippingCount ?? 1),
      paidAmount: Number(o.orderItems?.[0]?.orderPrice ?? 0),
      currency: "KRW",
      raw: o,
    }));
  },

  async ackOrder(_channel, pr, info) {
    if (!configured()) return;
    const vendorId = process.env.COUPANG_VENDOR_ID!;
    const path = `/v2/providers/openapi/apis/api/v4/vendors/${vendorId}/orders/${pr.externalOrderRef}/ordersheets/acknowledgement`;
    await coupang("PUT", path, "", { vendorId, orderSheetIds: [pr.externalOrderRef], ...info });
  },
};
