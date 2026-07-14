// filepath: src/components/cms/page-split-editor.tsx
import { useMemo } from "react";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { RotateCcw, Save, X, BookmarkCheck, Loader2 } from "lucide-react";
import { siteBtn } from "@/lib/site-button";

type Props = {
  title: string;
  hint?: string;
  slug: string;
  html: string;
  published: boolean;
  saving?: boolean;
  onTitleChange: (v: string) => void;
  onHtmlChange: (v: string) => void;
  onPublishedChange: (v: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  onResetToBaseline: () => void;
  onLockBaseline: () => void;
};

export function PageSplitEditor({
  title,
  hint,
  slug,
  html,
  published,
  saving,
  onTitleChange,
  onHtmlChange,
  onPublishedChange,
  onSave,
  onCancel,
  onResetToBaseline,
  onLockBaseline,
}: Props) {
  const preview = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="shrink-0 border-b border-border bg-white px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">/{slug}</p>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="mt-0.5 w-full max-w-md border-0 bg-transparent text-xl font-bold text-navy outline-none focus:ring-0"
              placeholder="관리용 제목"
            />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm mr-2">
              <input type="checkbox" checked={published} onChange={(e) => onPublishedChange(e.target.checked)} />
              게시
            </label>
            <button
              type="button"
              onClick={onResetToBaseline}
              className={siteBtn("secondary", "sm")}
              title="DB에 저장된 기준본(사이트 상태)으로 복원"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 현상태 초기화
            </button>
            <button
              type="button"
              onClick={onLockBaseline}
              className={siteBtn("secondary", "sm")}
              title="지금 편집 내용을 새 기준본으로 저장"
            >
              <BookmarkCheck className="h-3.5 w-3.5" /> 기준본 갱신
            </button>
            <button type="button" onClick={onCancel} className={siteBtn("ghost", "sm")}>
              <X className="h-3.5 w-3.5" /> 취소
            </button>
            <button type="button" onClick={onSave} disabled={saving} className={siteBtn("primary", "sm")}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              저장
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Left: HTML */}
        <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-border bg-accent/40 px-4 py-2">
            <span className="text-xs font-semibold text-foreground">HTML 소스</span>
            <span className="text-[11px] text-muted-foreground">{html.length.toLocaleString()}자</span>
          </div>
          <textarea
            value={html}
            onChange={(e) => onHtmlChange(e.target.value)}
            spellCheck={false}
            className="min-h-[40vh] flex-1 resize-none bg-[#0f172a] px-4 py-3 font-mono text-[12px] leading-relaxed text-[#e2e8f0] outline-none lg:min-h-0"
            placeholder="기본 HTML이 여기에 로드됩니다. 수정 후 오른쪽 미리보기로 확인하세요."
          />
        </div>

        {/* Right: Preview */}
        <div className="flex min-h-0 flex-col bg-secondary/20">
          <div className="flex items-center justify-between border-b border-border bg-white/80 px-4 py-2">
            <span className="text-xs font-semibold text-foreground">미리보기</span>
            <span className="text-[11px] text-muted-foreground">실시간 · 저장 전 반영</span>
          </div>
          <div className="min-h-[40vh] flex-1 overflow-y-auto p-6 lg:min-h-0">
            <div className="mx-auto max-w-3xl rounded-xl border border-border bg-white p-6 shadow-card">
              {preview.trim() ? (
                <div
                  className="prose prose-slate max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">HTML을 입력하면 여기에 미리보기가 표시됩니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
