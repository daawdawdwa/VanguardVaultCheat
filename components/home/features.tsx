'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Download, Wallet, Headphones, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'License keys and download links appear in your dashboard the moment payment is confirmed.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Wallet-based checkout with manual transfer, slip upload, and admin-approved top-ups.',
  },
  {
    icon: Download,
    title: 'Lifetime Downloads',
    description: 'Re-download your purchased files anytime from your dashboard. No expiry on your library.',
  },
  {
    icon: Wallet,
    title: 'Wallet System',
    description: 'Top up your balance once and check out in one click. Track every transaction.',
  },
  {
    icon: RefreshCw,
    title: 'Refund Ready',
    description: 'Request refunds on eligible orders. Admins review and process them promptly.',
  },
  {
    icon: Headphones,
    title: 'Real Support',
    description: 'Open support tickets and get responses from our team directly in your dashboard.',
  },
];

export function HomeFeatures() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Built for serious players
        </h2>
        <p className="mt-2 text-muted-foreground">
          Everything you need to buy, manage, and play your digital games.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
