import { supabaseServer } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LifeBuoy, MessageSquare } from 'lucide-react';

export const metadata: Metadata = { title: 'ช่วยเหลือ', description: 'รับความช่วยเหลือเกี่ยวกับบัญชีหรือการสั่งซื้อของคุณ' };

export default async function SupportPage() {
  const { data: announcements } = await supabaseServer
    .from('announcements')
    .select('title, content')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">ศูนย์ช่วยเหลือ</h1>
        <p className="mt-2 text-muted-foreground">เราพร้อมช่วยเหลือคุณ เลือกตัวเลือกด้านล่างได้เลย</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link href="/dashboard/support" className="card-hover group rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-semibold">เปิดคำร้องช่วยเหลือ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            รายงานปัญหาเกี่ยวกับการสั่งซื้อ คีย์ หรือการดาวน์โหลด และรับการตอบกลับโดยตรงจากทีมงานของเรา
          </p>
          <span className="mt-3 inline-block text-sm text-primary">สร้างคำร้อง →</span>
        </Link>

        <Link href="/faq" className="card-hover group rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-semibold">คำถามที่พบบ่อย</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เรียกดูคำตอบสำหรับคำถามทั่วไปเกี่ยวกับการชำระเงิน การดาวน์โหลด และคีย์การใช้งาน
          </p>
          <span className="mt-3 inline-block text-sm text-primary">ดูคำถามที่พบบ่อย →</span>
        </Link>
      </div>

      {announcements && announcements.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-semibold">อัปเดตล่าสุด</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.title} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-medium">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
