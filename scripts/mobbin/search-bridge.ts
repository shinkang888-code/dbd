/**
 * Mobbin 로컬 검색 브릿지 — 본인 PC에서만 동작.
 *
 * 대시보드(/studio/mobbin)가 http://127.0.0.1:3921 로 검색·썸네일을 요청한다.
 * Vercel 서버는 Mobbin에 붙지 않는다. Chrome에 로그인된 세션(storageState 또는 CDP)만 사용.
 *
 * 준비:
 *   npm i -D playwright
 *   npx playwright install chromium
 *   npx tsx scripts/mobbin/login.ts   # 1회: 로그인 후 Enter → .mobbin-session.json
 *
 * 실행:
 *   npm run mobbin:bridge
 *
 * (선택) 이미 띄운 Chrome에 붙기:
 *   chrome --remote-debugging-port=9222
 *   MOBBIN_CDP_URL=http://127.0.0.1:9222 npm run mobbin:bridge
 */
import http from "node:http";
import { URL } from "node:url";
import { chromium, type Browser, type Page } from "playwright";

const HOST = "127.0.0.1";
const PORT = Number(process.env.MOBBIN_BRIDGE_PORT || 3921);
const STATE = process.env.MOBBIN_STATE || ".mobbin-session.json";
const CDP = process.env.MOBBIN_CDP_URL?.trim() || "";

type SearchHit = {
  appKey: string;
  name: string;
  url: string;
  platform: string;
  category?: string;
  screenHint?: string;
};

type ThumbCache = { dataUrl: string; bytes: number; at: number };

let browser: Browser | null = null;
let page: Page | null = null;
const thumbCache = new Map<string, ThumbCache>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cors(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function appKeyFromHref(href: string): string | null {
  const m = href.match(/\/apps\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function ensurePage(): Promise<Page> {
  if (page) return page;

  if (CDP) {
    browser = await chromium.connectOverCDP(CDP);
    const ctx = browser.contexts()[0] ?? (await browser.newContext());
    page = ctx.pages()[0] ?? (await ctx.newPage());
    console.log(`[bridge] CDP 연결: ${CDP}`);
  } else {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      storageState: STATE,
      viewport: { width: 1280, height: 900 },
    });
    page = await ctx.newPage();
    console.log(`[bridge] storageState: ${STATE}`);
  }
  return page;
}

/** Mobbin 검색 결과 파싱 — 여러 URL 패턴을 순차 시도 */
async function searchMobbin(q: string, platform: string): Promise<SearchHit[]> {
  const p = await ensurePage();
  const plat = platform === "web" || platform === "sites" ? "web" : "ios";
  const queries = [
    `https://mobbin.com/search/apps/${plat}?search=${encodeURIComponent(q)}`,
    `https://mobbin.com/search/apps/${plat}?q=${encodeURIComponent(q)}`,
    `https://mobbin.com/browse/${plat === "web" ? "web" : "mobile"}?search=${encodeURIComponent(q)}`,
  ];

  const hits = new Map<string, SearchHit>();

  for (const url of queries) {
    try {
      await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await sleep(1200);
      // 스크롤해 리스트 lazy-load
      for (let i = 0; i < 4; i++) {
        await p.mouse.wheel(0, 1400);
        await sleep(400);
      }

      const rows = await p.evaluate(() => {
        const out: {
          href: string;
          name: string;
          category: string;
          screenHint: string;
        }[] = [];
        const seen = new Set<string>();
        for (const a of Array.from(document.querySelectorAll('a[href*="/apps/"]'))) {
          const href = (a as HTMLAnchorElement).href.split("?")[0];
          if (!href.includes("/apps/") || seen.has(href)) continue;
          seen.add(href);
          const card =
            a.closest("[class*='card'], article, li, div") ?? a.parentElement;
          const text = (card?.textContent || a.textContent || "").replace(/\s+/g, " ").trim();
          const name =
            (a.querySelector("h2,h3,p,span") as HTMLElement | null)?.innerText?.trim() ||
            text.split(" ").slice(0, 6).join(" ") ||
            href;
          out.push({
            href,
            name: name.slice(0, 80),
            category: "",
            screenHint: (text.match(/(\d[\d,]*)\s*screens?/i) || [])[1] || "",
          });
        }
        return out;
      });

      for (const r of rows) {
        const appKey = appKeyFromHref(r.href);
        if (!appKey || hits.has(appKey)) continue;
        hits.set(appKey, {
          appKey,
          name: r.name || appKey,
          url: r.href.startsWith("http") ? r.href : `https://mobbin.com${r.href}`,
          platform: plat === "web" ? "Web" : "iOS",
          category: r.category || undefined,
          screenHint: r.screenHint || undefined,
        });
      }
      if (hits.size >= 8) break;
    } catch (e) {
      console.warn("[bridge] search try failed", url, e instanceof Error ? e.message : e);
    }
  }

  // 쿼리 문자열로 1차 필터(페이지가 전체 browse일 때)
  const needle = q.trim().toLowerCase();
  let list = [...hits.values()];
  if (needle) {
    const filtered = list.filter(
      (h) =>
        h.name.toLowerCase().includes(needle) ||
        h.appKey.toLowerCase().includes(needle),
    );
    if (filtered.length) list = filtered;
  }
  return list.slice(0, 80);
}

/** 앱 상세에서 첫 스크린(프론트)만 저용량 JPEG로 캡처 */
async function fetchFrontThumb(appUrl: string, appKey: string): Promise<ThumbCache> {
  const cached = thumbCache.get(appKey);
  if (cached && Date.now() - cached.at < 1000 * 60 * 30) return cached;

  const p = await ensurePage();
  await p.goto(appUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(1000);

  // 1) CDN 이미지 URL이 있으면 작은 걸로 교체해 fetch
  const imgSrc = await p.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
    const good = imgs.find((img) => {
      const s = img.currentSrc || img.src || "";
      return (
        s.startsWith("http") &&
        img.naturalWidth > 80 &&
        !/avatar|icon|logo|emoji/i.test(s) &&
        (s.includes("screen") || s.includes("mobbin") || img.width > 120)
      );
    });
    return good ? good.currentSrc || good.src : "";
  });

  let buf: Buffer | null = null;

  if (imgSrc) {
    try {
      // 가능하면 폭 축소 쿼리 (CDN이 무시해도 OK)
      const u = new URL(imgSrc);
      u.searchParams.set("w", "280");
      u.searchParams.set("q", "40");
      const res = await p.request.get(u.toString(), { timeout: 20000 });
      if (res.ok()) {
        const raw = Buffer.from(await res.body());
        // 너무 크면 스크린샷 경로로 폴백
        if (raw.length < 180_000) buf = raw;
      }
    } catch {
      /* screenshot fallback */
    }
  }

  if (!buf) {
    const locator = p.locator("img").filter({ hasNot: p.locator("[src*='avatar']") }).first();
    await locator.waitFor({ state: "visible", timeout: 15000 }).catch(() => null);
    const shot = await locator.screenshot({ type: "jpeg", quality: 32 }).catch(() => null);
    if (shot) buf = Buffer.from(shot);
  }

  if (!buf) {
    // 최후: 뷰포트 상단 일부
    buf = Buffer.from(
      await p.screenshot({
        type: "jpeg",
        quality: 28,
        clip: { x: 280, y: 120, width: 360, height: 640 },
      }),
    );
  }

  // 상한: 약 60KB 넘으면 quality 더 낮춰 재시도는 생략하고 앞부분만 유지(이미 jpeg)
  const dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
  const entry: ThumbCache = { dataUrl, bytes: buf.length, at: Date.now() };
  thumbCache.set(appKey, entry);
  return entry;
}

