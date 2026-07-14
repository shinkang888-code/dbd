import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout, Section } from "@/components/site-layout";
import { listBanners, listBoardRows } from "@/lib/board-db";
import { BoardDetailDialog } from "@/components/board/board-detail-dialog";
import { GALLERY, NOTICES } from "@/lib/board";
import { useQuery } from "@tanstack/react-query";
import { MEDIA, SUBMISSION_PORTAL_URL } from "@/lib/media";
import { siteBtn } from "@/lib/site-button";
import { pageHead } from "@/lib/seo";
import { PageBody } from "@/components/cms/page-body";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "대한학술융합학회 KSAC — 학문을 연결하고 미래 사회의 해법을 만듭니다",
      description:
        "인문사회·과학기술·보건의료·정책·문화예술을 잇는 개방형 융합학술 공동체, 대한학술융합학회 공식 홈페이지.",
    }),
  component: HomePage,
});

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctas: { label: string; to: string; external?: boolean }[];
  image?: string | null;
  video?: string | null;
};

const FALLBACK_SLIDES: Slide[] = [
  {
    eyebrow: "Welcome to KSAC",
    title: "학문을 연결하고, 미래 사회의\n해법을 함께 만듭니다",
    subtitle:
      "대한학술융합학회는 인문사회·과학기술·보건의료·정책·문화예술을 잇는 개방형 융합학술 공동체입니다.",
    ctas: [
      { label: "학회 소개 보기", to: "/about" },
      { label: "회원가입 안내", to: "/members" },
    ],
    image: MEDIA.hero,
  },
];

