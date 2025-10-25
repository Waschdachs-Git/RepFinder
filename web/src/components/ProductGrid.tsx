import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => {
        const key = (p.id && String(p.id).trim().length > 0)
          ? String(p.id)
          : `${p.agent}-${p.name}`.toLowerCase().replace(/\s+/g, '-').slice(0, 64);
        return <ProductCard key={key} product={p} />;
      })}
    </div>
  );
}
