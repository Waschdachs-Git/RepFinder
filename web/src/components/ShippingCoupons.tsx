"use client";

import { useAgent } from '@/providers/AgentProvider';
import { SHOPS } from '@/lib/data';
import { OFFERS } from '@/lib/offers';

export default function ShippingCoupons() {
  const { agent } = useAgent();
  const shop = SHOPS[agent];
  const offer = OFFERS[agent];
  return (
    <section className="my-10">
  <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4 u-hover-lift anim-fade-up">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Shipping coupons</h2>
          <p className="text-sm text-neutral-600 mt-1">{offer?.text || 'Grab welcome shipping coupons for better rates.'}</p>
        </div>
        <a
          href="/coupons"
          className="shrink-0 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium"
          style={{ background: `hsl(${shop.accentHsl})`, color: 'hsl(var(--accent-foreground))' }}
        >
          View coupons
        </a>
      </div>
    </section>
  );
}
