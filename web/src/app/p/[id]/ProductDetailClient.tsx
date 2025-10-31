"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addClick, formatProductPrice, isFavorite, toggleFavorite, DETAIL_LEGAL_NOTE, AFFILIATE_DISCLAIMER, getDisplayTitle, IS_STATIC, API_BASE, USE_API } from '@/lib/utils';
import ConsentImage from '@/components/ConsentImage';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

async function loadStaticProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch('/data/products.generated.json');
    const arr: Product[] = await res.json();
    return (arr || []).find((p) => p.id === id) || null;
  } catch {
    return null;
  }
}

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const load = async () => {
      if (!USE_API && IS_STATIC) {
        const p = await loadStaticProduct(id);
        setProduct(p);
      } else {
        const r = await fetch(`${API_BASE}/api/products?id=${id}`);
        const d = await r.json();
        setProduct(d.item || null);
      }
    };
    load().catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => setFav(product && product.id ? isFavorite(product.id) : false), [product]);

  if (loading) {
    return (
      <div className="py-8 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 items-start">
          <div className="w-full rounded-3xl overflow-hidden" style={{ aspectRatio: '4 / 3', background: '#f0f0f0' }} />
          <div>
            <div className="h-8 w-3/4 bg-neutral-200 rounded mb-3" />
            <div className="h-7 w-40 bg-neutral-200 rounded mb-5" />
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full bg-neutral-200 rounded" />
              <div className="h-3 w-5/6 bg-neutral-200 rounded" />
              <div className="h-3 w-4/6 bg-neutral-200 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-48 bg-neutral-200 rounded-full" />
              <div className="h-11 w-11 bg-neutral-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-10">Product not found.</div>;

  return (
    <div className="py-8">
      <button
        type="button"
        className="text-sm text-neutral-600 hover:text-neutral-900"
        onClick={() => {
          try {
            const sameOriginRef = document.referrer && new URL(document.referrer).origin === location.origin;
            if (sameOriginRef && window.history.length > 1) {
              router.back();
              return;
            }
          } catch {}
          // Fallback: zuletzt besuchte Liste oder passende Kategorie
          try {
            const last = sessionStorage.getItem('pf:last-list-url');
            if (last) { router.push(last); return; }
          } catch {}
          const cat = product?.category ? `/c/${product.category}` : '/';
          router.push(cat);
        }}
        aria-label="Zurück"
      >
        ← Back
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 items-start">
        <div className="w-full rounded-3xl shadow-sm overflow-hidden" style={{ aspectRatio: '4 / 3', background: '#f6f6f6' }}>
          <ConsentImage
            product={product}
            src={product.image}
            srcList={Array.isArray(product.imageAlt) ? product.imageAlt : (product.imageAlt ? [product.imageAlt] : undefined)}
            alt={getDisplayTitle(product)}
            ratio={4/3}
            imgClassName="object-contain"
            priority
          />
        </div>

        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{getDisplayTitle(product)}</h1>
          <div className="text-[hsl(var(--accent))] text-3xl font-semibold mt-2">{formatProductPrice(product)}</div>
          <p className="mt-4 text-neutral-600">{product.description}</p>
          <div className="mt-3">
            <details className="rounded-lg bg-neutral-50/60 p-3 border border-neutral-200/70">
              <summary className="cursor-pointer select-none text-sm text-neutral-700">Show notices</summary>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-neutral-600">{DETAIL_LEGAL_NOTE}</p>
                <p className="text-xs text-neutral-500">{AFFILIATE_DISCLAIMER}</p>
              </div>
            </details>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-medium transition-all bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm hover:shadow-md hover:brightness-105"
              onClick={() => {
                if(!product.id) return;
                // In static mode nur lokal klicken, kein API-POST
                if (USE_API) {
                  try {
                    addClick(product.id);
                    fetch(`${API_BASE}/api/clicks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id }) }).catch(() => {});
                  } catch {}
                } else if (!IS_STATIC) {
                  try {
                    addClick(product.id);
                    fetch('/api/clicks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id }) }).catch(() => {});
                  } catch {}
                } else {
                  try { addClick(product.id); } catch {}
                }
              }}
            >
              Go to shop →
            </a>
            <button className="inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-medium transition-all border border-neutral-200 bg-white hover:bg-neutral-50" onClick={() => { if(!product.id) return; toggleFavorite(product.id); setFav(isFavorite(product.id)); }}>
              {fav ? '❤' : '♡'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
