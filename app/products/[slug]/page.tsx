import { fetchProductBySlug, fetchProducts } from '@/lib/helpers';
import { ProductDetail } from '@/components/product/product-detail';
import { ProductCard } from '@/components/product/product-card';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { product } = await fetchProductBySlug(params.slug);
  if (!product) return { title: 'ไม่พบสินค้า' };
  return {
    title: product.title,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { product } = await fetchProductBySlug(params.slug);
  if (!product) notFound();

  const { products: related } = await fetchProducts({
    categorySlug: product.category?.slug,
    limit: 5,
  });
  const relatedFiltered = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div>
      <ProductDetail product={product} />

      {relatedFiltered.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">
            สินค้าที่คุณอาจสนใจ
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedFiltered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
