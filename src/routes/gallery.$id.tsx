// filepath: src/routes/gallery.$id.tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardDetail } from "@/components/board/board-detail";
import { GALLERY } from "@/lib/board";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery/$id")({
  head: ({ params }) =>
    pageHead({
      path: `/gallery/${params.id}`,
      title: "갤러리 — 대한학술융합학회 KSAC",
    }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <SiteLayout>
        <Section>
          <BoardDetail config={GALLERY} id={id} />
        </Section>
      </SiteLayout>
    );
  },
});
