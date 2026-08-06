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

  const getPriorityLabel = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'ต่ำ';
      case 'medium': return 'ปานกลาง';
      case 'high': return 'สูง';
      case 'urgent': return 'เร่งด่วน';
      default: return priority;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'bg-destructive/10 text-destructive';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'เปิดอยู่';
      case 'in_progress': return 'กำลังดำเนินการ';
      case 'resolved': return 'แก้ไขแล้ว';
      case 'closed': return 'ปิดแล้ว';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'closed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">รายการแจ้งปัญหาทั้งหมด ({tickets.length})</h2>
      {tickets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีรายการแจ้งปัญหาในขณะนี้
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {t.profile?.username ?? 'ไม่ทราบชื่อ'} • {new Date(t.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              <Badge className={`capitalize ${getPriorityVariant(t.priority)}`}>{getPriorityLabel(t.priority)}</Badge>
              <Badge className={`capitalize ${getStatusVariant(t.status)}`}>{getStatusLabel(t.status)}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
