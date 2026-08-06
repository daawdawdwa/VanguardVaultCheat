'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, DollarSign, TrendingUp, Loader2, Copy, Check, QrCode, Link2, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/helpers';
import { generateReferralCode, logActivity } from '@/lib/services';
import { toast } from 'sonner';

type AffProfile = {
  id: string; referral_code: string; commission_rate: number; status: string;
  total_earnings: number; pending_earnings: number; withdrawn_earnings: number;
};

type ReferralRow = {
  id: string; commission_earned: number; status: string; created_at: string;
  referred: { username: string } | null;
};

type CommissionRow = {
  id: string; amount: number; status: string; created_at: string;
};

export default function AffiliatePage() {
  const { user, profile } = useAuth();
  const [aff, setAff] = useState<AffProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<{ id: string; amount: number; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let affData = existing as AffProfile | null;
    if (!affData) {
      const code = generateReferralCode(profile?.username ?? user.email ?? 'user');
      const { data: created } = await supabase
        .from('affiliate_profiles')
        .insert({ user_id: user.id, referral_code: code, commission_rate: 10, status: 'active' })
        .select()
        .single();
      affData = created as AffProfile | null;
    }
    setAff(affData);

    const { data: refs } = await supabase
      .from('referrals')
      .select('id, commission_earned, status, created_at, referred:profiles!referrals_referred_id_fkey(username)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setReferrals((refs as unknown as ReferralRow[]) ?? []);

    const { data: comms } = await supabase
      .from('commissions')
      .select('id, amount, status, created_at')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setCommissions((comms as CommissionRow[]) ?? []);

    const { data: wds } = await supabase
      .from('affiliate_withdrawals')
      .select('id, amount, status, created_at')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setWithdrawals((wds as unknown as { id: string; amount: number; status: string; created_at: string }[]) ?? []);

    setLoading(false);
  }, [user, profile]);

  useEffect(() => { load(); }, [load]);

  const referralLink = typeof window !== 'undefined' && aff ? `${window.location.origin}/?ref=${aff.referral_code}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const requestWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (!aff || amt > aff.pending_earnings) { toast.error('Insufficient pending earnings'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('affiliate_withdrawals').insert({
      affiliate_id: user!.id, amount: amt, status: 'pending',
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Withdrawal requested');
    setWithdrawAmount('');
    logActivity('affiliate_withdraw', 'affiliate', { amount: amt });
    load();
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const stats = [
    { label: 'Total Earnings', value: formatPrice(aff?.total_earnings ?? 0), icon: DollarSign },
    { label: 'Pending', value: formatPrice(aff?.pending_earnings ?? 0), icon: TrendingUp },
    { label: 'Withdrawn', value: formatPrice(aff?.withdrawn_earnings ?? 0), icon: Wallet },
    { label: 'Referrals', value: String(referrals.length), icon: Users },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">Affiliate Program</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Link2 className="h-5 w-5 text-primary" />Your Referral Link
          </h2>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="bg-card" />
            <Button onClick={copyLink} variant="outline">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <QrCode className="h-4 w-4" />Referral code: <span className="font-mono text-foreground">{aff?.referral_code}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Commission rate: <span className="text-primary font-semibold">{aff?.commission_rate}%</span>
          </div>
          {aff?.status !== 'active' && (
            <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Your affiliate account is {aff?.status}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Wallet className="h-5 w-5 text-primary" />Request Withdrawal
          </h2>
          <form onSubmit={requestWithdraw} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <Input type="number" step="0.01" min="1" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className="bg-card" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white hover:opacity-90">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Withdrawal'}
            </Button>
          </form>
          {withdrawals.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recent Withdrawals</h3>
              <ul className="space-y-2">
                {withdrawals.map((w) => (
                  <li key={w.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-2 text-sm">
                    <span>{formatPrice(w.amount)}</span>
                    <span className="capitalize text-muted-foreground">{w.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Your Referrals</h2>
        {referrals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No referrals yet. Share your link to start earning.</p>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-medium">{r.referred?.username ?? 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-500">+{formatPrice(r.commission_earned)}</span>
                  <span className="text-xs capitalize text-muted-foreground">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Commission History</h2>
        {commissions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No commissions yet.</p>
        ) : (
          <div className="space-y-2">
            {commissions.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <span className="text-sm">{formatPrice(c.amount)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
