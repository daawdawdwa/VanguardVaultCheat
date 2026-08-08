'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Gamepad2, Search, ShoppingCart, Menu, X, User, LayoutDashboard, LogOut, Wallet, Bell } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/products', label: 'สินค้า' },
  { href: '/categories', label: 'หมวดหมู่' },
  { href: '/news', label: 'ข่าวสาร' },
  { href: '/faq', label: 'คำถามที่พบบ่อย' },
  { href: '/support', label: 'ช่วยเหลือ' },
];

export function Navbar() {
  const pathname = usePathname();
  const { count, toggle } = useCart();
  const { user, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [user, pathname]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  return (
    <header className={cn('sticky top-0 z-40 w-full transition-all duration-300', scrolled ? 'glass-strong border-b border-border' : 'border-b border-transparent')}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
  <Image
    src="components/layout/logo.png"
    alt="VanguardVaultCheat"
    width={36}
    height={36}
    className="h-9 w-9 object-contain"
    priority
  />
</div>
          <span className="font-display text-lg font-bold tracking-tight">VanguardVaultCheat</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', pathname === link.href || pathname.startsWith(link.href + '/') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/search" className="hidden flex-1 max-w-xs lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" placeholder="ค้นหาเกม..." className="h-9 border-border bg-card/50 pl-9" />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <ThemeSwitcher className="hidden sm:flex" />

          {user && (
            <Link href="/dashboard/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground" aria-label="การแจ้งเตือน">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-primary px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          <button onClick={toggle} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground" aria-label="ตะกร้าสินค้า">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-primary px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-foreground transition-colors hover:bg-secondary">
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-strong">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.username ?? 'บัญชีผู้ใช้'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />แดชบอร์ด</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/wallet" className="cursor-pointer"><Wallet className="mr-2 h-4 w-4" />กระเป๋าเงิน</Link></DropdownMenuItem>
                {isAdmin && <DropdownMenuItem asChild><Link href="/admin" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />แผงควบคุมแอดมิน</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login"><Button variant="ghost" size="sm">เข้าสู่ระบบ</Button></Link>
              <Link href="/register"><Button size="sm" className="gradient-primary text-white hover:opacity-90">สมัครสมาชิก</Button></Link>
            </div>
          )}

          <button onClick={() => setMobileOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:hidden" aria-label="เมนู">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="glass-strong border-b border-border md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            <form action="/search" className="mb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" placeholder="ค้นหาเกม..." className="h-9 border-border bg-card/50 pl-9" />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between">
              <ThemeSwitcher />
              {!user && (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">เข้าสู่ระบบ</Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full gradient-primary text-white hover:opacity-90">สมัครสมาชิก</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
