'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';

type AffRow = {
  id: string; referral_code: string; commission_rate: number; status: string;
  total_earnings: number; pending_earnings: number; user_id: string;
  profile: { username: string } | null;
};

type WdRow = { id: string; amount: number; status: string; affiliate_id: string; profile: { username: string } | null };

export default function AdminAffiliatePage() {
  const [affiliates, setAffiliates] = useState<AffRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WdRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: affs }, { data: wds }] = await Promise.all([
      supabase.from('affiliate_profiles').select('*, profile:profiles(username)').order('created_at', { ascending: false }),
      supabase.from('affiliate_withdrawals').select('id, amount, status, affiliate_id, profile:profiles(username)').eq('status', 'pending').order('created_at', { ascending: false }),
    ]);
    setAffiliates((affs as unknown as AffRow[]) ?? []);
    setWithdrawals((wds as unknown as WdRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('affiliate_profiles').update({ status }).eq('id', id);
    toast.success(`อัปเดตสถานะพันธมิตรเป็น ${status} สำเร็จ`);
    load();
  };

  const updateRate = async (id: string, rate: number) => {
    await supabase.from('affiliate_profiles').update({ commission_rate: rate }).eq('id', id);
    toast.success('อัปเดตอัตราค่าคอมมิชชันสำเร็จ');
    load();
  };

  const approveWithdrawal = async (id: string, affiliateId: string, amount: number) => {
    await supabase.from('affiliate_withdrawals').update({ status: 'approved' }).eq('id', id);
    await supabase.from('affiliate_profiles').update({ pending_earnings: 0, withdrawn_earnings: amount }).eq('user_id', affiliateId);
    await supabase.from('commissions').update({ status: 'withdrawn' }).eq('affiliate_id', affiliateId).eq('status', 'approved');
    toast.success('อนุมัติการถอนเงินสำเร็จ');
    load();
  };

  const rejectWithdrawal = async (id: string) => {
    await supabase.from('affiliate_withdrawals').update({ status: 'rejected' }).eq('id', id);
    toast.success('ปฏิเสธการถอนเงินแล้ว');
    load();
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">จัดการระบบพันธมิตร (Affiliate)</h2>

      {withdrawals.length > 0 && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <DollarSign className="h-4 w-4 text-primary" />คำขอถอนเงินที่รอการอนุมัติ ({withdrawals.length})
          </h3>
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-medium">{w.profile?.username ?? 'ไม่ทราบชื่อ'}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(w.amount)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveWithdrawal(w.id, w.affiliate_id, w.amount)} className="gradient-primary text-white hover:opacity-90"><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => rejectWithdrawal(w.id)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ผู้ใช้</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">รหัสแนะนำ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">อัตรา (%)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ยอดรวม</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">รอดำเนินการ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">สถานะ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">ยังไม่มีพันธมิตรในขณะนี้</td></tr>
            ) : (
              affiliates.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">{a.profile?.username ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.referral_code}</td>
                  <td className="px-4 py-3">
                    <input type="number" defaultValue={a.commission_rate} onBlur={(e) => updateRate(a.id, parseFloat(e.target.value))} className="w-16 rounded border border-border bg-background px-2 py-1 text-sm" />
                  </td>
                  <td className="px-4 py-3 text-sm">{formatPrice(a.total_earnings)}</td>
                  <td className="px-4 py-3 text-sm">{formatPrice(a.pending_earnings)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${a.status === 'active' ? 'bg-green-500/10 text-green-500' : a.status === 'suspended' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {a.status !== 'active' && <button onClick={() => updateStatus(a.id, 'active')} className="rounded border border-border px-2 py-1 text-xs hover:text-primary">อนุมัติ</button>}
                      {a.status !== 'suspended' && <button onClick={() => updateStatus(a.id, 'suspended')} className="rounded border border-border px-2 py-1 text-xs hover:text-yellow-500">ระงับ</button>}
                      {a.status !== 'rejected' && <button onClick={() => updateStatus(a.id, 'rejected')} className="rounded border border-border px-2 py-1 text-xs hover:text-destructive">ปฏิเสธ</button>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
