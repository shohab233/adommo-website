import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const exams = await db.findManyAsync<any>('exams') || [];
    return NextResponse.json({ success: true, exams });
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
    return NextResponse.json({ success: true, exam: newExam });
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
    return NextResponse.json({ success: true, exam: updated });
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
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
