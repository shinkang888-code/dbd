import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { siteBtn } from "@/lib/site-button";

type Props = { table: "notices" | "resources"; onSaved: () => void };

export function PostDialog({ table, onSaved }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!user) return;
    if (!title.trim()) { toast.error("제목을 입력하세요"); return; }
    setLoading(true);
    const payload: any = {
      author_id: user.id,
      author_name: user.email?.split("@")[0] || "회원",
      title: title.trim(),
      content: content.trim(),
    };
    const { error } = await supabase.from(table).insert(payload);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("등록되었습니다");
    setTitle(""); setContent(""); setOpen(false);
    onSaved();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={siteBtn("primary", "sm")}>
        <Plus className="h-4 w-4" /> 글 등록
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 backdrop-blur px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-elevated p-6">
            <h3 className="text-lg font-bold text-navy mb-4">새 글 등록</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" className="w-full rounded-md border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring mb-3" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" rows={6} className="w-full rounded-md border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring resize-none" />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className={siteBtn("secondary", "sm")}>취소</button>
              <button onClick={save} disabled={loading} className={siteBtn("primary", "sm")}>
                {loading ? "저장 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
