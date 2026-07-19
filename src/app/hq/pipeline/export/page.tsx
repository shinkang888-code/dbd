import { SourcingConsole } from "@/components/admin/sourcing-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · Export" };

export default function HqExportPage() {
  return <SourcingConsole tab="리스팅" />;
}
