import { fetchCategories } from '@/lib/helpers';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse games by category.',
};

export default async function CategoriesPage() {
  const { categories } = await fetchCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Categories</h1>
        <p className="mt-2 text-muted-foreground">Find games by genre.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="card-hover group relative flex h-48 flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-6"
          >
            {cat.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold">{cat.name}</h2>
              {cat.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
              )}
              <div className="mt-3 flex items-center gap-1 text-sm text-primary">
                Browse games
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
