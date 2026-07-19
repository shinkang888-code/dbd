/**
 * CJDropshipping 커넥터 (P0 1호) — developers.cjdropshipping.com API 2.0
 * 인증: POST /authentication/getAccessToken {email, password(=API Key)} → accessToken(15일)
 * env 미설정 시 목업 픽스처 모드로 폴백해 전체 파이프라인이 항상 동작한다.
 */
import type { RemoteProduct, SourcingOrderPayload, SupplierConnector } from "../types";

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export const isCjConfigured = () => Boolean(process.env.CJ_API_EMAIL && process.env.CJ_API_KEY);

const configured = isCjConfigured;

let cachedToken: { token: string; exp: number } | null = null;

async function token(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now()) return cachedToken.token;
  const res = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.CJ_API_EMAIL, password: process.env.CJ_API_KEY }),
  });
  const json = await res.json();
  if (!json?.data?.accessToken) throw new Error(`CJ auth failed: ${json?.message ?? res.status}`);
  cachedToken = { token: json.data.accessToken, exp: Date.now() + 1000 * 60 * 60 * 24 * 10 };
  return cachedToken.token;
}

async function cj(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": await token(),
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (json?.code && json.code !== 200) throw new Error(`CJ ${path}: ${json.message}`);
  return json?.data;
}

/** CJ 가격은 단일("4.70") 또는 범위("2.50-4.20", "2.50 -- 4.20") 문자열/숫자로 온다.
 *  범위면 최저가를 취한다. 파싱 실패 시 0. */
function parseCjPrice(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const nums = v.match(/\d+(\.\d+)?/g);
  if (!nums || nums.length === 0) return 0;
  return Math.min(...nums.map(Number).filter(Number.isFinite));
}

type CjVariant = {
  vid: string;
  variantSku?: string;
  variantName?: string;
  variantKey?: string;
  price?: number;
  inventory?: number;
};

/** pid → variants; 실패 시 빈 배열 (목록 수집이 막히지 않게) */
async function fetchVariants(pid: string): Promise<CjVariant[]> {
  try {
    const data = await cj(`/product/variant/query?pid=${encodeURIComponent(pid)}`);
    const list = (data?.variants ?? data?.list ?? data?.variantList ?? data ?? []) as Record<string, unknown>[];
    if (!Array.isArray(list)) return [];
    return list
      .map((v) => ({
        vid: String(v.vid ?? v.variantId ?? ""),
        variantSku: v.variantSku ? String(v.variantSku) : undefined,
        variantName: v.variantNameEn || v.variantName ? String(v.variantNameEn ?? v.variantName) : undefined,
        variantKey: v.variantKey ? String(v.variantKey) : undefined,
        price: parseCjPrice(v.variantSellPrice ?? v.sellPrice ?? v.price),
        inventory: Number(v.inventory ?? v.stock ?? 0) || 0,
      }))
      .filter((v) => v.vid);
  } catch {
    return [];
  }
}

function mapProduct(p: Record<string, unknown>, variants?: CjVariant[]): RemoteProduct {
  const images = Array.isArray(p.productImage)
    ? (p.productImage as string[]).map((url) => ({ url }))
    : typeof p.productImage === "string"
      ? [{ url: p.productImage as string }]
      : [];
  const pid = String(p.pid ?? p.productId ?? "");
  const defaultVid = variants?.[0]?.vid;
  return {
    externalId: pid,
    url: p.productUrl ? String(p.productUrl) : undefined,
    title: String(p.productNameEn ?? p.productName ?? "Untitled"),
    descriptionHtml: p.description ? String(p.description) : undefined,
    categoryPath: String(p.categoryName ?? "General").split(">").map((s) => s.trim()),
    price: parseCjPrice(variants?.[0]?.price ?? p.sellPrice ?? p.price),
    currency: "USD",
    stock: Number(variants?.[0]?.inventory ?? p.listedNum ?? p.stock ?? 0) || 0,
    sellerName: "CJDropshipping",
    sellerInfo: {
      supplierId: p.supplierId,
      warehouse: p.sourceFrom,
      pid,
      defaultVid: defaultVid ?? null,
      mock: false,
    },
    images,
    optionSchema: variants?.length
      ? {
          defaultVid,
          variants: variants.map((v) => ({
            vid: v.vid,
            sku: v.variantSku,
            name: v.variantName,
            key: v.variantKey,
            price: v.price,
            inventory: v.inventory,
          })),
        }
      : undefined,
  };
}

async function mapProductWithVariants(p: Record<string, unknown>): Promise<RemoteProduct> {
  const pid = String(p.pid ?? p.productId ?? "");
  const variants = pid ? await fetchVariants(pid) : [];
  return mapProduct(p, variants);
}

