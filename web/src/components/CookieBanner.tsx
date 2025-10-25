"use client";

import React, { useEffect, useState } from 'react';

const COOKIE_STORAGE_CHOICE = 'pf:cookie-consent-image-store'; // 'yes' | 'no'
const COOKIE_BANNER_STATE = 'pf:cookie-banner-dismissed';

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(COOKIE_BANNER_STATE) === '1';
      setOpen(!dismissed);
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => {
    try { localStorage.setItem(COOKIE_BANNER_STATE, '1'); } catch {}
    setOpen(false);
  };

  const setStore = (v: 'yes' | 'no') => {
    try { localStorage.setItem(COOKIE_STORAGE_CHOICE, v); } catch {}
  };

  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[85] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-lg p-4">
        <p className="text-sm text-neutral-800">
          We use strictly necessary cookies. We can also optionally store your image consent (brand-related images) locally so you don’t need to confirm every time. You can allow or deny this storage.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="rounded-full px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-50" onClick={() => { setStore('no'); close(); }}>Decline</button>
          <button className="rounded-full px-4 py-2 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105" onClick={() => { setStore('yes'); close(); }}>Agree</button>
        </div>
      </div>
    </div>
  );
}
