import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AI 생성 원본으로 교체 전까지 실사 placeholder를 원격 로드한다.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
