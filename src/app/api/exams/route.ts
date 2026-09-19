import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const exam = await db.findOneAsync<any>('exams', (e: any) => e.id === id);
      if (exam) {
        return NextResponse.json(
          { success: true, exam },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          }
        );
      }
    }
    const exams = await db.findManyAsync<any>('exams') || [];
    return NextResponse.json(
      { success: true, exams },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const examData = await req.json();
    const newExam = await db.createAsync('exams', {
      ...examData,
      status: examData.status || 'live',
    });
    return NextResponse.json(
      { success: true, exam: newExam },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, _id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'পরীক্ষা আইডি আবশ্যক' }, { status: 400 });
    const updated = await db.updateAsync('exams', id, updates);
    return NextResponse.json(
      { success: true, exam: updated },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'পরীক্ষা আইডি আবশ্যক' }, { status: 400 });
    const success = await db.deleteAsync('exams', id);
    return NextResponse.json(
      { success },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
