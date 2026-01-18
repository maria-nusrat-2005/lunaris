import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization for Netlify
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
