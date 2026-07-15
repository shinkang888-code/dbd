/**
 * HQ 서비스 레이어 — 상태 전이의 유일한 통로. 스펙 §2 P3~P6, §6 상태머신
 */
import { audit, iso, mutate, nextId } from "./store";
import type { HqState } from "./store";
import type { MarginPolicy, PurchaseRequest } from "./types";
import { computeSellPrice, toUsd } from "./types";
import { getChannelAdapter } from "@/lib/channels/registry";
import type { PulledOrder } from "@/lib/channels/types";
import { getConnector } from "@/lib/sourcing/registry";

/* ---------- P3: 승인 게이트 → 리스팅 생성 ---------- */
export async function reviewDraft(
  draftId: number,
  decision: "approved" | "rejected",
  actor: string,
  marginPolicy?: MarginPolicy,
) {
  return mutate((s) => {
    const draft = s.drafts.find((d) => d.id === draftId);
    if (!draft) throw new Error("draft not found");
    if (draft.status !== "review" && draft.status !== "draft") throw new Error(`invalid state: ${draft.status}`);
    const from = draft.status;
    draft.status = decision;
    draft.reviewedBy = actor;
    draft.reviewedAt = iso();
    audit(s, "listing_draft", draft.id, decision, actor, from);
    if (decision === "rejected") return { draft };

    const sp = s.supplierProducts.find((p) => p.id === draft.supplierProductId);
    if (!sp) throw new Error("supplier product missing");
    const policy: MarginPolicy = marginPolicy ?? { type: "rate", value: 0.35, minMarginUsd: 3 };
    const costUsd = toUsd(sp.priceOriginal, sp.currency, s.fx);
    const listing = {
      id: nextId(s),
      draftId: draft.id,
      productSlug: "",
      marginPolicy: policy,
      supplierCostUsd: costUsd,
      sellPriceUsd: computeSellPrice(costUsd, policy),
      status: "ready" as const,
      createdAt: iso(),
    };
    s.listings.unshift(listing);
    audit(s, "listing", listing.id, "ready", actor, undefined, { costUsd, sellPriceUsd: listing.sellPriceUsd });
    return { draft, listing };
  });
}

/* ---------- P4: 채널 게시 ---------- */
export async function queuePublish(listingId: number, channelCodes: string[], actor: string) {
  return mutate((s) => {
    const listing = s.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error("listing not found");
    const queued: number[] = [];
    for (const code of channelCodes) {
      const channel = s.channels.find((c) => c.code === code);
      if (!channel) continue;
      let cl = s.channelListings.find((x) => x.listingId === listingId && x.channelId === channel.id);
      if (!cl) {
        cl = { id: nextId(s), listingId, channelId: channel.id, publishState: "queued", retryCount: 0 };
        s.channelListings.unshift(cl);
      } else if (cl.publishState === "failed" || cl.publishState === "delisted") {
        cl.publishState = "queued";
      }
      queued.push(cl.id);
      audit(s, "channel_listing", cl.id, "queued", actor, undefined, { channel: code });
    }
    return { queued };
  });
}

export async function processPublishQueue(limit = 10) {
  return mutate(async (s) => {
    const queue = s.channelListings.filter((c) => c.publishState === "queued").slice(0, limit);
    const results: { id: number; state: string; error?: string }[] = [];
    for (const cl of queue) {
      const listing = s.listings.find((l) => l.id === cl.listingId);
      const draft = listing && s.drafts.find((d) => d.id === listing.draftId);
      const channel = s.channels.find((c) => c.id === cl.channelId);
      if (!listing || !draft || !channel) {
        cl.publishState = "failed";
        cl.lastError = "broken reference";
        continue;
      }
      const adapter = getChannelAdapter(channel.code);
      try {
        if (!adapter) throw new Error(`no adapter: ${channel.code} (업로드 패키지 export 사용)`);
        const { externalRef } = await adapter.publish({ channel, listing, draft });
        cl.externalRef = externalRef;
        cl.publishState = "live";
        cl.lastPushedAt = iso();
        cl.lastError = undefined;
        if (channel.code === "lexi" && externalRef.startsWith("lexi:")) {
          listing.productSlug = externalRef.slice(5);
        }
        if (listing.status === "ready") listing.status = "published";
        audit(s, "channel_listing", cl.id, "live", "system", "queued", { externalRef });
        results.push({ id: cl.id, state: "live" });
      } catch (e) {
        cl.retryCount += 1;
        cl.publishState = cl.retryCount >= 3 ? "failed" : "queued";
        cl.lastError = e instanceof Error ? e.message : String(e);
        audit(s, "channel_listing", cl.id, cl.publishState, "system", "queued", { error: cl.lastError });
        results.push({ id: cl.id, state: cl.publishState, error: cl.lastError });
      }
    }
    return { processed: results.length, results };
  });
}

