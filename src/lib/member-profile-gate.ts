// filepath: src/lib/member-profile-gate.ts
import { getMyMemberProfile, ensureMemberProfileStub } from "@/lib/members-db";

/** 로그인 직후: 스텁 생성 후 프로필 미완이면 /mypage 로 유도 */
export async function afterMemberLogin(opts: {
  isAdmin: boolean;
  navigate: (opts: { to: string }) => void;
}) {
  try {
    await ensureMemberProfileStub();
    if (opts.isAdmin) {
      opts.navigate({ to: "/admin" });
      return;
    }
    const profile = await getMyMemberProfile();
    if (!profile?.profile_complete) {
      opts.navigate({ to: "/mypage" });
      return;
    }
    opts.navigate({ to: "/" });
  } catch {
    if (opts.isAdmin) opts.navigate({ to: "/admin" });
    else opts.navigate({ to: "/mypage" });
  }
}
