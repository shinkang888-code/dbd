import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { MEDIA, SITE_URL } from "@/lib/media";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-sm">Page not found</p>
        <h1 className="mt-3 text-7xl font-bold text-primary">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-card"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">페이지를 불러오지 못했습니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            다시 시도
          </button>
          <a href="/" className="rounded-full border border-input bg-background px-5 py-2 text-sm font-medium">
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "대한학술융합학회 KSAC — 학문을 연결하고 미래 사회의 해법을 만듭니다" },
      { name: "description", content: "대한학술융합학회(KSAC)는 인문사회·과학기술·보건의료·정책·문화예술을 잇는 개방형 융합학술 공동체입니다." },
      { name: "author", content: "Korean Society for Academic Convergence" },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "대한학술융합학회 KSAC" },
      { property: "og:description", content: "학문을 연결하고, 미래 사회의 해법을 함께 만듭니다." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}${MEDIA.og}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:site_name", content: "대한학술융합학회 KSAC" },
      { property: "og:locale", content: "ko_KR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "대한학술융합학회 KSAC" },
      { name: "twitter:description", content: "학문을 연결하고, 미래 사회의 해법을 함께 만듭니다." },
      { name: "twitter:image", content: `${SITE_URL}${MEDIA.og}` },
      { name: "kakao:title", content: "대한학술융합학회 KSAC" },
      { name: "kakao:description", content: "학문을 연결하고, 미래 사회의 해법을 함께 만듭니다." },
      { name: "naver-site-verification", content: "18e43137cc9c0aea898cf19ebeeca6f36a34074f" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "대한학술융합학회 KSAC RSS",
        href: `${SITE_URL}/rss.xml`,
      },
      { rel: "icon", href: "/favicon-32.png?v=3", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png?v=3", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon.ico?v=3", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=3", sizes: "180x180" },
      { rel: "image_src", href: `${SITE_URL}${MEDIA.og}` },
      { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
