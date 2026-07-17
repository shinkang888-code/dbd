import { StudioPageHeader } from "@/components/studio/studio-shell";
import { MobbinPanel } from "@/components/studio/mobbin-panel";

export const metadata = { title: "Mobbin 컬렉션 정리" };

export default function MobbinPage() {
  return (
    <>
      <StudioPageHeader
        title="Mobbin Collection Organizer"
        description="저장한 앱을 mobbin 네이티브 카테고리별 컬렉션으로 자동 분류합니다. 이미지는 저장하지 않고 링크·메타데이터만 다룹니다. 카테고리는 아래에서 이름변경·병합·수동 재분류할 수 있습니다."
      />
      <MobbinPanel />
    </>
  );
}
