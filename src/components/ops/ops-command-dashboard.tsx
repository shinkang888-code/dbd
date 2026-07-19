import Link from "next/link";

type Kpi = { label: string; value: string | number; href: string; hint?: string; accent?: boolean };

export function OpsCommandDashboard({
  kpis,
  actions,
  channels,
  recent,
  source,
}: {
  kpis: Kpi[];
  actions: { title: string; href: string; badge?: string; priority?: string }[];
  channels: { code: string; status: string; ok?: boolean }[];
  recent: { kind: string; label: string; at: string }[];
  source: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight">파이프라인 총괄</h1>
        <p className="mt-1 text-[12.5px] text-dim">
          Crawl → Import → PDP → Review → Export · Studio 콘텐츠 · Cafe24 원장 · DB: {source}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-line bg-paper px-3 py-3 hover:border-ink/25"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-dim">{s.label}</p>
            <p className={`price mt-1 text-[24px] font-bold leading-none ${s.accent ? "text-coral" : ""}`}>
              {s.value}
            </p>
            {s.hint ? <p className="mt-1.5 text-[10px] text-dim">{s.hint}</p> : null}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-line bg-paper p-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold">액션 큐</h2>
            <span className="text-[10px] font-semibold text-dim">{actions.length}건</span>
          </div>
          {actions.length === 0 ? (
            <p className="mt-3 text-[12px] text-dim">대기 작업 없음</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {actions.map((a) => (
                <li key={`${a.href}-${a.title}`}>
                  <Link
                    href={a.href}
                    className="flex items-center justify-between gap-2 py-2 text-[12.5px] hover:text-coral"
                  >
                    <span className="min-w-0 truncate font-medium">{a.title}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {a.badge ? (
                        <span className="rounded bg-fog px-1.5 py-0.5 text-[9px] font-bold uppercase text-dim">
                          {a.badge}
                        </span>
                      ) : null}
                      {a.priority ? (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            a.priority === "높음"
                              ? "bg-coral/10 text-coral"
                              : "bg-fog text-dim"
                          }`}
                        >
                          {a.priority}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-paper p-3.5">
          <h2 className="text-[13px] font-bold">채널 헬스</h2>
          <ul className="mt-2 space-y-1.5">
            {channels.map((c) => (
              <li
                key={c.code}
                className="flex items-center justify-between rounded-lg bg-fog/70 px-2.5 py-2 text-[12.5px]"
              >
                <span className="font-semibold uppercase tracking-wide">{c.code}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    c.ok ? "bg-sage/15 text-sage" : "bg-paper text-dim"
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-paper p-3.5">
        <h2 className="text-[13px] font-bold">최근 잡 · 바로가기</h2>
        <ul className="mt-2 divide-y divide-line">
          {recent.map((r) => (
            <li key={`${r.kind}-${r.label}-${r.at}`} className="flex justify-between gap-3 py-2 text-[12.5px]">
              <span className="min-w-0 truncate">
                <span className="mr-1.5 rounded bg-fog px-1.5 py-0.5 text-[9px] font-bold uppercase text-dim">
                  {r.kind}
                </span>
                {r.label}
              </span>
              <span className="shrink-0 text-[10px] text-dim">{r.at}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            ["/studio/creator/review", "승인 큐"],
            ["/studio/creator/publish", "게시"],
            ["/admin/sourcing", "역직구"],
            ["/admin/ledger", "HDL"],
            ["/studio/mobbin", "Mobbin"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-dim hover:border-ink/30 hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
