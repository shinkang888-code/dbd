// filepath: src/lib/payments/config.ts
import type { PaymentProvider } from "./types";

export function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

/** USD → KRW (토스/다날). 기본 1,350원 */
export function usdToKrw(usd: number) {
  const rate = Number(process.env.USD_KRW_RATE || 1350);
  return Math.max(100, Math.round(usd * rate));
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function tossConfigured() {
  return Boolean(
    process.env.TOSS_SECRET_KEY?.trim() &&
      (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() || process.env.TOSS_CLIENT_KEY?.trim()),
  );
}

export function danalConfigured() {
  return Boolean(
    process.env.DANAL_SECRET_KEY?.trim() &&
      process.env.DANAL_MERCHANT_ID?.trim() &&
      (process.env.DANAL_CLIENT_KEY?.trim() || process.env.NEXT_PUBLIC_DANAL_CLIENT_KEY?.trim()),
  );
}

export function availableProviders(): PaymentProvider[] {
  const list: PaymentProvider[] = ["mock"];
  if (stripeConfigured()) list.push("stripe");
  if (tossConfigured()) list.push("toss");
  if (danalConfigured()) list.push("danal");
  return list;
}

export function tossClientKey() {
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() || process.env.TOSS_CLIENT_KEY?.trim() || "";
}

export function danalClientKey() {
  return process.env.NEXT_PUBLIC_DANAL_CLIENT_KEY?.trim() || process.env.DANAL_CLIENT_KEY?.trim() || "";
}
