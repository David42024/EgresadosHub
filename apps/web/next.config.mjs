/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/trpc-contract"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const apiHost = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';
    return [
      {
        source: '/storage/:path*',
        destination: `${apiHost}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
