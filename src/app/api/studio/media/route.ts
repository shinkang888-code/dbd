import { NextResponse } from "next/server";
import { createMedia, listMedia } from "@/lib/studio/store";
import { bad, studioActor, unauthorized } from "@/lib/studio/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await studioActor())) return unauthorized();
  const url = new URL(req.url);
  const tags = url.searchParams.get("tags");
  return NextResponse.json({
    items: await listMedia({
      q: url.searchParams.get("q") || undefined,
      kind: url.searchParams.get("kind") || undefined,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    }),
  });
}

export async function POST(req: Request) {
  const actor = await studioActor();
  if (!actor) return unauthorized();
  try {
    const body = await req.json();
    if (!body.name || !body.url || !body.kind) throw new Error("name, url, kind required");
    new URL(body.url);
    return NextResponse.json({
      item: await createMedia({
        kind: String(body.kind),
        name: String(body.name),
        url: String(body.url),
        mimeType: body.mimeType,
        alt: body.alt,
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
        metadata: body.metadata,
        actor,
      }),
    });
  } catch (error) {
    return bad(error);
  }
}
