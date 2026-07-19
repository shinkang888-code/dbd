import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "정산" };

export default function SettlementsPage() {
  return (
    <OpsBoardPage
      title="정산"
      description="채널·공급처 정산 보드. HDL 원장 이벤트와 대조한다."
      links={[
        { href: "/admin/ledger", label: "HDL 대시보드" },
        { href: "/admin/orders", label: "주문 preview" },
      ]}
    />
  );
}
