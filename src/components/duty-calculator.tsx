"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import { dutyTable } from "@/lib/dummy-data";

/** 역직구 이탈 1위 원인(관세 불확실성)을 PDP 인라인에서 제거 — spec §3.4 PDP */
export function DutyCalculator({ price }: { price: number }) {
  const [country, setCountry] = useState("US");
  const d = dutyTable[country];
  const duty = price > d.freeUnder ? +(price * d.rate).toFixed(2) : 0;
  const total = +(price + duty + d.shipping).toFixed(2);

  return (
    <div className="rounded-xl border border-sage/30 bg-sage/5 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[13px] font-bold text-sage">
          <Plane className="size-4" strokeWidth={2} /> 관세·배송비 사전 계산
        </p>
        <select
          aria-label="배송 국가"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-md border border-line bg-paper px-2 py-1 text-[12px] font-medium"
        >
          {Object.entries(dutyTable).map(([code, v]) => (
            <option key={code} value={code}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      <dl className="price space-y-1 text-[13px]">
        <div className="flex justify-between text-dim">
          <dt>상품가</dt>
          <dd>${price.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between text-dim">
          <dt>예상 관세 {duty === 0 && <span className="text-sage">(면세 구간)</span>}</dt>
          <dd>${duty.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between text-dim">
          <dt>국제 배송비</dt>
          <dd>${d.shipping.toFixed(2)}</dd>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-sage/20 pt-1.5 text-[15px] font-bold text-ink">
          <dt>총 결제 예상액</dt>
          <dd>${total.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] text-dim">
        추가 비용 없는 최종가입니다. 통관 시 차액 발생분은 LEXI가 부담합니다.
      </p>
    </div>
  );
}
