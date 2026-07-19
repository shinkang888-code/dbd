import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 정산" };

export default function HqSettlementsPage() {
  return <SourcingConsole tab="정산" />;
}
