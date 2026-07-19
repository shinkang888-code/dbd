"use client";

import { useCallback, useEffect, useState } from "react";
import { LEDGER_STREAM_LABELS, type LedgerStream } from "@/lib/ledger/types";

type TxRow = {
  id: string;
  tenant_id: string;
  stream: string;
  source_table: string;
  status: string;
  tx_hash: string | null;
  prev_hash: string | null;
  seq: number | null;
  created_at: string;
  trans_data: Record<string, unknown>;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  chained: "bg-sky-100 text-sky-800",
  block_assigned: "bg-emerald-100 text-emerald-800",
  tampered: "bg-red-100 text-red-800",
};

export function LedgerTransactionExplorer({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stream, setStream] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (stream) params.set("stream", stream);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/ledger/transactions?${params}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setRows(json.data ?? []);
        setTotal(json.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, stream, status]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="control w-auto"
          value={stream}
          onChange={(e) => {
            setStream(e.target.value);
            setPage(1);
          }}
        >
          <option value="">?? ???</option>
          {Object.entries(LEDGER_STREAM_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="control w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">?? ??</option>
          <option value="pending">pending</option>
          <option value="chained">chained</option>
          <option value="block_assigned">block_assigned</option>
          <option value="tampered">tampered</option>
        </select>
        <span className="ml-auto text-[13px] text-dim">? {total.toLocaleString()}?</span>
      </div>

      {loading ? (
        <p className="py-6 text-[13px] text-dim">???? ?...</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-[13px] text-dim">
          ?? ??? ????. ??·??·?? ??? ?? ? ?????.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
          <table className="w-full min-w-[800px] text-[13px]">
            <thead>
              <tr className="border-b border-line bg-fog text-left text-dim">
                <th className="px-3 py-2 font-medium">??</th>
                <th className="px-3 py-2 font-medium">???</th>
                <th className="px-3 py-2 font-medium">??</th>
                <th className="px-3 py-2 font-medium">seq</th>
                <th className="px-3 py-2 font-medium">H_i (tx_hash)</th>
                <th className="px-3 py-2 font-medium">??</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-fog/50">
                  <td className="whitespace-nowrap px-3 py-2 text-[12px]">
                    {new Date(r.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-3 py-2">
                    {LEDGER_STREAM_LABELS[r.stream as LedgerStream] ?? r.stream}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-medium ${STATUS_COLOR[r.status] ?? "bg-fog"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.seq ?? "-"}</td>
                  <td
                    className="max-w-[140px] truncate px-3 py-2 font-mono text-[11px]"
                    title={r.tx_hash ?? ""}
                  >
                    {r.tx_hash ? `${r.tx_hash.slice(0, 12)}...` : "-"}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-[12px] text-dim">
                    {summarizeTransData(r.trans_data)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="button-secondary disabled:opacity-40"
            onClick={() => setPage((p) => p - 1)}
          >
            ??
          </button>
          <span className="px-3 py-1 text-[13px]">
            {page} / {Math.ceil(total / 20)}
          </span>
          <button
            type="button"
            disabled={page >= Math.ceil(total / 20)}
            className="button-secondary disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
          >
            ??
          </button>
        </div>
      )}
    </div>
  );
}

function summarizeTransData(data: Record<string, unknown>): string {
  const action = data.eventType ?? data.action;
  const summary = data.summary;
  if (summary && typeof summary === "object") {
    const s = summary as Record<string, unknown>;
    const parts = [action, s.channel, s.status, s.documentId].filter(Boolean);
    if (parts.length) return String(parts.join(" · "));
  }
  return action ? String(action) : JSON.stringify(data).slice(0, 60);
}
