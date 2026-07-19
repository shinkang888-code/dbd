import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";
import { authConfigured } from "@/lib/auth/server";
import { LexiMark } from "@/components/lexi-mark";
import { DemoLoginButton } from "@/components/demo-login-button";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

function resolveNext(raw: string | string[] | undefined) {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !v.startsWith("/") || v.startsWith("//")) return "/studio";
  return v;
}

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { path } = await params;
  const sp = await searchParams;
  const next = resolveNext(sp.next);
  const googleReady = Boolean(process.env.GOOGLE_CLIENT_ID);
  const isSignIn = path === "sign-in";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center gap-2">
        <LexiMark size={52} className="text-dim" />
        <p className="font-display text-[28px] font-semibold tracking-tight">
          LEXI<span className="text-coral">.</span>
        </p>
      </div>

      {isSignIn && (
        <div className="mb-6 w-full max-w-sm rounded-2xl border border-line bg-paper p-6 shadow-sm">
          <p className="text-center text-[15px] font-semibold text-ink">계정 없이 바로 시작</p>
          <p className="mt-1 text-center text-[12px] text-dim">
            데모 로그인 후 {next.startsWith("/studio") ? "LEXI Studio" : "Admin"}으로 이동합니다
          </p>
          <DemoLoginButton
            next={next}
            className="mt-5 flex w-full items-center justify-center rounded-xl bg-coral px-4 py-3.5 text-[15px] font-bold text-white hover:opacity-90"
          />
        </div>
      )}

      {authConfigured ? (
        <div className="w-full max-w-sm opacity-90">
          <p className="mb-2 text-center text-[11px] text-dim">또는 계정 로그인</p>
          <AuthView path={path} />
        </div>
      ) : (
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6">
          <h1 className="text-[16px] font-bold text-dim">계정 로그인 (선택)</h1>
          {googleReady ? (
            <a
              href={`/api/auth/google?next=${encodeURIComponent(next)}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-[14px] font-semibold transition-colors hover:bg-fog"
            >
              Google로 로그인
            </a>
          ) : (
            <p className="mt-3 text-[12px] text-dim">
              Google 미설정 — 위 데모 로그인으로 Studio/Admin을 이용하세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
