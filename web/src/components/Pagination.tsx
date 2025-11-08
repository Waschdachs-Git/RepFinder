"use client";

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
  loading?: boolean;
};

export default function Pagination({ page, total, pageSize, onChange, loading }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clamp = (p: number) => Math.min(pageCount, Math.max(1, p));
  const go = (p: number) => {
    if (loading) return;
    // Fokus lösen, damit Browser nicht versucht, den Button im Viewport zu halten
    try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
    // Danach sanft nach oben scrollen
    try { window?.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    onChange(clamp(p));
  };

  // Fenster mit Ellipsen: 1, ..., curr-2, curr-1, curr, curr+1, curr+2, ..., last
  const windowSize = 2;
  const pages: (number | '…')[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  for (let i = page - windowSize; i <= page + windowSize; i++) {
    if (i > 1 && i < pageCount) add(i);
  }
  if (pageCount > 1) add(pageCount);
  // Ellipsen einfügen
  const withEllipses: (number | '…')[] = [];
  for (let i = 0; i < pages.length; i++) {
    const curr = pages[i] as number;
    const prev = withEllipses.length ? withEllipses[withEllipses.length - 1] : undefined;
    if (typeof prev === 'number' && curr - prev > 1) withEllipses.push('…');
    withEllipses.push(curr);
  }
  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <button
        className="rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 text-sm disabled:opacity-50"
        onClick={() => go(page - 1)}
        disabled={page <= 1 || loading}
      >
        Back
      </button>
      {withEllipses.map((p, idx) => (
        p === '…' ? (
          <span key={`dots-${idx}`} className="px-2 text-neutral-400 select-none">…</span>
        ) : (
          <button
            key={p}
            className={`rounded-full px-3 py-1 text-sm border ${p === page ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-transparent' : 'bg-white hover:bg-neutral-50 border-neutral-200'} disabled:opacity-50`}
            onClick={() => go(p)}
            disabled={loading}
          >
            {p}
          </button>
        )
      ))}
      <button
        className="rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 text-sm disabled:opacity-50"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount || loading}
      >
        Next
      </button>
    </div>
  );
}
