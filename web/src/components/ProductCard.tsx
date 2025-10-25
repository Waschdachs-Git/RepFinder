"use client";

import Link from 'next/link';
import { Product } from '@/lib/types';
import { addClick, formatProductPrice, isFavorite, toggleFavorite, getDisplayTitle, CARD_LEGAL_NOTE, AFFILIATE_DISCLAIMER } from '@/lib/utils';
import ConsentImage from './ConsentImage';
import { useEffect, useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const [fav, setFav] = useState(false);
  // Dynamische Ratio: startet bei 4/3 und passt sich dem geladenen Bild an
  const [ratio] = useState<number>(4 / 3);
  // Slideshow Index für mehrere Alt-Bilder
  const [altIdx, setAltIdx] = useState(0);

  useEffect(() => {
  if (product.id) setFav(isFavorite(product.id));
  }, [product.id]);

  const onFav = () => {
  if (!product.id) return;
  toggleFavorite(product.id);
  setFav(isFavorite(product.id));
  };

  // Fallbacks gegen leere Strings
  const pid =
    product.id && String(product.id).trim().length > 0
      ? product.id
      : encodeURIComponent(
          `${product.agent}-${product.name}`.toLowerCase().replace(/\s+/g, '-').slice(0, 64)
        );

  const hasAffiliate = !!(product.affiliateUrl && product.affiliateUrl.trim().length > 0);
  const safeAffiliateUrl = hasAffiliate ? product.affiliateUrl : undefined;
  const imageSrc =
    product.image && product.image.trim().length > 0 ? product.image : '/placeholder.png';
  const altList = Array.isArray(product.imageAlt)
    ? product.imageAlt.filter(Boolean)
    : (product.imageAlt ? [product.imageAlt] : []);
  const allImages = [imageSrc, ...altList].filter(Boolean);
  
  // Ratio-Anpassung wird aktuell nicht mit ConsentImage ermittelt; optional nachrüstbar

  // Hover-Slideshow: bei mehreren Alt-Bildern zyklisch wechseln
  useEffect(() => {
    if (altList.length < 2) return; // nur Slideshow wenn 2+ Bilder
  let t: ReturnType<typeof setInterval> | undefined;
    const node = document?.getElementById(`pc-${pid}`);
    if (!node) return;
    const enter = () => {
      if (t) clearInterval(t);
      let i = 0;
      t = setInterval(() => { i = (i + 1) % altList.length; setAltIdx(i); }, 900);
    };
    const leave = () => { if (t) clearInterval(t); setAltIdx(0); };
    node.addEventListener('mouseenter', enter);
    node.addEventListener('mouseleave', leave);
    return () => {
      node.removeEventListener('mouseenter', enter);
      node.removeEventListener('mouseleave', leave);
      if (t) clearInterval(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, JSON.stringify(altList)]);

  return (
  <div id={`pc-${pid}`} className="group rounded-2xl border border-neutral-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all overflow-hidden">
      <div className="relative">
        <Link href={`/p/${pid}`} onClick={() => {
          // Klickzählung bleibt, aber wenn Bild noch gesperrt ist, verhindern wir versehentliche Navigation
          try { addClick(pid); fetch('/api/clicks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: pid }) }).catch(() => {}); } catch {}
          // keine harte Navigation-Blockade; ConsentImage öffnet Modal separat
        }}>
          {/* Bild-Wrapper mit Einwilligungs-Flow */}
          <div className="w-full relative" style={{ aspectRatio: ratio, background: '#f6f6f6' }}>
            <ConsentImage
              product={product}
              src={imageSrc}
              srcList={allImages}
              currentIndex={Math.min(altIdx, allImages.length - 1)}
              alt={getDisplayTitle(product)}
              ratio={ratio}
              imgClassName="transition-transform group-hover:scale-[1.01]"
            />
          </div>
        </Link>
        {/* Overlay removed: disclaimer now placed inside the card content */}
        <button
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={fav}
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
          className={
            'absolute top-3 right-3 rounded-full border p-2 shadow-sm transition-all bg-white/90 hover:bg-white ' +
            (fav
              ? 'text-[hsl(var(--accent))] border-[hsl(var(--accent))/30] hover:shadow-md'
              : 'text-neutral-600 hover:text-neutral-900 border-neutral-200')
          }
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFav(); }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5 transition-transform duration-150 ease-out"
            style={{ transform: fav ? 'scale(1.05)' : 'scale(1)' }}
            role="img"
            aria-hidden="true"
          >
            <path
              d="M12.001 20.727C-7.999 9.5 6 1.5 12 7.27 18 1.5 32 9.5 12.001 20.727z"
              fill={fav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 relative">
        {hasAffiliate ? (
          <a
            href={safeAffiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block font-medium text-neutral-900 hover:underline"
            onClick={() => {
              addClick(pid);
              fetch('/api/clicks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pid }),
              }).catch(() => {});
            }}
            title={product.name}
          >
            {getDisplayTitle(product)}
          </a>
        ) : (
          <Link
            href={`/p/${pid}`}
            className="block font-medium text-neutral-900 hover:underline"
            title={product.name}
          >
            {getDisplayTitle(product)}
          </Link>
        )}
        {/* Desktop: disclaimer below price, collapsed until hover */}
        <div className="hidden md:block">
          <div className="transition-all duration-200 overflow-hidden max-h-0 opacity-0 group-hover:max-h-60 group-hover:overflow-visible group-hover:opacity-100 group-hover:mt-2">
            <p className="text-xs text-neutral-600 leading-snug" aria-label="Legal notice">{CARD_LEGAL_NOTE}</p>
            <small className="block text-[11px] text-neutral-500 mt-1">{AFFILIATE_DISCLAIMER}</small>
          </div>
        </div>
        <div className="mt-2 text-[hsl(var(--accent))] font-semibold">
          {formatProductPrice(product)}
        </div>
        {/* Mobile: toggle for notices */}
        <div className="md:hidden mt-2">
          <details className="text-xs text-neutral-500">
            <summary className="cursor-pointer list-none inline-flex items-center gap-1 select-none">Show notices
              <span aria-hidden>▾</span>
            </summary>
            <p className="mt-1 leading-snug">{CARD_LEGAL_NOTE}</p>
            <small className="block text-[11px] text-neutral-400 mt-1">{AFFILIATE_DISCLAIMER}</small>
          </details>
        </div>
      </div>
    </div>
  );
}
