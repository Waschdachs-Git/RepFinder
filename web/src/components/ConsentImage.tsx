"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { detectBrandTerm } from '@/lib/utils';

const IMG_CONSENT_KEY = 'pf:image-consent';
const IMG_CODE_OK_KEY = 'pf:image-code-ok';
const COOKIE_STORAGE_CHOICE = 'pf:cookie-consent-image-store'; // 'yes' | 'no'

function getStorage() {
  // Wenn Speicherung der Bild-Einwilligung nicht erlaubt ist, SessionStorage verwenden
  try {
    const choice = (localStorage.getItem(COOKIE_STORAGE_CHOICE) || '').trim();
    if (choice === 'no' && typeof sessionStorage !== 'undefined') return sessionStorage;
  } catch {}
  return typeof localStorage !== 'undefined' ? localStorage : undefined as unknown as Storage;
}

function readConsentFlags(secret: string | undefined) {
  try {
    const ls = typeof localStorage !== 'undefined' ? localStorage : undefined;
    const ss = typeof sessionStorage !== 'undefined' ? sessionStorage : undefined;
    const c = (ls?.getItem(IMG_CONSENT_KEY) === '1') || (ss?.getItem(IMG_CONSENT_KEY) === '1');
    const codeOk = !secret || (ls?.getItem(IMG_CODE_OK_KEY) === '1') || (ss?.getItem(IMG_CODE_OK_KEY) === '1');
    return { consented: !!c && !!codeOk };
  } catch {
    return { consented: false };
  }
}

function writeConsentFlags({ consent, codeOk }: { consent?: boolean; codeOk?: boolean }) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (consent !== undefined) localStorage.setItem(IMG_CONSENT_KEY, consent ? '1' : '0');
      if (codeOk !== undefined) localStorage.setItem(IMG_CODE_OK_KEY, codeOk ? '1' : '0');
    }
  } catch {}
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (consent !== undefined) sessionStorage.setItem(IMG_CONSENT_KEY, consent ? '1' : '0');
      if (codeOk !== undefined) sessionStorage.setItem(IMG_CODE_OK_KEY, codeOk ? '1' : '0');
    }
  } catch {}
}

export default function ConsentImage({
  product,
  src,
  srcList,
  currentIndex = 0,
  alt,
  ratio = 4 / 3,
  className,
  imgClassName,
  priority,
}: {
  product: Product;
  src: string;
  srcList?: string[];
  currentIndex?: number;
  alt: string;
  ratio?: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const storage = getStorage();

  const secret = (process.env.NEXT_PUBLIC_IMAGE_SECRET || '').trim();

  const sensitive = useMemo(() => {
    // Bild gilt als sensibel, wenn Markenbezug erkannt wird
    return !!detectBrandTerm(product.name);
  }, [product.name]);

  const [consented, setConsented] = useState(false);
  useEffect(() => {
    const { consented } = readConsentFlags(secret);
    setConsented(consented);
  }, [storage, secret]);

  useEffect(() => { setMounted(true); }, []);

  // Globaler Schutz: Beim ersten Besuch werden keine Bilder angezeigt,
  // bis der Nutzer die rechtlichen Hinweise bestätigt. Sensitivität bleibt
  // relevant für den optionalen Geheimcode (falls gesetzt), aber die Anzeige
  // wird generell gated, solange keine Zustimmung vorliegt.
  const showPlaceholder = !consented;

  const onConfirm = () => {
    setError('');
    if (secret) {
      if (code.trim() !== secret) {
      setError('The code you entered is invalid.');
        return;
      }
      writeConsentFlags({ codeOk: true });
    }
    writeConsentFlags({ consent: true });
    setOpen(false);
    setConsented(true);
  };

  const list = Array.isArray(srcList) && srcList.length > 0 ? srcList.filter(Boolean) : [src];
  const activeIdx = Math.min(Math.max(0, currentIndex || 0), list.length - 1);
  const activeSrc = (!imgError ? (list[activeIdx] || src) : '/placeholder.svg');

  const content = (
    <div className="relative" style={{ aspectRatio: ratio }}>
      {showPlaceholder ? (
        <div className={"absolute inset-0 grid place-items-center bg-neutral-100 text-center p-4 rounded-xl border border-neutral-200 " + (className || '')}>
          <div>
            <div className="text-sm md:text-base text-neutral-800">
              ⚠️ Legal notice: These images depict products inspired by well‑known brands. They are not original branded items. We are not affiliated with any brand. By continuing, you confirm you have read and understood these notices.
            </div>
            <button
              className="mt-3 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
              aria-haspopup="dialog"
            >
              Agree & view images
            </button>
          </div>
        </div>
      ) : (
        // Load optimized image only after consent
        <Image
          src={activeSrc}
          alt={imgError ? 'Image unavailable' : alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={"absolute inset-0 w-full h-full object-contain " + (imgClassName || '')}
          priority={!!priority}
          onError={() => setImgError(true)}
        />
      )}

    {open && mounted && createPortal(
  <div className="fixed inset-0 z-[80] bg-black/50" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Legal notice">
          <div className="fixed inset-x-0 bottom-0 md:inset-0 md:grid md:place-items-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto w-full max-w-md md:max-w-lg rounded-2xl border border-neutral-100 bg-white shadow-xl p-5">
              <div className="text-sm text-neutral-800">
                These images may depict products inspired by well‑known brands. They are not original branded products. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any brand. Images and names are used for descriptive and comparative purposes only. By clicking “Agree”, you confirm that you have read and understood these notices.
              </div>
              {secret && (
                <div className="mt-3">
                  <label className="block text-sm text-neutral-700 mb-1">Secret code (required)</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputMode="text"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[hsl(var(--accent))/30]"
                    placeholder="Enter code"
                    aria-label="Secret code"
                  />
                  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-full px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-50" onClick={() => setOpen(false)}>Cancel</button>
                <button className="rounded-full px-4 py-2 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105" onClick={onConfirm}>Agree</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );

  return content;
}
