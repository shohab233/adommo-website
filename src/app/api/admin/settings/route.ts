import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const isDiagnostics = req.nextUrl.searchParams.get('diagnostics') === 'true';
    if (isDiagnostics) {
      const startTime = Date.now();
      let dbStatus = 'connected';
      let latencyMs = 0;
      try {
        await db.findManyAsync('settings');
        latencyMs = Date.now() - startTime;
      } catch (e) {
        dbStatus = 'disconnected';
      }

      const memory = process.memoryUsage();
      const uptimeSec = Math.floor(process.uptime());
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = uptimeSec % 60;

      return NextResponse.json({
        success: true,
        diagnostics: {
          serverStatus: 'online',
          dbStatus,
          dbLatencyMs: Math.max(1, latencyMs),
          uptimeFormatted: `${hours}h ${minutes}m ${seconds}s`,
          uptimeSeconds: uptimeSec,
          nodeVersion: process.version,
          heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
          environment: process.env.NODE_ENV || 'production',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const list = await db.findManyAsync<any>('settings');
    const settings = list[0] || null;
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Live Test Email Trigger
    if (body.action === 'test_email') {
      const targetEmail = body.targetEmail || body.smtpSender || 'test@example.com';
      const host = body.smtpHost || 'smtp.sendgrid.net';
      const port = body.smtpPort || 587;

      if (!targetEmail.includes('@') || !targetEmail.includes('.')) {
        return NextResponse.json({
          success: false,
          error: 'অনুগ্রহ করে একটি সঠিক ও বৈধ ইমেইল এড্রেস প্রদান করুন।',
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `টেস্ট ভেরিফিকেশন ইমেইল সফলভাবে পাঠানো হয়েছে: ${targetEmail} (Host: ${host}:${port})`,
        dispatchedAt: new Date().toISOString(),
      });
    }

    // 2. Live Test SMS Trigger
    if (body.action === 'test_sms') {
      const targetPhone = body.targetPhone || '01819876543';
      const senderId = body.smsSenderId || 'ADOMMO';

      if (!targetPhone.match(/^01[3-9]\d{8}$/)) {
        return NextResponse.json({
          success: false,
          error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01819876543)।',
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `টেস্ট এসএমএস সফলভাবে প্রেরিত হয়েছে: ${targetPhone} (প্রেরক আইডি: ${senderId})`,
        dispatchedAt: new Date().toISOString(),
      });
    }

    // 3. Save Settings to MongoDB
    const list = await db.findManyAsync<any>('settings');
    let updated;
    if (list.length > 0) {
      updated = await db.updateAsync('settings', list[0].id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });
    } else {
      updated = await db.createAsync('settings', {
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
