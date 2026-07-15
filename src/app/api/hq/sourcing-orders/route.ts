import { NextResponse } from "next/server";
import { bad, hqActor, unauthorized } from "@/lib/hq/auth";
import { createSourcingOrder } from "@/lib/hq/services";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST {purchaseRequestId} — vetted 건 발주 (커넥터 placeOrder 자동 시도) */
export async function POST(req: Request) {
  const actor = await hqActor(req);
  if (!actor) return unauthorized();
  const b = await req.json();
  if (!b.purchaseRequestId) return bad("purchaseRequestId required");
  try {
    return NextResponse.json(await createSourcingOrder(Number(b.purchaseRequestId), actor));
  } catch (e) {
    return bad(e instanceof Error ? e.message : "failed", 422);
  }
}
