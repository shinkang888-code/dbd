// filepath: src/app/auth/[path]/page.tsx
import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";
import { authConfigured } from "@/lib/auth/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  const googleReady = Boolean(process.env.GOOGLE_CLIENT_ID);
  const demoReady = process.env.DEMO_LOGIN === "1";
  const isSignIn = path === "sign-in";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-10">
      <p className="mb-6 font-display text-[28px] font-semibold tracking-tight">
        LEXI<span className="text-coral">.</span>
      </p>

      {/* Neon Auth 활성화 전에는 자체 Google OAuth + 데모 로그인 패널 */}
      {authConfigured ? (
        <AuthView path={path} />
      ) : (
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6">
          <h1 className="text-[20px] font-bold">Sign In</h1>
          <p className="mt-1 text-[13px] text-dim">계정으로 로그인하고 관리자 콘솔에 접속하세요</p>
          {googleReady ? (
            <a
              href="/api/auth/google"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-[14px] font-semibold transition-colors hover:bg-fog"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
              Google로 로그인
            </a>
          ) : (
            <p className="mt-5 rounded-lg bg-fog p-3 text-[12px] text-dim">
              GOOGLE_CLIENT_ID 미설정 — Google 로그인을 사용하려면 환경변수를 등록하세요.
            </p>
          )}
        </div>
      )}

      {demoReady && isSignIn && (
        <form method="post" action="/api/auth/demo" className="mt-5 w-full max-w-sm">
          <button
            type="submit"
            className="w-full rounded-xl border border-line bg-fog px-4 py-3 text-[14px] font-semibold transition-colors hover:bg-ink hover:text-white"
          >
            🔓 데모 로그인 — 관리자 콘솔 체험
          </button>
          <p className="mt-2 text-center text-[11px] text-dim">
            로그인 없이 둘러보기 · 24시간 세션
          </p>
        </form>
      )}
    </div>
  );
}
