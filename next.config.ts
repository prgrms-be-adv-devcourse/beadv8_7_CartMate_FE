import type { NextConfig } from "next";
import { apiRewrites } from "./src/api/services";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // 브라우저의 /api/* 요청을 경로 접두어별로 BE 서비스에 넘긴다. 같은 출처가 되어 인증 쿠키를 그대로 쓸 수 있다.
  // 서비스 표 · 주소 환경변수(<서비스>_SERVICE_URL, API_BASE_URL)는 src/api/services.ts
  async rewrites() {
    return apiRewrites();
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
