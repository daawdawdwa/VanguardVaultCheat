'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import type { Product, Category } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discount: '0',
    stock: '0',
    game_version: 'v1.0',
    thumbnail_url: '',
    category_id: '',
    featured: false,
    popular: false,
  });

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((prods as unknown as Product[]) ?? []);
    setCategories((cats as unknown as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', price: '', discount: '0', stock: '0', game_version: 'v1.0', thumbnail_url: '', category_id: '', featured: false, popular: false });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? '',
      price: String(p.price),
      discount: String(p.discount),
      stock: String(p.stock),
      game_version: p.game_version ?? 'v1.0',
      thumbnail_url: p.thumbnail_url ?? '',
      category_id: p.category_id ?? '',
      featured: p.featured,
      popular: p.popular,
    });
    setShowForm(true);
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: slugify(form.title),
      description: form.description,
      price: parseFloat(form.price) || 0,
      discount: parseInt(form.discount) || 0,
      stock: parseInt(form.stock) || 0,
      game_version: form.game_version,
      thumbnail_url: form.thumbnail_url || null,
      category_id: form.category_id || null,
      featured: form.featured,
      popular: form.popular,
    };
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('อัปเดตสินค้าสำเร็จ');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('สร้างสินค้าสำเร็จ');
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('ลบสินค้าสำเร็จ');
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">จัดการสินค้า ({products.length})</h2>
        <Button onClick={openCreate} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มสินค้า
        </Button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีสินค้าในระบบ
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                {p.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category?.name ?? 'ไม่มีหมวดหมู่'} • v{p.game_version} • คลัง: {p.stock}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.featured && <Badge className="gradient-primary text-white">แนะนำ</Badge>}
                {p.popular && <Badge variant="secondary">ยอดนิยม</Badge>}
                <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">
                {editing ? 'แก้ไขสินค้า' : 'สร้างสินค้าใหม่'}
              </h3>
              <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อสินค้า</Label>
                <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">รายละเอียด</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-card" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">ราคา (฿)</Label>
                  <Input id="price" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">ส่วนลด (%)</Label>
                  <Input id="discount" type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="bg-card" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">จำนวนคลังสินค้า</Label>
                  <Input id="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">เวอร์ชันเกม</Label>
                  <Input id="version" value={form.game_version} onChange={(e) => setForm({ ...form, game_version: e.target.value })} className="bg-card" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumb">URL รูปภาพหน้าปก</Label>
                <Input id="thumb" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat">หมวดหมู่</Label>
                <select
                  id="cat"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                >
                  <option value="">ไม่มีหมวดหมู่</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-primary" />
                  สินค้าแนะนำ (Featured)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} className="accent-primary" />
                  สินค้ายอดนิยม (Popular)
                </label>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
                {editing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างสินค้า'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
