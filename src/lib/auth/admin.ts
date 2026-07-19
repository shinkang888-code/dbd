import { cookies } from "next/headers";
import { auth } from "./server";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { DEMO_USER, getDemoSessionFromCookies } from "./demo";

export async function requireSession() {
  // 0) 데모 로그인 세션
  try {
    const jar = await cookies();
    const demo = await getDemoSessionFromCookies((name) => jar.get(name));
    if (demo) return demo;
  } catch {
    /* cookies() 사용 불가 컨텍스트 */
  }

  // 1) 자체 Google OAuth 세션 (Neon Auth와 독립)
  try {
    const jar = await cookies();
    const user = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
    if (user) {
      return {
        user: {
          id: `google:${user.email}`,
          email: user.email,
          name: user.name ?? user.email,
          image: null as string | null,
        },
      };
    }
  } catch {
    /* cookies() 사용 불가 컨텍스트 → Neon Auth로 폴백 */
  }

  // 2) Neon Auth 세션
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!session?.user?.email) return null;
  // 데모 계정은 ADMIN_EMAILS와 무관하게 관리자 통과
  if (session.user.email.toLowerCase() === DEMO_USER.email) return session;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return session;
  if (!allow.includes(session.user.email.toLowerCase())) return null;
  return session;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  if (email.toLowerCase() === DEMO_USER.email) return true;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return true;
  return allow.includes(email.toLowerCase());
}
