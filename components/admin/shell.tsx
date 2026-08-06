'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Key, Users, Ticket, Tag, Newspaper, Wallet,
  Loader2, Users2, Gift, Crown, ImagePlus, Activity,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const adminLinks = [
  { href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/admin/products', label: 'สินค้า', icon: Package },
  { href: '/admin/orders', label: 'คำสั่งซื้อ', icon: ShoppingBag },
  { href: '/admin/keys', label: 'คีย์ลิขสิทธิ์', icon: Key },
  { href: '/admin/users', label: 'ผู้ใช้งาน', icon: Users },
  { href: '/admin/wallets', label: 'กระเป๋าเงิน', icon: Wallet },
  { href: '/admin/affiliates', label: 'ระบบแนะนำเพื่อน', icon: Users2 },
  { href: '/admin/redeem', label: 'โค้ดแลกรับ', icon: Gift },
  { href: '/admin/vip', label: 'VIP', icon: Crown },
  { href: '/admin/coupons', label: 'คูปองส่วนลด', icon: Tag },
  { href: '/admin/tickets', label: 'แจ้งปัญหา', icon: Ticket },
  { href: '/admin/announcements', label: 'ประกาศ', icon: Newspaper },
  { href: '/admin/promotions', label: 'โปรโมชัน', icon: ImagePlus },
  { href: '/admin/logs', label: 'บันทึกกิจกรรม', icon: Activity },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (!loading && profile && profile.role !== 'admin' && profile.role !== 'moderator') { router.push('/dashboard'); }
  }, [user, profile, loading, router]);

  if (loading || !user) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (profile && profile.role !== 'admin' && profile.role !== 'moderator') {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงส่วนนี้</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">แผงผู้ดูแลระบบ</h1>
        <p className="mt-1 text-sm text-muted-foreground">จัดการร้านค้า สินค้า และลูกค้าของคุณ</p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 lg:flex-shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0 lg:sticky lg:top-20">
            {adminLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} className={cn('flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground')}>
                  <link.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