function bannerToSlide(b: any): Slide {
  const buttons: { label: string; href: string }[] = Array.isArray(b.cta_buttons)
    ? b.cta_buttons
    : [];
  const fromJson = buttons
    .filter((c) => c?.label)
    .map((c) => {
      const href = c.href || "/about";
      return { label: c.label, to: href, external: /^https?:\/\//i.test(href) };
    });
  const legacy =
    b.cta_label
      ? [
          {
            label: b.cta_label,
            to: b.cta_href || "/about",
            external: /^https?:\/\//i.test(b.cta_href || ""),
          },
        ]
      : [];
  const ctas =
    fromJson.length > 0
      ? fromJson
      : legacy.length > 0
        ? legacy
        : [{ label: "학회 소개", to: "/about" }];
  return {
    eyebrow: "KSAC",
    title: b.title || "대한학술융합학회",
    subtitle: b.subtitle || "",
    ctas,
    image: b.image_url || null,
    video: b.video_url || null,
  };
}

function HomePage() {
  const [idx, setIdx] = useState(0);
  const [noticeId, setNoticeId] = useState<string | null>(null);
  const [galleryId, setGalleryId] = useState<string | null>(null);

  const banners = useQuery({
    queryKey: ["neon", "banners-home"],
    queryFn: async () => {
      const res = await listBanners();
      return res.rows ?? [];
    },
  });

  const slides =
    banners.data && banners.data.length > 0
      ? banners.data.map(bannerToSlide).filter((s) => s.image || s.video)
      : FALLBACK_SLIDES;

  const active = slides[idx] ?? slides[0];
  const activeHasVideo = Boolean(active?.video);

  useEffect(() => {
    setIdx(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    // Still advance when video is present, but give it more time
    const ms = activeHasVideo ? 12000 : 6000;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), ms);
    return () => clearInterval(t);
  }, [slides.length, activeHasVideo]);

  const notices = useQuery({
    queryKey: ["neon", "notices-home"],
    queryFn: async () => {
      const res = await listBoardRows({ data: { table: "notices" } });
      return (res.rows ?? []).slice(0, 3).map((r: any) => ({
        id: r.id,
        title: r.title,
        created_at: r.created_at,
      }));
    },
  });

  const gallery = useQuery({
    queryKey: ["neon", "gallery-home"],
    queryFn: async () => {
      const res = await listBoardRows({ data: { table: "gallery" } });
      return (res.rows ?? []).slice(0, 4);
    },
  });

  return (
    <SiteLayout>
      <section className="relative h-[58vh] min-h-[380px] max-h-[640px] overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {s.video ? (
              <video
                key={`${i}-${s.video}`}
                src={s.video}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay={i === idx}
                muted
                loop
                playsInline
                poster={s.image || undefined}
                ref={(el) => {
                  if (!el) return;
                  if (i === idx) {
                    void el.play().catch(() => {});
                  } else {
                    el.pause();
                    el.currentTime = 0;
                  }
                }}
              />
            ) : (
              <img
                src={s.image || MEDIA.hero}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-navy/75" />
            <div className="relative h-full mx-auto max-w-7xl px-6 flex flex-col justify-center text-white">
              <p className="eyebrow-gold text-sm md:text-base fade-in">{s.eyebrow}</p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.2] whitespace-pre-line fade-in max-w-4xl">
                {s.title}
              </h1>
              {s.subtitle && (
                <p className="mt-6 max-w-2xl text-base md:text-lg text-white/85 leading-relaxed fade-in">
                  {s.subtitle}
                </p>
              )}
              <div className="mt-10 flex flex-wrap gap-3 fade-in">
                {s.ctas.map((c, j) =>
                  c.external ? (
                    <a
                      key={j}
                      href={c.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={siteBtn(j === 0 ? "solidLight" : "outlineLight", "lg")}
                    >
                      {c.label}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      key={j}
                      to={c.to as any}
                      className={siteBtn(j === 0 ? "solidLight" : "outlineLight", "lg")}
                    >
                      {c.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`슬라이드 ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-10 bg-white" : "w-4 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </section>

      <PageBody slug="home" className="mx-auto max-w-7xl px-6 py-12">
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {[
            { k: "2026", v: "학회 설립" },
            { k: "5+", v: "융합 연구 분야" },
            { k: "1", v: "공식 학술지 발간" },
            { k: "Open", v: "국내외 개방형 네트워크" },
          ].map((s) => (
            <div key={s.v} className="text-center md:border-r md:border-border md:last:border-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-navy">{s.k}</div>
              <div className="mt-2 text-xs text-muted-foreground tracking-wide">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal">
            <p className="eyebrow text-sm">About the Society</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground leading-tight">
              학문 간 경계를 허물고
              <br />
              <span className="text-primary">융합의 미래</span>를 그립니다
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              대한학술융합학회는 다양한 학문 분야의 연구자와 전문가, 산업 현장의 실무자가 함께 참여하여 새로운 융합
              학술영역을 개척하고, 연구성과가 실제 사회 발전과 산업 혁신으로 이어질 수 있는 학술공동체를 구축하기 위해
              설립되었습니다.
            </p>
            <Link to="/about" className={siteBtn("primary", "md", "mt-8")}>
              학회 소개 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="reveal reveal-delay-2">
            <img
              src={MEDIA.about}
              className="rounded-xl border border-border shadow-card w-full aspect-[16/10] object-cover"
              alt="학술대회 포스터 세션"
            />
            <p className="mt-3 text-sm text-muted-foreground">학술대회 · 포스터세션 · 연구자 교류</p>
          </div>
        </div>
      </Section>

      <Section className="!py-16 bg-secondary/30 !max-w-none">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 reveal">
            <p className="eyebrow text-sm">Quick Access</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">주요 메뉴</h2>
            <p className="mt-3 text-muted-foreground">학회 활동의 핵심 안내로 바로 이동합니다</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                n: "01",
                t: "회원가입 안내",
                d: "가입 자격 및 절차",
                to: "/members",
                img: MEDIA.networking,
              },
              {
                n: "02",
                t: "논문투고",
                d: "투고·심사 규정",
                to: "/submission",
                href: SUBMISSION_PORTAL_URL,
                external: true,
                img: MEDIA.journal,
              },
              {
                n: "03",
                t: "학술지 · 자료실",
                d: "발간 논문·자료 열람",
                to: "/journal",
                img: MEDIA.panel,
              },
              {
                n: "04",
                t: "학술대회 안내",
                d: "일정 및 소식",
                to: "/conference",
                img: MEDIA.ceremony,
              },
            ].map((item, i) => {
              const cardClass = `group relative overflow-hidden rounded-xl border border-border bg-white shadow-card hover:shadow-elevated transition-all reveal reveal-delay-${(i % 2) + 1}`;
              const body = (
                <div className="grid sm:grid-cols-[140px_1fr] min-h-[148px]">
                  <div className="relative min-h-[120px] sm:min-h-full">
                    <img
                      src={item.img}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-navy/25" />
                  </div>
                  <div className="flex flex-col justify-between p-5 md:p-6">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">{item.n}</div>
                      <h3 className="mt-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.t}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
                    </div>
                    <span className={siteBtn("ghost", "sm", "mt-4 self-start px-0 text-primary")}>
                      바로가기
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              );

              if ("external" in item && item.external && item.href) {
                return (
                  <a
                    key={item.n}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {body}
                  </a>
                );
              }

              return (
                <Link key={item.n} to={item.to as any} className={cardClass}>
                  {body}
                </Link>
              );
            })}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="reveal">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="eyebrow text-sm">Notices</p>
                <h3 className="mt-1 text-2xl font-bold text-foreground">공지사항</h3>
              </div>
              <Link to="/news" className="text-sm text-muted-foreground hover:text-primary">
                전체보기 →
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-white shadow-card divide-y divide-border overflow-hidden">
              {(notices.data ?? []).length === 0 ? (
                <div className="p-8 text-sm text-muted-foreground text-center">등록된 공지가 없습니다.</div>
              ) : (
                (notices.data ?? []).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNoticeId(n.id)}
                    className="group flex w-full items-start gap-4 p-5 hover:bg-accent/50 transition text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {n.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{String(n.created_at).slice(0, 10)}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="reveal reveal-delay-2">
            <div className="relative rounded-xl overflow-hidden border border-border shadow-card h-full min-h-[260px]">
              <img
                src={MEDIA.ceremony}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-navy/70" />
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-between text-white">
                <div>
                  <p className="eyebrow-gold text-sm">Academic Conference</p>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold leading-tight">2026 학술대회 안내</h3>
                  <p className="mt-4 text-white/85 text-sm md:text-base leading-relaxed max-w-md">
                    학회의 공식 출범과 학술지 창간을 기념하는 융합연구 학술대회에 여러분을 초대합니다.
                  </p>
                </div>
                <Link to="/conference" className={siteBtn("solidLight", "md", "mt-8 self-start")}>
                  자세히 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow text-sm">Photo Gallery</p>
            <h3 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">포토갤러리</h3>
          </div>
          <Link to="/gallery" className="text-sm text-muted-foreground hover:text-primary">
            전체보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(gallery.data && gallery.data.length > 0
            ? gallery.data.map((g: any) => ({
                src: g.thumbnail_url || g.image_urls?.[0],
                id: g.id,
              }))
            : MEDIA.galleryFallback.map((src) => ({
                src,
                id: null as string | null,
              }))
          ).map((item, i) =>
            item.id ? (
              <button
                key={item.id}
                type="button"
                onClick={() => setGalleryId(item.id)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-border shadow-card"
              >
                <img src={item.src} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              </button>
            ) : (
              <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border shadow-card">
                <img src={item.src} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            ),
          )}
        </div>
      </Section>

      </PageBody>

      <BoardDetailDialog
        config={NOTICES}
        id={noticeId}
        open={!!noticeId}
        onClose={() => setNoticeId(null)}
      />
      <BoardDetailDialog
        config={GALLERY}
        id={galleryId}
        open={!!galleryId}
        onClose={() => setGalleryId(null)}
      />
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0 opacity-30">
          <img
            src={MEDIA.networking}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center text-white">
          <p className="eyebrow-gold text-sm">Join KSAC</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">
            지금 대한학술융합학회의
            <br />
            일원이 되어주세요
          </h2>
          <p className="mt-5 text-white/85 max-w-xl mx-auto">
            학문과 산업, 연구와 현장을 잇는 개방형 학술공동체에서 함께합니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className={siteBtn("solidLight", "lg")}>
              회원가입 하기
            </Link>
            <Link to="/members" className={siteBtn("outlineLight", "lg")}>
              가입 안내 보기
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
