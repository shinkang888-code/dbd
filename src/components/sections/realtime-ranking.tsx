import Link from "next/link";
import { products } from "@/lib/dummy-data";
import { ProductCard } from "@/components/product-card";

export function RealtimeRanking() {
  const ranked = [...products]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);

  return (
    <section aria-label="실시간 랭킹" className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-[20px] font-bold md:text-[24px]">지금 세계에서 가장 담긴</h2>
          <p className="mt-1 text-[13px] text-dim">최근 24시간 장바구니 기준</p>
        </div>
        <Link href="/best" className="text-[13px] font-semibold text-dim hover:text-ink">
          전체 랭킹 →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 lg:grid-cols-6">
        {ranked.map((p, i) => (
          <ProductCard key={p.slug} product={p} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
