import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { enrollmentId, action } = body; // action: 'approve' | 'reject'

    if (!enrollmentId || !action) {
      return NextResponse.json({ success: false, error: 'এনরোলমেন্ট আইডি ও অ্যাকশন উল্লেখ করুন।' }, { status: 400 });
    }

    const enrollment = db.findOne<any>('enrollments', (e) => e.id === enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'এনরোলমেন্ট আবেদনটি পাওয়া যায়নি।' }, { status: 404 });
    }

    if (action === 'approve') {
      const updated = db.update('enrollments', enrollment.id, { status: 'approved' });

      // Unlock course in user's enrolledCourseIds
      const student = db.findOne<any>('users', (u) => u.id === enrollment.studentId || u.phone === enrollment.studentPhone || u.phone === enrollment.senderPhone);
      if (student) {
        const currentEnrolled = new Set(student.enrolledCourseIds || []);
        currentEnrolled.add(enrollment.courseId);
        db.update('users', student.id, { enrolledCourseIds: Array.from(currentEnrolled) });
      }

      // Increment enrolledCount on the course
      const course = db.findOne<any>('courses', (c) => c.id === enrollment.courseId);
      if (course) {
        db.update('courses', course.id, { enrolledCount: (course.enrolledCount || 0) + 1 });
      }

      return NextResponse.json({ success: true, enrollment: updated });
    } else if (action === 'reject') {
      const updated = db.update('enrollments', enrollment.id, { status: 'rejected' });
      return NextResponse.json({ success: true, enrollment: updated });
    }

    return NextResponse.json({ success: false, error: 'অবৈধ অ্যাকশন।' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
