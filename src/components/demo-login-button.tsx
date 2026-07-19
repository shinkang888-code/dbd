type Props = {
  next?: string;
  label?: string;
  className?: string;
};

/**
 * 클릭 → /api/auth/demo 가 세션 쿠키를 심고 next로 이동.
 * 비활성(DEMO_LOGIN=0)이면 API가 404.
 */
export function DemoLoginButton({
  next = "/admin",
  label = "데모 로그인",
  className,
}: Props) {
  const href = `/api/auth/demo?next=${encodeURIComponent(next)}`;
  const cls =
    className ??
    "inline-flex items-center justify-center rounded-xl bg-coral px-4 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90";

  return (
    <a href={href} className={cls}>
      {label}
    </a>
  );
}
