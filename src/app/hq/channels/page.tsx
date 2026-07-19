import Link from "next/link";
import { Cafe24Panel } from "@/components/admin/cafe24-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 채널" };

export default function HqChannelsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[24px] font-semibold">채널 · Cafe24</h1>
        <p className="mt-1 text-[13px] text-dim">게시 채널 · Cafe24 OAuth · 몰 연결</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/studio/cafe24"
          className="rounded-lg bg-ink px-3 py-2 text-[12px] font-bold text-white"
        >
          Cafe24 연결 (Studio)
        </Link>
        <a
          href={process.env.NEXT_PUBLIC_CAFE24_ADMIN_URL ?? "https://eclogin.cafe24.com/Shop/"}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-line px-3 py-2 text-[12px] font-bold"
        >
          Cafe24 Admin ↗
        </a>
      </div>
      <Cafe24Panel />
    </div>
  );
}
