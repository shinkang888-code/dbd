// filepath: src/routes/admin.banners.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBoardRow, listBoardRows, upsertBoardRow } from "@/lib/board-db";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Upload, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { siteBtn } from "@/lib/site-button";

export const Route = createFileRoute("/admin/banners")({
  component: Banners,
});

type Cta = { label: string; href: string };
type Banner = any;

function pickCtas(row: Banner): Cta[] {
  if (Array.isArray(row.cta_buttons) && row.cta_buttons.length > 0) {
    return row.cta_buttons.map((b: any) => ({
      label: String(b.label ?? ""),
      href: String(b.href ?? ""),
    }));
  }
  if (row.cta_label) {
    return [{ label: row.cta_label, href: row.cta_href || "/about" }];
  }
  return [{ label: "학회 소개", href: "/about" }];
}

function Banners() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Banner | null>(null);
  const list = useQuery({
    queryKey: ["neon", "banners", "admin"],
    queryFn: async () => {
      const res = await listBoardRows({ data: { table: "banners", admin: true } });
      return res.rows ?? [];
    },
  });

  async function save(row: Banner) {
    const ctas = (row.cta_buttons as Cta[] | undefined)?.filter((c) => c.label?.trim()) ?? [];
    const payload: any = {
      title: row.title,
      subtitle: row.subtitle,
      cta_buttons: ctas,
      cta_label: ctas[0]?.label ?? null,
      cta_href: ctas[0]?.href ?? null,
      image_url: row.image_url,
      video_url: row.video_url,
      sort_order: row.sort_order ?? 0,
      published: row.published ?? true,
    };
    try {
      await upsertBoardRow({
        data: row.id ? { table: "banners", id: row.id, payload } : { table: "banners", payload },
      });
      toast.success("저장되었습니다");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["neon", "banners"] });
    } catch (e: any) {
      toast.error(e?.message ?? "저장 실패");
    }
  }

  async function del(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await deleteBoardRow({ data: { table: "banners", id } });
      qc.invalidateQueries({ queryKey: ["neon", "banners"] });
    } catch (e: any) {
      toast.error(e?.message ?? "삭제 실패");
    }
  }

  async function toggle(row: Banner) {
    await upsertBoardRow({
      data: { table: "banners", id: row.id, payload: { ...row, published: !row.published } },
    });
    qc.invalidateQueries({ queryKey: ["neon", "banners"] });
  }

  async function move(row: Banner, dir: -1 | 1) {
    await upsertBoardRow({
      data: {
        table: "banners",
        id: row.id,
        payload: { ...row, sort_order: (row.sort_order ?? 0) + dir },
      },
    });
    qc.invalidateQueries({ queryKey: ["neon", "banners"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-xs">Banners</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">히어로 배너 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            이미지/동영상과 배너 아래 페이지 버튼을 여러 개 등록할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({
              published: true,
              sort_order: 0,
              cta_buttons: [
                { label: "학회 소개", href: "/about" },
                { label: "회원가입", href: "/register" },
              ],
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card"
        >
          <Plus className="h-4 w-4" /> 새 배너
        </button>
      </div>

      <div className="grid gap-3">
        {(list.data ?? []).map((b: any) => (
          <div key={b.id} className="rounded-2xl bg-white border border-border p-4 shadow-card flex items-center gap-4">
            <div className="h-16 w-24 rounded-lg overflow-hidden bg-accent shrink-0">
              {b.image_url ? (
                <img src={b.image_url} alt="" className="h-full w-full object-cover" />
              ) : b.video_url ? (
                <video src={b.video_url} className="h-full w-full object-cover" muted />
              ) : (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">no media</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-navy truncate">{b.title}</div>
              <div className="text-xs text-muted-foreground truncate">{b.subtitle}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {pickCtas(b).map((c, i) => (
                  <span key={i} className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-foreground">
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(b, -1)} className="p-1.5 rounded hover:bg-accent">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button onClick={() => move(b, 1)} className="p-1.5 rounded hover:bg-accent">
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggle(b)}
                className={`p-1.5 rounded ${b.published ? "text-emerald-600" : "text-muted-foreground"}`}
              >
                {b.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setEditing({ ...b, cta_buttons: pickCtas(b) })}
                className="text-xs px-3 py-1 rounded-full bg-accent"
              >
                수정
              </button>
              <button onClick={() => del(b.id)} className="p-1.5 rounded hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
        {(list.data ?? []).length === 0 && (
          <div className="rounded-2xl bg-white border border-dashed border-border p-12 text-center text-muted-foreground">
            등록된 배너가 없습니다.
          </div>
        )}
      </div>

      {editing && <BannerEditor row={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function BannerEditor({ row, onCancel, onSave }: { row: any; onCancel: () => void; onSave: (r: any) => void }) {
  const [b, setB] = useState<any>({
    ...row,
    cta_buttons: pickCtas(row),
  });
  const [uploading, setUploading] = useState<null | "image" | "video">(null);

  const ctas: Cta[] = b.cta_buttons ?? [];

  function setCta(i: number, patch: Partial<Cta>) {
    setB((x: any) => {
      const next = [...(x.cta_buttons ?? [])];
      next[i] = { ...next[i], ...patch };
      return { ...x, cta_buttons: next };
    });
  }

  async function pick(kind: "image" | "video") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "image" ? "image/*" : "video/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setUploading(kind);
      try {
        const res = await uploadFile("banners", f);
        setB((x: any) => ({ ...x, [`${kind}_url`]: res.url }));
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setUploading(null);
      }
    };
    input.click();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 backdrop-blur px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-elevated p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-navy mb-4">{b.id ? "배너 수정" : "새 배너"}</h3>
        <div className="space-y-3">
          <input
            value={b.title ?? ""}
            onChange={(e) => setB({ ...b, title: e.target.value })}
            placeholder="제목"
            className="w-full rounded-xl border border-border px-4 py-2.5"
          />
          <input
            value={b.subtitle ?? ""}
            onChange={(e) => setB({ ...b, subtitle: e.target.value })}
            placeholder="부제"
            className="w-full rounded-xl border border-border px-4 py-2.5"
          />

          <div className="rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">배너 아래 페이지 버튼</p>
              <button
                type="button"
                className="text-xs text-primary font-medium"
                onClick={() =>
                  setB((x: any) => ({
                    ...x,
                    cta_buttons: [...(x.cta_buttons ?? []), { label: "", href: "/" }],
                  }))
                }
              >
                + 버튼 추가
              </button>
            </div>
            {ctas.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  value={c.label}
                  onChange={(e) => setCta(i, { label: e.target.value })}
                  placeholder="버튼 텍스트"
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <input
                  value={c.href}
                  onChange={(e) => setCta(i, { href: e.target.value })}
                  placeholder="/about 또는 https://…"
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="p-2 text-destructive"
                  onClick={() =>
                    setB((x: any) => ({
                      ...x,
                      cta_buttons: (x.cta_buttons ?? []).filter((_: Cta, j: number) => j !== i),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {ctas.length === 0 && (
              <p className="text-xs text-muted-foreground">버튼이 없으면 기본 ‘학회 소개’가 표시됩니다.</p>
            )}
          </div>

          <input
            type="number"
            value={b.sort_order ?? 0}
            onChange={(e) => setB({ ...b, sort_order: Number(e.target.value) })}
            placeholder="정렬 순서"
            className="w-full rounded-xl border border-border px-4 py-2.5"
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => pick("image")} className="rounded-lg bg-accent px-3 py-2 text-sm inline-flex items-center justify-center gap-2">
              {uploading === "image" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 이미지 업로드
            </button>
            <button onClick={() => pick("video")} className="rounded-lg bg-accent px-3 py-2 text-sm inline-flex items-center justify-center gap-2">
              {uploading === "video" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 동영상 업로드
            </button>
          </div>
          {b.image_url && <img src={b.image_url} alt="" className="w-full h-32 object-cover rounded-lg" />}
          {b.video_url && <video src={b.video_url} controls className="w-full h-32 object-cover rounded-lg" />}
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={b.published ?? true}
              onChange={(e) => setB({ ...b, published: e.target.checked })}
            />{" "}
            게시
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className={siteBtn("secondary", "sm")}>
            취소
          </button>
          <button onClick={() => onSave(b)} className={siteBtn("primary", "sm")}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
