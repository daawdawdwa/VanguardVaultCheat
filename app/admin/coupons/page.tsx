'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Coupon } from '@/lib/types';
import { formatPrice } from '@/lib/helpers';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '10', usage_limit: '100' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('coupons').insert({
      code: form.code.toUpperCase(),
      type: form.type as 'percent' | 'fixed',
      value: parseFloat(form.value),
      usage_limit: parseInt(form.usage_limit) || null,
      active: true,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('สร้างคูปองสำเร็จ');
    setShowForm(false);
    setForm({ code: '', type: 'percent', value: '10', usage_limit: '100' });
    load();
  };

  const toggle = async (c: Coupon) => {
    await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
    toast.success('อัปเดตสถานะคูปองสำเร็จ');
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('คุณต้องการลบคูปองนี้ใช่หรือไม่?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    toast.success('ลบคูปองสำเร็จ');
    load();
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">คูปองส่วนลด ({coupons.length})</h2>
        <Button onClick={() => setShowForm(true)} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มคูปอง
        </Button>
      </div>

      <div className="space-y-2">
        {coupons.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            ยังไม่มีคูปองส่วนลดในขณะนี้
          </div>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <code className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono">{c.code}</code>
              <div className="flex-1 text-sm text-muted-foreground">
                {c.type === 'percent' ? `ลด ${c.value}%` : `ลด ${formatPrice(c.value)}`} • ใช้งานแล้ว {c.used_count}/{c.usage_limit ?? '∞'}
              </div>
              <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</Badge>
              <button onClick={() => toggle(c)} className="text-xs text-primary hover:underline">
                {c.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>
              <button onClick={() => remove(c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-md rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">สร้างคูปองใหม่</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">รหัสคูปอง</Label>
                <Input id="code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER20" className="bg-card" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ประเภทส่วนลด</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm">
                    <option value="percent">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงินคงที่ (฿)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">มูลค่า</Label>
                  <Input id="value" type="number" step="0.01" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-card" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">จำกัดจำนวนการใช้งาน</Label>
                <Input id="limit" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="bg-card" />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">สร้างคูปอง</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
