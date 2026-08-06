'use client';

import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('อัปเดตรหัสผ่านเรียบร้อยแล้ว');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">การตั้งค่า</h1>

      <div className="max-w-lg rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <Lock className="h-5 w-5 text-primary" />
          เปลี่ยนรหัสผ่าน
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new">รหัสผ่านใหม่</Label>
            <Input
              id="new"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">ยืนยันรหัสผ่าน</Label>
            <Input
              id="confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง"
              className="bg-card"
            />
          </div>
          <Button type="submit" disabled={loading} className="gradient-primary text-white hover:opacity-90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'อัปเดตรหัสผ่าน'}
          </Button>
        </form>
      </div>
    </div>
  );
}
