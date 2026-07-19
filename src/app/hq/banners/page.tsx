import { BannersPanel } from "@/components/admin/banners-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 배너" };

export default function HqBannersPage() {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-[24px] font-semibold">배너</h1>
      <BannersPanel />
    </div>
  );
}
