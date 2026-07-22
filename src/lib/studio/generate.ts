import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { generationJobs } from "@/db/schema";
import { getCafe24ProductBySlug, listCafe24Products } from "@/lib/cafe24/catalog";
import { createDocument, updateJob } from "./store";

export async function processGenerationJob(jobId: number, actor: string) {
  if (!hasDb()) throw new Error("DATABASE_URL required");
  const [job] = await db()
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.id, jobId))
    .limit(1);
  if (!job) throw new Error("job not found");
  if (!["queued", "failed"].includes(job.status)) throw new Error("job is not processable");

  await updateJob(jobId, { status: "processing" });
  try {
    const input = job.input as {
      title?: string;
      brief?: string;
      imageUrls?: string[];
      locale?: string;
    };
    let product:
      | {
          name: string;
          brand: string;
          price: number;
          image: string;
          cafe24ProductNo: number;
        }
      | undefined;
    if (job.cafe24ProductNo) {
      const items = await listCafe24Products();
      product = items?.find((p) => p.cafe24ProductNo === job.cafe24ProductNo);
      if (!product) product = await getCafe24ProductBySlug(`c24-${job.cafe24ProductNo}`);
    }

    const title = input.title || product?.name || `콘텐츠 작업 #${job.id}`;
    const brief = input.brief || "정품 신뢰, 사용 장면, 핵심 효익을 짧고 명확하게 전달";
    const images = input.imageUrls?.length
      ? input.imageUrls
      : product?.image
        ? [product.image]
        : [];
    let output = buildOutput(job.kind, {
      title,
      brief,
      brand: product?.brand || "LEXI",
      price: product?.price,
      images,
    });

    if (job.kind === "video" || job.kind === "storyboard") {
      output = await maybeRenderWithRemotion(output, {
        title,
        brand: product?.brand || "LEXI",
        images,
      });
    }

    let documentId = job.documentId ?? undefined;
    if (job.kind === "pdp" && !documentId) {
      const document = await createDocument({
        kind: "pdp",
        title,
        locale: input.locale ?? "ko",
        cafe24ProductNo: job.cafe24ProductNo ?? undefined,
        body: output,
        renderedHtml: String(output.renderedHtml ?? ""),
        actor,
      });
      documentId = document.id;
      await db()
        .update(generationJobs)
        .set({ documentId })
        .where(eq(generationJobs.id, job.id));
    }

    const completed = await updateJob(jobId, {
      status: "completed",
      output: {
        ...output,
        model: "lexi-studio-deterministic-v1",
        costUsd: 0,
      },
    });
    return { job: completed, documentId };
  } catch (error) {
    await updateJob(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : "generation failed",
    });
    throw error;
  }
}

/**
 * Remotion 워커(REMOTION_WORKER_URL)가 있으면 렌더 요청.
 * 없으면 D-006 기본값: storyboard preview 유지.
 */
async function maybeRenderWithRemotion(
  output: Record<string, unknown>,
  ctx: { title: string; brand: string; images: string[] },
): Promise<Record<string, unknown>> {
  const worker = process.env.REMOTION_WORKER_URL?.trim();
  if (!worker) {
    return { ...output, status: "storyboard_ready", remotion: "preview" };
  }
  try {
    const scenes = Array.isArray(output.scenes) ? output.scenes : [];
    const res = await fetch(new URL("/render", worker).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: ctx.brand,
        images: ctx.images,
        scenes: scenes.map((s, i) => {
          const scene = s as { duration?: number; text?: string; image?: string };
          return {
            duration: scene.duration ?? 4,
            imageIndex: Math.min(i, Math.max(ctx.images.length - 1, 0)),
            overlayText: scene.text ?? ctx.title,
          };
        }),
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`Remotion worker ${res.status}`);
    const data = (await res.json()) as { url?: string; path?: string };
    return {
      ...output,
      status: "video_ready",
      remotion: "rendered",
      videoUrl: data.url ?? data.path ?? null,
    };
  } catch (error) {
    return {
      ...output,
      status: "storyboard_ready",
      remotion: "preview",
      remotionError: error instanceof Error ? error.message : "render failed",
    };
  }
}

function buildOutput(
  kind: string,
  input: {
    title: string;
    brief: string;
    brand: string;
    price?: number;
    images: string[];
  },
): Record<string, unknown> {
  const headline = `${input.title}, 일상에 자연스럽게`;
  if (kind === "storyboard" || kind === "video") {
    return {
      format: "9:16",
      duration: 15,
      renderer: "remotion",
      scenes: [
        { duration: 4, image: input.images[0] ?? "", text: input.title.slice(0, 15) },
        { duration: 4, image: input.images[1] ?? input.images[0] ?? "", text: "직접 고른 K-스타일" },
        { duration: 4, image: input.images[2] ?? input.images[0] ?? "", text: input.brief.slice(0, 15) },
        { duration: 3, image: input.images[0] ?? "", text: "LEXI에서 만나보세요" },
      ],
      status: "storyboard_ready",
    };
  }
  if (kind === "image" || kind === "cardnews") {
    return {
      ratio: kind === "cardnews" ? "4:5" : "1:1",
      headline,
      slides: [
        { role: "hook", title: headline, image: input.images[0] ?? "" },
        { role: "benefit", title: input.brief, image: input.images[1] ?? input.images[0] ?? "" },
        { role: "cta", title: "지금 LEXI에서", image: input.images[2] ?? input.images[0] ?? "" },
      ],
    };
  }
  if (kind === "copy") {
    return {
      headline,
      body: input.brief,
      cta: "상품 자세히 보기",
      variants: [
        `${input.brand}가 제안하는 ${input.title}`,
        `매일 손이 가는 ${input.title}`,
        `${input.title}, 지금 필요한 이유`,
      ],
    };
  }
  const imageBlocks = input.images
    .map((url, index) => `<img src="${escapeAttr(url)}" alt="${escapeAttr(input.title)} ${index + 1}" />`)
    .join("");
  return {
    headline,
    description: input.brief,
    sections: [
      { type: "hero", headline, image: input.images[0] ?? "" },
      { type: "benefit", headline: "선택의 이유", body: input.brief },
      { type: "gallery", images: input.images },
      { type: "trust", body: "정품 소싱 · 검수 · 배송 정보를 투명하게 제공합니다." },
    ],
    renderedHtml: `<article class="lexi-pdp"><h2>${escapeHtml(headline)}</h2><p>${escapeHtml(input.brief)}</p>${imageBlocks}<aside>정품 소싱 · 검수 · 배송 정보 제공</aside></article>`,
  };
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
