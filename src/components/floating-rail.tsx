import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileUp, UserPlus, BookOpen, MapPin, ChevronUp } from "lucide-react";
import { SUBMISSION_PORTAL_URL } from "@/lib/media";

/**
 * Right-edge vertical quick-action rail. Surfaces the society's primary
 * conversion paths on every page with an entrance slide-in, hover expand,
 * and a gentle pulse on the two key CTAs.
 */
const ITEMS = [
  {
    label: "논문투고",
    href: SUBMISSION_PORTAL_URL,
    external: true as const,
    Icon: FileUp,
    bg: "bg-primary",
    pulse: true,
  },
  {
    label: "회원가입",
    to: "/register",
    Icon: UserPlus,
    bg: "bg-indigo",
    pulse: true,
  },
  {
    label: "학술지",
    to: "/journal",
    Icon: BookOpen,
    bg: "bg-navy",
    pulse: false,
  },
  {
    label: "오시는길",
    to: "/about",
    hash: "location",
    Icon: MapPin,
    bg: "bg-navy",
    pulse: false,
  },
] as const;

export function FloatingRail() {
  const [showTop, setShowTop] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 300);
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col overflow-hidden rounded-l-xl shadow-elevated transition-transform duration-500 ease-out md:flex ${
        entered ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {ITEMS.map((item) => {
        const { label, Icon, bg, pulse } = item;
        const className = `group relative flex w-[72px] flex-col items-center gap-1.5 px-2 py-4 text-[11px] font-semibold text-white/90 transition-all duration-200 hover:w-[84px] hover:text-white ${bg}`;
        const inner = (
          <>
            <span className="relative">
              <Icon className="h-5 w-5 opacity-90 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />
              {pulse && (
                <span className="absolute -right-1.5 -top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
              )}
            </span>
            {label}
          </>
        );

        if ("external" in item && item.external) {
          return (
            <a
              key={label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          );
        }

        return (
          <Link
            key={label}
            to={(item as { to: string }).to as any}
            hash={"hash" in item ? ((item as { hash?: string }).hash as any) : undefined}
            className={className}
          >
            {inner}
          </Link>
        );
      })}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`flex w-[72px] flex-col items-center gap-1 bg-foreground/90 px-2 py-3.5 text-[11px] font-semibold text-white/80 transition-all duration-300 hover:text-white ${
          showTop ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
        aria-label="맨 위로"
      >
        <ChevronUp className="h-4 w-4" />
        Top
      </button>
    </div>
  );
}
