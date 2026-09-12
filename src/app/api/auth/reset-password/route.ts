import { NextRequest, NextResponse } from 'next/server';
import { db, hashPassword, verifyToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword, resetToken } = body;

    if (!email || !newPassword || !resetToken) {
      return NextResponse.json({ success: false, error: 'সকল তথ্য সঠিকভাবে পূরণ করুন।' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' }, { status: 400 });
    }

    // Verify reset token
    const payload = verifyToken<any>(resetToken);
    if (!payload || payload.email?.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ success: false, error: 'অকার্যকর বা মেয়াদোত্তীর্ণ টোকেন। পুনরায় ওটিপি যাচাই করুন।' }, { status: 403 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const matchingUsers = db.findMany<any>('users', u => u.email?.toLowerCase() === cleanEmail);
    if (!matchingUsers || matchingUsers.length === 0) {
      return NextResponse.json({ success: false, error: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    // Hash new password and update all accounts with this email
    const newPasswordHash = hashPassword(newPassword.trim());
    for (const u of matchingUsers) {
      db.update('users', u.id, { passwordHash: newPasswordHash });
    }

    console.log(`✅ [PASSWORD RESET SUCCESS] For ${matchingUsers.length} account(s) under: ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
