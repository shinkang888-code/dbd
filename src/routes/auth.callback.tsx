// filepath: src/routes/auth.callback.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isPrivilegedAdminEmail } from "@/lib/admin-emails";
import { afterMemberLogin } from "@/lib/member-profile-gate";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("로그인 처리 중…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // PKCE / hash session is handled by getSession after redirect
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        let session = data.session;
        if (!session) {
          // Some flows put tokens in URL hash; wait briefly
          await new Promise((r) => setTimeout(r, 400));
          session = (await supabase.auth.getSession()).data.session;
        }
        if (!session?.user) {
          setMsg("세션을 확인할 수 없습니다. 다시 로그인해 주세요.");
          setTimeout(() => nav({ to: "/login" }), 1500);
          return;
        }
        if (cancelled) return;
        const admin =
          isPrivilegedAdminEmail(session.user.email) ||
          !!(
            await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "admin")
              .maybeSingle()
          ).data;
        await afterMemberLogin({
          isAdmin: admin,
          navigate: (o) => nav(o as any),
        });
      } catch (e: any) {
        setMsg(e?.message ?? "로그인 콜백 오류");
        setTimeout(() => nav({ to: "/login" }), 2000);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nav]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-sm text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {msg}
    </div>
  );
}
