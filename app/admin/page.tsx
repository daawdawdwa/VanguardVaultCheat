'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Download, TrendingUp, Package, Activity, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';

type Stats = {
  revenue: number; orders: number; users: number; products: number; downloads: number; pendingTopups: number;
  pendingWithdrawals: number; affiliateEarnings: number;
};

type RecentOrder = { id: string; total: number; status: string; created_at: string };

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    revenue: 0, orders: 0, users: 0, products: 0, downloads: 0, pendingTopups: 0, pendingWithdrawals: 0, affiliateEarnings: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [liveActivity, setLiveActivity] = useState<{ id: string; action: string; created_at: string }[]>([]);

  const loadStats = async () => {
    const { data: orders } = await supabase.from('orders').select('total, status').eq('status', 'paid');
    const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
    const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: dlCount } = await supabase.from('downloads').select('*', { count: 'exact', head: true });
    const { count: topupCount } = await supabase.from('topup_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: wdCount } = await supabase.from('affiliate_withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { data: affEarnings } = await supabase.from('affiliate_profiles').select('total_earnings');
    const affTotal = (affEarnings ?? []).reduce((s, a) => s + Number(a.total_earnings), 0);

    setStats({
      revenue, orders: orderCount ?? 0, users: userCount ?? 0, products: productCount ?? 0,
      downloads: dlCount ?? 0, pendingTopups: topupCount ?? 0, pendingWithdrawals: wdCount ?? 0, affiliateEarnings: affTotal,
    });

    const { data: recent } = await supabase.from('orders').select('id, total, status, created_at').order('created_at', { ascending: false }).limit(8);
    setRecentOrders(recent ?? []);
  };

  const loadActivity = async () => {
    const { data } = await supabase.from('activity_logs').select('id, action, created_at').order('created_at', { ascending: false }).limit(10);
    setLiveActivity((data as { id: string; action: string; created_at: string }[]) ?? []);
  };

  useEffect(() => {
    loadStats();
    loadActivity();

    // Realtime subscriptions
    const orderChannel = supabase.channel('admin-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadStats()).subscribe();
    const logChannel = supabase.channel('admin-logs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
      setLiveActivity((prev) => [{ id: payload.new.id, action: payload.new.action, created_at: payload.new.created_at }, ...prev].slice(0, 10));
    }).subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(logChannel);
    };
  }, []);

  const cards = [
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-green-500' },
    { label: 'Orders', value: stats.orders, icon: ShoppingBag, color: 'text-primary' },
    { label: 'Users', value: stats.users, icon: Users, color: 'text-blue-500' },
    { label: 'Products', value: stats.products, icon: Package, color: 'text-accent' },
    { label: 'Downloads', value: stats.downloads, icon: Download, color: 'text-cyan-400' },
    { label: 'Pending Topups', value: stats.pendingTopups, icon: TrendingUp, color: 'text-yellow-500' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: Zap, color: 'text-orange-500' },
    { label: 'Affiliate Payouts', value: formatPrice(stats.affiliateEarnings), icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="font-display text-2xl font-bold">{card.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <h2 className="font-display text-lg font-semibold">Live Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{order.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live activity */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <h2 className="font-display text-lg font-semibold">Live Activity</h2>
          </div>
          {liveActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2">
              {liveActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <span className="text-sm font-medium">{a.action}</span>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
