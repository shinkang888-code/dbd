import Image from "next/image";
import { Tag } from "lucide-react";
import { ugcPosts } from "@/lib/dummy-data";

export const metadata = { title: "#LEXILOOK" };

export default function CommunityPage() {
  const posts = [...ugcPosts, ...ugcPosts.map((p) => ({ ...p, id: p.id + "b" }))];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-[30px] font-semibold">#LEXILOOK</h1>
      <p className="mt-1 text-[13px] text-dim">전 세계 고객의 실착 순간 — 사진 속 상품을 바로 쇼핑하세요</p>
      <div className="mt-6 columns-2 gap-2 md:columns-3">
        {posts.map((post, i) => (
          <div key={post.id} className="relative mb-2 break-inside-avoid overflow-hidden rounded-xl bg-fog">
            <Image
              src={post.image}
              alt={`${post.handle}의 게시물`}
              width={500}
              height={i % 3 === 0 ? 700 : 500}
              className="w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3">
              <p className="text-[12px] font-semibold text-white">{post.handle}</p>
              <p className="flex items-center gap-1 text-[11px] text-white/80">
                <Tag className="size-3" /> 상품 {post.tags}개 태그
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
