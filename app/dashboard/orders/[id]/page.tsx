'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Key, Download, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';

type OrderItem = {
  id: string;
  price: number;
  product: { id: string; title: string; slug: string; thumbnail_url: string | null } | null;
  license_key: { id: string; key: string } | null;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<{
    id: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    created_at: string;
  } | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, status, subtotal, discount, tax, total, created_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setOrder(orderData as unknown as typeof order | null);
      const { data: itemData } = await supabase
        .from('order_items')
        .select('id, price, product:products(id, title, slug, thumbnail_url), license_key:license_keys(id, key)')
        .eq('order_id', id);
      setItems((itemData as unknown as OrderItem[]) ?? []);
    })();
  }, [user, id]);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    toast.success('คัดลอกคีย์ไปยังคลิปบอร์ดแล้ว');
    setTimeout(() => setCopied(null), 2000);
  };

  if (!order) {
    return <div className="py-20 text-center text-muted-foreground">กำลังโหลดคำสั่งซื้อ...</div>;
  }

  return (
    <div>
      <Link href="/dashboard/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าคำสั่งซื้อ
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            คำสั่งซื้อ #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString()} •
            <span className="ml-1 capitalize text-primary">{order.status}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">รายการสินค้า</h2>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center">
                  <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {item.product?.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.product?.slug}`} className="text-sm font-medium hover:text-primary">
                      {item.product?.title ?? 'สินค้า'}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                  </div>
                  {item.license_key ? (
                    <div className="flex items-center gap-2">
                      <code className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                        {item.license_key.key}
                      </code>
                      <button
                        onClick={() => copyKey(item.license_key!.key)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                      >
                        {copied === item.license_key.key ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">ยังไม่มีคีย์</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">สรุปคำสั่งซื้อ</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ยอดรวมย่อย</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>ส่วนลด</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">ภาษี</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>ยอดสุทธิ</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
          <Link href="/dashboard/downloads" className="mt-6 block">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              ไปยังหน้าดาวน์โหลด
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
