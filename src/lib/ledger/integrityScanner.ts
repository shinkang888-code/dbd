import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ledgerAnchors, ledgerBlocks, ledgerIntegrityAlerts, ledgerTransactions } from "@/db/schema";
import { buildMerkleRoot, findTamperedLeafIndex } from "./merkleTree";
import { computeTransactionHash, computeAnchorHash } from "./hardBindingHash";
import { getIdentityHashById } from "./identityHash";

export interface IntegrityScanResult {
  scannedBlocks: number;
  scannedTx: number;
  alertsCreated: number;
  issues: string[];
}

export async function runIntegrityScan(): Promise<IntegrityScanResult> {
  const result: IntegrityScanResult = {
    scannedBlocks: 0,
    scannedTx: 0,
    alertsCreated: 0,
    issues: [],
  };
  const d = db();

  const chainedTx = await d
    .select({
      id: ledgerTransactions.id,
      tenantId: ledgerTransactions.tenantId,
      stream: ledgerTransactions.stream,
      transData: ledgerTransactions.transData,
      hVId: ledgerTransactions.hVId,
      prevHash: ledgerTransactions.prevHash,
      txHash: ledgerTransactions.txHash,
      seq: ledgerTransactions.seq,
    })
    .from(ledgerTransactions)
    .where(inArray(ledgerTransactions.status, ["chained", "block_assigned"]))
    .orderBy(asc(ledgerTransactions.seq))
    .limit(500);

  const byStream = new Map<string, typeof chainedTx>();
  for (const tx of chainedTx) {
    const key = `${tx.tenantId}:${tx.stream}`;
    if (!byStream.has(key)) byStream.set(key, []);
    byStream.get(key)!.push(tx);
  }

  for (const [, txs] of byStream) {
    if (!txs.length) continue;
    let expectedPrev = txs[0]?.prevHash as string;
    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      result.scannedTx += 1;
      const identity = await getIdentityHashById(tx.hVId);
      if (!identity) {
        await createAlert(tx.tenantId, "missing_h_v", tx.id, { message: "신원 해시 H_v 누락" });
        result.alertsCreated += 1;
        continue;
      }
      const recomputed = computeTransactionHash(
        String(tx.prevHash),
        tx.transData as Record<string, unknown>,
        identity.h_v,
      );
      if (recomputed !== tx.txHash) {
        await createAlert(tx.tenantId, "tx_hash_mismatch", tx.id, {
          expected: recomputed,
          stored: tx.txHash,
        });
        result.alertsCreated += 1;
        result.issues.push(`tx ${tx.id} hash mismatch`);
      }
      if (i > 0 && tx.prevHash !== expectedPrev) {
        await createAlert(tx.tenantId, "chain_break", tx.id, {
          expectedPrev,
          actualPrev: tx.prevHash,
        });
        result.alertsCreated += 1;
      }
      expectedPrev = tx.txHash as string;
    }
  }

  const blocks = await d
    .select({
      id: ledgerBlocks.id,
      tenantId: ledgerBlocks.tenantId,
      merkleRoot: ledgerBlocks.merkleRoot,
    })
    .from(ledgerBlocks)
    .orderBy(desc(ledgerBlocks.createdAt))
    .limit(100);

  for (const block of blocks) {
    result.scannedBlocks += 1;
    const blockTxs = await d
      .select({ id: ledgerTransactions.id, txHash: ledgerTransactions.txHash })
      .from(ledgerTransactions)
      .where(eq(ledgerTransactions.blockId, block.id))
      .orderBy(asc(ledgerTransactions.seq));

    const leaves = blockTxs.map((t) => String(t.txHash));
    const computedRoot = buildMerkleRoot(leaves);
    if (computedRoot !== block.merkleRoot) {
      const tamperIdx = findTamperedLeafIndex(leaves, String(block.merkleRoot));
      const tamperTxId = tamperIdx !== null ? (blockTxs[tamperIdx]?.id ?? null) : null;
      await createAlert(block.tenantId, "merkle_root_mismatch", tamperTxId, {
        blockId: block.id,
        computedRoot,
        storedRoot: block.merkleRoot,
      });
      result.alertsCreated += 1;
      result.issues.push(`block ${block.id} merkle mismatch`);
    }
  }

  const anchors = await d
    .select({
      id: ledgerAnchors.id,
      blockId: ledgerAnchors.blockId,
      anchorHash: ledgerAnchors.anchorHash,
    })
    .from(ledgerAnchors)
    .limit(100);

  for (const anchor of anchors) {
    const [block] = await d
      .select({
        tenantId: ledgerBlocks.tenantId,
        blockHash: ledgerBlocks.blockHash,
        createdAt: ledgerBlocks.createdAt,
      })
      .from(ledgerBlocks)
      .where(eq(ledgerBlocks.id, anchor.blockId))
      .limit(1);
    if (!block?.blockHash) continue;
    const expected = computeAnchorHash(String(block.blockHash), block.createdAt.toISOString());
    if (expected !== anchor.anchorHash) {
      await createAlert(block.tenantId, "anchor_mismatch", null, {
        anchorId: anchor.id,
        expected,
        stored: anchor.anchorHash,
      });
      result.alertsCreated += 1;
    }
  }

  return result;
}

async function createAlert(
  tenantId: string,
  alertType: string,
  tamperTxId: string | null,
  details: Record<string, unknown>,
): Promise<void> {
  await db().insert(ledgerIntegrityAlerts).values({
    tenantId,
    alertType,
    tamperPointTxId: tamperTxId,
    details,
    replayStatus: "pending",
  });
}

export async function runReplayForAlert(
  alertId: string,
): Promise<{ ok: boolean; message: string }> {
  const d = db();
  const [alert] = await d
    .select()
    .from(ledgerIntegrityAlerts)
    .where(eq(ledgerIntegrityAlerts.id, alertId))
    .limit(1);

  if (!alert) return { ok: false, message: "알림 없음" };

  await d
    .update(ledgerIntegrityAlerts)
    .set({ replayStatus: "running" })
    .where(eq(ledgerIntegrityAlerts.id, alertId));

  const scan = await runIntegrityScan();

  await d
    .update(ledgerIntegrityAlerts)
    .set({
      replayStatus: scan.issues.length === 0 ? "completed" : "failed",
      resolvedAt: scan.issues.length === 0 ? new Date() : null,
      details: { ...((alert.details as object) ?? {}), replayScan: scan },
    })
    .where(eq(ledgerIntegrityAlerts.id, alertId));

  return {
    ok: scan.issues.length === 0,
    message: scan.issues.length === 0 ? "리플레이 검증 완료" : scan.issues.join("; "),
  };
}
