import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages
  images: {
    unoptimized: true,
  },
};

export default nextConfig;