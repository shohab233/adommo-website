import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে।' });
  response.cookies.set('adommo_auth_token', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  });
  return response;
}
