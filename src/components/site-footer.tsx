import { Link } from "@tanstack/react-router";
import { MEDIA } from "@/lib/media";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3">
            <img
              src={MEDIA.logo}
              alt="KSAC"
              className="h-10 w-10 rounded-xl object-cover border border-border bg-white"
            />
            <div>
              <div className="text-foreground font-bold">대한학술융합학회</div>
              <div className="mt-1 text-xs font-semibold tracking-wider text-primary uppercase">KSAC</div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                서울특별시 서초구 서초중앙로22길 47, 인스161호 (서초동, 문화빌딩)
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">© KSAC. All Rights Reserved.</div>
        </div>
      </div>
    </footer>
  );
}
