import { NextRequest, NextResponse } from 'next/server';
import { db, verifyToken } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('adommo_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, authenticated: false, user: null });
    }

    const payload = verifyToken<any>(token);
    if (!payload || !payload.id) {
      const res = NextResponse.json({ success: false, authenticated: false, user: null });
      res.cookies.set('adommo_auth_token', '', { path: '/', maxAge: 0, expires: new Date(0) });
      return res;
    }

    const user = await db.findOneAsync<any>('users', (u: any) => u.id === payload.id);
    if (!user) {
      const res = NextResponse.json({ success: false, authenticated: false, user: null });
      res.cookies.set('adommo_auth_token', '', { path: '/', maxAge: 0, expires: new Date(0) });
      return res;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        college: user.college,
        kycStatus: user.kycStatus,
        enrolledCourseIds: user.enrolledCourseIds || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, authenticated: false, error: err.message, user: null });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.cookies.get('adommo_auth_token')?.value;
    let userId = body.id;

    if (token) {
      const payload = verifyToken<any>(token);
      if (payload?.id) userId = payload.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updated = await db.updateAsync('users', userId, {
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.college ? { college: body.college.trim() } : {}),
      ...(body.avatar ? { avatar: body.avatar } : {}),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
