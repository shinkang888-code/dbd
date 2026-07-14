// filepath: src/middleware.ts
import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: ["/account/settings", "/account/security", "/admin/:path*"],
};
