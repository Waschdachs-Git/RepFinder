import Link from 'next/link';
import { CATEGORIES } from '@/lib/data';

export default function CategoryTiles() {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">Entdecke Kategorien</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/c/${c.slug}`} className="rounded-2xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50 text-center">
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
