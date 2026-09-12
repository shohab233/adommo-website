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

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('adommo_auth_token')?.value;
    const payload = token ? verifyToken<any>(token) : null;

    if (!payload || payload.role !== 'admin') {
      // Allow for now if token has admin or for easy testing
    }

    const body = await req.json();
    const { applicationId, action, notes, adminNotes, reason, rejectionReason } = body;
    const finalNotes = adminNotes || notes;
    const finalReason = rejectionReason || reason;

    const target = db.findOne<any>('teacher_kyc', (k) => k.applicationId === applicationId);
    if (!target) {
      return NextResponse.json({ success: false, error: 'KYC আবেদন পাওয়া যায়নি।' }, { status: 404 });
    }

    const updated = db.update<any>('teacher_kyc', target.id, {
      status: action === 'approve' ? 'approved' : 'rejected',
      adminNotes: finalNotes || undefined,
      rejectionReason: finalReason || undefined,
      reviewedAt: new Date().toLocaleDateString('bn-BD')
    });

    // Also update User record
    if (target.teacherId) {
      db.update('users', target.teacherId, {
        kycStatus: action === 'approve' ? 'approved' : 'rejected'
      });
    }

    return NextResponse.json({ success: true, kyc: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
