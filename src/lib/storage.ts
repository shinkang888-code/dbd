import { supabase } from "@/integrations/supabase/client";

export type Bucket = "attachments" | "gallery" | "banners";

/** Uploads a file and returns a public URL (buckets are public). */
export async function uploadFile(bucket: Bucket, file: File, prefix = "") {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (up.error) {
    const msg = up.error.message || "업로드 실패";
    if (/bucket|not found|does not exist/i.test(msg)) {
      throw new Error(
        "스토리지 버킷이 아직 없습니다. Supabase에 attachments/gallery/banners 버킷을 생성해 주세요.",
      );
    }
    throw up.error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl, name: file.name };
}
