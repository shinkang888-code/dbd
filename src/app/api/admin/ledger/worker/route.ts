import { NextResponse } from "next/server";
import { hasDb } from "@/db";
import { requireAdmin } from "@/lib/auth/admin";
import { runAllLedgerWorkers, runReplayForAlert, runIntegrityScan } from "@/lib/ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "DATABASE_URL required" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: "worker" | "scan" | "replay";
    alertId?: string;
  };

  if (body.action === "replay" && body.alertId) {
    const result = await runReplayForAlert(body.alertId);
    return NextResponse.json(result);
  }
  if (body.action === "scan") {
    const integrity = await runIntegrityScan();
    return NextResponse.json({ integrity });
  }

  const result = await runAllLedgerWorkers({
    includeIntegrityScan: false,
  });
  return NextResponse.json(result);
}
