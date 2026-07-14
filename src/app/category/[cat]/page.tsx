import { notFound } from "next/navigation";
import { products } from "@/lib/dummy-data";
import { ProductCard } from "@/components/product-card";

const TITLES: Record<string, string> = {
  beauty: "Beauty",
  fashion: "Fashion",
  life: "Life",
  kids: "Kids",
};

export function generateStaticParams() {
  return Object.keys(TITLES).map((cat) => ({ cat }));
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const title = TITLES[cat];
  if (!title) notFound();

  const items = products.filter((p) => p.category === cat);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">{title}</h1>
      <p className="mt-1 text-[13px] text-dim">{items.length}개 상품 · 관세 포함가 표시</p>
      {items.length === 0 ? (
        <p className="mt-16 text-center text-dim">곧 새로운 셀렉션이 도착합니다.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
