"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Wifi, WifiOff, Image as ImageIcon, Loader2 } from "lucide-react";

const BRIDGE = process.env.NEXT_PUBLIC_MOBBIN_BRIDGE_URL || "http://127.0.0.1:3921";

type Hit = {
  appKey: string;
  name: string;
  url: string;
  platform: string;
  category?: string;
  screenHint?: string;
};

type BridgeHealth = { ok: boolean; mode?: string };

export function MobbinSearchExplorer() {
  const [health, setHealth] = useState<BridgeHealth | null>(null);
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<"ios" | "web">("ios");
  const [hits, setHits] = useState<Hit[]>([]);
  const [selected, setSelected] = useState<Hit | null>(null);
  const [thumb, setThumb] = useState<{ dataUrl: string; bytes: number } | null>(null);
  const [busy, setBusy] = useState<"search" | "thumb" | null>(null);
  const [error, setError] = useState("");
  const [indexedAt, setIndexedAt] = useState<string | null>(null);

  const probe = useCallback(async () => {
    try {
      const res = await fetch(`${BRIDGE}/health`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error("offline");
      const data = (await res.json()) as BridgeHealth;
      setHealth({ ok: true, mode: data.mode });
      return true;
    } catch {
      setHealth({ ok: false });
      return false;
    }
  }, []);

  useEffect(() => {
    void probe();
    const id = setInterval(() => void probe(), 8000);
    return () => clearInterval(id);
  }, [probe]);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (!query) return;
    setBusy("search");
    setError("");
    setThumb(null);
    setSelected(null);
    try {
      const ok = await probe();
      if (!ok) {
        throw new Error(
          "로컬 브릿지가 꺼져 있습니다. PC에서 npm run mobbin:bridge 를 실행하세요.",
        );
      }
      const res = await fetch(
        `${BRIDGE}/search?q=${encodeURIComponent(query)}&platform=${platform}`,
        { signal: AbortSignal.timeout(90000) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "search failed");
      setHits(data.results || []);
      setIndexedAt(data.indexedAt || new Date().toISOString());
      if (!(data.results || []).length) setError("검색 결과가 없습니다. 다른 키워드를 시도하세요.");
    } catch (err) {
      setHits([]);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function loadThumb(hit: Hit) {
    setSelected(hit);
    setBusy("thumb");
    setError("");
    setThumb(null);
    try {
      const res = await fetch(
        `${BRIDGE}/thumbnail?appKey=${encodeURIComponent(hit.appKey)}&url=${encodeURIComponent(hit.url)}`,
        { signal: AbortSignal.timeout(90000) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "thumbnail failed");
      setThumb({ dataUrl: data.dataUrl, bytes: data.bytes });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const online = health?.ok === true;
  const groups = useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const h of hits) {
      const key = (h.name[0] || "#").toUpperCase();
      const letter = /[A-Z]/.test(key) ? key : "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(h);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [hits]);

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-paper">
      {/* 상단: 검색이 핵심 */}
      <div className="border-b border-line bg-fog/40 px-4 py-4 md:px-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[16px] font-bold text-ink">Mobbin 목록 검색</p>
            <p className="mt-0.5 text-[12px] text-dim">
              로컬 브릿지가 켜져 있을 때만 파싱합니다. 선택 후 프론트 이미지 1장만 저용량으로
              가져옵니다.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              online ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {online ? <Wifi size={12} /> : <WifiOff size={12} />}
            {online ? `브릿지 ON (${health?.mode || "local"})` : "브릿지 OFF"}
          </span>
        </div>

        <form onSubmit={runSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-1 rounded-full border border-line bg-paper p-1 text-[12px] font-semibold">
            {(["ios", "web"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`rounded-full px-3 py-1.5 ${
                  platform === p ? "bg-ink text-white" : "text-dim hover:text-ink"
                }`}
              >
                {p === "ios" ? "iOS" : "Web"}
              </button>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search on Mobbin..."
              className="control w-full !rounded-full !py-3 pl-10 pr-4 text-[14px]"
            />
          </div>
          <button
            type="submit"
            disabled={busy === "search" || !q.trim()}
            className="button-primary inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {busy === "search" ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            검색·인덱싱
          </button>
        </form>

        {!online && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900">
            PC 터미널에서{" "}
            <code className="rounded bg-white px-1 font-mono text-[11px]">npm run mobbin:bridge</code>{" "}
            실행 (최초 1회{" "}
            <code className="rounded bg-white px-1 font-mono text-[11px]">npm run mobbin:login</code>
            ). Chrome에 로그인된 상태로 유지하세요.
          </p>
        )}
      </div>

      {/* 목록: 인덱싱 형식 */}
      <div className="max-h-[420px] overflow-y-auto px-4 py-3 md:px-5">
        {hits.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-dim">
            검색어를 입력하면 Mobbin 결과가 인덱스 목록으로 표시됩니다.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-[11px] text-dim">
              {hits.length}건
              {indexedAt ? ` · 인덱싱 ${new Date(indexedAt).toLocaleTimeString("ko-KR")}` : ""}
            </p>
            {groups.map(([letter, items]) => (
              <div key={letter}>
                <p className="mb-1.5 text-[11px] font-bold tracking-wide text-dim">{letter}</p>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {items.map((h) => {
                    const active = selected?.appKey === h.appKey;
                    return (
                      <li key={h.appKey}>
                        <button
                          type="button"
                          onClick={() => void loadThumb(h)}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] transition-colors ${
                            active ? "bg-ink text-white" : "hover:bg-fog"
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate font-semibold">{h.name}</span>
                          <span className={`shrink-0 text-[11px] ${active ? "text-white/70" : "text-dim"}`}>
                            {h.platform}
                            {h.screenHint ? ` · ${h.screenHint}` : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단: 선택 미리보기 + 이미지 가져오기 */}
      <div className="border-t border-line bg-fog/30 px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-ink">선택 항목 · 프론트 썸네일</p>
            {selected ? (
              <div className="mt-2 space-y-2">
                <p className="text-[13px] font-semibold">{selected.name}</p>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-[11px] text-coral hover:underline"
                >
                  {selected.url}
                </a>
                <button
                  type="button"
                  disabled={busy === "thumb" || !online}
                  onClick={() => void loadThumb(selected)}
                  className="button-primary mt-1 inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {busy === "thumb" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ImageIcon size={14} />
                  )}
                  이미지 가져오기 (저용량 1장)
                </button>
              </div>
            ) : (
              <p className="mt-2 text-[12px] text-dim">목록에서 앱을 선택하세요.</p>
            )}
            {error && <p className="mt-2 text-[12px] font-semibold text-coral">{error}</p>}
          </div>

          <div className="grid h-[220px] w-[140px] place-items-center overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
            {thumb ? (
              <img
                src={thumb.dataUrl}
                alt={selected?.name || "thumb"}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="px-3 text-center text-[11px] text-dim">
                <ImageIcon className="mx-auto mb-2 opacity-40" size={28} />
                썸네일 영역
                <br />
                {thumb ? "" : "선택 후 가져오기"}
              </div>
            )}
          </div>
        </div>
        {thumb && (
          <p className="mt-2 text-[11px] text-dim">
            수신 {(thumb.bytes / 1024).toFixed(1)} KB · 디스크에 저장하지 않음(세션 미리보기)
          </p>
        )}
      </div>
    </section>
  );
}
