import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    AWS_LAMBDA: process.env.AWS_LAMBDA,
  },
  images: {
    domains: ['plottwist-images.s3.amazonaws.com'],
  }
}

export default nextConfig;
