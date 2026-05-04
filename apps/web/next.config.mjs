/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/trpc-contract"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
