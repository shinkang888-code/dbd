import { NextResponse } from "next/server";
import { pollTracking, processPublishQueue } from "@/lib/hq/services";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** 일 1회 스윕: 게시 재시도 + 트래킹 폴링 (즉시 처리는 publish API가 인라인 수행) */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const publish = await processPublishQueue(50);
  const tracking = await pollTracking();
  return NextResponse.json({ publish, tracking });
}
