import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@syphus/db", "@syphus/stellar", "@syphus/anchors"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
