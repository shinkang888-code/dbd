import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "공급처" };

export default function SuppliersPage() {
  return (
    <OpsBoardPage
      title="공급처"
      description="공급사·벤더 마스터. 역직구 Supply와 연동한다."
      links={[
        { href: "/admin/sourcing", label: "역직구 Supply" },
        { href: "/admin/pipeline/catalog", label: "카탈로그" },
      ]}
    />
  );
}
