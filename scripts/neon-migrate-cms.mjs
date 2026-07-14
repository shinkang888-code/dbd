/**
 * Apply CMS migration (cta_buttons + pages) using DATABASE_URL
 * Usage: node --env-file=.env scripts/neon-migrate-cms.mjs
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

const text = readFileSync(resolve(root, "neon/migrate-cms.sql"), "utf8");
const stmts = splitSql(text);
console.log(`Running migrate-cms.sql (${stmts.length} statements)...`);
for (const stmt of stmts) {
  await sql.query(stmt);
}
const pages = await sql`SELECT slug, title FROM pages ORDER BY slug`;
console.log("OK pages:", pages);
