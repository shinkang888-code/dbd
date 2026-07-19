import { AdminShell } from "@/components/admin/admin-shell";
import { LedgerCommandCenter } from "@/components/admin/ledger/LedgerCommandCenter";

export const dynamic = "force-dynamic";
export const metadata = { title: "분산원장 (HDL)" };

export default function LedgerAdminPage() {
  return (
    <AdminShell>
      <LedgerCommandCenter />
    </AdminShell>
  );
}
