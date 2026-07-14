import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { MEDIA, SUBMISSION_PORTAL_URL } from "@/lib/media";
import { siteBtn } from "@/lib/site-button";
import { pageHead } from "@/lib/seo";
import { PageBody } from "@/components/cms/page-body";

export const Route = createFileRoute("/submission")({
  head: () =>
    pageHead({
      path: "/submission",
      title: "논문투고 — 대한학술융합학회 KSAC",
      description: "논문 투고 안내, 투고규정, 심사규정, 윤리규정",
    }),
  component: SubmissionPage,
});

function SubmissionPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Submission"
        title="논문투고"
        subtitle="융합학문 분야의 우수한 연구성과를 폭넓게 수렴합니다"
        image={MEDIA.journal}
      />

      <PageBody slug="submission" className="mx-auto max-w-5xl px-6 py-12">
      <Section id="guide">
        <div className="text-center mb-14 reveal">
          <p className="eyebrow text-sm">Submission Guide</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">투고안내</h2>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            대한학술융합학회는 융합학문 분야의 우수한 연구성과를 폭넓게 수렴하고자 합니다.
          </p>
          <a
            href={SUBMISSION_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={siteBtn("primary", "lg", "mt-8")}
          >
            논문투고 시스템 로그인
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="mt-3 text-xs text-muted-foreground">출판사 투고시스템으로 새 탭에서 열립니다</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {[
            {
              n: "01",
              t: "투고 대상",
              d: "융합학문 분야의 연구논문·리뷰논문·사례연구·정책실무논문 등 학문 간 융합적 가치를 지닌 원고",
            },
            {
              n: "02",
              t: "작성 기준",
              d: "학회 지정 투고용 템플릿에 따라 작성하며, 미발표 원고를 원칙으로 합니다.",
            },
            {
              n: "03",
              t: "연구윤리",
              d: "표절검사보고서·연구윤리서약서·저작권 동의서 등 관련 서류 필수 제출",
            },
          ].map((c, i) => (
            <div
              key={c.n}
              className={`rounded-xl border border-border bg-white p-7 shadow-card reveal reveal-delay-${i + 1}`}
            >
              <div className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">{c.n}</div>
              <h3 className="mt-3 font-bold text-navy text-lg">{c.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-navy p-8 md:p-10 text-white reveal">
          <h3 className="text-xl md:text-2xl font-bold mb-8 text-center">투고 프로세스</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["원고 작성", "서류 준비", "논문 제출", "심사 진행", "수정·게재"].map((t, i) => (
              <div key={t} className="text-center">
                <div className="mx-auto h-10 w-10 rounded-full border border-white/35 grid place-items-center text-sm font-semibold">
                  {i + 1}
                </div>
                <div className="mt-3 text-[11px] tracking-[0.12em] text-white/65">STEP {i + 1}</div>
                <div className="mt-1 font-semibold text-sm md:text-base">{t}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-white p-8 shadow-card reveal">
          <h4 className="font-bold text-navy mb-5">필수 제출 자료</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "논문 원고 파일",
              "투고자 정보 파일",
              "연구윤리서약서",
              "저작권 관련 동의서",
              "KCI 표절검사보고서",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-navy font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="rules" className="bg-secondary/30 !max-w-none">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10 reveal">
            <p className="eyebrow text-sm">Submission Rules</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">투고규정</h2>
          </div>
          <div className="max-w-3xl mx-auto rounded-xl bg-white border border-border p-8 shadow-card space-y-4 reveal">
            {[
              "투고 원고는 반드시 학회 투고용 템플릿에 따라 작성해야 합니다.",
              "다른 학술지에 게재되지 않은 미발표 원고만 접수합니다.",
              "참고문헌은 본문에서 인용한 문헌만 기재합니다.",
              "표와 그림의 제목·번호·출처를 명확히 표기해야 합니다.",
              "국문 및 영문 초록·키워드를 필수로 포함합니다.",
              "저작권은 원저자에게 귀속되며 학술지 게재권은 학회에 귀속됩니다.",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-navy leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="review">
        <div className="text-center mb-10 reveal">
          <p className="eyebrow text-sm">Review Process</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">심사규정</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              l: "01",
              t: "형식심사",
              d: "제출 원고가 투고규정 및 형식 요건을 충족하는지 검토합니다.",
            },
            {
              l: "02",
              t: "본심사",
              d: "전문 심사위원 2인 이상이 학술적 가치·독창성·완성도를 평가합니다.",
            },
            {
              l: "03",
              t: "판정",
              d: "게재가·수정 후 게재·재심사·게재불가 중 하나로 판정합니다.",
            },
          ].map((c, i) => (
            <div
              key={c.l}
              className={`rounded-xl border border-border bg-white p-8 shadow-card hover:shadow-elevated transition reveal reveal-delay-${i + 1}`}
            >
              <div className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">{c.l}</div>
              <h3 className="mt-3 text-lg font-bold text-navy">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="ethics" className="bg-secondary/30 !max-w-none">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10 reveal">
            <p className="eyebrow text-sm">Research Ethics</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">윤리규정</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="rounded-xl bg-white border border-border p-8 shadow-card reveal">
              <h4 className="font-bold text-navy mb-4">작성 및 심사 유의사항</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "타인의 저작물 인용 시 정확한 출처 표기",
                  "중복 게재 및 자기표절 금지",
                  "저자 표시는 실질적 기여자에 한함",
                  "심사위원은 원고 내용의 비밀 유지",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white border border-border p-8 shadow-card reveal reveal-delay-1">
              <h4 className="font-bold text-navy mb-4">해당 시 제출 자료</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "이해상충 공개서 (Conflict of Interest)",
                  "IRB 승인서 (생명윤리위원회)",
                  "연구비 지원 명시 자료",
                  "공동저자 동의서",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0 opacity-25">
          <img src={MEDIA.panel} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center text-white">
          <p className="eyebrow-gold text-sm">Call for Papers</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-snug">
            AI 융합 연구와 함께
            <br />
            당신의 가치를 새로이 확장하십시오
          </h2>
          <div className="mt-5 text-sm text-white/70">— 대한학술융합학회 편집위원회</div>
          <a
            href={SUBMISSION_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={siteBtn("solidLight", "lg", "mt-8")}
          >
            논문투고 시스템 바로가기
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
      </PageBody>
    </SiteLayout>
  );
}
