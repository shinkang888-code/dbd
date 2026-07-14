import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ShieldCheck, Shield, Search, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/members")({
  component: Members,
});

function Members() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "admin">("all");
  const [confirm, setConfirm] = useState<{ type: "approve" | "admin"; member: any; next: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const members = useQuery({
    queryKey: ["profiles", "admin"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const roles = useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => (await supabase.from("user_roles").select("user_id,role")).data ?? [],
  });

  const roleMap = new Map<string, string[]>();
  (roles.data ?? []).forEach((r: any) => {
    if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
    roleMap.get(r.user_id)!.push(r.role);
  });

  const rows = useMemo(() => {
    return (members.data ?? []).filter((m: any) => {
      const userRoles = roleMap.get(m.id) ?? [];
      const isAdmin = userRoles.includes("admin");
      if (filter === "pending" && m.approved) return false;
      if (filter === "admin" && !isAdmin) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        String(m.email ?? "").toLowerCase().includes(s) ||
        String(m.full_name ?? "").toLowerCase().includes(s) ||
        String(m.affiliation ?? "").toLowerCase().includes(s)
      );
    });
  }, [members.data, roleMap, filter, q]);

  async function applyConfirm() {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.type === "approve") {
        const { error } = await supabase
          .from("profiles")
          .update({ approved: confirm.next })
          .eq("id", confirm.member.id);
        if (error) throw error;
        toast.success(confirm.next ? "승인되었습니다" : "승인이 취소되었습니다");
        qc.invalidateQueries({ queryKey: ["profiles"] });
      } else {
        if (confirm.next) {
          const { error } = await supabase.from("user_roles").insert({ user_id: confirm.member.id, role: "admin" });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", confirm.member.id)
            .eq("role", "admin");
          if (error) throw error;
        }
        toast.success("역할이 변경되었습니다");
        qc.invalidateQueries({ queryKey: ["user_roles"] });
      }
    } catch (e: any) {
      toast.error(e.message ?? "처리 실패");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow text-xs">Members</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">회원 관리</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이메일·이름·소속 검색"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(
            [
              ["all", "전체"],
              ["pending", "승인대기"],
              ["admin", "관리자"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === k ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-border shadow-card overflow-x-auto">
        {members.isLoading ? (
          <div className="py-16 grid place-items-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
            </span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-foreground">
              <tr>
                <th className="py-3 px-3 text-left">이메일</th>
                <th className="py-3 px-3 text-left">이름</th>
                <th className="py-3 px-3 text-left">소속</th>
                <th className="py-3 px-3">구분</th>
                <th className="py-3 px-3">가입일</th>
                <th className="py-3 px-3">승인</th>
                <th className="py-3 px-3">역할</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((m: any) => {
                const userRoles = roleMap.get(m.id) ?? [];
                const isAdmin = userRoles.includes("admin");
                return (
                  <tr key={m.id} className="hover:bg-accent/30">
                    <td className="py-2.5 px-3 text-foreground">{m.email}</td>
                    <td className="py-2.5 px-3">{m.full_name ?? "-"}</td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{m.affiliation ?? "-"}</td>
                    <td className="py-2.5 px-3 text-center text-xs">{m.member_type ?? "-"}</td>
                    <td className="py-2.5 px-3 text-center text-xs text-muted-foreground">
                      {String(m.created_at).slice(0, 10)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setConfirm({ type: "approve", member: m, next: !m.approved })}
                        className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-md ${m.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {m.approved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {m.approved ? "승인" : "대기"}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setConfirm({ type: "admin", member: m, next: !isAdmin })}
                        className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-md ${isAdmin ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
                      >
                        {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        {isAdmin ? "관리자" : "회원"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.type === "approve"
                ? confirm.next
                  ? "회원을 승인할까요?"
                  : "승인을 취소할까요?"
                : confirm?.next
                  ? "관리자 권한을 부여할까요?"
                  : "관리자 권한을 해제할까요?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.member?.email}
              {confirm?.type === "admin" && confirm.next
                ? " 계정에 관리자 콘솔 접근 권한이 부여됩니다."
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={applyConfirm} disabled={busy}>
              {busy ? "처리 중…" : "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
