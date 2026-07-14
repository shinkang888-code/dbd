import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoardDataMode, setBoardDataMode, type BoardDataMode } from "@/lib/board-db";
import { toast } from "sonner";
import { Database, Trash2 } from "lucide-react";

/**
 * Admin top switch: Dummy (seed preview) vs Live (real DB).
 * Switching to Live deletes all is_dummy rows.
 */
export function BoardDataModeSwitch() {
  const qc = useQueryClient();
  const modeQ = useQuery({
    queryKey: ["neon", "board-data-mode"],
    queryFn: async () => (await getBoardDataMode()).mode as BoardDataMode,
  });
  const mode = modeQ.data ?? "dummy";

  async function switchTo(next: BoardDataMode) {
    if (next === mode) return;
    if (next === "live") {
      const ok = confirm(
        "실제 모드로 전환하면 더미 게시글·배너가 모두 삭제됩니다.\n이후 등록하는 글만 Neon DB에 남습니다. 계속할까요?",
      );
      if (!ok) return;
    }
    try {
      await setBoardDataMode({ data: { mode: next } });
      toast.success(next === "live" ? "실제 모드로 전환했습니다. 더미 데이터가 삭제되었습니다." : "더미 모드로 전환했습니다.");
      qc.invalidateQueries({ queryKey: ["neon"] });
    } catch (e: any) {
      toast.error(e?.message ?? "전환 실패");
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-navy text-white grid place-items-center shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">게시판 데이터 모드 (Neon)</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              현재: <span className="font-semibold text-navy">{mode === "dummy" ? "더미" : "실제"}</span>
              {mode === "dummy"
                ? " — 미리보기용 샘플 글·사진을 표시합니다."
                : " — 실데이터만 표시합니다. 더미는 삭제된 상태입니다."}
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-lg border border-border overflow-hidden text-sm font-semibold">
          <button
            type="button"
            onClick={() => switchTo("dummy")}
            className={`px-4 py-2 transition ${mode === "dummy" ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-accent"}`}
          >
            더미
          </button>
          <button
            type="button"
            onClick={() => switchTo("live")}
            className={`px-4 py-2 inline-flex items-center gap-1.5 transition ${mode === "live" ? "bg-navy text-white" : "bg-white text-muted-foreground hover:bg-accent"}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            실제
          </button>
        </div>
      </div>
    </div>
  );
}
