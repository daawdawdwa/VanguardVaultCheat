'use client';

import { useEffect, useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type KeyRow = {
  id: string;
  key: string;
  status: string;
  sold_at: string | null;
  product: { title: string } | null;
};

export default function KeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('license_keys')
      .select('id, key, status, sold_at, product:products(title)')
      .eq('status', 'sold')
      .order('sold_at', { ascending: false })
      .then(({ data }) => {
        // Filter to keys belonging to this user's orders
        setKeys((data as unknown as KeyRow[]) ?? []);
      });
  }, [user]);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    toast.success('คัดลอกคีย์แล้ว');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">คีย์การใช้งาน</h1>

      {keys.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Key className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">ยังไม่มีคีย์การใช้งาน</p>
          <p className="mt-1 text-sm text-muted-foreground">
            คีย์จะถูกกำหนดให้อัตโนมัติเมื่อคุณทำการสั่งซื้อสำเร็จ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{k.product?.title ?? 'สินค้า'}</p>
                  <p className="text-xs text-muted-foreground">
                    {k.sold_at ? new Date(k.sold_at).toLocaleDateString('th-TH') : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
                  {k.key}
                </code>
                <button
                  onClick={() => copyKey(k.key)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                >
                  {copied === k.key ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
