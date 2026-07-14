// filepath: src/lib/sanitize-html.ts
import DOMPurify from "isomorphic-dompurify";

/** 관리자 HTML → 안전한 공개 렌더용 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "class"],
  });
}

/** plain text인지 HTML인지 대략 판별 (기존 게시글 호환) */
export function looksLikeHtml(content: string | null | undefined): boolean {
  if (!content) return false;
  return /<\/?[a-z][\s\S]*>/i.test(content);
}
