import { SHOPS } from '../../lib/data';
import { OFFERS } from '../../lib/offers';
import type { Shop } from '../../lib/types';

export default function CouponsPage() {
  const items = (Object.values(SHOPS) as Shop[]).map((s) => ({
    key: s.key,
    name: s.name,
    accent: s.accentHsl,
    offer: OFFERS[s.key],
  }));

  return (
    <div className="py-10">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Shipping coupons & referral offers</h1>
      <p className="text-neutral-600 mb-6">Latest welcome and referral coupons across all supported agents. Offers open on the respective agent sites.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.key} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${it.accent})` }} />
                <h2 className="text-base font-semibold">{it.name}</h2>
              </div>
              <a
                href={it.offer?.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium"
                style={{ background: `hsl(${it.accent})`, color: 'hsl(var(--accent-foreground))' }}
              >
                Open
              </a>
            </div>
            <p className="text-sm text-neutral-600 mt-3">{it.offer?.text || 'View current referral or welcome coupons.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
