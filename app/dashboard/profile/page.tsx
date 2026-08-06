'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(profile?.username ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username, avatar_url: avatarUrl || null })
      .eq('id', user!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success('อัปเดตโปรไฟล์สำเร็จ');
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">โปรไฟล์</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">ข้อมูลบัญชี</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-card pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email ?? ''}
                    disabled
                    className="bg-card pl-9 opacity-60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">ลิงก์รูปโปรไฟล์</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="mt-6 gradient-primary text-white hover:opacity-90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">ความปลอดภัย</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <span className="text-muted-foreground">บทบาท</span>
              <span className="capitalize text-primary">{profile?.role === 'customer' ? 'ลูกค้า' : (profile?.role ?? 'ลูกค้า')}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <span className="text-muted-foreground">2FA</span>
              <span className="text-muted-foreground">พร้อมเปิดใช้งาน</span>
            </div>
            <p className="text-xs text-muted-foreground">
              สามารถเปิดใช้งานการยืนยันตัวตนแบบสองขั้นตอนได้จากการตั้งค่าผู้ให้บริการระบบยืนยันตัวตนของคุณ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
