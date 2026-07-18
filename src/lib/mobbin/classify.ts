/**
 * 분류 엔진 — 저장 앱을 카테고리 컬렉션 계획으로 접는다(순수 로직).
 * DB/네트워크 의존 없음 → 그대로 단위 테스트 가능.
 */
import type { MobbinApp, MobbinCategory, PlanCollection } from "./types";

const UNCATEGORIZED = "Uncategorized";

/** 카테고리 name → 표시 이름 (병합·이름변경 반영, 순환 방지) */
export function resolveCategoryLabel(name: string, categories: MobbinCategory[]): string {
  const byName = new Map(categories.map((c) => [c.name, c]));
  const seen = new Set<string>();
  let cur = byName.get(name);
  while (cur?.mergedInto && !seen.has(cur.name)) {
    seen.add(cur.name);
    cur = byName.get(cur.mergedInto);
  }
  return cur?.label?.trim() || cur?.name || name;
}

/** 앱의 유효 카테고리 → 표시 라벨 집합 (오버라이드 우선, 없으면 네이티브) */
export function effectiveCategories(app: MobbinApp, categories: MobbinCategory[]): string[] {
  const raw =
    (app.categoryOverride?.length ? app.categoryOverride : app.nativeCategories) ?? [];
  const labels = raw.map((n) => resolveCategoryLabel(n, categories)).filter(Boolean);
  return Array.from(new Set(labels.length ? labels : [UNCATEGORIZED]));
}

/** 저장 앱 목록 → 카테고리별 앱 인덱스 (앱 수 내림차순) */
export function buildPlan(apps: MobbinApp[], categories: MobbinCategory[]): PlanCollection[] {
  const map = new Map<string, PlanCollection["apps"]>();
  for (const app of apps) {
    for (const col of effectiveCategories(app, categories)) {
      if (!map.has(col)) map.set(col, []);
      map.get(col)!.push({
        appKey: app.appKey,
        name: app.name,
        url: app.url,
        iconUrl: app.iconUrl ?? null,
        platform: app.platform ?? null,
        screenCount: app.screenCount ?? 0,
      });
    }
  }
  return Array.from(map.entries())
    .map(([collection, list]) => ({
      collection,
      apps: list.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort(
      (a, b) => b.apps.length - a.apps.length || a.collection.localeCompare(b.collection),
    );
}
