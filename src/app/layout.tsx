import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "LEXI — Curated K-Style, Delivered Worldwide", template: "%s | LEXI" },
  description:
    "큐레이션된 K-뷰티·패션·라이프스타일을 전 세계로. 관세 걱정 없는 서울 직배송, LEXI.",
  openGraph: { siteName: "LEXI", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh pb-16 md:pb-0">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <BottomTabBar />
      </body>
    </html>
  );
}
