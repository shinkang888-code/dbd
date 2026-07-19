import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 구매요청" };

export default function HqPurchaseRequestsPage() {
  return <SourcingConsole tab="구매요청" />;
}
