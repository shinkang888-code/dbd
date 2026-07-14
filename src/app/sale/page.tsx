// filepath: src/app/sale/page.tsx
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog";

export const metadata = { title: "Sale" };

export default async function SalePage() {
  const onSale = (await listProducts({ saleOnly: true })).sort(
    (a, b) => b.discountRate - a.discountRate,
  );
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">
        Sale<span className="text-coral">.</span>
      </h1>
      <p className="mt-1 text-[13px] text-dim">최대 30% · 오늘 자정 마감 타임딜 포함</p>
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4">
        {onSale.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
