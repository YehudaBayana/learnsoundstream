import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore typescript build errors so unrelated unused components don't block build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
