// filepath: src/app/account/page.tsx
import Link from "next/link";
import { Package, Heart, Crown, Star, Settings, ChevronRight, LogIn } from "lucide-react";
import { requireSession } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "My LEXI" };

export default async function AccountPage() {
  const session = await requireSession();
  const user = session?.user;

  const MENU = [
    { icon: Package, label: "주문 / 배송 추적", href: "/account/orders", meta: user ? undefined : "로그인 권장" },
    { icon: Heart, label: "위시리스트", href: "/account/wishlist" },
    { icon: Crown, label: "LEXI Rewards", href: "/account", meta: user ? "Bronze" : undefined },
    { icon: Star, label: "내 리뷰", href: "/account" },
    { icon: Settings, label: "계정 설정", href: "/account/settings" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">My LEXI</h1>
      <div className="mt-3 rounded-2xl bg-ink p-5 text-white">
        {user ? (
          <>
            <p className="text-[13px] text-white/70">환영합니다</p>
            <p className="mt-0.5 text-[18px] font-bold">{user.name || user.email}</p>
            <p className="mt-1 text-[12px] text-white/60">{user.email}</p>
            <p className="price mt-3 inline-block rounded-full bg-gold/20 px-3 py-1 text-[12px] font-bold text-gold">
              ✦ Google 연동 계정
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] text-white/70">Guest Shopper</p>
            <p className="mt-0.5 text-[18px] font-bold">로그인하고 주문을 추적하세요</p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-ink"
            >
              <LogIn className="size-4" /> Google로 로그인
            </Link>
          </>
        )}
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
