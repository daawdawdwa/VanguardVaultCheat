'use client';

import { useEffect, useState } from 'react';
import { Loader2, Activity, Monitor, Smartphone, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import type { ActivityLog } from '@/lib/types';

const categoryLabels: Record<string, string> = {
  all: 'ทั้งหมด',
  user: 'ผู้ใช้',
  admin: 'ผู้ดูแลระบบ',
  affiliate: 'พันธมิตร',
  security: 'ความปลอดภัย',
  system: 'ระบบ',
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    let query = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200);
    if (filter !== 'all') query = query.eq('category', filter);
    query.then(({ data }) => { setLogs((data as ActivityLog[]) ?? []); setLoading(false); });
  }, [filter]);

  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const categories = ['all', 'user', 'admin', 'affiliate', 'security', 'system'];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">บันทึกกิจกรรม ({logs.length})</h2>
        <div className="flex gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === cat ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-card'
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีบันทึกกิจกรรมในขณะนี้
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {log.device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{log.action}</p>
                  <Badge variant="secondary" className="text-xs capitalize">{categoryLabels[log.category] || log.category}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {log.ip_address && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{log.ip_address}</span>}
                  {log.browser && <span>{log.browser}</span>}
                  {log.os && <span>{log.os}</span>}
                  {log.device && <span>{log.device}</span>}
                  <span>{new Date(log.created_at).toLocaleString('th-TH')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
