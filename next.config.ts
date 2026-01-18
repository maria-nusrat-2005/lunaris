import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Base path for GitHub Pages (repo name)
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  // Trailing slashes for clean URLs
  trailingSlash: true,
};

export default nextConfig;
