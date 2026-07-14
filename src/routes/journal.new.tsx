// filepath: src/routes/journal.new.tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardForm } from "@/components/board/board-form";
import { RESOURCES } from "@/lib/board";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/journal/new")({
  head: () =>
    pageHead({
      path: "/journal/new",
      title: "자료실 등록 — KSAC",
      robots: "noindex,nofollow",
    }),
  component: () => (
    <SiteLayout>
      <Section>
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">자료실 글 등록</h1>
        <BoardForm config={RESOURCES} />
      </Section>
    </SiteLayout>
  ),
});
