/**
 * Apply Neon schema + dummy seed using DATABASE_URL from .env
 * Usage: node --env-file=.env scripts/neon-migrate.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = neon(url);

function splitSql(text) {
  const out = [];
  let cur = "";
  let inSingle = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === "'" && !inSingle) {
      inSingle = true;
      cur += ch;
      continue;
    }
    if (ch === "'" && inSingle) {
      if (next === "'") {
        cur += "''";
        i++;
        continue;
      }
      inSingle = false;
      cur += ch;
      continue;
    }
    if (ch === ";" && !inSingle) {
      const stmt = cur.trim();
      if (stmt) out.push(stmt);
      cur = "";
      continue;
    }
    cur += ch;
  }
  const tail = cur.trim();
  if (tail) out.push(tail);
  return out.filter((s) => {
    const lines = s.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.some((l) => !l.startsWith("--"));
  });
}

async function runFile(rel) {
  const text = readFileSync(resolve(root, rel), "utf8");
  const stmts = splitSql(text);
  console.log(`Running ${rel} (${stmts.length} statements)...`);
  for (const stmt of stmts) {
    await sql.query(stmt);
  }
  console.log(`OK ${rel}`);
}

await runFile("neon/schema.sql");
await runFile("neon/seed-dummy.sql");
const counts = await sql`
  SELECT
    (SELECT COUNT(*)::int FROM notices WHERE is_dummy) AS notices,
    (SELECT COUNT(*)::int FROM resources WHERE is_dummy) AS resources,
    (SELECT COUNT(*)::int FROM gallery WHERE is_dummy) AS gallery,
    (SELECT COUNT(*)::int FROM banners WHERE is_dummy) AS banners,
    (SELECT value FROM site_settings WHERE key = 'board_data_mode') AS mode
`;
console.log("Seed counts:", counts[0]);
