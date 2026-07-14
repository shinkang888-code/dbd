import { createServerFn } from "@tanstack/react-start";
import { sql, assertBoardTable, type BoardTable } from "@/integrations/neon/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isPrivilegedAdminEmail } from "@/lib/admin-emails";

export type BoardDataMode = "dummy" | "live";

export type CtaButton = { label: string; href: string };

function normalizeCtaButtons(p: any): CtaButton[] {
  if (Array.isArray(p.cta_buttons) && p.cta_buttons.length > 0) {
    return p.cta_buttons
      .map((b: any) => ({
        label: String(b?.label ?? "").trim(),
        href: String(b?.href ?? "").trim() || "/",
      }))
      .filter((b: CtaButton) => b.label);
  }
  if (p.cta_label) {
    return [{ label: String(p.cta_label), href: String(p.cta_href || "/about") }];
  }
  return [];
}

async function getMode(): Promise<BoardDataMode> {
  const rows = (await sql()`
    SELECT value FROM site_settings WHERE key = 'board_data_mode' LIMIT 1
  `) as { value: string }[];
  return rows[0]?.value === "live" ? "live" : "dummy";
}

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

async function listByTable(table: BoardTable, mode: BoardDataMode, admin: boolean) {
  if (table === "notices") {
    if (admin) return sql()`SELECT * FROM notices ORDER BY pinned DESC, created_at DESC`;
    return mode === "dummy"
      ? sql()`SELECT * FROM notices WHERE published = true AND is_dummy = true ORDER BY pinned DESC, created_at DESC`
      : sql()`SELECT * FROM notices WHERE published = true AND is_dummy = false ORDER BY pinned DESC, created_at DESC`;
  }
  if (table === "resources") {
    if (admin) return sql()`SELECT * FROM resources ORDER BY pinned DESC, created_at DESC`;
    return mode === "dummy"
      ? sql()`SELECT * FROM resources WHERE published = true AND is_dummy = true ORDER BY pinned DESC, created_at DESC`
      : sql()`SELECT * FROM resources WHERE published = true AND is_dummy = false ORDER BY pinned DESC, created_at DESC`;
  }
  if (table === "gallery") {
    if (admin) return sql()`SELECT * FROM gallery ORDER BY pinned DESC, created_at DESC`;
    return mode === "dummy"
      ? sql()`SELECT * FROM gallery WHERE published = true AND is_dummy = true ORDER BY pinned DESC, created_at DESC`
      : sql()`SELECT * FROM gallery WHERE published = true AND is_dummy = false ORDER BY pinned DESC, created_at DESC`;
  }
  if (admin) return sql()`SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC`;
  return mode === "dummy"
    ? sql()`SELECT * FROM banners WHERE published = true AND is_dummy = true ORDER BY sort_order ASC, created_at DESC`
    : sql()`SELECT * FROM banners WHERE published = true AND is_dummy = false ORDER BY sort_order ASC, created_at DESC`;
}

export const listBoardRows = createServerFn({ method: "GET" })
  .validator((data: { table: string; admin?: boolean }) => data)
  .handler(async ({ data }) => {
    const table = assertBoardTable(data.table);
    const mode = await getMode();
    const rows = (await listByTable(table, mode, Boolean(data.admin))) as any[];
    return { mode, rows };
  });

export const listBanners = createServerFn({ method: "GET" }).handler(async () => {
  const mode = await getMode();
  const rows = (await listByTable("banners", mode, false)) as any[];
  return { mode, rows };
});

