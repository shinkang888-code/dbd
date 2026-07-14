// filepath: src/routes/journal.$id.tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardDetail } from "@/components/board/board-detail";
import { RESOURCES } from "@/lib/board";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/journal/$id")({
  head: ({ params }) =>
    pageHead({
      path: `/journal/${params.id}`,
      title: "자료실 — 대한학술융합학회 KSAC",
    }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <SiteLayout>
        <Section>
          <BoardDetail config={RESOURCES} id={id} />
        </Section>
      </SiteLayout>
    );
  },
});
