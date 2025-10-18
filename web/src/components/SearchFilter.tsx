"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { SortKey } from '@/lib/types';
import { useAgent } from '@/providers/AgentProvider';

export default function SearchFilter(props: {
  query: string;
  setQuery: (v: string) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  favOnly: boolean;
  setFavOnly: (v: boolean) => void;
  priceMin?: number | null;
  setPriceMin?: (v: number | null) => void;
  priceMax?: number | null;
  setPriceMax?: (v: number | null) => void;
}) {
  const { agent } = useAgent();
  const [open, setOpen] = useState(false);
  const [suggests, setSuggests] = useState<{ id: string; name: string }[]>([]);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions (debounced)
  useEffect(() => {
    const q = props.query.trim();
    if (!q) { setSuggests([]); setOpen(false); return; }
    const t = setTimeout(() => {
      const p = new URLSearchParams({ q, agent });
      fetch(`/api/suggest?${p}`)
        .then(r => r.json())
        .then(d => { setSuggests(d.items || []); setOpen((d.items || []).length > 0); setHighlight(0); })
        .catch(() => { setSuggests([]); setOpen(false); });
    }, 150);
    return () => clearTimeout(t);
  }, [props.query, agent]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
      <div className="relative flex-1" ref={boxRef}>
        <input
          value={props.query}
          onChange={(e) => props.setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (!open || suggests.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(suggests.length - 1, h + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(0, h - 1)); }
            if (e.key === 'Enter') {
              e.preventDefault();
              const pick = suggests[highlight];
              if (pick) { props.setQuery(pick.name); setOpen(false); }
            }
            if (e.key === 'Escape') { setOpen(false); }
          }}
          placeholder="Search products..."
          className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))/30] bg-white text-neutral-900 placeholder:text-neutral-400"
        />
        {open && suggests.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-10">
            {suggests.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`w-full text-left px-4 py-2 text-sm ${i === highlight ? 'bg-neutral-50' : ''}`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => { props.setQuery(s.name); setOpen(false); }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={props.priceMin ?? ''}
          onChange={(e) => props.setPriceMin && props.setPriceMin(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="Min €"
          className="w-28 rounded-xl border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))/30] bg-white text-neutral-900 placeholder:text-neutral-400"
        />
        <span className="text-neutral-400">–</span>
        <input
          type="number"
          min={0}
          value={props.priceMax ?? ''}
          onChange={(e) => props.setPriceMax && props.setPriceMax(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="Max €"
          className="w-28 rounded-xl border border-neutral-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))/30] bg-white text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      <div>
        <select
          value={props.sort}
          onChange={(e) => props.setSort(e.target.value as SortKey)}
          className="rounded-xl border border-neutral-200 px-4 py-2.5 bg-white text-neutral-900"
        >
          <option value="popularity">Popularity</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name-asc">Name: A–Z</option>
        </select>
      </div>

      <button
        className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all border border-neutral-200 bg-white hover:bg-neutral-50"
        onClick={() => props.setFavOnly(!props.favOnly)}
      >
        {props.favOnly ? 'Favorites ✓' : 'Favorites'}
      </button>
    </div>
  );
}
