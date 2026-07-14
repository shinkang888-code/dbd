/** Emails that always get admin console access (bootstrap until Supabase RPC is applied). */
export const PRIVILEGED_ADMIN_EMAILS = ["demo@ksac.local", "shinkang88@daum.net"] as const;

export function isPrivilegedAdminEmail(email?: string | null) {
  if (!email) return false;
  return (PRIVILEGED_ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}
