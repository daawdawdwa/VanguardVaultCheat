import Link from 'next/link';
import { Gamepad2, Twitter, Github, Mail } from 'lucide-react';

const footerLinks = {
  ร้านค้า: [
    { href: '/products', label: 'สินค้าทั้งหมด' },
    { href: '/categories', label: 'หมวดหมู่' },
    { href: '/search', label: 'ค้นหา' },
  ],
  บัญชีผู้ใช้: [
    { href: '/dashboard', label: 'แดชบอร์ด' },
    { href: '/dashboard/wallet', label: 'กระเป๋าเงิน' },
    { href: '/dashboard/orders', label: 'คำสั่งซื้อ' },
    { href: '/dashboard/downloads', label: 'ดาวน์โหลด' },
  ],
  ช่วยเหลือ: [
    { href: '/faq', label: 'คำถามที่พบบ่อย' },
    { href: '/support', label: 'ติดต่อฝ่ายสนับสนุน' },
    { href: '/news', label: 'ข่าวสาร' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">VanguardVaultCheat</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              คีย์เกมดิจิทัลและไฟล์พรีเมียม จัดส่งทันที ชำระเงินปลอดภัย และแคตตาล็อกที่คุณต้องลองสำรวจ
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:text-foreground" aria-label="ทวิตเตอร์">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:text-foreground" aria-label="กิตฮับ">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground transition-colors hover:text-foreground" aria-label="อีเมล">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VanguardVaultCheat. สงวนลิขสิทธิ์ทั้งหมด
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">ความเป็นส่วนตัว</a>
            <a href="#" className="hover:text-foreground">เงื่อนไขการใช้งาน</a>
            <a href="#" className="hover:text-foreground">นโยบายการคืนเงิน</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
