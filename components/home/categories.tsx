'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/lib/types';

export function HomeCategories({ categories }: { categories: Category[] }) {
  return (
    <section className="relative border-y border-border bg-card/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            สำรวจตามหมวดหมู่
          </h2>
          <p className="mt-2 text-muted-foreground">
            ค้นหาการผจญภัยครั้งใหม่ของคุณจากทั้งหมด {categories.length} หมวดหมู่
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/categories/${cat.slug}`}
                className="card-hover group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card"
              >
                {cat.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                <div className="relative z-10 text-center">
                  <h3 className="font-display text-lg font-semibold">{cat.name}</h3>
                  <ArrowRight className="mx-auto mt-1 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
