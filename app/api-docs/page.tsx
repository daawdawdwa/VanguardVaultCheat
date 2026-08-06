import type { Metadata } from 'next';
import { Key, Check } from 'lucide-react';

export const metadata: Metadata = { title: 'เอกสารคู่มือ API' };

const endpoints = [
  { method: 'POST', path: '/api/license/verify', desc: 'ตรวจสอบความถูกต้องของคีย์ลิขสิทธิ์และดูจำนวนการเปิดใช้งาน', auth: 'ไม่ต้องยืนยันตัวตน' },
  { method: 'POST', path: '/api/license/activate', desc: 'เปิดใช้งานคีย์ลิขสิทธิ์บนอุปกรณ์ (ผูกรหัสเครื่อง)', auth: 'ไม่ต้องยืนยันตัวตน' },
  { method: 'POST', path: '/api/license/deactivate', desc: 'ปิดการใช้งานคีย์ลิขสิทธิ์บนอุปกรณ์เฉพาะเจาะจง', auth: 'ไม่ต้องยืนยันตัวตน' },
  { method: 'POST', path: '/api/license/reset', desc: 'รีเซ็ตการเปิดใช้งานทั้งหมดของคีย์ (สำหรับผู้ดูแลระบบเท่านั้น)', auth: 'โทเค็นผู้ดูแลระบบ' },
  { method: 'POST', path: '/api/license/info', desc: 'ดึงข้อมูลคีย์ลิขสิทธิ์ทั้งหมดรวมถึงประวัติการใช้งาน', auth: 'ไม่ต้องยืนยันตัวตน' },
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
          <Key className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">License Key API</h1>
        <p className="mt-2 text-muted-foreground">REST API สำหรับการตรวจสอบ เปิดใช้งาน และจัดการคีย์ลิขสิทธิ์</p>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep) => (
          <div key={ep.path} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{ep.method}</span>
              <code className="text-sm font-mono">{ep.path}</code>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{ep.desc}</p>
            <div className="mt-2 text-xs text-muted-foreground">การยืนยันตัวตน: {ep.auth}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">ตัวอย่าง: ตรวจสอบคีย์</h2>
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
        <h2 className="mb-4 font-display text-lg font-semibold">ตัวอย่าง: เปิดใช้งานคีย์</h2>
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
        <h2 className="mb-4 font-display text-lg font-semibold">คุณสมบัติเด่น</h2>
        <ul className="space-y-2 text-sm">
          {[
            'ผูกอุปกรณ์ผ่านรหัสฮาร์ดแวร์ (Hardware ID)',
            'จำกัดสูงสุด 3 อุปกรณ์ต่อคีย์',
            'บันทึก IP เมื่อมีการเปิดใช้งาน',
            'ติดตามจำนวนครั้งที่เปิดใช้งาน',
            'รองรับการปิดใช้งานอุปกรณ์',
            'ความสามารถในการรีเซ็ตโดยผู้ดูแลระบบ',
            'เปิดใช้งาน CORS',
            'รองรับระบบ Rate Limiting'
          ].map((f) => (
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
