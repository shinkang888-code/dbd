import Link from "next/link";
import { ShieldCheck, Plane, RotateCcw } from "lucide-react";
import { LexiMark } from "@/components/lexi-mark";

const TRUST = [
  { icon: ShieldCheck, title: "정품 직소싱", desc: "브랜드 본사와 직계약, 100% 정품 보증" },
  { icon: Plane, title: "관세 사전계산", desc: "결제 전 관세 포함 총액을 먼저 확인" },
  { icon: RotateCcw, title: "15일 무료반품", desc: "단순 변심도 15일 이내 무료 반품" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-fog">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        {TRUST.map((t) => (
          <div key={t.title} className="flex items-start gap-3">
            <t.icon className="mt-0.5 size-6 shrink-0 text-sage" strokeWidth={1.6} />
            <div>
              <p className="text-[14px] font-bold">{t.title}</p>
              <p className="mt-0.5 text-[13px] text-dim">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-[12px] text-dim">
          <p className="flex items-center gap-2 font-display text-[18px] font-semibold text-ink">
            <LexiMark size={26} className="text-dim" gap="#f5f5f3" />
            LEXI<span className="text-coral">.</span>
          </p>
          <nav className="flex gap-4">
            <Link href="/support">Support</Link>
            <Link href="/support">Shipping & Duties</Link>
            <Link href="/brands">Brands</Link>
            <Link href="/admin">Admin</Link>
          </nav>
          <p>© 2026 LEXI. Curated K-Style, Delivered Worldwide.</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-6 text-[11px] leading-relaxed text-dim">
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <span>파트너스 사회적협동조합</span>
            <span>대표 강준철</span>
            <span>사업자등록번호 589-82-00469</span>
            <span>법인등록번호 220151-0022471</span>
          </p>
          <p className="mt-1">제주특별자치도 제주시 구남로7길 33, 7층 703-2호(이도이동, 하늘그린)</p>
          <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-dim/80">
            <LexiMark size={14} className="text-dim/70" gap="#f5f5f3" />
            LEXI는 파트너스 사회적협동조합이 운영하는 역직구 커머스 브랜드입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
