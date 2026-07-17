/**
 * Mobbin Apply 어댑터 — 대시보드 계획을 읽어 mobbin에 컬렉션을 만들고 앱을 배치한다.
 * 원칙: 이미지 다운로드 없음. 컬렉션 구조만 조작. 단일 세션 직렬·지연.
 *
 * 실행(계획 확인 + 컬렉션 생성):
 *   DASHBOARD_URL=https://dbd0.vercel.app MOBBIN_SYNC_TOKEN=xxx \
 *   npx tsx scripts/mobbin/apply.ts
 * 배치까지 시도(⚠️ 아래 RECON 확인 후):
 *   ... npx tsx scripts/mobbin/apply.ts --assign
 */
import { chromium, type Page } from "playwright";

const STATE = process.env.MOBBIN_STATE || ".mobbin-session.json";
const DASHBOARD = (process.env.DASHBOARD_URL || "http://localhost:3000").replace(/\/$/, "");
const TOKEN = process.env.MOBBIN_SYNC_TOKEN || process.env.HQ_API_TOKEN || "";
const ASSIGN = process.argv.includes("--assign");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = () => 1500 + Math.floor(Math.random() * 2500);

type Plan = { collection: string; apps: { appKey: string; name: string; url: string }[] }[];

async function fetchPlan(): Promise<Plan> {
  const res = await fetch(`${DASHBOARD}/api/studio/mobbin`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`계획 조회 실패: ${data.error || res.status}`);
  return data.plan as Plan;
}

/** 기존 컬렉션 이름 집합 */
async function existingCollections(page: Page): Promise<Set<string>> {
  await page.goto("https://mobbin.com/saved/mobile/screens", { waitUntil: "networkidle" });
  const names = new Set<string>();
  for (const el of await page.locator("main").getByRole("heading").all()) {
    const t = (await el.textContent().catch(() => ""))?.trim();
    if (t) names.add(t);
  }
  return names;
}

/** "Create collection" → 이름 입력 → 확정 (실측: 버튼 존재 확인됨) */
async function createCollection(page: Page, name: string) {
  await page.goto("https://mobbin.com/saved/mobile/screens", { waitUntil: "networkidle" });
  await page.getByText("Create collection", { exact: true }).first().click();
  await sleep(600);
  const input = page.locator('input[type="text"], input:not([type])').first();
  await input.fill(name);
  // 확정 버튼(Create/Save/Done)은 라벨이 다를 수 있어 후보를 순서대로 시도.
  for (const label of ["Create", "Save", "Done", "확인", "만들기"]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.count()) {
      await btn.first().click().catch(() => {});
      break;
    }
  }
  await sleep(jitter());
}

async function main() {
  if (!TOKEN) throw new Error("MOBBIN_SYNC_TOKEN (또는 HQ_API_TOKEN) 환경변수가 필요합니다.");
  const plan = await fetchPlan();
  console.log(`▶ 계획: 컬렉션 ${plan.length}개, 배치 ${plan.reduce((n, c) => n + c.apps.length, 0)}건`);
  plan.forEach((c) => console.log(`  · ${c.collection} (${c.apps.length})`));

  const browser = await chromium.launch({ headless: !ASSIGN });
  const ctx = await browser.newContext({ storageState: STATE });
  const page = await ctx.newPage();

  const existing = await existingCollections(page);
  for (const col of plan) {
    if (existing.has(col.collection)) {
      console.log(`= 이미 존재: ${col.collection}`);
      continue;
    }
    console.log(`+ 컬렉션 생성: ${col.collection}`);
    await createCollection(page, col.collection);
  }

  if (!ASSIGN) {
    console.log(`
⚠️  앱을 컬렉션에 '배치'하는 UI 경로는 아직 미검증입니다(RECON).
    앱 상세의 '...' 메뉴에는 Add to collection이 없었고, Saved 페이지의
    이동/드래그 또는 Saved 버튼 드롭다운일 가능성이 큽니다.
    로그인 세션에서 그 경로를 함께 확인한 뒤, assignToCollection()을 채우고
    --assign 플래그로 다시 실행하세요. (지금은 컬렉션 생성까지만 반영)
`);
  } else {
    // TODO(RECON): 검증된 UI 경로로 채운다. 미검증 상태로 임의 클릭하지 않는다.
    console.log("⚠️ --assign: assignToCollection()이 아직 비어 있습니다. RECON 후 구현하세요.");
  }

  await browser.close();
  console.log("✅ 컬렉션 생성 단계 완료.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
