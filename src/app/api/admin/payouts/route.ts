import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');
    const cleanTeacherId = (teacherId || '').trim();

    let payouts = await db.findManyAsync<any>('payouts') || [];
    if (cleanTeacherId) {
      payouts = payouts.filter((p: any) => (p.teacherId || '').trim() === cleanTeacherId);
    }

    // Sort newest first
    payouts.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.requestedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.requestedAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json(
      { success: true, payouts },
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
    const { teacherId, teacherName, teacherEmail, teacherPhone, amount, method, accountNumber, bankDetails, note, status, trxId } = body;

    if (!teacherId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: 'শিক্ষক আইডি ও সঠিক টাকার অঙ্ক প্রদান করুন।' }, { status: 400 });
    }

    if (!accountNumber && (!bankDetails || !bankDetails.accountNumber)) {
      return NextResponse.json({ success: false, error: 'পেমেন্ট অ্যাকাউন্ট নম্বর প্রদান করুন।' }, { status: 400 });
    }

    const nowFormatted = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isDirectPaid = status === 'paid';

    const newPayout = await db.createAsync('payouts', {
      teacherId,
      teacherName: teacherName || 'শিক্ষক',
      teacherEmail: teacherEmail || '',
      teacherPhone: teacherPhone || '',
      amount: Number(amount),
      method: method || 'bKash',
      accountNumber: accountNumber || bankDetails?.accountNumber || '',
      bankDetails: bankDetails || null,
      note: note || '',
      status: isDirectPaid ? 'paid' : 'pending',
      requestedAt: nowFormatted,
      paidAt: isDirectPaid ? nowFormatted : null,
      trxId: isDirectPaid ? (trxId || `TXN-${Date.now().toString().slice(-6)}`) : null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, payout: newPayout });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, payoutId, action, trxId, adminNotes, rejectionReason } = body;
    const targetId = id || payoutId;

    if (!targetId || !action) {
      return NextResponse.json({ success: false, error: 'পেআউট আইডি ও অ্যাকশন আবশ্যক।' }, { status: 400 });
    }

    const payout = await db.findOneAsync<any>('payouts', (p: any) => p.id === targetId);
    if (!payout) {
      return NextResponse.json({ success: false, error: 'পেআউট রেকর্ডটি পাওয়া যায়নি।' }, { status: 404 });
    }

    const nowFormatted = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let updates: any = {};
    if (action === 'approve') {
      updates = {
        status: 'paid',
        paidAt: nowFormatted,
        trxId: trxId || `TXN-${Date.now().toString().slice(-6)}`,
        adminNotes: adminNotes || 'সুপার অ্যাডমিন কর্তৃক সরাসরি পরিশোধিত।',
        updatedAt: new Date().toISOString(),
      };
    } else if (action === 'reject') {
      updates = {
        status: 'rejected',
        rejectedAt: nowFormatted,
        rejectionReason: rejectionReason || 'ব্যাংক অ্যাকাউন্ট তথ্যে অসংগতি পাওয়া গেছে।',
        updatedAt: new Date().toISOString(),
      };
    } else {
      return NextResponse.json({ success: false, error: 'অবৈধ অ্যাকশন।' }, { status: 400 });
    }

    const updated = await db.updateAsync('payouts', payout.id, updates);
    return NextResponse.json({ success: true, payout: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'পেআউট আইডি আবশ্যক।' }, { status: 400 });
    }
    const deleted = await db.deleteAsync('payouts', id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
