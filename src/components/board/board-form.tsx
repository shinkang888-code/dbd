import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/roles";
import { uploadFile } from "@/lib/storage";
import type { BoardConfig } from "@/lib/board";
import { upsertBoardRow } from "@/lib/board-db";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

type Row = any;

export function BoardForm({
  config,
  existing,
  defaultCategory,
}: {
  config: BoardConfig;
  existing?: Row;
  defaultCategory?: string;
}) {
  const nav = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [category, setCategory] = useState(
    existing?.category ??
      (defaultCategory && config.categories.includes(defaultCategory) ? defaultCategory : config.categories[0]),
  );
  const [content, setContent] = useState(existing?.content ?? "");
  const [pinned, setPinned] = useState<boolean>(existing?.pinned ?? false);
  const [published, setPublished] = useState<boolean>(existing?.published ?? true);
  const [fileUrl, setFileUrl] = useState<string | null>(existing?.file_url ?? null);
  const [fileName, setFileName] = useState<string | null>(existing?.file_name ?? null);
  const [thumbnail, setThumbnail] = useState<string | null>(existing?.thumbnail_url ?? null);
  const [images, setImages] = useState<string[]>(existing?.image_urls ?? []);
  const [eventDate, setEventDate] = useState<string>(existing?.event_date ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("관리자만 접근할 수 있습니다");
      nav({ to: config.basePath });
    }
  }, [adminLoading, isAdmin, nav, config.basePath]);

  async function pickFile(kind: "file" | "thumb" | "image") {
    const input = document.createElement("input");
    input.type = "file";
    if (kind !== "file") input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setUploading(true);
      try {
        const bucket =
          kind === "image" ? "gallery" : kind === "thumb" ? (config.table === "gallery" ? "gallery" : "attachments") : "attachments";
        const res = await uploadFile(bucket as any, f);
        if (kind === "file") {
          setFileUrl(res.url);
          setFileName(res.name);
        } else if (kind === "thumb") setThumbnail(res.url);
        else setImages((prev) => [...prev, res.url]);
        toast.success("업로드되었습니다");
      } catch (e: any) {
        toast.error(e.message ?? "업로드 실패");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function save() {
    if (!user) return;
    if (!title.trim()) {
      toast.error("제목을 입력하세요");
      return;
    }
    setSaving(true);
    const payload: any = {
      title: title.trim(),
      category,
      content,
      pinned,
      published,
      thumbnail_url: thumbnail,
    };
    if (config.hasFile) {
      payload.file_url = fileUrl;
      payload.file_name = fileName;
    }
    if (config.hasImages) {
      payload.image_urls = images;
      if (eventDate) payload.event_date = eventDate;
    }
    if (!existing) {
      payload.author_id = user.id;
      payload.author_name = user.email?.split("@")[0] ?? "관리자";
    }
    try {
      const res = existing
        ? await upsertBoardRow({ data: { table: config.table, id: existing.id, payload } })
        : await upsertBoardRow({ data: { table: config.table, payload } });
      if (!res?.id) {
        toast.error("저장에 실패했습니다");
        return;
      }
      toast.success(existing ? "수정되었습니다" : "등록되었습니다");
      nav({ to: config.basePath });
    } catch (e: any) {
      toast.error(e?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="rounded-lg border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring bg-background"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border px-4 py-3 bg-background"
        >
          {config.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {config.hasImages && (
          <input
            type="date"
            value={eventDate ?? ""}
            onChange={(e) => setEventDate(e.target.value)}
            className="rounded-lg border border-border px-4 py-3 bg-background"
          />
        )}
      </div>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="본문을 입력하세요. HTML 편집도 가능합니다."
      />

      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /> 상단 고정
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> 게시
        </label>
      </div>

      <div className="rounded-lg border border-dashed border-border p-4 grid sm:grid-cols-3 gap-3">
        {config.hasFile && (
          <button
            type="button"
            onClick={() => pickFile("file")}
            className="rounded-lg bg-secondary px-4 py-3 text-sm inline-flex items-center gap-2 hover:bg-accent"
          >
            <Upload className="h-4 w-4" /> 첨부파일 {fileName ? `(${fileName})` : ""}
          </button>
        )}
        <button
          type="button"
          onClick={() => pickFile("thumb")}
          className="rounded-lg bg-secondary px-4 py-3 text-sm inline-flex items-center gap-2 hover:bg-accent"
        >
          <Upload className="h-4 w-4" /> 썸네일 {thumbnail && "✓"}
        </button>
        {config.hasImages && (
          <button
            type="button"
            onClick={() => pickFile("image")}
            className="rounded-lg bg-secondary px-4 py-3 text-sm inline-flex items-center gap-2 hover:bg-accent"
          >
            <Upload className="h-4 w-4" /> 이미지 추가
          </button>
        )}
        {uploading && (
          <div className="col-span-full text-xs text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> 업로드 중...
          </div>
        )}
      </div>

      {config.hasImages && images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((u, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
              <img src={u} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white grid place-items-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={() => nav({ to: config.basePath })}
          className="rounded-lg border border-border px-5 py-2 text-sm font-semibold"
        >
          취소
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "저장 중..." : existing ? "수정" : "등록"}
        </button>
      </div>
    </div>
  );
}
