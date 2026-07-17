import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/mobbin/classify";
import { mobbinActor } from "@/lib/mobbin/http";
import { listApplyRuns, listApps, listCategories } from "@/lib/mobbin/store";
import { unauthorized } from "@/lib/studio/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await mobbinActor(req))) return unauthorized();
  const [apps, categories, runs] = await Promise.all([
    listApps(),
    listCategories(),
    listApplyRuns(),
  ]);
  return NextResponse.json({
    source: apps.length ? "data" : "empty",
    apps,
    categories,
    plan: buildPlan(apps, categories),
    runs,
  });
}
