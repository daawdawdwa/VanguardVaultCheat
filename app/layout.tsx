import './globals.css';
import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Toaster } from '@/components/ui/sonner';
import { PromotionBanner } from '@/components/promotions/promotion-banner';
import { AnnouncementBar } from '@/components/promotions/announcement-bar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'GameVault — Premium Digital Game Keys', template: '%s — GameVault' },
  description: 'Buy digital game files and license keys instantly. Secure delivery, wallet top-ups, and a premium catalog of PC games.',
  keywords: ['game keys', 'digital games', 'pc games', 'license keys', 'game store'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'GameVault — Premium Digital Game Keys',
    description: 'Buy digital game files and license keys instantly. Secure delivery, wallet top-ups, and a premium catalog.',
    type: 'website',
    siteName: 'GameVault',
  },
  twitter: { card: 'summary_large_image', title: 'GameVault — Premium Digital Game Keys', description: 'Buy digital game files and license keys instantly.' },
};

export const themeColor = '#EF4444';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EF4444" />
      </head>
      <body className={`${inter.variable} ${sora.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <CartProvider>
              <div className="relative flex min-h-screen flex-col">
                <AnnouncementBar />
                <Navbar />
                <PromotionBanner />
                <main className="flex-1">{children}</main>
                <Footer />
                <CartDrawer />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
