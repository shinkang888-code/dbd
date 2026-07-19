import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "PDP 생성·편집" };

export default function PipelinePdpPage() {
  return (
    <OpsBoardPage
      title="PDP 생성·편집"
      description="Gemini/Studio 파이프라인의 PDP 문서 제작·편집 허브. 승인 큐와 게시로 이어진다."
      links={[
        { href: "/studio/creator/pdp", label: "PDP 문서" },
        { href: "/studio/creator/review", label: "승인 큐" },
        { href: "/studio/creator/jobs", label: "생성 작업" },
      ]}
    />
  );
}
