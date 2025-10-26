export const dynamic = 'force-static';
export const revalidate = 60;
import type { MetadataRoute } from 'next';
import { loadAllProducts } from '@/lib/productSource';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://repfinder.io';
  // Static routes + categories
  const routes: string[] = [
    '/', '/imprint', '/privacy', '/contact', '/coupons',
    '/c/shoes', '/c/tops', '/c/bottoms', '/c/coats-and-jackets', '/c/full-body-clothing', '/c/headwear', '/c/accessories', '/c/jewelry', '/c/other-stuff'
  ];
  const now = new Date();
  const baseEntries: MetadataRoute.Sitemap = routes.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: 'weekly', priority: path === '/' ? 1.0 : 0.6 }));

  // Append product pages (best-effort)
  try {
    const { items } = await loadAllProducts();
    const productEntries: MetadataRoute.Sitemap = (items || [])
      .filter((p) => p && p.id)
      .slice(0, 10000)
      .map((p) => ({
        url: `${base}/p/${encodeURIComponent(String(p.id))}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    return [...baseEntries, ...productEntries];
  } catch {
    return baseEntries;
  }
}
