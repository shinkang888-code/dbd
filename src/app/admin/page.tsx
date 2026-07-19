// filepath: src/app/admin/page.tsx
import { DataModeSwitch } from "@/components/data-mode-switch";
import { AdminShell } from "@/components/admin/admin-shell";
import { LegacyCommerceBanner } from "@/components/legacy-commerce-banner";
import { adminStats } from "@/lib/catalog";
import { requireSession } from "@/lib/auth/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

const CAFE24_ADMIN_URL =
  process.env.NEXT_PUBLIC_CAFE24_ADMIN_URL ?? "https://eclogin.cafe24.com/Shop/";

export default async function AdminPage() {
  const session = await requireSession();
  const stats = await adminStats();
  const cards = [
    { label: "Cafe24 상품·주문", value: "↗", href: CAFE24_ADMIN_URL, external: true },
    { label: "Studio 콘텐츠", value: "→", href: "/studio", external: false },
    { label: "Legacy 상품 preview", value: stats.products, href: "/admin/products", external: false },
    { label: "Legacy 주문 preview", value: stats.orders, href: "/admin/orders", external: false },
  ];

  return (
    <AdminShell>
      <LegacyCommerceBanner surface="admin" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-dim">
            {session?.user?.email ? (
              <>
                로그인: {session.user.email} · DB source: {stats.source}
                {"cafe24" in stats && stats.cafe24
                  ? ` · Cafe24: ${stats.cafe24.configured ? "ON" : "OFF"}`
                  : ""}
              </>
            ) : (
              <>
                <Link href="/auth/sign-in" className="font-bold text-coral">
                  로그인
                </Link>
                {" · "}
                <a href="/api/auth/demo?next=/admin" className="font-bold text-coral">
                  데모 로그인
                </a>
                {" "}후 관리 API 사용 · DB source: {stats.source}
              </>
            )}
          </p>
        </div>
        <DataModeSwitch />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((s) =>
          s.external ? (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-line p-4 hover:bg-fog"
            >
              <p className="text-[12px] font-medium text-dim">{s.label}</p>
              <p className="price mt-1 text-[26px] font-bold">{s.value}</p>
            </a>
          ) : (
            <Link key={s.label} href={s.href} className="rounded-2xl border border-line p-4 hover:bg-fog">
              <p className="text-[12px] font-medium text-dim">{s.label}</p>
              <p className="price mt-1 text-[26px] font-bold">{s.value}</p>
            </Link>
          ),
        )}
      </div>
      <p className="mt-8 rounded-xl bg-fog p-4 text-[13px] leading-relaxed text-dim">
        커머스 원장(상품·재고·주문·결제)은 <strong className="text-ink">Cafe24</strong>입니다. LEXI는
        Studio에서 디자인·PDP 콘텐츠를 제작·검수·게시하고, Dummy/Real 토글과 HQ 소싱은 운영 보조로
        유지합니다. 상세: <code>docs/lexi-cafe24-studio-master-spec.md</code>
      </p>
    </AdminShell>
  );
}
