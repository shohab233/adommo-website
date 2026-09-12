import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendMailViaGmail, getOtpHtmlEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purpose = 'forgot_password' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // If forgot password, ensure user actually exists
    let userName = '';
    if (purpose === 'forgot_password') {
      const user = await db.findOneAsync<any>('users', (u: any) => u.email?.toLowerCase() === cleanEmail);
      if (!user) {
        return NextResponse.json({ success: false, error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' }, { status: 404 });
      }
      userName = user.name;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Store in MongoDB Atlas & await persistence
    await db.createAsync('otps', {
      email: cleanEmail,
      otp,
      purpose,
      expiresAt,
    });

    console.log(`⚡ [REAL OTP GENERATED] For: ${cleanEmail} | OTP: ${otp} | Purpose: ${purpose}`);

    // Send via Gmail SMTP
    const subject = purpose === 'forgot_password'
      ? `[${otp}] Adommo EdTech - পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড`
      : `[${otp}] Adommo EdTech - ইমেইল ভেরিফিকেশন ওটিপি কোড`;

    const html = getOtpHtmlEmail(otp, purpose, userName);
    const mailResult = await sendMailViaGmail({ to: cleanEmail, subject, html });

    return NextResponse.json({
      success: true,
      message: `${cleanEmail} ঠিকানায় ওটিপি কোড পাঠানো হয়েছে।`,
      mailStatus: mailResult.message,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
