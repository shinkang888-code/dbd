// filepath: src/lib/pages-db.ts
import { createServerFn } from "@tanstack/react-start";
import { sql } from "@/integrations/neon/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isPrivilegedAdminEmail } from "@/lib/admin-emails";
import { getPageBaseline, PAGE_BASELINES } from "@/lib/page-baselines";

async function assertAdmin(userId: string) {
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
  if (userData.user?.id === userId && isPrivilegedAdminEmail(userData.user.email)) {
    return;
  }

  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("관리자만 수행할 수 있습니다");
}

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  content_html: string;
  baseline_html: string;
  published: boolean;
  updated_at: string;
};

export const listPages = createServerFn({ method: "GET" }).handler(async () => {
  const rows = (await sql()`
    SELECT id, slug, title, content_html, COALESCE(baseline_html, '') AS baseline_html, published, updated_at
    FROM pages
    ORDER BY slug ASC
  `) as CmsPage[];
  return { rows };
});

export const getPageBySlug = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const rows = (await sql()`
      SELECT id, slug, title, content_html, COALESCE(baseline_html, '') AS baseline_html, published, updated_at
      FROM pages
      WHERE slug = ${data.slug} AND published = true
      LIMIT 1
    `) as CmsPage[];
    return rows[0] ?? null;
  });

export const upsertPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id?: string; slug: string; title: string; content_html: string; published?: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.id) {
      await sql()`
        UPDATE pages SET
          title = ${String(data.title ?? "")},
          content_html = ${String(data.content_html ?? "")},
          published = ${Boolean(data.published ?? true)},
          updated_at = now()
        WHERE id = ${data.id}
      `;
      return { id: data.id };
    }
    const baseline = getPageBaseline(data.slug);
    const rows = (await sql()`
      INSERT INTO pages (slug, title, content_html, baseline_html, published)
      VALUES (
        ${String(data.slug)},
        ${String(data.title ?? "")},
        ${String(data.content_html ?? "")},
        ${baseline},
        ${Boolean(data.published ?? true)}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        content_html = EXCLUDED.content_html,
        published = EXCLUDED.published,
        updated_at = now()
      RETURNING id
    `) as { id: string }[];
    return { id: rows[0].id };
  });

/** 편집본을 baseline_html로 되돌림 (현 사이트 상태 복원) */
export const resetPageToBaseline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const rows = (await sql()`
      UPDATE pages SET
        content_html = COALESCE(NULLIF(trim(baseline_html), ''), content_html),
        updated_at = now()
      WHERE id = ${data.id}
      RETURNING id, slug, title, content_html, COALESCE(baseline_html, '') AS baseline_html, published, updated_at
    `) as CmsPage[];
    const page = rows[0];
    if (!page) throw new Error("페이지를 찾을 수 없습니다");
    // baseline이 비어 있으면 코드 기본본으로 채우고 복원
    if (!page.baseline_html?.trim()) {
      const baseline = getPageBaseline(page.slug);
      await sql()`
        UPDATE pages SET
          baseline_html = ${baseline},
          content_html = ${baseline},
          updated_at = now()
        WHERE id = ${data.id}
      `;
      return { ...page, baseline_html: baseline, content_html: baseline };
    }
    return page;
  });

/** 현재 content_html을 새 기준본으로 고정 */
export const lockPageBaseline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string; content_html?: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const html = data.content_html != null ? String(data.content_html) : null;
    if (html != null) {
      await sql()`
        UPDATE pages SET
          baseline_html = ${html},
          content_html = ${html},
          updated_at = now()
        WHERE id = ${data.id}
      `;
    } else {
      await sql()`
        UPDATE pages SET
          baseline_html = content_html,
          updated_at = now()
        WHERE id = ${data.id}
      `;
    }
    return { ok: true };
  });

/** 모든 페이지에 코드 기본본을 baseline으로 시드(비어 있을 때만) */
export const seedPageBaselines = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    for (const [slug, html] of Object.entries(PAGE_BASELINES)) {
      await sql()`
        UPDATE pages SET
          baseline_html = CASE
            WHEN baseline_html IS NULL OR trim(baseline_html) = '' THEN ${html}
            ELSE baseline_html
          END,
          content_html = CASE
            WHEN content_html IS NULL OR trim(content_html) = '' THEN ${html}
            ELSE content_html
          END,
          updated_at = now()
        WHERE slug = ${slug}
      `;
    }
    return { ok: true, count: Object.keys(PAGE_BASELINES).length };
  });
