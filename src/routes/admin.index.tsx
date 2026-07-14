import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { countBoardRows, listBoardRows } from "@/lib/board-db";
import { Users, Megaphone, FolderOpen, Image as ImageIcon, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function useBoardCount(table: "notices" | "resources" | "gallery") {
  return useQuery({
    queryKey: ["neon", table, "count"],
    queryFn: async () => countBoardRows({ data: { table } }),
  });
}

function useBoardRecent(table: "notices" | "resources" | "gallery") {
  return useQuery({
    queryKey: ["neon", table, "recent"],
    queryFn: async () => {
      const res = await listBoardRows({ data: { table, admin: true } });
      return (res.rows ?? []).slice(0, 5);
    },
  });
}

function Dashboard() {
  const notices = useBoardCount("notices");
  const resources = useBoardCount("resources");
  const gallery = useBoardCount("gallery");
  const members = useQuery({
    queryKey: ["profiles", "count"],
    queryFn: async () => (await supabase.from("profiles").select("*", { count: "exact", head: true })).count ?? 0,
  });

  const recentNotices = useBoardRecent("notices");
  const recentMembers = useQuery({
    queryKey: ["profiles", "recent"],
    queryFn: async () =>
      (
        await supabase
          .from("profiles")
          .select("id,email,full_name,affiliation,created_at,approved")
          .order("created_at", { ascending: false })
          .limit(5)
      ).data ?? [],
  });

  const cards = [
    { label: "공지사항", value: notices.data ?? 0, icon: Megaphone, to: "/admin/notices", write: "/news/new" },
    { label: "자료실", value: resources.data ?? 0, icon: FolderOpen, to: "/admin/resources", write: "/journal/new" },
    { label: "갤러리", value: gallery.data ?? 0, icon: ImageIcon, to: "/admin/gallery", write: "/gallery/new" },
    { label: "회원", value: members.data ?? 0, icon: Users, to: "/admin/members", write: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow text-xs">Dashboard</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">대시보드</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/news/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 공지 쓰기
          </Link>
          <Link
            to="/journal/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> 자료 쓰기
          </Link>
          <Link
            to="/gallery/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> 갤러리 쓰기
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to as any}
            className="rounded-xl bg-white border border-border p-5 shadow-card hover:shadow-elevated transition"
          >
            <c.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-xs text-muted-foreground">{c.label}</div>
            <div className="text-2xl font-bold text-foreground">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-border p-5 shadow-card">
          <h2 className="font-bold text-foreground mb-3">최근 공지사항</h2>
          <ul className="divide-y divide-border">
            {(recentNotices.data ?? []).map((n: any) => (
              <li key={n.id} className="py-2.5 flex justify-between items-center gap-3">
                <Link to="/news/$id" params={{ id: n.id }} className="text-sm text-foreground hover:text-primary truncate">
                  {n.title}
                </Link>
                <span className="text-xs text-muted-foreground">{String(n.created_at).slice(0, 10)}</span>
              </li>
            ))}
            {(recentNotices.data ?? []).length === 0 && (
              <li className="py-4 text-sm text-muted-foreground">공지가 없습니다.</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl bg-white border border-border p-5 shadow-card">
          <h2 className="font-bold text-foreground mb-3">최근 가입 회원</h2>
          <ul className="divide-y divide-border">
            {(recentMembers.data ?? []).map((m: any) => (
              <li key={m.id} className="py-2.5 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{m.full_name || m.email}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.affiliation ?? "-"}</div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-md ${m.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                >
                  {m.approved ? "승인" : "대기"}
                </span>
              </li>
            ))}
            {(recentMembers.data ?? []).length === 0 && (
              <li className="py-4 text-sm text-muted-foreground">회원이 없습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
