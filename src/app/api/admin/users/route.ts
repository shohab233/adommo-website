import { NextRequest, NextResponse } from 'next/server';
import { db, hashPassword } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const rawUsers = db.findMany<any>('users');
    const users = rawUsers.map((u) => ({
      id: u.id,
      name: u.name || (u.role === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী'),
      phone: u.phone || '',
      email: u.email || '',
      college: u.college || '',
      role: u.role || 'student',
      kycStatus: u.kycStatus,
      enrolledCourseIds: u.enrolledCourseIds || [],
      status: u.status || 'active',
      createdAt: u.createdAt || '',
      updatedAt: u.updatedAt || '',
    }));

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password, institution, college, designation, subject, commissionPercent } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'শিক্ষকের পূর্ণ নাম প্রদান করুন।' }, { status: 400 });
    }

    if (!password || password.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' }, { status: 400 });
    }

    const cleanPhone = phone?.trim() || '';
    const cleanEmail = email?.trim().toLowerCase() || '';

    if (!cleanPhone && !cleanEmail) {
      return NextResponse.json({ success: false, error: 'মোবাইল নম্বর অথবা ইমেইল এড্রেস প্রদান করুন।' }, { status: 400 });
    }

    // Check if user already exists with this phone or email
    const existing = db.findOne<any>('users', (u) => {
      const matchPhone = cleanPhone && u.phone && u.phone === cleanPhone;
      const matchEmail = cleanEmail && u.email && u.email.toLowerCase() === cleanEmail;
      return matchPhone || matchEmail;
    });

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।' 
      }, { status: 400 });
    }

    const passwordHash = hashPassword(password.trim());
    const inst = institution || college || 'অনবোর্ডেড ফ্যাকাল্টি';
    const desig = designation || 'শিক্ষক ও প্রশিক্ষক';
    const subj = subject || 'বিজ্ঞান ও প্রযুক্তি';

    const newUser = db.create('users', {
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash,
      role: 'teacher',
      college: inst,
      designation: desig,
      subject: subj,
      commissionPercent: Number(commissionPercent) || 80,
      kycStatus: 'approved',
      status: 'active',
      enrolledCourseIds: [],
    });

    // Also create an approved KYC record in data/teacher_kyc.json
    db.create('teacher_kyc', {
      teacherId: newUser.id,
      teacherName: name.trim(),
      fullName: name.trim(),
      teacherEmail: cleanEmail,
      teacherPhone: cleanPhone,
      institutionName: inst,
      degreeName: desig,
      departmentName: subj,
      status: 'approved',
      applicationId: `KYC-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      submittedAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      reviewedAt: new Date().toLocaleDateString('bn-BD'),
      adminNotes: 'সুপার অ্যাডমিন কর্তৃক সরাসরি প্যানেলে যুক্ত ও অনুমোদিত ফ্যাকাল্টি।',
    });

    return NextResponse.json({
      success: true,
      message: 'শিক্ষক অ্যাকাউন্ট সফলভাবে তৈরি ও অনুমোদিত হয়েছে!',
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        kycStatus: newUser.kycStatus,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
