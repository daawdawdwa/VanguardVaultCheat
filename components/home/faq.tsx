'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const faqs = [
  {
    q: 'How fast do I get my license key?',
    a: 'Instantly. The moment your payment is confirmed, your license key and download links appear in your dashboard under Orders and Downloads. No waiting, no email delays.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'You can top up your wallet via manual bank transfer with slip upload for admin approval, or Thai QR payment. Once your wallet has a balance, checkout is a single click.',
  },
  {
    q: 'Can I re-download my files later?',
    a: 'Yes. Every purchase is permanently tied to your account. You can re-download files from your dashboard at any time, with full download history tracking.',
  },
  {
    q: 'What if a key does not work?',
    a: 'Open a support ticket from your dashboard and our team will investigate. Eligible issues are resolved with a replacement key or a full refund to your wallet.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Refunds are available for eligible orders. Submit a refund request and an admin will review it. Approved refunds are credited back to your wallet balance.',
  },
];

export function HomeFaq() {
  return (
    <section className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-muted-foreground">
          Everything you need to know before your first purchase.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.q}
              value={faq.q}
              className="rounded-xl border border-border bg-card px-5"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
