'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default {
  // หน้าเว็บเติมเงิน
};

export function WalletPage() {
  const [method, setMethod] = useState<'qrcode' | 'truemoney'>('qrcode');
  const [amount, setAmount] = useState<string>('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [giftLink, setGiftLink] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // เบอร์พร้อมเพย์ของคุณ (เปลี่ยนตรงนี้ให้แน่ใจว่าเป็นเบอร์ของคุณจริงๆ)
  const PROMPTPAY_NUMBER = "0963174205";

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('method', method);
    formData.append('amount', amount);

    if (method === 'qrcode') {
      if (!slipFile) {
        setMessage('กรุณาอัปโหลดสลิปการโอนเงิน');
        setLoading(false);
        return;
      }
      formData.append('slip', slipFile);
    } else if (method === 'truemoney') {
      if (!giftLink) {
        setMessage('กรุณากรอกลิงก์ซองของขวัญ TrueMoney');
        setLoading(false);
        return;
      }
      formData.append('link', giftLink);
    }

    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเติมเงิน');
      }

      alert(`เติมเงินสำเร็จจำนวน ฿${data.amount}`);
      window.location.reload();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // สร้าง QR Code พร้อมเพย์อัตโนมัติจากเบอร์โทรและจำนวนเงินที่กรอก
  const numericAmount = parseFloat(amount) || 0;
  const qrCodeUrl = `https://promptpay.io/${PROMPTPAY_NUMBER}/${numericAmount}`;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">เติมเงินเข้าสู่ระบบ</h2>

      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          className={`flex-1 py-2 rounded-md font-medium transition ${
            method === 'qrcode' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setMethod('qrcode')}
        >
          สแกน QR Code
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded-md font-medium transition ${
            method === 'truemoney' ? 'bg-white shadow text-red-600' : 'text-gray-600'
          }`}
          onClick={() => setMethod('truemoney')}
        >
          ซองของขวัญ TrueMoney
        </button>
      </div>

      <form onSubmit={handleTopup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงินที่ต้องการเติม (บาท)</label>
          <input
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        {method === 'qrcode' ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">สแกนเพื่อชำระเงิน (พร้อมเพย์)</p>
              {numericAmount > 0 ? (
                <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-48 h-48 object-contain bg-white p-2 rounded shadow" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-200 text-gray-500 text-sm text-center p-2 rounded">
                  กรุณากรอกจำนวนเงินเพื่อสร้าง QR Code
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">ชื่อบัญชี: สุริยันต์ ปันสาร</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดสลิปการโอนเงิน</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์ซองของขวัญ TrueMoney</label>
            <input
              type="text"
              value={giftLink}
              onChange={(e) => setGiftLink(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://gift.truemoney.com/campaign/?v=..."
            />
          </div>
        )}

        {message && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'กำลังตรวจสอบข้อมูล...' : 'ยืนยันการเติมเงิน'}
        </button>
      </form>
    </div>
  );
}

export default WalletPage;
