import Link from "next/link";
import { products } from "@/lib/dummy-data";
import { ProductCard } from "@/components/product-card";

export const metadata = { title: "New Arrivals" };

export default function NewArrivalsPage() {
  const items = [...products].filter((p) => p.badge === "NEW" || p.badge === "BEST").reverse();
  const byDay = [
    { label: "오늘", items: items.slice(0, 4) },
    { label: "이번 주", items: items.slice(4, 8) },
    { label: "이번 달", items: items.slice(8) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-16">
      <h1 className="font-display text-[30px] font-semibold">New</h1>
      <p className="mt-1 text-[13px] text-dim">일자별 신상품 타임라인</p>
      <div className="mt-8 space-y-10">
        {byDay.map((day) =>
          day.items.length ? (
            <section key={day.label}>
              <h2 className="text-[15px] font-bold">{day.label}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {day.items.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          ) : null,
        )}
      </div>
      {!items.length && (
        <p className="mt-8 rounded-2xl bg-fog p-8 text-center text-[14px] text-dim">
          신상품이 없습니다.{" "}
          <Link href="/best" className="font-bold text-coral">
            Best →
          </Link>
        </p>
      )}
    </div>
  );
}
