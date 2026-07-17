import { NextResponse } from "next/server";
import { setAppOverride, syncApps } from "@/lib/mobbin/store";
import { mobbinActor } from "@/lib/mobbin/http";
import type { MobbinApp } from "@/lib/mobbin/types";
import { bad, studioActor, unauthorized } from "@/lib/studio/http";

export const dynamic = "force-dynamic";

/** 동기화 인입 (로컬 어댑터 또는 관리자) — 저장 앱 배열 upsert */
export async function POST(req: Request) {
  if (!(await mobbinActor(req))) return unauthorized();
  try {
    const body = await req.json();
    const apps = Array.isArray(body.apps) ? (body.apps as MobbinApp[]) : [];
    if (!apps.length) throw new Error("apps[] required");
    for (const a of apps) {
      if (!a.appKey || !a.name || !a.url) throw new Error("each app needs appKey, name, url");
    }
    return NextResponse.json({ result: await syncApps(apps) });
  } catch (error) {
    return bad(error);
  }
}

/** 앱 카테고리 수동 오버라이드 (에디터). categories:null 이면 오버라이드 해제 */
export async function PATCH(req: Request) {
  if (!(await studioActor())) return unauthorized();
  try {
    const body = await req.json();
    if (!body.appKey) throw new Error("appKey required");
    const categories =
      body.categories === null
        ? null
        : Array.isArray(body.categories)
          ? body.categories.map(String).map((s: string) => s.trim()).filter(Boolean)
          : null;
    return NextResponse.json({ app: await setAppOverride(String(body.appKey), categories) });
  } catch (error) {
    return bad(error);
  }
}
