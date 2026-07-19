import { OpsBoardPage } from "@/components/ops/ops-board-page";

export const metadata = { title: "컬렉션" };

export default function CollectionsPage() {
  return (
    <OpsBoardPage
      title="컬렉션"
      description="큐레이션 컬렉션·시즌 묶음. Studio 홈 섹션과 연결한다."
      links={[
        { href: "/studio/design/home", label: "홈 섹션" },
        { href: "/admin/banners", label: "배너" },
      ]}
    />
  );
}
