import { isLedgerEnabled } from "./ledgerConfig";
import { runChainWorker } from "./chainWorker";
import { runBlockWorker } from "./blockBuilder";
import { runAnchorWorker } from "./externalAnchor";
import { runIntegrityScan } from "./integrityScanner";

export interface LedgerWorkerRunResult {
  enabled: boolean;
  chain: { processed: number; errors: string[] };
  block: { blocksCreated: number; errors: string[] };
  anchor: { anchored: number; errors: string[] };
  integrity?: {
    scannedBlocks: number;
    scannedTx: number;
    alertsCreated: number;
    issues: string[];
  };
  durationMs: number;
}

export async function runAllLedgerWorkers(options?: {
  includeIntegrityScan?: boolean;
}): Promise<LedgerWorkerRunResult> {
  const start = Date.now();
  if (!isLedgerEnabled()) {
    return {
      enabled: false,
      chain: { processed: 0, errors: [] },
      block: { blocksCreated: 0, errors: [] },
      anchor: { anchored: 0, errors: [] },
      durationMs: 0,
    };
  }

  const chain = await runChainWorker();
  const block = await runBlockWorker();
  const anchor = await runAnchorWorker();
  let integrity;
  if (options?.includeIntegrityScan) {
    integrity = await runIntegrityScan();
  }

  return {
    enabled: true,
    chain,
    block,
    anchor,
    integrity,
    durationMs: Date.now() - start,
  };
}
