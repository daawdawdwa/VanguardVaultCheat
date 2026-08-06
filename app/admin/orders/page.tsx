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

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'สำเร็จ';
      case 'pending':
        return 'รอดำเนินการ';
      case 'cancelled':
        return 'ยกเลิก';
      case 'failed':
        return 'ล้มเหลว';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled':
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">คำสั่งซื้อทั้งหมด ({orders.length})</h2>
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">คำสั่งซื้อ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ลูกค้า</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">วันที่</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ยอดรวม</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">ยังไม่มีคำสั่งซื้อในขณะนี้</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">#{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{o.profile?.username ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3"><Badge className={`capitalize ${getStatusVariant(o.status)}`}>{getStatusLabel(o.status)}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
