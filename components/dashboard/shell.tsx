'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Wallet, ShoppingBag, Download, Key, User, Settings,
  LifeBuoy, Loader2, Users, Gift, Crown, Bell, Heart, Star,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/downloads', label: 'Downloads', icon: Download },
  { href: '/dashboard/keys', label: 'License Keys', icon: Key },
  { href: '/dashboard/affiliate', label: 'Affiliate', icon: Users },
  { href: '/dashboard/redeem', label: 'Redeem', icon: Gift },
  { href: '/dashboard/vip', label: 'VIP', icon: Crown },
  { href: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 lg:flex-shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0 lg:sticky lg:top-20">
            {sidebarLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  )}
                >
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
