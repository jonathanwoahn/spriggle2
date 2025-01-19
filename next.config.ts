import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // metadataBase: process.env.VERCEgit addL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
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
      {
        protocol: 'https',
        hostname: 'omnibk.ai',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
