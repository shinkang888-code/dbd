"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LexiMark } from "@/components/lexi-mark";
import { DemoLoginButton } from "@/components/demo-login-button";

const CAFE24_ADMIN_URL =
  process.env.NEXT_PUBLIC_CAFE24_ADMIN_URL ?? "https://eclogin.cafe24.com/Shop/";
const MALL_URL = process.env.NEXT_PUBLIC_MALL_URL ?? "http://localhost:3000";

type Tab = { href: string; label: string; external?: boolean };

const TABS: Tab[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/studio", label: "LEXI Studio" },
  { href: CAFE24_ADMIN_URL, label: "상품·주문·배송 ↗", external: true },
  { href: MALL_URL, label: "고객 몰 ↗", external: true },
  { href: "/studio/cafe24", label: "Cafe24 연결" },
  { href: "/admin/sourcing", label: "역직구" },
  { href: "/admin/ledger", label: "분산원장" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-[30px] font-semibold">
            <LexiMark size={34} className="text-dim" />
            LEXI Admin
          </h1>
          <p className="mt-1 text-[13px] text-dim">
            dbd · Cafe24 커머스 · Studio 콘텐츠 · HDL 분산원장
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemoLoginButton next={path || "/admin"} />
          <nav className="flex gap-1 rounded-full border border-line bg-fog p-1">
            {TABS.map((t) => {
              const active =
                t.href === "/admin"
                  ? path === "/admin"
                  : path === t.href || path.startsWith(`${t.href}/`);
              const cls = `rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                active ? "bg-ink text-white" : "text-dim hover:text-ink"
              }`;
              if (t.external) {
                return (
                  <a key={t.href} href={t.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {t.label}
                  </a>
                );
              }
              return (
                <Link key={t.href} href={t.href} className={cls}>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
