'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Mercer',
    role: 'Verified Buyer',
    content: 'Bought three keys in one night. All delivered instantly to my dashboard. The wallet system makes checkout painless.',
    rating: 5,
  },
  {
    name: 'Sofia Nakamura',
    role: 'Verified Buyer',
    content: 'The UI is gorgeous and the download links actually work months later. Best digital game store I have used.',
    rating: 5,
  },
  {
    name: 'Daniel Okafor',
    role: 'Verified Buyer',
    content: 'Support helped me with a refund in under an hour. The manual transfer top-up was approved quickly too.',
    rating: 5,
  },
];

export function HomeTestimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Loved by gamers
        </h2>
        <p className="mt-2 text-muted-foreground">
          Real reviews from our community of verified buyers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-foreground">&ldquo;{t.content}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
