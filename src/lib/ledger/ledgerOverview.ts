import { count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  identityVerificationHashes,
  ledgerAnchors,
  ledgerBlocks,
  ledgerIntegrityAlerts,
  ledgerTransactions,
} from "@/db/schema";
import { isLedgerEnabled, ledgerAnchorProvider, ledgerBlockTxThreshold } from "./ledgerConfig";
import type { LedgerOverviewStats } from "./types";

export async function getLedgerOverview(): Promise<LedgerOverviewStats> {
  if (!isLedgerEnabled()) {
    return {
      enabled: false,
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
      health: "disabled",
      healthMessage: "LEDGER_ENABLED=false — 분산 원장 비활성",
      config: {
        anchorProvider: ledgerAnchorProvider(),
        blockThreshold: String(ledgerBlockTxThreshold()),
      },
    };
  }

  const d = db();

  const [
    [identityRow],
    [pendingRow],
    [chainedRow],
    [assignedRow],
    [tamperedRow],
    [blockRow],
    [anchorRow],
    [alertRow],
    lastBlock,
    lastAnchor,
    streamRows,
    blockStreams,
  ] = await Promise.all([
    d.select({ c: count() }).from(identityVerificationHashes),
    d.select({ c: count() }).from(ledgerTransactions).where(eq(ledgerTransactions.status, "pending")),
    d.select({ c: count() }).from(ledgerTransactions).where(eq(ledgerTransactions.status, "chained")),
    d
      .select({ c: count() })
      .from(ledgerTransactions)
      .where(eq(ledgerTransactions.status, "block_assigned")),
    d.select({ c: count() }).from(ledgerTransactions).where(eq(ledgerTransactions.status, "tampered")),
    d.select({ c: count() }).from(ledgerBlocks),
    d.select({ c: count() }).from(ledgerAnchors),
    d
      .select({ c: count() })
      .from(ledgerIntegrityAlerts)
      .where(isNull(ledgerIntegrityAlerts.resolvedAt)),
    d
      .select({ createdAt: ledgerBlocks.createdAt })
      .from(ledgerBlocks)
      .orderBy(desc(ledgerBlocks.createdAt))
      .limit(1),
    d
      .select({ anchoredAt: ledgerAnchors.anchoredAt })
      .from(ledgerAnchors)
      .orderBy(desc(ledgerAnchors.anchoredAt))
      .limit(1),
    d.select({ stream: ledgerTransactions.stream, status: ledgerTransactions.status }).from(ledgerTransactions),
    d.select({ stream: ledgerBlocks.stream }).from(ledgerBlocks),
  ]);

  const identityCount = Number(identityRow?.c ?? 0);
  const txPending = Number(pendingRow?.c ?? 0);
  const txChained = Number(chainedRow?.c ?? 0);
  const txBlockAssigned = Number(assignedRow?.c ?? 0);
  const txTampered = Number(tamperedRow?.c ?? 0);
  const blockCount = Number(blockRow?.c ?? 0);
  const anchorCount = Number(anchorRow?.c ?? 0);
  const alertOpen = Number(alertRow?.c ?? 0);

  const streamMap = new Map<string, { pending: number; chained: number; blocks: number }>();
  for (const row of streamRows) {
    const s = String(row.stream);
    if (!streamMap.has(s)) streamMap.set(s, { pending: 0, chained: 0, blocks: 0 });
    const entry = streamMap.get(s)!;
    if (row.status === "pending") entry.pending += 1;
    if (row.status === "chained") entry.chained += 1;
  }
  for (const b of blockStreams) {
    const s = String(b.stream);
    if (!streamMap.has(s)) streamMap.set(s, { pending: 0, chained: 0, blocks: 0 });
    streamMap.get(s)!.blocks += 1;
  }

  let health: LedgerOverviewStats["health"] = "healthy";
  let healthMessage = "모든 원장 파이프라인 정상";

  if (txTampered > 0 || alertOpen > 0) {
    health = "critical";
    healthMessage = `변조·무결성 알림 ${alertOpen}건, tampered ${txTampered}건`;
  } else if (txPending > 50) {
    health = "degraded";
    healthMessage = `대기 중인 거래 ${txPending}건 — 워커 지연 가능`;
  }

  return {
    enabled: true,
    identityCount,
    txPending,
    txChained,
    txBlockAssigned,
    txTampered,
    blockCount,
    anchorCount,
    alertOpen,
    lastBlockAt: lastBlock[0]?.createdAt?.toISOString() ?? null,
    lastAnchorAt: lastAnchor[0]?.anchoredAt?.toISOString() ?? null,
    streams: [...streamMap.entries()].map(([stream, v]) => ({ stream, ...v })),
    health,
    healthMessage,
    config: {
      anchorProvider: ledgerAnchorProvider(),
      blockThreshold: String(ledgerBlockTxThreshold()),
    },
  };
}
