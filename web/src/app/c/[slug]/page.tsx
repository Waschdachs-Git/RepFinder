import { CATEGORIES, CATEGORY_INTRO } from '@/lib/data';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import type { CategorySlug } from '@/lib/types';
import CategoryClient from './CategoryClient';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="py-10">Laden…</div>}>
      <CategoryClient key={slug} slug={slug} />
    </Suspense>
  );
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://repfinder.io';
  const cat = CATEGORY_INTRO[(slug as CategorySlug)];
  const sub = typeof sp.sub === 'string' ? sp.sub : undefined;
  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const page = typeof sp.page === 'string' ? sp.page : undefined;

  const titleBase = cat ? cat.title : slug;
  const title = sub
    ? `${sub} – rep ${titleBase.toLowerCase()} finder | RepFinder`
    : `Rep ${titleBase.toLowerCase()} finder – ${titleBase} on CNFans, iTaobuy, Superbuy | RepFinder`;

  const descBase = cat?.subtitle || 'Browse replica products from top agents.';
  const description = sub
    ? `${sub} in ${titleBase}: ${descBase} Compare CNFans, iTaobuy, Superbuy, MuleBuy and AllChinaBuy. Better than spreadsheets.`
    : `${titleBase}: ${descBase} Compare CNFans, iTaobuy, Superbuy, MuleBuy and AllChinaBuy. Filter by price, favorites and popularity.`;

  // Canonical inkl. sub/page wenn vorhanden
  const url = new URL(`${base}/c/${encodeURIComponent(slug)}`);
  if (sub) url.searchParams.set('sub', sub);
  if (page) url.searchParams.set('page', page);

  const noindex = !!q; // Suchseiten nicht indexieren

  return {
    title,
    description,
    alternates: { canonical: url.toString() },
    openGraph: {
      type: 'website',
      url: url.toString(),
      title,
      description,
      siteName: 'RepFinder',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'RepFinder' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    robots: {
      index: !noindex,
      follow: true,
    },
  };
}
