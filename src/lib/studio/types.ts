export type StudioStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export type ThemeTokens = {
  ink?: string;
  paper?: string;
  fog?: string;
  coral?: string;
  sage?: string;
  gold?: string;
  displayFont?: string;
  bodyFont?: string;
  radius?: string;
};

export type SectionPayload = {
  eyebrow?: string;
  headline?: string;
  description?: string;
  image?: string;
  href?: string;
  cta?: string;
  items?: Array<Record<string, unknown>>;
};

export const STUDIO_SLOTS = [
  "hero",
  "categories",
  "ranking",
  "timedeal",
  "look",
  "brand",
  "ugc",
] as const;

export const JOB_KINDS = [
  "pdp",
  "image",
  "cardnews",
  "storyboard",
  "video",
  "copy",
] as const;

export const DOCUMENT_KINDS = ["pdp", "editorial", "campaign", "home_section"] as const;

export function safeStatus(value: unknown): StudioStatus {
  const allowed: StudioStatus[] = [
    "draft",
    "review",
    "approved",
    "published",
    "rejected",
    "archived",
  ];
  return allowed.includes(value as StudioStatus) ? (value as StudioStatus) : "draft";
}

/** draft → review → approved|rejected → published; rejected/approved → draft 재작업 허용 */
const DOCUMENT_TRANSITIONS: Record<StudioStatus, StudioStatus[]> = {
  draft: ["review", "archived"],
  review: ["approved", "rejected", "draft"],
  approved: ["published", "draft", "archived"],
  rejected: ["draft", "archived"],
  published: ["draft", "archived"],
  archived: ["draft"],
};

export function assertDocumentTransition(from: string, to: string) {
  const current = safeStatus(from);
  const next = safeStatus(to);
  if (current === next) return next;
  const allowed = DOCUMENT_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new Error(`문서 상태 전이 불가: ${current} → ${next}`);
  }
  return next;
}
