/**
 * mobbin 세션 저장 — 사람이 직접 로그인하고 세션(쿠키/토큰)만 storageState로 보관.
 * 비밀번호는 저장하지 않는다.
 *
 * 준비:  npm i -D playwright tsx && npx playwright install chromium
 * 실행:  npx tsx scripts/mobbin/login.ts
 */
import readline from "node:readline";
import { chromium } from "playwright";

const STATE = process.env.MOBBIN_STATE || ".mobbin-session.json";

async function waitEnter(prompt: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((r) => rl.question(prompt, () => r()));
  rl.close();
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("https://mobbin.com/saved/mobile/screens", { waitUntil: "domcontentloaded" });
  await waitEnter("브라우저에서 mobbin에 로그인한 뒤, 이 터미널에서 Enter를 누르세요… ");
  await ctx.storageState({ path: STATE });
  console.log(`✅ 세션 저장: ${STATE} (비밀번호 아님 — 쿠키/토큰만)`);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
