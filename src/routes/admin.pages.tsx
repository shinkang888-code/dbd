// filepath: src/routes/admin.pages.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listPages,
  upsertPage,
  resetPageToBaseline,
  lockPageBaseline,
  seedPageBaselines,
  type CmsPage,
} from "@/lib/pages-db";
import { getPageBaseline } from "@/lib/page-baselines";
import { PageSplitEditor } from "@/components/cms/page-split-editor";
import { toast } from "sonner";
import { FileText, Loader2, Database } from "lucide-react";
import { siteBtn } from "@/lib/site-button";

export const Route = createFileRoute("/admin/pages")({
  component: PagesAdmin,
});

const SLUG_HINT: Record<string, string> = {
  home: "포털 홈 — 배너 아래 본문",
  about: "학회소개",
  submission: "논문투고",
  members: "회원마당",
  "journal-intro": "학술지 상단 안내",
  "conference-intro": "학술대회 상단 안내",
};

function openEditorPayload(p: CmsPage): CmsPage {
  const html =
    p.content_html?.trim() ||
    p.baseline_html?.trim() ||
    getPageBaseline(p.slug);
  return { ...p, content_html: html, baseline_html: p.baseline_html || getPageBaseline(p.slug) };
}

function PagesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const list = useQuery({
    queryKey: ["neon", "pages", "admin"],
    queryFn: async () => (await listPages()).rows ?? [],
  });

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await upsertPage({
        data: {
          id: editing.id,
          slug: editing.slug,
          title: editing.title,
          content_html: editing.content_html,
          published: editing.published,
        },
      });
      toast.success("저장되었습니다. 사이트에 반영됩니다.");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["neon", "pages"] });
    } catch (e: any) {
      toast.error(e?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function resetToBaseline() {
    if (!editing) return;
    if (!confirm("DB 기준본(현 사이트 상태 백업)으로 되돌릴까요? 지금 편집 내용은 저장되지 않습니다.")) return;
    setSaving(true);
    try {
      const page = await resetPageToBaseline({ data: { id: editing.id } });
      setEditing(openEditorPayload(page));
      toast.success("기준본으로 초기화했습니다");
      qc.invalidateQueries({ queryKey: ["neon", "pages"] });
    } catch (e: any) {
      toast.error(e?.message ?? "초기화 실패");
    } finally {
      setSaving(false);
    }
  }

  async function lockBaseline() {
    if (!editing) return;
    if (!confirm("지금 편집 내용을 ‘현상태 기준본’으로 고정할까요? 이후 초기화 시 이 내용으로 복원됩니다.")) return;
    setSaving(true);
    try {
      await lockPageBaseline({ data: { id: editing.id, content_html: editing.content_html } });
      setEditing({ ...editing, baseline_html: editing.content_html });
      toast.success("기준본을 갱신했습니다");
      qc.invalidateQueries({ queryKey: ["neon", "pages"] });
    } catch (e: any) {
      toast.error(e?.message ?? "기준본 저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function seedBaselines() {
    setSeeding(true);
    try {
      await seedPageBaselines();
      toast.success("사이트 기본 HTML을 DB 기준본으로 백업했습니다");
      qc.invalidateQueries({ queryKey: ["neon", "pages"] });
    } catch (e: any) {
      toast.error(e?.message ?? "백업 실패");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-xs">Pages CMS</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">페이지 HTML 편집</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            좌측 코드 · 우측 미리보기. 「현상태 초기화」로 DB 기준본 복원, 「기준본 갱신」으로 안전한 백업 고정.
          </p>
        </div>
        <button type="button" onClick={seedBaselines} disabled={seeding} className={siteBtn("secondary", "sm")}>
          {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          현사이트 HTML 기준본 백업
        </button>
      </div>

      <div className="grid gap-3">
        {(list.data ?? []).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setEditing(openEditorPayload(p))}
            className="rounded-2xl bg-white border border-border p-4 shadow-card text-left flex items-center gap-3 hover:border-primary/40"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-navy truncate">{p.title || p.slug}</div>
              <div className="text-xs text-muted-foreground truncate">
                /{p.slug} · {SLUG_HINT[p.slug] ?? "커스텀"} ·{" "}
                {p.baseline_html?.trim() ? "기준본 있음" : "기준본 미설정"} ·{" "}
                {p.content_html?.trim() ? "편집됨" : "미게시 HTML"}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{String(p.updated_at).slice(0, 10)}</span>
          </button>
        ))}
        {(list.data ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            페이지가 없습니다. Neon CMS 마이그레이션을 실행해 주세요.
          </div>
        )}
      </div>

      {editing && (
        <PageSplitEditor
          title={editing.title}
          hint={SLUG_HINT[editing.slug]}
          slug={editing.slug}
          html={editing.content_html}
          published={editing.published}
          saving={saving}
          onTitleChange={(title) => setEditing({ ...editing, title })}
          onHtmlChange={(content_html) => setEditing({ ...editing, content_html })}
          onPublishedChange={(published) => setEditing({ ...editing, published })}
          onSave={save}
          onCancel={() => setEditing(null)}
          onResetToBaseline={resetToBaseline}
          onLockBaseline={lockBaseline}
        />
      )}
    </div>
  );
}
