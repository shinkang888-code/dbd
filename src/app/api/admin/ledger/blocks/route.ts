import { NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { ledgerAnchors, ledgerBlocks } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ data: [], total: 0 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "15")));
  const offset = (page - 1) * pageSize;

  const d = db();
  const [totalRow] = await d.select({ c: count() }).from(ledgerBlocks);
  const blocks = await d
    .select()
    .from(ledgerBlocks)
    .orderBy(desc(ledgerBlocks.blockHeight))
    .limit(pageSize)
    .offset(offset);

  const data = [];
  for (const b of blocks) {
    const [anchor] = await d
      .select({
        anchor_hash: ledgerAnchors.anchorHash,
        external_network: ledgerAnchors.externalNetwork,
        external_tx_id: ledgerAnchors.externalTxId,
        anchored_at: ledgerAnchors.anchoredAt,
      })
      .from(ledgerAnchors)
      .where(eq(ledgerAnchors.blockId, b.id))
      .limit(1);

    data.push({
      id: b.id,
      tenant_id: b.tenantId,
      stream: b.stream,
      block_height: b.blockHeight,
      merkle_root: b.merkleRoot,
      block_hash: b.blockHash,
      tx_count: b.txCount,
      created_at: b.createdAt.toISOString(),
      anchor: anchor
        ? {
            ...anchor,
            anchored_at: anchor.anchored_at.toISOString(),
          }
        : null,
    });
  }

  return NextResponse.json({ data, total: Number(totalRow?.c ?? 0) });
}
