'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';

type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  profile: { username: string } | null;
};

type TopupReq = {
  id: string;
  user_id: string;
  amount: number;
  slip_url: string | null;
  status: string;
  created_at: string;
  profile: { username: string } | null;
};

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [topups, setTopups] = useState<TopupReq[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from('wallets').select('id, user_id, balance, profile:profiles(username)').order('balance', { ascending: false }),
      supabase.from('topup_requests').select('id, user_id, amount, slip_url, status, created_at, profile:profiles(username)').order('created_at', { ascending: false }).limit(20),
    ]);
    setWallets((w as unknown as Wallet[]) ?? []);
    setTopups((t as unknown as TopupReq[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approveTopup = async (req: TopupReq) => {
    const { error: topupErr } = await supabase
      .from('topup_requests')
      .update({ status: 'approved' })
      .eq('id', req.id);
    if (topupErr) { toast.error(topupErr.message); return; }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', req.user_id)
      .maybeSingle();
    if (wallet) {
      await supabase.from('wallets').update({
        balance: (wallet.balance ?? 0) + Number(req.amount),
        updated_at: new Date().toISOString(),
      }).eq('id', wallet.id);
    }
    toast.success('อนุมัติการเติมเงินและอัปเดตยอดเงินในกระเป๋าเรียบร้อยแล้ว');
    load();
  };

  const rejectTopup = async (id: string) => {
    await supabase.from('topup_requests').update({ status: 'rejected' }).eq('id', id);
    toast.success('ปฏิเสธรายการเติมเงินเรียบร้อยแล้ว');
    load();
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธ';
      case 'pending': return 'รอดำเนินการ';
      default: return status;
    }
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">จัดการกระเป๋าเงิน (Wallets)</h2>

      {wallets.length === 0 ? (
        <div className="mb-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูลกระเป๋าเงินในระบบ
        </div>
      ) : (
        <div className="mb-8 overflow-hidden rounded-2xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ผู้ใช้งาน</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ยอดเงินคงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">{w.profile?.username ?? w.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatPrice(w.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-4 font-display text-xl font-semibold">รายการขอเติมเงิน</h2>
      {topups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีรายการขอเติมเงินในขณะนี้
        </div>
      ) : (
        <div className="space-y-2">
          {topups.map((req) => (
            <div key={req.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{req.profile?.username ?? req.user_id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(req.amount)} • {new Date(req.created_at).toLocaleDateString('th-TH')}
                  {req.slip_url && <a href={req.slip_url} target="_blank" rel="noreferrer" className="ml-2 text-primary hover:underline">ดูสลิปโอนเงิน</a>}
                </p>
              </div>
              {req.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveTopup(req)} className="gradient-primary text-white hover:opacity-90">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectTopup(req.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Badge variant={req.status === 'approved' ? 'default' : 'secondary'} className={`capitalize ${req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                  {getStatusLabel(req.status)}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
