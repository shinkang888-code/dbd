import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Camera, ShieldCheck } from "lucide-react";
import { DutyCalculator } from "@/components/duty-calculator";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { finalPrice, getProductBySlug, listProducts } from "@/lib/catalog";
import { products as dummyProducts } from "@/lib/dummy-data";

export function generateStaticParams() {
  return dummyProducts.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = finalPrice(product);
  const all = await listProducts();
  const related = all
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <article className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:grid md:grid-cols-2 md:gap-10 md:pt-8">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-fog">
        <Image src={product.image} alt={product.name} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
      </div>

      <div className="pt-5 md:pt-0">
        <p className="text-[12px] font-bold tracking-wide text-dim">{product.brand}</p>
        <h1 className="mt-1 text-[22px] font-bold leading-snug md:text-[26px]">{product.name}</h1>

        {/* 리뷰 요약 상단 승격 — YesStyle 대비 핵심 개선 */}
        <div className="mt-2.5 flex items-center gap-3 text-[13px]">
          <span className="flex items-center gap-1 font-bold">
            <Star className="size-4 fill-gold text-gold" /> {product.rating}
          </span>
          <Link href="#reviews" className="text-dim underline underline-offset-4">
            리뷰 {product.reviewCount.toLocaleString()}개
          </Link>
          <span className="flex items-center gap-1 text-dim">
            <Camera className="size-3.5" /> 사진 리뷰 {Math.round(product.reviewCount * 0.3).toLocaleString()}
          </span>
        </div>

        <p className="price mt-4 flex items-baseline gap-2 text-[26px] font-bold">
          {product.discountRate > 0 && <span className="text-coral">{product.discountRate}%</span>}
          <span>${price}</span>
          {product.discountRate > 0 && (
            <span className="text-[15px] font-normal text-dim line-through">${product.price}</span>
          )}
        </p>

        <div className="mt-5">
          <DutyCalculator price={price} />
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-[12px] font-semibold text-sage">
          <ShieldCheck className="size-4" /> 브랜드 본사 직소싱 정품 · 15일 무료 반품
        </p>

        <div className="prose-sm mt-6 border-t border-line pt-6 text-[14px] leading-relaxed text-dim">
          서울에서 이번 주 출고되는 {product.brand}의 시그니처 라인입니다. 모든 로트는 출고 전
          이중 검수를 거치며, 국제 배송 전용 완충 패키지로 포장됩니다.
        </div>
      </div>

      <section id="reviews" className="mt-12 md:col-span-2">
        <h2 className="text-[18px] font-bold">고객 리뷰</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { name: "Emily · 🇺🇸", body: "세 번째 재구매예요. 통관 지연 한 번도 없었고 관세 계산이 정확해서 신뢰가 갑니다." },
            { name: "Yuki · 🇯🇵", body: "現地より早く届いてびっくり。パッケージも丁寧でした。" },
            { name: "Sarah · 🇸🇬", body: "Exactly as described. The duty-included price is a game changer." },
          ].map((r) => (
            <blockquote key={r.name} className="rounded-xl bg-fog p-4 text-[13px] leading-relaxed">
              <p className="mb-2 flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-gold" />
                ))}
              </p>
              <p>{r.body}</p>
              <footer className="mt-2 font-semibold text-dim">{r.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mt-12 md:col-span-2">
        <h2 className="mb-4 text-[18px] font-bold">함께 본 상품</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Sticky CTA — Thumb Zone. spec §3.4 PDP */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur-md md:bottom-0">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p className="price hidden text-[18px] font-bold sm:block">${price}</p>
          <Link
            href="/checkout"
            className="flex-1 rounded-xl border border-ink py-3.5 text-center text-[14px] font-bold transition-colors hover:bg-fog"
          >
            바로 구매
          </Link>
          <div className="flex-1 [&_button]:rounded-xl [&_button]:bg-coral [&_button]:hover:bg-coral-deep">
            <AddToCartButton slug={product.slug} />
          </div>
        </div>
      </div>
    </article>
  );
}
