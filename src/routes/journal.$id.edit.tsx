// filepath: src/routes/journal.$id.edit.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardForm } from "@/components/board/board-form";
import { RESOURCES } from "@/lib/board";
import { getBoardRow } from "@/lib/board-db";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/journal/$id/edit")({
  head: ({ params }) =>
    pageHead({
      path: `/journal/${params.id}/edit`,
      title: "자료실 수정 — KSAC",
      robots: "noindex,nofollow",
    }),
  component: () => {
    const { id } = Route.useParams();
    const q = useQuery({
      queryKey: ["neon", "resources", id, "edit"],
      queryFn: async () => getBoardRow({ data: { table: "resources", id, admin: true } }),
    });
    return (
      <SiteLayout>
        <Section>
          <h1 className="text-2xl font-bold text-navy mb-6 text-center">자료실 글 수정</h1>
          {q.data && <BoardForm config={RESOURCES} existing={q.data} />}
        </Section>
      </SiteLayout>
    );
  },
});
