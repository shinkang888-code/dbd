import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "Export 잡" };

export default function ExportPage() {
  return (
    <OpsBoardPage
      title="Export 잡"
      description="채널 송출·Cafe24 게시·롤백 잡을 총괄한다."
      links={[
        { href: "/studio/creator/publish", label: "게시·롤백" },
        { href: "/studio/cafe24", label: "Cafe24 연결" },
        { href: "/admin/cafe24", label: "채널·Cafe24" },
      ]}
    />
  );
}
