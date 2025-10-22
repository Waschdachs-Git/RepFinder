export const dynamic = 'force-static';
export const revalidate = 60;
import type { NextRequest } from 'next/server';
import { loadAllProducts } from '@/lib/productSource';

export async function GET(req: NextRequest) {
  // In Static Export mode, this endpoint is disabled and returns an empty list
  if (process.env.STATIC_EXPORT === 'true') {
    return Response.json({ items: [] });
  }
  const url = new URL(req.url);
  const { searchParams } = url;
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const agent = (searchParams.get('agent') || '').trim();
  if (!q) return Response.json({ items: [] });
  const { items } = await loadAllProducts();
  const pool = agent ? items.filter(p => p.agent === agent) : items;
  const matched = pool.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
  return Response.json({ items: matched.map(p => ({ id: p.id, name: p.name })) });
}
