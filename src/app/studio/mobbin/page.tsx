import { StudioPageHeader } from "@/components/studio/studio-shell";
import { MobbinPanel } from "@/components/studio/mobbin-panel";

export const metadata = { title: "Mobbin 컬렉션 정리" };

export default function MobbinPage() {
  return (
    <>
      <StudioPageHeader
        title="Mobbin Collection Organizer"
        description="저장한 mobbin 앱을 네이티브 카테고리별로 인덱싱해 한눈에 훑습니다. 분류는 이 대시보드가 소유하고 mobbin에는 쓰지 않습니다. 카테고리는 아래에서 이름변경·병합·수동 재분류할 수 있습니다."
      />
      <MobbinPanel />
    </>
  );
}
