import Link from 'next/link';
import { Gamepad2, Twitter, Github, Mail } from 'lucide-react';

const footerLinks = {
  Store: [
    { href: '/products', label: 'All Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/search', label: 'Search' },
  ],
  Account: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/wallet', label: 'Wallet' },
    { href: '/dashboard/orders', label: 'Orders' },
    { href: '/dashboard/downloads', label: 'Downloads' },
  ],
  Support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/support', label: 'Contact Support' },
    { href: '/news', label: 'News' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">GameVault</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Premium digital game keys and files. Instant delivery, secure payments, and a catalog worth exploring.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:text-foreground" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:text-foreground" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:text-foreground" aria-label="Email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GameVault. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
