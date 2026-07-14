import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { DEMO_ADMIN, signInDemoAdmin } from "@/lib/demo";
import { isPrivilegedAdminEmail } from "@/lib/admin-emails";
import { toast } from "sonner";
import { Shield, LayoutDashboard, LogOut } from "lucide-react";
import { siteBtn } from "@/lib/site-button";
import { MEDIA } from "@/lib/media";
import { useQueryClient } from "@tanstack/react-query";
import { pageHead } from "@/lib/seo";
import { afterMemberLogin } from "@/lib/member-profile-gate";

export const Route = createFileRoute("/login")({
  head: () =>
    pageHead({
      path: "/login",
      title: "로그인 — 대한학술융합학회 KSAC",
      robots: "noindex,nofollow",
    }),
  component: LoginPage,
});

async function resolveIsAdmin(userId: string, email?: string | null) {
  if (isPrivilegedAdminEmail(email)) return true;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

function LoginPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function goAfterLogin(userId: string, userEmail?: string | null) {
    await qc.invalidateQueries({ queryKey: ["is-admin"] });
    const admin = await resolveIsAdmin(userId, userEmail);
    await afterMemberLogin({
      isAdmin: admin,
      navigate: (o) => nav(o as any),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("로그인되었습니다");
      const u = data.user ?? data.session?.user;
      if (u) await goAfterLogin(u.id, u.email);
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) toast.error(error.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function demoLogin() {
    setDemoLoading(true);
    try {
      await signInDemoAdmin();
      toast.success("데모 관리자로 로그인했습니다");
      const u = (await supabase.auth.getUser()).data.user;
      if (u) await goAfterLogin(u.id, u.email);
      else nav({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "데모 로그인에 실패했습니다", { duration: 8000 });
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="min-h-[70vh] grid place-items-center py-16 px-6 bg-gradient-to-b from-secondary to-background">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-4">
            <img
              src={MEDIA.logo}
              alt="KSAC"
              className="mx-auto h-14 w-14 rounded-2xl object-cover border border-border shadow-card bg-white"
            />
            <p className="eyebrow text-sm mt-4">Member Login</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">로그인</h1>
            <p className="mt-2 text-sm text-muted-foreground">대한학술융합학회 회원 로그인</p>
          </div>

          {user && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-card text-sm">
              <p className="text-muted-foreground">
                현재 <span className="font-semibold text-foreground">{user.email}</span> 로 로그인되어 있습니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={siteBtn("primary", "sm")}
                  onClick={async () => goAfterLogin(user.id, user.email)}
                >
                  계속하기
                </button>
                <button
                  type="button"
                  className={siteBtn("secondary", "sm")}
                  onClick={async () => {
                    await signOut();
                    toast.success("로그아웃되었습니다");
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃 후 다시 로그인
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-primary/25 bg-secondary/60 p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-navy text-white grid place-items-center shrink-0">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-foreground">관리자 콘솔 데모</h2>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  메인 배너(이미지·글자), 공지/자료실/갤러리 게시물을 바로 관리해 볼 수 있습니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={demoLoading}
              onClick={demoLogin}
              className={siteBtn("primary", "lg", "w-full mt-4")}
            >
              <Shield className="h-4 w-4" />
              {demoLoading ? "데모 입장 중..." : "데모 관리자로 입장"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground leading-relaxed">
              {DEMO_ADMIN.email} / {DEMO_ADMIN.password}
            </p>
          </div>

          <form onSubmit={submit} className="rounded-xl bg-card border border-border shadow-card p-8 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">회원 로그인</p>
            <button
              type="button"
              disabled={googleLoading}
              onClick={googleLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? "Google 연결 중…" : "Google로 로그인"}
            </button>
            <div className="relative py-1 text-center text-[11px] text-muted-foreground">
              <span className="bg-card px-2 relative z-[1]">또는 이메일</span>
              <div className="absolute inset-x-0 top-1/2 border-t border-border" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">이메일 (아이디)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">비밀번호</label>
              <input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            <button disabled={loading} className={siteBtn("primary", "lg", "w-full")}>
              {loading ? "로그인 중..." : "로그인"}
            </button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              아직 회원이 아니신가요?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
