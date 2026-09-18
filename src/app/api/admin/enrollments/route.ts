import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const enrollments = await db.findManyAsync<any>('enrollments');
    return NextResponse.json({ success: true, enrollments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { enrollmentId, action } = body; // action: 'approve' | 'reject'

    if (!enrollmentId || !action) {
      return NextResponse.json({ success: false, error: 'এনরোলমেন্ট আইডি ও অ্যাকশন উল্লেখ করুন।' }, { status: 400 });
    }

    const cleanEnrollmentId = String(enrollmentId).trim();
    const enrollment = await db.findOneAsync<any>('enrollments', (e: any) => 
      e.id === cleanEnrollmentId || (e.trxId && e.trxId.trim() === cleanEnrollmentId)
    );
    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'এনরোলমেন্ট আবেদনটি পাওয়া যায়নি।' }, { status: 404 });
    }

    if (action === 'approve') {
      const updated = await db.updateAsync('enrollments', enrollment.id, { status: 'approved' });

      // Unlock course in user's enrolledCourseIds
      const cleanStudentId = (enrollment.studentId || '').trim();
      const cleanPhone1 = (enrollment.studentPhone || '').replace(/\D/g, '');
      const cleanPhone2 = (enrollment.senderPhone || '').replace(/\D/g, '');

      const student = await db.findOneAsync<any>('users', (u: any) => {
        if (cleanStudentId && u.id === cleanStudentId) return true;
        const uPhoneClean = (u.phone || '').replace(/\D/g, '');
        if (uPhoneClean && (uPhoneClean === cleanPhone1 || uPhoneClean === cleanPhone2)) return true;
        return false;
      });

      if (student) {
        const currentEnrolled = new Set(student.enrolledCourseIds || []);
        currentEnrolled.add(enrollment.courseId);
        await db.updateAsync('users', student.id, { enrolledCourseIds: Array.from(currentEnrolled) });
      }

      // Increment enrolledCount on the course
      const course = await db.findOneAsync<any>('courses', (c: any) => c.id === enrollment.courseId);
      if (course) {
        await db.updateAsync('courses', course.id, { enrolledCount: (course.enrolledCount || 0) + 1 });
      }

      return NextResponse.json({ success: true, enrollment: updated });
    } else if (action === 'reject' || action === 'refund') {
      const newStatus = action === 'refund' ? 'refunded' : 'rejected';
      const updated = await db.updateAsync('enrollments', enrollment.id, { status: newStatus });

      // If user had access unlocked, remove course from enrolledCourseIds
      const cleanStudentId = (enrollment.studentId || '').trim();
      const cleanPhone1 = (enrollment.studentPhone || '').replace(/\D/g, '');
      const cleanPhone2 = (enrollment.senderPhone || '').replace(/\D/g, '');

      const student = await db.findOneAsync<any>('users', (u: any) => {
        if (cleanStudentId && u.id === cleanStudentId) return true;
        const uPhoneClean = (u.phone || '').replace(/\D/g, '');
        if (uPhoneClean && (uPhoneClean === cleanPhone1 || uPhoneClean === cleanPhone2)) return true;
        return false;
      });

      if (student && Array.isArray(student.enrolledCourseIds)) {
        const remaining = student.enrolledCourseIds.filter((cid: string) => cid !== enrollment.courseId);
        await db.updateAsync('users', student.id, { enrolledCourseIds: remaining });
      }

      // Decrement course enrolled count if it was previously approved
      if (enrollment.status === 'approved') {
        const course = await db.findOneAsync<any>('courses', (c: any) => c.id === enrollment.courseId);
        if (course && course.enrolledCount && course.enrolledCount > 0) {
          await db.updateAsync('courses', course.id, { enrolledCount: course.enrolledCount - 1 });
        }
      }

      return NextResponse.json({ success: true, enrollment: updated });
    }

    return NextResponse.json({ success: false, error: 'অবৈধ অ্যাকশন।' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'এনরোলমেন্ট আইডি আবশ্যক।' }, { status: 400 });
    }
    const deleted = await db.deleteAsync('enrollments', id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

