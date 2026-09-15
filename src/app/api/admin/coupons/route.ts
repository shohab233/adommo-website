import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const coupons = await db.findManyAsync<any>('coupons');
    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, ...cleanBody } = body;
    const newCoupon = await db.createAsync('coupons', {
      ...cleanBody,
      code: (cleanBody.code || '').trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      usedCount: cleanBody.usedCount || 0,
      isActive: cleanBody.isActive !== undefined ? cleanBody.isActive : true,
    });
    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, _id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'কুপন আইডি আবশ্যক' }, { status: 400 });
    }
    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }
    const updated = await db.updateAsync('coupons', id, updates);
    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'কুপন আইডি আবশ্যক' }, { status: 400 });
    }
    await db.deleteAsync('coupons', id);
    return NextResponse.json({ success: true, message: 'কুপন মুছে ফেলা হয়েছে' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
