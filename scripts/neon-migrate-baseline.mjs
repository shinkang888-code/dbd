import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

await sql.query(`ALTER TABLE pages ADD COLUMN IF NOT EXISTS baseline_html TEXT NOT NULL DEFAULT ''`);
console.log("baseline_html column ready");
