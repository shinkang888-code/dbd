import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { BoardList } from "@/components/board/board-list";
import { NOTICES } from "@/lib/board";
import { MEDIA } from "@/lib/media";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/conference")({
  head: () =>
    pageHead({
      path: "/conference",
      title: "학술대회 안내 — 대한학술융합학회 KSAC",
      description: "대한학술융합학회 학술대회 일정과 안내를 확인하세요.",
    }),
  component: ConferencePage,
});

function ConferencePage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Conference"
        title="학술대회 안내"
        subtitle="학술대회 일정, 논문 모집, 행사 안내를 확인하세요"
        image={MEDIA.about}
      />
      <Section>
        <BoardList config={NOTICES} lockedCategory="학술대회" />
      </Section>
    </SiteLayout>
  );
}
