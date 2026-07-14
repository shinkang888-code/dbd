// filepath: src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { availableProviders } from "@/lib/payments/config";
import { initPayment } from "@/lib/payments/init";
import type { PaymentProvider } from "@/lib/payments/types";
import type { CheckoutInput } from "@/lib/checkout";

export async function GET() {
  return NextResponse.json({ providers: availableProviders() });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutInput & { provider?: PaymentProvider };
    if (!body.email || !body.name || !body.address1 || !body.country) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }
    const provider = body.provider ?? "mock";
    const allowed = availableProviders();
    if (!allowed.includes(provider)) {
      return NextResponse.json(
        { error: `provider '${provider}' unavailable`, available: allowed },
        { status: 400 },
      );
    }
    const result = await initPayment(body, provider);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
