// filepath: src/components/cms/page-body.tsx
import { useQuery } from "@tanstack/react-query";
import { getPageBySlug } from "@/lib/pages-db";
import { HtmlContent } from "@/components/cms/html-content";
import type { ReactNode } from "react";

/**
 * slug에 저장된 HTML이 있으면 그것을 표시, 없거나 비어 있으면 기본(children) 렌더.
 * 관리자 콘솔 /admin/pages 에서 편집.
 */
export function PageBody({
  slug,
  children,
  className,
}: {
  slug: string;
  children: ReactNode;
  className?: string;
}) {
  const page = useQuery({
    queryKey: ["neon", "pages", slug],
    queryFn: async () => getPageBySlug({ data: { slug } }),
  });

  const html = page.data?.content_html?.trim();
  if (page.isLoading) return <div className="py-8 text-center text-sm text-muted-foreground">불러오는 중…</div>;
  if (html) {
    return (
      <div className={className}>
        <HtmlContent html={html} />
      </div>
    );
  }
  return <>{children}</>;
}
