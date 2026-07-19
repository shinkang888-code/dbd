import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ledgerAnchors, ledgerBlocks } from "@/db/schema";
import { computeAnchorHash } from "./hardBindingHash";
import { ledgerAnchorProvider } from "./ledgerConfig";

export interface AnchorWorkerResult {
  anchored: number;
  errors: string[];
}

export async function runAnchorWorker(): Promise<AnchorWorkerResult> {
  const result: AnchorWorkerResult = { anchored: 0, errors: [] };
  const provider = ledgerAnchorProvider();
  const d = db();

  const blocks = await d
    .select({
      id: ledgerBlocks.id,
      blockHash: ledgerBlocks.blockHash,
      merkleRoot: ledgerBlocks.merkleRoot,
      createdAt: ledgerBlocks.createdAt,
    })
    .from(ledgerBlocks)
    .orderBy(asc(ledgerBlocks.createdAt))
    .limit(50);

  for (const block of blocks) {
    const [existing] = await d
      .select({ id: ledgerAnchors.id })
      .from(ledgerAnchors)
      .where(eq(ledgerAnchors.blockId, block.id))
      .limit(1);

    if (existing) continue;

    const timestamp = block.createdAt.toISOString();
    const anchorHash = computeAnchorHash(String(block.blockHash), timestamp);

    let externalTxId: string | null = null;
    let anchorProof: Record<string, unknown> = { method: provider, timestamp };

    if (provider === "opentimestamps") {
      const ots = await tryOpenTimestamps(String(block.blockHash));
      if (ots) {
        externalTxId = ots.submitHash;
        anchorProof = { ...anchorProof, ...ots };
      }
    }

    try {
      await d.insert(ledgerAnchors).values({
        blockId: block.id,
        merkleRoot: block.merkleRoot,
        anchorHash,
        externalNetwork: provider,
        externalTxId,
        anchorProof,
      });
      result.anchored += 1;
    } catch (e) {
      result.errors.push(e instanceof Error ? e.message : "anchor insert failed");
    }
  }

  return result;
}

async function tryOpenTimestamps(blockHash: string): Promise<{
  submitHash: string;
  calendar: string;
} | null> {
  const calendar =
    process.env.OPENTIMESTAMP_CALENDAR?.trim() || "https://a.pool.opentimestamps.org";
  try {
    const digest = Buffer.from(blockHash, "hex");
    const res = await fetch(`${calendar}/digest`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: digest,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const submitHash = (await res.text()).trim();
    return { submitHash, calendar };
  } catch {
    return null;
  }
}
