/**
 * Studio Phase 0–2 스모크 (DB/키 없이도 구조·모듈 존재 검증)
 * 실행: node scripts/smoke-studio.mjs
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "docs/lexi-cafe24-studio-master-spec.md",
  "docs/lexi-studio-decision-queue.md",
  "src/app/studio/page.tsx",
  "src/app/studio/design/themes/page.tsx",
  "src/app/studio/design/home/page.tsx",
  "src/app/studio/creator/library/page.tsx",
  "src/app/studio/creator/jobs/page.tsx",
  "src/app/studio/creator/pdp/page.tsx",
  "src/app/studio/creator/review/page.tsx",
  "src/app/studio/creator/publish/page.tsx",
  "src/app/studio/cafe24/page.tsx",
  "src/app/studio/decisions/page.tsx",
  "src/app/api/studio/themes/route.ts",
  "src/app/api/studio/sections/route.ts",
  "src/app/api/studio/media/route.ts",
  "src/app/api/studio/jobs/route.ts",
  "src/app/api/studio/documents/route.ts",
  "src/app/api/studio/publish/route.ts",
  "src/app/api/studio/dashboard/route.ts",
  "src/lib/studio/publish.ts",
  "src/lib/studio/generate.ts",
  "src/lib/studio/store.ts",
  "src/app/page.tsx",
  "src/app/new/page.tsx",
  "src/app/brands/[slug]/page.tsx",
  "src/app/trend/[slug]/page.tsx",
  "src/app/account/rewards/page.tsx",
  "src/lib/hq/relational.ts",
  "src/lib/sourcing/connectors/alibaba.ts",
  "src/lib/sourcing/connectors/temu.ts",
  "src/lib/sourcing/connectors/cafe24-mall.ts",
  "src/components/legacy-commerce-banner.tsx",
  "docs/dashboard-split.md",
];

const missing = required.filter((p) => !existsSync(join(root, p)));
if (missing.length) {
  console.error("[smoke-studio] FAIL — missing files:");
  for (const p of missing) console.error("  -", p);
  process.exit(1);
}

const envExample = join(root, ".env.example");
const envLocal = join(root, ".env");
console.log("[smoke-studio] Phase 0–2 paths OK");
console.log("[smoke-studio] .env.example:", existsSync(envExample) ? "yes" : "NO");
console.log("[smoke-studio] .env:", existsSync(envLocal) ? "yes" : "NO");
console.log(
  "[smoke-studio] Tip: set DATABASE_URL + CAFE24_* then run `npm run db:push` && `npm run seed:studio`",
);
console.log("[smoke-studio] PASS");
