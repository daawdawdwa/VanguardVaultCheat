'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wallet, Plus, Loader2, Upload, Clock, Check, X, QrCode, Gift, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';

// เปลี่ยนเป็นเบอร์พร้อมเพย์ หรือ เลขบัตรประชาชนของคุณ
const PROMPTPAY_NUMBER = "0963174205"; 

type Tx = {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string | null;
  created_at: string;
};

export default function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qrcode' | 'truemoney'>('qrcode');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [giftLink, setGiftLink] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    
    // ดึงยอดเงินล่าสุด
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    setBalance(wallet?.balance ?? 0);
    
    // ดึงประวัติธุรกรรม
    const { data: txData } = await supabase
      .from('transactions')
      .select('id, amount, type, status, reference, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setTxs(txData ?? []);
  }, [user]);

  useEffect(() => {
    load();
    
    // อัปเดตข้อมูลอัตโนมัติเมื่อมีการเปลี่ยนแปลงในฐานข้อมูล
    const channel = supabase
      .channel('wallet_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${user?.id}` }, () => {
        load();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${user?.id}` }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, user?.id]);

  const submitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    
    if (!amt || amt <= 0) {
      toast.error('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    if (paymentMethod === 'qrcode' && !slipFile) {
      toast.error('กรุณาอัปโหลดสลิปโอนเงิน');
      return;
    }

    if (paymentMethod === 'truemoney' && !giftLink) {
      toast.error('กรุณาระบุลิงก์ซองของขวัญ');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('method', paymentMethod);
      formData.append('amount', amount);
      
      if (paymentMethod === 'qrcode' && slipFile) {
        formData.append('slip', slipFile);
      } else if (paymentMethod === 'truemoney') {
        formData.append('link', giftLink);
      }

      // ส่งข้อมูลไปให้ API หลังบ้านตรวจสอบอัตโนมัติ
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการเติมเงิน');
      }

      toast.success(`เติมเงินสำเร็จ! ยอดเงินเข้ากระเป๋าจำนวน ฿${result.amount}`);
      
      // ล้างค่าในฟอร์ม
      setAmount('');
      setSlipFile(null);
      setGiftLink('');
      const fileInput = document.getElementById('slip') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      load(); // รีเฟรชยอดเงิน
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">กระเป๋าเงิน</h1>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">ยอดเงินคงเหลือ</p>
            <p className="mt-1 font-display text-4xl font-bold">฿{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
            <Wallet className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top-up form */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Plus className="h-5 w-5 text-primary" />
            เติมเงินอัตโนมัติ (เข้าทันที)
          </h2>
          <form onSubmit={submitTopup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">จำนวนเงินที่ต้องการเติม (THB)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50.00"
                className="bg-card text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label>ช่องทางการชำระเงิน</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qrcode')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    paymentMethod === 'qrcode'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-sm font-medium">สแกน QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('truemoney')}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    paymentMethod === 'truemoney'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  <Gift className="h-6 w-6" />
                  <span className="text-sm font-medium">ซองของขวัญทรู</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'qrcode' ? (
              <div className="space-y-4 rounded-xl border border-border bg-background p-4">
                {amount && parseFloat(amount) > 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
                    {/* ใช้ API จาก promptpay.io เพื่อสร้าง QR Code ของจริง */}
                    <img 
                      src={`https://promptpay.io/${PROMPTPAY_NUMBER}/${amount}.png`} 
                      alt="PromptPay QR Code" 
                      className="mb-3 h-48 w-48 object-contain"
                    />
                    <p className="text-sm text-gray-500">สแกนเพื่อโอนเข้าบัญชีพร้อมเพย์</p>
                    <p className="mt-1 text-lg font-bold text-black">
                      ยอดชำระ: ฿{parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card text-muted-foreground">
                    <QrCode className="mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">กรอกจำนวนเงินเพื่อแสดงคิวอาร์โค้ด</p>
                  </div>
                )}
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="slip">อัปโหลดสลิปเพื่อยืนยัน <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slip"
                      type="file"
                      accept="image/*"
                      required={paymentMethod === 'qrcode'}
                      onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                      className="bg-card cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ระบบจะตรวจสอบสลิปอัตโนมัติ หากถูกต้องยอดเงินจะเข้าทันที (ห้ามใช้สลิปซ้ำ)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 rounded-xl border border-border bg-background p-4">
                <Label htmlFor="giftLink">ลิงก์ซองของขวัญ (TrueMoney) <span className="text-destructive">*</span></Label>
                <Input
                  id="giftLink"
                  type="url"
                  required={paymentMethod === 'truemoney'}
                  value={giftLink}
                  onChange={(e) => setGiftLink(e.target.value)}
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  className="bg-card"
                />
                <p className="text-xs text-muted-foreground">
                  สร้างซองของขวัญทรูมันนี่แบบ "แบ่งจำนวนเงินเท่ากัน" ใส่ 1 คน และนำลิงก์มาวาง ระบบจะเช็คและเติมให้ทันที
                </p>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full gradient-primary text-white hover:opacity-90">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังตรวจสอบความถูกต้อง...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  เติมเงินทันที
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Transactions */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">ประวัติการทำรายการล่าสุด</h2>
          {txs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="mb-3 h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการทำรายการ</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {txs.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tx.amount < 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                      {tx.amount < 0 ? <ShoppingBag className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        {tx.reference && ` • อ้างอิง: ${tx.reference.substring(0, 8)}...`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.amount < 0 ? 'text-destructive' : 'text-green-500'}`}>
                      {tx.amount < 0 ? '-' : '+'}฿{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground mt-0.5">{tx.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
