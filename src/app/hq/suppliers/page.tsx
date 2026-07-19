import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 공급처" };

export default function HqSuppliersPage() {
  return <SourcingConsole tab="공급처" />;
}
