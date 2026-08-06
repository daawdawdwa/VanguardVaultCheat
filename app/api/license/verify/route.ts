import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
};

const MAX_DEVICES = 3;

type VerifyBody = { key?: string; product_slug?: string };

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body: VerifyBody = await req.json();
    if (!body.key) return NextResponse.json({ valid: false, error: 'Key is required' }, { status: 400, headers: corsHeaders });

    const { data: key } = await supabase
      .from('license_keys')
      .select('id, key, status, product_id, order_id, sold_at, product:products(title, slug)')
      .eq('key', body.key)
      .maybeSingle();

    if (!key) return NextResponse.json({ valid: false, error: 'Key not found' }, { status: 404, headers: corsHeaders });

    const { count: activationCount } = await supabase
      .from('license_activations')
      .select('*', { count: 'exact', head: true })
      .eq('license_key_id', key.id)
      .eq('status', 'active');

    return NextResponse.json({
      valid: key.status === 'sold',
      key: key.key,
      status: key.status,
      product: key.product,
      activations: activationCount ?? 0,
      max_devices: MAX_DEVICES,
      sold_at: key.sold_at,
    }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
