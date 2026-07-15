// filepath: src/lib/auth/admin.ts
import { cookies } from "next/headers";
import { auth } from "./server";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function requireSession() {
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
    return null; // Neon Auth 미설정/네트워크 오류 시 게스트로 처리
  }
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!session?.user?.email) return null;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return session; // unset → any signed-in user (dev)
  if (!allow.includes(session.user.email.toLowerCase())) return null;
  return session;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return true;
  return allow.includes(email.toLowerCase());
}
