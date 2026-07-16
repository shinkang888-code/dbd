import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { cafe24OAuthConfigured, CAFE24_REDIRECT_PATH } from "@/lib/cafe24/config";
import { authorizeUrl } from "@/lib/cafe24/oauth";

export const dynamic = "force-dynamic";

/** GET /api/cafe24/oauth/start — 관리자만. Cafe24 인가 화면으로 리다이렉트 */
export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url), 302);
  }
  if (!cafe24OAuthConfigured()) {
    return NextResponse.json(
      { error: "CAFE24_MALL_ID + CAFE24_FRONT_CLIENT_ID + CAFE24_CLIENT_SECRET 미설정" },
      { status: 500 },
    );
  }
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}${CAFE24_REDIRECT_PATH}`;
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeUrl(state, redirectUri), 302);
  res.cookies.set("cafe24_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/cafe24/oauth",
    maxAge: 600,
  });
  return res;
}
