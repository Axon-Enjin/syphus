import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@gig-payout/db", "@gig-payout/stellar", "@gig-payout/anchors"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
