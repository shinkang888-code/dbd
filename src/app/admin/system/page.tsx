import { DataModeSwitch } from "@/components/data-mode-switch";
import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "시스템 · Data Mode" };

export default function SystemPage() {
  return (
    <div className="space-y-4">
      <OpsBoardPage
        title="시스템 · Data Mode"
        description="Dummy / Real 데이터 소스 전환과 운영 환경 점검."
        links={[
          { href: "/admin", label: "커맨드 센터" },
          { href: "/studio/cafe24", label: "Cafe24 연결" },
          { href: "/admin/ledger", label: "HDL" },
        ]}
      />
      <div className="rounded-xl border border-line bg-paper p-4">
        <p className="mb-3 text-[12px] font-bold text-dim">Data Mode</p>
        <DataModeSwitch />
      </div>
    </div>
  );
}
