'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wallet, ShoppingBag, Download, Key, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/helpers';

type Stats = {
  wallet: number;
  orders: number;
  downloads: number;
  keys: number;
};

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ wallet: 0, orders: 0, downloads: 0, keys: 0 });
  const [recentOrders, setRecentOrders] = useState<{ id: string; total: number; status: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      const { count: orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      const { count: downloads } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      // keys via orders join
      const { data: keyData } = await supabase
        .from('license_keys')
        .select('id, order:orders!inner(user_id)')
        .eq('order.user_id', user.id)
        .eq('status', 'sold');
      setStats({
        wallet: wallet?.balance ?? 0,
        orders: orders ?? 0,
        downloads: downloads ?? 0,
        keys: keyData?.length ?? 0,
      });

      const { data: recent } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders(recent ?? []);
    })();
  }, [user]);

  const cards = [
    { label: 'Wallet Balance', value: formatPrice(stats.wallet), icon: Wallet, href: '/dashboard/wallet' },
    { label: 'Total Orders', value: stats.orders.toString(), icon: ShoppingBag, href: '/dashboard/orders' },
    { label: 'Downloads', value: stats.downloads.toString(), icon: Download, href: '/dashboard/downloads' },
    { label: 'License Keys', value: stats.keys.toString(), icon: Key, href: '/dashboard/keys' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome back, {profile?.username ?? 'Player'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here is your account at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="card-hover group rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <card.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-bold">{card.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No orders yet. <Link href="/products" className="text-primary hover:underline">Start shopping</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">
                    {order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
