import { CATEGORIES } from '@/lib/data';
import { Suspense } from 'react';
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
