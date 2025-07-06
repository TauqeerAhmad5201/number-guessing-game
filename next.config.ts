import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  env: {
    APP_VERSION: process.env.APP_VERSION || 'stable',
  },
};

export default nextConfig;
