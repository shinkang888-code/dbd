import { HqApiBoard } from "@/components/hq/HqApiBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "HQ · 컬렉션" };

export default function HqCollectionsPage() {
  return (
    <HqApiBoard
      title="컬렉션"
      description="큐레이션 바구니"
      loadPath="/collections"
      listKey="collections"
    />
  );
}
