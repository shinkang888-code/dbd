// filepath: src/routes/news.$id.tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardDetail } from "@/components/board/board-detail";
import { NOTICES } from "@/lib/board";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news/$id")({
  head: ({ params }) =>
    pageHead({
      path: `/news/${params.id}`,
      title: "공지사항 — 대한학술융합학회 KSAC",
    }),
  component: NoticeDetailPage,
});

function NoticeDetailPage() {
  const { id } = Route.useParams();
  return (
    <SiteLayout>
      <Section>
        <BoardDetail config={NOTICES} id={id} />
      </Section>
    </SiteLayout>
  );
}
