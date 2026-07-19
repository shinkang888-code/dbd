/** dbd 운영 셸 내비 — LEXI HQ PieChain 밀도 패턴 */

export type OpsNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type OpsNavSection = {
  section: string;
  items: OpsNavItem[];
};

const CAFE24_ADMIN_URL =
  process.env.NEXT_PUBLIC_CAFE24_ADMIN_URL ?? "https://eclogin.cafe24.com/Shop/";
const MALL_URL = process.env.NEXT_PUBLIC_MALL_URL ?? "http://localhost:3000";

/**
 * 커맨드 센터 수준의 고밀도 메뉴.
 * Admin·Studio·파이프라인·원장을 한 사이드바에 총괄 연결한다.
 */
export const OPS_NAV: OpsNavSection[] = [
  {
    section: "개요",
    items: [{ label: "커맨드 센터", href: "/admin" }],
  },
  {
    section: "소싱 파이프라인",
    items: [
      { label: "카탈로그 인덱스", href: "/admin/pipeline/catalog" },
      { label: "Import", href: "/admin/pipeline/import" },
      { label: "PDP 생성·편집", href: "/admin/pipeline/pdp" },
      { label: "Export 잡", href: "/admin/pipeline/export" },
      { label: "역직구 Supply", href: "/admin/sourcing" },
    ],
  },
  {
    section: "공급·큐레이션",
    items: [
      { label: "공급처", href: "/admin/suppliers" },
      { label: "컬렉션", href: "/admin/collections" },
    ],
  },
  {
    section: "채널",
    items: [
      { label: "채널·Cafe24", href: "/admin/cafe24" },
      { label: "Cafe24 쇼핑몰 ↗", href: CAFE24_ADMIN_URL, external: true },
      { label: "고객 몰 ↗", href: MALL_URL, external: true },
    ],
  },
  {
    section: "주문 운영",
    items: [
      { label: "구매요청", href: "/admin/purchase-requests" },
      { label: "소싱발주", href: "/admin/sourcing-orders" },
      { label: "정산", href: "/admin/settlements" },
      { label: "주문 preview", href: "/admin/orders" },
    ],
  },
  {
    section: "커머스 원장",
    items: [
      { label: "상품", href: "/admin/products" },
      { label: "주문", href: "/admin/orders" },
      { label: "배너", href: "/admin/banners" },
    ],
  },
  {
    section: "분산원장",
    items: [{ label: "HDL 대시보드", href: "/admin/ledger" }],
  },
  {
    section: "스튜디오 · 디자인",
    items: [
      { label: "Studio 홈", href: "/studio" },
      { label: "테마", href: "/studio/design/themes" },
      { label: "홈 섹션", href: "/studio/design/home" },
    ],
  },
  {
    section: "스튜디오 · 크리에이터",
    items: [
      { label: "미디어", href: "/studio/creator/library" },
      { label: "생성 작업", href: "/studio/creator/jobs" },
      { label: "PDP 문서", href: "/studio/creator/pdp" },
      { label: "승인 큐", href: "/studio/creator/review" },
      { label: "게시·롤백", href: "/studio/creator/publish" },
    ],
  },
  {
    section: "스튜디오 · 도구",
    items: [
      { label: "Mobbin 정리", href: "/studio/mobbin" },
      { label: "Cafe24 연결", href: "/studio/cafe24" },
      { label: "결정 대기열", href: "/studio/decisions" },
    ],
  },
  {
    section: "시스템",
    items: [{ label: "시스템·Data Mode", href: "/admin/system" }],
  },
];

export function isOpsPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/studio");
}

export function opsActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/studio") return pathname === "/studio";
  if (href === "/admin/orders") {
    return pathname === "/admin/orders";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
