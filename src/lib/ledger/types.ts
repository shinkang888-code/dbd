export type LedgerStream =
  | "publish"
  | "sourcing"
  | "purchase"
  | "settlement"
  | "commerce"
  | "identity"
  | "security";

export type LedgerTxStatus = "pending" | "chained" | "block_assigned" | "tampered";

export const LEDGER_STREAM_LABELS: Record<LedgerStream, string> = {
  publish: "채널·PDP 게시",
  sourcing: "공급처 발주",
  purchase: "구매요청",
  settlement: "정산",
  commerce: "커머스 감사",
  identity: "신원 확인",
  security: "보안",
};

export interface LedgerEnqueueInput {
  tenantId: string;
  stream: LedgerStream;
  sourceTable: string;
  sourceId?: string | number | null;
  transData: Record<string, unknown>;
  hVId: string;
  actorUserId?: string;
  actorLoginId?: string;
}

export interface LedgerOverviewStats {
  enabled: boolean;
  identityCount: number;
  txPending: number;
  txChained: number;
  txBlockAssigned: number;
  txTampered: number;
  blockCount: number;
  anchorCount: number;
  alertOpen: number;
  lastBlockAt: string | null;
  lastAnchorAt: string | null;
  streams: { stream: string; pending: number; chained: number; blocks: number }[];
  health: "healthy" | "degraded" | "critical" | "disabled";
  healthMessage: string;
  config?: { anchorProvider: string; blockThreshold: string };
}
