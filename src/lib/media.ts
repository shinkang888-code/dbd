/** Local premium academic media assets under /public/media */
export const MEDIA = {
  logo: "/media/ksac-logo.png",
  /** Main hero: Korean conference photography (HTML text overlays on top) */
  hero: "/media/hero-conference.jpg",
  heroConference: "/media/hero-conference.jpg",
  heroBannerText: "/media/hero-banner.jpg",
  og: "/og.jpg?v=4",
  about: "/media/about-conference.jpg",
  panel: "/media/conference-panel.jpg",
  ceremony: "/media/conference-ceremony.jpg",
  networking: "/media/conference-networking.jpg",
  journal: "/media/page-journal.jpg",
  news: "/media/page-news.jpg",
  galleryFallback: [
    "/media/about-conference.jpg",
    "/media/conference-panel.jpg",
    "/media/conference-ceremony.jpg",
    "/media/conference-networking.jpg",
  ],
} as const;

/** Absolute site origin for Open Graph / Kakao share previews */
export const SITE_URL = "https://ksacs.vercel.app";

/** Publisher manuscript submission portal (opens in a new tab) */
export const SUBMISSION_PORTAL_URL = "https://ksac.smop.hakjisa.site/admin/login.php";

/** LoBook Studio — 전자책/학술지 조판·내보내기 엔진 (lobooks 연동) */
export const JOURNAL_STUDIO_URL = "https://lobooks.vercel.app/lobook-studio";

/** LoBook Admin — 출판 운영 콘솔 참고용 */
export const JOURNAL_PUBLISH_ADMIN_REF_URL = "https://lobooks.vercel.app/lobook-admin.html";

/** Localbooks 동네책방 포털 */
export const LOBOOKS_URL = "https://lobooks.vercel.app/";

/** Localbooks 파트너 홍보 배너 (푸터 직전) */
export const LOBOOKS_PROMO_IMAGE = "/media/localbooks-promo.png";

/** Member signup page */
export const REGISTER_URL = "/register";

/** Member login page */
export const LOGIN_URL = "/login";
