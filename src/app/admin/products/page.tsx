import { redirect } from "next/navigation";

/** 레거시 AdminShell 경로 → PieChain HQ만 사용 */
export default function AdminProductsRedirect() {
  redirect("/hq/products");
}
