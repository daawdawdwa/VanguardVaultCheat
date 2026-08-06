'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
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
    toast.success('Top-up approved and wallet updated');
    load();
  };

  const rejectTopup = async (id: string) => {
    await supabase.from('topup_requests').update({ status: 'rejected' }).eq('id', id);
    toast.success('Top-up rejected');
    load();
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">Wallets</h2>

      <div className="mb-8 rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Balance</th>
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

      <h2 className="mb-4 font-display text-xl font-semibold">Top-Up Requests</h2>
      {topups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No top-up requests.</p>
      ) : (
        <div className="space-y-2">
          {topups.map((req) => (
            <div key={req.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{req.profile?.username ?? req.user_id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(req.amount)} • {new Date(req.created_at).toLocaleDateString()}
                  {req.slip_url && <a href={req.slip_url} target="_blank" rel="noreferrer" className="ml-2 text-primary hover:underline">View slip</a>}
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
                <span className={`text-xs capitalize ${req.status === 'approved' ? 'text-green-500' : 'text-destructive'}`}>{req.status}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
