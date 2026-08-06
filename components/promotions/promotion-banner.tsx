'use client';

import { useEffect, useState } from 'react';
import { Flame, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type Promo = {
  id: string; title: string; content: string | null; image_url: string | null;
  link_url: string | null; end_at: string | null; countdown: boolean;
};

export function PromotionBanner() {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const now = new Date().toISOString();
    supabase
      .from('promotions')
      .select('id, title, content, image_url, link_url, end_at, countdown')
      .eq('type', 'flash_sale')
      .eq('active', true)
      .or(`start_at.is.null,start_at.lte.${now}`)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPromo(data as Promo | null));
  }, []);

  useEffect(() => {
    if (!promo?.countdown || !promo.end_at) return;
    const update = () => {
      const diff = new Date(promo.end_at!).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [promo]);

  if (!promo || dismissed) return null;

  return (
    <div className="relative overflow-hidden border-b border-border bg-card">
      {promo.image_url && (
        <div className="absolute inset-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={promo.image_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">{promo.title}</p>
            {promo.content && <p className="text-xs text-muted-foreground">{promo.content}</p>}
          </div>
          {promo.countdown && timeLeft && (
            <div className="ml-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-sm font-bold text-primary">
              {timeLeft}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {promo.link_url && (
            <Link href={promo.link_url}>
              <Button size="sm" className="gradient-primary text-white hover:opacity-90">
                Shop Now
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          )}
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
