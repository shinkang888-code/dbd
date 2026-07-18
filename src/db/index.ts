import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const hasDb = () => Boolean(process.env.DATABASE_URL);

/**
 * Neon HTTP 드라이버는 Neon 엔드포인트 전용이라 로컬/일반 Postgres에는 붙지 않는다.
 * URL을 보고 드라이버를 고른다. DB_DRIVER=neon|pg 로 강제 지정도 가능.
 */
function useNeon(url: string) {
  const forced = process.env.DB_DRIVER;
  if (forced) return forced === "neon";
  return /neon\.(tech|build)/i.test(url);
}

// 로컬 Postgres 풀은 프로세스당 하나만 (dev HMR/warm 인스턴스 대비 globalThis 싱글턴)
const g = globalThis as unknown as { __pgPool?: Pool };
function pgPool(connectionString: string) {
  if (!g.__pgPool) g.__pgPool = new Pool({ connectionString });
  return g.__pgPool;
}

/**
 * 호출부 타입은 기존과 동일하게 유지한다. 두 드라이버 모두 여기서 쓰는
 * 빌더 API(select/insert/update/delete, onConflict*, returning)가 동일하다.
 */
export function db(): NeonHttpDatabase<typeof schema> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const instance = useNeon(url)
    ? drizzleNeon(neon(url), { schema })
    : drizzlePg(pgPool(url), { schema });
  return instance as unknown as NeonHttpDatabase<typeof schema>;
}

export { schema };
