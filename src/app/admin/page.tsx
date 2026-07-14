// filepath: src/app/admin/page.tsx
import { DataModeSwitch } from "@/components/data-mode-switch";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminStats } from "@/lib/catalog";
import { requireSession } from "@/lib/auth/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await requireSession();
  const stats = await adminStats();
  const cards = [
    { label: "상품", value: stats.products, href: "/admin/products" },
    { label: "브랜드", value: stats.brands, href: "/admin/products" },
    { label: "주문", value: stats.orders, href: "/admin/orders" },
    { label: "회원", value: stats.users, href: "/admin/orders" },
  ];

  return (
    <AdminShell>
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
                  Google 로그인
                </Link>
                후 관리 API 사용 · DB source: {stats.source}
              </>
            )}
          </p>
        </div>
        <DataModeSwitch />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line p-4 hover:bg-fog">
            <p className="text-[12px] font-medium text-dim">{s.label}</p>
            <p className="price mt-1 text-[26px] font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 rounded-xl bg-fog p-4 text-[13px] leading-relaxed text-dim">
        쇼핑몰 백엔드는 Medusa/Saleor 수준의 커머스 도메인(상품·주문·배너)을 Drizzle + Neon으로
        이식했습니다. 프론트 PLP/PDP/Cart/Checkout과 Admin CRUD가 동일 스키마를 공유합니다. Real
        모드: <code>docs/lexi-master-spec.md §4.3</code>
      </p>
    </AdminShell>
  );
}
