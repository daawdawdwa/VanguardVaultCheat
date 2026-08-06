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

type ActivateBody = { key?: string; hardware_id?: string; machine_name?: string };

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body: ActivateBody = await req.json();
    if (!body.key || !body.hardware_id) {
      return NextResponse.json({ success: false, error: 'Key and hardware_id are required' }, { status: 400, headers: corsHeaders });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const { data: key } = await supabase
      .from('license_keys')
      .select('id, key, status, product:products(title, slug)')
      .eq('key', body.key)
      .maybeSingle();

    if (!key) return NextResponse.json({ success: false, error: 'Key not found' }, { status: 404, headers: corsHeaders });
    if (key.status !== 'sold') return NextResponse.json({ success: false, error: `Key status is ${key.status}` }, { status: 403, headers: corsHeaders });

    // Check if already activated on this hardware
    const { data: existing } = await supabase
      .from('license_activations')
      .select('id, status')
      .eq('license_key_id', key.id)
      .eq('hardware_id', body.hardware_id)
      .maybeSingle();

    if (existing?.status === 'active') {
      return NextResponse.json({ success: true, message: 'Already activated on this device', activation_id: existing.id }, { headers: corsHeaders });
    }

    // Check max devices
    const { count } = await supabase
      .from('license_activations')
      .select('*', { count: 'exact', head: true })
      .eq('license_key_id', key.id)
      .eq('status', 'active');

    if ((count ?? 0) >= MAX_DEVICES) {
      return NextResponse.json({ success: false, error: `Maximum ${MAX_DEVICES} devices reached` }, { status: 403, headers: corsHeaders });
    }

    const { data: activation, error } = await supabase
      .from('license_activations')
      .insert({
        license_key_id: key.id,
        hardware_id: body.hardware_id,
        ip_address: ip,
        machine_name: body.machine_name ?? null,
        status: 'active',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });

    return NextResponse.json({
      success: true,
      activation_id: activation.id,
      product: key.product,
      activated_at: activation.activated_at,
      max_devices: MAX_DEVICES,
    }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
