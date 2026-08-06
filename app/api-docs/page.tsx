import type { Metadata } from 'next';
import { Key, Check, X } from 'lucide-react';

export const metadata: Metadata = { title: 'API Documentation' };

const endpoints = [
  { method: 'POST', path: '/api/license/verify', desc: 'Verify a license key validity and get activation count', auth: 'None' },
  { method: 'POST', path: '/api/license/activate', desc: 'Activate a license key on a device (machine binding)', auth: 'None' },
  { method: 'POST', path: '/api/license/deactivate', desc: 'Deactivate a license key on a specific device', auth: 'None' },
  { method: 'POST', path: '/api/license/reset', desc: 'Reset all activations for a key (admin only)', auth: 'Admin Token' },
  { method: 'POST', path: '/api/license/info', desc: 'Get full license info including all activations', auth: 'None' },
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
          <Key className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">License Key API</h1>
        <p className="mt-2 text-muted-foreground">REST API for license key validation, activation, and management.</p>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep) => (
          <div key={ep.path} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{ep.method}</span>
              <code className="text-sm font-mono">{ep.path}</code>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{ep.desc}</p>
            <div className="mt-2 text-xs text-muted-foreground">Auth: {ep.auth}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Example: Verify Key</h2>
        <pre className="overflow-x-auto rounded-lg bg-background p-4 text-xs text-muted-foreground">
{`POST /api/license/verify
Content-Type: application/json

{
  "key": "GV-XXXX-XXXX-XXXX",
  "product_slug": "neon-reckoning"
}

Response:
{
  "valid": true,
  "key": "GV-XXXX-XXXX-XXXX",
  "status": "sold",
  "product": { "title": "Neon Reckoning", "slug": "neon-reckoning" },
  "activations": 1,
  "max_devices": 3,
  "sold_at": "2026-01-15T..."
}`}
        </pre>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Example: Activate Key</h2>
        <pre className="overflow-x-auto rounded-lg bg-background p-4 text-xs text-muted-foreground">
{`POST /api/license/activate
Content-Type: application/json

{
  "key": "GV-XXXX-XXXX-XXXX",
  "hardware_id": "CPU-INT-1234-GPU-NV-5678",
  "machine_name": "Gaming-PC"
}

Response:
{
  "success": true,
  "activation_id": "uuid",
  "product": { "title": "Neon Reckoning" },
  "activated_at": "2026-...",
  "max_devices": 3
}`}
        </pre>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Features</h2>
        <ul className="space-y-2 text-sm">
          {['Machine binding via hardware ID', 'Maximum 3 devices per key', 'IP logging on activation', 'Activation count tracking', 'Deactivation support', 'Admin reset capability', 'CORS enabled', 'Rate limiting ready'].map((f) => (
            <li key={f} className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
