/**
 * Mobbin 큐레이션 헬퍼 — 기본적으로 mobbin에 아무것도 쓰지 않는다.
 *
 * 설계(B안): 앱→카테고리 분류는 dbd 대시보드가 소유하고, mobbin 컬렉션은
 * 사용자가 직접 고른 스크린만 담는 공간으로 남긴다. 따라서 대량 자동 배치는 하지 않는다.
 *
 * 기본 실행(읽기 전용) — 카테고리 인덱스를 콘솔로 확인:
 *   DASHBOARD_URL=https://dbd0.vercel.app MOBBIN_SYNC_TOKEN=xxx \
 *   npx tsx scripts/mobbin/apply.ts
 *
 * 명시적 큐레이션(원할 때만, 앱 1개 단위):
 *   ... npx tsx scripts/mobbin/apply.ts --app <appKey> --collection "AI" --limit 10
 */
import { chromium, type Page } from "playwright";

const STATE = process.env.MOBBIN_STATE || ".mobbin-session.json";
const DASHBOARD = (process.env.DASHBOARD_URL || "http://localhost:3000").replace(/\/$/, "");
const TOKEN = process.env.MOBBIN_SYNC_TOKEN || process.env.HQ_API_TOKEN || "";

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const APP = arg("app");
const COLLECTION = arg("collection");
const LIMIT = Number(arg("limit") || process.env.SCREEN_LIMIT || 10);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = () => 1500 + Math.floor(Math.random() * 2500);

type Plan = {
  collection: string;
  apps: { appKey: string; name: string; url: string; screenCount: number }[];
}[];

async function fetchPlan(): Promise<Plan> {
  const res = await fetch(`${DASHBOARD}/api/studio/mobbin`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`인덱스 조회 실패: ${data.error || res.status}`);
  return data.plan as Plan;
}

/**
 * 스크린을 선택해 컬렉션에 담는다 — 실측 확정 경로:
 *   스크린 카드 hover → 좌상단 원형 체크박스 → (다중선택)
 *   → 하단 일괄바 `Save` (aria-haspopup="dialog")
 *   → 다이얼로그: `All saved` / `Create collection` / 기존 컬렉션에서 선택
 */
async function curateScreens(page: Page, appUrl: string, collection: string, limit: number) {
  await page.goto(appUrl, { waitUntil: "networkidle" });
  const cards = page.locator('a[href^="/screens/"]');
  const total = Math.min(await cards.count(), limit);
  if (!total) {
    console.log("  스크린을 찾지 못했습니다.");
    return;
  }
  for (let i = 0; i < total; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded().catch(() => {});
    await card.hover();
    await card.locator("button").first().click().catch(() => {}); // hover 시 나타나는 선택 체크박스
    await sleep(250);
  }
  await page.locator('button[aria-haspopup="dialog"]:has-text("Save")').last().click();
  await sleep(700);
  const target = page.getByRole("dialog").getByText(collection, { exact: true });
  if (await target.count()) {
    await target.first().click();
    console.log(`  ✅ ${total}개 스크린 → "${collection}"`);
  } else {
    console.warn(`  ! 다이얼로그에 "${collection}" 컬렉션이 없습니다. mobbin에서 먼저 만드세요.`);
    await page.keyboard.press("Escape");
  }
  await sleep(jitter());
}

async function main() {
  if (!TOKEN) throw new Error("MOBBIN_SYNC_TOKEN (또는 HQ_API_TOKEN) 환경변수가 필요합니다.");
  const plan = await fetchPlan();

  // 기본: 읽기 전용 인덱스 출력
  if (!APP || !COLLECTION) {
    console.log(`카테고리별 앱 인덱스 (${plan.length} categories) — mobbin에 쓰지 않음\n`);
    for (const col of plan) {
      console.log(`■ ${col.collection} (${col.apps.length})`);
      for (const a of col.apps) console.log(`    · ${a.name}  ${a.url}`);
    }
    console.log(`
큐레이션이 필요하면 앱 1개씩 명시적으로 실행하세요:
  npx tsx scripts/mobbin/apply.ts --app <appKey> --collection "<컬렉션명>" --limit 10
`);
    return;
  }

  // 명시적 큐레이션 모드
  const app = plan.flatMap((c) => c.apps).find((a) => a.appKey === APP);
  if (!app) throw new Error(`인덱스에 appKey "${APP}" 가 없습니다.`);
  console.log(`▶ ${app.name} 스크린 ${LIMIT}개 → "${COLLECTION}"`);

  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ storageState: STATE });
  const page = await ctx.newPage();
  await curateScreens(page, app.url, COLLECTION, LIMIT);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
