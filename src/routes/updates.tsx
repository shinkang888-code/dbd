import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { BoardList } from "@/components/board/board-list";
import { NOTICES } from "@/lib/board";
import { MEDIA } from "@/lib/media";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/updates")({
  head: () =>
    pageHead({
      path: "/updates",
      title: "회원동정 — 대한학술융합학회 KSAC",
      description: "대한학술융합학회 회원 동정과 활동 소식을 확인하세요.",
    }),
  component: UpdatesPage,
});

function UpdatesPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Member Updates"
        title="회원동정"
        subtitle="회원 소식과 활동 동정을 확인하세요"
        image={MEDIA.networking}
      />
      <Section>
        <BoardList config={NOTICES} lockedCategory="회원동정" />
      </Section>
    </SiteLayout>
  );
}
