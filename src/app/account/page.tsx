import Link from "next/link";
import { Package, Heart, Crown, Star, Settings, ChevronRight } from "lucide-react";

export const metadata = { title: "My LEXI" };

const MENU = [
  { icon: Package, label: "주문 / 배송 추적", href: "/account", meta: "배송중 1" },
  { icon: Heart, label: "위시리스트", href: "/account", meta: "12" },
  { icon: Crown, label: "LEXI Rewards", href: "/account", meta: "Gold · 2,840P" },
  { icon: Star, label: "내 리뷰", href: "/account", meta: "5" },
  { icon: Settings, label: "설정 · 주소록 · 통화", href: "/account" },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">My LEXI</h1>
      <div className="mt-3 rounded-2xl bg-ink p-5 text-white">
        <p className="text-[13px] text-white/70">환영합니다</p>
        <p className="mt-0.5 text-[18px] font-bold">Guest Shopper</p>
        <p className="price mt-3 inline-block rounded-full bg-gold/20 px-3 py-1 text-[12px] font-bold text-gold">
          ✦ Gold — 다음 등급까지 $160
        </p>
      </div>
      <ul className="mt-5 divide-y divide-line rounded-2xl border border-line">
        {MENU.map((m) => (
          <li key={m.label}>
            <Link href={m.href} className="flex items-center gap-3.5 p-4 hover:bg-fog">
              <m.icon className="size-5 text-dim" strokeWidth={1.7} />
              <span className="flex-1 text-[14px] font-medium">{m.label}</span>
              {m.meta && <span className="text-[12px] font-semibold text-dim">{m.meta}</span>}
              <ChevronRight className="size-4 text-dim" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
