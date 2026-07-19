"use client";

import { useState } from "react";
import { Link2, LayoutDashboard, ScrollText, Boxes, AlertTriangle } from "lucide-react";
import { LedgerOverviewPanel } from "./LedgerOverviewPanel";
import { LedgerTransactionExplorer } from "./LedgerTransactionExplorer";
import { LedgerBlockExplorer } from "./LedgerBlockExplorer";
import { LedgerAlertsPanel } from "./LedgerAlertsPanel";

type TabId = "overview" | "transactions" | "blocks" | "alerts";

const TABS: { id: TabId; label: string; icon: typeof Link2 }[] = [
  { id: "overview", label: "?? ??", icon: LayoutDashboard },
  { id: "transactions", label: "?? ??", icon: ScrollText },
  { id: "blocks", label: "Merkle ??", icon: Boxes },
  { id: "alerts", label: "??? ??", icon: AlertTriangle },
];

export function LedgerCommandCenter() {
  const [tab, setTab] = useState<TabId>("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-[22px] font-semibold text-ink">
          <Link2 size={22} className="text-coral" />
          ???? ?? (HDL)
        </h2>
        <p className="mt-1 text-[13px] text-dim">
          ??-?? ??? ???? / Merkle ?? / ?? ?? ? LawyGo HDL? dbd? ??
        </p>
      </div>

      <div className="flex w-fit flex-wrap gap-1 rounded-full border border-line bg-fog p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              tab === t.id ? "bg-ink text-white" : "text-dim hover:text-ink"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <LedgerOverviewPanel refreshKey={refreshKey} onRefresh={bump} />}
      {tab === "transactions" && <LedgerTransactionExplorer refreshKey={refreshKey} />}
      {tab === "blocks" && <LedgerBlockExplorer refreshKey={refreshKey} />}
      {tab === "alerts" && <LedgerAlertsPanel refreshKey={refreshKey} onRefresh={bump} />}
    </div>
  );
}
