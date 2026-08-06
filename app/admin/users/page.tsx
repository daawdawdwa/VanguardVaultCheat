'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/helpers';

type UserRow = {
  id: string;
  username: string;
  role: string;
  created_at: string;
  wallet: { balance: number } | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, username, role, created_at, wallet:wallets(balance)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers((data as unknown as UserRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'vip': return 'สมาชิก VIP';
      case 'user': return 'สมาชิกทั่วไป';
      default: return role;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'gradient-primary text-white';
      case 'vip':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-semibold">รายชื่อผู้ใช้งานทั้งหมด ({users.length})</h2>
      {users.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีผู้ใช้งานในระบบ
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ชื่อผู้ใช้</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">สิทธิ์การใช้งาน</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ยอดเงินในวอลเล็ท</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">วันที่สมัคร</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">{u.username}</td>
                  <td className="px-4 py-3">
                    <Badge className={`capitalize ${getRoleVariant(u.role)}`}>{getRoleLabel(u.role)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatPrice(u.wallet?.balance ?? 0)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
