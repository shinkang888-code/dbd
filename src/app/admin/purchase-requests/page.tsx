import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "구매요청" };

export default function PurchaseRequestsPage() {
  return (
    <OpsBoardPage
      title="구매요청"
      description="고객/몰 구매요청 입고·상태. 소싱발주·정산으로 이어진다."
      links={[
        { href: "/admin/sourcing-orders", label: "소싱발주" },
        { href: "/admin/orders", label: "주문 preview" },
        { href: "/admin/sourcing", label: "역직구 콘솔" },
      ]}
    />
  );
}
