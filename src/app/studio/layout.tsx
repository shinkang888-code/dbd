import { OpsShell } from "@/components/ops/ops-shell";
import { requireSession } from "@/lib/auth/admin";
import { cafe24Connected } from "@/lib/cafe24/oauth";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const connected = await cafe24Connected().catch(() => false);

  return (
    <OpsShell
      email={session?.user?.email ?? null}
      dbMode={connected ? "cafe24·studio" : "studio"}
    >
      {children}
    </OpsShell>
  );
}
