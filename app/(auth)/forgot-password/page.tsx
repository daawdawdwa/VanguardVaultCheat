'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/settings`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว');
  };

  if (sent) {
    return (
      <div className="glass-strong rounded-2xl border border-border p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold">ตรวจสอบอีเมลของคุณ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ <span className="text-foreground">{email}</span> แล้ว
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl border border-border p-8">
      <h1 className="font-display text-2xl font-bold">รีเซ็ตรหัสผ่าน</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        กรอกอีเมลของคุณแล้วเราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-card pl-9"
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full gradient-primary text-white hover:opacity-90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        จำรหัสผ่านได้แล้วใช่หรือไม่?{' '}
        <Link href="/login" className="text-primary hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
