'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, Loader2, Check, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice, discountedPrice } from '@/lib/helpers';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { user, profile } = useAuth();
  const [wallet, setWallet] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ type: string; value: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to checkout');
      router.push('/login');
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      setWallet(data?.balance ?? 0);
    })();
  }, [user, router]);

  const discount = coupon
    ? coupon.type === 'percent'
      ? (subtotal * coupon.value) / 100
      : Math.min(coupon.value, subtotal)
    : 0;
  const tax = (subtotal - discount) * 0.07;
  const total = subtotal - discount + tax;

  const applyCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('type, value, active, expires_at, usage_limit, used_count')
      .eq('code', couponCode.toUpperCase())
      .maybeSingle();
    setLoading(false);
    if (error || !data) {
      toast.error('Invalid coupon code');
      setCoupon(null);
      return;
    }
    if (!data.active) {
      toast.error('This coupon is no longer active');
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error('This coupon has expired');
      return;
    }
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      toast.error('This coupon has reached its usage limit');
      return;
    }
    setCoupon({ type: data.type, value: data.value });
    toast.success('Coupon applied');
  };

  const placeOrder = async () => {
    if (!user) return;
    if (wallet === null || wallet < total) {
      toast.error('Insufficient wallet balance. Please top up first.');
      return;
    }
    setPlacing(true);

    try {
      // 1. Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'paid',
          subtotal,
          discount,
          tax,
          total,
        })
        .select()
        .single();
      if (orderErr) throw new Error(orderErr.message);

      // 2. Insert order items + assign a license key for each
      for (const item of items) {
        const price = discountedPrice(item.product);
        for (let i = 0; i < item.quantity; i++) {
          // Find an unused key
          const { data: key } = await supabase
            .from('license_keys')
            .select('id')
            .eq('product_id', item.product.id)
            .eq('status', 'unused')
            .limit(1)
            .maybeSingle();

          let keyId = null;
          if (key) {
            const { error: keyErr } = await supabase
              .from('license_keys')
              .update({ status: 'sold', order_id: order.id, sold_at: new Date().toISOString() })
              .eq('id', key.id);
            if (!keyErr) keyId = key.id;
          }

          const { error: itemErr } = await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.product.id,
            price,
            license_key_id: keyId,
          });
          if (itemErr) throw new Error(itemErr.message);
        }
      }

      // 3. Deduct wallet
      const { error: walletErr } = await supabase
        .from('wallets')
        .update({ balance: wallet - total, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (walletErr) throw new Error(walletErr.message);

      // 4. Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: -total,
        type: 'purchase',
        status: 'completed',
        reference: `Order ${order.id}`,
      });

      clear();
      toast.success('Order placed! Your keys are ready in your dashboard.');
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some games before checking out.</p>
        <Link href="/products" className="mt-6 inline-block">
          <Button className="gradient-primary text-white hover:opacity-90">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Continue shopping
      </Link>

      <h1 className="mb-8 font-display text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Items */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Order Items</h2>
            <ul className="space-y-4">
              {items.map((item) => {
                const price = discountedPrice(item.product);
                return (
                  <li key={item.product.id} className="flex gap-4">
                    <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {item.product.thumbnail_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.product.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(price * item.quantity)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-4 font-display text-lg font-semibold">Summary</h2>

            {/* Wallet balance */}
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-primary" />
                Wallet Balance
              </div>
              <span className="text-sm font-semibold">{wallet !== null ? formatPrice(wallet) : '—'}</span>
            </div>

            {/* Coupon */}
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="bg-card pl-9"
                />
              </div>
              <Button variant="outline" onClick={applyCoupon} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (7%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              onClick={placeOrder}
              disabled={placing || wallet === null || wallet < total}
              className="mt-6 w-full gradient-primary text-white hover:opacity-90"
            >
              {placing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : wallet !== null && wallet < total ? (
                'Insufficient balance'
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Pay {formatPrice(total)}
                </>
              )}
            </Button>

            {wallet !== null && wallet < total && (
              <Link href="/dashboard/wallet" className="mt-3 block text-center text-xs text-primary hover:underline">
                Top up your wallet
              </Link>
            )}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Secure wallet-based checkout
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
