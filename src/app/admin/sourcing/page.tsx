import { redirect } from "next/navigation";

/** 구 Admin 역직구 → PieChain HQ 공급처 */
export default function SourcingPage() {
  redirect("/hq/suppliers");
}
