import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ledgerTransactions } from "@/db/schema";
import { GENESIS_HASH, computeTransactionHash } from "./hardBindingHash";
import { getIdentityHashById } from "./identityHash";

export interface ChainWorkerResult {
  processed: number;
  errors: string[];
}

export async function runChainWorker(): Promise<ChainWorkerResult> {
  const result: ChainWorkerResult = { processed: 0, errors: [] };
  const d = db();

  const pending = await d
    .select({
      id: ledgerTransactions.id,
      tenantId: ledgerTransactions.tenantId,
      stream: ledgerTransactions.stream,
      transData: ledgerTransactions.transData,
      hVId: ledgerTransactions.hVId,
    })
    .from(ledgerTransactions)
    .where(eq(ledgerTransactions.status, "pending"))
    .orderBy(asc(ledgerTransactions.createdAt))
    .limit(200);

  if (!pending.length) return result;

  const chainHeads = new Map<string, { hash: string; seq: number }>();

  for (const tx of pending) {
    const key = `${tx.tenantId}:${tx.stream}`;
    if (!chainHeads.has(key)) {
      chainHeads.set(key, await loadChainHead(tx.tenantId, tx.stream));
    }
    const head = chainHeads.get(key)!;

    const identity = await getIdentityHashById(tx.hVId);
    if (!identity) {
      result.errors.push(`missing H_v for tx ${tx.id}`);
      continue;
    }

    const txHash = computeTransactionHash(
      head.hash,
      tx.transData as Record<string, unknown>,
      identity.h_v,
    );
    const nextSeq = head.seq + 1;

    const updated = await d
      .update(ledgerTransactions)
      .set({
        prevHash: head.hash,
        txHash,
        status: "chained",
        seq: nextSeq,
      })
      .where(and(eq(ledgerTransactions.id, tx.id), eq(ledgerTransactions.status, "pending")))
      .returning({ id: ledgerTransactions.id });

    if (!updated.length) {
      result.errors.push(`chain race for tx ${tx.id}`);
      continue;
    }

    chainHeads.set(key, { hash: txHash, seq: nextSeq });
    result.processed += 1;
  }

  return result;
}

async function loadChainHead(
  tenantId: string,
  stream: string,
): Promise<{ hash: string; seq: number }> {
  const [row] = await db()
    .select({
      txHash: ledgerTransactions.txHash,
      seq: ledgerTransactions.seq,
    })
    .from(ledgerTransactions)
    .where(
      and(
        eq(ledgerTransactions.tenantId, tenantId),
        eq(ledgerTransactions.stream, stream),
        inArray(ledgerTransactions.status, ["chained", "block_assigned"]),
      ),
    )
    .orderBy(desc(ledgerTransactions.seq))
    .limit(1);

  if (row?.txHash) {
    return { hash: String(row.txHash), seq: Number(row.seq ?? 0) };
  }
  return { hash: GENESIS_HASH, seq: 0 };
}
