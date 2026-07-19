/**
 * 데모 로그인 — Google/Neon Auth 없이 관리자 콘솔 체험.
 * 기본 ON. DEMO_LOGIN=0 또는 false 로만 끈다.
 * 쿠키는 서버 시크릿 HMAC 서명값 (Edge/Node Web Crypto).
 */

export const DEMO_COOKIE = "lexi_demo";
export const DEMO_USER = {
  id: "demo:admin",
  email: "demo@dbd.local",
  name: "Demo Admin",
  image: null as string | null,
} as const;

/** DEMO_LOGIN=0|false 일 때만 비활성. 미설정·1 은 활성. */
export const demoEnabled = () => {
  const v = process.env.DEMO_LOGIN?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off") return false;
  return true;
};

const enc = new TextEncoder();

/** 서명 시크릿 — Vercel에 AUTH_SECRET 있으면 그걸 우선 (Edge/Node 동일) */
export async function demoCookieValue(): Promise<string> {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.HQ_API_TOKEN ||
    "lexi-demo-fallback";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("lexi-demo-session-v1"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isDemoCookieValid(value: string | null | undefined): Promise<boolean> {
  if (!demoEnabled() || !value) return false;
  return value === (await demoCookieValue());
}

/** Request의 Cookie 헤더에서 데모 쿠키를 꺼내 검증 (route handler용) */
export async function isDemoRequest(req: Request): Promise<boolean> {
  const m = (req.headers.get("cookie") ?? "").match(/(?:^|;\s*)lexi_demo=([^;]+)/);
  return isDemoCookieValid(m?.[1]);
}

/** cookies() jar 기준 데모 세션 (서버 컴포넌트/API) */
export async function getDemoSessionFromCookies(
  getCookie: (name: string) => { value: string } | undefined,
): Promise<{ user: typeof DEMO_USER } | null> {
  if (!demoEnabled()) return null;
  const ok = await isDemoCookieValid(getCookie(DEMO_COOKIE)?.value);
  if (!ok) return null;
  return { user: DEMO_USER };
}
