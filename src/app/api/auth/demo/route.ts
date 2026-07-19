import { NextResponse } from "next/server";
import { DEMO_COOKIE, demoCookieValue, demoEnabled } from "@/lib/auth/demo";

export const dynamic = "force-dynamic";

function redirectTarget(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/studio";
}

async function issueDemoSession(req: Request) {
  if (!demoEnabled()) {
    return NextResponse.json({ error: "demo login disabled" }, { status: 404 });
  }
  const res = NextResponse.redirect(new URL(redirectTarget(req), req.url), 303);
  res.cookies.set(DEMO_COOKIE, await demoCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}

/** 원클릭 데모 로그인 (링크·버튼) */
export async function GET(req: Request) {
  return issueDemoSession(req);
}

/** 폼 POST 데모 로그인 */
export async function POST(req: Request) {
  return issueDemoSession(req);
}

/** 데모 로그아웃 */
export async function DELETE(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(DEMO_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
