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
    toast.success('Promotion created');
    setShowForm(false);
    setForm({ title: '', type: 'homepage_banner', content: '', image_url: '', link_url: '', start_at: '', end_at: '', countdown: false, active: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    toast.success('Deleted');
    load();
  };

  const toggle = async (p: Promotion) => {
    await supabase.from('promotions').update({ active: !p.active }).eq('id', p.id);
    load();
  };

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Promotions ({promos.length})</h2>
        <Button onClick={() => setShowForm(true)} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />New Promotion
        </Button>
      </div>

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
              <p className="text-xs text-muted-foreground capitalize">{p.type.replace(/_/g, ' ')}</p>
            </div>
            {p.countdown && <Badge variant="secondary">Countdown</Badge>}
            <Badge variant={p.active ? 'default' : 'secondary'}>{p.active ? 'Active' : 'Inactive'}</Badge>
            <button onClick={() => toggle(p)} className="text-xs text-primary hover:underline">{p.active ? 'Disable' : 'Enable'}</button>
            <button onClick={() => remove(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">New Promotion</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-card" /></div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm">
                  <option value="homepage_banner">Homepage Banner</option>
                  <option value="popup">Popup Banner</option>
                  <option value="announcement_bar">Announcement Bar</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="limited_offer">Limited Time Offer</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-card" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="bg-card" /></div>
                <div className="space-y-2"><Label>Link URL</Label><Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/products" className="bg-card" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start At</Label><Input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} className="bg-card" /></div>
                <div className="space-y-2"><Label>End At</Label><Input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} className="bg-card" /></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.countdown} onChange={(e) => setForm({ ...form, countdown: e.target.checked })} className="accent-primary" />Countdown Timer</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-primary" />Active</label>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">Create</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
