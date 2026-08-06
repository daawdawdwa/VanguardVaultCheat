'use client';

import { useEffect, useState } from 'react';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ProductCard } from '@/components/product/product-card';
import type { Product } from '@/lib/types';

type WishlistRow = { id: string; product: Product | null };

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wishlists')
      .select('id, product:products(*, category:categories(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    const rows = (data as unknown as WishlistRow[]) ?? [];
    setItems(rows.map((r) => r.product).filter((p): p is Product => p !== null));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (productId: string) => {
    if (!user) return;
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
    load();
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">รายการโปรด</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">รายการโปรดของคุณว่างเปล่า</p>
          <Link href="/products" className="mt-4 inline-block">
            <span className="text-primary hover:underline">เลือกชมสินค้า</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} index={i} />
              <button
                onClick={() => remove(p.id)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg glass-strong text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
