'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Mercer',
    role: 'ผู้ซื้อที่ได้รับการยืนยัน',
    content: 'ซื้อสามคีย์ในคืนเดียว ได้รับเข้าแดชบอร์ดทันที ระบบกระเป๋าเงินทำให้การชำระเงินง่ายดายไม่มีสะดุด',
    rating: 5,
  },
  {
    name: 'Sofia Nakamura',
    role: 'ผู้ซื้อที่ได้รับการยืนยัน',
    content: 'ส่วนติดต่อผู้ใช้นั้นสวยงามมาก และลิงก์ดาวน์โหลดก็ยังคงใช้งานได้จริงแม้จะผ่านไปหลายเดือนแล้ว ร้านค้าเกมดิจิทัลที่ดีที่สุดเท่าที่เคยใช้มา',
    rating: 5,
  },
  {
    name: 'Daniel Okafor',
    role: 'ผู้ซื้อที่ได้รับการยืนยัน',
    content: 'ทีมช่วยเหลือช่วยจัดการเรื่องคืนเงินให้ภายในเวลาไม่ถึงหนึ่งชั่วโมง การเติมเงินผ่านการโอนเงินก็ได้รับการอนุมัติอย่างรวดเร็วเช่นกัน',
    rating: 5,
  },
];

export function HomeTestimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          เป็นที่ชื่นชอบของเหล่าเกมเมอร์
        </h2>
        <p className="mt-2 text-muted-foreground">
          รีวิวจากใจจริงของชุมชนผู้ซื้อที่ได้รับการยืนยันตัวตน
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
