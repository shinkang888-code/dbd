"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type AlertRow = {
  id: string;
  tenant_id: string;
  alert_type: string;
  tamper_point_tx_id: string | null;
  replay_status: string;
  details: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
};

const ALERT_LABEL: Record<string, string> = {
  tx_hash_mismatch: "?? ?? ??? (H_i)",
  merkle_root_mismatch: "Merkle Root ???",
  anchor_mismatch: "?? ?? ???",
  chain_break: "?? ??",
  missing_h_v: "?? ?? H_v ??",
};

export function LedgerAlertsPanel({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const [rows, setRows] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOnly, setOpenOnly] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ledger/alerts?open=${openOnly ? "1" : "0"}`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setRows(json.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [openOnly]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const runReplay = async (alertId: string) => {
    await fetch("/api/admin/ledger/worker", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "replay", alertId }),
    });
    onRefresh();
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          ????
        </label>
        <button type="button" onClick={load} className="button-secondary inline-flex items-center gap-1">
          <RefreshCw size={14} />
          ????
        </button>
      </div>

      {loading ? (
        <p className="py-6 text-[13px] text-dim">???? ?...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="font-medium text-emerald-800">??? ?? ??</p>
          <p className="mt-1 text-[13px] text-emerald-600">
            3?? ??(????????) ?? ?????.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 ${
                a.resolved_at ? "border-line bg-fog" : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className={a.resolved_at ? "text-dim" : "mt-0.5 shrink-0 text-red-600"}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {ALERT_LABEL[a.alert_type] ?? a.alert_type}
                  </p>
                  <p className="mt-1 text-[11px] text-dim">
                    {new Date(a.created_at).toLocaleString("ko-KR")} · ??? {a.tenant_id}
                  </p>
                  {a.tamper_point_tx_id && (
                    <p className="mt-1 font-mono text-[11px] text-red-700">
                      ?? ?? TX: {a.tamper_point_tx_id}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-dim">
                    Replay: {a.replay_status}
                    {a.resolved_at && ` · ?? ${new Date(a.resolved_at).toLocaleString("ko-KR")}`}
                  </p>
                </div>
                {!a.resolved_at && (
                  <button
                    type="button"
                    className="button-secondary shrink-0"
                    onClick={() => runReplay(a.id)}
                  >
                    ???? ??
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
