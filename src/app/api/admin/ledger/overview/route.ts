import { NextResponse } from "next/server";
import { hasDb } from "@/db";
import { requireAdmin } from "@/lib/auth/admin";
import { getLedgerOverview } from "@/lib/ledger";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb()) {
    return NextResponse.json({
      enabled: false,
      health: "disabled",
      healthMessage: "DATABASE_URL 없음 — 원장 저장소 미연결",
      identityCount: 0,
      txPending: 0,
      txChained: 0,
      txBlockAssigned: 0,
      txTampered: 0,
      blockCount: 0,
      anchorCount: 0,
      alertOpen: 0,
      lastBlockAt: null,
      lastAnchorAt: null,
      streams: [],
    });
  }
  const overview = await getLedgerOverview();
  return NextResponse.json(overview);
}
