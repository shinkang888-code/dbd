import { NextResponse } from "next/server";
import { and, count, desc, eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { ledgerTransactions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ data: [], total: 0 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")));
  const stream = url.searchParams.get("stream")?.trim() || "";
  const status = url.searchParams.get("status")?.trim() || "";
  const offset = (page - 1) * pageSize;

  const filters = [];
  if (stream) filters.push(eq(ledgerTransactions.stream, stream));
  if (status) filters.push(eq(ledgerTransactions.status, status));
  const where = filters.length ? and(...filters) : undefined;

  const d = db();
  const [totalRow] = await d.select({ c: count() }).from(ledgerTransactions).where(where);
  const rows = await d
    .select({
      id: ledgerTransactions.id,
      tenant_id: ledgerTransactions.tenantId,
      stream: ledgerTransactions.stream,
      source_table: ledgerTransactions.sourceTable,
      status: ledgerTransactions.status,
      tx_hash: ledgerTransactions.txHash,
      prev_hash: ledgerTransactions.prevHash,
      seq: ledgerTransactions.seq,
      created_at: ledgerTransactions.createdAt,
      trans_data: ledgerTransactions.transData,
    })
    .from(ledgerTransactions)
    .where(where)
    .orderBy(desc(ledgerTransactions.createdAt))
    .limit(pageSize)
    .offset(offset);

  return NextResponse.json({
    data: rows.map((r) => ({
      ...r,
      created_at: r.created_at.toISOString(),
      trans_data: (r.trans_data ?? {}) as Record<string, unknown>,
    })),
    total: Number(totalRow?.c ?? 0),
  });
}
