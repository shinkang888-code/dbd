import { NextResponse } from "next/server";
import { upsertCategory } from "@/lib/mobbin/store";
import { bad, studioActor, unauthorized } from "@/lib/studio/http";

export const dynamic = "force-dynamic";

/** 카테고리 업서트: 이름변경(label)·병합(mergedInto)·커스텀 생성 */
export async function POST(req: Request) {
  if (!(await studioActor())) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name) throw new Error("name required");
    return NextResponse.json({
      category: await upsertCategory({
        name: String(body.name),
        ...(body.label !== undefined ? { label: body.label === null ? null : String(body.label) } : {}),
        ...(body.mergedInto !== undefined
          ? { mergedInto: body.mergedInto === null ? null : String(body.mergedInto) }
          : {}),
        ...(body.source ? { source: String(body.source) } : {}),
      }),
    });
  } catch (error) {
    return bad(error);
  }
}
