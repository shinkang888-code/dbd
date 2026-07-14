// filepath: src/app/account/orders/page.tsx
import Link from "next/link";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { orders, users } from "@/db/schema";
import { requireSession } from "@/lib/auth/admin";

export const metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const session = await requireSession();

  if (!session?.user?.email) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-[28px] font-semibold">Orders</h1>
        <p className="mt-4 text-[14px] text-dim">주문 내역을 보려면 로그인하세요.</p>
        <Link href="/auth/sign-in" className="mt-4 inline-block font-bold text-coral">
          Google 로그인 →
        </Link>
      </div>
    );
  }

  let rows: {
    id: number;
    status: string;
    totalUsd: string;
    createdAt: Date;
    paymentRef: string | null;
  }[] = [];

  if (hasDb()) {
    const database = db();
    const [u] = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    const ownership = u
      ? or(eq(orders.userId, u.id), eq(orders.guestEmail, session.user.email))
      : eq(orders.guestEmail, session.user.email);

    rows = await database
      .select({
        id: orders.id,
        status: orders.status,
        totalUsd: orders.totalUsd,
        createdAt: orders.createdAt,
        paymentRef: orders.paymentRef,
      })
      .from(orders)
      .where(and(isNull(orders.deletedAt), ownership))
      .orderBy(desc(orders.createdAt))
      .limit(50);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-[28px] font-semibold">Orders</h1>
      <ul className="mt-5 divide-y divide-line rounded-2xl border border-line">
        {rows.length === 0 && (
          <li className="p-6 text-[13px] text-dim">아직 주문이 없습니다.</li>
        )}
        {rows.map((o) => (
          <li key={o.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-semibold">#{o.id}</p>
                <p className="text-[12px] text-dim">
                  {o.status} · {o.paymentRef}
                </p>
              </div>
              <p className="price text-[15px] font-bold">${Number(o.totalUsd).toFixed(2)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
