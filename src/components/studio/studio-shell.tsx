"use client";

/** Studio 페이지 헤더 — 고밀도 Ops 셸과 함께 사용 */

export function StudioPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[24px] font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-dim">{description}</p>
      </div>
      {action}
    </header>
  );
}

/** @deprecated layout에서 OpsShell 사용. 하위 호환 no-op */
export function StudioShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
