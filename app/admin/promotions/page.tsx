'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Promotion } from '@/lib/types';

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'homepage_banner', content: '', image_url: '', link_url: '',
    start_at: '', end_at: '', countdown: false, active: true,
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    setPromos((data as Promotion[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('promotions').insert({
      title: form.title,
      type: form.type,
      content: form.content || null,
      image_url: form.image_url || null,
      link_url: form.link_url || null,
      start_at: form.start_at || null,
      end_at: form.end_at || null,
      countdown: form.countdown,
      active: form.active,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('สร้างโปรโมชันสำเร็จ');
    setShowForm(false);
    setForm({ title: '', type: 'homepage_banner', content: '', image_url: '', link_url: '', start_at: '', end_at: '', countdown: false, active: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('คุณต้องการลบโปรโมชันนี้ใช่หรือไม่?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    toast.success('ลบโปรโมชันสำเร็จ');
    load();
  };

  const toggle = async (p: Promotion) => {
    await supabase.from('promotions').update({ active: !p.active }).eq('id', p.id);
    toast.success('อัปเดตสถานะโปรโมชันสำเร็จ');
    load();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'homepage_banner': return 'แบนเนอร์หน้าแรก';
      case 'popup': return 'ป๊อปอัปแจ้งเตือน';
      case 'announcement_bar': return 'แถบประกาศด้านบน';
      case 'flash_sale': return 'แฟลชเซล';
      case 'limited_offer': return 'ข้อเสนอจำกัดเวลา';
      case 'carousel': return 'สไลด์แบนเนอร์';
      default: return type;
    }
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">โปรโมชันทั้งหมด ({promos.length})</h2>
        <Button onClick={() => setShowForm(true)} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />สร้างโปรโมชัน
        </Button>
      </div>

      {promos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีโปรโมชันในระบบ
        </div>
      ) : (
        <div className="space-y-2">
          {promos.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              {p.image_url ? (
                <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">{getTypeLabel(p.type)}</p>
              </div>
              {p.countdown && <Badge variant="secondary">นับถอยหลัง</Badge>}
              <Badge variant={p.active ? 'default' : 'secondary'}>{p.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</Badge>
              <button onClick={() => toggle(p)} className="text-xs text-primary hover:underline">{p.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button>
              <button onClick={() => remove(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">สร้างโปรโมชันใหม่</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label>ชื่อโปรโมชัน</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label>ประเภทโปรโมชัน</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm">
                  <option value="homepage_banner">แบนเนอร์หน้าแรก</option>
                  <option value="popup">ป๊อปอัปแจ้งเตือน</option>
                  <option value="announcement_bar">แถบประกาศด้านบน</option>
                  <option value="flash_sale">แฟลชเซล</option>
                  <option value="limited_offer">ข้อเสนอจำกัดเวลา</option>
                  <option value="carousel">สไลด์แบนเนอร์</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>เนื้อหา</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-card" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL รูปภาพ</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label>URL ลิงก์</Label>
                  <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/products" className="bg-card" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>เวลาเริ่มต้น</Label>
                  <Input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label>เวลาสิ้นสุด</Label>
                  <Input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} className="bg-card" />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.countdown} onChange={(e) => setForm({ ...form, countdown: e.target.checked })} className="accent-primary" />
                  แสดงตัวนับถอยหลัง
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-primary" />
                  เปิดใช้งานทันที
                </label>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">สร้างโปรโมชัน</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
