/**
 * Mobbin API 인증 — 사람(관리자 세션) 또는 머신(로컬 어댑터 토큰).
 * 로컬 Playwright 어댑터는 관리자 쿠키가 없으므로 Bearer 토큰으로 sync 한다.
 */
import { studioActor } from "@/lib/studio/http";

/** 어댑터용 토큰. MOBBIN_SYNC_TOKEN 우선, 없으면 HQ_API_TOKEN 재사용 */
function machineToken() {
  return process.env.MOBBIN_SYNC_TOKEN || process.env.HQ_API_TOKEN || "";
}

function bearer(req: Request) {
  const h = req.headers.get("authorization") ?? "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
}

/** 관리자 세션이면 이메일, 유효한 머신 토큰이면 "machine:mobbin", 아니면 null */
export async function mobbinActor(req: Request): Promise<string | null> {
  const actor = await studioActor();
  if (actor) return actor;
  const token = machineToken();
  if (token && bearer(req) === token) return "machine:mobbin";
  return null;
}
