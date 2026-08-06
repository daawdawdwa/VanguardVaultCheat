import { supabaseServer } from '@/lib/supabase-server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LifeBuoy, MessageSquare } from 'lucide-react';

export const metadata: Metadata = { title: 'Support', description: 'Get help with your account or purchases.' };

export default async function SupportPage() {
  const { data: announcements } = await supabaseServer
    .from('announcements')
    .select('title, content')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Support Center</h1>
        <p className="mt-2 text-muted-foreground">We are here to help. Choose an option below.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link href="/dashboard/support" className="card-hover group rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-semibold">Open a Ticket</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Report an issue with a purchase, key, or download. Get a direct response from our team.
          </p>
          <span className="mt-3 inline-block text-sm text-primary">Create ticket →</span>
        </Link>

        <Link href="/faq" className="card-hover group rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-semibold">FAQ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse answers to common questions about payments, downloads, and license keys.
          </p>
          <span className="mt-3 inline-block text-sm text-primary">View FAQ →</span>
        </Link>
      </div>

      {announcements && announcements.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-semibold">Latest Updates</h2>
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
