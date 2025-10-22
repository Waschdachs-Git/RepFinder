import fs from 'node:fs';
import path from 'node:path';
import type { Product } from '@/lib/types';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
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
