import Link from "next/link";

const CAFE24_ADMIN_URL =
  process.env.NEXT_PUBLIC_CAFE24_ADMIN_URL ?? "https://eclogin.cafe24.com/Shop/";

type Props = {
  /** cart | checkout | admin */
  surface: "cart" | "checkout" | "admin";
};

export function LegacyCommerceBanner({ surface }: Props) {
  const copy =
    surface === "admin"
      ? "상품·주문 원장은 Cafe24입니다. 이 화면은 LEXI preview/legacy 데이터만 보여 줍니다."
      : surface === "checkout"
        ? "Legacy checkout — Cafe24 전환 전 preview 결제입니다. 실운영 주문은 Cafe24 몰에서 처리합니다."
        : "Legacy cart — Cafe24 전환 전 preview 장바구니입니다.";

  return (
    <div className="mb-6 rounded-2xl border border-line bg-fog px-4 py-3 text-[13px] leading-relaxed text-dim">
      <p className="font-semibold text-ink">{copy}</p>
      <p className="mt-2 flex flex-wrap gap-3">
        <a
          href={CAFE24_ADMIN_URL}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-coral"
        >
          Cafe24 관리자 ↗
        </a>
        {surface === "admin" && (
          <Link href="/studio" className="font-bold text-ink underline-offset-2 hover:underline">
            LEXI Studio →
          </Link>
        )}
      </p>
    </div>
  );
}
