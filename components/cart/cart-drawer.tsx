'use client';

import Link from 'next/link';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { formatPrice, discountedPrice } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity, subtotal, count } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col glass-strong border-l border-border"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">
                  ตะกร้าสินค้า {count > 0 && <span className="text-muted-foreground">({count})</span>}
                </h2>
              </div>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  ตะกร้าสินค้าของคุณว่างเปล่า เริ่มสำรวจแคตตาล็อกสินค้ากันเลย
                </p>
                <Link href="/products" onClick={close}>
                  <Button className="gradient-primary text-white hover:opacity-90">
                    เลือกดูสินค้า
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-4">
                    {items.map((item) => {
                      const price = discountedPrice(item.product);
                      return (
                        <li key={item.product.id} className="flex gap-4">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={close}
                            className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-card"
                          >
                            {item.product.thumbnail_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.product.thumbnail_url}
                                alt={item.product.title}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between gap-2">
                              <Link
                                href={`/products/${item.product.slug}`}
                                onClick={close}
                                className="text-sm font-medium leading-tight hover:text-primary"
                              >
                                {item.product.title}
                              </Link>
                              <button
                                onClick={() => remove(item.product.id)}
                                className="text-muted-foreground transition-colors hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.product.game_version}
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-lg border border-border">
                                <button
                                  onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                                  className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                                  className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-sm font-semibold">{formatPrice(price * item.quantity)}</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-border px-6 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ยอดรวมย่อย</span>
                    <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <Link href="/checkout" onClick={close}>
                    <Button className="w-full gradient-primary text-white hover:opacity-90">
                      ดำเนินการชำระเงิน
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
