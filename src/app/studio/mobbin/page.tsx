import { StudioPageHeader } from "@/components/studio/studio-shell";
import { MobbinPanel } from "@/components/studio/mobbin-panel";

export const metadata = { title: "Mobbin 컬렉션 정리" };

export default function MobbinPage() {
  return (
    <>
      <StudioPageHeader
        title="Mobbin Collection Organizer"
        description="상단 검색은 로컬 Mobbin 브릿지(본인 PC)로만 파싱합니다. 아래 인덱스는 저장된 앱 메타를 카테고리별로 보여 주며, 분류는 이 대시보드가 소유합니다."
      />
      <MobbinPanel />
    </>
  );
}
