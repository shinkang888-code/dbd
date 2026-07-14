// filepath: src/routes/gallery.new.tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, Section } from "@/components/site-layout";
import { BoardForm } from "@/components/board/board-form";
import { GALLERY } from "@/lib/board";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gallery/new")({
  head: () =>
    pageHead({
      path: "/gallery/new",
      title: "갤러리 등록 — KSAC",
      robots: "noindex,nofollow",
    }),
  component: () => (
    <SiteLayout>
      <Section>
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">갤러리 앨범 등록</h1>
        <BoardForm config={GALLERY} />
      </Section>
    </SiteLayout>
  ),
});
