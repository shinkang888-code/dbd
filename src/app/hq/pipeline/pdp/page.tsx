import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · PDP" };

export default function HqPdpPage() {
  return <SourcingConsole tab="초안승인" />;
}
