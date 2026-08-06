'use client';

import { useEffect, useState } from 'react';
import { Gift, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logActivity, createNotification } from '@/lib/services';
import { toast } from 'sonner';

type HistoryRow = { id: string; created_at: string; redeem_code: { code: string; type: string; value: number } | null };

export default function RedeemPage() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('redeem_usage')
      .select('id, created_at, redeem_code:redeem_codes(code, type, value)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setHistory((data as unknown as HistoryRow[]) ?? []));
  }, [user]);

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !user) return;
    setLoading(true);

    const { data: redeemCode } = await supabase
      .from('redeem_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (!redeemCode || !redeemCode.active) { setLoading(false); toast.error('โค้ดไม่ถูกต้องหรือ,ปิดใช้งานแล้ว'); return; }
    if (redeemCode.expires_at && new Date(redeemCode.expires_at) < new Date()) { setLoading(false); toast.error('โค้ดนี้หมดอายุแล้ว'); return; }
    if (redeemCode.used_count >= redeemCode.max_usage) { setLoading(false); toast.error('โค้ดนี้ถูกใช้งานครบตามจำนวนจำกัดแล้ว'); return; }

    const { count: userUsage } = await supabase.from('redeem_usage').select('*', { count: 'exact', head: true }).eq('redeem_code_id', redeemCode.id).eq('user_id', user.id);
    if ((userUsage ?? 0) >= redeemCode.per_user_limit) { setLoading(false); toast.error('คุณใช้โค้ดนี้ครบจำนวนครั้งที่กำหนดแล้ว'); return; }

    if (redeemCode.type === 'wallet') {
      const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user.id).maybeSingle();
      if (wallet) {
        await supabase.from('wallets').update({ balance: wallet.balance + Number(redeemCode.value), updated_at: new Date().toISOString() }).eq('id', wallet.id);
        await supabase.from('transactions').insert({ user_id: user.id, amount: Number(redeemCode.value), type: 'topup', status: 'completed', reference: `Redeem ${redeemCode.code}` });
      }
    } else if (redeemCode.type === 'vip') {
      const tiers = ['free', 'bronze', 'silver', 'gold', 'diamond', 'lifetime'];
      const tierIdx = Math.min(Math.floor(redeemCode.value), tiers.length - 1);
      const tier = tiers[tierIdx];
      const discounts: Record<string, number> = { free: 0, bronze: 5, silver: 10, gold: 15, diamond: 20, lifetime: 25 };
      await supabase.from('vip_memberships').upsert({
        user_id: user.id, tier, discount_percent: discounts[tier],
        expires_at: tier === 'lifetime' ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } else if (redeemCode.type === 'xp') {
      const { data: vip } = await supabase.from('vip_memberships').select('id, points').eq('user_id', user.id).maybeSingle();
      if (vip) {
        await supabase.from('vip_memberships').update({ points: vip.points + Number(redeemCode.value), updated_at: new Date().toISOString() }).eq('id', vip.id);
      }
    }

    await supabase.from('redeem_usage').insert({ redeem_code_id: redeemCode.id, user_id: user.id });
    await supabase.from('redeem_codes').update({ used_count: redeemCode.used_count + 1 }).eq('id', redeemCode.id);

    createNotification(user.id, 'ใช้โค้ดสำเร็จ', `คุณใช้โค้ด ${redeemCode.code} รับรางวัลประเภท ${redeemCode.type}`, 'success');
    logActivity('redeem_code', 'user', { code: redeemCode.code, type: redeemCode.type });

    setLoading(false);
    setCode('');
    toast.success(`แลกโค้ดสำเร็จ! ได้รับรางวัลประเภท ${redeemCode.type}`);
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">เติมโค้ดรางวัล</h1>

      <div className="max-w-lg rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <Gift className="h-5 w-5 text-primary" />กรอกโค้ด
        </h2>
        <form onSubmit={redeem} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">โค้ดแลกรางวัล / โค้ดของขวัญ / โค้ดโปรโมชัน</Label>
            <Input id="code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="GV-XXXX-XXXX" className="bg-card font-mono" />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white hover:opacity-90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'แลกโค้ด'}
          </Button>
        </form>
      </div>

      {history.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">ประวัติการใช้โค้ด</h2>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div>
                  <p className="font-mono text-sm">{h.redeem_code?.code ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString('th-TH')}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs capitalize text-primary">
                  <Check className="h-3 w-3" />{h.redeem_code?.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
