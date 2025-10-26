"use client";
import { useAgent } from '@/providers/AgentProvider';
import { SHOPS } from '@/lib/data';
import type { AgentKey } from '@/lib/types';

export default function Hero() {
  const { agent } = useAgent();
  const shop = SHOPS[agent];
  const descriptions: Record<AgentKey, string> = {
    cnfans: 'Established agent gaining strong traction recently.',
    allchinabuy: 'Newer agent growing fast as a strong competitor.',
    mulebuy: 'Rapidly growing, popular as a no‑limits PB alternative.',
    superbuy: 'Trusted household name, currently with limited order capacity.',
    itaobuy: 'Fast‑rising agent with competitive rates and responsive support.',
  };
  return (
    <div className="rounded-3xl p-8 sm:p-12 mb-8" style={{
      background: `linear-gradient(135deg, hsl(${shop.accentHsl}/0.10), hsl(${shop.accentHsl}/0.03))`
    }}>
  <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">Find products on {shop.name}</h1>
  <p className="text-neutral-700 max-w-2xl mb-6">{descriptions[agent] || `Discover popular picks and shop via ${shop.name}.`}</p>
    </div>
  );
}
