import type { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = { title: 'คำถามที่พบบ่อย', description: 'คำถามที่พบบ่อยเกี่ยวกับการซื้อและการดาวน์โหลดเกม' };

const faqs = [
  { q: 'จะได้รับคีย์การใช้งานเร็วแค่ไหน?', a: 'ทันที ทันทีที่การชำระเงินของคุณได้รับการยืนยัน คีย์การใช้งานและลิงก์ดาวน์โหลดจะปรากฏในแดชบอร์ดของคุณ' },
  { q: 'รองรับช่องทางการชำระเงินใดบ้าง?', a: 'ชำระเงินผ่านระบบกระเป๋าเงิน รองรับการโอนเงินผ่านธนาคารพร้อมอัปโหลดสลิป, พร้อมเพย์/QR และการเติมเงินที่ได้รับการอนุมัติจากแอดมิน' },
  { q: 'สามารถดาวน์โหลดไฟล์ซ้ำในภายหลังได้หรือไม่?', a: 'ได้ การซื้อทุกรายการจะผูกติดกับบัญชีของคุณอย่างถาวร คุณสามารถดาวน์โหลดซ้ำได้ตลอดเวลาจากแดชบอร์ด' },
  { q: 'หากคีย์ใช้งานไม่ได้ต้องทำอย่างไร?', a: 'เปิดคำร้องช่วยเหลือจากแดชบอร์ดของคุณ ปัญหาที่เข้าเงื่อนไขจะได้รับคีย์ใหม่ทดแทนหรือรับเงินคืนเต็มจำนวนเข้ากระเป๋าเงิน' },
  { q: 'มีการคืนเงินหรือไม่?', a: 'มี ส่งคำขอคืนเงินแล้วแอดมินจะทำการตรวจสอบ หากได้รับการอนุมัติ ยอดเงินจะถูกคืนเข้ากระเป๋าเงินของคุณ' },
  { q: 'การชำระเงินมีความปลอดภัยหรือไม่?', a: 'การชำระเงินทั้งหมดดำเนินการผ่านระบบกระเป๋าเงินพร้อมการตรวจสอบอนุมัติโดยแอดมิน ข้อมูลของคุณได้รับการปกป้องด้วยระบบตรวจสอบสิทธิ์ของ Supabase และนโยบาย RLS' },
  { q: 'สามารถเปลี่ยนชื่อผู้ใช้ได้หรือไม่?', a: 'ได้ จากหน้าโปรไฟล์ในแดชบอร์ดของคุณ ส่วนอีเมลและบทบาทผู้ใช้จะถูกจัดการแยกต่างหาก' },
  { q: 'จะติดต่อฝ่ายสนับสนุนได้อย่างไร?', a: 'เปิดคำร้องช่วยเหลือได้จากหน้าช่วยเหลือในแดชบอร์ด ทีมงานของเราจะตอบกลับโดยตรงในกระทู้คำร้องของคุณ' },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          คำถามที่พบบ่อย
        </h1>
        <p className="mt-2 text-muted-foreground">
          ทุกสิ่งที่คุณจำเป็นต้องรู้เกี่ยวกับการซื้อและการดาวน์โหลดเกม
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
