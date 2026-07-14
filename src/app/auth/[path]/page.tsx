// filepath: src/app/auth/[path]/page.tsx
import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-10">
      <p className="mb-6 font-display text-[28px] font-semibold tracking-tight">
        LEXI<span className="text-coral">.</span>
      </p>
      <AuthView path={path} />
    </div>
  );
}
