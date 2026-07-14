import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { siteBtn } from "@/lib/site-button";
import { pageHead } from "@/lib/seo";
import { PageBody } from "@/components/cms/page-body";

export const Route = createFileRoute("/members")({
  head: () =>
    pageHead({
      path: "/members",
      title: "회원마당 — 대한학술융합학회 KSAC",
      description: "회원가입 안내",
    }),
  component: MembersPage,
});

function MembersPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Membership"
        title="회원마당"
        subtitle="학문과 산업, 연구와 현장을 연결하는 개방형 학술공동체"
        image={MEDIA.networking}
      />

      <PageBody slug="members" className="mx-auto max-w-5xl px-6 py-12">
      <Section id="info">
        <div className="text-center mb-12 reveal">
          <p className="eyebrow text-sm">Join Us</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">회원가입 안내</h2>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            대한학술융합학회는 학문과 산업, 연구와 현장을 연결하는 개방형 학술공동체입니다.
          </p>
        </div>

        <h3 className="text-xl font-bold text-navy mb-6">회원 혜택</h3>
        <div className="grid gap-5 sm:grid-cols-2 mb-16">
          {[
            {
              n: "01",
              t: "학술대회 및 세미나 참여",
              d: "정기 학술대회, 세미나, 워크숍 우선 참여",
              img: MEDIA.ceremony,
            },
            {
              n: "02",
              t: "논문투고 및 학술지 정보",
              d: "논문투고 및 학술지 발간 정보 제공",
              img: MEDIA.journal,
            },
            {
              n: "03",
              t: "연구 네트워크 확대",
              d: "국내외 융합연구 전문가와 교류",
              img: MEDIA.panel,
            },
            {
              n: "04",
              t: "학회 소식 및 공지",
              d: "학회 활동 및 공지사항 우선 수신",
              img: MEDIA.about,
            },
          ].map((b, i) => (
            <div
              key={b.t}
              className={`group overflow-hidden rounded-xl border border-border bg-white shadow-card reveal reveal-delay-${(i % 2) + 1}`}
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={b.img}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-navy/35" />
                <span className="absolute left-4 top-4 text-[11px] font-semibold tracking-[0.14em] text-white/90">
                  {b.n}
                </span>
              </div>
              <div className="p-5 md:p-6">
                <h4 className="font-bold text-foreground">{b.t}</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-navy mb-6">가입 대상</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-16">
          {[
            "융합연구에 관심 있는 국내외 연구자 및 교수진",
            "관련 분야 대학원생 및 학부생",
            "산업계 실무자 및 정책 관계자",
            "학문 융합 및 사회 기여에 뜻이 있는 일반 참여자",
          ].map((t) => (
            <div key={t} className="flex items-start gap-3 rounded-xl border border-border bg-white px-5 py-4">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-navy font-medium">{t}</span>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-navy mb-6">가입 절차</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {["신청서 작성", "회원정보 제출", "회비 납부/승인", "가입 완료"].map((t, i) => (
            <div key={t} className="rounded-xl bg-white border border-border p-6 shadow-card text-center relative">
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
                STEP 0{i + 1}
              </div>
              <div className="mt-2 font-bold text-foreground">{t}</div>
              {i < 3 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/register" className={siteBtn("primary", "lg")}>
            지금 회원가입
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
      </PageBody>
    </SiteLayout>
  );
}
