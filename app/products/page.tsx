import { fetchProducts, fetchCategories } from '@/lib/helpers';
import { ProductCard } from '@/components/product/product-card';
import { ProductsFilters } from '@/components/product/products-filters';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'สินค้าทั้งหมด',
  description: 'เรียกดูแคตตาล็อกคีย์เกมดิจิทัลพรีเมียมทั้งหมดของเรา',
};

type SearchParams = {
  category?: string;
  sort?: string;
  q?: string;
  min?: string;
  max?: string;
};

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sort = (searchParams.sort as 'newest' | 'popular' | 'price_asc' | 'price_desc') || 'newest';
  const search = searchParams.q;
  const categorySlug = searchParams.category;

  const [{ products, error }, { categories }] = await Promise.all([
    fetchProducts({ categorySlug, search, sort }),
    fetchCategories(),
  ]);

  let filtered = products;
  if (searchParams.min) {
    filtered = filtered.filter((p) => p.price >= Number(searchParams.min));
  }
  if (searchParams.max) {
    filtered = filtered.filter((p) => p.price <= Number(searchParams.max));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          สินค้าทั้งหมด
        </h1>
        <p className="mt-2 text-muted-foreground">
          พบ {filtered.length} เกม
          {categorySlug && ` ในหมวดหมู่ ${categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}`}
        </p>
      </div>

      <ProductsFilters categories={categories} />

      {error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">ไม่พบสินค้า ลองปรับเปลี่ยนตัวกรองของคุณดู</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
