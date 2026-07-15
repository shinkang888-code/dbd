/** designDoc → HTML 렌더러 — 자사몰 PDP와 Cafe24/쿠팡 상세HTML 공용. 스펙 §2 P3 */
import type { DesignBlock, ListingDraft } from "@/lib/hq/types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderDesignDoc(
  doc: { blocks: DesignBlock[] },
  assets: ListingDraft["assets"],
): string {
  const img = (i: number) => esc(assets[i]?.url ?? "");
  const parts = doc.blocks.map((b) => {
    switch (b.type) {
      case "hero":
        return `<section style="text-align:center;padding:24px 0">
  <img src="${img(b.assetIndex)}" alt="" style="max-width:100%;border-radius:16px"/>
  <h1 style="font-size:26px;margin:16px 0 4px">${esc(b.headline)}</h1>
  ${b.sub ? `<p style="color:#6e6e73">${esc(b.sub)}</p>` : ""}
</section>`;
      case "usp":
        return `<ul style="padding:0 8px;list-style:none">
${b.items.map((i) => `  <li style="padding:8px 0;border-bottom:1px solid #e4e4e0">✓ ${esc(i)}</li>`).join("\n")}
</ul>`;
      case "gallery":
        return `<section style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:16px 0">
${b.assetIndexes.map((i) => `  <img src="${img(i)}" alt="" style="width:100%;border-radius:12px"/>`).join("\n")}
</section>`;
      case "spec-table":
        return `<table style="width:100%;border-collapse:collapse;font-size:14px">
${b.rows.map(([k, v]) => `  <tr><th style="text-align:left;padding:8px;border:1px solid #e4e4e0;background:#f5f5f3">${esc(k)}</th><td style="padding:8px;border:1px solid #e4e4e0">${esc(v)}</td></tr>`).join("\n")}
</table>`;
      case "faq":
        return b.items
          .map((f) => `<details style="border:1px solid #e4e4e0;border-radius:12px;padding:12px;margin:8px 0"><summary style="font-weight:700">${esc(f.q)}</summary><p style="color:#6e6e73">${esc(f.a)}</p></details>`)
          .join("\n");
      case "cta":
        return `<div style="text-align:center;padding:24px 0"><span style="display:inline-block;background:#ff5c4d;color:#fff;font-weight:700;padding:14px 40px;border-radius:14px">${esc(b.label)}</span></div>`;
    }
  });
  return `<div class="lexi-pdp" style="max-width:720px;margin:0 auto;font-family:Pretendard,Inter,sans-serif;color:#111114">
${parts.join("\n")}
</div>`;
}
