import { redirect } from "next/navigation";

/** Legacy admin home → LEXI HQ Command Center */
export default function AdminHomePage() {
  redirect("/hq");
}
