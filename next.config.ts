import type { NextConfig } from "next";
import { API_PREFIXES, GATEWAY_URL, serviceUrl } from "./src/lib/backendRoutes";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // 브라우저의 /api/* 요청을 BE로 넘긴다. 같은 출처가 되어 인증 쿠키를 그대로 쓸 수 있다.
  // API_BASE_URL(나중에 Gateway)이 있으면 전부 그곳으로, 없으면 서비스별 주소로 (src/lib/backendRoutes.ts)
  async rewrites() {
  if (GATEWAY_URL) {
    return [{ source: "/api/:path*", destination: `${GATEWAY_URL}/api/:path*` }];
  }
  return API_PREFIXES.map(([prefix, service]) => ({
    source: `${prefix}/:path*`,
    destination: `${serviceUrl(service)}${prefix}/:path*`,
   }));
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
