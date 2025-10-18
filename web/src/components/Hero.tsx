"use client";
import { useAgent } from '@/providers/AgentProvider';
import { SHOPS } from '@/lib/data';

export default function Hero({ onSearchSubmit }: { onSearchSubmit: (q: string) => void }) {
  const { agent } = useAgent();
  const shop = SHOPS[agent];
  return (
    <div className="rounded-3xl p-8 sm:p-12 mb-8" style={{
      background: `linear-gradient(135deg, hsl(${shop.accentHsl}/0.10), hsl(${shop.accentHsl}/0.03))`
    }}>
  <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">Find your next favorite</h1>
  <p className="text-neutral-700 max-w-2xl mb-6">Discover popular picks, search the catalog, and shop via {shop.name} — fast and simple.</p>
    </div>
  );
}
