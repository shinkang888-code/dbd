"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Shield,
  Link2,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { LEDGER_STREAM_LABELS, type LedgerStream } from "@/lib/ledger/types";

type OverviewData = {
  enabled: boolean;
  health: "healthy" | "degraded" | "critical" | "disabled";
  healthMessage: string;
  identityCount: number;
  txPending: number;
  txChained: number;
  txBlockAssigned: number;
  txTampered: number;
  blockCount: number;
  anchorCount: number;
  alertOpen: number;
  lastBlockAt: string | null;
  lastAnchorAt: string | null;
  streams: { stream: string; pending: number; chained: number; blocks: number }[];
  config?: { anchorProvider: string; blockThreshold: string };
};

const HEALTH_STYLE = {
  healthy: { icon: CheckCircle2, box: "border-emerald-200 bg-emerald-50", iconCls: "text-emerald-600" },
  degraded: { icon: AlertTriangle, box: "border-amber-200 bg-amber-50", iconCls: "text-amber-600" },
  critical: { icon: XCircle, box: "border-red-200 bg-red-50", iconCls: "text-red-600" },
  disabled: { icon: Shield, box: "border-line bg-fog", iconCls: "text-dim" },
};

export function LedgerOverviewPanel({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [lastWorker, setLastWorker] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ledger/overview", { credentials: "include" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const runWorker = async (action: "worker" | "scan") => {
    setWorking(true);
    try {
      const res = await fetch("/api/admin/ledger/worker", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      setLastWorker(JSON.stringify(json, null, 2));
      onRefresh();
      await load();
    } finally {
      setWorking(false);
    }
  };

  if (loading && !data) {
    return <div className="py-8 text-[13px] text-dim">?? ?? ???? ?...</div>;
  }

  const health = data?.health ?? "disabled";
  const hs = HEALTH_STYLE[health];
  const HealthIcon = hs.icon;

  return (
    <div className="space-y-5">
      <div className={`flex flex-wrap items-start gap-4 rounded-2xl border p-5 ${hs.box}`}>
        <HealthIcon className={`mt-0.5 shrink-0 ${hs.iconCls}`} size={28} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">
            {health === "healthy" && "?? ??"}
            {health === "degraded" && "?? - ?? ??"}
            {health === "critical" && "?? - ??? ??"}
            {health === "disabled" && "?? ?? ???"}
          </p>
          <p className="mt-1 text-[13px] text-dim">{data?.healthMessage}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={working}
            onClick={() => runWorker("worker")}
            className="button-secondary inline-flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw size={14} className={working ? "animate-spin" : ""} />
            ??/?? ??
          </button>
          <button
            type="button"
            disabled={working}
            onClick={() => runWorker("scan")}
            className="button-secondary inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Shield size={14} />
            ??? ??
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="?? ?? H_v" value={data?.identityCount ?? 0} icon={Shield} />
        <StatCard label="?? ??" value={data?.txPending ?? 0} icon={Clock} warn={!!data?.txPending} />
        <StatCard label="Merkle ??" value={data?.blockCount ?? 0} icon={Link2} />
        <StatCard label="?? ??" value={data?.anchorCount ?? 0} icon={Activity} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper p-4">
          <h3 className="mb-3 text-[14px] font-semibold text-ink">?? ?????</h3>
          <dl className="space-y-2 text-[13px]">
            <Row label="?? ?? (chained)" value={data?.txChained ?? 0} />
            <Row label="?? ?? (block_assigned)" value={data?.txBlockAssigned ?? 0} />
            <Row label="?? ?? (tampered)" value={data?.txTampered ?? 0} danger={!!data?.txTampered} />
            <Row label="??? ??" value={data?.alertOpen ?? 0} danger={!!data?.alertOpen} />
          </dl>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-4">
          <h3 className="mb-3 text-[14px] font-semibold text-ink">?? ??</h3>
          <dl className="space-y-2 text-[13px]">
            <Row label="??? ??" value={formatTime(data?.lastBlockAt)} />
            <Row label="??? ??" value={formatTime(data?.lastAnchorAt)} />
            <Row label="?? ???" value={data?.config?.anchorProvider ?? "-"} />
            <Row label="?? ???" value={data?.config?.blockThreshold ?? "50"} />
          </dl>
        </div>
      </div>

      {data?.streams && data.streams.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="border-b border-line bg-fog px-4 py-3">
            <h3 className="text-[14px] font-semibold text-ink">???? ??</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-dim">
                <th className="px-4 py-2 font-medium">???</th>
                <th className="px-4 py-2 font-medium">??</th>
                <th className="px-4 py-2 font-medium">???</th>
                <th className="px-4 py-2 font-medium">??</th>
              </tr>
            </thead>
            <tbody>
              {data.streams.map((s) => (
                <tr key={s.stream} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 font-medium">
                    {LEDGER_STREAM_LABELS[s.stream as LedgerStream] ?? s.stream}
                  </td>
                  <td className="px-4 py-2">{s.pending}</td>
                  <td className="px-4 py-2">{s.chained}</td>
                  <td className="px-4 py-2">{s.blocks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lastWorker && (
        <details className="rounded-2xl border border-line bg-fog p-4 text-[12px]">
          <summary className="cursor-pointer font-medium text-ink">??? ?? ?? ??</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-dim">{lastWorker}</pre>
        </details>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  warn,
}: {
  label: string;
  value: number;
  icon: typeof Shield;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="mb-1 flex items-center gap-2 text-[11px] text-dim">
        <Icon size={14} />
        {label}
      </div>
      <p className={`text-[26px] font-bold tabular-nums ${warn && value > 0 ? "text-amber-600" : "text-ink"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Row({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-dim">{label}</dt>
      <dd className={`font-medium tabular-nums ${danger ? "text-red-600" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ko-KR");
  } catch {
    return iso;
  }
}
