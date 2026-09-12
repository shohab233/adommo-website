import { NextRequest, NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const enrollments = db.findMany<any>('enrollments') || [];
    return NextResponse.json({ success: true, enrollments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseId,
      courseTitle,
      studentId,
      studentName,
      studentPhone,
      amount,
      paymentMethod,
      trxId,
      senderPhone,
    } = body;

    if (!courseId || !studentId) {
      return NextResponse.json({ success: false, error: 'কোর্স এবং শিক্ষার্থীর তথ্য আবশ্যক।' }, { status: 400 });
    }

    const isFree = Number(amount) === 0;
    const initialStatus = isFree ? 'approved' : 'pending';

    const newEnrollment = db.create('enrollments', {
      courseId,
      courseTitle: courseTitle || 'কোর্স',
      studentId,
      studentName: studentName || 'শিক্ষার্থী',
      studentPhone: studentPhone || senderPhone || '01700-000000',
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || 'bKash',
      trxId: trxId || ('TX' + Math.floor(100000 + Math.random() * 900000)),
      senderPhone: senderPhone || studentPhone || '01700-000000',
      status: initialStatus,
      createdAt: 'এইমাত্র',
      enrollmentDate: new Date().toISOString().split('T')[0],
    });

    // If free course, immediately unlock for user
    if (isFree) {
      const student = db.findOne<any>('users', (u) => u.id === studentId);
      if (student) {
        const enrolled = new Set(student.enrolledCourseIds || []);
        enrolled.add(courseId);
        db.update('users', student.id, { enrolledCourseIds: Array.from(enrolled) });
      }
    }

    return NextResponse.json({ success: true, enrollment: newEnrollment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
