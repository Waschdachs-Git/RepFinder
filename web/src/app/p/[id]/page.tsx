import fs from 'node:fs';
import path from 'node:path';
import type { Product } from '@/lib/types';
import type { Metadata } from 'next';
import { loadAllProducts } from '@/lib/productSource';
import { getDisplayTitle } from '@/lib/utils';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Optional: JSON-LD Product & Breadcrumb serverseitig einfügen
  let jsonLd: string | null = null;
  let breadcrumbLd: string | null = null;
  try {
    const { items } = await loadAllProducts();
    const p = items.find((x) => x.id === id);
    if (p) {
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://repfinder.io';
      const title = getDisplayTitle(p as Product);
      const image = (p.image || '').startsWith('http') ? p.image : `${base}${p.image || '/og-image.png'}`;
      type OfferLd = {
        '@type': 'Offer';
        url: string;
        price?: string;
        priceCurrency?: string;
      };
      const offer: OfferLd = {
        '@type': 'Offer',
        url: p.affiliateUrl || `${base}/p/${id}`,
      };
      if (p.price != null) offer.price = String(p.price);
      if (p.currency) offer.priceCurrency = p.currency;
      const prodLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description: p.description || undefined,
        image: [image],
        brand: { '@type': 'Brand', name: 'Inspired style' },
        offers: offer,
      };
      jsonLd = JSON.stringify(prodLd);
      type CrumbItem = { '@type': 'ListItem'; position: number; name: string; item: string };
      type BreadcrumbLd = {
        '@context': 'https://schema.org';
        '@type': 'BreadcrumbList';
        itemListElement: CrumbItem[];
      };
      const itemListElement: CrumbItem[] = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
      ];
      if (p.category) {
        itemListElement.push({ '@type': 'ListItem', position: 2, name: String(p.category), item: `${base}/c/${p.category}` });
      }
      itemListElement.push({ '@type': 'ListItem', position: 3, name: title, item: `${base}/p/${id}` });
      const crumb: BreadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement,
      };
      breadcrumbLd = JSON.stringify(crumb);
    }
  } catch {}
  return (
    <>
      {jsonLd && (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />)}
      {breadcrumbLd && (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />)}
      <ProductDetailClient id={id} />
    </>
  );
}

export async function generateStaticParams() {
  // Bei Static Export: IDs aus der generierten JSON lesen, damit /p/[id] Seiten gebaut werden
  const file = path.join(process.cwd(), 'public', 'data', 'products.generated.json');
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const arr: Product[] = JSON.parse(raw);
    return arr
      .filter((p) => p && p.id && String(p.id).trim().length > 0)
      .slice(0, 5000)
      .map((p) => ({ id: String(p.id) }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://repfinder.io';
  try {
    const { items } = await loadAllProducts();
    const p = items.find((x) => x.id === id) as Product | undefined;
    if (!p) {
      return {
        title: 'Product not found | RepFinder',
        description: 'This product could not be found.',
        alternates: { canonical: `${base}/p/${id}` },
        robots: { index: false, follow: true },
      };
    }
    const title = `${getDisplayTitle(p)} | RepFinder`;
    const description = (p.description && p.description.length > 30)
      ? (p.description.length > 160 ? p.description.slice(0, 157) + '…' : p.description)
      : `View details, price and images, and shop via your preferred agent. Compare CNFans, iTaobuy, Superbuy, MuleBuy and AllChinaBuy.`;
    const image = (p.image || '').startsWith('http') ? p.image : `${base}${p.image || '/og-image.png'}`;
    return {
      title,
      description,
      alternates: { canonical: `${base}/p/${id}` },
      openGraph: {
        type: 'website',
        url: `${base}/p/${id}`,
        title,
        description,
        images: [{ url: image, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'Product | RepFinder',
      alternates: { canonical: `${base}/p/${id}` },
    };
  }
}
