import { supabaseServer } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import { timeAgo } from '@/lib/helpers';

export const metadata: Metadata = { title: 'ข่าวสาร', description: 'ประกาศและการอัปเดตล่าสุด' };

export const revalidate = 60;

export default async function NewsPage() {
  const { data } = await supabaseServer
    .from('announcements')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false });

  const announcements = data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">ข่าวสารและประกาศ</h1>
        <p className="mt-2 text-muted-foreground">ติดตามข่าวสารและการอัปเดตล่าสุดจาก GameVault</p>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">ยังไม่มีประกาศในขณะนี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Newspaper className="h-3 w-3" />
                {timeAgo(a.created_at)}
              </div>
              <h2 className="font-display text-xl font-semibold">{a.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
