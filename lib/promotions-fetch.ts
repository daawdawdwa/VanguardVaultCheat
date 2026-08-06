import { supabaseServer } from './supabase-server';
import type { Promotion } from './types';

export async function fetchActivePromotion(type: string): Promise<Promotion | null> {
  const now = new Date().toISOString();
  const { data } = await supabaseServer
    .from('promotions')
    .select('*')
    .eq('type', type)
    .eq('active', true)
    .or(`start_at.is.null,start_at.lte.${now}`)
    .or(`end_at.is.null,end_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as unknown as Promotion | null;
}

export async function fetchActivePromotions(type?: string): Promise<Promotion[]> {
  const now = new Date().toISOString();
  let query = supabaseServer
    .from('promotions')
    .select('*')
    .eq('active', true)
    .or(`start_at.is.null,start_at.lte.${now}`)
    .or(`end_at.is.null,end_at.gte.${now}`)
    .order('created_at', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data } = await query;
  return (data as unknown as Promotion[]) ?? [];
}
