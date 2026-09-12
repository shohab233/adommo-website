import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const list = db.findMany<any>('question_banks') || [];
    return NextResponse.json({ success: true, questionBanks: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newItem = db.create('question_banks', {
      ...body,
      createdAt: body.createdAt || new Date().toISOString(),
      downloadCount: body.downloadCount || 0,
    });
    return NextResponse.json({ success: true, item: newItem });
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
    const updated = db.update('question_banks', id, updates);
    return NextResponse.json({ success: true, item: updated });
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
    db.delete('question_banks', id);
    return NextResponse.json({ success: true, message: 'প্রশ্নব্যাংক মুছে ফেলা হয়েছে।' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
