"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HqOverview } from "@/lib/hq/overview";

export function HqDashboardView() {
  const [data, setData] = useState<HqOverview | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/hq/overview");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        setData(json as HqOverview);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "load failed");
      }
    })();
  }, []);

  if (err) {
    return (
      <p className="rounded-xl border border-coral/30 bg-coral/5 p-4 text-[13px] text-coral">{err}</p>
    );
  }
  if (!data) {
    return <p className="text-[13px] text-dim">로딩…</p>;
  }

  const f = data.funnel;
  const stages = [
    { label: "Crawl", value: f.catalogTotal, href: "/hq/suppliers" },
    { label: "Import", value: f.imported, href: "/hq/collections" },
    { label: "PDP", value: f.pdpTotal, href: "/hq/pipeline/pdp" },
    { label: "Review", value: f.pdpReview, href: "/hq/pipeline/pdp" },
    { label: "Export✓", value: f.exportDone, href: "/hq/pipeline/export" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[28px] font-semibold">파이프라인 총괄</h1>
        <p className="mt-1 text-[13px] text-dim">
          CJ 수집 → 컬렉션 → 초안/PDP → 채널 게시 · DB: {data.dbMode}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {stages.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-line bg-paper p-4 hover:border-ink/30"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-dim">{s.label}</p>
            <p className="price mt-1 text-[26px] font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-line bg-paper p-4">
          <h2 className="text-[14px] font-bold">액션 큐</h2>
          {data.actionQueue.length === 0 ? (
            <p className="mt-3 text-[13px] text-dim">대기 작업 없음</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {data.actionQueue.map((a) => (
                <li key={`${a.kind}-${a.id}`}>
                  <Link href={a.href} className="block py-2.5 text-[13px] hover:text-coral">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {f.exportFailed > 0 && (
            <p className="mt-2 text-[12px] font-semibold text-coral">Export 실패 {f.exportFailed}건</p>
          )}
          {f.exportQueued > 0 && (
            <p className="mt-1 text-[12px] text-dim">Export 대기 {f.exportQueued}건</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-paper p-4">
          <h2 className="text-[14px] font-bold">채널 헬스</h2>
          <ul className="mt-3 space-y-2">
            {data.channelHealth.map((c) => (
              <li key={c.code} className="flex items-center justify-between gap-2 text-[13px]">
                <span>
                  <span className="font-semibold uppercase">{c.code}</span>
                  <span className="ml-2 text-[11px] text-dim">{c.note}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    c.status.includes("live") || c.status === "ready"
                      ? "bg-sage/15 text-sage"
                      : "bg-fog text-dim"
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-paper p-4">
        <h2 className="text-[14px] font-bold">최근 잡</h2>
        <ul className="mt-3 divide-y divide-line">
          {data.recent.map((r) => (
            <li key={`${r.kind}-${r.id}`} className="flex justify-between gap-3 py-2 text-[13px]">
              <span>
                <span className="mr-2 rounded bg-fog px-1.5 py-0.5 text-[10px] font-bold uppercase text-dim">
                  {r.kind}
                </span>
                {r.label}
              </span>
              <span className="shrink-0 text-[11px] text-dim">
                {String(r.at).slice(0, 19).replace("T", " ")}
              </span>
            </li>
          ))}
          {data.recent.length === 0 && (
            <li className="py-2 text-[13px] text-dim">아직 잡 없음 · 공급처 카탈로그 수집부터</li>
          )}
        </ul>
      </section>
    </div>
  );
}