export const getBoardRow = createServerFn({ method: "GET" })
  .validator((data: { table: string; id: string; admin?: boolean }) => data)
  .handler(async ({ data }) => {
    const table = assertBoardTable(data.table);
    const mode = await getMode();
    let rows: any[] = [];
    if (table === "notices") rows = (await sql()`SELECT * FROM notices WHERE id = ${data.id} LIMIT 1`) as any[];
    else if (table === "resources") rows = (await sql()`SELECT * FROM resources WHERE id = ${data.id} LIMIT 1`) as any[];
    else if (table === "gallery") rows = (await sql()`SELECT * FROM gallery WHERE id = ${data.id} LIMIT 1`) as any[];
    else rows = (await sql()`SELECT * FROM banners WHERE id = ${data.id} LIMIT 1`) as any[];

    const row = rows[0] ?? null;
    if (!row) return null;
    if (data.admin) return row;
    if (!row.published) return null;
    if (mode === "dummy" && !row.is_dummy) return null;
    if (mode === "live" && row.is_dummy) return null;
    return row;
  });

export const listBoardNav = createServerFn({ method: "GET" })
  .validator((data: { table: string }) => data)
  .handler(async ({ data }) => {
    const table = assertBoardTable(data.table);
    const mode = await getMode();
    if (table === "notices") {
      return mode === "dummy"
        ? ((await sql()`SELECT id, title, created_at FROM notices WHERE published = true AND is_dummy = true ORDER BY created_at DESC`) as any[])
        : ((await sql()`SELECT id, title, created_at FROM notices WHERE published = true AND is_dummy = false ORDER BY created_at DESC`) as any[]);
    }
    if (table === "resources") {
      return mode === "dummy"
        ? ((await sql()`SELECT id, title, created_at FROM resources WHERE published = true AND is_dummy = true ORDER BY created_at DESC`) as any[])
        : ((await sql()`SELECT id, title, created_at FROM resources WHERE published = true AND is_dummy = false ORDER BY created_at DESC`) as any[]);
    }
    if (table === "gallery") {
      return mode === "dummy"
        ? ((await sql()`SELECT id, title, created_at FROM gallery WHERE published = true AND is_dummy = true ORDER BY created_at DESC`) as any[])
        : ((await sql()`SELECT id, title, created_at FROM gallery WHERE published = true AND is_dummy = false ORDER BY created_at DESC`) as any[]);
    }
    return [];
  });

export const incrementBoardViews = createServerFn({ method: "POST" })
  .validator((data: { table: string; id: string }) => data)
  .handler(async ({ data }) => {
    const table = assertBoardTable(data.table);
    if (table === "banners") return { ok: true };
    if (table === "notices") await sql()`UPDATE notices SET views = COALESCE(views, 0) + 1 WHERE id = ${data.id}`;
    else if (table === "resources") await sql()`UPDATE resources SET views = COALESCE(views, 0) + 1 WHERE id = ${data.id}`;
    else await sql()`UPDATE gallery SET views = COALESCE(views, 0) + 1 WHERE id = ${data.id}`;
    return { ok: true };
  });

