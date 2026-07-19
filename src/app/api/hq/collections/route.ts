import { NextResponse } from "next/server";
import { bad, hqActor, unauthorized } from "@/lib/hq/auth";
import { audit, getState, iso, mutate, nextId } from "@/lib/hq/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await hqActor(req))) return unauthorized();
  const s = await getState();
  return NextResponse.json({ collections: s.collections, items: s.collectionItems });
}

export async function POST(req: Request) {
  const actor = await hqActor(req);
  if (!actor) return unauthorized();
  const b = await req.json();
  if (!b.name) return bad("name required");
  return NextResponse.json(
    await mutate((s) => {
      const slug = String(b.slug ?? b.name).toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-");
      if (s.collections.some((c) => c.slug === slug)) throw new Error("duplicate slug");
      const col = { id: nextId(s), slug, name: String(b.name), note: b.note, createdAt: iso() };
      s.collections.push(col);
      audit(s, "collection", col.id, "created", actor);
      return col;
    }),
  );
}
