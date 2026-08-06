'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Download, Wallet, Headphones, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'จัดส่งทันที',
    description: 'คีย์ลิขสิทธิ์และลิงก์ดาวน์โหลดจะปรากฏในแดชบอร์ดของคุณทันทีที่การชำระเงินได้รับการยืนยัน',
  },
  {
    icon: ShieldCheck,
    title: 'การชำระเงินที่ปลอดภัย',
    description: 'การชำระเงินผ่านกระเป๋าเงินด้วยการโอนเงินผ่านธนาคาร อัปโหลดสลิป และการเติมเงินที่อนุมัติโดยผู้ดูแลระบบ',
  },
  {
    icon: Download,
    title: 'ดาวน์โหลดได้ตลอดชีพ',
    description: 'ดาวน์โหลดไฟล์ที่คุณซื้อซ้ำได้ตลอดเวลาจากแดชบอร์ดของคุณ ไม่มีวันหมดอายุในคลังของคุณ',
  },
  {
    icon: Wallet,
    title: 'ระบบกระเป๋าเงิน',
    description: 'เติมเงินเข้ายอดคงเหลือของคุณครั้งเดียวและชำระเงินได้ด้วยคลิกเดียว ติดตามทุกธุรกรรมได้',
  },
  {
    icon: RefreshCw,
    title: 'รองรับการคืนเงิน',
    description: 'ขอคืนเงินสำหรับคำสั่งซื้อที่เข้าเงื่อนไข ผู้ดูแลระบบจะตรวจสอบและดำเนินการอย่างรวดเร็ว',
  },
  {
    icon: Headphones,
    title: 'การสนับสนุนจริง',
    description: 'เปิดตั๋วแจ้งปัญหาและรับการตอบกลับจากทีมงานของเราได้โดยตรงในแดชบอร์ดของคุณ',
  },
];

export function HomeFeatures() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          สร้างมาเพื่อผู้เล่นตัวจริง
        </h2>
        <p className="mt-2 text-muted-foreground">
          ทุกสิ่งที่คุณต้องการสำหรับการซื้อ จัดการ และเล่นเกมดิจิทัลของคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
