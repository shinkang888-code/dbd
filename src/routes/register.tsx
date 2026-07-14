import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { siteBtn } from "@/lib/site-button";
import { MEDIA } from "@/lib/media";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/register")({
  head: () =>
    pageHead({
      path: "/register",
      title: "회원가입 — 대한학술융합학회 KSAC",
      description: "대한학술융합학회 회원가입 신청",
    }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const { user, signOut } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", password: "", affiliation: "", memberType: "정회원", agree: false,
  });
  const [loading, setLoading] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agree) { toast.error("약관에 동의해주세요"); return; }
    if (form.password.length < 8) { toast.error("비밀번호는 8자 이상이어야 합니다"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: form.name,
          affiliation: form.affiliation,
          member_type: form.memberType,
        },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("회원가입이 완료되었습니다. 필수 정보를 등록해 주세요.");
    nav({ to: "/mypage" });
  }

  return (
    <SiteLayout>
      <section className="min-h-[70vh] py-16 px-6 bg-secondary/30">
        <div className="w-full max-w-xl mx-auto">
          <div className="text-center mb-8">
            <img
              src={MEDIA.logo}
              alt="KSAC"
              className="mx-auto h-14 w-14 rounded-2xl object-cover border border-border shadow-card bg-white"
            />
            <p className="eyebrow text-sm mt-4">Join KSAC</p>
            <h1 className="mt-2 text-3xl font-bold text-navy">회원가입</h1>
            <p className="mt-2 text-sm text-muted-foreground">개방형 융합학술 공동체의 일원이 되어보세요</p>
          </div>

          {user && (
            <div className="mb-6 rounded-xl border border-border bg-white p-4 shadow-card text-sm">
              <p className="text-muted-foreground">
                이미 <span className="font-semibold text-foreground">{user.email}</span> 로 로그인되어 있습니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/" className={siteBtn("primary", "sm")}>
                  홈으로
                </Link>
                <button
                  type="button"
                  className={siteBtn("secondary", "sm")}
                  onClick={async () => {
                    await signOut();
                    toast.success("로그아웃되었습니다");
                  }}
                >
                  로그아웃 후 가입
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 space-y-3">
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold shadow-card hover:bg-secondary"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
                if (error) toast.error(error.message);
              }}
            >
              Google로 가입 · 로그인
            </button>
            <p className="text-center text-xs text-muted-foreground">구글 로그인 후 마이페이지에서 필수 정보를 등록합니다.</p>
          </div>

          <form onSubmit={submit} className="rounded-xl bg-white border border-border shadow-elevated p-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="이름" required>
                <input required value={form.name} onChange={(e) => up("name", e.target.value)} className={INPUT} />
              </Field>
              <Field label="회원구분" required>
                <select value={form.memberType} onChange={(e) => up("memberType", e.target.value)} className={INPUT}>
                  <option>정회원</option>
                  <option>학생회원</option>
                  <option>기관회원</option>
                </select>
              </Field>
            </div>
            <Field label="이메일 (아이디)" required>
              <input type="email" required value={form.email} onChange={(e) => up("email", e.target.value)} className={INPUT} />
            </Field>
            <Field label="비밀번호 (8자 이상)" required>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => up("password", e.target.value)} className={INPUT} />
            </Field>
            <Field label="소속">
              <input value={form.affiliation} onChange={(e) => up("affiliation", e.target.value)} placeholder="예: OO대학교 / OO연구소" className={INPUT} />
            </Field>

            <label className="flex items-start gap-3 rounded-xl bg-accent/40 p-4 cursor-pointer">
              <input type="checkbox" checked={form.agree} onChange={(e) => up("agree", e.target.checked)} className="mt-1 h-4 w-4 accent-indigo" />
              <span className="text-sm text-navy">
                <span className="font-semibold">개인정보 수집·이용 및 학회 이용약관</span>에 동의합니다.
                <span className="block text-xs text-muted-foreground mt-1">회원 관리, 학술 정보 제공 및 학회 활동 안내 목적으로 사용됩니다.</span>
              </span>
            </label>

            <button disabled={loading} className={siteBtn("primary", "lg", "w-full")}>
              {loading ? "가입 처리 중..." : "회원가입 완료"}
            </button>
            <div className="text-center text-sm text-muted-foreground pt-2">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="text-indigo font-semibold hover:underline">로그인</Link>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

const INPUT = "w-full rounded-xl border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo bg-white";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy">{label}{required && <span className="text-destructive"> *</span>}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
