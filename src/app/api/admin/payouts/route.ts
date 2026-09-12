import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const payouts = db.findMany<any>('payouts');
    return NextResponse.json({ success: true, payouts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPayout = db.create('payouts', {
      ...body,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, payout: newPayout });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
