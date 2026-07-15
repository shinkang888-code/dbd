import { NextResponse } from "next/server";
import { hqActor, unauthorized } from "@/lib/hq/auth";
import { getState } from "@/lib/hq/store";

export const dynamic = "force-dynamic";

/** 콘솔용 전체 상태 스냅샷 (감사로그는 최근 100건) */
export async function GET(req: Request) {
  if (!(await hqActor(req))) return unauthorized();
  const s = await getState();
  return NextResponse.json({
    suppliers: s.suppliers,
    supplierProducts: s.supplierProducts,
    collections: s.collections,
    collectionItems: s.collectionItems,
    drafts: s.drafts.map(({ renderedHtml, ...d }) => ({ ...d, renderedHtml: renderedHtml.slice(0, 0) })),
    listings: s.listings,
    channels: s.channels,
    channelListings: s.channelListings,
    importBatches: s.importBatches,
    purchaseRequests: s.purchaseRequests,
    sourcingOrders: s.sourcingOrders,
    settlements: s.settlements,
    audit: s.audit.slice(0, 100),
    fx: s.fx,
  });
}
