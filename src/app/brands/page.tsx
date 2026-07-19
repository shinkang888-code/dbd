import Link from "next/link";
import { products } from "@/lib/dummy-data";
import { brandSlug } from "@/lib/brand-slug";

export const metadata = { title: "Brands" };

export default function BrandsPage() {
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">Brands A–Z</h1>
      <ul className="mt-6 divide-y divide-line rounded-2xl border border-line">
        {brands.map((b) => (
          <li key={b}>
            <Link
              href={`/brands/${brandSlug(b)}`}
              className="flex items-center justify-between p-4 hover:bg-fog"
            >
              <span className="text-[15px] font-semibold">{b}</span>
              <span className="text-[12px] text-dim">
                {products.filter((p) => p.brand === b).length} products →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
