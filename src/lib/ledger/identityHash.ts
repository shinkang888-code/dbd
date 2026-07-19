import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { identityVerificationHashes } from "@/db/schema";
import { sha256Hex } from "./cryptoUtils";

export interface IdentityHashRecord {
  id: string;
  h_v: string;
  tenant_id: string;
  user_id: string;
  verified_at: string;
}

/** H_v = Hash(UserID + VerificationResult + Timestamp) */
export function computeIdentityHash(
  userId: string,
  verificationResult: "approved",
  verifiedAt: string,
): string {
  return sha256Hex(`${userId}|${verificationResult}|${verifiedAt}`);
}

export async function createIdentityHash(params: {
  tenantId: string;
  userId: string;
  sessionRef?: string;
  verifiedAt?: string;
}): Promise<IdentityHashRecord | null> {
  const verifiedAt = params.verifiedAt ?? new Date().toISOString();
  const h_v = computeIdentityHash(params.userId, "approved", verifiedAt);

  try {
    const [row] = await db()
      .insert(identityVerificationHashes)
      .values({
        tenantId: params.tenantId,
        userId: params.userId,
        verificationResult: "approved",
        verifiedAt: new Date(verifiedAt),
        hV: h_v,
        sessionRef: params.sessionRef ?? null,
      })
      .returning({
        id: identityVerificationHashes.id,
        hV: identityVerificationHashes.hV,
        tenantId: identityVerificationHashes.tenantId,
        userId: identityVerificationHashes.userId,
        verifiedAt: identityVerificationHashes.verifiedAt,
      });

    if (!row) return null;
    return {
      id: row.id,
      h_v: row.hV,
      tenant_id: row.tenantId,
      user_id: row.userId,
      verified_at: row.verifiedAt.toISOString(),
    };
  } catch (e) {
    console.error("[ledger/identityHash]", e);
    return null;
  }
}

/** 시스템·배치 작업용 신원 */
export async function getOrCreateSystemIdentityHash(
  tenantId: string,
): Promise<IdentityHashRecord | null> {
  const systemUserId = `system:${tenantId}`;
  const [existing] = await db()
    .select({
      id: identityVerificationHashes.id,
      hV: identityVerificationHashes.hV,
      tenantId: identityVerificationHashes.tenantId,
      userId: identityVerificationHashes.userId,
      verifiedAt: identityVerificationHashes.verifiedAt,
    })
    .from(identityVerificationHashes)
    .where(
      and(
        eq(identityVerificationHashes.tenantId, tenantId),
        eq(identityVerificationHashes.userId, systemUserId),
      ),
    )
    .orderBy(desc(identityVerificationHashes.createdAt))
    .limit(1);

  if (existing) {
    return {
      id: existing.id,
      h_v: existing.hV,
      tenant_id: existing.tenantId,
      user_id: existing.userId,
      verified_at: existing.verifiedAt.toISOString(),
    };
  }

  return createIdentityHash({
    tenantId,
    userId: systemUserId,
    sessionRef: "system",
  });
}

export async function getIdentityHashById(hVId: string): Promise<{ h_v: string } | null> {
  const [row] = await db()
    .select({ hV: identityVerificationHashes.hV })
    .from(identityVerificationHashes)
    .where(eq(identityVerificationHashes.id, hVId))
    .limit(1);
  return row ? { h_v: row.hV } : null;
}
