"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Timer } from "lucide-react";
import { bySlug, finalPrice, timeDealSlugs } from "@/lib/dummy-data";

function useCountdown() {
  const [left, setLeft] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0); // 자정 마감 롤링 딜
      const d = Math.max(0, end.getTime() - now.getTime());
      const h = String(Math.floor(d / 3.6e6)).padStart(2, "0");
      const m = String(Math.floor((d % 3.6e6) / 6e4)).padStart(2, "0");
      const s = String(Math.floor((d % 6e4) / 1e3)).padStart(2, "0");
      setLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

/** 뷰포트당 유일한 코랄 대면적 — Single Persuasion per Viewport. spec §3.4 #5 */
export function TimeDeal() {
  const left = useCountdown();
  const deals = timeDealSlugs.map(bySlug).filter((p) => p !== undefined);

  return (
    <section aria-label="타임딜" className="bg-coral py-9 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Timer className="size-6" strokeWidth={2} />
            <h2 className="text-[20px] font-bold md:text-[24px]">오늘 자정까지, 최대 30%</h2>
          </div>
          <p className="price rounded-lg bg-white/15 px-3 py-1.5 text-[18px] font-bold tabular-nums">
            {left}
          </p>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {deals.map((p) => (
            <Link
              key={p.slug}
              href={`/product/${p.slug}`}
              className="w-40 shrink-0 rounded-xl bg-white p-2.5 text-ink shadow-sm md:w-52"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-fog">
                <Image src={p.image} alt={p.name} fill sizes="200px" className="object-cover" />
              </div>
              <p className="mt-2 line-clamp-1 text-[13px]">{p.name}</p>
              <p className="price mt-0.5 text-[15px] font-bold">
                <span className="text-coral">{p.discountRate}%</span> ${finalPrice(p)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
