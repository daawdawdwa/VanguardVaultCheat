'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { generateRedeemCode } from '@/lib/services';
import { toast } from 'sonner';
import type { RedeemCode } from '@/lib/types';

export default function AdminRedeemPage() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'wallet', value: '10', max_usage: '100', per_user_limit: '1', expires_at: '', min_purchase: '0' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('redeem_codes').select('*').order('created_at', { ascending: false });
    setCodes((data as RedeemCode[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = form.code || generateRedeemCode(form.type.toUpperCase().slice(0, 3));
    const { error } = await supabase.from('redeem_codes').insert({
      code: code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      max_usage: parseInt(form.max_usage),
      per_user_limit: parseInt(form.per_user_limit),
      expires_at: form.expires_at || null,
      min_purchase: parseFloat(form.min_purchase),
      active: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Redeem code created');
    setShowForm(false);
    setForm({ code: '', type: 'wallet', value: '10', max_usage: '100', per_user_limit: '1', expires_at: '', min_purchase: '0' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this code?')) return;
    await supabase.from('redeem_codes').delete().eq('id', id);
    toast.success('Deleted');
    load();
  };

  const toggle = async (c: RedeemCode) => {
    await supabase.from('redeem_codes').update({ active: !c.active }).eq('id', c.id);
    load();
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Redeem Codes ({codes.length})</h2>
        <Button onClick={() => setShowForm(true)} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />Create Code
        </Button>
      </div>

      <div className="space-y-2">
        {codes.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
            <Gift className="h-5 w-5 text-primary" />
            <code className="flex-1 font-mono text-sm">{c.code}</code>
            <span className="text-xs text-muted-foreground capitalize">{c.type}: {c.value}</span>
            <span className="text-xs text-muted-foreground">{c.used_count}/{c.max_usage}</span>
            <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
            <button onClick={() => toggle(c)} className="text-xs text-primary hover:underline">{c.active ? 'Disable' : 'Enable'}</button>
            <button onClick={() => remove(c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">New Redeem Code</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label>Code (leave blank to auto-generate)</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Auto-generated" className="bg-card font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm">
                    <option value="wallet">Wallet Balance</option>
                    <option value="vip">VIP Upgrade</option>
                    <option value="discount">Discount</option>
                    <option value="free_product">Free Product</option>
                    <option value="free_key">Free License Key</option>
                    <option value="xp">Experience Points</option>
                    <option value="coin">Coins</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input type="number" step="0.01" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-card" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Usage</Label>
                  <Input type="number" required value={form.max_usage} onChange={(e) => setForm({ ...form, max_usage: e.target.value })} className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label>Per User Limit</Label>
                  <Input type="number" required value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })} className="bg-card" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expires At (optional)</Label>
                  <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label>Min Purchase</Label>
                  <Input type="number" step="0.01" value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} className="bg-card" />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">Create</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
