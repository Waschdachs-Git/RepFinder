"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CATEGORY_INTRO } from '@/lib/data';
import type { CategorySlug, SortKey, Product } from '@/lib/types';
import { getFavorites } from '@/lib/utils';
import SearchFilter from '@/components/SearchFilter';
import ProductGrid from '@/components/ProductGrid';
import { useAgent } from '@/providers/AgentProvider';
import Pagination from '@/components/Pagination';
import TopProgress from '@/components/TopProgress';

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug || '') as CategorySlug;
  const intro = CATEGORY_INTRO[slug];
  const { agent } = useAgent();
  const search = useSearchParams();
  const subParam = (search?.get('sub') || '').trim();
  const subParamLower = subParam.toLowerCase();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('popularity');
  const [favOnly, setFavOnly] = useState(false);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const pageSize = 12;
  const [favTick, setFavTick] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setPage(1); }, [agent, slug, sort, query, favOnly, priceMin, priceMax, subParam]);
  useEffect(() => {
    const onFav = () => setFavTick((x) => x + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('pf:fav-changed', onFav);
      window.addEventListener('storage', onFav);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pf:fav-changed', onFav);
        window.removeEventListener('storage', onFav);
      }
    };
  }, []);
  useEffect(() => { window?.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  useEffect(() => {
    const favs = getFavorites();
    const baseParams = {
      category: slug,
      sort,
      q: query,
      page: String(page),
      pageSize: String(pageSize),
    };
    const p1 = new URLSearchParams({ ...baseParams, agent });
    if (subParam) p1.set('subcategory', subParam);
    setLoading(true);
    fetch(`/api/products?${p1.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        let items: Product[] = d.items || [];
        setTotal(d.total || 0);
        // Clientseitiger Fallback-Filter für Subcategory (zusätzlich zum Server)
        if (subParamLower) items = items.filter((p) => (p.subcategory || '').toLowerCase() === subParamLower);
  if (priceMin != null) items = items.filter((p) => (p.price ?? 0) >= priceMin);
  if (priceMax != null) items = items.filter((p) => (p.price ?? 0) <= priceMax);
  if (favOnly) items = items.filter((p: Product) => (p.id ? !!favs[p.id] : false));
        setProducts(items);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [agent, slug, sort, query, page, favOnly, priceMin, priceMax, favTick, subParamLower]);

  if (!intro) return <div className="py-10">Category not found.</div>;

  return (
    <div className="py-8">
      <TopProgress active={loading} />
      {/* Hero with subtle gradient based on agent accent color */}
      <div className="mb-6 rounded-3xl p-8" style={{
        background: 'linear-gradient(135deg, hsl(var(--accent)/0.08), hsl(var(--accent)/0.02))'
      }}>
  <h1 className="text-4xl font-semibold text-[hsl(var(--accent))]">{subParam ? `${intro.title} – ${subParam}` : intro.title}</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">{intro.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <SearchFilter
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={setSort}
          favOnly={favOnly}
          setFavOnly={setFavOnly}
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
        />
      </div>

  <p className="text-neutral-500 mb-2">{total} Produkte gefunden{subParam ? ` – Filter: ${subParam}` : ''}</p>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
              <div style={{ aspectRatio: '4 / 3', background: '#f0f0f0' }} />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                <div className="h-4 w-1/2 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        onChange={setPage}
        loading={loading}
      />
    </div>
  );
}
