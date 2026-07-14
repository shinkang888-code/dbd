import { supabase } from "@/integrations/supabase/client";
import { isPrivilegedAdminEmail } from "@/lib/admin-emails";

/** Demo admin credentials (public demo only). */
export const DEMO_ADMIN = {
  email: "demo@ksac.local",
  password: "DemoKsac!2026",
  fullName: "데모 관리자",
} as const;

/**
 * Board sample content now lives on Neon (`neon/seed-dummy.sql`).
 * Kept as a no-op so demo login still works without writing to Supabase boards.
 */
export async function ensureDemoContent(_userId: string) {
  return;
}

/** Sign in as demo admin; create account on first use. */
export async function signInDemoAdmin() {
  const { email, password, fullName } = DEMO_ADMIN;

  let { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const { data: signedUp, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, affiliation: "KSAC", member_type: "정회원" },
      },
    });
    if (signUpError) throw signUpError;

    if (!signedUp.session) {
      const retry = await supabase.auth.signInWithPassword({ email, password });
      if (retry.error) throw retry.error;
    }
  }

  const { error: rpcError } = await supabase.rpc("ensure_demo_admin" as any);
  if (rpcError) {
    // RPC may not be migrated yet — privileged email fallback still unlocks admin UI.
    console.warn("ensure_demo_admin:", rpcError.message);
  }

  const user = (await supabase.auth.getUser()).data.user;
  if (!user?.id) throw new Error("로그인 세션을 확인할 수 없습니다.");

  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminRole && !isPrivilegedAdminEmail(user.email)) {
    throw new Error(
      "데모 관리자 권한이 없습니다. supabase/migrations/20260714020000_demo_admin_bootstrap.sql 을 Supabase SQL Editor에서 실행한 뒤 다시 시도해 주세요.",
    );
  }

  await wait(300);
  await ensureDemoContent(user.id);
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
