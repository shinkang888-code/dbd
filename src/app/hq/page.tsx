import { HqDashboardView } from "@/components/hq/HqDashboardView";

export const dynamic = "force-dynamic";
export const metadata = { title: "LEXI HQ" };

export default function HqHomePage() {
  return <HqDashboardView />;
}
