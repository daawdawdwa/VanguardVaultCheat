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
    toast.success('Profile updated');
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">Profile</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Account Info</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
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
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="avatar">Avatar URL</Label>
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
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Security</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <span className="text-muted-foreground">Role</span>
              <span className="capitalize text-primary">{profile?.role ?? 'customer'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <span className="text-muted-foreground">2FA</span>
              <span className="text-muted-foreground">Ready to enable</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Two-factor authentication can be enabled from your auth provider settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
