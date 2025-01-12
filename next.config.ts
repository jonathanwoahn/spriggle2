import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // metadataBase: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
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
