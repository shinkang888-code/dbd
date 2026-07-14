// filepath: src/app/admin/orders/page.tsx
import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersPanel } from "@/components/admin/orders-panel";

export const metadata = { title: "Admin · Orders" };

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <OrdersPanel />
    </AdminShell>
  );
}
