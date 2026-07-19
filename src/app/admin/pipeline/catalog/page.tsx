import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "카탈로그 인덱스" };

export default function CatalogPage() {
  return (
    <OpsBoardPage
      title="카탈로그 인덱스"
      description="Crawl 소스·상품 인덱스를 모은다. Cafe24 projection과 역직구 Supply 입력을 여기서 시작한다."
      links={[
        { href: "/admin/products", label: "상품 preview" },
        { href: "/admin/sourcing", label: "역직구 Supply" },
        { href: "/studio/creator/jobs", label: "생성 작업으로 넘기기" },
      ]}
      note="본 보드는 HQ PieChain IA 이식 단계입니다. 실제 crawl API는 이후 단계에서 연결합니다."
    />
  );
}
