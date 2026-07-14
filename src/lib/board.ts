export type BoardTable = "notices" | "resources" | "gallery";

export type BoardConfig = {
  table: BoardTable;
  label: string;
  basePath: "/news" | "/journal" | "/gallery";
  categories: string[];
  hasFile?: boolean;
  hasImages?: boolean;
};

export const NOTICES: BoardConfig = {
  table: "notices",
  label: "공지사항",
  basePath: "/news",
  categories: ["공지", "학술대회", "회원동정", "행사", "기타"],
  hasFile: true,
};

export const RESOURCES: BoardConfig = {
  table: "resources",
  label: "자료실",
  basePath: "/journal",
  categories: ["자료실", "양식", "정관", "논문"],
  hasFile: true,
};

export const GALLERY: BoardConfig = {
  table: "gallery",
  label: "포토갤러리",
  basePath: "/gallery",
  categories: ["학술대회", "이사회·총회", "기타"],
  hasImages: true,
};

export function getConfig(t: BoardTable): BoardConfig {
  return t === "notices" ? NOTICES : t === "resources" ? RESOURCES : GALLERY;
}
