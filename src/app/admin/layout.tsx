import { OpsShell } from "@/components/ops/ops-shell";
import { requireSession } from "@/lib/auth/admin";
import { adminStats } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  let dbMode = "memory";
  try {
    const stats = await adminStats();
    dbMode = String(stats.source ?? "memory");
  } catch {
    /* ignore */
  }

  return (
    <OpsShell email={session?.user?.email ?? null} dbMode={dbMode}>
      {children}
    </OpsShell>
  );
}
