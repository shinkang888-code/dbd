/**
 * HQ 스토어 — 역직구 도메인의 런타임 상태 저장소.
 *
 * v1 내구화 전략 (스펙 §1 D1 + hq_state):
 *  - 프로세스 메모리(globalThis)에 전체 상태 유지
 *  - DATABASE_URL이 있으면 hq_state(key='snapshot') jsonb로 저장/복원 (mutate 시 debounce persist)
 *  - 관계형 테이블(suppliers, supplier_products, …)은 스키마에 준비돼 있고 M7에서 완전 이관
 */
import { neon } from "@neondatabase/serverless";
import { hasDb } from "@/db";
import type {
  AuditEntry, Channel, ChannelListing, Collection, CollectionItem,
  ImportBatch, Listing, ListingDraft, PurchaseRequest, Settlement,
  SourcingOrder, Supplier, SupplierProduct,
} from "./types";
import { DEFAULT_FX } from "./types";

export type HqState = {
  seq: number;
  suppliers: Supplier[];
  supplierProducts: SupplierProduct[];
  collections: Collection[];
  collectionItems: CollectionItem[];
  drafts: ListingDraft[];
  listings: Listing[];
  channels: Channel[];
  channelListings: ChannelListing[];
  importBatches: ImportBatch[];
  purchaseRequests: PurchaseRequest[];
  sourcingOrders: SourcingOrder[];
  settlements: Settlement[];
  audit: AuditEntry[];
  fx: Record<string, number>;
};

const now = () => new Date().toISOString();

function seedState(): HqState {
  return {
    seq: 100,
    suppliers: [
      {
        id: 1, code: "cjdropshipping", name: "CJDropshipping",
        homepage: "https://cjdropshipping.com", connectorKind: "api",
        currency: "USD", leadTimeDays: 7,
        asCenterUrl: "https://cjdropshipping.com/disputes",
        asPolicy: "배송 파손/오배송은 CJ 분쟁 시스템으로 이관", legalNote: "공식 오픈 API 사용",
        status: "active", createdAt: now(),
      },
      {
        id: 2, code: "superbuy", name: "Superbuy (1688/타오바오 대행)",
        homepage: "https://superbuy.com", connectorKind: "agent",
        currency: "CNY", leadTimeDays: 12,
        asCenterUrl: "https://front.superbuy.com/help", legalNote: "대리구매 오픈 API",
        status: "paused", createdAt: now(),
      },
    ],
    supplierProducts: [],
    collections: [{ id: 1, slug: "starter-picks", name: "스타터 셀렉션", note: "첫 소싱 후보", createdAt: now() }],
    collectionItems: [],
    drafts: [],
    listings: [],
    channels: [
      { id: 1, code: "lexi", kind: "own", name: "LEXI 자사몰", config: { tradeModel: "reverse-dropship", currency: "USD", feeRate: 0.036 } },
      { id: 2, code: "coupang", kind: "coupang", name: "쿠팡 (구매대행)", config: { tradeModel: "purchase-agency", firstLineSupport: true, currency: "KRW", feeRate: 0.108 } },
      { id: 3, code: "cafe24", kind: "cafe24", name: "Cafe24 몰", config: { tradeModel: "reverse-dropship", currency: "USD", feeRate: 0.02 } },
    ],
    channelListings: [],
    importBatches: [],
    purchaseRequests: [],
    sourcingOrders: [],
    settlements: [],
    audit: [],
    fx: { ...DEFAULT_FX },
  };
}

type G = typeof globalThis & { __lexiHq?: { state: HqState; loaded: boolean; persistTimer?: ReturnType<typeof setTimeout> } };
const g = globalThis as G;

async function loadSnapshot(): Promise<HqState | null> {
  if (!hasDb()) return null;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT value FROM hq_state WHERE key = 'snapshot'`;
    return (rows[0]?.value as HqState) ?? null;
  } catch {
    return null; // 테이블 미생성 등 — 메모리 모드로 진행
  }
}

function schedulePersist() {
  if (!hasDb() || !g.__lexiHq) return;
  clearTimeout(g.__lexiHq.persistTimer);
  g.__lexiHq.persistTimer = setTimeout(async () => {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`
        INSERT INTO hq_state (key, value, updated_at)
        VALUES ('snapshot', ${JSON.stringify(g.__lexiHq!.state)}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
    } catch (e) {
      console.error("[hq] snapshot persist failed", e);
    }
  }, 800);
}

export async function getState(): Promise<HqState> {
  if (!g.__lexiHq) g.__lexiHq = { state: seedState(), loaded: false };
  if (!g.__lexiHq.loaded) {
    g.__lexiHq.loaded = true;
    const snap = await loadSnapshot();
    if (snap) g.__lexiHq.state = { ...seedState(), ...snap };
  }
  return g.__lexiHq.state;
}

/** 상태 변경 트랜잭션 헬퍼 — 변경 후 스냅샷 persist 예약 */
export async function mutate<T>(fn: (s: HqState) => T | Promise<T>): Promise<T> {
  const s = await getState();
  const r = await fn(s);
  schedulePersist();
  return r;
}

export function nextId(s: HqState) {
  return ++s.seq;
}

export function audit(
  s: HqState,
  entity: string,
  entityId: number | string,
  toState: string,
  actor: string,
  fromState?: string,
  meta?: Record<string, unknown>,
) {
  s.audit.unshift({
    id: nextId(s), entity, entityId: String(entityId),
    fromState, toState, actor, meta, createdAt: now(),
  });
  if (s.audit.length > 500) s.audit.length = 500;
}

export const iso = now;
