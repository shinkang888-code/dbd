import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { BoardConfig } from "@/lib/board";
import { deleteBoardRow, listBoardRows, upsertBoardRow } from "@/lib/board-db";
import { toast } from "sonner";
import { Plus, Pin, Eye, EyeOff, Edit2, Trash2, Search, Loader2 } from "lucide-react";
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

export function AdminBoardManager({ config }: { config: BoardConfig }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useQuery({
    queryKey: ["neon", config.table, "admin-list"],
    queryFn: async () => {
      const res = await listBoardRows({ data: { table: config.table, admin: true } });
      return res.rows ?? [];
    },
  });

  const rows = (list.data ?? []).filter(
    (r: any) => !q.trim() || String(r.title).toLowerCase().includes(q.toLowerCase()),
  );

  async function toggle(row: any, field: "pinned" | "published") {
    try {
      await upsertBoardRow({
        data: {
          table: config.table,
          id: row.id,
          payload: { ...row, [field]: !row[field] },
        },
      });
      qc.invalidateQueries({ queryKey: ["neon", config.table] });
    } catch (e: any) {
      toast.error(e?.message ?? "변경 실패");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setBusy(true);
    try {
      await deleteBoardRow({ data: { table: config.table, id: deleteId } });
      toast.success("삭제되었습니다");
      qc.invalidateQueries({ queryKey: ["neon", config.table] });
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
    } finally {
      setBusy(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow text-xs">{config.label}</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">{config.label} 관리</h1>
        </div>
        <Link
          to={`${config.basePath}/new` as any}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card"
        >
          <Plus className="h-4 w-4" /> 새 글
        </Link>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목 검색"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="rounded-xl bg-white border border-border shadow-card overflow-x-auto">
        {list.isLoading ? (
          <div className="py-16 grid place-items-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
            </span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-foreground">
              <tr>
                <th className="py-3 px-3 text-left">제목</th>
                <th className="py-3 px-3">분류</th>
                <th className="py-3 px-3">등록일</th>
                <th className="py-3 px-3">고정</th>
                <th className="py-3 px-3">게시</th>
                <th className="py-3 px-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r: any) => (
                <tr key={r.id} className="hover:bg-accent/30">
                  <td className="py-2.5 px-3">
                    <Link
                      to={`${config.basePath}/$id` as any}
                      params={{ id: r.id } as any}
                      className="text-foreground hover:text-primary font-medium"
                    >
                      {r.title}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs text-muted-foreground">{r.category ?? "-"}</td>
                  <td className="py-2.5 px-3 text-center text-xs text-muted-foreground">
                    {String(r.created_at).slice(0, 10)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => toggle(r, "pinned")}
                      className={`p-1.5 rounded ${r.pinned ? "text-primary" : "text-muted-foreground"}`}
                      title="상단 고정"
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => toggle(r, "published")}
                      className={`p-1.5 rounded ${r.published ? "text-emerald-600" : "text-muted-foreground"}`}
                      title="게시 여부"
                    >
                      {r.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex justify-center gap-1">
                      <Link
                        to={`${config.basePath}/$id/edit` as any}
                        params={{ id: r.id } as any}
                        className="p-1.5 rounded hover:bg-accent"
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Link>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-muted-foreground">
                    <p>등록된 글이 없습니다.</p>
                    <Link
                      to={`${config.basePath}/new` as any}
                      className="mt-3 inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                    >
                      <Plus className="h-4 w-4" /> 첫 글 등록하기
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시글을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>삭제 후에는 복구할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={busy}>
              {busy ? "삭제 중…" : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
