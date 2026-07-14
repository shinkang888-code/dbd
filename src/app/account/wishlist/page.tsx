// filepath: src/app/account/wishlist/page.tsx
import Link from "next/link";
import { requireSession } from "@/lib/auth/admin";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-[28px] font-semibold">Wishlist</h1>
      {!session?.user ? (
        <p className="mt-4 text-[14px] text-dim">
          <Link href="/auth/sign-in" className="font-bold text-coral">
            로그인
          </Link>
          후 위시리스트를 동기화할 수 있습니다.
        </p>
      ) : (
        <p className="mt-4 rounded-2xl bg-fog p-6 text-[13px] text-dim">
          아직 저장한 상품이 없습니다. PDP에서 ♥ 로 추가하세요 (스키마 `wishlists` 준비됨).
        </p>
      )}
    </div>
  );
}
