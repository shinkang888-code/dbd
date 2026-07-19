"use client";

import { useCallback, useEffect, useState } from "react";
import { LEDGER_STREAM_LABELS, type LedgerStream } from "@/lib/ledger/types";

type BlockRow = {
  id: string;
  tenant_id: string;
  stream: string;
  block_height: number;
  merkle_root: string;
  block_hash: string;
  tx_count: number;
  created_at: string;
  anchor: {
    anchor_hash: string;
    external_network: string;
    external_tx_id: string | null;
    anchored_at: string;
  } | null;
};

export function LedgerBlockExplorer({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<BlockRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ledger/blocks?page=${page}&pageSize=15`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setRows(json.data ?? []);
        setTotal(json.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-dim">
        ?? ???? Merkle ??? ?? ?????. ? ??? ?? ??(?????)? ????
        ?????.
      </p>

      {loading ? (
        <p className="py-6 text-[13px] text-dim">???? ?...</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-[13px] text-dim">
          ?? ??? ??? ????. ???·?? ??? ?? ? ?????.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <div key={b.id} className="rounded-2xl border border-line bg-paper p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">?? #{b.block_height}</span>
                <span className="rounded bg-fog px-2 py-0.5 text-[11px]">
                  {LEDGER_STREAM_LABELS[b.stream as LedgerStream] ?? b.stream}
                </span>
                <span className="text-[11px] text-dim">{b.tx_count} tx</span>
                <span className="ml-auto text-[11px] text-dim">
                  {new Date(b.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <dl className="grid gap-1 font-mono text-[11px]">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-dim">Merkle Root</dt>
                  <dd className="truncate text-ink" title={b.merkle_root}>
                    {b.merkle_root}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-dim">Block Hash</dt>
                  <dd className="truncate text-ink" title={b.block_hash}>
                    {b.block_hash}
                  </dd>
                </div>
                {b.anchor ? (
                  <>
                    <div className="mt-1 flex gap-2 border-t border-line pt-1">
                      <dt className="w-24 shrink-0 text-emerald-700">?? OK</dt>
                      <dd className="text-emerald-700">{b.anchor.external_network}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-dim">Anchor Hash</dt>
                      <dd className="truncate text-ink">{b.anchor.anchor_hash}</dd>
                    </div>
                  </>
                ) : (
                  <div className="mt-1 text-amber-600">?? ?? ?? ?</div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}

      {total > 15 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="button-secondary disabled:opacity-40"
            onClick={() => setPage((p) => p - 1)}
          >
            ??
          </button>
          <span className="px-3 py-1 text-[13px]">{page}</span>
          <button
            type="button"
            disabled={page >= Math.ceil(total / 15)}
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
