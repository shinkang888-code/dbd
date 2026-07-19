import { hasDb } from "@/db";
import { getOrCreateSystemIdentityHash } from "./identityHash";
import { ledgerEnqueue } from "./ledgerEnqueue";
import { isLedgerEnabled, ledgerTenantId } from "./ledgerConfig";
import { sha256Hex, canonicalJson } from "./cryptoUtils";
import type { LedgerStream } from "./types";

/**
 * 커머스·파이프라인 이벤트 → HDL enqueue (본문 대신 content hash 저장)
 * DB 없거나 원장 비활성이면 silent no-op.
 */
export async function recordLedgerEvent(input: {
  stream: LedgerStream;
  sourceTable: string;
  sourceId?: string | number | null;
  eventType: string;
  payload?: Record<string, unknown>;
  actorUserId?: string;
  actorLoginId?: string;
}): Promise<string | null> {
  if (!isLedgerEnabled() || !hasDb()) return null;

  try {
    const tenantId = ledgerTenantId();
    const identity = await getOrCreateSystemIdentityHash(tenantId);
    if (!identity) return null;

    const payload = input.payload ?? {};
    const contentHash = sha256Hex(canonicalJson(payload));

    return ledgerEnqueue({
      tenantId,
      stream: input.stream,
      sourceTable: input.sourceTable,
      sourceId: input.sourceId,
      hVId: identity.id,
      actorUserId: input.actorUserId,
      actorLoginId: input.actorLoginId,
      transData: {
        eventType: input.eventType,
        contentHash,
        // 민감 본문 제외 — 요약 키만
        summary: summarizePayload(payload),
      },
    });
  } catch (e) {
    console.error("[ledger/record]", e);
    return null;
  }
}

function summarizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const keys = [
    "action",
    "status",
    "channel",
    "listingId",
    "documentId",
    "productNo",
    "orderRef",
    "externalRef",
    "version",
  ];
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (payload[k] !== undefined) out[k] = payload[k];
  }
  return out;
}
