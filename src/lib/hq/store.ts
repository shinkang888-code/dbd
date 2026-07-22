/**
 * HQ 스토어 — 역직구 도메인의 런타임 상태 저장소.
 *
 * M7 내구화:
 *  - getState: 관계형 테이블 → hq_state jsonb 스냅샷 → seed
 *  - mutate: 메모리 갱신 후 스냅샷 + 관계형 마스터 upsert
 */
import { neon } from "@neondatabase/serverless";
import { hasDb } from "@/db";
import type {
  AuditEntry,
  Channel,
  ChannelListing,
  Collection,
  CollectionItem,
  ImportBatch,
  Listing,
  ListingDraft,
  PurchaseRequest,
  Settlement,
  SourcingOrder,
  Supplier,
  SupplierProduct,
} from "./types";
import { DEFAULT_FX } from "./types";
import type {
  CampaignLogEntry,
  ContentCategory,
  MarketingAsset,
  MarketingLearning,
} from "@/lib/marketing/types";
import { DEFAULT_CATEGORIES } from "@/lib/marketing/categories";
import { loadRelationalCore, persistRelationalCore } from "./relational";

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
  marketingAssets: MarketingAsset[];
  marketingLearnings: MarketingLearning[];
  campaignLog: CampaignLogEntry[];
  contentCategories: ContentCategory[];
};

const now = () => new Date().toISOString();

function seedState(): HqState {
  return {
    seq: 100,
    suppliers: [
      {
        id: 1,
        code: "cjdropshipping",
        name: "CJDropshipping",
        homepage: "https://cjdropshipping.com",
        connectorKind: "api",
        currency: "USD",
        leadTimeDays: 7,
        asCenterUrl: "https://cjdropshipping.com/disputes",
        asPolicy: "배송 파손/오배송은 CJ 분쟁 시스템으로 이관",
        legalNote: "공식 오픈 API 사용",
        status: "active",
        createdAt: now(),
      },
      {
        id: 2,
        code: "superbuy",
        name: "Superbuy (1688/타오바오 대행)",
        homepage: "https://superbuy.com",
        connectorKind: "agent",
        currency: "CNY",
        leadTimeDays: 12,
        asCenterUrl: "https://front.superbuy.com/help",
        legalNote: "대리구매 오픈 API",
        status: "paused",
        createdAt: now(),
      },
      {
        id: 3,
        code: "alibaba",
        name: "Alibaba / 1688",
        homepage: "https://www.1688.com",
        connectorKind: "api",
        currency: "CNY",
        leadTimeDays: 10,
        asCenterUrl: "https://air.1688.com",
        legalNote: "Open Platform App Key 필요 (Cloud LTAI 키와 별개)",
        status: "active",
        createdAt: now(),
      },
      {
        id: 4,
        code: "cafe24-mall",
        name: "내 Cafe24 몰 (기존 등록분)",
        homepage: "https://www.cafe24.com",
        connectorKind: "api",
        currency: "KRW",
        leadTimeDays: 7,
        legalNote: "Cafe24 Open API로 몰 내 상품을 소싱 파이프라인으로 읽어오는 브릿지",
        status: "active",
        createdAt: now(),
      },
      {
        id: 5,
        code: "temu",
        name: "Temu (테무)",
        homepage: "https://www.temu.com",
        connectorKind: "scrape",
        currency: "USD",
        leadTimeDays: 12,
        legalNote: "공식 소싱 오픈 API 없음 — URL 임포트/서드파티 데이터/약관준수 파싱 경로",
        status: "active",
        createdAt: now(),
      },
    ],
    supplierProducts: [],
    collections: [
      {
        id: 1,
        slug: "starter-picks",
        name: "스타터 셀렉션",
        note: "첫 소싱 후보",
        createdAt: now(),
      },
    ],
    collectionItems: [],
    drafts: [],
    listings: [],
    channels: [
      {
        id: 1,
        code: "lexi",
        kind: "own",
        name: "LEXI preview (legacy)",
        config: { tradeModel: "reverse-dropship", currency: "USD", feeRate: 0.036 },
      },
      {
        id: 2,
        code: "coupang",
        kind: "coupang",
        name: "쿠팡 (구매대행)",
        config: {
          tradeModel: "purchase-agency",
          firstLineSupport: true,
          currency: "KRW",
          feeRate: 0.108,
        },
      },
      {
        id: 3,
        code: "cafe24",
        kind: "cafe24",
        name: "Cafe24 몰 (SSOT)",
        config: { tradeModel: "reverse-dropship", currency: "USD", feeRate: 0.02 },
      },
    ],
    channelListings: [],
    importBatches: [],
    purchaseRequests: [],
    sourcingOrders: [],
    settlements: [],
    audit: [],
    fx: { ...DEFAULT_FX },
    marketingAssets: [],
    marketingLearnings: [],
    campaignLog: [],
    contentCategories: DEFAULT_CATEGORIES.map((c) => ({ ...c, seeds: [...c.seeds] })),
  };
}

type G = typeof globalThis & {
  __lexiHq?: { state: HqState; loaded: boolean; persistTimer?: ReturnType<typeof setTimeout> };
};
const g = globalThis as G;

async function loadSnapshot(): Promise<HqState | null> {
  if (!hasDb()) return null;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT value FROM hq_state WHERE key = 'snapshot'`;
    return (rows[0]?.value as HqState) ?? null;
  } catch {
    return null;
  }
}

function schedulePersist() {
  if (!hasDb() || !g.__lexiHq) return;
  clearTimeout(g.__lexiHq.persistTimer);
  g.__lexiHq.persistTimer = setTimeout(async () => {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      const state = g.__lexiHq!.state;
      await sql`
        INSERT INTO hq_state (key, value, updated_at)
        VALUES ('snapshot', ${JSON.stringify(state)}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
      await persistRelationalCore(state);
    } catch (e) {
      console.error("[hq] snapshot persist failed", e);
    }
  }, 800);
}

export async function getState(): Promise<HqState> {
  if (!g.__lexiHq) g.__lexiHq = { state: seedState(), loaded: false };
  if (!g.__lexiHq.loaded) {
    g.__lexiHq.loaded = true;
    const base = seedState();
    const relational = await loadRelationalCore();
    if (relational) {
      g.__lexiHq.state = {
        ...base,
        ...relational,
        channels: relational.channels.length ? relational.channels : base.channels,
      };
    } else {
      const snap = await loadSnapshot();
      if (snap) g.__lexiHq.state = { ...base, ...snap };
    }
  }
  return g.__lexiHq.state;
}

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
    id: nextId(s),
    entity,
    entityId: String(entityId),
    fromState,
    toState,
    actor,
    meta,
    createdAt: now(),
  });
  if (s.audit.length > 500) s.audit.length = 500;
}

export const iso = now;
