import { ProductsPanel } from "@/components/admin/products-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 상품" };

export default function HqProductsPage() {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-[24px] font-semibold">상품</h1>
      <ProductsPanel />
    </div>
  );
}
