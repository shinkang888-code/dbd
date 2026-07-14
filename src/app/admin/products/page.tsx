// filepath: src/app/admin/products/page.tsx
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsPanel } from "@/components/admin/products-panel";

export const metadata = { title: "Admin · Products" };

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <ProductsPanel />
    </AdminShell>
  );
}
