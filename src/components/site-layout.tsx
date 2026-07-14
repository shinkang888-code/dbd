import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { FloatingRail } from "./floating-rail";
import { LocalbooksPromoBanner } from "./localbooks-promo-banner";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <LocalbooksPromoBanner />
      <SiteFooter />
      <FloatingRail />
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, image }: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-navy/70" />
        </div>
      )}
      {!image && <div className="absolute inset-0 bg-navy" />}
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        <p className="eyebrow-gold text-sm reveal">{eyebrow}</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight reveal reveal-delay-1">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base md:text-lg text-white/80 leading-relaxed reveal reveal-delay-2">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-6 py-16 md:py-20 scroll-mt-28 ${className}`}>
      {children}
    </section>
  );
}
