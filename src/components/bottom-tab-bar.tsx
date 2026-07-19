"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Users, User } from "lucide-react";

const TABS = [
  { label: "홈", href: "/", icon: Home },
  { label: "카테고리", href: "/category/beauty", icon: LayoutGrid, match: "/category" },
  { label: "검색", href: "/search", icon: Search },
  { label: "커뮤니티", href: "/community", icon: Users },
  { label: "마이", href: "/account", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/studio")) {
    return null;
  }
  return (
    <nav
      aria-label="하단 탭"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        {TABS.map((t) => {
          const active =
            t.href === "/" ? pathname === "/" : pathname.startsWith(t.match ?? t.href);
          const Icon = t.icon;
          return (
            <Link
              key={t.label}
              href={t.href}
              className={`flex flex-col items-center justify-center gap-1 ${
                active ? "text-ink" : "text-dim"
              }`}
            >
              <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.7} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
