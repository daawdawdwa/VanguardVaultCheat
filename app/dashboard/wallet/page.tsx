'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wallet, Plus, Loader2, Upload, Clock, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';

type Tx = {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string | null;
  created_at: string;
};

type Topup = {
  id: string;
  amount: number;
  status: string;
  slip_url: string | null;
  created_at: string;
};

export default function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [amount, setAmount] = useState('');
  const [slipUrl, setSlipUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    setBalance(wallet?.balance ?? 0);
    const { data: txData } = await supabase
      .from('transactions')
      .select('id, amount, type, status, reference, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setTxs(txData ?? []);
    const { data: topupData } = await supabase
      .from('topup_requests')
      .select('id, amount, status, slip_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setTopups(topupData ?? []);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const submitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('topup_requests').insert({
      user_id: user!.id,
      amount: amt,
      slip_url: slipUrl || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('ส่งคำขอเติมเงินเรียบร้อยแล้ว แอดมินจะตรวจสอบในไม่ช้า');
    setAmount('');
    setSlipUrl('');
    load();
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">กระเป๋าเงิน</h1>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">ยอดเงินคงเหลือ</p>
            <p className="mt-1 font-display text-4xl font-bold">{formatPrice(balance)}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
            <Wallet className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top-up form */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Plus className="h-5 w-5 text-primary" />
            เติมเงินเข้ากระเป๋า
          </h2>
          <form onSubmit={submitTopup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">จำนวนเงิน (THB)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50.00"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slip">ลิงก์สลิปโอนเงิน (ไม่บังคับ)</Label>
              <Input
                id="slip"
                value={slipUrl}
                onChange={(e) => setSlipUrl(e.target.value)}
                placeholder="https://..."
                className="bg-card"
              />
              <p className="text-xs text-muted-foreground">
                อัปโหลดสลิปโอนเงินของคุณและวางลิงก์ที่นี่เพื่อให้แอดมินตรวจสอบ
              </p>
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white hover:opacity-90">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ส่งคำขอเติมเงิน'}
            </Button>
          </form>

          {/* Pending top-ups */}
          {topups.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">คำขอเติมเงินล่าสุด</h3>
              <ul className="space-y-2">
                {topups.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatPrice(t.amount)}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs ${
                      t.status === 'approved' ? 'text-green-500' : t.status === 'rejected' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {t.status === 'approved' ? <Check className="h-3 w-3" /> : t.status === 'rejected' ? <X className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {t.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">ประวัติการทำรายการ</h2>
          {txs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีประวัติการทำรายการ</p>
          ) : (
            <ul className="space-y-2">
              {txs.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                      {tx.reference && ` • ${tx.reference}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.amount < 0 ? 'text-destructive' : 'text-green-500'}`}>
                      {tx.amount < 0 ? '-' : '+'}{formatPrice(Math.abs(tx.amount))}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">{tx.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
