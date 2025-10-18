import { NextRequest } from 'next/server';
import { PRODUCTS } from '@/lib/data';
import { AgentKey, CategorySlug, SortKey } from '@/lib/types';
import fs from 'node:fs';
import path from 'node:path';
import { loadAllProducts } from '@/lib/productSource';
import { getDisplayTitle, detectBrandTerm } from '@/lib/utils';

type ProductDTO = typeof PRODUCTS[number];

async function loadAll(): Promise<{ items: ProductDTO[]; mode: string }> {
  const { items, mode } = await loadAllProducts();
  return { items: items as unknown as ProductDTO[], mode };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  const agent = (searchParams.get('agent') || '') as AgentKey | '';
  const category = (searchParams.get('category') || '') as CategorySlug | '';
  const subcategory = (searchParams.get('subcategory') || searchParams.get('sub') || '').toLowerCase();
  const q = (searchParams.get('q') || '').toLowerCase();
  const sort = (searchParams.get('sort') || 'popularity') as SortKey;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(60, Math.max(1, parseInt(searchParams.get('pageSize') || '24', 10)));

  const resAll = await loadAll();
  let list = resAll.items;
  // Merge server-side click counters if present
  try {
    const clickFile = path.join(process.cwd(), '.data-clicks.json');
    if (fs.existsSync(clickFile)) {
      const map = JSON.parse(fs.readFileSync(clickFile, 'utf8')) as Record<string, number>;
  list = list.map(p => ({ ...p, clicks: (p.clicks || 0) + (p.id ? (map[p.id] || 0) : 0) }));
    }
  } catch {}
  if (id) {
    const item = list.find((p) => p.id === id);
    return new Response(JSON.stringify({ item: item || null }), {
      headers: {
        'x-products-source': resAll.mode,
        'content-type': 'application/json',
      },
    });
  }
  if (agent) list = list.filter((p) => p.agent === agent);
  if (category) list = list.filter((p) => p.category === category);
  if (subcategory) list = list.filter((p) => (p.subcategory || '').toLowerCase() === subcategory);
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter((p) => {
      const nameHit = p.name.toLowerCase().includes(ql);
      const disp = getDisplayTitle(p).toLowerCase();
      const dispHit = disp.includes(ql);
      // einfache Brand-Erkennung: wenn Query eine Marke ist, lassen wir Treffer auch über Originalname gelten
      const brand = detectBrandTerm(p.name) || '';
      const brandHit = brand ? ql.includes(brand) || brand.includes(ql) : false;
      return nameHit || dispHit || brandHit;
    });
  }

  // Note: no A–Z filter here; only sorting handled below

  if (sort === 'price-asc') list = list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  else if (sort === 'price-desc') list = list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  else if (sort === 'name-asc') {
    const norm = (s: string) => (s || '')
      .trim()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
    list = list.sort((a, b) => norm(a.name).localeCompare(norm(b.name)));
  }
  else {
    // popularity: use provided clicks field
    list = list.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);

  return new Response(JSON.stringify({ items, total, page, pageSize }), {
    headers: {
      'x-products-source': resAll.mode,
      'x-products-total-before': String(list.length),
      'content-type': 'application/json',
      // public cache for a short time; adjust as needed in production
      'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
