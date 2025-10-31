"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SHOPS } from '@/lib/data';
import type { AgentKey } from '@/lib/types';

type AgentContextValue = {
  agent: AgentKey;
  setAgent: (a: AgentKey) => void;
};

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

const STORAGE_KEY = 'pf:agent';

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<AgentKey>('cnfans');
  const [ready, setReady] = useState(false);
  const initDispatchedRef = useRef(false);

  // Load from storage once
  useEffect(() => {
    if (typeof window === 'undefined') { setReady(true); return; }
    const saved = (localStorage.getItem(STORAGE_KEY) as AgentKey | null);

    // 1) URL-Parameter hat höchste Priorität (?agent=...)
    let detected: AgentKey | null = null;
    try {
      const params = new URLSearchParams(window.location.search);
      const a = (params.get('agent') || '').toLowerCase().trim();
      if (a && (a in SHOPS)) detected = a as AgentKey;
    } catch {}

    // 2) Falls nicht gesetzt: Suchmaschinen-Referrer grob parsen (q=...)
    if (!detected) {
      try {
        const ref = document.referrer || '';
        const refUrl = ref ? new URL(ref) : null;
        const q = (refUrl?.searchParams.get('q') || refUrl?.searchParams.get('p') || '').toLowerCase();
        const hay = `${ref} ${q}`;
        const candidates: AgentKey[] = ['mulebuy','cnfans','itaobuy','superbuy','allchinabuy'];
        const hit = candidates.find((k) => hay.includes(k));
        if (hit && (hit in SHOPS)) detected = hit as AgentKey;
      } catch {}
    }

    // 3) Falls weiterhin leer: gespeicherten Agenten verwenden
    if (!detected && saved && SHOPS[saved]) detected = saved;

    if (detected && detected !== agent) setAgent(detected);
    setReady(true);
  }, []);

  // Persist and set theme var
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-agent', agent);
      localStorage.setItem(STORAGE_KEY, agent);
    }
    // Agent-Wechsel-Event nur senden, wenn Initialisierung durch ist UND nicht der erste Durchlauf
    try {
      if (ready) {
        if (!initDispatchedRef.current) {
          initDispatchedRef.current = true; // Initialen Mount überspringen (kein Event)
        } else {
          window.dispatchEvent(new CustomEvent('pf:agent-changed', { detail: { to: agent } }));
        }
      }
    } catch {}
  }, [agent, ready]);

  const value = useMemo(() => ({ agent, setAgent }), [agent]);

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
}