/* ---------- P5: 구매요청 인입 ---------- */
const DEFAULT_HEADERS = [
  "order_ref", "listing_ref", "qty", "paid_amount", "currency",
  "buyer_name", "country", "addr1", "addr2", "zip", "phone",
];

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const split = (l: string) =>
    (l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? [])
      .map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'))
      .slice(0, -0 || undefined);
  const headers = split(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

function intakeRow(
  s: HqState,
  channelId: number,
  batchId: number | undefined,
  o: PulledOrder,
): PurchaseRequest | string {
  if (!o.externalOrderRef) return "missing order_ref";
  if (s.purchaseRequests.some((p) => p.channelId === channelId && p.externalOrderRef === o.externalOrderRef)) {
    return "duplicate order_ref";
  }
  const cl = o.externalListingRef
    ? s.channelListings.find((c) => c.channelId === channelId && c.externalRef === o.externalListingRef)
    : undefined;
  const pr: PurchaseRequest = {
    id: nextId(s),
    channelId,
    importBatchId: batchId,
    externalOrderRef: o.externalOrderRef,
    channelListingId: cl?.id,
    rawRow: o.raw as Record<string, string> | undefined,
    buyerName: o.buyerName,
    buyerCountry: o.buyerCountry,
    shippingAddress: o.shippingAddress,
    qty: o.qty || 1,
    channelPaidAmount: o.paidAmount,
    channelCurrency: o.currency || "USD",
    status: cl ? "matched" : "received",
    createdAt: iso(),
  };
  s.purchaseRequests.unshift(pr);
  audit(s, "purchase_request", pr.id, pr.status, "system", undefined, { ref: pr.externalOrderRef });
  return pr;
}

export async function importPurchaseCsv(channelCode: string, filename: string, csv: string, actor: string) {
  return mutate((s) => {
    const channel = s.channels.find((c) => c.code === channelCode);
    if (!channel) throw new Error("unknown channel");
    const headerMap = channel.config.headerMap ?? {};
    const rows = parseCsv(csv);
    const batch = {
      id: nextId(s), channelId: channel.id, filename,
      rowCount: rows.length, okCount: 0,
      errorRows: [] as { line: number; error: string }[],
      importedBy: actor, importedAt: iso(),
    };
    rows.forEach((raw, i) => {
      const get = (key: string) => raw[headerMap[key] ?? key] ?? "";
      const result = intakeRow(s, channel.id, batch.id, {
        externalOrderRef: get("order_ref"),
        externalListingRef: get("listing_ref") || undefined,
        buyerName: get("buyer_name"),
        buyerCountry: (get("country") || "US").toUpperCase().slice(0, 2),
        shippingAddress: {
          name: get("buyer_name"), country: get("country"),
          addr1: get("addr1"), addr2: get("addr2"), zip: get("zip"), phone: get("phone"),
        },
        qty: parseInt(get("qty") || "1", 10) || 1,
        paidAmount: parseFloat(get("paid_amount") || "0") || 0,
        currency: (get("currency") || "USD").toUpperCase(),
        raw,
      });
      if (typeof result === "string") batch.errorRows.push({ line: i + 2, error: result });
      else batch.okCount++;
    });
    s.importBatches.unshift(batch);
    return { batchId: batch.id, rowCount: batch.rowCount, okCount: batch.okCount, errors: batch.errorRows, expectedHeaders: DEFAULT_HEADERS };
  });
}

export async function pullChannelOrders(channelCode: string) {
  return mutate(async (s) => {
    const channel = s.channels.find((c) => c.code === channelCode);
    if (!channel) throw new Error("unknown channel");
    const adapter = getChannelAdapter(channel.code);
    if (!adapter?.pullOrders) throw new Error("pullOrders unsupported — 엑셀 인입 사용");
    const liveListings = s.channelListings.filter((c) => c.channelId === channel.id && c.publishState === "live");
    const orders = await adapter.pullOrders(channel, { liveListings });
    let ok = 0;
    for (const o of orders) if (typeof intakeRow(s, channel.id, undefined, o) !== "string") ok++;
    return { pulled: orders.length, created: ok };
  });
}

/* ---------- P5: 검수 ---------- */
export async function vetPurchaseRequest(
  prId: number,
  decision: "vetted" | "rejected" | "refund_delegated",
  actor: string,
  reason?: string,
) {
  return mutate((s) => {
    const pr = s.purchaseRequests.find((p) => p.id === prId);
    if (!pr) throw new Error("purchase request not found");
    const from = pr.status;
    if (decision === "vetted" && !(from === "received" || from === "matched")) throw new Error(`invalid transition ${from}→vetted`);
    pr.status = decision;
    pr.vettedBy = actor;
    pr.vettedAt = iso();
    if (reason) pr.rejectReason = reason;
    audit(s, "purchase_request", pr.id, decision, actor, from, reason ? { reason } : undefined);

    // 검수 경고 계산(참고용 반환)
    const warnings: string[] = [];
    const cl = pr.channelListingId ? s.channelListings.find((c) => c.id === pr.channelListingId) : undefined;
    const listing = cl && s.listings.find((l) => l.id === cl.listingId);
    if (listing) {
      const revenueUsd = toUsd(pr.channelPaidAmount, pr.channelCurrency, s.fx);
      const marginUsd = revenueUsd - listing.supplierCostUsd * pr.qty;
      if (marginUsd < listing.marginPolicy.minMarginUsd) warnings.push(`마진 미달: $${marginUsd.toFixed(2)}`);
    } else {
      warnings.push("리스팅 미매칭 — 수동 매칭 필요");
    }
    return { pr, warnings };
  });
}

export async function matchPurchaseRequest(prId: number, channelListingId: number, actor: string) {
  return mutate((s) => {
    const pr = s.purchaseRequests.find((p) => p.id === prId);
    const cl = s.channelListings.find((c) => c.id === channelListingId);
    if (!pr || !cl) throw new Error("not found");
    pr.channelListingId = cl.id;
    if (pr.status === "received") pr.status = "matched";
    audit(s, "purchase_request", pr.id, "matched", actor);
    return pr;
  });
}

/* ---------- P5→P6: 발주 ---------- */
export async function createSourcingOrder(prId: number, actor: string) {
  return mutate(async (s) => {
    const pr = s.purchaseRequests.find((p) => p.id === prId);
    if (!pr) throw new Error("purchase request not found");
    if (pr.status !== "vetted") throw new Error(`검수(vetted) 상태에서만 발주 가능 (현재: ${pr.status})`);
    if (s.sourcingOrders.some((o) => o.purchaseRequestId === pr.id)) throw new Error("이미 발주됨");

    const cl = pr.channelListingId ? s.channelListings.find((c) => c.id === pr.channelListingId) : undefined;
    const listing = cl && s.listings.find((l) => l.id === cl.listingId);
    const draft = listing && s.drafts.find((d) => d.id === listing.draftId);
    const sp = draft && s.supplierProducts.find((p) => p.id === draft.supplierProductId);
    if (!sp || !listing) throw new Error("리스팅→공급처상품 역추적 실패 — 수동 매칭 확인");
    const supplier = s.suppliers.find((x) => x.id === sp.supplierId)!;

    const connector = getConnector(supplier.code);
    let supplierOrderRef: string | undefined;
    if (connector?.placeOrder) {
      const r = await connector.placeOrder({
        externalId: sp.externalId,
        qty: pr.qty,
        shippingAddress: pr.shippingAddress ?? {},
        note: `LEXI PR#${pr.id} / ${pr.externalOrderRef}`,
      });
      supplierOrderRef = r.supplierOrderRef;
    }

    const so = {
      id: nextId(s),
      purchaseRequestId: pr.id,
      supplierId: supplier.id,
      supplierProductId: sp.id,
      orderPayload: { externalId: sp.externalId, qty: pr.qty },
      supplierOrderRef,
      costUsd: +(listing.supplierCostUsd * pr.qty).toFixed(2),
      shippingUsd: 3 * pr.qty,
      status: supplierOrderRef ? ("confirmed" as const) : ("requested" as const),
      createdAt: iso(),
    };
    s.sourcingOrders.unshift(so);
    pr.status = "sourcing";
    audit(s, "sourcing_order", so.id, so.status, actor, undefined, { supplierOrderRef });
    return so;
  });
}

/* ---------- P6: 전이 + 정산 ---------- */
const SO_FLOW: Record<string, string[]> = {
  requested: ["confirmed", "failed", "cancelled"],
  confirmed: ["shipped", "cancelled", "as_delegated"],
  shipped: ["delivered", "as_delegated"],
  delivered: ["settled", "as_delegated"],
};

export async function advanceSourcingOrder(
  soId: number,
  to: string,
  actor: string,
  extra?: { trackingNo?: string; carrier?: string; supplierOrderRef?: string; asTicketRef?: string },
) {
  return mutate((s) => {
    const so = s.sourcingOrders.find((o) => o.id === soId);
    if (!so) throw new Error("sourcing order not found");
    const allowed = SO_FLOW[so.status] ?? [];
    if (!allowed.includes(to)) throw new Error(`invalid transition ${so.status}→${to}`);
    const from = so.status;
    so.status = to as typeof so.status;
    if (extra?.trackingNo) so.trackingNo = extra.trackingNo;
    if (extra?.carrier) so.carrier = extra.carrier;
    if (extra?.supplierOrderRef) so.supplierOrderRef = extra.supplierOrderRef;
    if (extra?.asTicketRef) so.asTicketRef = extra.asTicketRef;
    audit(s, "sourcing_order", so.id, to, actor, from, extra as Record<string, unknown>);

    const pr = s.purchaseRequests.find((p) => p.id === so.purchaseRequestId);
    if (pr) {
      if (to === "delivered") pr.status = "fulfilled";
      if (to === "as_delegated") pr.status = "refund_delegated";
      if (to === "settled") pr.status = "closed";
    }

    // delivered → 정산 원장 자동 생성
    if (to === "delivered" && pr && !s.settlements.some((x) => x.sourcingOrderId === so.id)) {
      const channel = s.channels.find((c) => c.id === pr.channelId);
      const fxRate = s.fx[pr.channelCurrency?.toUpperCase() ?? "USD"] ?? 1;
      const revenueUsd = +(pr.channelPaidAmount * fxRate).toFixed(2);
      const channelFeeUsd = +(revenueUsd * (channel?.config.feeRate ?? 0.1)).toFixed(2);
      const pgFeeUsd = +(revenueUsd * 0.028).toFixed(2);
      const marginUsd = +(revenueUsd - so.costUsd - so.shippingUsd - channelFeeUsd - pgFeeUsd).toFixed(2);
      const st = {
        id: nextId(s), sourcingOrderId: so.id,
        revenueUsd, costUsd: so.costUsd, shippingUsd: so.shippingUsd,
        channelFeeUsd, pgFeeUsd, marginUsd, fxRate,
        status: "pending" as const, createdAt: iso(),
      };
      s.settlements.unshift(st);
      audit(s, "settlement", st.id, "pending", "system", undefined, { marginUsd });
    }
    return so;
  });
}

export async function confirmSettlement(id: number, actor: string) {
  return mutate((s) => {
    const st = s.settlements.find((x) => x.id === id);
    if (!st) throw new Error("settlement not found");
    st.status = "confirmed";
    st.settledAt = iso();
    const so = s.sourcingOrders.find((o) => o.id === st.sourcingOrderId);
    if (so && so.status === "delivered") {
      so.status = "settled";
      const pr = s.purchaseRequests.find((p) => p.id === so.purchaseRequestId);
      if (pr) pr.status = "closed";
    }
    audit(s, "settlement", st.id, "confirmed", actor, "pending");
    return st;
  });
}

/* ---------- 트래킹 폴링 (cron) ---------- */
export async function pollTracking() {
  return mutate(async (s) => {
    const active = s.sourcingOrders.filter((o) => o.status === "confirmed" || o.status === "shipped");
    let updated = 0;
    for (const so of active) {
      const supplier = s.suppliers.find((x) => x.id === so.supplierId);
      const connector = supplier && getConnector(supplier.code);
      if (!connector?.getTracking || !so.supplierOrderRef) continue;
      const t = await connector.getTracking(so.supplierOrderRef).catch(() => null);
      if (!t) continue;
      if (t.trackingNo && !so.trackingNo) {
        so.trackingNo = t.trackingNo;
        so.carrier = t.carrier;
        if (so.status === "confirmed") {
          so.status = "shipped";
          audit(s, "sourcing_order", so.id, "shipped", "cron", "confirmed", { trackingNo: t.trackingNo });
        }
        updated++;
      }
    }
    return { checked: active.length, updated };
  });
}
