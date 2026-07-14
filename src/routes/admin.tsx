import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { BoardDataModeSwitch } from "@/components/admin/board-data-mode-switch";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/roles";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Users,
  Megaphone,
  Loader2,
  Menu,
  X,
  Pencil,
  BookOpen,
} from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    pageHead({
      path: "/admin",
      title: "관리자 콘솔 — KSAC",
      robots: "noindex,nofollow",
    }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { to: "/admin/notices", label: "공지사항", icon: Megaphone },
  { to: "/admin/resources", label: "자료실", icon: FolderOpen },
  { to: "/admin/gallery", label: "갤러리", icon: ImageIcon },
  { to: "/admin/banners", label: "배너", icon: FileText },
  { to: "/admin/pages", label: "페이지 편집", icon: Pencil },
  { to: "/admin/journal", label: "학술지", icon: BookOpen },
  { to: "/admin/members", label: "회원 관리", icon: Users },
];

function AdminLayout() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const { isAdmin, loading: al } = useIsAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (loading || al) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      nav({ to: "/" });
      return;
    }
  }, [loading, al, user, isAdmin, nav]);

  if (loading || al || !isAdmin) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
          <div className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> 확인 중...
          </div>
        </div>
      </SiteLayout>
    );
  }

  const NavLinks = (
    <nav className="space-y-1">
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to as any}
            onClick={() => setMobileNav(false)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-primary text-primary-foreground" : "text-white/75 hover:bg-white/10"
            }`}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 grid md:grid-cols-[220px_1fr] gap-6">
        <div className="md:hidden">
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold"
          >
            {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} 관리 메뉴
          </button>
          {mobileNav && <aside className="mt-3 rounded-xl bg-navy text-white p-4">{NavLinks}</aside>}
        </div>

        <aside className="hidden md:block rounded-xl bg-navy text-white p-4 h-fit md:sticky md:top-24">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs uppercase tracking-wider text-white/60">Admin Console</div>
            <div className="mt-1 font-bold">KSAC 관리자</div>
          </div>
          {NavLinks}
        </aside>

        <main className="min-w-0">
          <BoardDataModeSwitch />
          <Outlet />
        </main>
      </div>
    </SiteLayout>
  );
}
