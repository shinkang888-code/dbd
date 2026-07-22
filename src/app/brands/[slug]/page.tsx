import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/dummy-data";
import { ProductCard } from "@/components/product-card";
import { brandSlug } from "@/lib/brand-slug";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const brand = products.find((p) => brandSlug(p.brand) === slug)?.brand;
  return { title: brand ? `${brand} · Brands` : "Brand" };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;
  const brand = products.find((p) => brandSlug(p.brand) === slug)?.brand;
  if (!brand) notFound();
  const items = products.filter((p) => p.brand === brand);
  const hero = items[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-16">
      <p className="text-[12px] font-medium text-dim">
        <Link href="/brands" className="hover:text-coral">
          Brands
        </Link>{" "}
        / {brand}
      </p>
      <div className="relative mt-4 overflow-hidden rounded-3xl bg-fog">
        <div className="relative aspect-[21/9] min-h-[180px]">
          <Image src={hero.image} alt={brand} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10">
            <h1 className="font-display text-[34px] font-semibold text-white md:text-[48px]">{brand}</h1>
            <p className="mt-2 max-w-lg text-[14px] text-white/85">
              {brand}의 베스트 라인업 — LEXI 큐레이션
            </p>
          </div>
        </div>
      </div>
      <h2 className="mt-10 text-[15px] font-bold">라인업 · {items.length}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