export const upsertBoardRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { table: string; id?: string; payload: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const table = assertBoardTable(data.table);
    await assertAdmin(context.userId);
    const mode = await getMode();
    const p = data.payload;
    const isDummy = mode === "dummy";

    if (data.id) {
      if (table === "notices") {
        await sql()`
          UPDATE notices SET
            title = ${String(p.title ?? "")},
            category = ${String(p.category ?? "")},
            content = ${String(p.content ?? "")},
            pinned = ${Boolean(p.pinned)},
            published = ${Boolean(p.published)},
            thumbnail_url = ${p.thumbnail_url ? String(p.thumbnail_url) : null},
            file_url = ${p.file_url ? String(p.file_url) : null},
            file_name = ${p.file_name ? String(p.file_name) : null},
            updated_at = now()
          WHERE id = ${data.id}
        `;
      } else if (table === "resources") {
        await sql()`
          UPDATE resources SET
            title = ${String(p.title ?? "")},
            category = ${String(p.category ?? "")},
            content = ${String(p.content ?? "")},
            pinned = ${Boolean(p.pinned)},
            published = ${Boolean(p.published)},
            thumbnail_url = ${p.thumbnail_url ? String(p.thumbnail_url) : null},
            file_url = ${p.file_url ? String(p.file_url) : null},
            file_name = ${p.file_name ? String(p.file_name) : null},
            updated_at = now()
          WHERE id = ${data.id}
        `;
      } else if (table === "gallery") {
        await sql()`
          UPDATE gallery SET
            title = ${String(p.title ?? "")},
            category = ${String(p.category ?? "")},
            content = ${p.content ? String(p.content) : null},
            pinned = ${Boolean(p.pinned)},
            published = ${Boolean(p.published)},
            thumbnail_url = ${p.thumbnail_url ? String(p.thumbnail_url) : null},
            image_urls = ${JSON.stringify(p.image_urls ?? [])}::jsonb,
            event_date = ${p.event_date ? String(p.event_date) : null},
            updated_at = now()
          WHERE id = ${data.id}
        `;
      } else {
        await sql()`
          UPDATE banners SET
            title = ${p.title ? String(p.title) : null},
            subtitle = ${p.subtitle ? String(p.subtitle) : null},
            cta_label = ${p.cta_label ? String(p.cta_label) : null},
            cta_href = ${p.cta_href ? String(p.cta_href) : null},
            cta_buttons = ${JSON.stringify(normalizeCtaButtons(p))}::jsonb,
            image_url = ${p.image_url ? String(p.image_url) : null},
            video_url = ${p.video_url ? String(p.video_url) : null},
            sort_order = ${Number(p.sort_order ?? 0)},
            published = ${Boolean(p.published)},
            updated_at = now()
          WHERE id = ${data.id}
        `;
      }
      return { id: data.id };
    }

    if (table === "notices") {
      const rows = (await sql()`
        INSERT INTO notices (
          author_id, author_name, title, category, content, pinned, published,
          thumbnail_url, file_url, file_name, is_dummy
        ) VALUES (
          ${String(p.author_id ?? context.userId)},
          ${String(p.author_name ?? "관리자")},
          ${String(p.title ?? "")},
          ${String(p.category ?? "")},
          ${String(p.content ?? "")},
          ${Boolean(p.pinned)},
          ${Boolean(p.published ?? true)},
          ${p.thumbnail_url ? String(p.thumbnail_url) : null},
          ${p.file_url ? String(p.file_url) : null},
          ${p.file_name ? String(p.file_name) : null},
          ${isDummy}
        ) RETURNING id
      `) as { id: string }[];
      return { id: rows[0].id };
    }
    if (table === "resources") {
      const rows = (await sql()`
        INSERT INTO resources (
          author_id, author_name, title, category, content, pinned, published,
          thumbnail_url, file_url, file_name, is_dummy
        ) VALUES (
          ${String(p.author_id ?? context.userId)},
          ${String(p.author_name ?? "관리자")},
          ${String(p.title ?? "")},
          ${String(p.category ?? "")},
          ${String(p.content ?? "")},
          ${Boolean(p.pinned)},
          ${Boolean(p.published ?? true)},
          ${p.thumbnail_url ? String(p.thumbnail_url) : null},
          ${p.file_url ? String(p.file_url) : null},
          ${p.file_name ? String(p.file_name) : null},
          ${isDummy}
        ) RETURNING id
      `) as { id: string }[];
      return { id: rows[0].id };
    }
    if (table === "gallery") {
      const rows = (await sql()`
        INSERT INTO gallery (
          author_id, author_name, title, category, content, pinned, published,
          thumbnail_url, image_urls, event_date, is_dummy
        ) VALUES (
          ${String(p.author_id ?? context.userId)},
          ${String(p.author_name ?? "관리자")},
          ${String(p.title ?? "")},
          ${String(p.category ?? "")},
          ${p.content ? String(p.content) : null},
          ${Boolean(p.pinned)},
          ${Boolean(p.published ?? true)},
          ${p.thumbnail_url ? String(p.thumbnail_url) : null},
          ${JSON.stringify(p.image_urls ?? [])}::jsonb,
          ${p.event_date ? String(p.event_date) : null},
          ${isDummy}
        ) RETURNING id
      `) as { id: string }[];
      return { id: rows[0].id };
    }
    const rows = (await sql()`
      INSERT INTO banners (
        title, subtitle, cta_label, cta_href, cta_buttons, image_url, video_url, sort_order, published, is_dummy
      ) VALUES (
        ${p.title ? String(p.title) : null},
        ${p.subtitle ? String(p.subtitle) : null},
        ${p.cta_label ? String(p.cta_label) : null},
        ${p.cta_href ? String(p.cta_href) : null},
        ${JSON.stringify(normalizeCtaButtons(p))}::jsonb,
        ${p.image_url ? String(p.image_url) : null},
        ${p.video_url ? String(p.video_url) : null},
        ${Number(p.sort_order ?? 0)},
        ${Boolean(p.published ?? true)},
        ${isDummy}
      ) RETURNING id
    `) as { id: string }[];
    return { id: rows[0].id };
  });

