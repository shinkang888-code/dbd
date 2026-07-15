// filepath: src/app/api/auth/google/callback/route.ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/** Google OAuth 콜백 — code 교환 → userinfo → 서명 세션 쿠키 발급 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/auth/sign-in?error=${encodeURIComponent(reason)}`, 302);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("google-env-missing");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = (req.headers.get("cookie") ?? "").match(/(?:^|;\s*)lexi_oauth_state=([^;]+)/)?.[1];
  if (!code || !state || state !== stateCookie) return fail("state-mismatch");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail("token-exchange-failed");
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return fail("no-access-token");

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) return fail("userinfo-failed");
  const profile = (await userRes.json()) as { email?: string; email_verified?: boolean; name?: string };
  if (!profile.email || profile.email_verified === false) return fail("email-unverified");

  const res = NextResponse.redirect(`${origin}/admin/sourcing`, 302);
  res.cookies.set(SESSION_COOKIE, await createSessionToken({ email: profile.email, name: profile.name }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
  res.cookies.set("lexi_oauth_state", "", { path: "/api/auth/google", maxAge: 0 });
  return res;
}
