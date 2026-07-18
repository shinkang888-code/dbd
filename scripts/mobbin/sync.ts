/**
 * Mobbin Sync 어댑터 — 저장(Saved) 앱을 읽어 대시보드로 보낸다.
 * 원칙: 이미지/스크린은 내려받지 않는다. 앱 URL·이름·네이티브 카테고리·플랫폼·screen수만 수집.
 *
 * 준비:  scripts/mobbin/login.ts 로 세션 저장 후
 * 실행:  DASHBOARD_URL=https://dbd0.vercel.app MOBBIN_SYNC_TOKEN=xxx \
 *        npx tsx scripts/mobbin/sync.ts
 *
 * 예의(레이트리밋): 앱 페이지 방문 사이 1.5~4s 랜덤 지연, 단일 세션 직렬.
 */
import { chromium, type Page } from "playwright";

const STATE = process.env.MOBBIN_STATE || ".mobbin-session.json";
const DASHBOARD = (process.env.DASHBOARD_URL || "http://localhost:3000").replace(/\/$/, "");
const TOKEN = process.env.MOBBIN_SYNC_TOKEN || process.env.HQ_API_TOKEN || "";
const PLATFORMS = ["mobile", "web", "sites"] as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = () => 1500 + Math.floor(Math.random() * 2500);

type App = {
  appKey: string;
  name: string;
  url: string;
  platform: string[];
  screenCount: number;
  nativeCategories: string[];
};

/** /apps/<appKey>/<uuid>/screens → appKey (첫 세그먼트) */
function appKeyFromHref(href: string): string | null {
  const m = href.match(/\/apps\/([^/]+)/);
  return m ? m[1] : null;
}

/** Saved 각 플랫폼 탭에서 저장 앱 링크를 모은다 */
async function collectSavedAppHrefs(page: Page): Promise<Set<string>> {
  const hrefs = new Set<string>();
  for (const platform of PLATFORMS) {
    await page.goto(`https://mobbin.com/saved/${platform}/screens`, {
      waitUntil: "networkidle",
    });
    // "Show all"이 있으면 눌러 전체 앱 아이콘을 펼친다(best-effort).
    for (const btn of await page.getByText("Show all", { exact: true }).all()) {
      await btn.click().catch(() => {});
    }
    await sleep(800);
    for (const a of await page.locator('a[href^="/apps/"]').all()) {
      const href = await a.getAttribute("href");
      if (href) hrefs.add(href.split("?")[0]);
    }
  }
  return hrefs;
}

/** 앱 상세 페이지에서 메타데이터 추출 (Category/Platform/screen수는 페이지에 노출됨) */
async function readAppMeta(page: Page, href: string): Promise<App | null> {
  const appKey = appKeyFromHref(href);
  if (!appKey) return null;
  const url = `https://mobbin.com${href}`;
  await page.goto(url, { waitUntil: "networkidle" });

  const name = (await page.locator("h1").first().textContent().catch(() => ""))?.trim() || appKey;

  // 네이티브 카테고리는 링크로 노출된다(실측 확정):
  //   <a href="/search/apps/ios?...&filter=appCategories.Photo+%26+Video">Photo & Video</a>
  // 텍스트 파싱보다 안정적이라 링크 셀렉터를 쓴다.
  const nativeCategories = (
    await page.locator('a[href*="filter=appCategories."]').allTextContents()
  )
    .map((s) => s.trim())
    .filter(Boolean);

  // 플랫폼은 다른 플랫폼 변형 앱으로 가는 링크로 노출된다(iOS/Android/Web).
  const platform = (
    await page.locator('a[href^="/apps/"]:below(:text("Platform"))').allTextContents().catch(() => [])
  )
    .map((s) => s.trim())
    .filter((s) => /^(iOS|Android|Web|Site)$/i.test(s));

  // "Showing N screens"
  const body = (await page.locator("body").textContent().catch(() => "")) || "";
  const screenCount = Number(body.match(/Showing\s+([\d,]+)\s+screens/i)?.[1]?.replace(/,/g, "") || 0);

  return { appKey, name, url, platform, screenCount, nativeCategories };
}

async function main() {
  if (!TOKEN) throw new Error("MOBBIN_SYNC_TOKEN (또는 HQ_API_TOKEN) 환경변수가 필요합니다.");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ storageState: STATE });
  const page = await ctx.newPage();

  console.log("▶ Saved 앱 링크 수집…");
  const hrefs = await collectSavedAppHrefs(page);
  console.log(`  발견: ${hrefs.size}개 앱`);

  const apps: App[] = [];
  for (const href of hrefs) {
    const meta = await readAppMeta(page, href);
    if (meta) {
      apps.push(meta);
      console.log(`  · ${meta.name} [${meta.nativeCategories.join(", ") || "?"}] (${meta.screenCount})`);
    }
    await sleep(jitter()); // 예의 지연
  }
  await browser.close();

  console.log(`▶ 대시보드로 전송: ${DASHBOARD}/api/studio/mobbin/apps`);
  const res = await fetch(`${DASHBOARD}/api/studio/mobbin/apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ apps }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`sync 실패: ${data.error || res.status}`);
  console.log(`✅ 완료:`, data.result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
