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

type ResetBody = { key?: string; admin_token?: string };

export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body: ResetBody = await req.json();
    if (!body.key) return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400, headers: corsHeaders });

    // Admin-only: require admin_token matching service role key prefix
    if (!body.admin_token) {
      return NextResponse.json({ success: false, error: 'Admin token required for reset' }, { status: 403, headers: corsHeaders });
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
      .eq('status', 'active');

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });

    return NextResponse.json({ success: true, message: 'All activations reset', max_devices: MAX_DEVICES }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