/* ---------- 목업 픽스처 (API 키 발급 전 개발/데모용) ---------- */
const FIXTURES: RemoteProduct[] = [
  { externalId: "cj-1001", title: "Portable Mini Garment Steamer 120ml", categoryPath: ["Home", "Appliances"], price: 8.4, currency: "USD", stock: 320, images: [{ url: "https://picsum.photos/seed/cj1001/800/800" }], sellerName: "CJ Warehouse CN" },
  { externalId: "cj-1002", title: "Magnetic Phone Ring Holder 360°", categoryPath: ["Accessories", "Phone"], price: 1.9, currency: "USD", stock: 1500, images: [{ url: "https://picsum.photos/seed/cj1002/800/800" }], sellerName: "CJ Warehouse CN" },
  { externalId: "cj-1003", title: "LED Sunset Projection Lamp", categoryPath: ["Home", "Lighting"], price: 6.2, currency: "USD", stock: 240, images: [{ url: "https://picsum.photos/seed/cj1003/800/800" }], sellerName: "CJ Warehouse CN" },
  { externalId: "cj-1004", title: "Silicone Kitchen Utensil Set 12pcs", categoryPath: ["Home", "Kitchen"], price: 9.8, currency: "USD", stock: 180, images: [{ url: "https://picsum.photos/seed/cj1004/800/800" }], sellerName: "CJ Warehouse CN" },
  { externalId: "cj-1005", title: "Foldable Travel Makeup Brush Kit", categoryPath: ["Beauty", "Tools"], price: 4.5, currency: "USD", stock: 600, images: [{ url: "https://picsum.photos/seed/cj1005/800/800" }], sellerName: "CJ Warehouse CN" },
  { externalId: "cj-1006", title: "Pet Hair Remover Roller Reusable", categoryPath: ["Home", "Pet"], price: 3.1, currency: "USD", stock: 900, images: [{ url: "https://picsum.photos/seed/cj1006/800/800" }], sellerName: "CJ Warehouse CN" },
  { externalId: "cj-1007", title: "Acupressure Neck Stretcher Pillow", categoryPath: ["Health", "Wellness"], price: 5.6, currency: "USD", stock: 210, images: [{ url: "https://picsum.photos/seed/cj1007/800/800" }], sellerName: "CJ Warehouse CN" },
  { externalId: "cj-1008", title: "Mini Thermal Label Printer BT", categoryPath: ["Office", "Gadgets"], price: 14.9, currency: "USD", stock: 130, images: [{ url: "https://picsum.photos/seed/cj1008/800/800" }], sellerName: "CJ Warehouse CN" },
].map((p) => ({
  ...p,
  descriptionHtml: `<p>${p.title} — factory-direct item via CJ fulfillment.</p>`,
  sellerInfo: { mock: true, pid: p.externalId, defaultVid: `vid-${p.externalId}` },
  optionSchema: { defaultVid: `vid-${p.externalId}`, variants: [{ vid: `vid-${p.externalId}`, name: "Default" }] },
}));

let mockOrderSeq = 5000;

export const cjConnector: SupplierConnector = {
  code: "cjdropshipping",

  async listProducts({ page, pageSize = 20, category }) {
    if (!configured()) {
      return page === 1 ? FIXTURES.filter((p) => !category || p.categoryPath.includes(category)) : [];
    }
    // 공식 list (pageNum/pageSize) — listV2 content 구조가 달라 매핑이 깨지므로 list 사용
    const qs = new URLSearchParams({
      pageNum: String(page),
      pageSize: String(pageSize),
    });
    if (category) qs.set("categoryKeyword", category);
    const data = await cj(`/product/list?${qs}`);
    const rows = (data?.list ?? []) as Record<string, unknown>[];
    // variant 조회는 페이지당 N회 — timeout 방지: 최대 8건만 보강
    const slice = rows.slice(0, Math.min(rows.length, 8));
    const rest = rows.slice(slice.length);
    const enriched = await Promise.all(slice.map((p) => mapProductWithVariants(p)));
    return [...enriched, ...rest.map((p) => mapProduct(p))];
  },

  async getProduct(externalId) {
    if (!configured()) return FIXTURES.find((p) => p.externalId === externalId) ?? null;
    const data = await cj(`/product/query?pid=${encodeURIComponent(externalId)}`);
    if (!data) return null;
    return mapProductWithVariants(data as Record<string, unknown>);
  },

  async placeOrder(req: SourcingOrderPayload) {
    if (!configured()) {
      return { supplierOrderRef: `CJ-MOCK-${++mockOrderSeq}` };
    }
    const vid = req.variantId || req.externalId;
    if (!vid) throw new Error("CJ placeOrder: vid 필요 (variantId 또는 externalId)");
    const data = await cj(`/shopping/order/createOrderV2`, {
      method: "POST",
      body: JSON.stringify({
        orderNumber: `LEXI-${Date.now()}`,
        shippingCountryCode: req.shippingAddress.country ?? "KR",
        shippingProvince: req.shippingAddress.state ?? "",
        shippingCity: req.shippingAddress.city ?? "",
        shippingAddress: req.shippingAddress.addr1 ?? "",
        shippingCustomerName: req.shippingAddress.name ?? "",
        shippingZip: req.shippingAddress.zip ?? "",
        shippingPhone: req.shippingAddress.phone ?? "",
        remark: req.note ?? "",
        products: [{ vid, quantity: req.qty }],
      }),
    });
    return { supplierOrderRef: String(data?.orderId ?? data ?? "") };
  },

  async getTracking(supplierOrderRef) {
    if (!configured()) {
      return { trackingNo: `MOCKTRK${supplierOrderRef.slice(-4)}`, carrier: "CJPacket", status: "in_transit" };
    }
    const data = await cj(`/logistic/getTrackInfo?trackNumber=&orderId=${encodeURIComponent(supplierOrderRef)}`).catch(() => null);
    if (!data) return null;
    const first = Array.isArray(data) ? data[0] : data;
    return { trackingNo: first?.trackingNumber, carrier: first?.logisticName, status: first?.trackingStatus };
  },
};
