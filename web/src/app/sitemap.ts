export const dynamic = 'force-static';
export const revalidate = 60;
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://repfinder.io';
  // Static routes + basic category pages; product pages are resolved via the API and can be added later
  const routes: string[] = [
    '/', '/imprint', '/privacy', '/contact',
    '/c/shoes', '/c/tops', '/c/bottoms', '/c/coats-and-jackets', '/c/full-body-clothing', '/c/headwear', '/c/accessories', '/c/jewelry', '/c/other-stuff'
  ];
  const now = new Date();
  return routes.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: 'weekly', priority: path === '/' ? 1.0 : 0.6 }));
}
