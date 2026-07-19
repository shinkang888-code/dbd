import { NextResponse, type NextRequest } from "next/server";
import { auth, authConfigured } from "@/lib/auth/server";
import { DEMO_COOKIE, isDemoCookieValid } from "@/lib/auth/demo";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const neonAuthMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

function safeNextPath(pathname: string, search: string) {
  const next = `${pathname}${search || ""}`;
  if (!next.startsWith("/") || next.startsWith("//")) return "/studio";
  return next;
}

export default async function middleware(req: NextRequest) {
  // 1) Google OAuth 세션
  if (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  // 2) 데모 세션
  if (await isDemoCookieValid(req.cookies.get(DEMO_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const next = safeNextPath(req.nextUrl.pathname, req.nextUrl.search);
  const signIn = new URL("/auth/sign-in", req.url);
  signIn.searchParams.set("next", next);

  // Neon Auth 미설정(베타/데모): 자체 로그인으로만 보내고 next 보존
  // placeholder Neon 미들웨어는 Studio를 깨뜨리므로 사용하지 않음
  if (!authConfigured) {
    return NextResponse.redirect(signIn);
  }

  // Neon Auth 설정됨: 가능하면 next 유지한 채 로그인으로
  // (Neon 미들웨어는 next를 무시하는 경우가 있어 직접 리다이렉트 우선)
  try {
    const res = await (neonAuthMiddleware as unknown as (r: NextRequest) => Promise<Response>)(
      req,
    );
    // Neon이 next로 보낸 경우 그대로, 아니면 next 붙여 재작성
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (loc && loc.includes("/auth/sign-in") && !loc.includes("next=")) {
        return NextResponse.redirect(signIn);
      }
    }
    return res;
  } catch {
    return NextResponse.redirect(signIn);
  }
}

export const config = {
  matcher: [
    "/account/settings",
    "/account/security",
    "/admin",
    "/admin/:path*",
    "/studio",
    "/studio/:path*",
  ],
};
