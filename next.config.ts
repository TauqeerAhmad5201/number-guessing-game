import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  // Remove env config to allow runtime environment variables
};

export default nextConfig;
