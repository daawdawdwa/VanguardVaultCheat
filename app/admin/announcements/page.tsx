'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Announcement } from '@/lib/types';
import { timeAgo } from '@/lib/helpers';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements((data as Announcement[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('announcements').insert({ title: form.title, content: form.content });
    if (error) { toast.error(error.message); return; }
    toast.success('Announcement published');
    setShowForm(false);
    setForm({ title: '', content: '' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    toast.success('Deleted');
    load();
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Announcements ({announcements.length})</h2>
        <Button onClick={() => setShowForm(true)} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
              </div>
              <button onClick={() => remove(a.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-md rounded-2xl border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">New Announcement</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-card" rows={4} />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">Publish</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
