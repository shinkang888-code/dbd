/**
 * LEXI 더미 데이터 — docs/lexi-master-spec.md §3.6
 * DB 시더(scripts/seed-dummy.ts)와 프론트 개발 미리보기가 공유하는 원천.
 * 모든 이미지는 AI 실사 생성본으로 교체 전까지 Unsplash 실사 placeholder 사용.
 */

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: "beauty" | "fashion" | "life" | "kids";
  price: number; // USD
  discountRate: number; // 0 | 10 | 20 | 30
  rating: number;
  reviewCount: number;
  image: string;
  badge?: "BEST" | "NEW" | "DEAL";
};

export const products: Product[] = [
  { slug: "glow-serum", name: "Glass Glow Vita Serum 30ml", brand: "SEOULINE", category: "beauty", price: 32, discountRate: 20, rating: 4.8, reviewCount: 1284, image: u("1620916566398-39f1143ab7be"), badge: "BEST" },
  { slug: "velvet-tint", name: "Velvet Blur Tint — 05 Fig", brand: "MUSE.K", category: "beauty", price: 14, discountRate: 0, rating: 4.6, reviewCount: 2310, image: u("1586495777744-4413f21062fa"), badge: "BEST" },
  { slug: "rice-cleanser", name: "Rice Enzyme Foam Cleanser", brand: "HANOK LAB", category: "beauty", price: 18, discountRate: 10, rating: 4.7, reviewCount: 986, image: u("1556228453-efd6c1ff04f6") },
  { slug: "cica-cream", name: "Cica Barrier Cream 50ml", brand: "SEOULINE", category: "beauty", price: 26, discountRate: 0, rating: 4.5, reviewCount: 1745, image: u("1571781926291-c477ebfd024b"), badge: "NEW" },
  { slug: "cushion-compact", name: "Airy Fit Cushion SPF50+", brand: "MUSE.K", category: "beauty", price: 28, discountRate: 30, rating: 4.4, reviewCount: 3120, image: u("1596462502278-27bfdc403348"), badge: "DEAL" },
  { slug: "hair-oil", name: "Camellia Silk Hair Oil", brand: "ONDO", category: "beauty", price: 22, discountRate: 0, rating: 4.6, reviewCount: 654, image: u("1526947425960-945c6e72858f") },
  { slug: "oversize-knit", name: "Oversized Wool Knit — Cream", brand: "DAILYSEOUL", category: "fashion", price: 68, discountRate: 20, rating: 4.7, reviewCount: 432, image: u("1576871337622-98d48d1cf531"), badge: "BEST" },
  { slug: "wide-slacks", name: "Wide Tailored Slacks — Charcoal", brand: "DAILYSEOUL", category: "fashion", price: 54, discountRate: 0, rating: 4.5, reviewCount: 389, image: u("1594633312681-425c7b97ccd1") },
  { slug: "mini-bag", name: "Croissant Mini Shoulder Bag", brand: "ATELIER 9", category: "fashion", price: 42, discountRate: 10, rating: 4.6, reviewCount: 512, image: u("1584917865442-de89df76afd3"), badge: "NEW" },
  { slug: "balloon-blouse", name: "Balloon Sleeve Blouse — Ivory", brand: "ATELIER 9", category: "fashion", price: 46, discountRate: 0, rating: 4.3, reviewCount: 274, image: u("1485968579580-b6d095142e6e") },
  { slug: "canvas-sneakers", name: "Low Canvas Sneakers — Ecru", brand: "STEßP", category: "fashion", price: 58, discountRate: 30, rating: 4.5, reviewCount: 843, image: u("1560769629-975ec94e6a86"), badge: "DEAL" },
  { slug: "trench-coat", name: "Belted Trench Coat — Sand", brand: "DAILYSEOUL", category: "fashion", price: 128, discountRate: 20, rating: 4.8, reviewCount: 198, image: u("1539109136881-3be0616acf4b") },
  { slug: "ceramic-mug", name: "Moon Jar Ceramic Mug Set", brand: "SODAM", category: "life", price: 34, discountRate: 0, rating: 4.7, reviewCount: 356, image: u("1514228742587-6b1558fcca3d") },
  { slug: "desk-lamp", name: "Halo Portable Desk Lamp", brand: "ROOM:E", category: "life", price: 49, discountRate: 10, rating: 4.4, reviewCount: 267, image: u("1507473885765-e6ed057f782c") },
  { slug: "scented-candle", name: "Seoul Rain Scented Candle", brand: "SODAM", category: "life", price: 24, discountRate: 0, rating: 4.6, reviewCount: 489, image: u("1602523961358-f9f03dd557db"), badge: "NEW" },
  { slug: "tteok-kit", name: "Honey Tteok Baking Kit", brand: "MADANG", category: "life", price: 19, discountRate: 30, rating: 4.2, reviewCount: 178, image: u("1556909114-f6e7ad7d3136"), badge: "DEAL" },
];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);
export const finalPrice = (p: Product) =>
  +(p.price * (1 - p.discountRate / 100)).toFixed(2);

