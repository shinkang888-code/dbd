"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoLoginButton } from "@/components/demo-login-button";

const MALL_URL = process.env.NEXT_PUBLIC_MALL_URL ?? "http://localhost:3000";

function titleForPath(path: string): { eyebrow: string; title: string } {
  if (path.startsWith("/studio")) {
    return { eyebrow: "Design & Creator", title: "LEXI Studio" };
  }
  if (path.startsWith("/admin/pipeline")) {
    return { eyebrow: "Sourcing Pipeline", title: "소싱 파이프라인" };
  }
  if (path.startsWith("/admin/ledger")) {
    return { eyebrow: "Hybrid Ledger", title: "분산원장 HDL" };
  }
  if (path.startsWith("/admin")) {
    return { eyebrow: "Command Center", title: "파이프라인 총괄" };
  }
  return { eyebrow: "LEXI HQ", title: "운영 콘솔" };
}

export function OpsTopbar({
  email,
  dbMode,
}: {
  email?: string | null;
  dbMode?: string;
}) {
  const path = usePathname() || "/admin";
  const { eyebrow, title } = titleForPath(path);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 py-2.5 backdrop-blur md:px-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-dim">{eyebrow}</p>
        <p className="text-[14px] font-semibold leading-tight">{title}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {dbMode ? (
          <span
            className={`rounded-full px-2 py-0.5 font-bold ${
              dbMode === "neon" || dbMode === "cafe24" ? "bg-sage/15 text-sage" : "bg-fog text-dim"
            }`}
          >
            {dbMode}
          </span>
        ) : null}
        {email ? (
          <span className="rounded-full border border-line px-2 py-0.5 font-medium text-dim">{email}</span>
        ) : (
          <DemoLoginButton
            next={path}
            className="rounded-full bg-coral px-2.5 py-0.5 text-[11px] font-bold text-white"
          />
        )}
        <a
          href={MALL_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line px-2 py-0.5 font-medium text-dim hover:text-ink"
        >
          스토어 ↗
        </a>
        <Link
          href="/admin"
          className="rounded-full border border-line px-2 py-0.5 font-medium text-dim hover:text-ink"
        >
          HQ
        </Link>
      </div>
    </header>
  );
}
