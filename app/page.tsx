import { fetchProducts, fetchCategories } from '@/lib/helpers';

import { ProductCard } from '@/components/product/product-card';

import { HomeHero } from '@/components/home/hero';
import { HomeCategories } from '@/components/home/categories';
import { HomeFeatures } from '@/components/home/features';
import { HomeStats } from '@/components/home/stats';
import { HomeTestimonials } from '@/components/home/testimonials';
import { HomeFaq } from '@/components/home/faq';
import { HomeCta } from '@/components/home/cta';

import Link from 'next/link';

import { ArrowRight, Flame, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [
    { products: featured },
    { products: popular },
    { categories },
  ] = await Promise.all([
    fetchProducts({
      featuredOnly: true,
      limit: 8,
    }),
    fetchProducts({
      popularOnly: true,
      limit: 4,
    }),
    fetchCategories(),
  ]);

  return (
    <div className="relative">
      <HomeHero />

      {/* Featured products */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>สินค้าแนะนำ</span>
            </div>

            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              เกมพรีเมียมคัดสรรพิเศษ
            </h2>
          </div>

          <Link href="/products" className="hidden sm:block">
            <Button variant="outline" size="sm">
              ดูทั้งหมด
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 4).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </section>

      <HomeCategories categories={categories} />

      {/* Popular products */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Flame className="h-4 w-4" />
              <span>กำลังเป็นกระแส</span>
            </div>

            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              ยอดนิยมสัปดาห์นี้
            </h2>
          </div>

          <Link
            href="/products?sort=popular"
            className="hidden sm:block"
          >
            <Button variant="outline" size="sm">
              ดูทั้งหมด
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </section>

      <HomeFeatures />
      <HomeStats />
      <HomeTestimonials />
      <HomeFaq />
      <HomeCta />
    </div>
  );
}
