import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.vercel.com",
      },
      {
        protocol: "https",
        hostname: "nextjs.org",
      },
      {
        protocol: "https",
        hostname: "www.apple.com",
      },
      {
        protocol: "https",
        hostname: "vercel.com",
      },
    ],
  },
};

export default nextConfig;
