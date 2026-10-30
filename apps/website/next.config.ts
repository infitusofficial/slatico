import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true
  },
  transpilePackages: ["@slatico/core", "@slatico/react", "@slatico/svg", "@slatico/web"]
};

export default nextConfig;
