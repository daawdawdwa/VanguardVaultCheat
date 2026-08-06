import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ข้อมูลสำหรับตรวจสอบว่าโอนเข้าบัญชีเราจริงหรือไม่
const MY_ACCOUNT_NAME = "สุริยันต์ ปันสาร"; // หรือชื่อบริษัทของคุณ

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // เช็คว่าผู้ใช้ล็อกอินอยู่หรือไม่
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const method = formData.get('method');
  const amountToTopup = parseFloat(formData.get('amount') as string);

  try {
    let transactionRef = "";
    let actualAmount = 0;

    if (method === 'qrcode') {
      const slipFile = formData.get('slip') as File;
      if (!slipFile) throw new Error('ไม่พบไฟล์สลิป');

      // ---------------------------------------------------------
      // [ส่วนของการตรวจสอบสลิปของจริงด้วย API เช่น SlipOk, EasySlip]
      // ---------------------------------------------------------
      // ในตัวอย่างนี้คือการจำลอง (Mock) การทำงานจริง คุณต้องนำ API Key 
      // ของผู้ให้บริการเช็คสลิป (เช่น https://slipok.com) มายิง fetch ที่นี่
      
      /* ตัวอย่างโค้ดใช้งานจริงกับ API เช็คสลิป:
      const slipData = new FormData();
      slipData.append('files', slipFile);
      const verifyRes = await fetch('https://api.slipok.com/api/line/apikey/xxxx', {
         method: 'POST', body: slipData, headers: { 'x-authorization': 'YOUR_API_KEY' }
      });
      const slipResult = await verifyRes.json();
      
      if (!slipResult.success) throw new Error('สลิปไม่ถูกต้อง หรืออ่านสลิปไม่ได้');
      if (!slipResult.data.receiver.name.includes(MY_ACCOUNT_NAME)) throw new Error('บัญชีผู้รับโอนไม่ถูกต้อง');
      
      transactionRef = slipResult.data.transRef; // เลขอ้างอิงจากธนาคาร
      actualAmount = slipResult.data.amount;     // ยอดเงินที่โอนจริงตามสลิป
      */

      // *** สำหรับทดสอบ: สมมติว่าดึงค่าได้สำเร็จ (เมื่อต่อ API จริงให้ลบส่วนนี้ออก) ***
      transactionRef = `BANK-${Date.now()}`; 
      actualAmount = amountToTopup; 
      // ***************************************************************

      if (actualAmount !== amountToTopup) {
         throw new Error(`ยอดเงินในสลิป (฿${actualAmount}) ไม่ตรงกับที่กรอก`);
      }

    } else if (method === 'truemoney') {
      const link = formData.get('link') as string;
      if (!link.includes('gift.truemoney.com')) throw new Error('ลิงก์ซองของขวัญไม่ถูกต้อง');

      // ---------------------------------------------------------
      // [ส่วนของการดึงยอดจากซอง TrueMoney]
      // ---------------------------------------------------------
      // คุณต้องใช้ TrueMoney Voucher API เพื่อเช็ค/รับซอง
      // เช่นสกัด Hash จาก URL แล้วส่ง Request ขอรับซองด้วยเบอร์โทรของคุณ
      
      /* ตัวอย่างการทำงานจริง (ต้องเขียนเชื่อมต่อกับระบบ TrueMoney):
      const voucherCode = link.split('v=')[1];
      const tmRes = await fetch('YOUR_TRUEMONEY_REDEEM_API', { ... });
      const tmData = await tmRes.json();
      
      if (tmData.status !== 'SUCCESS') throw new Error('ซองนี้ถูกใช้งานไปแล้วหรือหมดอายุ');
      
      transactionRef = tmData.ticket_id;
      actualAmount = tmData.amount;
      */

      // *** สำหรับทดสอบ ***
      transactionRef = `TRUE-${Date.now()}`;
      actualAmount = amountToTopup;
      // ******************
    } else {
      throw new Error('ช่องทางชำระเงินไม่ถูกต้อง');
    }

    // 1. เช็คในฐานข้อมูลว่า Transaction Reference (เลขอ้างอิงสลิป) นี้เคยถูกใช้ไปหรือยัง?
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', transactionRef)
      .single();

    if (existingTx) {
      throw new Error('สลิปหรือซองของขวัญนี้ถูกใช้งานไปแล้ว ไม่สามารถเติมซ้ำได้');
    }

    // 2. ดึงยอดเงินปัจจุบันในกระเป๋า
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      throw new Error('ไม่พบกระเป๋าเงินของคุณในระบบ');
    }

    const currentBalance = wallet ? wallet.balance : 0;
    const newBalance = currentBalance + actualAmount;

    // 3. เริ่มอัปเดตยอดเงิน และบันทึกประวัติ 
    // (ใช้ upsert เพราะถ้าไม่เคยมีกระเป๋าเงินจะสร้างให้ใหม่)
    const { error: updateError } = await supabase
      .from('wallets')
      .upsert({ user_id: user.id, balance: newBalance });

    if (updateError) throw new Error('เกิดข้อผิดพลาดในการอัปเดตยอดเงิน');

    // 4. บันทึกประวัติ Transaction เพื่อกันนำสลิปเก่ามาใช้ซ้ำ
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: actualAmount,
        type: 'topup',
        status: 'completed', // เข้าทันที
        reference: transactionRef
      });

    if (txError) throw new Error('เกิดข้อผิดพลาดในการบันทึกประวัติ');

    return NextResponse.json({ success: true, amount: actualAmount });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
