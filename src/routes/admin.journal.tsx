// filepath: src/routes/admin.journal.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  ExternalLink,
  FileOutput,
  Layers,
  PencilLine,
  Workflow,
  ArrowRight,
} from "lucide-react";
import { JOURNAL_STUDIO_URL, JOURNAL_PUBLISH_ADMIN_REF_URL, SUBMISSION_PORTAL_URL } from "@/lib/media";
import { siteBtn } from "@/lib/site-button";

export const Route = createFileRoute("/admin/journal")({
  component: JournalPublishHub,
});

const PIPELINE = [
  { step: "01", title: "투고 접수", desc: "학지사 SMOP / 내부 접수", href: SUBMISSION_PORTAL_URL, external: true },
  { step: "02", title: "심사·채택", desc: "게재 확정 원고만 조판 대기열로", href: null },
  { step: "03", title: "조판·편집", desc: "LoBook Studio로 권호/논문 편집", href: JOURNAL_STUDIO_URL, external: true },
  { step: "04", title: "교정·검수", desc: "PDF·웹북 최종본 확인", href: null },
  { step: "05", title: "발행·수록", desc: "학회 사이트 권호 공개 + 자료실 연동", href: "/journal", external: false },
];

const LOBOOK_MAP = [
  { from: "도서 / 챕터", to: "권호(Vol·No) / 논문(Article)" },
  { from: "e-ISBN", to: "ISSN · 논문 DOI" },
  { from: "EPUB·서점 채널", to: "웹북·권호 PDF · KCI/학지사 수록" },
  { from: "정산·로열티", to: "1차 제외 (게재료는 별도)" },
  { from: "표지 승인", to: "권호 표지·목차 확정" },
];

function JournalPublishHub() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-xs">Journal Publishing</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">학술지 발행 엔진</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Localbooks(LoBook) Studio·Admin의 출판 기능을{" "}
            <strong className="text-foreground">논문·권호 발행</strong> 기준으로 이식합니다.
            원본:{" "}
            <a className="text-primary underline" href="https://github.com/shinkang888-code/lobooks" target="_blank" rel="noreferrer">
              shinkang888-code/lobooks
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={JOURNAL_STUDIO_URL} target="_blank" rel="noopener noreferrer" className={siteBtn("primary", "md")}>
            <PencilLine className="h-4 w-4" /> 조판 스튜디오 열기
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a href={JOURNAL_PUBLISH_ADMIN_REF_URL} target="_blank" rel="noopener noreferrer" className={siteBtn("secondary", "md")}>
            원본 출판 콘솔 참고
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, label: "발행 엔진", value: "Studio 연동", hint: "WEB·PDF·DOC·HWPX" },
          { icon: Layers, label: "데이터 모델", value: "권호 › 논문", hint: "Phase C Neon" },
          { icon: Workflow, label: "파이프라인", value: "5단계", hint: "투고→발행" },
          { icon: FileOutput, label: "공개 수록", value: "/journal", hint: "사이트 자료실" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-white p-4 shadow-card">
            <div className="flex items-center gap-2 text-primary">
              <c.icon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</span>
            </div>
            <div className="mt-2 text-lg font-bold text-navy">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.hint}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-navy">논문 발행 파이프라인</h2>
        </div>
        <ol className="grid gap-3 md:grid-cols-5">
          {PIPELINE.map((p) => (
            <li key={p.step} className="relative rounded-xl border border-border bg-accent/30 p-4">
              <div className="text-[11px] font-bold text-primary">{p.step}</div>
              <div className="mt-1 font-semibold text-foreground">{p.title}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              {p.href && (
                p.external ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    열기 <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <Link to={p.href as any} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    이동 <ArrowRight className="h-3 w-3" />
                  </Link>
                )
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-navy">Lobook → 학술지 용어 매핑</h2>
          <p className="mt-1 text-xs text-muted-foreground">전자책 기능을 논문 발행에 맞게 재해석합니다.</p>
          <div className="mt-4 divide-y divide-border">
            {LOBOOK_MAP.map((row) => (
              <div key={row.from} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 text-sm">
                <span className="text-muted-foreground">{row.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{row.to}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-navy">이식 로드맵</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
              <span className="font-semibold text-emerald-800">Phase A (현재)</span>
              <span className="block text-emerald-900/80 text-xs mt-0.5">허브·스튜디오 연동·파이프라인 UI</span>
            </li>
            <li className="rounded-xl bg-accent/50 px-3 py-2">
              <span className="font-semibold">Phase B</span>
              <span className="block text-muted-foreground text-xs mt-0.5">Studio HTML KSAC 브랜딩 복제 (A4·DOI·권호 메타)</span>
            </li>
            <li className="rounded-xl bg-accent/50 px-3 py-2">
              <span className="font-semibold">Phase C</span>
              <span className="block text-muted-foreground text-xs mt-0.5">Neon journal_issues / journal_articles</span>
            </li>
            <li className="rounded-xl bg-accent/50 px-3 py-2">
              <span className="font-semibold">Phase D</span>
              <span className="block text-muted-foreground text-xs mt-0.5">공개 권호·논문 페이지 + sitemap</span>
            </li>
            <li className="rounded-xl bg-accent/50 px-3 py-2">
              <span className="font-semibold">Phase E</span>
              <span className="block text-muted-foreground text-xs mt-0.5">KCI·DOI·심사 동기 (후순위)</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            상세 기획: <code className="rounded bg-accent px-1">docs/ksac-journal-publish-plan.txt</code>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
        <h2 className="text-base font-bold text-navy">Studio 바로 사용 (1호 발행 작업 순서)</h2>
        <ol className="mt-3 list-decimal pl-5 space-y-1.5 text-sm text-foreground">
          <li>「조판 스튜디오 열기」에서 권호를 하나의 프로젝트로 생성</li>
          <li>챕터 = 논문 단위로 H1 제목 분리 · 교신저자·초록을 서두에 배치</li>
          <li>조판: A4, 본문 명조, 들여쓰기 학술지 관례로 설정</li>
          <li>내보내기: PDF(인쇄) + WEB(웹북) + 필요 시 DOC/HWPX</li>
          <li>결과물을 자료실(/journal) 또는 권호 페이지( Phase D )에 업로드</li>
        </ol>
      </section>
    </div>
  );
}
