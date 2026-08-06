'use client';

import { useEffect, useState } from 'react';
import { Loader2, Crown, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type VipRow = {
  id: string; user_id: string; tier: string; points: number; discount_percent: number; expires_at: string | null;
  profile: { username: string } | null;
};

const TIERS = ['free', 'bronze', 'silver', 'gold', 'diamond', 'lifetime'];
const DISCOUNTS: Record<string, number> = { free: 0, bronze: 5, silver: 10, gold: 15, diamond: 20, lifetime: 25 };

export default function AdminVipPage() {
  const [members, setMembers] = useState<VipRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('vip_memberships').select('*, profile:profiles(username)').order('points', { ascending: false });
    setMembers((data as VipRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateTier = async (id: string, tier: string) => {
    await supabase.from('vip_memberships').update({
      tier, discount_percent: DISCOUNTS[tier],
      expires_at: tier === 'lifetime' ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    toast.success('VIP tier updated');
    load();
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">VIP Memberships</h2>
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Points</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Change Tier</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{m.profile?.username ?? '—'}</td>
                <td className="px-4 py-3"><Badge className="capitalize">{m.tier}</Badge></td>
                <td className="px-4 py-3 text-sm">{m.points} XP</td>
                <td className="px-4 py-3 text-sm">{m.discount_percent}%</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.expires_at ? new Date(m.expires_at).toLocaleDateString() : 'Lifetime'}</td>
                <td className="px-4 py-3">
                  <select
                    value={m.tier}
                    onChange={(e) => updateTier(m.id, e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-xs"
                  >
                    {TIERS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
