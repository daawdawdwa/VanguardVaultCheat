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
    toast.success('อัปเดตระดับ VIP สำเร็จ');
    load();
  };

  const getTierLabel = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'free': return 'ทั่วไป';
      case 'bronze': return 'บรอนซ์';
      case 'silver': return 'ซิลเวอร์';
      case 'gold': return 'โกลด์';
      case 'diamond': return 'ไดมอนด์';
      case 'lifetime': return 'ตลอดชีพ';
      default: return tier;
    }
  };

  const getTierVariant = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'lifetime':
      case 'diamond':
        return 'gradient-primary text-white';
      case 'gold':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'silver':
        return 'bg-slate-400/10 text-slate-400';
      case 'bronze':
        return 'bg-amber-600/10 text-amber-600';
      default:
        return 'secondary';
    }
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">ระดับสมาชิก VIP ทั้งหมด ({members.length})</h2>
      {members.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูลระดับสมาชิก VIP ในระบบ
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ผู้ใช้งาน</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ระดับสมาชิก</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">คะแนนสะสม</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ส่วนลด</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">วันหมดอายุ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">เปลี่ยนระดับ</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">{m.profile?.username ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge className={`capitalize ${getTierVariant(m.tier)}`}>{getTierLabel(m.tier)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{m.points} XP</td>
                  <td className="px-4 py-3 text-sm">{m.discount_percent}%</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.expires_at ? new Date(m.expires_at).toLocaleDateString('th-TH') : 'ตลอดชีพ'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={m.tier}
                      onChange={(e) => updateTier(m.id, e.target.value)}
                      className="rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      {TIERS.map((t) => <option key={t} value={t}>{getTierLabel(t)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
