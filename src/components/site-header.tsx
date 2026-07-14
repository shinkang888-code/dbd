import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown, LogOut, MapPin, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/roles";
import { toast } from "sonner";
import { siteBtn } from "@/lib/site-button";
import { MEDIA, SUBMISSION_PORTAL_URL } from "@/lib/media";

type SubItem = { label: string; hash?: string; to?: string; href?: string; external?: boolean };
type NavItem = {
  label: string;
  to: string;
  en: string;
  href?: string;
  external?: boolean;
  sub?: SubItem[];
};

const NAV: NavItem[] = [
  {
    label: "학회소개",
    to: "/about",
    en: "About",
    sub: [
      { label: "인사말", hash: "greeting" },
      { label: "연혁", hash: "history" },
      { label: "임원구성", hash: "board" },
      { label: "정관", hash: "bylaws" },
      { label: "오시는길", hash: "location" },
    ],
  },
  {
    label: "학술지",
    to: "/journal",
    en: "Journal",
    sub: [
      { label: "논문검색", hash: "search" },
      { label: "자료실", hash: "resources" },
    ],
  },
  {
    label: "논문투고",
    to: "/submission",
    en: "Submission",
    sub: [
      { label: "투고시스템 로그인", href: SUBMISSION_PORTAL_URL, external: true },
      { label: "투고안내", hash: "guide" },
      { label: "투고규정", hash: "rules" },
      { label: "심사규정", hash: "review" },
      { label: "윤리규정", hash: "ethics" },
    ],
  },
  {
    label: "학회소식",
    to: "/news",
    en: "News",
    sub: [
      { label: "공지사항", to: "/news" },
      { label: "학술대회 안내", to: "/conference" },
      { label: "포토갤러리", to: "/gallery" },
    ],
  },
  {
    label: "회원마당",
    to: "/members",
    en: "Members",
    sub: [
      { label: "회원가입안내", hash: "info" },
      { label: "회원동정", to: "/updates" },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="hidden md:block bg-navy text-white/80 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex justify-end gap-5 py-2">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hover:text-white inline-flex items-center gap-1">
                  <LayoutDashboard className="h-3 w-3" /> 관리자
                </Link>
              )}
              <Link to="/mypage" className="hover:text-white">
                마이페이지
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  toast.success("로그아웃되었습니다");
                }}
                className="hover:text-white inline-flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" /> 로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-white">
                로그인
              </Link>
              <Link to="/register" className="hover:text-white">
                회원가입
              </Link>
            </>
          )}
          <Link to="/about" hash="location" className="hover:text-white inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> 오시는길
          </Link>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-18 md:h-20 items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img
                src={MEDIA.logo}
                alt="KSAC"
                className="h-11 w-11 rounded-xl object-cover border border-border shadow-card bg-white"
              />
              <div className="min-w-0">
                <div className="text-[16px] font-bold leading-tight tracking-tight text-foreground">대한학술융합학회</div>
                <div className="text-[10px] leading-tight tracking-[0.06em] text-muted-foreground uppercase">
                  Korean Society for Academic Convergence
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
              {NAV.map((item) => (
                <div key={item.to} className="relative" onMouseEnter={() => setHovered(item.to)}>
                  {item.external && item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-6 text-[15px] font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className="px-4 py-6 text-[15px] font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      activeProps={{ className: "text-primary" }}
                    >
                      {item.label}
                    </Link>
                  )}
                  {item.sub && hovered === item.to && (
                    <div className="absolute left-0 top-full min-w-[200px] bg-white shadow-elevated rounded-b-lg border border-border overflow-hidden">
                      {item.sub.map((s) =>
                        s.external && s.href ? (
                          <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-5 py-3 text-sm hover:bg-accent hover:text-primary transition-colors"
                          >
                            {s.label}
                          </a>
                        ) : (
                          <Link
                            key={s.label}
                            to={(s.to ?? item.to) as any}
                            hash={s.to ? undefined : s.hash}
                            className="block px-5 py-3 text-sm hover:bg-accent hover:text-primary transition-colors"
                          >
                            {s.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {user ? (
                <span className="text-xs text-muted-foreground max-w-[160px] truncate">{user.email}</span>
              ) : (
                <>
                  <Link to="/login" className={siteBtn("ghost", "sm")}>
                    로그인
                  </Link>
                  <Link to="/register" className={siteBtn("primary", "sm")}>
                    회원가입
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2 -mr-2" aria-label="메뉴">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border bg-white max-h-[80vh] overflow-y-auto">
            {NAV.map((item) => (
              <MobileItem key={item.to} item={item} onNav={() => setOpen(false)} />
            ))}
            <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="col-span-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm text-center font-semibold"
                    >
                      관리자 콘솔
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await signOut();
                      setOpen(false);
                      toast.success("로그아웃");
                    }}
                    className="col-span-2 rounded-lg border border-border px-4 py-2 text-sm"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={siteBtn("secondary", "md", "w-full")}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className={siteBtn("primary", "md", "w-full")}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MobileItem({ item, onNav }: { item: NavItem; onNav: () => void }) {
  const [expand, setExpand] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setExpand(!expand)} className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold">
        {item.label}
        <ChevronDown className={`h-4 w-4 transition ${expand ? "rotate-180" : ""}`} />
      </button>
      {expand && item.sub && (
        <div className="bg-muted/40 pb-2">
          {item.sub.map((s) =>
            s.external && s.href ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNav}
                className="block px-8 py-2.5 text-sm text-muted-foreground hover:text-primary"
              >
                {s.label}
              </a>
            ) : (
              <Link
                key={s.label}
                to={(s.to ?? item.to) as any}
                hash={s.to ? undefined : s.hash}
                onClick={onNav}
                className="block px-8 py-2.5 text-sm text-muted-foreground hover:text-primary"
              >
                {s.label}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
