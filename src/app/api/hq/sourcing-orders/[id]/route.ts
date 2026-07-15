import { NextResponse } from "next/server";
import { bad, hqActor, unauthorized } from "@/lib/hq/auth";
import { advanceSourcingOrder } from "@/lib/hq/services";

export const dynamic = "force-dynamic";

/** PATCH {to, trackingNo?, carrier?, supplierOrderRef?, asTicketRef?} */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await hqActor(req);
  if (!actor) return unauthorized();
  const { id } = await ctx.params;
  const b = await req.json();
  if (!b.to) return bad("to required");
  try {
    return NextResponse.json(await advanceSourcingOrder(Number(id), String(b.to), actor, b));
  } catch (e) {
    return bad(e instanceof Error ? e.message : "failed", 422);
  }
}
