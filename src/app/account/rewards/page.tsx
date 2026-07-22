import Link from "next/link";

export const metadata = { title: "LEXI Rewards" };

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-16">
      <h1 className="font-display text-[30px] font-semibold">Rewards</h1>
      <p className="mt-1 text-[13px] text-dim">
        LEXI Points · 등급 — Cafe24 회원 연동 전 preview
      </p>
      <div className="mt-8 rounded-3xl border border-line bg-fog p-6">
        <p className="text-[12px] font-bold uppercase tracking-wide text-gold">Bronze</p>
        <p className="mt-2 font-display text-[40px] font-semibold text-ink">0 pts</p>
        <p className="mt-2 text-[13px] text-dim">
          구매·리뷰·UGC로 포인트를 적립할 수 있습니다. 실운영 원장은 Cafe24 회원/적립과
          연동됩니다.
        </p>
      </div>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line">
        {[
          { tier: "Bronze", need: "가입" },
          { tier: "Silver", need: "누적 $200" },
          { tier: "Gold", need: "누적 $600" },
        ].map((row) => (
          <li key={row.tier} className="flex justify-between p-4 text-[14px]">
            <span className="font-semibold">{row.tier}</span>
            <span className="text-dim">{row.need}</span>
          </li>
        ))}
      </ul>
      <Link href="/account/orders" className="mt-6 inline-block text-[13px] font-bold text-coral">
        주문 내역 →
      </Link>
    </div>
  );
}
