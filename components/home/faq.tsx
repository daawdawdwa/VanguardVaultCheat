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
    q: 'ฉันจะได้รับคีย์ลิขสิทธิ์เร็วแค่ไหน?',
    a: 'ได้รับทันที ทันทีที่การชำระเงินของคุณได้รับการยืนยัน คีย์ลิขสิทธิ์และลิงก์ดาวน์โหลดจะปรากฏในแดชบอร์ดของคุณภายใต้หัวข้อคำสั่งซื้อและการดาวน์โหลด ไม่ต้องรอ ไม่มีความล่าช้าทางอีเมล',
  },
  {
    q: 'รองรับวิธีการชำระเงินแบบใดบ้าง?',
    a: 'คุณสามารถเติมเงินเข้ากระเป๋าเงินผ่านการโอนเงินผ่านธนาคารพร้อมอัปโหลดสลิปเพื่อให้ผู้ดูแลระบบอนุมัติ หรือการชำระเงินผ่าน Thai QR เมื่อกระเป๋าเงินของคุณมีเงินคงเหลือ การชำระเงินจะทำได้ด้วยการคลิกเพียงครั้งเดียว',
  },
  {
    q: 'ฉันสามารถดาวน์โหลดไฟล์ซ้ำในภายหลังได้หรือไม่?',
    a: 'ได้ ทุกการซื้อจะผูกติดกับบัญชีของคุณอย่างถาวร คุณสามารถดาวน์โหลดไฟล์ซ้ำจากแดชบอร์ดของคุณได้ตลอดเวลา พร้อมทั้งมีระบบติดตามประวัติการดาวน์โหลดอย่างครบถ้วน',
  },
  {
    q: 'จะเกิดอะไรขึ้นหากคีย์ใช้งานไม่ได้?',
    a: 'เปิดตั๋วแจ้งปัญหาจากแดชบอร์ดของคุณแล้วทีมงานของเราจะตรวจสอบ ปัญหาที่เข้าเงื่อนไขจะได้รับการแก้ไขด้วยการเปลี่ยนคีย์ใหม่หรือคืนเงินเต็มจำนวนเข้ากระเป๋าเงินของคุณ',
  },
  {
    q: 'มีนโยบายการคืนเงินหรือไม่?',
    a: 'มีการคืนเงินสำหรับคำสั่งซื้อที่เข้าเงื่อนไข ส่งคำขอคืนเงินแล้วผู้ดูแลระบบจะทำการตรวจสอบ การคืนเงินที่ได้รับการอนุมัติจะถูกเครดิตกลับเข้าสู่ยอดคงเหลือในกระเป๋าเงินของคุณ',
  },
];

export function HomeFaq() {
  return (
    <section className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          คำถามที่พบบ่อย
        </h2>
        <p className="mt-2 text-muted-foreground">
          ทุกสิ่งที่คุณจำเป็นต้องรู้ก่อนการสั่งซื้อครั้งแรกของคุณ
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
