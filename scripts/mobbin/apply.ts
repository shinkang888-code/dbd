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
/** 앱당 컬렉션에 담을 스크린 수 상한 (앱당 수백 개가 있으므로 반드시 제한) */
const SCREEN_LIMIT = Number(process.env.SCREEN_LIMIT || 10);

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

/**
 * 앱의 스크린을 선택해 컬렉션에 담는다 — 실측 확정 경로:
 *   스크린 카드 hover → 좌상단 원형 체크박스 → (다중선택 가능)
 *   → 하단 일괄바 `Save` (aria-haspopup="dialog")
 *   → 다이얼로그: `All saved` / `Create collection` / 기존 컬렉션 목록에서 선택
 */
async function assignScreensToCollection(
  page: Page,
  appUrl: string,
  collection: string,
  limit: number,
) {
  await page.goto(appUrl, { waitUntil: "networkidle" });
  const cards = page.locator('a[href^="/screens/"]');
  const total = Math.min(await cards.count(), limit);
  if (!total) return;

  for (let i = 0; i < total; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded().catch(() => {});
    await card.hover();
    // hover 시 카드 좌상단에 나타나는 선택 체크박스
    await card.locator("button").first().click().catch(() => {});
    await sleep(250);
  }

  // 하단 일괄바의 Save (다이얼로그 트리거)
  await page.locator('button[aria-haspopup="dialog"]:has-text("Save")').last().click();
  await sleep(700);
  // 다이얼로그에서 대상 컬렉션 선택
  const target = page.getByRole("dialog").getByText(collection, { exact: true });
  if (await target.count()) {
    await target.first().click();
  } else {
    console.warn(`  ! 다이얼로그에 "${collection}" 없음 — 컬렉션 생성 여부 확인 필요`);
    await page.keyboard.press("Escape");
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
ℹ️  배치(assign)는 --assign 플래그로 실행합니다.
    mobbin 컬렉션의 단위는 '앱'이 아니라 '스크린'이므로, 앱의 스크린을
    카테고리 컬렉션에 담습니다. 앱당 스크린이 수백 개(예: Instagram 666)라
    SCREEN_LIMIT 로 앱당 담을 개수를 제한하세요(기본 ${SCREEN_LIMIT}).
`);
  } else {
    for (const col of plan) {
      for (const app of col.apps) {
        console.log(`→ ${app.name} 스크린 ${SCREEN_LIMIT}개 → "${col.collection}"`);
        await assignScreensToCollection(page, app.url, col.collection, SCREEN_LIMIT);
        await sleep(jitter());
      }
    }
  }

  await browser.close();
  console.log("✅ 컬렉션 생성 단계 완료.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
