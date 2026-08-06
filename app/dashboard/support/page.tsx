'use client';

import { useEffect, useState } from 'react';
import { LifeBuoy, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
};

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('normal');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tickets')
      .select('id, subject, status, priority, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTickets((data as unknown as Ticket[]) ?? []);
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitting(true);
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        user_id: user!.id,
        subject,
        priority,
        status: 'open',
      })
      .select()
      .single();
    if (!error && ticket) {
      await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        user_id: user!.id,
        message,
      });
    }
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Ticket created');
    setSubject('');
    setMessage('');
    load();
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">Support</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* New ticket */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Plus className="h-5 w-5 text-primary" />
            New Ticket
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Describe your issue"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide details about your issue..."
                className="bg-card"
                rows={4}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white hover:opacity-90">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Ticket'}
            </Button>
          </form>
        </div>

        {/* Existing tickets */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <MessageSquare className="h-5 w-5 text-primary" />
            Your Tickets
          </h2>
          {tickets.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t.subject}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary">
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString()} • {t.priority} priority
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
