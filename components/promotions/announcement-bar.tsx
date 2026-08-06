'use client';

import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Promo = { id: string; title: string; content: string | null; link_url: string | null };

export function AnnouncementBar() {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const now = new Date().toISOString();
    supabase
      .from('promotions')
      .select('id, title, content, link_url')
      .eq('type', 'announcement_bar')
      .eq('active', true)
      .or(`start_at.is.null,start_at.lte.${now}`)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPromo(data as Promo | null));
  }, []);

  if (!promo || dismissed) return null;

  return (
    <div className="relative gradient-primary px-4 py-2 text-center text-sm text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <Megaphone className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">{promo.title}</span>
        {promo.content && <span className="hidden opacity-90 sm:inline">— {promo.content}</span>}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
