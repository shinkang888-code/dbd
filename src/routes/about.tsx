import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Section } from "@/components/site-layout";
import { MapPin, Phone, Mail, Train, Quote } from "lucide-react";
import { MEDIA } from "@/lib/media";
import { pageHead } from "@/lib/seo";
import { PageBody } from "@/components/cms/page-body";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      path: "/about",
      title: "학회소개 — 대한학술융합학회 KSAC",
      description: "대한학술융합학회의 인사말, 연혁, 임원구성, 정관, 오시는 길 안내",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About KSAC"
        title="학회소개"
        subtitle="학문을 연결하고, 지식을 확장하며, 미래 사회의 해법을 함께 만들어가는 개방형 학술공동체"
        image={MEDIA.hero}
      />

      <PageBody slug="about" className="mx-auto max-w-5xl px-6 py-12">
      {/* 인사말 */}
      <Section id="greeting">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-14 items-start">
          <div className="reveal">
            <p className="eyebrow text-sm">Greetings</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground leading-tight">인사말</h2>
            <div className="mt-8 rounded-xl overflow-hidden border border-border shadow-card">
              <img src={MEDIA.panel} alt="학회 이사회·패널 회의" className="w-full aspect-[16/10] object-cover" />
            </div>
            <div className="relative mt-6 pl-8 border-l-4 border-primary">
              <Quote className="absolute -left-4 top-0 h-8 w-8 text-primary bg-background" />
              <p className="text-xl md:text-2xl font-bold text-foreground leading-snug">
                학문을 연결하고, 지식을 확장하며, 미래 사회의 해법을 함께 만들어가는 대한학술융합학회에 오신 것을 진심으로 환영합니다.
              </p>
            </div>
          </div>
          <div className="reveal reveal-delay-1">
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>대한학술융합학회 홈페이지를 방문해 주신 여러분께 진심으로 감사드립니다. 오늘날 우리는 인공지능과 디지털 기술의 급속한 발전 속에서 학문, 산업, 사회 전반의 구조가 빠르게 재편되는 시대를 살아가고 있습니다.</p>
              <p>특히 AI 기술의 확산은 언어와 학문의 전통적 경계를 허물고 있으며, 기존의 단일 학문 체계만으로는 해결하기 어려운 복합적 사회문제와 새로운 연구영역을 끊임없이 만들어 내고 있습니다.</p>
              <p>이러한 변화 속에서 학문 간 협력과 융합 연구는 더 이상 선택이 아닌, 미래 사회 발전을 위한 필수 과제가 되었습니다.</p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { n: "01", t: "설립의 취지", d: "다양한 학문 분야의 연구자와 전문가, 산업 현장의 실무자가 함께 참여하여 새로운 융합 학술영역을 개척하고, 연구성과가 실제 사회 발전과 산업 혁신으로 이어질 수 있는 학술공동체를 구축하기 위해 설립되었습니다." },
                { n: "02", t: "학회의 지향점", d: "특정 전공이나 분야에 국한되지 않는 개방형 학술 플랫폼을 지향합니다. 국내외 연구자들이 자유롭게 교류하고 협력하며 학문과 산업, 기술과 정책, 연구와 현장을 연결하는 실질적 융합 연구 생태계를 형성합니다." },
                { n: "03", t: "앞으로의 방향", d: "학술지 발간, 학술대회 및 세미나 개최, 연구교류 활성화, 정책 및 산업 협력 확대를 통해 학문 발전과 사회 기여라는 두 가지 목표를 균형 있게 실현해 나가겠습니다." },
              ].map((c) => (
                <div key={c.n} className="rounded-2xl border border-border bg-white p-6 shadow-card">
                  <div className="font-display italic text-3xl text-brand-gradient">{c.n}</div>
                  <h3 className="mt-3 font-bold text-navy">{c.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
                </div>
              ))}
            </div>

            <blockquote className="mt-10 rounded-xl bg-navy p-8 text-white">
              <p className="text-lg font-semibold leading-relaxed">"대한학술융합학회는 학문과 사회를 연결하는 새로운 길을 열고, 미래 사회를 준비하는 지식공동체로 성장해 나가겠습니다."</p>
              <div className="mt-4 text-sm text-gold-light">— 대한학술융합학회 사무국 · 학회장 강준철</div>
            </blockquote>
          </div>
        </div>
      </Section>

      {/* 연혁 */}
      <Section id="history" className="bg-gradient-to-b from-white to-accent/30 !max-w-none">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14 reveal">
            <p className="eyebrow text-sm">History</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">연혁</h2>
            <p className="mt-4 text-muted-foreground">학회 설립과 성장의 발자취</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-navy/20 hidden md:block" />
            {[
              { d: "2026.01", t: "창립 준비", c: "대한학술융합학회 창립 준비위원회를 구성하고, 학회의 설립 방향, 운영 체계, 조직 구성 및 향후 사업 계획에 대한 기초 논의를 시작하였습니다." },
              { d: "2026.02", t: "공식 출범", c: "창립총회를 개최하여 학회의 정관, 임원 구성 및 운영의 기본 틀을 확정하였으며, 학회의 공식적 활동을 위한 고유단체 등록을 완료하였습니다." },
              { d: "2026.05", t: "학술 기반 구축", c: "학회의 공식 학술지를 창간하고, 학회 홈페이지와 논문 투고 시스템을 개시함으로써 연구성과의 축적, 공유 및 학술교류를 위한 기반을 마련하였습니다." },
            ].map((h, i) => (
              <div key={h.d} className={`md:grid md:grid-cols-2 md:gap-12 mb-12 relative reveal reveal-delay-${i + 1}`}>
                <div className={i % 2 === 0 ? "md:text-right md:pr-12" : "md:col-start-2 md:pl-12"}>
                  <div className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-1.5 text-xs font-bold text-navy font-display italic">{h.d}</div>
                  <h3 className="mt-3 text-2xl font-bold text-navy">{h.t}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{h.c}</p>
                </div>
                <div className="absolute left-1/2 top-2 -translate-x-1/2 h-4 w-4 rounded-full bg-navy ring-4 ring-background hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 임원구성 */}
      <Section id="board">
        <div className="text-center mb-14 reveal">
          <p className="eyebrow text-sm">Executive Board</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">임원구성</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-navy p-8 md:p-10 text-white text-center shadow-elevated reveal">
            <div className="eyebrow-gold text-sm">President</div>
            <div className="mt-2 text-2xl md:text-3xl font-bold">학회장 · 강준철</div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-card reveal reveal-delay-1">
              <div className="eyebrow text-xs">Vice President</div>
              <div className="mt-2 text-lg font-bold text-navy">부학회장</div>
              <div className="mt-1 text-muted-foreground">정기훈 교수</div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-card reveal reveal-delay-2">
              <div className="eyebrow text-xs">Auditor</div>
              <div className="mt-2 text-lg font-bold text-navy">감사</div>
              <div className="mt-1 text-muted-foreground">정혜림 교수</div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-accent/40 p-8 reveal reveal-delay-3">
            <div className="eyebrow text-xs text-center">Editorial Board</div>
            <div className="mt-2 text-lg font-bold text-navy text-center">편집위원회</div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white p-4 shadow-card">
                <div className="text-xs text-muted-foreground">수석 편집위원</div>
                <div className="mt-1 font-semibold text-navy">이지현</div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-card">
                <div className="text-xs text-muted-foreground">편집위원</div>
                <div className="mt-1 font-semibold text-navy">강소라 · 강효원 · 곽태근</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 정관 */}
      <Section id="bylaws" className="bg-gradient-to-b from-accent/20 to-white !max-w-none">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14 reveal">
            <p className="eyebrow text-sm">Bylaws</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">정관</h2>
            <p className="mt-4 text-muted-foreground">학회 운영의 근간이 되는 정관의 주요 구성</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "제1장", t: "총칙" },
              { n: "제2장", t: "회원" },
              { n: "제3장", t: "임원 및 기구" },
              { n: "제4장", t: "재정 및 회계" },
            ].map((c, i) => (
              <div key={c.n} className={`rounded-xl border border-border bg-white p-7 shadow-card hover:shadow-elevated transition reveal reveal-delay-${i + 1}`}>
                <div className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">{c.n}</div>
                <div className="mt-2 font-bold text-navy text-lg">{c.t}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center text-sm text-muted-foreground">정관 전문 및 문의: <a href="mailto:shinkang88@daum.net" className="text-indigo font-semibold hover:underline">shinkang88@daum.net</a></div>
        </div>
      </Section>

      {/* 오시는 길 */}
      <Section id="location">
        <div className="text-center mb-14 reveal">
          <p className="eyebrow text-sm">Directions</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">오시는 길</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden shadow-elevated aspect-[4/3] bg-accent reveal">
            <iframe
              title="학회 위치"
              className="w-full h-full"
              src="https://www.google.com/maps?q=서울특별시+서초구+서초중앙로22길+47&output=embed"
              loading="lazy"
            />
          </div>
          <div className="reveal reveal-delay-1">
            <div className="rounded-2xl border border-border bg-white p-7 shadow-card space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-secondary grid place-items-center text-primary"><MapPin className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs eyebrow">Address</div>
                  <div className="mt-1 font-semibold text-navy">서울특별시 서초구 서초중앙로22길 47</div>
                  <div className="text-sm text-muted-foreground">인스161호 (서초동, 문화빌딩)</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-secondary grid place-items-center text-primary"><Phone className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs eyebrow">Tel</div>
                  <div className="mt-1 font-semibold text-navy">010-8482-8545</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-secondary grid place-items-center text-primary"><Mail className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs eyebrow">Email</div>
                  <a href="mailto:shinkang88@daum.net" className="mt-1 font-semibold text-navy hover:text-primary block">shinkang88@daum.net</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-secondary grid place-items-center text-primary"><Train className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs eyebrow">Subway</div>
                  <div className="mt-1 font-semibold text-navy">지하철 2·3호선 교대역</div>
                  <div className="text-sm text-muted-foreground">2·4·5·7·13번 출구 · 2호선 서초역 인근</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
      </PageBody>
    </SiteLayout>
  );
}
