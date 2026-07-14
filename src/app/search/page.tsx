import { Search } from "lucide-react";
import { products } from "@/lib/dummy-data";
import { ProductCard } from "@/components/product-card";

export const metadata = { title: "Search" };

export default function SearchPage() {
  const trending = ["글로우 세럼", "크림 니트", "쿠션", "달항아리 머그", "트렌치"];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <label className="flex items-center gap-3 rounded-2xl border border-line bg-fog px-4 py-3.5">
        <Search className="size-5 text-dim" />
        <input
          type="search"
          placeholder="브랜드, 상품, #LEXILOOK 검색"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-dim"
        />
      </label>
      <div className="mt-5">
        <p className="text-[12px] font-bold text-dim">지금 뜨는 검색어</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {trending.map((t, i) => (
            <span key={t} className="rounded-full border border-line px-3.5 py-1.5 text-[13px]">
              <span className="price mr-1.5 font-bold text-coral">{i + 1}</span>
              {t}
            </span>
          ))}
        </div>
      </div>
      <h2 className="mb-4 mt-9 text-[16px] font-bold">많이 찾는 상품</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
