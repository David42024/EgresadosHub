import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/trpc-contract"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
