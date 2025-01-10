import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'booktalk-media.nyc3.cdn.digitaloceanspaces.com',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
