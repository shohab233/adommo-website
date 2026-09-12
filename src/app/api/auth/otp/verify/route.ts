import { NextRequest, NextResponse } from 'next/server';
import { db, signToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, purpose = 'forgot_password' } = body;

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'ইমেইল এবং ওটিপি কোড উভয়ই প্রদান করুন।' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const validRecord = db.findOne<any>('otps', o => 
      o.email?.toLowerCase() === cleanEmail && 
      o.purpose === purpose &&
      o.otp === cleanOtp &&
      o.expiresAt > Date.now()
    );

    if (!validRecord) {
      return NextResponse.json({ success: false, error: 'ভুল ওটিপি কোড অথবা কোডের মেয়াদ শেষ হয়ে গেছে।' }, { status: 400 });
    }

    // Delete verified OTP so it cannot be reused
    db.delete('otps', validRecord.id);

    // Generate verified reset token valid for 15 minutes
    const resetToken = signToken({ email: cleanEmail, purpose: 'verified_reset', verifiedAt: Date.now() }, 0.25);

    return NextResponse.json({
      success: true,
      message: 'ওটিপি কোড সফলভাবে যাচাই সম্পন্ন হয়েছে।',
      resetToken,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
