import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats: AVIF preferred, WebP fallback, original last.
    // Cuts product/hero image weight substantially vs. the source JPEGs.
    formats: ["image/avif", "image/webp"],
    // Optimized images are derived from immutable source files in /public,
    // so a long cache TTL is safe (31 days).
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Deferred scale-up host if/when Cloudflare R2 replaces Cloudinary.
      { protocol: "https", hostname: "assets.zedluxe.com" },
    ],
  },
};

export default nextConfig;
