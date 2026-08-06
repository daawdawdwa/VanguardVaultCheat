'use client';

import { useEffect, useState } from 'react';
import { Crown, Star, Zap, Shield, Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const TIERS = [
  { name: 'Free', color: 'text-zinc-400', icon: Star, discount: 0, points: 0, perks: ['Basic access', 'Standard support'] },
  { name: 'Bronze', color: 'text-amber-600', icon: Shield, discount: 5, points: 100, perks: ['5% discount', 'Priority support', 'Early access'] },
  { name: 'Silver', color: 'text-zinc-300', icon: Shield, discount: 10, points: 500, perks: ['10% discount', 'Priority support', 'Early access', 'Monthly rewards'] },
  { name: 'Gold', color: 'text-yellow-500', icon: Crown, discount: 15, points: 1500, perks: ['15% discount', 'Priority support', 'Early access', 'Monthly rewards', 'Exclusive products'] },
  { name: 'Diamond', color: 'text-cyan-400', icon: Crown, discount: 20, points: 5000, perks: ['20% discount', 'Priority support', 'Early access', 'Monthly rewards', 'Exclusive products', 'Exclusive downloads', 'Private Discord role'] },
  { name: 'Lifetime', color: 'text-primary', icon: Crown, discount: 25, points: 10000, perks: ['25% lifetime discount', 'All Diamond perks', 'No expiry', 'Badge', 'VIP support'] },
];

type VipData = {
  id: string; tier: string; points: number; discount_percent: number; expires_at: string | null;
};

export default function VipPage() {
  const { user } = useAuth();
  const [vip, setVip] = useState<VipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('vip_memberships')
      .select('id, tier, points, discount_percent, expires_at')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => { setVip(data as VipData | null); setLoading(false); });
  }, [user]);

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const currentTier = TIERS.find((t) => t.name.toLowerCase() === (vip?.tier ?? 'free')) ?? TIERS[0];
  const nextTier = TIERS[TIERS.findIndex((t) => t.name === currentTier.name) + 1];
  const progress = nextTier ? Math.min(((vip?.points ?? 0) / nextTier.points) * 100, 100) : 100;

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">VIP Membership</h1>

      {/* Current tier card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
            <currentTier.icon className={`h-8 w-8 text-white`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Tier</p>
            <h2 className={`font-display text-3xl font-bold ${currentTier.color}`}>{currentTier.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {vip?.discount_percent ?? 0}% discount • {vip?.points ?? 0} XP
              {vip?.expires_at && ` • Expires ${new Date(vip.expires_at).toLocaleDateString()}`}
              {vip?.tier === 'lifetime' && ' • No expiry'}
            </p>
          </div>
        </div>

        {nextTier && (
          <div className="relative mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextTier.name}</span>
              <span className="text-primary">{vip?.points ?? 0} / {nextTier.points} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* All tiers */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = tier.name.toLowerCase() === (vip?.tier ?? 'free');
          return (
            <div
              key={tier.name}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-colors ${
                isCurrent ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
            >
              {isCurrent && (
                <div className="absolute right-3 top-3 rounded-full gradient-primary px-2 py-0.5 text-xs font-medium text-white">
                  Current
                </div>
              )}
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <tier.icon className={`h-5 w-5 ${tier.color}`} />
              </div>
              <h3 className={`font-display text-lg font-bold ${tier.color}`}>{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.discount}% discount • {tier.points} XP</p>
              <ul className="mt-3 space-y-1.5">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3 text-primary" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
