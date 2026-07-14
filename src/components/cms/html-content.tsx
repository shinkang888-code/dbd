// filepath: src/components/cms/html-content.tsx
import { sanitizeHtml, looksLikeHtml } from "@/lib/sanitize-html";

/** DB/에디터 HTML 또는 구 plain text 본문 렌더 */
export function HtmlContent({
  html,
  className = "prose prose-slate max-w-none text-foreground leading-relaxed",
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html?.trim()) {
    return <p className="text-muted-foreground">본문이 없습니다.</p>;
  }

  if (!looksLikeHtml(html)) {
    return <div className={`${className} whitespace-pre-wrap`}>{html}</div>;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
