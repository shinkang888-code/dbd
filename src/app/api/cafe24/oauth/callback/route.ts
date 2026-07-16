import { NextResponse } from "next/server";
import { CAFE24_REDIRECT_PATH } from "@/lib/cafe24/config";
import { exchangeCode } from "@/lib/cafe24/oauth";

export const dynamic = "force-dynamic";

/** GET /api/cafe24/oauth/callback — code → 토큰 교환·저장 후 콘솔로 복귀 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const done = (q: string) => NextResponse.redirect(`${origin}/admin/cafe24?${q}`, 302);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = (req.headers.get("cookie") ?? "").match(/(?:^|;\s*)cafe24_oauth_state=([^;]+)/)?.[1];
  if (!code || !state || state !== stateCookie) return done("cafe24=state-mismatch");

  try {
    await exchangeCode(code, `${origin}${CAFE24_REDIRECT_PATH}`);
    const res = done("cafe24=connected");
    res.cookies.set("cafe24_oauth_state", "", { path: "/api/cafe24/oauth", maxAge: 0 });
    return res;
  } catch (e) {
    return done(`cafe24=error&msg=${encodeURIComponent(e instanceof Error ? e.message : "token")}`);
  }
}
