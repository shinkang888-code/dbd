import { and, eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { contentDocuments, contentVersions, publishEvents } from "@/db/schema";
import {
  cafe24AdminGetProduct,
  cafe24AdminUpdateProductDescription,
} from "@/lib/cafe24/admin-products";
import { cafe24ShopNo } from "@/lib/cafe24/config";

export async function publishDocumentToCafe24(input: {
  documentId: number;
  actor: string;
  /** 롤백 대상 버전 — action=rollback 일 때만 사용 */
  version?: number;
  action?: "publish" | "rollback";
}) {
  if (!hasDb()) throw new Error("DATABASE_URL required");
  const d = db();
  const [doc] = await d
    .select()
    .from(contentDocuments)
    .where(eq(contentDocuments.id, input.documentId))
    .limit(1);
  if (!doc) throw new Error("document not found");
  if (!doc.cafe24ProductNo) throw new Error("Cafe24 product_no required");

  const isRollback = input.action === "rollback" || Boolean(input.version);
  if (isRollback) {
    if (!input.version) throw new Error("rollback requires version");
    if (!["approved", "published"].includes(doc.status)) {
      throw new Error("게시·승인된 문서만 롤백할 수 있습니다");
    }
  } else if (doc.status !== "approved") {
    throw new Error("승인된 문서만 Cafe24에 게시할 수 있습니다");
  }

  let version = doc.currentVersion;
  let renderedHtml = doc.renderedHtml;
  let body = doc.body;
  if (isRollback && input.version) {
    const [snapshot] = await d
      .select()
      .from(contentVersions)
      .where(
        and(
          eq(contentVersions.documentId, doc.id),
          eq(contentVersions.version, input.version),
        ),
      )
      .limit(1);
    if (!snapshot) throw new Error("content version not found");
    version = snapshot.version;
    renderedHtml = snapshot.renderedHtml;
    body = snapshot.body;
  }

  // 멱등: 동일 documentId+version 이 이미 성공 게시된 경우 재PUT 생략
  if (!isRollback) {
    const [existing] = await d
      .select()
      .from(publishEvents)
      .where(
        and(
          eq(publishEvents.documentId, doc.id),
          eq(publishEvents.version, version),
          eq(publishEvents.status, "published"),
        ),
      )
      .limit(1);
    if (existing) {
      return {
        eventId: existing.id,
        documentId: doc.id,
        version,
        productNo: doc.cafe24ProductNo,
        status: "published" as const,
        idempotent: true,
      };
    }
  }

  if (!renderedHtml) {
    const description =
      typeof body === "object" && body && "description" in body
        ? String((body as { description: unknown }).description)
        : "";
    renderedHtml = `<section class="lexi-pdp"><p>${escapeHtml(description)}</p></section>`;
  }

  const seo =
    typeof body === "object" && body && "seo" in body
      ? (body as { seo?: { productName?: string; summary?: string } }).seo
      : undefined;

  const [event] = await d
    .insert(publishEvents)
    .values({
      documentId: doc.id,
      version,
      target: "cafe24_product_description",
      status: "publishing",
      requestPayload: {
        shop_no: cafe24ShopNo(),
        product_no: doc.cafe24ProductNo,
        description: renderedHtml,
        seo: seo ?? null,
        action: isRollback ? "rollback" : "publish",
      },
      publishedBy: input.actor,
    })
    .returning();

  try {
    const previous = await cafe24AdminGetProduct(doc.cafe24ProductNo);
    const response = await cafe24AdminUpdateProductDescription({
      productNo: doc.cafe24ProductNo,
      description: renderedHtml,
      productName: seo?.productName,
      summaryDescription: seo?.summary,
    });

    const status = isRollback ? "rolled_back" : "published";
    await d
      .update(publishEvents)
      .set({
        status,
        remoteRef: String(doc.cafe24ProductNo),
        previousSnapshot: previous?.product ?? null,
        responsePayload: response,
        publishedAt: new Date(),
      })
      .where(eq(publishEvents.id, event.id));
    await d
      .update(contentDocuments)
      .set({
        status: "published",
        currentVersion: version,
        renderedHtml,
        body,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contentDocuments.id, doc.id));

    return {
      eventId: event.id,
      documentId: doc.id,
      version,
      productNo: doc.cafe24ProductNo,
      status,
      idempotent: false,
    };
  } catch (error) {
    await d
      .update(publishEvents)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : "Cafe24 publish failed",
      })
      .where(eq(publishEvents.id, event.id));
    throw error;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
