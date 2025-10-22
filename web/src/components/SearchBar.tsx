"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/providers/AgentProvider';
import { IS_STATIC, API_BASE, USE_API } from '@/lib/utils';

export default function SearchBar({
  query,
  setQuery,
  onSubmit,
  placeholder = 'Search for Samba, Yeezy, jacket…',
}: {
  query: string;
  setQuery: (v: string) => void;
  onSubmit: (q: string) => void;
  placeholder?: string;
}) {
  const { agent } = useAgent();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [suggests, setSuggests] = useState<{ id: string; name: string }[]>([]);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  type BasicItem = { id: string; name: string };
  const allForSuggestRef = useRef<BasicItem[] | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setSuggests([]); setOpen(false); return; }
    const t = setTimeout(async () => {
  if (!USE_API && IS_STATIC) {
        // Lazy-load once
        if (!allForSuggestRef.current) {
          try {
            const arr = await fetch('/data/products.generated.json').then(r => r.json() as Promise<Array<{ id?: string; name?: string }>>);
            allForSuggestRef.current = (Array.isArray(arr) ? arr : []).map((p) => ({ id: String(p.id || ''), name: String(p.name || '') }));
          } catch { allForSuggestRef.current = []; }
        }
        const pool = (allForSuggestRef.current || []).filter(x => x.id && x.name);
        const ql = q.toLowerCase();
        const matched = pool.filter(p => p.name.toLowerCase().includes(ql)).slice(0, 8);
        setSuggests(matched);
        setOpen(matched.length > 0);
        setHighlight(0);
      } else {
        const p = new URLSearchParams({ q, agent });
        const base = API_BASE; // empty string = same origin
        fetch(`${base}/api/suggest?${p}`)
          .then(r => r.json())
          .then(d => { setSuggests(d.items || []); setOpen((d.items || []).length > 0); setHighlight(0); })
          .catch(() => { setSuggests([]); setOpen(false); });
      }
    }, 150);
    return () => clearTimeout(t);
  }, [query, agent]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full max-w-2xl mx-auto">
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(query.trim()); setOpen(false); }}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[hsl(var(--accent))/30]"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (!open || suggests.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(suggests.length - 1, h + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(0, h - 1)); }
            if (e.key === 'Enter') {
              e.preventDefault();
              const pick = suggests[highlight];
              if (pick) {
                setQuery(pick.name);
                setOpen(false);
                // Direkte Navigation zur Produktdetailseite
                router.push(`/p/${pick.id}`);
              } else {
                onSubmit(query.trim());
              }
            }
            if (e.key === 'Escape') { setOpen(false); }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[15px] py-2"
        />
  <button type="submit" className="rounded-full px-4 py-2 text-sm bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105">Search</button>
      </form>
      {open && suggests.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-10">
          {suggests.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`w-full text-left px-4 py-2 text-sm ${i === highlight ? 'bg-neutral-50' : ''}`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => { setQuery(s.name); setOpen(false); router.push(`/p/${s.id}`); }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
