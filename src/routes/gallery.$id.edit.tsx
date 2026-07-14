// filepath: src/routes/gallery.$id.edit.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardForm } from "@/components/board/board-form";
import { GALLERY } from "@/lib/board";
import { getBoardRow } from "@/lib/board-db";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery/$id/edit")({
  head: ({ params }) =>
    pageHead({
      path: `/gallery/${params.id}/edit`,
      title: "갤러리 수정 — KSAC",
      robots: "noindex,nofollow",
    }),
  component: () => {
    const { id } = Route.useParams();
    const q = useQuery({
      queryKey: ["neon", "gallery", id, "edit"],
      queryFn: async () => getBoardRow({ data: { table: "gallery", id, admin: true } }),
    });
    return (
      <SiteLayout>
        <Section>
          <h1 className="text-2xl font-bold text-navy mb-6 text-center">갤러리 앨범 수정</h1>
          {q.data && <BoardForm config={GALLERY} existing={q.data} />}
        </Section>
      </SiteLayout>
    );
  },
});
