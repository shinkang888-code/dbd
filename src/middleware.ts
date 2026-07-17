// filepath: src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { DEMO_COOKIE, isDemoCookieValid } from "@/lib/auth/demo";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const neonAuthMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default async function middleware(req: NextRequest) {
  // 1) 자체 Google OAuth 세션 통과
  if (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  // 2) 데모 세션(DEMO_LOGIN=1 + 서명 쿠키)은 Neon Auth 없이 통과
  if (await isDemoCookieValid(req.cookies.get(DEMO_COOKIE)?.value)) {
    return NextResponse.next();
  }
  return (neonAuthMiddleware as unknown as (r: NextRequest) => Promise<Response>)(req);
}

export const config = {
  matcher: ["/account/settings", "/account/security", "/admin/:path*", "/studio/:path*"],
};
