import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const list = await db.findManyAsync<any>('live_classes') || [];
    return NextResponse.json({ success: true, liveClasses: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newClass = await db.createAsync('live_classes', {
      ...body,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, liveClass: newClass });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'আইডি আবশ্যক।' }, { status: 400 });
    }
    const updated = await db.updateAsync('live_classes', id, updates);
    return NextResponse.json({ success: true, liveClass: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'আইডি আবশ্যক।' }, { status: 400 });
    }
    await db.deleteAsync('live_classes', id);
    return NextResponse.json({ success: true, message: 'লাইভ ক্লাস মুছে ফেলা হয়েছে।' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
