"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LexiMark } from "@/components/lexi-mark";
import { OPS_NAV, opsActive } from "@/lib/ops/nav";

export function OpsSidebar() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-4 p-3 pb-8">
      <Link href="/admin" className="flex items-center gap-2 px-1" onClick={() => setOpen(false)}>
        <LexiMark size={26} className="text-dim" />
        <div>
          <p className="font-display text-[17px] font-semibold tracking-tight leading-none">LEXI HQ</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-dim">Command Center</p>
        </div>
      </Link>
      {OPS_NAV.map((sec) => (
        <div key={sec.section}>
          <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-wider text-dim/75">
            {sec.section}
          </p>
          <ul className="space-y-px">
            {sec.items.map((item) => {
              const active = !item.external && opsActive(path, item.href);
              const cls = `block rounded-md px-2 py-[5px] text-[12.5px] font-medium leading-snug transition-colors ${
                active ? "bg-ink text-white" : "text-dim hover:bg-fog hover:text-ink"
              }`;
              if (item.external) {
                return (
                  <li key={`${item.href}-${item.label}`}>
                    <a
                      href={item.href}
                      className={cls}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cls} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-40 grid size-10 place-items-center rounded-xl border border-line bg-paper shadow-sm md:hidden"
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="닫기"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-line bg-paper">
            <div className="flex justify-end p-2">
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-fog"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
          </aside>
        </div>
      )}
      <aside className="hidden w-[232px] shrink-0 border-r border-line bg-paper md:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{nav}</div>
      </aside>
    </>
  );
}
