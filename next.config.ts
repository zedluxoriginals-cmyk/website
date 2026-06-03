import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats: AVIF preferred, WebP fallback, original last.
    // Cuts product/hero image weight substantially vs. the source JPEGs.
    formats: ["image/avif", "image/webp"],
    // Optimized images are derived from immutable source files in /public,
    // so a long cache TTL is safe (31 days).
    minimumCacheTTL: 2678400,
    // When images move to Cloudflare R2 (Phase 9), allowlist the host here:
    // remotePatterns: [{ protocol: "https", hostname: "assets.zedluxe.com" }],
  },
};

export default nextConfig;
