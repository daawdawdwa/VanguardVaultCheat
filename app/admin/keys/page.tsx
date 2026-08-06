'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Key, Upload, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

type KeyRow = {
  id: string;
  key: string;
  status: string;
  product: { title: string } | null;
};

export default function AdminKeysPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState('');
  const [keyText, setKeyText] = useState('');
  const [genCount, setGenCount] = useState('10');

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: keyData }] = await Promise.all([
      supabase.from('products').select('id, title').order('title'),
      supabase.from('license_keys').select('id, key, status, product:products(title)').order('created_at', { ascending: false }).limit(100),
    ]);
    setProducts((prods as unknown as Product[]) ?? []);
    setKeys((keyData as unknown as KeyRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const importKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast.error('Select a product'); return; }
    const lines = keyText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast.error('Enter at least one key'); return; }
    const rows = lines.map((k) => ({ product_id: productId, key: k, status: 'unused' }));
    const { error } = await supabase.from('license_keys').insert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success(`${lines.length} keys imported`);
    setShowForm(false);
    setKeyText('');
    load();
  };

  const generateKeys = async () => {
    if (!productId) { toast.error('Select a product'); return; }
    const count = parseInt(genCount) || 10;
    const prefix = 'GV-';
    const rows = Array.from({ length: count }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return { product_id: productId, key: `${prefix}${seg()}-${seg()}-${seg()}`, status: 'unused' as const };
    });
    const { error } = await supabase.from('license_keys').insert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success(`${count} keys generated`);
    load();
  };

  const removeKey = async (id: string) => {
    if (!confirm('Delete this key?')) return;
    const { error } = await supabase.from('license_keys').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Key deleted');
    load();
  };

  const statusColor = (s: string) => {
    if (s === 'sold') return 'gradient-primary text-white';
    if (s === 'unused') return 'bg-green-500/10 text-green-500';
    if (s === 'reserved') return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">License Keys</h2>
        <Button onClick={() => setShowForm(true)} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          Import / Generate
        </Button>
      </div>

      {/* Quick generate */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium">Quick Generate</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="flex h-10 rounded-lg border border-border bg-card px-3 text-sm"
          >
            <option value="">Select product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <Input type="number" value={genCount} onChange={(e) => setGenCount(e.target.value)} className="w-32 bg-card" placeholder="Count" />
          <Button onClick={generateKeys} variant="outline">
            <Key className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <code className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-1.5 text-xs">{k.key}</code>
              <span className="text-xs text-muted-foreground">{k.product?.title ?? '—'}</span>
              <Badge className={statusColor(k.status)}>{k.status}</Badge>
              <button onClick={() => removeKey(k.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border p-6">
            <h3 className="mb-4 font-display text-lg font-semibold">Import Keys</h3>
            <form onSubmit={importKeys} className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keys">Keys (one per line, or paste TXT/CSV content)</Label>
                <Textarea
                  id="keys"
                  value={keyText}
                  onChange={(e) => setKeyText(e.target.value)}
                  placeholder={'XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY'}
                  className="bg-card font-mono text-sm"
                  rows={8}
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
                <Upload className="mr-2 h-4 w-4" />
                Import Keys
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
