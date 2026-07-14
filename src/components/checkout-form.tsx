// filepath: src/components/checkout-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { dutyTable } from "@/lib/dummy-data";
import type { PaymentProvider } from "@/lib/payments/types";

const PROVIDER_LABEL: Record<PaymentProvider, string> = {
  mock: "모의 결제 (테스트)",
  stripe: "Stripe (해외카드 · USD)",
  toss: "토스페이먼츠 (KRW)",
  danal: "다날 (LawyGo 이식 · KRW)",
};

export function CheckoutForm({ subtotal }: { subtotal: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<PaymentProvider[]>(["mock"]);
  const [provider, setProvider] = useState<PaymentProvider>("mock");
  const [form, setForm] = useState({
    email: "",
    name: "",
    address1: "",
    city: "",
    postal: "",
    country: "US",
  });

  useEffect(() => {
    fetch("/api/checkout")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.providers as PaymentProvider[]) ?? ["mock"];
        setProviders(list);
        // 우선순위: toss → stripe → danal → mock
        const preferred =
          (["toss", "stripe", "danal", "mock"] as PaymentProvider[]).find((p) =>
            list.includes(p),
          ) ?? "mock";
        setProvider(preferred);
      })
      .catch(() => undefined);
  }, []);

  const dutyCfg = dutyTable[form.country] ?? dutyTable.US;
  const duty = subtotal > dutyCfg.freeUnder ? +(subtotal * dutyCfg.rate).toFixed(2) : 0;
  const shipping = subtotal >= 49 ? 0 : dutyCfg.shipping;
  const total = +(subtotal + duty + shipping).toFixed(2);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "checkout failed");

      if (data.provider === "mock") {
        router.push(data.redirectUrl);
        return;
      }

      if (data.provider === "stripe") {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.provider === "toss") {
        const toss = await loadTossPayments(data.clientKey);
        const payment = toss.payment({ customerKey: data.customerKey });
        await payment.requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: data.amountKrw },
          orderId: data.paymentOrderId,
          orderName: data.orderName,
          successUrl: data.successUrl,
          failUrl: data.failUrl,
          customerEmail: form.email,
          customerName: form.name,
        });
        return;
      }

      if (data.provider === "danal") {
        await runDanalWidget(data);
        return;
      }

      throw new Error("unknown provider");
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  async function runDanalWidget(data: {
    clientKey: string;
    merchantId: string;
    sandbox: boolean;
    paymentOrderId: string;
    amountKrw: number;
    orderName: string;
    returnUrl: string;
  }) {
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-danal]");
      if (existing) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = "https://cdn.danalpay.com/danalpayments.js";
      s.dataset.danal = "1";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("다날 SDK 로드 실패"));
      document.head.appendChild(s);
    });

    const w = window as unknown as {
      DanalPayments?: {
        requestPayment: (opts: Record<string, unknown>) => Promise<{
          transactionId?: string;
          orderId?: string;
        }>;
      };
    };
    if (!w.DanalPayments?.requestPayment) {
      throw new Error("DanalPayments SDK를 사용할 수 없습니다.");
    }

    const result = await w.DanalPayments.requestPayment({
      clientKey: data.clientKey,
      merchantId: data.merchantId,
      sandbox: data.sandbox,
      amount: data.amountKrw,
      orderId: data.paymentOrderId,
      orderName: data.orderName,
      returnUrl: data.returnUrl,
    });

    const transactionId = result.transactionId;
    const orderId = result.orderId || data.paymentOrderId;
    if (!transactionId) {
      // returnUrl 콜백으로 돌아올 수 있음
      router.push(
        `${data.returnUrl}&orderId=${encodeURIComponent(orderId)}&await=1`,
      );
      return;
    }

    const confirm = await fetch("/api/payments/danal/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId,
        orderId,
        amount: data.amountKrw,
      }),
    });
    const cj = await confirm.json();
    if (!confirm.ok) throw new Error(cj.error || "다날 승인 실패");
    router.push(
      `/checkout/success?provider=danal&ref=${encodeURIComponent(cj.paymentRef)}&total=${cj.totalUsd ?? total}`,
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="rounded-2xl border border-line p-4">
        <p className="text-[13px] font-bold">배송 정보 (게스트 체크아웃 가능)</p>
        {(
          [
            ["email", "이메일", "email"],
            ["name", "수령인", "text"],
            ["address1", "주소", "text"],
            ["city", "도시", "text"],
            ["postal", "우편번호", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="mt-3 block text-[12px] font-medium text-dim">
            {label}
            <input
              type={type}
              required
              className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-[14px] text-ink"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="mt-3 block text-[12px] font-medium text-dim">
          배송 국가
          <select
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-[14px]"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          >
            {Object.entries(dutyTable).map(([code, v]) => (
              <option key={code} value={code}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-line p-4">
        <p className="text-[13px] font-bold">결제 수단</p>
        <div className="mt-3 space-y-2">
          {providers.map((p) => (
            <label
              key={p}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-[13px] ${
                provider === p ? "border-ink bg-fog" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="provider"
                checked={provider === p}
                onChange={() => setProvider(p)}
              />
              <span className="font-semibold">{PROVIDER_LABEL[p]}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-dim">
          LawyGo Stripe/다날 모듈 이식 + 토스페이먼츠 신규. 키 미설정 시 mock만 표시됩니다.
        </p>
      </div>

      <div className="rounded-2xl bg-fog p-4 text-[13px]">
        <div className="flex justify-between">
          <span>소계</span>
          <span className="price">${subtotal.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between text-dim">
          <span>배송</span>
          <span className="price">${shipping.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between text-dim">
          <span>예상 관세</span>
          <span className="price">${duty.toFixed(2)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-[16px] font-bold">
          <span>합계</span>
          <span className="price">${total.toFixed(2)}</span>
        </div>
        {(provider === "toss" || provider === "danal") && (
          <p className="mt-2 text-[11px] text-dim">
            국내 PG는 USD×환율(USD_KRW_RATE) KRW로 청구됩니다.
          </p>
        )}
      </div>

      {error && <p className="text-[13px] text-coral">{error}</p>}

      <button
        type="submit"
        disabled={pending || subtotal <= 0}
        className="w-full rounded-xl bg-coral py-3.5 text-[14px] font-bold text-white disabled:opacity-50"
      >
        {pending ? "결제창 여는 중…" : `결제하기 $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
