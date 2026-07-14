// filepath: src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import { readCart, setCartItem } from "@/lib/cart-store";

export async function GET() {
  const items = await readCart();
  const subtotal = +items.reduce((s, l) => s + l.lineTotal, 0).toFixed(2);
  return NextResponse.json({ items, subtotal, count: items.reduce((s, l) => s + l.qty, 0) });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { slug?: string; qty?: number };
  if (!body.slug || typeof body.qty !== "number") {
    return NextResponse.json({ error: "slug and qty required" }, { status: 400 });
  }
  try {
    const items = await setCartItem(body.slug, body.qty);
    const subtotal = +items.reduce((s, l) => s + l.lineTotal, 0).toFixed(2);
    return NextResponse.json({ items, subtotal, count: items.reduce((s, l) => s + l.qty, 0) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
