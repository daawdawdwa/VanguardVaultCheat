'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HomeCta() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12"
      >
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />

        <div className="relative">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to build your library?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Create a free account, top up your wallet, and get instant access to premium game keys.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gradient-primary text-white hover:opacity-90 glow-primary">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
