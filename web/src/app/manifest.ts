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
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
