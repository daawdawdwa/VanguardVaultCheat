'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/lib/types';

export function ProductsFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== 'all') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`/products?${next.toString()}`);
    },
    [params, router]
  );

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          update('q', formData.get('q') as string);
        }}
        className="relative flex-1"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={params.get('q') ?? ''}
          placeholder="Search games..."
          className="border-border bg-card pl-9"
        />
      </form>

      <Select
        defaultValue={params.get('category') ?? 'all'}
        onValueChange={(v) => update('category', v)}
      >
        <SelectTrigger className="w-full sm:w-48 bg-card">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="glass-strong">
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={params.get('sort') ?? 'newest'}
        onValueChange={(v) => update('sort', v)}
      >
        <SelectTrigger className="w-full sm:w-44 bg-card">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent className="glass-strong">
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="popular">Popular</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
