'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  profile: { username: string } | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, status, total, created_at, profile:profiles!orders_user_id_fkey(username)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as Order[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">All Orders ({orders.length})</h2>
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders yet.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">#{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{o.profile?.username ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3"><Badge className="capitalize">{o.status}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
