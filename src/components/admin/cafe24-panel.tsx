// filepath: src/components/admin/cafe24-panel.tsx
"use client";

import { useEffect, useState } from "react";

type Status = {
  mode: string;
  configured: boolean;
  adminConfigured: boolean;
  mallId: string | null;
  ping?: string;
  productCount?: number;
  productSample?: Array<{ slug: string; name: string; cafe24ProductNo: number }>;
  error?: string;
  note?: string;
};

export function Cafe24Panel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [syncMsg, setSyncMsg] = useState("");

  async function load() {
    const res = await fetch("/api/cafe24/status");
    setStatus(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function sync() {
    setSyncMsg("동기화 중…");
    const res = await fetch("/api/cafe24/sync", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setSyncMsg(data.error || "실패");
      return;
    }
    setSyncMsg(`Neon에 ${data.upserted}/${data.total}건 upsert 완료`);
    await load();
  }

  if (!status) return <p className="text-[13px] text-dim">Cafe24 상태 확인 중…</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line p-4 text-[13px]">
        <p className="font-bold">Cafe24 Headless</p>
        <ul className="mt-2 space-y-1 text-dim">
          <li>mode: {status.mode}</li>
          <li>configured: {String(status.configured)}</li>
          <li>admin: {String(status.adminConfigured)}</li>
          <li>mall: {status.mallId || "—"}</li>
          <li>ping: {status.ping ?? "—"}</li>
          <li>products: {status.productCount ?? "—"}</li>
        </ul>
        {status.note && <p className="mt-2 text-[12px]">{status.note}</p>}
        {status.error && <p className="mt-2 text-coral">{status.error}</p>}
      </div>

      {status.productSample && status.productSample.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line text-[13px]">
          {status.productSample.map((p) => (
            <li key={p.slug} className="p-3">
              <span className="font-semibold">{p.name}</span>
              <span className="ml-2 text-dim">
                #{p.cafe24ProductNo} · {p.slug}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={sync}
        disabled={!status.configured}
        className="rounded-xl bg-ink px-4 py-3 text-[13px] font-bold text-white disabled:opacity-40"
      >
        Cafe24 → Neon Sync
      </button>
      {syncMsg && <p className="text-[12px] text-dim">{syncMsg}</p>}
    </div>
  );
}
