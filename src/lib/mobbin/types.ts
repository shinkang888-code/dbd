/**
 * Mobbin 정리 모듈 타입 — 포인터 + 메타데이터만 다룬다(이미지 저장 없음).
 */
export type MobbinApp = {
  id?: number;
  /** mobbin URL의 앱 식별 경로 — 멱등 키 */
  appKey: string;
  name: string;
  /** 앱 포인터 URL (Copy link) */
  url: string;
  platform: string[] | null;
  screenCount: number;
  iconUrl: string | null;
  /** mobbin 네이티브 카테고리 */
  nativeCategories: string[] | null;
  /** 수동 재분류(있으면 우선) */
  categoryOverride: string[] | null;
  savedAt?: string | null;
  syncedAt?: string | null;
};

export type MobbinCategory = {
  id?: number;
  name: string;
  label: string | null;
  mergedInto: string | null;
  source: string; // mobbin|custom
  sort: number;
};

/**
 * 카테고리별 앱 인덱스 한 줄.
 * dbd가 분류를 소유한다 — mobbin에 자동으로 쓰지 않는다(스크린 큐레이션은 사용자 몫).
 */
export type PlanCollection = {
  collection: string;
  apps: {
    appKey: string;
    name: string;
    url: string;
    iconUrl: string | null;
    platform: string[] | null;
    screenCount: number;
  }[];
};
