import { DataModeSwitch } from "@/components/data-mode-switch";
import { OpsCommandDashboard } from "@/components/ops/ops-command-dashboard";
import { adminStats } from "@/lib/catalog";
import { requireSession } from "@/lib/auth/admin";
import { studioDashboard } from "@/lib/studio/store";
import { cafe24Connected } from "@/lib/cafe24/oauth";
import { cafe24StatusPayload } from "@/lib/cafe24/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "LEXI HQ · Command Center" };

export default async function AdminPage() {
  const session = await requireSession();
  const [stats, studio, connected] = await Promise.all([
    adminStats(),
    studioDashboard(),
    cafe24Connected().catch(() => false),
  ]);
  const cafe = cafe24StatusPayload();

  const kpis = [
    {
      label: "Crawl",
      value: stats.products,
      href: "/admin/pipeline/catalog",
      hint: "카탈로그·상품",
    },
    {
      label: "Import",
      value: studio.counts.jobs,
      href: "/admin/pipeline/import",
      hint: "생성 작업",
    },
    {
      label: "PDP",
      value: studio.counts.documents,
      href: "/admin/pipeline/pdp",
      hint: "콘텐츠 문서",
    },
    {
      label: "Review",
      value: studio.counts.review,
      href: "/studio/creator/review",
      hint: "승인 대기",
      accent: studio.counts.review > 0,
    },
    {
      label: "Export✓",
      value: studio.counts.published,
      href: "/admin/pipeline/export",
      hint: "게시 완료",
    },
  ];

  const actions = [
    ...(studio.counts.review > 0
      ? [
          {
            title: `승인 대기 PDP ${studio.counts.review}건`,
            href: "/studio/creator/review",
            badge: "PDP",
            priority: "높음",
          },
        ]
      : []),
    ...(!connected
      ? [
          {
            title: "Cafe24 OAuth 연결 필요",
            href: "/studio/cafe24",
            badge: "채널",
            priority: "높음",
          },
        ]
      : []),
    {
      title: "역직구 Supply 모듈 점검",
      href: "/admin/sourcing",
      badge: "소싱",
      priority: "중간",
    },
    {
      title: "분산원장(HDL) 알림 확인",
      href: "/admin/ledger",
      badge: "원장",
      priority: "중간",
    },
    {
      title: "Mobbin 레퍼런스 정리",
      href: "/studio/mobbin",
      badge: "Studio",
      priority: "낮음",
    },
  ];

  const channels = [
    {
      code: "lexi live",
      status: cafe.configured ? "READY" : "SETUP",
      ok: Boolean(cafe.configured),
    },
    {
      code: "cafe24",
      status: connected ? "LIVE" : "ACTION",
      ok: connected,
    },
    {
      code: "studio",
      status: studio.source === "neon" ? "NEON" : "PREVIEW",
      ok: studio.source === "neon",
    },
  ];

  const recent = [
    {
      kind: "studio",
      label: `미디어 ${studio.counts.media} · 섹션 ${studio.counts.sections} · 테마 ${studio.counts.themes}`,
      at: "live",
    },
    {
      kind: "commerce",
      label: `상품 ${stats.products} · 주문 ${stats.orders} · 브랜드 ${stats.brands}`,
      at: stats.source,
    },
    {
      kind: "session",
      label: session?.user?.email ? `운영자 ${session.user.email}` : "데모/비로그인 — 데모 로그인 권장",
      at: "now",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-dim">
          Cafe24 SoR · Studio 콘텐츠 · HQ 소싱 · HDL · source={stats.source}
        </p>
        <DataModeSwitch />
      </div>
      <OpsCommandDashboard
        kpis={kpis}
        actions={actions}
        channels={channels}
        recent={recent}
        source={String(stats.source)}
      />
    </div>
  );
}
