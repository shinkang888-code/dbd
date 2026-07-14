import { DataModeSwitch } from "@/components/data-mode-switch";
import { products, ugcPosts } from "@/lib/dummy-data";

export const metadata = { title: "Admin" };

export default function AdminPage() {
  const stats = [
    { label: "상품", value: products.length },
    { label: "브랜드", value: new Set(products.map((p) => p.brand)).size },
    { label: "UGC 게시물", value: ugcPosts.length },
    { label: "주문(더미)", value: 380 },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-semibold">LEXI Admin</h1>
          <p className="mt-1 text-[13px] text-dim">
            데이터 모드 · 상품 · 배너 관리 — 우측 토글로 Dummy/Real 전환
          </p>
        </div>
        <DataModeSwitch />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line p-4">
            <p className="text-[12px] font-medium text-dim">{s.label}</p>
            <p className="price mt-1 text-[26px] font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 rounded-xl bg-fog p-4 text-[13px] leading-relaxed text-dim">
        Real 모드 전환 시 <code>is_dummy = TRUE</code>인 모든 레코드가 FK 역순으로 Soft Delete
        되고, <code>site_settings.data_mode</code>가 <code>{`{mode:"real", initialized:true}`}</code>
        로 영속화됩니다. 상세: <code>docs/lexi-master-spec.md §4.3</code>
      </p>
    </div>
  );
}
