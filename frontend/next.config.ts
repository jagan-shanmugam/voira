import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  eslint: {
    // Only run ESLint on these directories during build
    dirs: ['app', 'components', 'lib', 'hooks'],
    // Don't fail build on ESLint errors in production
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