async function handle(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const u = new URL(req.url || "/", `http://${HOST}:${PORT}`);

  try {
    if (u.pathname === "/health") {
      return json(res, 200, {
        ok: true,
        localOnly: true,
        mode: CDP ? "cdp" : "storageState",
        port: PORT,
      });
    }

    if (u.pathname === "/search") {
      const q = (u.searchParams.get("q") || "").trim();
      if (!q) return json(res, 400, { error: "q required" });
      const platform = (u.searchParams.get("platform") || "ios").toLowerCase();
      console.log(`[bridge] search q="${q}" platform=${platform}`);
      const results = await searchMobbin(q, platform);
      return json(res, 200, {
        q,
        platform,
        count: results.length,
        results,
        indexedAt: new Date().toISOString(),
      });
    }

    if (u.pathname === "/thumbnail") {
      const appKey = (u.searchParams.get("appKey") || "").trim();
      const appUrl = (u.searchParams.get("url") || "").trim();
      if (!appUrl && !appKey) return json(res, 400, { error: "url or appKey required" });
      const url =
        appUrl ||
        `https://mobbin.com/apps/${encodeURIComponent(appKey)}`;
      const key = appKey || appKeyFromHref(url) || url;
      console.log(`[bridge] thumbnail ${key}`);
      const thumb = await fetchFrontThumb(url, key);
      return json(res, 200, {
        appKey: key,
        url,
        bytes: thumb.bytes,
        dataUrl: thumb.dataUrl,
      });
    }

    json(res, 404, { error: "not found", routes: ["/health", "/search", "/thumbnail"] });
  } catch (e) {
    console.error("[bridge]", e);
    json(res, 500, {
      error: e instanceof Error ? e.message : String(e),
      hint: "login.ts 로 세션을 저장했는지, 또는 MOBBIN_CDP_URL 로 Chrome에 붙었는지 확인하세요.",
    });
  }
}

const server = http.createServer((req, res) => {
  void handle(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`\n✅ Mobbin 검색 브릿지  http://${HOST}:${PORT}`);
  console.log(`   대시보드 /studio/mobbin 에서 검색창을 쓰면 이 프로세스가 파싱합니다.`);
  console.log(`   중지: Ctrl+C\n`);
});

process.on("SIGINT", async () => {
  await browser?.close().catch(() => {});
  process.exit(0);
});
