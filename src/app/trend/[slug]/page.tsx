import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { heroSlides, products, shopTheLook } from "@/lib/dummy-data";
import { ProductCard } from "@/components/product-card";

const EDITORIALS = [
  ...heroSlides.map((s) => ({
    slug: s.id,
    title: s.headline.replace("\n", " "),
    sub: s.sub,
    image: s.image,
    href: s.href,
  })),
  {
    slug: "shop-the-look",
    title: shopTheLook.title,
    sub: "핀을 눌러 착장 그대로 담기",
    image: shopTheLook.image,
    href: "/",
  },
];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const ed = EDITORIALS.find((e) => e.slug === slug);
  return { title: ed ? `${ed.title} · Trend` : "Trend" };
}

export default async function TrendDetailPage({ params }: Props) {
  const { slug } = await params;
  const ed = EDITORIALS.find((e) => e.slug === slug);
  if (!ed) notFound();
  const picks = products.filter((p) => p.badge === "BEST" || p.badge === "NEW").slice(0, 4);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 pb-16">
      <p className="text-[12px] font-medium text-dim">
        <Link href="/trend" className="hover:text-coral">
          Trend
        </Link>{" "}
        / Editorial
      </p>
      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-3xl bg-fog">
        <Image src={ed.image} alt="" fill sizes="100vw" className="object-cover" priority />
      </div>
      <h1 className="mt-6 font-display text-[32px] font-semibold md:text-[40px]">{ed.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-dim">{ed.sub}</p>
      <Link href={ed.href} className="mt-6 inline-block rounded-xl bg-coral px-5 py-3 text-[13px] font-bold text-white">
        Shop the Edit
      </Link>
      <h2 className="mt-12 text-[15px] font-bold">Shop the Look</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {picks.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </article>
  );
}
