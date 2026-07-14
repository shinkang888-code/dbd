import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { finalPrice, type Product } from "@/lib/dummy-data";

/** 카드 정보는 이미지·브랜드·상품명·가격·♥ 5요소로 제한 — spec §3.4 #4 */
export function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const discounted = product.discountRate > 0;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-fog">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {rank !== undefined && (
          <span className="price absolute left-2 top-2 grid size-7 place-items-center rounded-md bg-ink/85 text-[13px] font-bold text-white">
            {rank}
          </span>
        )}
        {product.badge && (
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
              product.badge === "DEAL" ? "bg-coral text-white" : "bg-white/90 text-ink"
            }`}
          >
            {product.badge}
          </span>
        )}
        <button
          aria-label="위시리스트에 담기"
          className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full bg-white/90 text-ink opacity-90 shadow-sm"
        >
          <Heart className="size-4.5" strokeWidth={1.8} />
        </button>
      </div>
      <div className="mt-2.5 space-y-0.5 px-0.5">
        <p className="text-[11px] font-bold tracking-wide text-dim">{product.brand}</p>
        <p className="line-clamp-1 text-[14px] leading-snug">{product.name}</p>
        <p className="price flex items-baseline gap-1.5 pt-0.5 text-[16px] font-semibold">
          {discounted && <span className="text-coral">{product.discountRate}%</span>}
          <span>${finalPrice(product)}</span>
          {discounted && (
            <span className="text-[12px] font-normal text-dim line-through">
              ${product.price}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
