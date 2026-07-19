import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 소싱발주" };

export default function HqSourcingOrdersPage() {
  return <SourcingConsole tab="발주" />;
}
