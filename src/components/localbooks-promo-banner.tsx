// filepath: src/components/localbooks-promo-banner.tsx
import { ArrowUpRight } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { LOBOOKS_PROMO_IMAGE, LOBOOKS_URL } from "@/lib/media";

/**
 * Footer 직전 파트너 배너 — 본문 ↔ 푸터 사이 full-bleed.
 * 관리자·로그인 화면에서는 숨김.
 */
export function LocalbooksPromoBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/admin") || pathname === "/login") return null;

  return (
    <aside className="mt-16 border-t border-border" aria-label="Localbooks 파트너 소개">
      <a
        href={LOBOOKS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[21/9] w-full min-h-[148px] max-h-[280px] sm:min-h-[168px] md:min-h-[200px] bg-[#1a120c]">
          <img
            src={LOBOOKS_PROMO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[38%_center] sm:object-center transition duration-700 group-hover:scale-[1.015]"
            decoding="async"
          />
          {/* 사진 속 고정 문구·CTA를 가리고, 사이트 오버레이 텍스트 대비 확보 */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/45 to-black/15 sm:via-black/35 sm:to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent sm:hidden"
            aria-hidden
          />

          <div className="relative z-[1] flex h-full flex-col justify-center px-[clamp(1rem,4vw,4rem)] py-[clamp(1rem,3vw,2.5rem)]">
            <p
              className="font-semibold tracking-[0.22em] text-[#f0c95a] uppercase"
              style={{ fontSize: "clamp(0.625rem, 1.4vw, 0.75rem)" }}
            >
              LOCALBOOKS PORTAL
            </p>
            <p
              className="mt-[clamp(0.35rem,1.2vw,0.75rem)] max-w-[18em] font-serif font-bold leading-[1.35] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]"
              style={{ fontSize: "clamp(1.05rem, 2.8vw + 0.55rem, 2.15rem)" }}
            >
              로컬북스: 누구나 작가가되는 동네책방
            </p>
            <span
              className="mt-[clamp(0.75rem,2vw,1.25rem)] inline-flex w-fit items-center gap-1.5 rounded-md bg-[#e8a317] px-[clamp(0.75rem,2vw,1.1rem)] py-[clamp(0.4rem,1.2vw,0.55rem)] font-semibold text-[#1a120c] shadow-sm transition group-hover:bg-[#f0b42a]"
              style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)" }}
            >
              방문하기
              <ArrowUpRight className="h-[1em] w-[1em] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </a>
    </aside>
  );
}
