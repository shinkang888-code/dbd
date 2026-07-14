import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useIsAdmin } from "@/lib/roles";
import type { BoardConfig } from "@/lib/board";
import { getBoardRow, incrementBoardViews } from "@/lib/board-db";
import { Download, Edit2, Loader2, Pin, X } from "lucide-react";
import { siteBtn } from "@/lib/site-button";
import { HtmlContent } from "@/components/cms/html-content";

type Props = {
  config: BoardConfig;
  id: string | null;
  open: boolean;
  onClose: () => void;
};

export function BoardDetailDialog({ config, id, open, onClose }: Props) {
  const { isAdmin } = useIsAdmin();

  const row = useQuery({
    queryKey: ["neon", config.table, id, "dialog"],
    enabled: open && !!id,
    queryFn: async () => getBoardRow({ data: { table: config.table, id: id! } }),
  });

  useEffect(() => {
    if (!open || !id) return;
    incrementBoardViews({ data: { table: config.table, id } }).catch(() => {});
  }, [open, id, config.table]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !id) return null;

  const r = row.data;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-navy/65 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-elevated border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-white/95 backdrop-blur px-5 py-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase truncate">
            {r?.category ?? config.label}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-accent"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 md:px-8 py-6">
          {row.isLoading ? (
            <div className="py-16 grid place-items-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
              </span>
            </div>
          ) : !r ? (
            <div className="py-16 text-center text-sm text-muted-foreground">글을 찾을 수 없습니다.</div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                {r.pinned && <Pin className="h-5 w-5 text-primary shrink-0 mt-1" />}
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug">{r.title}</h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{r.author_name ?? "관리자"}</span>
                <span>{String(r.created_at).slice(0, 10)}</span>
                <span>조회 {r.views ?? 0}</span>
                {r.event_date && <span>일자: {r.event_date}</span>}
              </div>

              {r.thumbnail_url && (
                <img
                  src={r.thumbnail_url}
                  alt=""
                  className="mt-6 w-full max-h-[360px] object-cover rounded-xl border border-border"
                />
              )}

              {config.hasImages && (() => {
                const imgs = Array.isArray(r.image_urls)
                  ? r.image_urls
                  : typeof r.image_urls === "string"
                    ? (() => {
                        try {
                          return JSON.parse(r.image_urls);
                        } catch {
                          return [];
                        }
                      })()
                    : [];
                if (!imgs.length) return null;
                return (
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {imgs.map((u: string, i: number) => (
                      <img
                        key={i}
                        src={u}
                        alt=""
                        className="w-full aspect-video object-cover rounded-lg border border-border"
                      />
                    ))}
                  </div>
                );
              })()}

              <div className="mt-6 text-foreground leading-relaxed border-y border-border py-6 min-h-[120px]">
                <HtmlContent html={r.content} className="prose prose-slate max-w-none" />
              </div>

              {r.file_url && (
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold"
                >
                  <Download className="h-4 w-4" /> 첨부파일 다운로드
                  {r.file_name ? ` (${r.file_name})` : ""}
                </a>
              )}

              <div className="mt-8 flex flex-wrap justify-end gap-2">
                {isAdmin && (
                  <Link
                    to={`${config.basePath}/$id/edit` as any}
                    params={{ id } as any}
                    className={siteBtn("secondary", "sm")}
                    onClick={onClose}
                  >
                    <Edit2 className="h-3.5 w-3.5" /> 수정
                  </Link>
                )}
                <button type="button" onClick={onClose} className={siteBtn("primary", "sm")}>
                  닫기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
