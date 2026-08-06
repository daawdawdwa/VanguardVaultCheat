'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { formatPrice, discountedPrice } from '@/lib/helpers';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const price = discountedPrice(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product, 1);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/products/${product.slug}`} className="group block h-full">
        <div className="card-hover relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
            {product.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.thumbnail_url}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            {product.discount > 0 && (
              <div className="absolute left-3 top-3">
                <Badge className="gradient-primary text-white">-{product.discount}%</Badge>
              </div>
            )}
            {product.featured && (
              <div className="absolute right-3 top-3">
                <Badge variant="secondary" className="glass">
                  <Star className="mr-1 h-3 w-3 fill-current text-accent" />
                  Featured
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-primary">
                {product.category?.name ?? 'Game'}
              </span>
              <span className="text-xs text-muted-foreground">v{product.game_version}</span>
            </div>
            <h3 className="mb-1 font-display text-base font-semibold leading-tight transition-colors group-hover:text-primary">
              {product.title}
            </h3>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold">{formatPrice(price)}</span>
                {product.discount > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleAdd}
                className="gradient-primary text-white hover:opacity-90"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
