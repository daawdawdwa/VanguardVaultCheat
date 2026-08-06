import { fetchProducts } from '@/lib/helpers';
import { ProductCard } from '@/components/product/product-card';
import { Search as SearchIcon } from 'lucide-react';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? '';
  const { products } = await fetchProducts({ search: q || undefined, sort: 'newest' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SearchIcon className="h-4 w-4" />
          ผลการค้นหา
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {q ? `"${q}"` : 'สินค้าทั้งหมด'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          พบ {products.length} ผลลัพธ์
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            ไม่พบเกมที่ตรงกับการค้นหา ลองใช้คำค้นหาอื่นดู
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
