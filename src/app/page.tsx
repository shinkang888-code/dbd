import { HeroEditorial } from "@/components/sections/hero-editorial";
import { CategoryChips } from "@/components/sections/category-chips";
import { RealtimeRanking } from "@/components/sections/realtime-ranking";
import { TimeDeal } from "@/components/sections/time-deal";
import { ShopTheLook } from "@/components/sections/shop-the-look";
import { BrandSpotlight } from "@/components/sections/brand-spotlight";
import { UgcGallery } from "@/components/sections/ugc-gallery";
import { StudioSectionsView } from "@/components/studio/storefront-sections";
import { listSections } from "@/lib/studio/store";

/** Studio published 섹션 우선, 없으면 기존 에디토리얼 홈으로 안전 폴백 */
export default async function HomePage() {
  try {
    const sections = await listSections({ publishedOnly: true });
    if (sections.length) return <StudioSectionsView sections={sections} />;
  } catch {
    // Studio 테이블이 없거나 DB 미연결이면 기존 홈을 유지한다.
  }
  return (
    <>
      <HeroEditorial />
      <CategoryChips />
      <RealtimeRanking />
      <TimeDeal />
      <ShopTheLook />
      <BrandSpotlight />
      <UgcGallery />
    </>
  );
}
