// filepath: src/components/admin/orders-panel.tsx
"use client";

import { useEffect, useState } from "react";
import { LegacyCommerceBanner } from "@/components/legacy-commerce-banner";

type Order = {
  id: number;
  status: string;
  totalUsd: string;
  country: string | null;
  guestEmail: string | null;
  userEmail: string | null;
  paymentRef: string | null;
  createdAt: string;
};

const STATUSES = ["paid", "preparing", "shipped", "customs", "delivered", "cancelled"];
const WRITES_ENABLED = process.env.NEXT_PUBLIC_LEGACY_COMMERCE_WRITE === "true";

export function OrdersPanel() {
  const [items, setItems] = useState<Order[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "로드 실패");
      return;
    }
    setItems(data.items ?? []);
    setMsg(`source: ${data.source}`);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: number, status: string) {
    if (!WRITES_ENABLED) {
      setMsg("Legacy 주문 쓰기가 비활성입니다. Cafe24에서 처리하세요.");
      return;
    }
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  }

  return (
    <div className="space-y-3">
      <LegacyCommerceBanner surface="admin" />
      <p className="text-[12px] text-dim">{msg}</p>
      {!WRITES_ENABLED && (
        <p className="rounded-2xl border border-dashed border-line p-4 text-[13px] text-dim">
          Legacy 주문 상태 변경은 기본적으로 꺼져 있습니다. 실운영은 Cafe24 관리자를 사용하세요.
        </p>
      )}
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {items.length === 0 && (
          <li className="p-6 text-[13px] text-dim">주문이 없습니다. Checkout 후 여기에 표시됩니다.</li>
        )}
        {items.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">
                #{o.id} · ${Number(o.totalUsd).toFixed(2)}
              </p>
              <p className="text-[12px] text-dim">
                {o.userEmail || o.guestEmail || "guest"} · {o.country} · {o.paymentRef}
              </p>
            </div>
            {WRITES_ENABLED ? (
              <select
                className="rounded-lg border border-line px-2 py-1.5 text-[12px]"
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rounded-lg bg-fog px-2 py-1.5 text-[12px] font-semibold text-dim">
                {o.status}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
