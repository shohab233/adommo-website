import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const list = db.findMany<any>('notifications') || [];
    return NextResponse.json({ success: true, notifications: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newNotification = db.create('notifications', {
      ...body,
      createdAt: body.createdAt || new Date().toISOString(),
      readBy: body.readBy || [],
      viewCount: body.viewCount || 1,
    });
    return NextResponse.json({ success: true, notification: newNotification });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, userId, isPinned } = body;

    if (!id && action !== 'mark_all_read') {
      return NextResponse.json({ success: false, error: 'আইডি আবশ্যক।' }, { status: 400 });
    }

    if (action === 'mark_read' && id && userId) {
      const target = db.findOne<any>('notifications', n => n.id === id);
      if (target) {
        const readBy = new Set(target.readBy || []);
        readBy.add(userId);
        const updated = db.update('notifications', id, { readBy: Array.from(readBy) });
        return NextResponse.json({ success: true, notification: updated });
      }
    }

    if (action === 'mark_all_read' && userId) {
      const all = db.findMany<any>('notifications');
      all.forEach(n => {
        const readBy = new Set(n.readBy || []);
        readBy.add(userId);
        db.update('notifications', n.id, { readBy: Array.from(readBy) });
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_pin' && id) {
      const target = db.findOne<any>('notifications', n => n.id === id);
      if (target) {
        const updated = db.update('notifications', id, { isPinned: isPinned !== undefined ? isPinned : !target.isPinned });
        return NextResponse.json({ success: true, notification: updated });
      }
    }

    return NextResponse.json({ success: false, error: 'অবৈধ একশন।' }, { status: 400 });
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
    db.delete('notifications', id);
    return NextResponse.json({ success: true, message: 'নোটিফিকেশন মুছে ফেলা হয়েছে।' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
