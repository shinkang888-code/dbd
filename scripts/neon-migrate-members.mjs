import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
const sql = neon(url);

await sql.query(`
CREATE TABLE IF NOT EXISTS member_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  refund_account TEXT NOT NULL DEFAULT '',
  identity_file_url TEXT,
  identity_file_name TEXT,
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`);
await sql.query(`CREATE INDEX IF NOT EXISTS member_profiles_email_idx ON member_profiles (email)`);
await sql.query(`CREATE INDEX IF NOT EXISTS member_profiles_complete_idx ON member_profiles (profile_complete)`);
console.log("member_profiles ready");
