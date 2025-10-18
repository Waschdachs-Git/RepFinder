"use client";

import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { CATEGORIES, SHOPS, SUBCATEGORIES } from '@/lib/data';
import { useAgent } from '@/providers/AgentProvider';

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export default function Header() {
  const { agent, setAgent } = useAgent();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'light';
    try { return (localStorage.getItem('pf:theme') as 'light'|'dark') || 'light'; } catch { return 'light'; }
  });
  const hoverTimer = useRef<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // apply theme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('pf:theme', theme); } catch {}
  }, [theme]);

  // Sperrt Body-Scroll, wenn ein Overlay geöffnet ist
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    if (open || menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev || '';
    return () => { document.body.style.overflow = prev || ''; };
  }, [open, menuOpen]);

  const currentShop = useMemo(() => SHOPS[agent], [agent]);

  return (
    <header className={classNames('sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-neutral-100 transition-all duration-300', scrolled && 'py-2')}>
      <div className="px-4 sm:px-6 lg:px-8 mx-auto flex items-center gap-4 py-3">{/* left */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight text-lg leading-tight">
            RepFinder
            {pathname === '/' && (
              <span className="block text-[11px] font-normal text-neutral-500">Find the best reps. Fast.</span>
            )}
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all border border-neutral-200 bg-white hover:bg-neutral-50 text-sm"
            onClick={() => setOpen(true)}
            aria-label="Switch agent"
          >
            <span className="inline-flex h-2 w-2 rounded-full mr-2" style={{ backgroundColor: `hsl(${currentShop.accentHsl})` }} />
            {currentShop.name}
          </button>
        </div>

        {/* center */}
  <nav className="mx-auto hidden md:flex items-center gap-6 text-sm">
          {CATEGORIES.map((c) => {
            const href = `/c/${c.slug}`;
            const active = pathname?.startsWith(href);
            return (
              <div
                key={c.slug}
                className="relative"
                onMouseEnter={() => {
                  if (hoverTimer.current) clearTimeout(hoverTimer.current);
                  setHoverCat(c.slug);
                }}
                onMouseLeave={() => {
                  if (hoverTimer.current) clearTimeout(hoverTimer.current);
                  hoverTimer.current = setTimeout(() => setHoverCat((curr) => (curr === c.slug ? null : curr)), 120);
                }}
              >
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className="inline-flex flex-col items-center py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <span>{c.label}</span>
                  <span
                    className={`mt-1 h-0.5 bg-[hsl(var(--accent))] transition-all duration-200 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}
                  />
                </Link>
                {SUBCATEGORIES[c.slug] && SUBCATEGORIES[c.slug].length > 0 && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-xl border border-neutral-200 bg-white shadow-lg p-2 z-[52] transition-opacity duration-150 ${hoverCat === c.slug ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  >
                    <div className="grid grid-cols-1 gap-1">
                      {SUBCATEGORIES[c.slug].map((s) => {
                        const subHref = s.href || `${href}?sub=${encodeURIComponent(s.label)}`;
                        return (
                          <Link key={s.label} href={subHref} className="rounded-lg px-3 py-2 text-neutral-700 hover:bg-neutral-50">
                            {s.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* right */}
        <div className="ml-auto flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-3 py-2 text-sm"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button className="hidden md:inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm hover:shadow-md hover:brightness-105" onClick={() => setOpen(true)}>Switch agent</button>
          <button className="md:hidden inline-flex items-center justify-center rounded-full border border-neutral-200 px-3 py-2 text-sm" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button>
        </div>
      </div>
      {/* Mobile Kategorien sind bewusst ausgeblendet; Zugriff nur über das Burger-Menü */}
            {/* Mobile burger menu overlay (Portal auf document.body, damit der Body abgedunkelt wird) */}
            {menuOpen && typeof window !== 'undefined' && createPortal(
              <div className="fixed inset-0 z-[55] bg-black/50" onClick={() => setMenuOpen(false)} role="dialog" aria-modal="true" aria-label="Menu">
                <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Menu</span>
                    <button className="text-neutral-500 hover:text-neutral-800" onClick={() => setMenuOpen(false)}>×</button>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {CATEGORIES.map((c) => (
                      <Link key={c.slug} href={`/c/${c.slug}`} className="rounded-xl border border-neutral-200 px-4 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setMenuOpen(false)}>
                        {c.label}
                      </Link>
                    ))}
                    <hr className="my-3" />
                    <button className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm border border-neutral-200 bg-white hover:bg-neutral-50" onClick={() => { setMenuOpen(false); setOpen(true); }}>Switch agent</button>
                  </nav>
                </div>
              </div>,
              document.body
            )}

      {/* Agent switcher modal */}
      {open && typeof window !== 'undefined' && createPortal(
  <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Switch agent">
          {/* Desktop: zentrierter Dialog */}
          <div className="hidden md:grid place-items-center h-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-sm p-4 rounded-2xl border border-neutral-100 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Choose agent</h3>
                <button className="text-neutral-500 hover:text-neutral-800" onClick={() => setOpen(false)}>×</button>
              </div>
              <div className="space-y-3">
                {Object.values(SHOPS).map((s) => (
                  <button
                    key={s.key}
                    className={classNames('w-full inline-flex items-center justify-between rounded-xl px-4 py-3 border border-neutral-200 bg-white hover:bg-neutral-50', agent === s.key && 'ring-1 ring-[hsl(var(--accent))] bg-[hsl(var(--accent))/0.06]')}
                    onClick={() => { setAgent(s.key); setOpen(false); router.push('/'); }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${s.accentHsl})` }} />
                      {s.name}
                    </span>
                    {agent === s.key && <span className="text-[hsl(var(--accent))]">●</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Mobile: Bottom Sheet */}
          <div className="md:hidden fixed inset-x-0 bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto w-full max-w-md rounded-t-2xl border border-neutral-100 bg-white shadow-lg p-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
              <h3 className="text-base font-medium mb-3">Choose agent</h3>
              <div className="space-y-3">
                {Object.values(SHOPS).map((s) => (
                  <button
                    key={s.key}
                    className={classNames('w-full inline-flex items-center justify-between rounded-xl px-4 py-3 border border-neutral-200 bg-white hover:bg-neutral-50', agent === s.key && 'ring-1 ring-[hsl(var(--accent))] bg-[hsl(var(--accent))/0.06]')}
                    onClick={() => { setAgent(s.key); setOpen(false); router.push('/'); }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${s.accentHsl})` }} />
                      {s.name}
                    </span>
                    {agent === s.key && <span className="text-[hsl(var(--accent))]">●</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
