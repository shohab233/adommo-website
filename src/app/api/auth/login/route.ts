import { NextRequest, NextResponse } from 'next/server';
import { db, verifyPassword, hashPassword, signToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, role: bodyRole, requestedRole } = body;
    const targetRole = (bodyRole || requestedRole || 'student') as 'student' | 'teacher' | 'admin';

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন।' }, { status: 400 });
    }

    const clean = identifier.trim();
    const cleanLower = clean.toLowerCase();

    // 1. Strictly find user with the requested role
    let user = await db.findOneAsync<any>('users', (u: any) => 
      u.role === targetRole && (u.phone === clean || (u.email && u.email.toLowerCase() === cleanLower))
    );

    // 2. If not found in targetRole, check if they exist in another role to give helpful guidance
    if (!user) {
      const otherRoleUser = await db.findOneAsync<any>('users', (u: any) => 
        u.phone === clean || (u.email && u.email.toLowerCase() === cleanLower)
      );

      if (otherRoleUser) {
        if (targetRole === 'teacher' && otherRoleUser.role === 'student') {
          return NextResponse.json({ 
            success: false, 
            error: 'এই তথ্যটি একটি শিক্ষার্থী একাউন্টের। শিক্ষক প্যানেলে প্রবেশ করতে অনুগ্রহ করে শিক্ষক হিসেবে রেজিস্ট্রেশন সম্পন্ন করুন।' 
          }, { status: 403 });
        } else if (targetRole === 'student' && otherRoleUser.role === 'teacher') {
          return NextResponse.json({ 
            success: false, 
            error: 'এই তথ্যটি একটি শিক্ষক একাউন্টের। শিক্ষার্থী ওয়েবসাইটে প্রবেশ করতে অনুগ্রহ করে শিক্ষার্থী হিসেবে রেজিস্ট্রেশন সম্পন্ন করুন।' 
          }, { status: 403 });
        }
      }

      return NextResponse.json({ 
        success: false, 
        error: targetRole === 'teacher'
          ? 'এই তথ্যে কোনো শিক্ষক অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন বা শিক্ষক হিসেবে রেজিস্ট্রেশন করুন।'
          : 'এই তথ্যে কোনো শিক্ষার্থী অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন বা শিক্ষার্থী হিসেবে রেজিস্ট্রেশন করুন।'
      }, { status: 404 });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' }, { status: 401 });
    }

    const token = signToken({ id: user.id, phone: user.phone, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        college: user.college,
        kycStatus: user.kycStatus,
        enrolledCourseIds: user.enrolledCourseIds || [],
      },
      token,
    });

    response.cookies.set('adommo_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
