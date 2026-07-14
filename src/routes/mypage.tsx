// filepath: src/routes/mypage.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout, Section } from "@/components/site-layout";
import { useAuth } from "@/lib/auth";
import { getMyMemberProfile, upsertMyMemberProfile } from "@/lib/members-db";
import { uploadFile } from "@/lib/storage";
import { pageHead } from "@/lib/seo";
import { siteBtn } from "@/lib/site-button";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/mypage")({
  head: () =>
    pageHead({
      path: "/mypage",
      title: "마이페이지 — 대한학술융합학회 KSAC",
      robots: "noindex,nofollow",
    }),
  component: MyPage,
});

type FormState = {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  affiliation: string;
  refund_account: string;
  identity_file_url: string;
  identity_file_name: string;
};

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  email: "",
  address: "",
  affiliation: "",
  refund_account: "",
  identity_file_url: "",
  identity_file_name: "",
};

function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/login" });
  }, [authLoading, user, nav]);

  const profile = useQuery({
    queryKey: ["neon", "member-profile", user?.id],
    enabled: !!user,
    queryFn: async () => getMyMemberProfile(),
  });

  useEffect(() => {
    if (!profile.data && !user) return;
    setForm({
      full_name: profile.data?.full_name || (user?.user_metadata?.full_name as string) || "",
      phone: profile.data?.phone || "",
      email: profile.data?.email || user?.email || "",
      address: profile.data?.address || "",
      affiliation: profile.data?.affiliation || (user?.user_metadata?.affiliation as string) || "",
      refund_account: profile.data?.refund_account || "",
      identity_file_url: profile.data?.identity_file_url || "",
      identity_file_name: profile.data?.identity_file_name || "",
    });
  }, [profile.data, user]);

  function up<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function pickIdentity() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      setUploading(true);
      try {
        const res = await uploadFile("attachments", f, "identity/");
        up("identity_file_url", res.url);
        up("identity_file_name", res.name);
        toast.success("신분 증명 파일이 업로드되었습니다");
      } catch (e: any) {
        toast.error(e?.message ?? "업로드 실패");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof FormState)[] = [
      "full_name",
      "phone",
      "email",
      "address",
      "affiliation",
      "refund_account",
      "identity_file_url",
    ];
    for (const k of required) {
      if (!String(form[k] ?? "").trim()) {
        toast.error("필수 정보를 모두 입력해 주세요");
        return;
      }
    }
    setSaving(true);
    try {
      await upsertMyMemberProfile({
        data: {
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          affiliation: form.affiliation,
          refund_account: form.refund_account,
          identity_file_url: form.identity_file_url,
          identity_file_name: form.identity_file_name,
        },
      });
      toast.success("회원 정보가 저장되었습니다");
      qc.invalidateQueries({ queryKey: ["neon", "member-profile"] });
      nav({ to: "/" });
    } catch (err: any) {
      toast.error(err?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <SiteLayout>
        <div className="py-24 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </div>
      </SiteLayout>
    );
  }

  const incomplete = !profile.data?.profile_complete;

  return (
    <SiteLayout>
      <Section className="max-w-2xl">
        <p className="eyebrow text-sm">My Page</p>
        <h1 className="mt-2 text-3xl font-bold text-navy">마이페이지</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          아래 항목은 모두 필수입니다. 회원가입·구글 로그인 후 반드시 등록해 주세요.
        </p>
        {incomplete && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            회원 필수 정보가 미완성입니다. 저장 후 서비스를 이용할 수 있습니다.
          </div>
        )}
        {profile.data?.profile_complete && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" /> 필수 정보 등록 완료
          </div>
        )}

        <form onSubmit={save} className="mt-8 space-y-4 rounded-2xl border border-border bg-white p-6 shadow-card">
          {(
            [
              ["full_name", "이름", "홍길동"],
              ["phone", "전화번호", "010-0000-0000"],
              ["email", "이메일주소", "member@example.com"],
              ["address", "주소", "서울특별시 …"],
              ["affiliation", "소속기관", "○○대학교 / ○○연구소"],
              ["refund_account", "환불받을 계좌", "은행명 000-0000-000000 예금주"],
            ] as const
          ).map(([key, label, ph]) => (
            <label key={key} className="block">
              <span className="text-sm font-semibold text-foreground">
                {label} <span className="text-destructive">*</span>
              </span>
              <input
                required
                value={form[key]}
                onChange={(e) => up(key, e.target.value)}
                placeholder={ph}
                className="mt-1.5 w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          ))}

          <div>
            <span className="text-sm font-semibold text-foreground">
              첨부파일 (신분 증명 자료) <span className="text-destructive">*</span>
            </span>
            <p className="mt-1 text-xs text-muted-foreground">학생증·재직증명·명함 등 이미지 또는 PDF</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={pickIdentity}
                disabled={uploading}
                className={siteBtn("secondary", "sm")}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                파일 업로드
              </button>
              {form.identity_file_url ? (
                <a
                  href={form.identity_file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  {form.identity_file_name || "첨부파일 보기"}
                </a>
              ) : (
                <span className="text-xs text-destructive">업로드 필요</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="submit" disabled={saving} className={siteBtn("primary", "md")}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              필수 정보 저장
            </button>
          </div>
        </form>
      </Section>
    </SiteLayout>
  );
}
