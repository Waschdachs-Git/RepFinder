export const dynamic = 'force-static';
export const revalidate = 60;
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RepFinder',
    short_name: 'RepFinder',
  description: 'RepFinder helps users find rep products from iTaobuy, CNFans, Superbuy, MuleBuy and AllChinaBuy quickly and safely.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      // Prefer PNG app icons for PWA installs; the same /logo.png can be used if you don't have separate sizes yet
      { src: '/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png' },
      // Fallbacks
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
