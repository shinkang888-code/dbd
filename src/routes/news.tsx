import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { BoardList } from "@/components/board/board-list";
import { NOTICES } from "@/lib/board";
import { MEDIA } from "@/lib/media";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/news")({
  head: () =>
    pageHead({
      path: "/news",
      title: "학회소식 · 공지사항 — 대한학술융합학회 KSAC",
      description: "대한학술융합학회의 공지사항, 학술대회, 행사 소식을 확인하세요.",
    }),
  component: NewsPage,
});

function NewsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="News & Notices"
        title="학회소식"
        subtitle="공지사항, 학술대회, 학회 행사 소식을 확인하세요"
        image={MEDIA.news}
      />
      <Section>
        <BoardList config={NOTICES} />
      </Section>
    </SiteLayout>
  );
}
