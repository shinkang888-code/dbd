/**
 * Apply KSAC storage/demo migration using SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
 *   $env:SUPABASE_URL="https://kffzajlutcszlrbjcrhw.supabase.co"
 *   node scripts/apply-migration.mjs
 *
 * Or paste supabase/migrations/20260713143000_storage_demo_seed.sql
 * into the Supabase SQL Editor and run it.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sql = readFileSync(
  resolve(__dirname, "../supabase/migrations/20260713143000_storage_demo_seed.sql"),
  "utf8",
);

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// Prefer storage bucket create via API (service role)
for (const id of ["attachments", "gallery", "banners"]) {
  const { data: existing } = await admin.storage.getBucket(id);
  if (existing) {
    console.log("bucket exists:", id);
    continue;
  }
  const { error } = await admin.storage.createBucket(id, { public: true, fileSizeLimit: 52428800 });
  if (error) console.error("bucket create failed:", id, error.message);
  else console.log("bucket created:", id);
}

// Note: arbitrary SQL requires the Database / Management API or SQL Editor.
// Print reminder for trigger/RPC portion.
console.log("\nBuckets ensured via Storage API.");
console.log("Run the full SQL file in Supabase SQL Editor for triggers/RPC/banner seed:");
console.log("  supabase/migrations/20260713143000_storage_demo_seed.sql");
console.log("\nSQL length:", sql.length, "chars");
