// filepath: src/components/admin/admin-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품" },
  { href: "/admin/orders", label: "주문" },
  { href: "/admin/banners", label: "배너" },
  { href: "/admin/cafe24", label: "Cafe24" },
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
            const active = path === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  active ? "bg-ink text-white" : "text-dim hover:text-ink"
                }`}
              >
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
