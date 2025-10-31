"use client";
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const KEY = 'pf:affiliate-banner';

export default function AffiliateBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const seen = localStorage.getItem(KEY);
      if (!seen) setOpen(true);
    } catch {}
  }, []);
  // Optional Vereinheitlichung: Wenn Bild-Einwilligung schon erteilt ist,
  // Banner nicht erneut anzeigen (reduziert Bestätigungen). Diese Änderung
  // greift NICHT in die produkt-spezifische Warnung ein.
  useEffect(() => {
    try {
      const consent = localStorage.getItem('pf:image-consent') === '1' || sessionStorage.getItem('pf:image-consent') === '1';
      if (consent) setOpen(false);
    } catch {}
  }, []);
  if (!open) return null;
  const content = (
    <div className="fixed inset-0 z-[65] pointer-events-none">
      {/* unsichtbarer Klickbereich oben, falls nötig */}
      <div className="absolute inset-0" />
      {/* Banner als Bottom-Sheet mit Safe-Area-Padding */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto">
        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-lg px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
          <p className="text-sm text-neutral-700 flex-1">
            This website uses affiliate links. By using it, you agree to this.
          </p>
          <button
            className="rounded-full px-4 py-2 text-sm bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105"
            onClick={() => { try { localStorage.setItem(KEY, '1'); } catch {} setOpen(false); }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
}
