import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "Import" };

export default function ImportPage() {
  return (
    <OpsBoardPage
      title="Import"
      description="카탈로그 → Studio/원장으로 가져오기. 생성 작업·미디어 입고와 연결한다."
      links={[
        { href: "/studio/creator/jobs", label: "생성 작업" },
        { href: "/studio/creator/library", label: "미디어 라이브러리" },
        { href: "/admin/pipeline/catalog", label: "카탈로그로" },
      ]}
    />
  );
}
