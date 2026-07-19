"use client";

import { useEffect, useMemo, useState } from "react";
import { MobbinSearchExplorer } from "@/components/studio/mobbin-search-explorer";

type App = {
  appKey: string;
  name: string;
  url: string;
  platform: string[] | null;
  screenCount: number;
  iconUrl: string | null;
  nativeCategories: string[] | null;
  categoryOverride: string[] | null;
};
type Category = {
  name: string;
  label: string | null;
  mergedInto: string | null;
  source: string;
  sort: number;
};
type PlanCollection = {
  collection: string;
  apps: {
    appKey: string;
    name: string;
    url: string;
    iconUrl: string | null;
    platform: string[] | null;
    screenCount: number;
  }[];
};
type ApplyRun = {
  id: number;
  collectionCount: number;
  assignmentCount: number;
  status: string;
  createdAt: string;
};
type State = {
  source: string;
  apps: App[];
  categories: Category[];
  plan: PlanCollection[];
  runs: ApplyRun[];
};

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
}

export function MobbinPanel() {
  const [state, setState] = useState<State | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setState(await jsonFetch("/api/studio/mobbin"));
  }
  useEffect(() => {
    void load();
  }, []);

  async function run(fn: () => Promise<void>, ok: string) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await load();
      setMessage(ok);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!state) return <Empty text="불러오는 중…" />;

  const assignments = state.plan.reduce((n, c) => n + c.apps.length, 0);

  return (
    <div className="space-y-6">
      <MobbinSearchExplorer />

      {/* 안전 경계 안내 */}
      <div className="rounded-2xl border border-line bg-fog/60 p-4 text-[12px] leading-relaxed text-dim">
        <b className="text-ink">포인터 전용 · mobbin에 쓰지 않음</b> · 유료 이미지/콘텐츠는 저장하지
        않고 앱 링크·카테고리 메타만 다룹니다. 분류는 <b className="text-ink">이 대시보드가 소유</b>
        하며, mobbin 컬렉션은 직접 고른 스크린만 담는 공간으로 남겨둡니다. (mobbin 컬렉션 단위는
        앱이 아니라 스크린입니다.)
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="저장 앱" value={state.apps.length} />
        <Stat label="카테고리" value={state.categories.filter((c) => !c.mergedInto).length} />
        <Stat label="컬렉션(계획)" value={state.plan.length} />
        <Stat label="배치 수(계획)" value={assignments} />
      </div>

      {message && (
        <p className="rounded-xl bg-sage/10 p-3 text-[12px] font-semibold text-sage">{message}</p>
      )}

      {/* 계획 미리보기 (dry-run) */}
      <section className="rounded-2xl border border-line bg-paper p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[16px] font-bold">카테고리별 앱 인덱스</p>
            <p className="mt-1 text-[12px] text-dim">
              카테고리 편집·오버라이드가 즉시 반영됩니다. 앱을 누르면 mobbin에서 열립니다.
            </p>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              run(
                () => jsonFetch("/api/studio/mobbin/apply", { method: "POST" }),
                "현재 인덱스를 스냅샷으로 기록했습니다.",
              )
            }
            className="button-primary disabled:opacity-50"
          >
            인덱스 스냅샷 저장
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {state.plan.map((col) => (
            <div key={col.collection} className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold">{col.collection}</p>
                <span className="price text-[12px] font-bold text-dim">{col.apps.length}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {col.apps.map((a) => (
                  <li key={a.appKey}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-fog px-2.5 py-1.5 text-[11px] font-semibold hover:bg-ink hover:text-white"
                    >
                      <span className="min-w-0 flex-1 truncate">{a.name}</span>
                      <span className="shrink-0 opacity-60">
                        {(a.platform ?? []).join("/") || "—"}
                        {a.screenCount ? ` · ${a.screenCount}` : ""}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!state.plan.length && <Empty text="저장 앱이 없습니다. 로컬 어댑터로 sync 하세요." />}
        </div>
      </section>

      {/* 카테고리 에디터 */}
      <CategoryEditor state={state} busy={busy} run={run} />

      {/* 앱 오버라이드 */}
      <AppOverrides state={state} busy={busy} run={run} />

      {/* 실행 이력 */}
      {state.runs.length > 0 && (
        <section className="rounded-2xl border border-line bg-paper p-5">
          <p className="text-[16px] font-bold">실행 이력</p>
          <ul className="mt-3 space-y-1.5 text-[12px]">
            {state.runs.slice(0, 8).map((r) => (
              <li key={r.id} className="flex items-center gap-3 text-dim">
                <span className="price font-bold text-ink">#{r.id}</span>
                <span>{r.status}</span>
                <span>
                  컬렉션 {r.collectionCount} · 배치 {r.assignmentCount}
                </span>
                <span className="ml-auto">{new Date(r.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CategoryEditor({
  state,
  busy,
  run,
}: {
  state: State;
  busy: boolean;
  run: (fn: () => Promise<void>, ok: string) => Promise<void>;
  }) {
  const [custom, setCustom] = useState("");
  const targets = useMemo(
    () => state.categories.filter((c) => !c.mergedInto).map((c) => c.name),
    [state.categories],
  );

  function patch(name: string, body: Record<string, unknown>) {
    return jsonFetch("/api/studio/mobbin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ...body }),
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-paper p-5">
      <p className="text-[16px] font-bold">카테고리 에디터</p>
      <p className="mt-1 text-[12px] text-dim">
        mobbin 네이티브 카테고리를 시드로 씁니다. 이름변경·병합·커스텀 추가가 가능합니다.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-[12px]">
          <thead>
            <tr className="text-left text-dim">
              <th className="pb-2 font-semibold">원본</th>
              <th className="pb-2 font-semibold">표시 이름</th>
              <th className="pb-2 font-semibold">병합 대상</th>
              <th className="pb-2 font-semibold">출처</th>
            </tr>
          </thead>
          <tbody>
            {state.categories.map((c) => (
              <tr key={c.name} className="border-t border-line">
                <td className="py-2 pr-3 font-semibold">{c.name}</td>
                <td className="py-2 pr-3">
                  <input
                    className="control py-1.5"
                    defaultValue={c.label ?? ""}
                    placeholder={c.name}
                    disabled={busy}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (c.label ?? ""))
                        void run(() => patch(c.name, { label: v || null }), "이름을 변경했습니다.");
                    }}
                  />
                </td>
                <td className="py-2 pr-3">
                  <select
                    className="control py-1.5"
                    defaultValue={c.mergedInto ?? ""}
                    disabled={busy}
                    onChange={(e) =>
                      run(
                        () => patch(c.name, { mergedInto: e.target.value || null }),
                        "병합을 반영했습니다.",
                      )
                    }
                  >
                    <option value="">— 없음 —</option>
                    {targets
                      .filter((t) => t !== c.name)
                      .map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="py-2 text-dim">{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="control flex-1"
          placeholder="커스텀 카테고리 이름"
          value={custom}
          disabled={busy}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          disabled={busy || !custom.trim()}
          onClick={() =>
            run(async () => {
              await patch(custom.trim(), { source: "custom" });
              setCustom("");
            }, "커스텀 카테고리를 추가했습니다.")
          }
          className="button-primary disabled:opacity-50"
        >
          추가
        </button>
      </div>
    </section>
  );
}

function AppOverrides({
  state,
  busy,
  run,
}: {
  state: State;
  busy: boolean;
  run: (fn: () => Promise<void>, ok: string) => Promise<void>;
}) {
  function override(appKey: string, categories: string[] | null) {
    return jsonFetch("/api/studio/mobbin/apps", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appKey, categories }),
    });
  }
  return (
    <section className="rounded-2xl border border-line bg-paper p-5">
      <p className="text-[16px] font-bold">앱 수동 재분류</p>
      <p className="mt-1 text-[12px] text-dim">
        쉼표로 카테고리를 지정하면 네이티브보다 우선합니다. 비우고 저장하면 네이티브로 복귀합니다.
      </p>
      <div className="mt-4 space-y-2">
        {state.apps.map((app) => {
          const effective = app.categoryOverride?.length ? app.categoryOverride : app.nativeCategories;
          return (
            <div
              key={app.appKey}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold">{app.name}</p>
                <p className="text-[11px] text-dim">
                  {(app.platform ?? []).join(", ")} · {app.screenCount} screens ·{" "}
                  <span className={app.categoryOverride?.length ? "text-coral" : ""}>
                    {(effective ?? []).join(", ") || "미분류"}
                  </span>
                </p>
              </div>
              <input
                className="control w-56"
                defaultValue={(app.categoryOverride ?? []).join(", ")}
                placeholder={(app.nativeCategories ?? []).join(", ")}
                disabled={busy}
                onBlur={(e) => {
                  const parts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                  void run(
                    () => override(app.appKey, parts.length ? parts : null),
                    "재분류를 저장했습니다.",
                  );
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <p className="text-[11px] font-semibold text-dim">{label}</p>
      <p className="price mt-2 text-[25px] font-bold">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper p-8 text-center text-[13px] text-dim">
      {text}
    </div>
  );
}
