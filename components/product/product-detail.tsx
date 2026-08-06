'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Cpu, MemoryStick, Monitor, HardDrive, Package, History, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/lib/cart-context';
import { formatPrice, discountedPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

export function ProductDetail({ product }: { product: Product }) {
  const { add } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const price = discountedPrice(product);
  const gallery = product.gallery?.length ? product.gallery : [product.thumbnail_url].filter(Boolean) as string[];

  const req = product.system_requirements ?? {};
  const reqRows: { icon: typeof Cpu; label: string; min?: string; rec?: string }[] = [
    { icon: Monitor, label: 'OS', min: req.minimum?.os, rec: req.recommended?.os },
    { icon: Cpu, label: 'Processor', min: req.minimum?.processor, rec: req.recommended?.processor },
    { icon: MemoryStick, label: 'Memory', min: req.minimum?.memory, rec: req.recommended?.memory },
    { icon: Monitor, label: 'Graphics', min: req.minimum?.graphics, rec: req.recommended?.graphics },
    { icon: HardDrive, label: 'Storage', min: req.minimum?.storage, rec: req.recommended?.storage },
  ];

  const handleAdd = () => {
    add(product, 1);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-card">
            {gallery[activeImage] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gallery[activeImage]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            )}
            {product.discount > 0 && (
              <div className="absolute left-4 top-4">
                <Badge className="gradient-primary text-white">-{product.discount}% OFF</Badge>
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-24 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i ? 'border-primary' : 'border-border'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-primary">
              {product.category?.name ?? 'Game'}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">v{product.game_version}</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">{formatPrice(price)}</span>
            {product.discount > 0 && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1.5 ${product.stock > 0 ? 'text-green-500' : 'text-destructive'}`}>
              <span className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-destructive'}`} />
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              size="lg"
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="flex-1 gradient-primary text-white hover:opacity-90 glow-primary"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Instant delivery</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">License key</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Lifetime access</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="requirements">
          <TabsList className="bg-card">
            <TabsTrigger value="requirements">
              <Cpu className="mr-2 h-4 w-4" />
              Requirements
            </TabsTrigger>
            <TabsTrigger value="changelog">
              <History className="mr-2 h-4 w-4" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="instructions">
              <BookOpen className="mr-2 h-4 w-4" />
              Instructions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requirements" className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Component</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Minimum</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  {reqRows.map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <row.icon className="h-4 w-4 text-primary" />
                          {row.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.min ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.rec ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="changelog" className="mt-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                {product.changelog ?? 'No changelog available.'}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="mt-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.instructions ?? 'No instructions available.'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