export const heroSlides = [
  {
    id: "seoul-this-week",
    eyebrow: "EDITORIAL 07",
    headline: "Seoul,\nThis Week",
    sub: "성수동에서 건너온 이번 주 무드 — 크림 니트와 유리 광 피부",
    cta: "Shop the Edit",
    href: "/category/fashion",
    image: u("1515886657613-9f3515b0c78f", 1400),
  },
  {
    id: "glass-skin",
    eyebrow: "K-BEAUTY LAB",
    headline: "Glass Skin\nProtocol",
    sub: "7일 루틴으로 완성하는 유리 광 — 더마 테스트 통과 세럼 셀렉션",
    cta: "Build My Routine",
    href: "/category/beauty",
    image: u("1522335789203-aabd1fc54bc9", 1400),
  },
  {
    id: "quiet-home",
    eyebrow: "LIFE EDIT",
    headline: "Quiet\nKorean Home",
    sub: "달항아리 머그부터 서울의 비 냄새까지 — 집으로 배송되는 서울",
    cta: "Explore Life",
    href: "/category/life",
    image: u("1524758631624-e2822e304c36", 1400),
  },
];

export const categoryChips = [
  { label: "스킨케어", href: "/category/beauty", image: u("1612817288484-6f916006741a", 300) },
  { label: "메이크업", href: "/category/beauty", image: u("1487412720507-e7ab37603c6f", 300) },
  { label: "여성패션", href: "/category/fashion", image: u("1483985988355-763728e1935b", 300) },
  { label: "남성패션", href: "/category/fashion", image: u("1490578474895-699cd4e2cf59", 300) },
  { label: "가방·ACC", href: "/category/fashion", image: u("1584917865442-de89df76afd3", 300) },
  { label: "슈즈", href: "/category/fashion", image: u("1560769629-975ec94e6a86", 300) },
  { label: "홈·리빙", href: "/category/life", image: u("1513475382585-d06e58bcb0e0", 300) },
  { label: "K-푸드", href: "/category/life", image: u("1556909114-f6e7ad7d3136", 300) },
];

export const timeDealSlugs = ["cushion-compact", "canvas-sneakers", "tteok-kit"];

export const shopTheLook = {
  image: u("1529139574466-a303027c1d8b", 1200),
  title: "Look 014 — 성수동 오후 4시",
  pins: [
    { x: 38, y: 34, slug: "oversize-knit" },
    { x: 55, y: 62, slug: "wide-slacks" },
    { x: 70, y: 48, slug: "mini-bag" },
  ],
};

export const brandSpotlight = {
  name: "SEOULINE",
  tagline: "피부 장벽 과학을 서울의 감성으로",
  story:
    "성분 연구 12년, SEOULINE은 자극 없는 유효 성분 조합만을 고집합니다. 전 제품 더마 테스트 완료.",
  image: u("1631729371254-42c2892f0e6e", 1200),
  productSlugs: ["glow-serum", "cica-cream", "rice-cleanser", "hair-oil"],
};

export const ugcPosts = [
  { id: "u1", handle: "@mina.jpg", image: u("1544005313-94ddf0286df2", 500), tags: 2 },
  { id: "u2", handle: "@seoul_fit", image: u("1496747611176-843222e1e57c", 500), tags: 1 },
  { id: "u3", handle: "@glowdays", image: u("1512496015851-a90fb38ba796", 500), tags: 3 },
  { id: "u4", handle: "@haus.of.j", image: u("1524504388940-b1c1722653e1", 500), tags: 1 },
  { id: "u5", handle: "@daily_ondo", image: u("1519699047748-de8e457a634e", 500), tags: 2 },
  { id: "u6", handle: "@k.shelf", image: u("1522337660859-02fbefca4702", 500), tags: 1 },
];

/** 역직구 관세 간이 계산 테이블 (데모용) */
export const dutyTable: Record<string, { label: string; freeUnder: number; rate: number; shipping: number }> = {
  US: { label: "United States", freeUnder: 800, rate: 0.0, shipping: 7.9 },
  JP: { label: "Japan", freeUnder: 92, rate: 0.1, shipping: 5.9 },
  SG: { label: "Singapore", freeUnder: 296, rate: 0.09, shipping: 6.9 },
  GB: { label: "United Kingdom", freeUnder: 170, rate: 0.2, shipping: 9.9 },
  AU: { label: "Australia", freeUnder: 665, rate: 0.1, shipping: 8.9 },
  KR: { label: "Korea", freeUnder: 150, rate: 0.0, shipping: 0 },
  ID: { label: "Indonesia", freeUnder: 3, rate: 0.1, shipping: 8.9 },
  VN: { label: "Vietnam", freeUnder: 0, rate: 0.1, shipping: 7.9 },
  PH: { label: "Philippines", freeUnder: 200, rate: 0.12, shipping: 8.9 },
};
