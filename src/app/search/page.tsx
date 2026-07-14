// filepath: src/app/search/page.tsx
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { listProducts, searchProducts } from "@/lib/catalog";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const trending = ["글로우 세럼", "크림 니트", "쿠션", "달항아리 머그", "트렌치"];
  const results = q ? await searchProducts(q) : (await listProducts()).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <form>
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-fog px-4 py-3.5">
          <Search className="size-5 text-dim" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="브랜드, 상품, #LEXILOOK 검색"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-dim"
          />
        </label>
      </form>
      <div className="mt-5">
        <p className="text-[12px] font-bold text-dim">지금 뜨는 검색어</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {trending.map((t, i) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="rounded-full border border-line px-3.5 py-1.5 text-[13px]"
            >
              <span className="price mr-1.5 font-bold text-coral">{i + 1}</span>
              {t}
            </Link>
          ))}
        </div>
      </div>
      <h2 className="mb-4 mt-9 text-[16px] font-bold">
        {q ? `"${q}" 검색 결과 (${results.length})` : "많이 찾는 상품"}
      </h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
