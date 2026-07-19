/** HQ 홈 overview — dbd HQ store KPI (Crawl→Import→PDP→Review→Export 매핑) */
import { hasDb } from "@/db";
import { getState } from "@/lib/hq/store";
import { isCjConfigured } from "@/lib/sourcing/connectors/cjdropshipping";

export type HqOverview = {
  funnel: {
    catalogTotal: number;
    imported: number;
    pdpTotal: number;
    pdpReview: number;
    exportQueued: number;
    exportDone: number;
    exportFailed: number;
  };
  actionQueue: { kind: string; id: number | string; title: string; href: string }[];
  channelHealth: { code: string; status: string; note: string }[];
  recent: { kind: string; id: number | string; label: string; at: string }[];
  dbMode: "neon" | "local-file" | "memory";
};

function resolveDbMode(): HqOverview["dbMode"] {
  if (!hasDb()) return "memory";
  const url = process.env.DATABASE_URL ?? "";
  if (/neon\.(tech|build)/i.test(url)) return "neon";
  return "local-file";
}

export async function getHqOverview(): Promise<HqOverview> {
  const s = await getState();

  const catalogTotal = s.supplierProducts.length;
  const imported = s.collectionItems.length;
  const pdpTotal = s.drafts.length;
  const pdpReview = s.drafts.filter((d) => d.status === "review").length;
  const exportQueued = s.channelListings.filter((c) => c.publishState === "queued").length;
  const exportDone = s.channelListings.filter((c) => c.publishState === "live").length;
  const exportFailed = s.channelListings.filter((c) => c.publishState === "failed").length;

  const actionQueue: HqOverview["actionQueue"] = [];
  for (const d of s.drafts.filter((x) => x.status === "review").slice(0, 5)) {
    actionQueue.push({
      kind: "pdp_review",
      id: d.id,
      title: `초안 리뷰: ${d.title ?? `#${d.id}`}`,
      href: "/hq/pipeline/pdp",
    });
  }
  for (const pr of s.purchaseRequests
    .filter((p) => ["received", "matched"].includes(p.status))
    .slice(0, 5)) {
    actionQueue.push({
      kind: "purchase",
      id: pr.id,
      title: `구매요청 검수: ${pr.externalOrderRef ?? `#${pr.id}`}`,
      href: "/hq/purchase-requests",
    });
  }
  if (catalogTotal === 0) {
    actionQueue.unshift({
      kind: "catalog",
      id: "sync",
      title: "공급처에서 카탈로그를 수집하세요",
      href: "/hq/suppliers",
    });
  }

  const channelHealth = [
    {
      code: "lexi",
      status: "ready",
      note: "자사몰 / Studio",
    },
    {
      code: "coupang",
      status: process.env.COUPANG_ACCESS_KEY ? "live_capable" : "mock",
      note: process.env.COUPANG_ACCESS_KEY ? "키 설정됨" : "mock (키 없음)",
    },
    {
      code: "cafe24",
      status:
        process.env.CAFE24_ACCESS_TOKEN || process.env.CAFE24_FRONT_CLIENT_ID
          ? "live_capable"
          : "mock",
      note: process.env.CAFE24_ACCESS_TOKEN ? "토큰 있음" : "키/토큰 확인 필요",
    },
    {
      code: "cj",
      status: isCjConfigured() ? "live_capable" : "fixture",
      note: isCjConfigured() ? "실API" : "mock fixture",
    },
  ];

  const recent: HqOverview["recent"] = [];
  for (const a of s.audit.slice(0, 12)) {
    recent.push({
      kind: a.entity ?? "audit",
      id: a.entityId ?? a.id,
      label: `${a.toState}${a.meta ? ` · ${JSON.stringify(a.meta).slice(0, 40)}` : ""}`,
      at: a.createdAt ?? new Date().toISOString(),
    });
  }

  return {
    funnel: {
      catalogTotal,
      imported,
      pdpTotal,
      pdpReview,
      exportQueued,
      exportDone,
      exportFailed,
    },
    actionQueue,
    channelHealth,
    recent,
    dbMode: resolveDbMode(),
  };
}
