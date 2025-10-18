"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addClick, formatProductPrice, isFavorite, toggleFavorite, DETAIL_LEGAL_NOTE, AFFILIATE_DISCLAIMER, getDisplayTitle } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products?id=${id}`)
      .then(r => r.json())
      .then(d => setProduct(d.item || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
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
  <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">← Back</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="w-full rounded-3xl shadow-sm overflow-hidden" style={{ aspectRatio: '4 / 3', background: '#f6f6f6' }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
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

          {/* Klickzähler-Badge entfernt, da in Sheets-Only Modus keine lokalen Klickzahlen gemischt werden */}

          <div className="mt-6 flex items-center gap-3">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-medium transition-all bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm hover:shadow-md hover:brightness-105"
              onClick={() => { if(!product.id) return; addClick(product.id); fetch('/api/clicks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id }) }).catch(() => {}); }}
            >
              Go to shop ↗
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
