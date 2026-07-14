// filepath: src/app/best/page.tsx
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog";

export const metadata = { title: "Best" };

export default async function BestPage() {
  const all = await listProducts();
  const ranked = [...all].sort((a, b) => b.reviewCount - a.reviewCount);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">Real-time Best</h1>
      <p className="mt-1 text-[13px] text-dim">최근 24시간 · 전 세계 장바구니 기준</p>
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4">
        {ranked.map((p, i) => (
          <ProductCard key={p.slug} product={p} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
