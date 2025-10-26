import Link from 'next/link';

const links = [
  { href: '/imprint', label: 'Imprint' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer mt-16 border-t border-neutral-200 bg-neutral-50/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-neutral-600">
        {/* top: nav centered, subtle separators */}
        <div className="flex flex-col items-center gap-3">
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-3">
            {links.map((l, i) => (
              <>
                <Link key={l.href} className="rounded px-2 py-1 hover:text-neutral-900 hover:underline underline-offset-4" href={l.href}>
                  {l.label}
                </Link>
                {i < links.length - 1 && <span className="sep text-neutral-300">•</span>}
              </>
            ))}
          </nav>
          <p className="text-xs text-neutral-500">© {year} RepFinder</p>
        </div>

        {/* bottom: collapsible legal notice to keep the footer clean */}
        <div className="mt-6">
          <details className="group rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="text-sm font-medium text-neutral-800">Legal notice and disclaimers</span>
              <span className="chev text-neutral-400 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-3 text-xs leading-relaxed text-neutral-700">
              <p className="mb-2">
                We are an independent information site. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any brands or with any purchasing agents including but not limited to Superbuy, MuleBuy, AllChinaBuy, CNFans, iTaobuy, or with marketplaces such as Taobao or Weidian. All trademarks, service marks, trade names, product names and logos appearing on the site are the property of their respective owners.
              </p>
              <p className="mb-2">
                We do not sell or ship any items. Links on this site lead to third‑party websites. Any purchases are made on those external sites, which we do not operate or control. We assume no responsibility for the content, privacy policies, or practices of any third‑party sites or services. Use of affiliate links may earn us a small commission at no extra cost to you.
              </p>
              <p>
                Cookies and local storage: We use only strictly necessary cookies and local storage to operate core features such as theme/agent selection, favorites, click counts, and optional storage of your image consent. You can change your consent at any time via your browser settings. For details, see our Privacy page.
              </p>
            </div>
          </details>
        </div>
      </div>
    </footer>
  );
}
