"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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

  // Load from storage once
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as AgentKey | null) : null;
    if (saved && SHOPS[saved]) setAgent(saved);
    setReady(true);
  }, []);

  // Persist and set theme var
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-agent', agent);
      localStorage.setItem(STORAGE_KEY, agent);
    }
    // Agent-Wechsel-Event nur senden, wenn Initialisierung durch ist
    try {
      if (ready) window.dispatchEvent(new CustomEvent('pf:agent-changed', { detail: { to: agent } }));
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
