import { NextResponse } from "next/server";
import { hasDb } from "@/db";
import { runAllLedgerWorkers } from "@/lib/ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** 주기적 체인·블록·앵커 워커 — vercel.json crons */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDb()) {
    return NextResponse.json({ enabled: false, reason: "no DATABASE_URL" });
  }
  const result = await runAllLedgerWorkers({ includeIntegrityScan: true });
  return NextResponse.json(result);
}
