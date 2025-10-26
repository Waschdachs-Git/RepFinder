"use client";
import { useAgent } from '@/providers/AgentProvider';
import { SHOPS } from '@/lib/data';
import type { AgentKey } from '@/lib/types';
import SearchBar from '@/components/SearchBar';

type Props = {
  withSearch?: boolean;
  query?: string;
  setQuery?: (v: string) => void;
  onSubmit?: (q: string) => void;
};

export default function Hero({ withSearch, query = '', setQuery, onSubmit }: Props) {
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
    <div
      className="rounded-3xl p-6 sm:p-10 mb-8 anim-fade-up"
      style={{ background: `linear-gradient(135deg, hsl(${shop.accentHsl}/0.08), hsl(${shop.accentHsl}/0.02))` }}
    >
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">Find products on {shop.name}</h1>
      <p className="text-neutral-700 max-w-2xl mb-5">
        {descriptions[agent] || `Discover popular picks and shop via ${shop.name}.`}
      </p>
      {withSearch && setQuery && onSubmit && (
        <div className="mt-2">
          <SearchBar query={query} setQuery={setQuery} onSubmit={onSubmit} />
        </div>
      )}
    </div>
  );
}
