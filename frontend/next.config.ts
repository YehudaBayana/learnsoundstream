import type { NextConfig } from "next";

// Single source of truth: the repo-root .env (absent on Vercel, which injects env vars itself).
try {
  process.loadEnvFile(`${__dirname}/../.env`);
} catch {}

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");
    if (!backendUrl) return [];
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/health", destination: `${backendUrl}/health` },
    ];
  },
};

export default nextConfig;
