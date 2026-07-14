import Image from "next/image";
import Link from "next/link";
import { categoryChips } from "@/lib/dummy-data";

/** 원형 실사 썸네일 칩 — Picture Superiority Effect. spec §3.4 #3 */
export function CategoryChips() {
  return (
    <section aria-label="카테고리 바로가기" className="mx-auto max-w-6xl px-4 py-7">
      <div className="no-scrollbar flex gap-5 overflow-x-auto md:justify-center">
        {categoryChips.map((c) => (
          <Link key={c.label} href={c.href} className="group flex w-16 shrink-0 flex-col items-center gap-2">
            <span className="relative block size-16 overflow-hidden rounded-full ring-1 ring-line transition-shadow group-hover:ring-2 group-hover:ring-ink">
              <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="text-[12px] font-medium text-ink">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
