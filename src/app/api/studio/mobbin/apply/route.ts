import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/mobbin/classify";
import { listApps, listCategories, recordApplyRun } from "@/lib/mobbin/store";
import { bad, studioActor, unauthorized } from "@/lib/studio/http";

export const dynamic = "force-dynamic";

/**
 * 현재 계획을 스냅샷으로 기록(status=planned).
 * 실제 mobbin 반영(컬렉션 생성·앱 배치)은 로컬 Playwright 어댑터가
 * 이 계획을 읽어 직렬·지연으로 수행한다. (이미지 다운로드 없음)
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
      status: "planned",
      actor,
    });
    return NextResponse.json({ run, plan });
  } catch (error) {
    return bad(error);
  }
}
