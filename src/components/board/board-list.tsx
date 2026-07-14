import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsAdmin } from "@/lib/roles";
import type { BoardConfig } from "@/lib/board";
import { listBoardRows } from "@/lib/board-db";
import { BoardDetailDialog } from "@/components/board/board-detail-dialog";
import { Search, Pin, Plus, ImageIcon, Paperclip, Loader2, AlertCircle } from "lucide-react";

const PAGE_SIZE = 10;

export function BoardList({
  config,
  showAdminToggle = true,
  lockedCategory,
}: {
  config: BoardConfig;
  showAdminToggle?: boolean;
  lockedCategory?: string;
}) {
  const { isAdmin } = useIsAdmin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(lockedCategory ?? "all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["neon", config.table, "list"],
    queryFn: async () => {
      const res = await listBoardRows({ data: { table: config.table } });
      return res.rows ?? [];
    },
  });

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    return rows.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return String(r.title).toLowerCase().includes(s) || String(r.content ?? "").toLowerCase().includes(s);
    });
  }, [query.data, q, cat]);

  const pinned = filtered.filter((r) => r.pinned);
  const normal = filtered.filter((r) => !r.pinned);
  const totalPages = Math.max(1, Math.ceil(normal.length / PAGE_SIZE));
  const pageRows = normal.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayRows = page === 1 ? [...pinned, ...pageRows] : pageRows;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-lg border border-border bg-white px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="제목 또는 내용 검색"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        {!lockedCategory && (
          <select
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm"
          >
            <option value="all">전체 분류</option>
            {config.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        {showAdminToggle && isAdmin && (
          <Link
            to={`${config.basePath}/new` as any}
            search={lockedCategory ? ({ category: lockedCategory } as any) : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card"
          >
            <Plus className="h-4 w-4" /> 새 글
          </Link>
        )}
      </div>

      <div className="rounded-xl bg-white border border-border shadow-card overflow-hidden">
        {query.isLoading ? (
          <div className="py-20 grid place-items-center text-muted-foreground text-sm">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
            </span>
          </div>
        ) : query.isError ? (
          <div className="py-16 px-6 text-center text-sm text-destructive">
            <AlertCircle className="h-5 w-5 mx-auto mb-2" />
            게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-navy text-white text-sm">
              <tr>
                <th className="py-3.5 px-4 w-16">번호</th>
                <th className="py-3.5 px-4 text-left">제목</th>
                <th className="py-3.5 px-4 w-24 hidden md:table-cell">분류</th>
                <th className="py-3.5 px-4 w-28 hidden md:table-cell">글쓴이</th>
                <th className="py-3.5 px-4 w-28 hidden md:table-cell">등록일</th>
                <th className="py-3.5 px-4 w-16 hidden md:table-cell">조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                    <p>등록된 글이 없습니다.</p>
                    {isAdmin && (
                      <Link
                        to={`${config.basePath}/new` as any}
                        search={lockedCategory ? ({ category: lockedCategory } as any) : undefined}
                        className="mt-3 inline-flex text-primary font-semibold hover:underline"
                      >
                        첫 글 등록하기
                      </Link>
                    )}
                  </td>
                </tr>
              )}
              {displayRows.map((r, i) => (
                <tr key={r.id} className={`hover:bg-accent/40 transition ${r.pinned ? "bg-secondary/60" : ""}`}>
                  <td className="py-4 px-4 text-sm text-center">
                    {r.pinned ? (
                      <Pin className="h-4 w-4 text-primary inline" />
                    ) : (
                      <span className="text-muted-foreground">
                        {normal.length - ((page - 1) * PAGE_SIZE + Math.max(0, i - (page === 1 ? pinned.length : 0)))}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className="text-sm font-medium text-foreground hover:text-primary inline-flex items-center gap-2 text-left"
                    >
                      {r.thumbnail_url && <img src={r.thumbnail_url} alt="" className="h-8 w-8 rounded object-cover" />}
                      {config.hasImages && !r.thumbnail_url && <ImageIcon className="h-4 w-4 text-primary" />}
                      <span>{r.title}</span>
                      {r.file_url && <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-xs text-muted-foreground hidden md:table-cell">{r.category ?? "-"}</td>
                  <td className="py-4 px-4 text-xs text-muted-foreground hidden md:table-cell">{r.author_name ?? "관리자"}</td>
                  <td className="py-4 px-4 text-xs text-muted-foreground hidden md:table-cell">{String(r.created_at).slice(0, 10)}</td>
                  <td className="py-4 px-4 text-xs text-muted-foreground hidden md:table-cell text-center">{r.views ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-lg text-sm font-semibold ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-white border border-border text-foreground hover:bg-accent"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <BoardDetailDialog config={config} id={openId} open={!!openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
