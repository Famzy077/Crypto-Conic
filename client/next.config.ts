import type { NextConfig } from "next";

const nextConfig: NextConfig = { 
  images: {
    remotePatterns: [
      {
          protocol: 'https',
          hostname: 'coin-images.coingecko.com',
          port: '',
          pathname: '/coins/images/**',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
