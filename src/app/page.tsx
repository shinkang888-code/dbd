import { redirect } from "next/navigation";

/** dbd 배포는 대시보드(HQ) 진입점이 기본 — 몰은 NEXT_PUBLIC_MALL_URL */
export default function HomePage() {
  redirect("/hq");
}
