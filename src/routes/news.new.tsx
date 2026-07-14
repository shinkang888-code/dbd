// filepath: src/routes/news.new.tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardForm } from "@/components/board/board-form";
import { NOTICES } from "@/lib/board";
import { pageHead } from "@/lib/seo";

type NewsNewSearch = { category?: string };

export const Route = createFileRoute("/news/new")({
  validateSearch: (search: Record<string, unknown>): NewsNewSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () =>
    pageHead({
      path: "/news/new",
      title: "공지사항 등록 — KSAC",
      robots: "noindex,nofollow",
    }),
  component: NewsNewPage,
});

function NewsNewPage() {
  const { category } = Route.useSearch();
  return (
    <SiteLayout>
      <Section>
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">공지사항 등록</h1>
        <BoardForm config={NOTICES} defaultCategory={category} />
      </Section>
    </SiteLayout>
  );
}
