'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 radial-fade" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            จัดส่งดิจิทัลทันที
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            คีย์เกมพรีเมียม,
            <br />
            <span className="gradient-text">จัดส่งทันใจ</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            ซื้อไฟล์เกมดิจิทัลและคีย์ลิขสิทธิ์จากแคตตาล็อกที่คัดสรรมาอย่างดี การชำระเงินที่ปลอดภัย การเติมเงินกระเป๋าเงิน และเข้าถึงทุกสิ่งที่คุณซื้อได้ทันที
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/products">
              <Button size="lg" className="gradient-primary text-white hover:opacity-90 glow-primary">
                เรียกดูแคตตาล็อก
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                สร้างบัญชี
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              จัดส่งคีย์ทันที
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              การชำระเงินที่ปลอดภัย
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              ดาวน์โหลดได้ตลอดชีพ
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
