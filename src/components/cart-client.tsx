// filepath: src/components/cart-client.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DutyCalculator } from "@/components/duty-calculator";

type Line = {
  slug: string;
  qty: number;
  lineTotal: number;
  product: { name: string; brand: string; image: string };
};

export function CartClient() {
  const [items, setItems] = useState<Line[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setQty(slug: string, qty: number) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, qty }),
    });
    const data = await res.json();
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
  }

  const toFree = Math.max(0, 49 - subtotal);

  if (loading) {
    return <p className="mt-8 text-[13px] text-dim">장바구니 불러오는 중…</p>;
  }

  if (!items.length) {
    return (
      <div className="mt-8 rounded-2xl bg-fog p-8 text-center">
        <p className="text-[15px] font-semibold">장바구니가 비어 있습니다</p>
        <Link href="/best" className="mt-4 inline-block text-[13px] font-bold text-coral">
          베스트로 쇼핑하기 →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 rounded-xl bg-fog p-4">
        <p className="text-[13px] font-semibold">
          {toFree > 0 ? (
            <>
              <span className="price text-coral">${toFree.toFixed(2)}</span> 더 담으면 무료배송
            </>
          ) : (
            <span className="text-sage">무료배송 조건 달성 ✓</span>
          )}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-coral transition-all"
            style={{ width: `${Math.min(100, (subtotal / 49) * 100)}%` }}
          />
        </div>
      </div>

      <ul className="mt-5 divide-y divide-line">
        {items.map((l) => (
          <li key={l.slug} className="flex items-center gap-4 py-4">
            <span className="relative block size-20 shrink-0 overflow-hidden rounded-xl bg-fog">
              <Image src={l.product.image} alt="" fill sizes="80px" className="object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-dim">{l.product.brand}</p>
              <p className="truncate text-[14px]">{l.product.name}</p>
              <p className="price mt-1 text-[15px] font-bold">${l.lineTotal.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="size-8 rounded-lg border border-line"
                onClick={() => setQty(l.slug, l.qty - 1)}
              >
                −
              </button>
              <span className="price w-6 text-center text-[13px]">{l.qty}</span>
              <button
                type="button"
                className="size-8 rounded-lg border border-line"
                onClick={() => setQty(l.slug, l.qty + 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <DutyCalculator price={subtotal} />
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur-md md:bottom-0">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <p className="price text-[18px] font-bold">${subtotal.toFixed(2)}</p>
          <Link
            href="/checkout"
            className="flex-1 rounded-xl bg-ink py-3.5 text-center text-[14px] font-bold text-white"
          >
            결제하기 (관세 포함 최종가)
          </Link>
        </div>
      </div>
    </>
  );
}
