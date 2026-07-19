import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "소싱발주" };

export default function SourcingOrdersPage() {
  return (
    <OpsBoardPage
      title="소싱발주"
      description="공급처 발주·이행 추적."
      links={[
        { href: "/admin/purchase-requests", label: "구매요청" },
        { href: "/admin/settlements", label: "정산" },
        { href: "/admin/sourcing", label: "역직구 콘솔" },
      ]}
    />
  );
}
