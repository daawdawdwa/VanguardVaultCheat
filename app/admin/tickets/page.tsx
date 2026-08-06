'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  profile: { username: string } | null;
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('tickets')
      .select('id, subject, status, priority, created_at, profile:profiles(username)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTickets((data as unknown as Ticket[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">Support Tickets ({tickets.length})</h2>
      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tickets.</p>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {t.profile?.username ?? 'Unknown'} • {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge className="capitalize">{t.priority}</Badge>
              <Badge variant="secondary" className="capitalize">{t.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
