import Link from "next/link";

/** 파이프라인·운영 보드용 얇은 플레이스홀더 (밀도 IA 유지) */
export function OpsBoardPage({
  title,
  description,
  links,
  note,
}: {
  title: string;
  description: string;
  links?: { href: string; label: string; external?: boolean }[];
  note?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[24px] font-semibold">{title}</h1>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-dim">{description}</p>
      </div>
      {links && links.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-line bg-paper px-3.5 py-3 text-[13px] font-semibold hover:border-ink/25"
              >
                {l.label} ↗
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl border border-line bg-paper px-3.5 py-3 text-[13px] font-semibold hover:border-ink/25"
              >
                {l.label} →
              </Link>
            ),
          )}
        </div>
      ) : null}
      {note ? (
        <p className="rounded-xl border border-line bg-paper px-3.5 py-3 text-[12px] leading-relaxed text-dim">
          {note}
        </p>
      ) : null}
    </div>
  );
}
