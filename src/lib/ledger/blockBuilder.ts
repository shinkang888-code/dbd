import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { ledgerBlocks, ledgerTransactions } from "@/db/schema";
import { buildMerkleRoot } from "./merkleTree";
import { computeBlockHash, GENESIS_HASH } from "./hardBindingHash";
import { ledgerBlockTxThreshold } from "./ledgerConfig";

export interface BlockWorkerResult {
  blocksCreated: number;
  errors: string[];
}

export async function runBlockWorker(): Promise<BlockWorkerResult> {
  const result: BlockWorkerResult = { blocksCreated: 0, errors: [] };
  const threshold = ledgerBlockTxThreshold();
  const d = db();

  const groups = await d
    .select({
      tenantId: ledgerTransactions.tenantId,
      stream: ledgerTransactions.stream,
    })
    .from(ledgerTransactions)
    .where(and(eq(ledgerTransactions.status, "chained"), isNull(ledgerTransactions.blockId)));

  const keys = new Set(groups.map((g) => `${g.tenantId}:${g.stream}`));

  for (const key of keys) {
    const [tenantId, stream] = key.split(":");
    const txs = await d
      .select({
        id: ledgerTransactions.id,
        txHash: ledgerTransactions.txHash,
      })
      .from(ledgerTransactions)
      .where(
        and(
          eq(ledgerTransactions.tenantId, tenantId),
          eq(ledgerTransactions.stream, stream),
          eq(ledgerTransactions.status, "chained"),
          isNull(ledgerTransactions.blockId),
        ),
      )
      .orderBy(asc(ledgerTransactions.seq))
      .limit(threshold);

    if (!txs.length) continue;

    const leaves = txs.map((t) => String(t.txHash));
    const merkleRoot = buildMerkleRoot(leaves);
    const now = new Date();
    const nowIso = now.toISOString();

    const [lastBlock] = await d
      .select({
        blockHeight: ledgerBlocks.blockHeight,
        blockHash: ledgerBlocks.blockHash,
      })
      .from(ledgerBlocks)
      .where(and(eq(ledgerBlocks.tenantId, tenantId), eq(ledgerBlocks.stream, stream)))
      .orderBy(desc(ledgerBlocks.blockHeight))
      .limit(1);

    const blockHeight = lastBlock ? Number(lastBlock.blockHeight) + 1 : 1;
    const prevBlockHash = lastBlock ? String(lastBlock.blockHash) : GENESIS_HASH;
    const blockHash = computeBlockHash(prevBlockHash, merkleRoot, blockHeight, nowIso);

    try {
      const [block] = await d
        .insert(ledgerBlocks)
        .values({
          tenantId,
          stream,
          blockHeight,
          prevBlockHash,
          merkleRoot,
          blockHash,
          txCount: txs.length,
          createdAt: now,
        })
        .returning({ id: ledgerBlocks.id });

      if (!block) {
        result.errors.push("block insert failed");
        continue;
      }

      for (const tx of txs) {
        await d
          .update(ledgerTransactions)
          .set({ blockId: block.id, status: "block_assigned" })
          .where(and(eq(ledgerTransactions.id, tx.id), eq(ledgerTransactions.status, "chained")));
      }

      result.blocksCreated += 1;
    } catch (e) {
      result.errors.push(e instanceof Error ? e.message : "block worker error");
    }
  }

  return result;
}
