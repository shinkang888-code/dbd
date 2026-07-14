import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { BoardList } from "@/components/board/board-list";
import { RESOURCES } from "@/lib/board";
import { Search } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/journal")({
  head: () =>
    pageHead({
      path: "/journal",
      title: "학술지 · 논문검색 · 자료실 — 대한학술융합학회 KSAC",
      description: "대한학술융합학회의 학술지 논문검색 서비스와 자료실.",
    }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Journal"
        title="학술지"
        subtitle="융합학문 연구성과를 폭넓게 탐색할 수 있는 학술정보 안내 서비스"
        image={MEDIA.journal}
      />

      <Section id="search">
        <div className="text-center mb-10 reveal">
          <p className="eyebrow text-sm">Paper Search</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">논문검색</h2>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            학술지 논문 통합검색 서비스를 준비하고 있습니다. 현재는 자료실에서 학회 자료를 확인하실 수 있습니다.
          </p>
        </div>

        <div className="max-w-2xl mx-auto rounded-xl border border-border bg-secondary/50 p-8 text-center reveal">
          <Search className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="font-semibold text-foreground">논문검색 서비스 준비중</p>
          <p className="mt-2 text-sm text-muted-foreground">
            학술지 창간호 발간과 함께 검색 기능을 제공할 예정입니다.
          </p>
        </div>
      </Section>

      <Section id="resources" className="bg-gradient-to-b from-white to-accent/20 !max-w-none">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 reveal">
            <p className="eyebrow text-sm">Resources</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">자료실</h2>
          </div>
          <BoardList config={RESOURCES} />
        </div>
      </Section>
    </SiteLayout>
  );
}
