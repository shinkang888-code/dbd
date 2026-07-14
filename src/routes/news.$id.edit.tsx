// filepath: src/routes/news.$id.edit.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardForm } from "@/components/board/board-form";
import { NOTICES } from "@/lib/board";
import { getBoardRow } from "@/lib/board-db";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news/$id/edit")({
  head: ({ params }) =>
    pageHead({
      path: `/news/${params.id}/edit`,
      title: "공지사항 수정 — KSAC",
      robots: "noindex,nofollow",
    }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["neon", "notices", id, "edit"],
    queryFn: async () => getBoardRow({ data: { table: "notices", id, admin: true } }),
  });
  return (
    <SiteLayout>
      <Section>
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">공지사항 수정</h1>
        {q.data && <BoardForm config={NOTICES} existing={q.data} />}
      </Section>
    </SiteLayout>
  );
}
