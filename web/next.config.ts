import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // For strict patterns
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      // Common agent/CDN hosts
      { protocol: 'https', hostname: 'si.geilicdn.com' },
      { protocol: 'https', hostname: 'img.alicdn.com' },
      { protocol: 'https', hostname: 'ae01.alicdn.com' },
      { protocol: 'https', hostname: 'ae04.alicdn.com' },
      { protocol: 'https', hostname: 'gdp.alicdn.com' },
    ],
    // For broader compatibility across Next versions
    domains: [
      'images.unsplash.com',
      'picsum.photos',
      'si.geilicdn.com',
      'img.alicdn.com',
      'ae01.alicdn.com',
      'ae04.alicdn.com',
      'gdp.alicdn.com',
    ],
  },
};

export default nextConfig;
