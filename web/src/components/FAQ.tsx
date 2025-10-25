"use client";

import { useAgent } from '@/providers/AgentProvider';
import { SHOPS } from '@/lib/data';

type FAQItem = { icon: string; title: string; desc: string };

export default function FAQ() {
  const { agent } = useAgent();
  const shop = SHOPS[agent];
  const items: FAQItem[] = [
    { icon: '✈️', title: 'How do shipping coupons work?', desc: 'Agents often publish coupon codes that reduce international shipping rates. Check our shipping coupons section for current offers.' },
    { icon: '🛡️', title: 'Which shipping methods are safest?', desc: 'Consolidated shipping with declared low value reduces costs but may increase delivery time. Choose tracked methods for reliability.' },
    { icon: '🧾', title: 'Customs & duties basics', desc: 'Import duties depend on your country. Always check local regulations. Declared value and shipping method can affect fees.' },
    { icon: '📏', title: 'How to choose the right size?', desc: 'Review seller photos and follow community size charts when available. When unsure, size up for outerwear and down for sneakers with a snug fit.' },
    { icon: '💳', title: 'Payment options', desc: 'Most agents accept cards and some wallets. If a payment fails, retry with a different card or contact support.' },
    { icon: '🛰️', title: 'Tracking your parcel', desc: 'Once the parcel ships, you’ll get a tracking number. Use both the agent dashboard and the carrier’s website for updates.' },
  ];

  return (
    <section className="my-12">
  <h2 className="text-3xl font-semibold tracking-tight text-center mb-6">Helpful tips before you order</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl mb-3"
                 style={{ background: `hsl(${shop.accentHsl}/0.12)`, color: `hsl(${shop.accentHsl})` }}
                 aria-hidden>
              <span className="text-lg">{it.icon}</span>
            </div>
            <h3 className="text-base font-semibold mb-1">{it.title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
