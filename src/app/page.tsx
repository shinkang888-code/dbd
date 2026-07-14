import { HeroEditorial } from "@/components/sections/hero-editorial";
import { CategoryChips } from "@/components/sections/category-chips";
import { RealtimeRanking } from "@/components/sections/realtime-ranking";
import { TimeDeal } from "@/components/sections/time-deal";
import { ShopTheLook } from "@/components/sections/shop-the-look";
import { BrandSpotlight } from "@/components/sections/brand-spotlight";
import { UgcGallery } from "@/components/sections/ugc-gallery";

/** 홈 — 섹션 순서는 docs/lexi-master-spec.md §3.4 고정 */
export default function HomePage() {
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
