// filepath: src/components/add-to-cart-button.tsx
"use client";

import { useState } from "react";

export function AddToCartButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  async function add() {
    setBusy(true);
    try {
      const cur = await fetch("/api/cart").then((r) => r.json());
      const existing = (cur.items as { slug: string; qty: number }[] | undefined)?.find(
        (i) => i.slug === slug,
      );
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, qty: (existing?.qty ?? 0) + 1 }),
      });
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={busy}
      className="w-full rounded-xl bg-ink py-3.5 text-[14px] font-bold text-white disabled:opacity-60"
    >
      {ok ? "담겼습니다 ✓" : busy ? "담는 중…" : "장바구니 담기"}
    </button>
  );
}
