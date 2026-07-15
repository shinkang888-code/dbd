import { AdminShell } from "@/components/admin/admin-shell";
import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "역직구 콘솔" };

export default function SourcingPage() {
  return (
    <AdminShell>
      <SourcingConsole />
    </AdminShell>
  );
}
