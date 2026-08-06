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

type InfoBody = { key?: string };

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body: InfoBody = await req.json();
    if (!body.key) return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400, headers: corsHeaders });

    const { data: key } = await supabase
      .from('license_keys')
      .select('id, key, status, sold_at, reserved_at, created_at, product:products(id, title, slug, game_version)')
      .eq('key', body.key)
      .maybeSingle();

    if (!key) return NextResponse.json({ success: false, error: 'Key not found' }, { status: 404, headers: corsHeaders });

    const { data: activations } = await supabase
      .from('license_activations')
      .select('id, hardware_id, ip_address, machine_name, activated_at, deactivated_at, status')
      .eq('license_key_id', key.id)
      .order('activated_at', { ascending: false });

    return NextResponse.json({
      success: true,
      key: key.key,
      status: key.status,
      product: key.product,
      sold_at: key.sold_at,
      max_devices: MAX_DEVICES,
      active_devices: (activations ?? []).filter((a) => a.status === 'active').length,
      activations: activations ?? [],
    }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
