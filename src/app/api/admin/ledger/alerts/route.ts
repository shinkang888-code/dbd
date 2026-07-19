import { NextResponse } from "next/server";
import { desc, isNull } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { ledgerIntegrityAlerts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ data: [] });

  const openOnly = new URL(req.url).searchParams.get("open") !== "0";
  const d = db();

  const rows = await d
    .select()
    .from(ledgerIntegrityAlerts)
    .where(openOnly ? isNull(ledgerIntegrityAlerts.resolvedAt) : undefined)
    .orderBy(desc(ledgerIntegrityAlerts.createdAt))
    .limit(100);

  return NextResponse.json({
    data: rows.map((a) => ({
      id: a.id,
      tenant_id: a.tenantId,
      alert_type: a.alertType,
      tamper_point_tx_id: a.tamperPointTxId,
      replay_status: a.replayStatus,
      details: (a.details ?? {}) as Record<string, unknown>,
      created_at: a.createdAt.toISOString(),
      resolved_at: a.resolvedAt?.toISOString() ?? null,
    })),
  });
}
