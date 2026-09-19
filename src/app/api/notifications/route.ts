import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const list = await db.findManyAsync<any>('notifications') || [];
    return NextResponse.json(
      { success: true, notifications: list },
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
    const body = await req.json();
    const newNotification = await db.createAsync('notifications', {
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
    const { id, _id, action, userId, isPinned } = body;
    const targetId = (id || _id || '').trim();

    if (!targetId && action !== 'mark_all_read') {
      return NextResponse.json({ success: false, error: 'আইডি আবশ্যক।' }, { status: 400 });
    }

    if (action === 'mark_read' && targetId && userId) {
      const target = await db.findOneAsync<any>('notifications', (n: any) => n.id === targetId || n._id === targetId);
      if (target) {
        const readBy = new Set(target.readBy || []);
        readBy.add(userId);
        const updated = await db.updateAsync('notifications', target.id, { readBy: Array.from(readBy) });
        return NextResponse.json({ success: true, notification: updated });
      }
    }

    if (action === 'mark_all_read' && userId) {
      const all = await db.findManyAsync<any>('notifications');
      for (const n of all) {
        const readBy = new Set(n.readBy || []);
        readBy.add(userId);
        await db.updateAsync('notifications', n.id, { readBy: Array.from(readBy) });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_pin' && targetId) {
      const target = await db.findOneAsync<any>('notifications', (n: any) => n.id === targetId || n._id === targetId);
      if (target) {
        const updated = await db.updateAsync('notifications', target.id, { isPinned: isPinned !== undefined ? isPinned : !target.isPinned });
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
    const cleanId = (id || '').trim();
    if (!cleanId) {
      return NextResponse.json({ success: false, error: 'আইডি আবশ্যক।' }, { status: 400 });
    }
    await db.deleteAsync('notifications', cleanId);
    return NextResponse.json({ success: true, message: 'নোটিফিকেশন মুছে ফেলা হয়েছে।' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
