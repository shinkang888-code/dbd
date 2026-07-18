import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/mobbin/classify";
import { listApps, listCategories, recordApplyRun } from "@/lib/mobbin/store";
import { bad, studioActor, unauthorized } from "@/lib/studio/http";

export const dynamic = "force-dynamic";

/**
 * 현재 카테고리 인덱스를 스냅샷으로 기록(status=indexed).
 * 분류는 dbd가 소유하며 mobbin에 자동으로 쓰지 않는다 —
 * mobbin 컬렉션(스크린 단위)은 사용자가 직접 큐레이션한다.
 */
export async function POST() {
  const actor = await studioActor();
  if (!actor) return unauthorized();
  try {
    const [apps, categories] = await Promise.all([listApps(), listCategories()]);
    const plan = buildPlan(apps, categories);
    const planMap = Object.fromEntries(plan.map((c) => [c.collection, c.apps.map((a) => a.appKey)]));
    const assignmentCount = plan.reduce((n, c) => n + c.apps.length, 0);
    const run = await recordApplyRun({
      plan: planMap,
      collectionCount: plan.length,
      assignmentCount,
      status: "indexed",
      actor,
    });
    return NextResponse.json({ run, plan });
  } catch (error) {
    return bad(error);
  }
}
