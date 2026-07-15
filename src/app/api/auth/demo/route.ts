// filepath: src/app/api/auth/demo/route.ts
import { NextResponse } from "next/server";
import { DEMO_COOKIE, demoCookieValue, demoEnabled } from "@/lib/auth/demo";

export const dynamic = "force-dynamic";

/** 데모 로그인: DEMO_LOGIN=1일 때만 서명 쿠키를 심고 관리자 콘솔로 보낸다. */
export async function POST(req: Request) {
  if (!demoEnabled()) {
    return NextResponse.json({ error: "demo login disabled" }, { status: 404 });
  }
  const res = NextResponse.redirect(new URL("/admin/sourcing", req.url), 303);
  res.cookies.set(DEMO_COOKIE, await demoCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24시간
  });
  return res;
}

/** 데모 로그아웃 */
export async function DELETE(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(DEMO_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
