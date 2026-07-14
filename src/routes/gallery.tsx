import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { listBoardRows } from "@/lib/board-db";
import { BoardDetailDialog } from "@/components/board/board-detail-dialog";
import { GALLERY } from "@/lib/board";
import { useIsAdmin } from "@/lib/roles";
import { Plus, ImageIcon } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { siteBtn } from "@/lib/site-button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery")({
  head: () =>
    pageHead({
      path: "/gallery",
      title: "포토갤러리 — 대한학술융합학회 KSAC",
      description: "대한학술융합학회의 학술대회, 이사회, 창립총회 등 활동 사진",
    }),
  component: GalleryPage,
});

function GalleryPage() {
  const { isAdmin } = useIsAdmin();
  const [cat, setCat] = useState<string>("전체");
  const [openId, setOpenId] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["neon", "gallery", "list"],
    queryFn: async () => {
      const res = await listBoardRows({ data: { table: "gallery" } });
      return res.rows ?? [];
    },
  });

  const cats = ["전체", "학술대회", "이사회·총회", "기타"];
  const list = useMemo(() => (q.data ?? []).filter((r) => cat === "전체" || r.category === cat), [q.data, cat]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Photo Gallery"
        title="포토갤러리"
        subtitle="학술대회와 학회 활동의 순간들"
        image={MEDIA.about}
      />
      <Section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${cat === c ? "bg-navy text-white" : "bg-secondary text-navy hover:bg-accent"}`}
              >
                {c}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Link to="/gallery/new" className={siteBtn("primary", "sm")}>
              <Plus className="h-4 w-4" /> 새 앨범
            </Link>
          )}
        </div>

        {list.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">등록된 사진이 없습니다.</div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const cover = p.thumbnail_url || (Array.isArray(p.image_urls) && p.image_urls[0]);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpenId(p.id)}
                className="group rounded-2xl overflow-hidden bg-white border border-border shadow-card hover:shadow-elevated transition text-left"
              >
                <div className="aspect-[4/3] overflow-hidden bg-accent grid place-items-center">
                  {cover ? (
                    <img src={cover} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs eyebrow">{p.category}</div>
                  <div className="mt-1 font-bold text-navy">{p.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {p.event_date ?? String(p.created_at).slice(0, 10)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <BoardDetailDialog
        config={GALLERY}
        id={openId}
        open={!!openId}
        onClose={() => setOpenId(null)}
      />
    </SiteLayout>
  );
}
