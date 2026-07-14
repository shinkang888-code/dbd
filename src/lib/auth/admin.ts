// filepath: src/lib/auth/admin.ts
import { auth } from "./server";

export async function requireSession() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  return session;
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
