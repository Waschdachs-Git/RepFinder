"use client";
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAgent } from '@/providers/AgentProvider';
import { OFFERS } from '@/lib/offers';

const KEY = 'pf:agent-register-seen:'; // + agent key

// OFFERS are imported from lib/offers

export default function RegistrationPrompt() {
  const { agent } = useAgent();
  const [open, setOpen] = useState(false);

  // Auf Agent-Wechsel hören und einmalig pro Agent anzeigen
  useEffect(() => {
    const onChange = (e: Event) => {
      const a = (e as CustomEvent).detail?.to as string;
      if (!a || !(a in OFFERS)) return;
      try {
        const seen = localStorage.getItem(KEY + a);
        if (!seen) setOpen(true);
      } catch { setOpen(true); }
    };
    window.addEventListener('pf:agent-changed', onChange);
    return () => window.removeEventListener('pf:agent-changed', onChange);
  }, []);

  const offer = useMemo(() => OFFERS[agent], [agent]);
  if (!open || !offer) return null;

  const content = (
    <div className="fixed inset-0 z-[70] bg-black/50" role="dialog" aria-modal="true" aria-label="Registrieren und Vorteil sichern" onClick={() => setOpen(false)}>
  <div className="fixed inset-x-0 bottom-0 md:inset-0 md:grid md:place-items-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-full max-w-md md:max-w-lg rounded-2xl border border-neutral-100 bg-white shadow-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Welcome offer</h3>
              <p className="text-neutral-700 mb-4">{offer.text}</p>
            </div>
            <button className="text-neutral-500 hover:text-neutral-800" onClick={() => setOpen(false)} aria-label="Schließen">×</button>
          </div>
          <a
            href={offer.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-base font-medium transition-all bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm hover:shadow-md hover:brightness-105"
            onClick={() => { try { localStorage.setItem(KEY + agent, '1'); } catch {}; setOpen(false); }}
          >
            Jetzt registrieren und Vorteil sichern ↗
          </a>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
}
