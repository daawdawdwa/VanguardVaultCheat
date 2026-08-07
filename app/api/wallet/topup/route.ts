import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SLIPOK_API_KEY = process.env.SLIPOK_API_KEY || "SLIPOKPPVSNU9"; 
const SLIPOK_BRANCH_ID = process.env.SLIPOK_BRANCH_ID || "73152"; 
const TRUEMONEY_MOBILE = process.env.TRUEMONEY_MOBILE || "0963174205"; 

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
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
      if (!SLIPOK_API_KEY || !SLIPOK_BRANCH_ID) throw new Error('ระบบตรวจสอบสลิปยังไม่พร้อมใช้งาน (ขาดข้อมูล SlipOK)');

      const slipData = new FormData();
      slipData.append('files', slipFile);

      const verifyRes = await fetch(`https://api.slipok.com/api/line/apikey/${SLIPOK_BRANCH_ID}`, {
         method: 'POST', 
         body: slipData, 
         headers: { 
           'x-authorization': SLIPOK_API_KEY 
         }
      });
      
      const slipResult = await verifyRes.json();
      
      if (!slipResult.success) {
        throw new Error('สลิปไม่ถูกต้อง หรืออ่านสลิปไม่ได้: ' + (slipResult.message || ''));
      }
      
      const receiverData = slipResult.data.receiver || {};
      const receiverName = (receiverData.name || receiverData.displayName || "").toUpperCase();
      
      const isValidReceiver = 
        receiverName.includes("สุริยันต์") || 
        receiverName.includes("ปันสาร") || 
        receiverName.includes("SURIYAN");
      
      if (!isValidReceiver) {
        throw new Error(`ชื่อผู้รับในสลิปคือ "${receiverName}" ซึ่งไม่ตรงกับบัญชีของคุณ`);
      }
      
      transactionRef = slipResult.data.transRef; 
      actualAmount = slipResult.data.amount;     

      if (actualAmount !== amountToTopup) {
         throw new Error(`ยอดเงินในสลิป (฿${actualAmount}) ไม่ตรงกับที่กรอก (฿${amountToTopup})`);
      }

    } else if (method === 'truemoney') {
      const link = formData.get('link') as string;
      if (!link.includes('gift.truemoney.com')) throw new Error('ลิงก์ซองของขวัญไม่ถูกต้อง');
      if (!TRUEMONEY_MOBILE) throw new Error('ระบบรับซองยังไม่พร้อมใช้งาน (ขาดเบอร์โทรศัพท์)');

      const voucherHash = link.split('v=')[1];
      if (!voucherHash) throw new Error('รูปแบบลิงก์ไม่ถูกต้อง ไม่พบรหัสซอง');

      const tmRes = await fetch(`https://gift.truemoney.com/campaign/vouchers/${voucherHash}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          mobile: TRUEMONEY_MOBILE,
          voucher_hash: voucherHash
        })
      });

      const tmData = await tmRes.json();
      
      if (tmData.status?.code !== 'SUCCESS') {
        const errorMsg = tmData.status?.message || 'ซองนี้ถูกใช้งานไปแล้วหรือหมดอายุ';
        throw new Error(`ไม่สามารถรับซองได้: ${errorMsg}`);
      }
      
      const ticket = tmData.data.ticket;
      transactionRef = tmData.data.voucher?.voucher_id || ticket; 
      actualAmount = parseFloat(tmData.data.my_ticket.amount_baht);

    } else {
      throw new Error('ช่องทางชำระเงินไม่ถูกต้อง');
    }

    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', transactionRef)
      .single();

    if (existingTx) {
      throw new Error('สลิปหรือซองของขวัญนี้ถูกใช้งานไปแล้ว ไม่สามารถเติมซ้ำได้');
    }

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

    // แก้ไขจุดนี้โดยระบุ onConflict เป็น user_id เพื่อให้ระบบอัปเดตกระเป๋าเงินของ User คนนี้ได้อย่างถูกต้อง
    const { error: updateError } = await supabase
      .from('wallets')
      .upsert({ user_id: user.id, balance: newBalance }, { onConflict: 'user_id' });

    if (updateError) throw new Error('เกิดข้อผิดพลาดในการอัปเดตยอดเงิน: ' + updateError.message);

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: actualAmount,
        type: 'topup',
        status: 'completed',
        reference: transactionRef
      });

    if (txError) throw new Error('เกิดข้อผิดพลาดในการบันทึกประวัติ');

    return NextResponse.json({ success: true, amount: actualAmount });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
