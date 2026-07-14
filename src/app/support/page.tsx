export const metadata = { title: "Support" };

const FAQ = [
  { q: "관세는 언제 어떻게 부과되나요?", a: "결제 단계에서 배송 국가 기준 관세를 사전 계산해 총액에 포함합니다. 통관 시 차액이 발생하면 LEXI가 부담합니다." },
  { q: "배송은 얼마나 걸리나요?", a: "서울 물류센터에서 주문 후 1영업일 내 출고, 주요 국가 기준 4–7영업일 내 도착합니다." },
  { q: "반품은 어떻게 하나요?", a: "수령 후 15일 이내 마이페이지에서 신청하면 무료 회수 라벨이 발급됩니다." },
  { q: "정품이 맞나요?", a: "모든 상품은 브랜드 본사 또는 공식 총판과의 직계약으로 소싱되며 로트별 이력이 관리됩니다." },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">Support</h1>
      <div className="mt-6 space-y-3">
        {FAQ.map((f) => (
          <details key={f.q} className="rounded-xl border border-line p-4">
            <summary className="cursor-pointer text-[14px] font-bold">{f.q}</summary>
            <p className="mt-2 text-[13px] leading-relaxed text-dim">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
