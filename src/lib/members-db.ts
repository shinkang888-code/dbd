// filepath: src/lib/members-db.ts
import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/integrations/neon/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MemberProfile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  affiliation: string;
  refund_account: string;
  identity_file_url: string | null;
  identity_file_name: string | null;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
};

function isComplete(p: {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  affiliation?: string;
  refund_account?: string;
  identity_file_url?: string | null;
}) {
  return Boolean(
    p.full_name?.trim() &&
      p.phone?.trim() &&
      p.email?.trim() &&
      p.address?.trim() &&
      p.affiliation?.trim() &&
      p.refund_account?.trim() &&
      p.identity_file_url?.trim(),
  );
}

export const getMyMemberProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const rows = (await sql()`
      SELECT *
      FROM member_profiles
      WHERE id = ${context.userId}
      LIMIT 1
    `) as MemberProfile[];
    return rows[0] ?? null;
  });

export const upsertMyMemberProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      email?: string;
      full_name: string;
      phone: string;
      address: string;
      affiliation: string;
      refund_account: string;
      identity_file_url?: string | null;
      identity_file_name?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const claims = context.claims as { email?: string; sub?: string };
    const email = String(data.email ?? claims.email ?? "").trim();
    const payload = {
      full_name: String(data.full_name ?? "").trim(),
      phone: String(data.phone ?? "").trim(),
      email,
      address: String(data.address ?? "").trim(),
      affiliation: String(data.affiliation ?? "").trim(),
      refund_account: String(data.refund_account ?? "").trim(),
      identity_file_url: data.identity_file_url ? String(data.identity_file_url) : null,
      identity_file_name: data.identity_file_name ? String(data.identity_file_name) : null,
    };
    const complete = isComplete(payload);

    const rows = (await sql()`
      INSERT INTO member_profiles (
        id, email, full_name, phone, address, affiliation, refund_account,
        identity_file_url, identity_file_name, profile_complete, updated_at
      ) VALUES (
        ${context.userId},
        ${payload.email},
        ${payload.full_name},
        ${payload.phone},
        ${payload.address},
        ${payload.affiliation},
        ${payload.refund_account},
        ${payload.identity_file_url},
        ${payload.identity_file_name},
        ${complete},
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        affiliation = EXCLUDED.affiliation,
        refund_account = EXCLUDED.refund_account,
        identity_file_url = EXCLUDED.identity_file_url,
        identity_file_name = EXCLUDED.identity_file_name,
        profile_complete = EXCLUDED.profile_complete,
        updated_at = now()
      RETURNING *
    `) as MemberProfile[];

    return rows[0];
  });

export const ensureMemberProfileStub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await sql()`
      INSERT INTO member_profiles (id, email)
      VALUES (${context.userId}, ${String((context.claims as { email?: string })?.email ?? "")})
      ON CONFLICT (id) DO NOTHING
    `;
    return { ok: true };
  });

export const listMemberProfilesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Admin gate reused: privileged check happens in board-db pattern
    const { isPrivilegedAdminEmail } = await import("@/lib/admin-emails");
    const { createClient } = await import("@supabase/supabase-js");
    const { getRequest } = await import("@tanstack/react-start/server");
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const auth = getRequest()?.headers.get("authorization") ?? undefined;
    const sb = createClient(url, key, {
      global: { headers: auth ? { Authorization: auth } : {} },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData } = await sb.auth.getUser();
    let admin = isPrivilegedAdminEmail(userData.user?.email);
    if (!admin && userData.user?.id === context.userId) {
      const { data } = await sb.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
      admin = !!data;
    }
    if (!admin) throw new Error("관리자만 조회할 수 있습니다");

    const rows = (await sql()`
      SELECT * FROM member_profiles ORDER BY updated_at DESC
    `) as MemberProfile[];
    return { rows };
  });
