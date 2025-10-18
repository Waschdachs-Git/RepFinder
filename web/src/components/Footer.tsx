import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-16 bg-neutral-50">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto py-6 flex flex-col gap-4 text-sm text-neutral-600">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <p>© {new Date().getFullYear()} RepFinder</p>
          <nav className="flex items-center gap-4">
          <Link className="hover:text-neutral-900" href="/imprint">Imprint</Link>
          <span className="text-neutral-300">|</span>
          <Link className="hover:text-neutral-900" href="/privacy">Privacy</Link>
          <span className="text-neutral-300">|</span>
          <Link className="hover:text-neutral-900" href="/disclaimer">Disclaimer</Link>
          <span className="text-neutral-300">|</span>
          <Link className="hover:text-neutral-900" href="/terms">Terms</Link>
          <span className="text-neutral-300">|</span>
          <Link className="hover:text-neutral-900" href="/contact">Contact</Link>
          </nav>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-700 leading-relaxed">
          <p className="mb-2">
            Legal notice: We are an independent information site. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any brands or with any purchasing agents including but not limited to Superbuy, MuleBuy, AllChinaBuy, CNFans, iTaobuy, or with marketplaces such as Taobao or Weidian. All trademarks, service marks, trade names, product names and logos appearing on the site are the property of their respective owners.
          </p>
          <p className="mb-2">
            We do not sell or ship any items. Links on this site lead to third‑party websites. Any purchases are made on those external sites, which we do not operate or control. We assume no responsibility for the content, privacy policies, or practices of any third‑party sites or services. Use of affiliate links may earn us a small commission at no extra cost to you.
          </p>
          <p>
            Cookies and local storage: We use only strictly necessary cookies and local storage to operate core features such as theme/agent selection, favorites, click counts, and optional storage of your image consent. You can change your consent at any time via your browser settings. For details, see our Privacy page.
          </p>
        </div>
      </div>
    </footer>
  );
}
