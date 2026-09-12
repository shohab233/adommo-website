import { NextRequest, NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const courses = await db.findManyAsync<any>('courses') || [];
    return NextResponse.json({ success: true, courses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('adommo_auth_token')?.value;
    const payload = token ? verifyToken<any>(token) : null;
    
    // Allow teachers and admins to create courses
    if (payload && payload.role !== 'teacher' && payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'অনুমোদনহীন অনুরোধ। শুধুমাত্র শিক্ষক বা অ্যাডমিন কোর্স তৈরি করতে পারেন।' }, { status: 403 });
    }

    const courseData = await req.json();
    const newCourse = await db.createAsync('courses', {
      ...courseData,
      instructorId: payload?.id || courseData.instructorId || 'teacher_main',
      isPublished: true,
    });

    return NextResponse.json({ success: true, course: newCourse });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const courseData = await req.json();
    const { id, ...updates } = courseData;

    if (!id) {
      return NextResponse.json({ success: false, error: 'কোর্স আইডি প্রদান করুন।' }, { status: 400 });
    }

    const updated = await db.updateAsync('courses', id, updates);
    return NextResponse.json({ success: true, course: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'কোর্স আইডি প্রদান করুন।' }, { status: 400 });
    }

    const success = await db.deleteAsync('courses', id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
