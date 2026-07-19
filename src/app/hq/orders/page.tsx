import { OrdersPanel } from "@/components/admin/orders-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 주문" };

export default function HqOrdersPage() {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-[24px] font-semibold">주문</h1>
      <OrdersPanel />
    </div>
  );
}
