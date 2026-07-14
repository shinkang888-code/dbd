/**
 * [Dummy/Real] 전환 파이프라인 — docs/lexi-master-spec.md §4.3
 * DATABASE_URL이 없으면(로컬 미리보기) 프로세스 메모리 상태로 동작한다.
 */
import { neon } from "@neondatabase/serverless";
import { hasDb } from "@/db";

export type DataMode = { mode: "dummy" | "real"; initialized: boolean };
export type Strategy = "soft" | "hard";

/** is_dummy 정리 대상 테이블 — FK 역순 */
const PURGE_ORDER = [
  "order_items",
  "orders",
  "reviews",
  "ugc_posts",
  "product_images",
  "banners",
  "products",
  "brands",
  "users",
] as const;

// 로컬(No-DB) 폴백 상태
let memoryMode: DataMode = { mode: "dummy", initialized: false };

export async function getDataMode(): Promise<DataMode> {
  if (!hasDb()) return memoryMode;
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT value FROM site_settings WHERE key = 'data_mode'`;
  return (rows[0]?.value as DataMode) ?? { mode: "dummy", initialized: false };
}

export async function switchDataMode(
  target: DataMode["mode"],
  strategy: Strategy,
  actor: string,
): Promise<{ mode: DataMode; affected: Record<string, number> }> {
  if (!hasDb()) {
    memoryMode = { mode: target, initialized: target === "real" };
    return { mode: memoryMode, affected: { "(memory)": 0 } };
  }

  const sql = neon(process.env.DATABASE_URL!);
  const affected: Record<string, number> = {};

  // 단일 트랜잭션: 락 → 정리 → 상태 영속화 → 감사 로그
  const queries = [];
  queries.push(sql`SELECT value FROM site_settings WHERE key = 'data_mode' FOR UPDATE`);
  if (target === "real") {
    for (const table of PURGE_ORDER) {
      queries.push(
        strategy === "hard"
          ? sql.query(`DELETE FROM ${table} WHERE is_dummy`)
          : sql.query(
              `UPDATE ${table} SET deleted_at = now() WHERE is_dummy AND deleted_at IS NULL`,
            ),
      );
    }
  }
  queries.push(
    sql.query(
      `UPDATE site_settings SET value = $1, updated_at = now(), updated_by = $2 WHERE key = 'data_mode'`,
      [JSON.stringify({ mode: target, initialized: target === "real" }), actor],
    ),
  );
  queries.push(
    sql.query(
      `INSERT INTO data_mode_audit (from_mode, to_mode, strategy, affected, actor)
       SELECT value->>'mode', $1, $2, $3::jsonb, $4 FROM site_settings WHERE key = 'data_mode'`,
      [target, strategy, JSON.stringify(affected), actor],
    ),
  );
  await sql.transaction(queries as never);

  return { mode: { mode: target, initialized: target === "real" }, affected };
}
