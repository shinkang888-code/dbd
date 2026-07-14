import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { isPrivilegedAdminEmail } from "@/lib/admin-emails";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const q = useQuery({
    queryKey: ["is-admin", user?.id, user?.email],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return false;
      if (isPrivilegedAdminEmail(user.email)) return true;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });
  return { isAdmin: !!q.data, loading: loading || (!!user && q.isLoading) };
}
