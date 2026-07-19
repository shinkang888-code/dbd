import { db } from "@/db";
import { ledgerTransactions } from "@/db/schema";
import type { LedgerEnqueueInput } from "./types";
import { isLedgerEnabled } from "./ledgerConfig";

export async function ledgerEnqueue(input: LedgerEnqueueInput): Promise<string | null> {
  if (!isLedgerEnabled()) return null;

  try {
    const [row] = await db()
      .insert(ledgerTransactions)
      .values({
        tenantId: input.tenantId,
        stream: input.stream,
        sourceTable: input.sourceTable,
        sourceId: input.sourceId != null ? String(input.sourceId) : null,
        transData: {
          ...input.transData,
          _actorUserId: input.actorUserId ?? null,
          _actorLoginId: input.actorLoginId ?? null,
          _enqueuedAt: new Date().toISOString(),
        },
        hVId: input.hVId,
        status: "pending",
      })
      .returning({ id: ledgerTransactions.id });

    return row?.id ?? null;
  } catch (e) {
    console.error("[ledger/enqueue]", e);
    return null;
  }
}
