/** 스토어프론트 크롬(헤더/푸터/탭)을 숨기는 운영 경로 */
export function isOpsPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/hq") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/auth")
  );
}
