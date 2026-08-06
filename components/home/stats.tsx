'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '12K+', label: 'Games sold' },
  { value: '8K+', label: 'Happy customers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Average rating' },
];

export function HomeStats() {
  return (
    <section className="relative border-y border-border bg-card/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-4xl font-bold gradient-text sm:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
