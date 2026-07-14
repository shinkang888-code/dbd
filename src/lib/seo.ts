// filepath: src/lib/seo.ts
import { SITE_URL } from "@/lib/media";

/** 네이버/검색엔진 robots 메타 명령어 */
export type RobotsDirective =
  | "index,follow"
  | "index,nofollow"
  | "noindex,follow"
  | "noindex,nofollow"
  | "nosourceinfo";

/** 상대 경로 → 절대 대표 URL (canonical / og:url) */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // 쿼리·해시 제거 — 선호 URL은 깨끗한 절대 경로
  const clean = normalized.split("?")[0].split("#")[0];
  return `${SITE_URL}${clean}`;
}

type PageHeadOptions = {
  /** 사이트 내 경로. 예: "/", "/about", "/news/abc" */
  path: string;
  title?: string;
  description?: string;
  /** 기본: index,follow (검색 허용) */
  robots?: RobotsDirective;
};

/**
 * 페이지 head: robots 메타 + canonical(절대 URL) + og:url
 * 네이버 서치어드바이저 선호 URL / 로봇 메타 가이드 준수
 */
export function pageHead({
  path,
  title,
  description,
  robots = "index,follow",
}: PageHeadOptions) {
  const url = absoluteUrl(path);
  const meta: Array<Record<string, string>> = [
    { name: "robots", content: robots },
    { property: "og:url", content: url },
  ];

  if (title) meta.unshift({ title });
  if (description) meta.push({ name: "description", content: description });

  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}
