import type { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = { title: 'FAQ', description: 'Frequently asked questions.' };

const faqs = [
  { q: 'How fast do I get my license key?', a: 'Instantly. The moment your payment is confirmed, your license key and download links appear in your dashboard.' },
  { q: 'What payment methods are supported?', a: 'Wallet-based checkout with manual bank transfer (slip upload), Thai QR payment, and admin-approved top-ups.' },
  { q: 'Can I re-download my files later?', a: 'Yes. Every purchase is permanently tied to your account. Re-download anytime from your dashboard.' },
  { q: 'What if a key does not work?', a: 'Open a support ticket from your dashboard. Eligible issues get a replacement key or full refund to your wallet.' },
  { q: 'Do you offer refunds?', a: 'Yes. Submit a refund request and an admin will review it. Approved refunds credit back to your wallet.' },
  { q: 'Is my payment secure?', a: 'All payments go through wallet-based checkout with admin approval for manual transfers. Your data is protected by Supabase Auth and RLS policies.' },
  { q: 'Can I change my username?', a: 'Yes, from your dashboard Profile page. Your email and role are managed separately.' },
  { q: 'How do I contact support?', a: 'Open a support ticket from your dashboard Support page. Our team responds directly in your ticket thread.' },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to know about buying and downloading games.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq) => (
          <AccordionItem key={faq.q} value={faq.q} className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
