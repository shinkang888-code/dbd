import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | undefined;

/** Server-only Neon SQL client. Requires DATABASE_URL. */
export function sql() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL. Set Neon connection string in .env");
  }
  _sql = neon(url);
  return _sql;
}

export type BoardTable = "notices" | "resources" | "gallery" | "banners";

export const BOARD_TABLES: BoardTable[] = ["notices", "resources", "gallery", "banners"];

export function assertBoardTable(table: string): BoardTable {
  if (!BOARD_TABLES.includes(table as BoardTable)) {
    throw new Error(`Invalid board table: ${table}`);
  }
  return table as BoardTable;
}
