/** 브랜드명 → URL slug */
export function brandSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-|-$/g, "")
    .replace(/ß/g, "ss");
}
