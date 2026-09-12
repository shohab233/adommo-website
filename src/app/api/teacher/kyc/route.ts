import { NextRequest, NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const list = db.findMany('teacher_kyc');
    return NextResponse.json({ success: true, list, kycList: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.cookies.get('adommo_auth_token')?.value;
    const payload = token ? verifyToken<any>(token) : null;

    const applicationId = `KYC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newKyc = db.create('teacher_kyc', {
      ...body,
      applicationId,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });

    // Update teacher kycStatus in user record
    if (payload?.id) {
      db.update('users', payload.id, { kycStatus: 'pending' });
    }

    return NextResponse.json({ success: true, applicationId, kyc: newKyc });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
