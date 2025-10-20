/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trace from workspace root to avoid multi-lockfile warnings
  outputFileTracingRoot: process.cwd(),
  // Keep image domains/patterns in JS config so Next picks them up even if TS config exists
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'si.geilicdn.com' },
      { protocol: 'https', hostname: 'img.alicdn.com' },
      { protocol: 'https', hostname: 'ae01.alicdn.com' },
      { protocol: 'https', hostname: 'ae04.alicdn.com' },
      { protocol: 'https', hostname: 'gdp.alicdn.com' },
    ],
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

module.exports = nextConfig;
