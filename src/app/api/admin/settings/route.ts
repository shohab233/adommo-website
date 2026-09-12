import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const list = db.findMany<any>('settings');
    const settings = list[0] || null;
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const list = db.findMany<any>('settings');
    let updated;
    if (list.length > 0) {
      updated = db.update('settings', list[0].id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });
    } else {
      updated = db.create('settings', {
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
