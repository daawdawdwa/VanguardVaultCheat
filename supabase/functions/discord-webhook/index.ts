import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
};

type WebhookEvent = {
  event: string;
  title: string;
  description: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  mention_role_id?: string;
};

const EVENT_COLORS: Record<string, number> = {
  new_user: 0x22c55e,
  new_purchase: 0xef4444,
  top_up: 0x3b82f6,
  refund: 0xf59e0b,
  new_ticket: 0xa855f7,
  product_published: 0x10b981,
  product_updated: 0x06b6d4,
  affiliate_withdraw: 0xf43f5e,
  server_error: 0xdc2626,
  login_alert: 0xeab308,
  security_alert: 0xdc2626,
  admin_action: 0x6366f1,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: WebhookEvent = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Fetch webhook URL from settings (stored as a secret or in a config table)
    // For now, use environment variable
    const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");

    if (!webhookUrl) {
      return new Response(JSON.stringify({ success: false, error: "Discord webhook URL not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const color = body.color ?? EVENT_COLORS[body.event] ?? 0x6366f1;

    const embed: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      color,
      timestamp: new Date().toISOString(),
      footer: { text: "GameVault Notifications" },
    };

    if (body.fields && body.fields.length > 0) {
      embed.fields = body.fields;
    }

    const payload: Record<string, unknown> = {
      embeds: [embed],
    };

    if (body.mention_role_id) {
      payload.content = `<@&${body.mention_role_id}>`;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: `Discord API error: ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the webhook send
    await supabase.from("activity_logs").insert({
      action: "discord_webhook_sent",
      category: "system",
      details: { event: body.event, title: body.title },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
