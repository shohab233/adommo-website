import { NextRequest, NextResponse } from 'next/server';
import { db, hashPassword } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacherId, phone, email, avatar, bio, newPassword } = body;

    if (!teacherId && !phone && !email) {
      return NextResponse.json({ success: false, error: 'শিক্ষক পরিচিতি শনাক্তকরণ তথ্য আবশ্যক।' }, { status: 400 });
    }

    const cleanPhone = phone?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    // Find user in users database
    const user = await db.findOneAsync<any>('users', (u: any) => 
      (teacherId && u.id === teacherId) ||
      (cleanPhone && u.phone === cleanPhone) ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'শিক্ষক অ্যাকাউন্ট ডাটাবেজে পাওয়া যায়নি।' }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (avatar) updates.avatar = avatar;
    if (bio) updates.bio = bio;
    if (body.college) updates.college = body.college;

    if (newPassword && newPassword.trim().length >= 4) {
      updates.passwordHash = hashPassword(newPassword.trim());
    }

    const updatedUser = await db.updateAsync('users', user.id, updates);

    // Also sync bio/avatar to teacher_kyc collection if exists
    const kyc = await db.findOneAsync<any>('teacher_kyc', (k: any) => 
      k.teacherId === user.id || k.teacherPhone === user.phone || (k.teacherEmail && k.teacherEmail.toLowerCase() === user.email?.toLowerCase())
    );
    if (kyc) {
      await db.updateAsync('teacher_kyc', kyc.id, {
        ...(avatar ? { selfieWithIdImage: avatar } : {}),
      });
    }

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'ইউজার আপডেট করতে ব্যর্থ হয়েছে।' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'প্রোফাইল সেটিংস ও তথ্য সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        college: updatedUser.college,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
