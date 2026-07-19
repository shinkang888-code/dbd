"use client";

import { OpsSidebar } from "./ops-sidebar";
import { OpsTopbar } from "./ops-topbar";

export function OpsShell({
  children,
  email,
  dbMode,
}: {
  children: React.ReactNode;
  email?: string | null;
  dbMode?: string;
}) {
  return (
    <div className="flex min-h-dvh bg-fog">
      <OpsSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OpsTopbar email={email} dbMode={dbMode} />
        <main className="flex-1 px-3 py-4 md:px-5 md:py-5">{children}</main>
      </div>
    </div>
  );
}
