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

type DeactivateBody = { key?: string; hardware_id?: string };

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body: DeactivateBody = await req.json();
    if (!body.key || !body.hardware_id) {
      return NextResponse.json({ success: false, error: 'Key and hardware_id are required' }, { status: 400, headers: corsHeaders });
    }

    const { data: key } = await supabase
      .from('license_keys')
      .select('id')
      .eq('key', body.key)
      .maybeSingle();

    if (!key) return NextResponse.json({ success: false, error: 'Key not found' }, { status: 404, headers: corsHeaders });

    const { error } = await supabase
      .from('license_activations')
      .update({ status: 'deactivated', deactivated_at: new Date().toISOString() })
      .eq('license_key_id', key.id)
      .eq('hardware_id', body.hardware_id)
      .eq('status', 'active');

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });

    return NextResponse.json({ success: true, message: 'Device deactivated' }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
