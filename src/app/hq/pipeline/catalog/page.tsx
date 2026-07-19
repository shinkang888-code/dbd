import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 카탈로그" };

export default function HqCatalogPage() {
  return <SourcingConsole tab="소싱상품" />;
}
