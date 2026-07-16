// filepath: src/components/admin/admin-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Cafe24 관리자 대시보드(새 탭). 배포마다 NEXT_PUBLIC_CAFE24_ADMIN_URL 로 덮어쓸 수 있음.
const CAFE24_ADMIN_URL =
  process.env.NEXT_PUBLIC_CAFE24_ADMIN_URL ??
  "https://partnersc88.cafe24.com/disp/admin/shop1/main/dashboard";

type Tab = { href: string; label: string; external?: boolean };

const TABS: Tab[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품" },
  { href: "/admin/orders", label: "주문" },
  { href: "/admin/banners", label: "배너" },
  { href: CAFE24_ADMIN_URL, label: "Cafe24 ↗", external: true },
  { href: "/admin/cafe24", label: "Cafe24 API" },
  { href: "/admin/sourcing", label: "역직구" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-semibold">LEXI Admin</h1>
          <p className="mt-1 text-[13px] text-dim">쇼핑몰 백엔드 · Neon · Google Auth</p>
        </div>
        <nav className="flex gap-1 rounded-full border border-line bg-fog p-1">
          {TABS.map((t) => {
            const cls = `rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              path === t.href ? "bg-ink text-white" : "text-dim hover:text-ink"
            }`;
            // Cafe24 관리자: 새 탭으로 외부 대시보드 열기
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
      <div className="mt-6">{children}</div>
    </div>
  );
}
