"use client";

import Link from "next/link";
import { Search, Heart, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { UtilityStrip } from "./utility-strip";
import { UserMenu } from "./user-menu";
import { CartBadge } from "./cart-badge";
import { DemoLoginButton } from "./demo-login-button";

const GNB = [
  { label: "Beauty", href: "/category/beauty" },
  { label: "Fashion", href: "/category/fashion" },
  { label: "Trend", href: "/trend" },
  { label: "Best", href: "/best" },
  { label: "Sale", href: "/sale" },
];

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const demoNext =
    pathname.startsWith("/studio") || pathname.startsWith("/admin")
      ? pathname
      : "/studio";

  return (
    <>
      <UtilityStrip />
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-display text-[26px] font-semibold tracking-tight">
            LEXI<span className="text-coral">.</span>
          </Link>

          <nav className="hidden gap-7 md:flex" aria-label="주 메뉴">
            {GNB.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className={`text-[15px] font-medium transition-colors hover:text-coral ${
                  m.label === "Sale" ? "text-coral" : "text-ink"
                }`}
              >
                {m.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DemoLoginButton
              next={demoNext}
              className="rounded-full bg-coral px-3 py-1.5 text-[12px] font-bold text-white hover:opacity-90"
            />
            <UserMenu />
            <Link href="/search" aria-label="검색" className="grid size-11 place-items-center rounded-full hover:bg-fog">
              <Search className="size-[22px]" strokeWidth={1.7} />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label="위시리스트"
              className="hidden size-11 place-items-center rounded-full hover:bg-fog md:grid"
            >
              <Heart className="size-[22px]" strokeWidth={1.7} />
            </Link>
            <Link href="/cart" aria-label="장바구니" className="relative grid size-11 place-items-center rounded-full hover:bg-fog">
              <ShoppingBag className="size-[22px]" strokeWidth={1.7} />
              <CartBadge />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
