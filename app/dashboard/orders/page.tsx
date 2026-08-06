'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/helpers';

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('id, status, total, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as unknown as Order[]) ?? []));
  }, [user]);

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">คำสั่งซื้อ</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/products" className="mt-4 inline-block">
            <span className="text-primary hover:underline">เลือกชมสินค้า</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="card-hover flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p className="text-sm font-medium">คำสั่งซื้อ #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs capitalize text-primary">
                  {order.status}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
