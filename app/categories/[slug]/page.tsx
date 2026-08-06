import { fetchProducts, fetchCategories } from '@/lib/helpers';
import { ProductCard } from '@/components/product/product-card';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { categories } = await fetchCategories();
  const cat = categories.find((c) => c.slug === params.slug);
  return { title: cat?.name ?? 'หมวดหมู่สินค้า' };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { categories } = await fetchCategories();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) notFound();

  const { products } = await fetchProducts({ categorySlug: params.slug, sort: 'newest' });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">หมวดหมู่</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">ยังไม่มีเกมในหมวดหมู่นี้ในขณะนี้</p>
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