export const deleteBoardRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { table: string; id: string }) => data)
  .handler(async ({ data, context }) => {
    const table = assertBoardTable(data.table);
    await assertAdmin(context.userId);
    if (table === "notices") await sql()`DELETE FROM notices WHERE id = ${data.id}`;
    else if (table === "resources") await sql()`DELETE FROM resources WHERE id = ${data.id}`;
    else if (table === "gallery") await sql()`DELETE FROM gallery WHERE id = ${data.id}`;
    else await sql()`DELETE FROM banners WHERE id = ${data.id}`;
    return { ok: true };
  });

export const getBoardDataMode = createServerFn({ method: "GET" }).handler(async () => ({
  mode: await getMode(),
}));

/** Switch mode. Choosing live wipes all is_dummy rows. */
export const setBoardDataMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { mode: BoardDataMode }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.mode === "live") {
      await sql()`DELETE FROM notices WHERE is_dummy = true`;
      await sql()`DELETE FROM resources WHERE is_dummy = true`;
      await sql()`DELETE FROM gallery WHERE is_dummy = true`;
      await sql()`DELETE FROM banners WHERE is_dummy = true`;
    }
    await sql()`
      INSERT INTO site_settings (key, value, updated_at) VALUES ('board_data_mode', ${data.mode}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return { mode: data.mode };
  });

export const countBoardRows = createServerFn({ method: "GET" })
  .validator((data: { table: string }) => data)
  .handler(async ({ data }) => {
    const table = assertBoardTable(data.table);
    const mode = await getMode();
    const dummy = mode === "dummy";
    if (table === "notices") {
      const rows = dummy
        ? ((await sql()`SELECT COUNT(*)::int AS c FROM notices WHERE is_dummy = true`) as { c: number }[])
        : ((await sql()`SELECT COUNT(*)::int AS c FROM notices WHERE is_dummy = false`) as { c: number }[]);
      return rows[0]?.c ?? 0;
    }
    if (table === "resources") {
      const rows = dummy
        ? ((await sql()`SELECT COUNT(*)::int AS c FROM resources WHERE is_dummy = true`) as { c: number }[])
        : ((await sql()`SELECT COUNT(*)::int AS c FROM resources WHERE is_dummy = false`) as { c: number }[]);
      return rows[0]?.c ?? 0;
    }
    if (table === "gallery") {
      const rows = dummy
        ? ((await sql()`SELECT COUNT(*)::int AS c FROM gallery WHERE is_dummy = true`) as { c: number }[])
        : ((await sql()`SELECT COUNT(*)::int AS c FROM gallery WHERE is_dummy = false`) as { c: number }[]);
      return rows[0]?.c ?? 0;
    }
    const rows = dummy
      ? ((await sql()`SELECT COUNT(*)::int AS c FROM banners WHERE is_dummy = true`) as { c: number }[])
      : ((await sql()`SELECT COUNT(*)::int AS c FROM banners WHERE is_dummy = false`) as { c: number }[]);
    return rows[0]?.c ?? 0;
  });
