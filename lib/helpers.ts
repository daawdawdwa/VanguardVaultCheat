export const dynamic = 'force-dynamic';
import { supabaseServer } from './supabase-server';
import type { Product, Category } from './types';

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function discountedPrice(product: Pick<Product, 'price' | 'discount'>): number {
  return product.price * (1 - product.discount / 100);
}

export function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export async function fetchProducts(opts?: {
  categorySlug?: string;
  search?: string;
  sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  featuredOnly?: boolean;
  popularOnly?: boolean;
  limit?: number;
}): Promise<{ products: Product[]; error: string | null }> {
  let query = supabaseServer.from('products').select('*, category:categories(*)');

  if (opts?.categorySlug) {
    const { data: cat } = await supabaseServer
      .from('categories')
      .select('id')
      .eq('slug', opts.categorySlug)
      .maybeSingle();
    if (cat) {
      query = supabaseServer.from('products').select('*, category:categories(*)').eq('category_id', cat.id);
    }
  }

  if (opts?.featuredOnly) query = query.eq('featured', true);
  if (opts?.popularOnly) query = query.eq('popular', true);
  if (opts?.search) {
    query = query.or(`title.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  }

  switch (opts?.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'popular':
      query = query.order('popular', { ascending: false }).order('created_at', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) return { products: [], error: error.message };
  return { products: (data ?? []) as unknown as Product[], error: null };
}

export async function fetchCategories(): Promise<{ categories: Category[]; error: string | null }> {
  const { data, error } = await supabaseServer.from('categories').select('*').order('name');
  if (error) return { categories: [], error: error.message };
  return { categories: (data ?? []) as unknown as Category[], error: null };
}

export async function fetchProductBySlug(slug: string): Promise<{ product: Product | null; error: string | null }> {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return { product: null, error: error.message };
  return { product: data as unknown as Product | null, error: null };
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`;
}
