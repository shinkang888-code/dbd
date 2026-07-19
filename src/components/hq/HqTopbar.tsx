"use client";

import Link from "next/link";

export function HqTopbar({
  email,
  dbMode,
}: {
  email?: string | null;
  dbMode: "neon" | "local-file" | "memory";
}) {
  const mall = process.env.NEXT_PUBLIC_MALL_URL ?? "http://localhost:3000";
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:px-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-dim">Command Center</p>
        <p className="text-[15px] font-semibold">파이프라인 총괄</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span
          className={`rounded-full px-2.5 py-1 font-bold ${
            dbMode === "neon" ? "bg-sage/15 text-sage" : "bg-fog text-dim"
          }`}
        >
          {dbMode === "neon" ? "Neon DB" : dbMode === "local-file" ? "로컬 DB" : "메모리"}
        </span>
        {email ? (
          <span className="rounded-full border border-line px-2.5 py-1 font-medium text-dim">{email}</span>
        ) : (
          <Link href="/auth/sign-in?next=/hq" className="rounded-full bg-coral px-3 py-1 font-bold text-white">
            로그인
          </Link>
        )}
        <Link
          href={mall}
          className="rounded-full border border-line px-2.5 py-1 font-medium text-dim hover:text-ink"
        >
          스토어 ←
        </Link>
      </div>
    </header>
  );
}
