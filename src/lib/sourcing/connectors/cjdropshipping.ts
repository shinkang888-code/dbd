/**
 * CJDropshipping 커넥터 (P0 1호) — developers.cjdropshipping.com API 2.0
 * 인증: POST /authentication/getAccessToken {email, password(=API Key)} → accessToken(15일)
 * env 미설정 시 목업 픽스처 모드로 폴백해 전체 파이프라인이 항상 동작한다.
 */
import type { RemoteProduct, SourcingOrderPayload, SupplierConnector } from "../types";

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

const configured = () => Boolean(process.env.CJ_API_EMAIL && process.env.CJ_API_KEY);

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

function mapProduct(p: Record<string, unknown>): RemoteProduct {
  const images = Array.isArray(p.productImage)
    ? (p.productImage as string[]).map((url) => ({ url }))
    : typeof p.productImage === "string"
      ? [{ url: p.productImage as string }]
      : [];
  return {
    externalId: String(p.pid ?? p.productId ?? ""),
    url: p.productUrl ? String(p.productUrl) : undefined,
    title: String(p.productNameEn ?? p.productName ?? "Untitled"),
    descriptionHtml: p.description ? String(p.description) : undefined,
    categoryPath: String(p.categoryName ?? "General").split(">").map((s) => s.trim()),
    price: Number(p.sellPrice ?? p.price ?? 0),
    currency: "USD",
    stock: Number(p.listedNum ?? p.stock ?? 0),
    sellerName: "CJDropshipping",
    sellerInfo: { supplierId: p.supplierId, warehouse: p.sourceFrom },
    images,
  };
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
].map((p) => ({ ...p, descriptionHtml: `<p>${p.title} — factory-direct item via CJ fulfillment.</p>`, sellerInfo: { mock: true } }));

let mockOrderSeq = 5000;

export const cjConnector: SupplierConnector = {
  code: "cjdropshipping",

  async listProducts({ page, pageSize = 20, category }) {
    if (!configured()) {
      return page === 1 ? FIXTURES.filter((p) => !category || p.categoryPath.includes(category)) : [];
    }
    const data = await cj(`/product/list?pageNum=${page}&pageSize=${pageSize}${category ? `&categoryKeyword=${encodeURIComponent(category)}` : ""}`);
    return ((data?.list ?? []) as Record<string, unknown>[]).map(mapProduct);
  },

  async getProduct(externalId) {
    if (!configured()) return FIXTURES.find((p) => p.externalId === externalId) ?? null;
    const data = await cj(`/product/query?pid=${encodeURIComponent(externalId)}`);
    return data ? mapProduct(data) : null;
  },

  async placeOrder(req: SourcingOrderPayload) {
    if (!configured()) {
      return { supplierOrderRef: `CJ-MOCK-${++mockOrderSeq}` };
    }
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
        products: [{ vid: req.externalId, quantity: req.qty }],
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
