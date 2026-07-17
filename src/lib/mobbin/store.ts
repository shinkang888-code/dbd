/**
 * Mobbin 정리 스토어 — Neon(DB) 또는 preview(메모리) 폴백.
 * data-mode 패턴을 따른다: DATABASE_URL 없으면 프로세스 메모리로 동작.
 */
import { asc, desc, eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { mobbinApps, mobbinApplyRuns, mobbinCategories } from "@/db/schema";
import type { MobbinApp, MobbinCategory } from "./types";
import { DUMMY_APPS } from "./dummy";

const now = () => new Date();

/** 앱들의 네이티브 카테고리에서 사전을 시드(기존 유지) */
export function seedCategoriesFromApps(
  apps: MobbinApp[],
  existing: MobbinCategory[] = [],
): MobbinCategory[] {
  const byName = new Map(existing.map((c) => [c.name, c]));
  let sort = existing.length;
  for (const app of apps) {
    for (const name of app.nativeCategories ?? []) {
      if (!byName.has(name)) {
        byName.set(name, { name, label: null, mergedInto: null, source: "mobbin", sort: sort++ });
      }
    }
  }
  return Array.from(byName.values());
}

// ---- preview(메모리) 폴백 상태 ----
// Next.js dev의 모듈 재평가/warm 인스턴스에서 유지되도록 globalThis 싱글턴을 쓴다.
// (콜드 서버리스 인스턴스 간에는 유지되지 않음 — 영속화는 DATABASE_URL 필요.)
type ApplyRun = {
  id: number;
  plan: unknown;
  collectionCount: number;
  assignmentCount: number;
  status: string;
  actor: string | null;
  note: string | null;
  createdAt: string;
};
type MobbinMemory = {
  apps: MobbinApp[];
  cats: MobbinCategory[];
  runs: ApplyRun[];
  runSeq: number;
};
const g = globalThis as unknown as { __mobbinMem?: MobbinMemory };
function mem(): MobbinMemory {
  if (!g.__mobbinMem) {
    const apps = DUMMY_APPS.map((a) => ({ ...a }));
    g.__mobbinMem = { apps, cats: seedCategoriesFromApps(apps), runs: [], runSeq: 1 };
  }
  return g.__mobbinMem;
}

export async function listApps(): Promise<MobbinApp[]> {
  if (!hasDb()) return mem().apps;
  const rows = await db().select().from(mobbinApps).orderBy(asc(mobbinApps.name));
  return rows as unknown as MobbinApp[];
}

export async function listCategories(): Promise<MobbinCategory[]> {
  if (!hasDb()) return mem().cats;
  const rows = await db().select().from(mobbinCategories).orderBy(asc(mobbinCategories.sort));
  return rows as unknown as MobbinCategory[];
}

export async function listApplyRuns(): Promise<ApplyRun[]> {
  if (!hasDb()) return mem().runs;
  const rows = await db().select().from(mobbinApplyRuns).orderBy(desc(mobbinApplyRuns.createdAt));
  return rows as unknown as ApplyRun[];
}

/** 동기화 인입 — 저장 앱을 멱등 upsert하고 새 네이티브 카테고리를 시드 */
export async function syncApps(apps: MobbinApp[]) {
  if (!hasDb()) {
    const m = mem();
    const byKey = new Map(m.apps.map((a) => [a.appKey, a]));
    for (const a of apps) {
      byKey.set(a.appKey, { ...byKey.get(a.appKey), ...a, syncedAt: new Date().toISOString() });
    }
    m.apps = Array.from(byKey.values());
    m.cats = seedCategoriesFromApps(m.apps, m.cats);
    return { apps: m.apps.length, categories: m.cats.length };
  }
  const d = db();
  for (const a of apps) {
    const values = {
      appKey: a.appKey,
      name: a.name,
      url: a.url,
      platform: a.platform ?? [],
      screenCount: a.screenCount ?? 0,
      iconUrl: a.iconUrl ?? null,
      nativeCategories: a.nativeCategories ?? [],
      savedAt: a.savedAt ? new Date(a.savedAt) : null,
      syncedAt: now(),
    };
    await d
      .insert(mobbinApps)
      .values(values)
      .onConflictDoUpdate({
        target: mobbinApps.appKey,
        set: {
          name: values.name,
          url: values.url,
          platform: values.platform,
          screenCount: values.screenCount,
          iconUrl: values.iconUrl,
          nativeCategories: values.nativeCategories,
          syncedAt: values.syncedAt,
        },
      });
  }
  // 새 네이티브 카테고리 시드 (기존은 손대지 않음)
  const existing = await listCategories();
  const known = new Set(existing.map((c) => c.name));
  for (const c of seedCategoriesFromApps(await listApps(), existing)) {
    if (!known.has(c.name)) {
      await d
        .insert(mobbinCategories)
        .values({ name: c.name, source: "mobbin", sort: c.sort })
        .onConflictDoNothing();
    }
  }
  return { apps: (await listApps()).length, categories: (await listCategories()).length };
}

/** 앱 카테고리 수동 오버라이드(에디터). null = 오버라이드 해제(네이티브로 복귀) */
export async function setAppOverride(appKey: string, categories: string[] | null) {
  if (!hasDb()) {
    const m = mem();
    m.apps = m.apps.map((a) =>
      a.appKey === appKey ? { ...a, categoryOverride: categories } : a,
    );
    return m.apps.find((a) => a.appKey === appKey) ?? null;
  }
  const [row] = await db()
    .update(mobbinApps)
    .set({ categoryOverride: categories })
    .where(eq(mobbinApps.appKey, appKey))
    .returning();
  return row ?? null;
}

/** 카테고리 업서트: 이름변경(label)·병합(mergedInto)·커스텀 생성 */
export async function upsertCategory(input: {
  name: string;
  label?: string | null;
  mergedInto?: string | null;
  source?: string;
}) {
  if (!hasDb()) {
    const m = mem();
    const idx = m.cats.findIndex((c) => c.name === input.name);
    if (idx >= 0) {
      m.cats[idx] = {
        ...m.cats[idx],
        ...("label" in input ? { label: input.label ?? null } : {}),
        ...("mergedInto" in input ? { mergedInto: input.mergedInto ?? null } : {}),
      };
      return m.cats[idx];
    }
    const cat: MobbinCategory = {
      name: input.name,
      label: input.label ?? null,
      mergedInto: input.mergedInto ?? null,
      source: input.source ?? "custom",
      sort: m.cats.length,
    };
    m.cats = [...m.cats, cat];
    return cat;
  }
  const [row] = await db()
    .insert(mobbinCategories)
    .values({
      name: input.name,
      label: input.label ?? null,
      mergedInto: input.mergedInto ?? null,
      source: input.source ?? "custom",
      sort: 999,
    })
    .onConflictDoUpdate({
      target: mobbinCategories.name,
      set: {
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.mergedInto !== undefined ? { mergedInto: input.mergedInto } : {}),
      },
    })
    .returning();
  return row;
}

/** Apply 실행 기록 — 계획 스냅샷을 감사 로그로 남긴다 */
export async function recordApplyRun(input: {
  plan: unknown;
  collectionCount: number;
  assignmentCount: number;
  status: string;
  actor: string;
  note?: string;
}) {
  if (!hasDb()) {
    const m = mem();
    const run: ApplyRun = {
      id: m.runSeq++,
      plan: input.plan,
      collectionCount: input.collectionCount,
      assignmentCount: input.assignmentCount,
      status: input.status,
      actor: input.actor,
      note: input.note ?? null,
      createdAt: new Date().toISOString(),
    };
    m.runs = [run, ...m.runs];
    return run;
  }
  const [row] = await db()
    .insert(mobbinApplyRuns)
    .values({
      plan: input.plan as object,
      collectionCount: input.collectionCount,
      assignmentCount: input.assignmentCount,
      status: input.status,
      actor: input.actor,
      note: input.note,
    })
    .returning();
  return row;
}
