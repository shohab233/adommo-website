import { NextRequest, NextResponse } from 'next/server';
import { db, hashPassword, signToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password, role = 'student', college } = body;

    if (!phone || !password) {
      return NextResponse.json({ success: false, error: 'মোবাইল নম্বর ও পাসওয়ার্ড বাধ্যতামূলক।' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanRole = (role === 'teacher' ? 'teacher' : role === 'admin' ? 'admin' : 'student') as 'student' | 'teacher' | 'admin';

    // Role-scoped duplication check:
    // A student can also open a teacher account with the same phone/email,
    // and a teacher can also open a student account with the same phone/email.
    // Duplicate accounts of the SAME role are blocked.
    const existingSameRole = db.findOne<any>('users', (u) => 
      u.role === cleanRole && (
        u.phone === cleanPhone || 
        (cleanEmail && u.email?.toLowerCase() === cleanEmail)
      )
    );

    if (existingSameRole) {
      return NextResponse.json({ 
        success: false, 
        error: cleanRole === 'teacher' 
          ? 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিপূর্বে একটি শিক্ষক একাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।' 
          : 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিপূর্বে একটি শিক্ষার্থী একাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।' 
      }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const newUser = db.create('users', {
      name: name?.trim() || (cleanRole === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী'),
      phone: cleanPhone,
      email: cleanEmail,
      college: college?.trim() || '',
      passwordHash,
      role: cleanRole,
      kycStatus: cleanRole === 'teacher' ? 'unsubmitted' : undefined,
      enrolledCourseIds: [],
    });

    const token = signToken({ id: newUser.id, phone: newUser.phone, role: newUser.role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        college: newUser.college,
        kycStatus: newUser.kycStatus,
        enrolledCourseIds: newUser.enrolledCourseIds || [],
      },
      token,
    });

    // Set HttpOnly Secure Cookie
    response.cookies.set('adommo_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
