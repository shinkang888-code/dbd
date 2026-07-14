import Image from "next/image";
import { bySlug, finalPrice } from "@/lib/dummy-data";
import { DutyCalculator } from "@/components/duty-calculator";

export const metadata = { title: "Cart" };

export default function CartPage() {
  const items = [bySlug("glow-serum"), bySlug("velvet-tint")].filter((p) => p !== undefined);
  const subtotal = +items.reduce((s, p) => s + finalPrice(p), 0).toFixed(2);
  const toFree = Math.max(0, 49 - subtotal);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-32">
      <h1 className="font-display text-[30px] font-semibold">Cart</h1>

      {/* Goal Gradient — 장바구니에서만 재등장하는 임계값 바 (spec §3.4 #0) */}
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
        {items.map((p) => (
          <li key={p.slug} className="flex items-center gap-4 py-4">
            <span className="relative block size-20 shrink-0 overflow-hidden rounded-xl bg-fog">
              <Image src={p.image} alt="" fill sizes="80px" className="object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-dim">{p.brand}</p>
              <p className="truncate text-[14px]">{p.name}</p>
              <p className="price mt-1 text-[15px] font-bold">${finalPrice(p)}</p>
            </div>
            <span className="price rounded-lg border border-line px-3 py-1 text-[13px]">1</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <DutyCalculator price={subtotal} />
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur-md md:bottom-0">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <p className="price text-[18px] font-bold">${subtotal.toFixed(2)}</p>
          <button className="flex-1 rounded-xl bg-ink py-3.5 text-[14px] font-bold text-white">
            결제하기 (관세 포함 최종가)
          </button>
        </div>
      </div>
    </div>
  );
}
