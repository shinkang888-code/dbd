import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useIsAdmin } from "@/lib/roles";
import type { BoardConfig } from "@/lib/board";
import { deleteBoardRow, getBoardRow, incrementBoardViews, listBoardNav } from "@/lib/board-db";
import { toast } from "sonner";
import { ArrowLeft, Download, Edit2, Trash2, ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { HtmlContent } from "@/components/cms/html-content";

export function BoardDetail({ config, id }: { config: BoardConfig; id: string }) {
  const nav = useNavigate();
  const { isAdmin } = useIsAdmin();

  const row = useQuery({
    queryKey: ["neon", config.table, id],
    queryFn: async () => getBoardRow({ data: { table: config.table, id } }),
  });

  const siblings = useQuery({
    queryKey: ["neon", config.table, "siblings"],
    queryFn: async () => listBoardNav({ data: { table: config.table } }),
  });

  useEffect(() => {
    incrementBoardViews({ data: { table: config.table, id } }).catch(() => {});
  }, [id, config.table]);

  async function del() {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await deleteBoardRow({ data: { table: config.table, id } });
      toast.success("삭제되었습니다");
      nav({ to: config.basePath });
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
    }
  }

  if (row.isLoading) return <div className="py-24 text-center text-muted-foreground">불러오는 중...</div>;
  if (!row.data) return <div className="py-24 text-center text-muted-foreground">글을 찾을 수 없습니다.</div>;

  const r = row.data;
  const idx = siblings.data?.findIndex((s) => s.id === id) ?? -1;
  const prev = idx > 0 ? siblings.data![idx - 1] : null;
  const next = idx >= 0 && siblings.data && idx < siblings.data.length - 1 ? siblings.data[idx + 1] : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow text-xs">{r.category ?? config.label}</span>
        <div className="mt-2 flex items-start gap-2">
          {r.pinned && <Pin className="h-5 w-5 text-primary shrink-0 mt-1" />}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{r.title}</h1>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>{r.author_name ?? "관리자"}</span>
          <span>{String(r.created_at).slice(0, 10)}</span>
          <span>조회 {r.views ?? 0}</span>
          {r.event_date && <span>일자: {r.event_date}</span>}
        </div>
      </div>

      {r.thumbnail_url && (
        <img src={r.thumbnail_url} alt="" className="w-full max-h-[420px] object-cover rounded-xl border border-border shadow-card mb-8" />
      )}

      {config.hasImages && Array.isArray(r.image_urls) && r.image_urls.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {r.image_urls.map((u: string, i: number) => (
            <img key={i} src={u} alt="" className="w-full aspect-video object-cover rounded-lg border border-border shadow-card" />
          ))}
        </div>
      )}

      <div className="prose prose-slate max-w-none text-foreground leading-relaxed border-y border-border py-8 min-h-[200px]">
        <HtmlContent html={r.content} className="" />
      </div>

      {r.file_url && (
        <a href={r.file_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">
          <Download className="h-4 w-4" /> 첨부파일 다운로드 {r.file_name ? `(${r.file_name})` : ""}
        </a>
      )}

      <div className="mt-10 flex flex-wrap justify-between items-center gap-3">
        <Link to={config.basePath} className="inline-flex items-center gap-1 text-sm text-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> 목록으로
        </Link>
        {isAdmin && (
          <div className="flex gap-2">
            <Link to={`${config.basePath}/$id/edit` as any} params={{ id } as any} className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
              <Edit2 className="h-4 w-4" /> 수정
            </Link>
            <button onClick={del} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 text-destructive px-4 py-2 text-sm font-semibold hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" /> 삭제
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {prev ? (
          <Link to={`${config.basePath}/$id` as any} params={{ id: prev.id } as any} className="rounded-lg border border-border bg-white p-4 hover:border-primary transition">
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><ChevronLeft className="h-3 w-3" /> 이전글</div>
            <div className="mt-1 text-sm font-semibold text-foreground truncate">{prev.title}</div>
          </Link>
        ) : <div />}
        {next ? (
          <Link to={`${config.basePath}/$id` as any} params={{ id: next.id } as any} className="rounded-lg border border-border bg-white p-4 hover:border-primary transition text-right">
            <div className="text-xs text-muted-foreground inline-flex items-center justify-end gap-1 w-full">다음글 <ChevronRight className="h-3 w-3" /></div>
            <div className="mt-1 text-sm font-semibold text-foreground truncate">{next.title}</div>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
