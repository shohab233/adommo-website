import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedBuffer, sanitizeBase64Image } from '@/lib/mediaStorage';
import { verifyToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('adommo_auth_token')?.value;
    const payload = token ? verifyToken<any>(token) : null;

    // Content type check
    const contentType = req.headers.get('content-type') || '';

    // 1. Multipart Form-Data (Native file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'courses';
      const prefix = (formData.get('prefix') as string) || 'c_cover';

      if (!file) {
        return NextResponse.json({ success: false, error: 'কোনো ফাইল পাওয়া যায়নি।' }, { status: 400 });
      }

      // Check max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'ফাইলের আকার ১০ মেগাবাইট (MB) এর কম হতে হবে।' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const url = saveUploadedBuffer(buffer, file.name || 'image.jpg', folder, prefix);

      return NextResponse.json({
        success: true,
        url,
        size: file.size,
        filename: file.name,
      });
    }

    // 2. JSON Body (Base64 conversion)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { base64, folder = 'courses', prefix = 'c_cover' } = body;

      if (!base64 || typeof base64 !== 'string') {
        return NextResponse.json({ success: false, error: 'Base64 ডাটা পাওয়া যায়নি।' }, { status: 400 });
      }

      const url = sanitizeBase64Image(base64, folder, prefix);
      return NextResponse.json({
        success: true,
        url,
      });
    }

    return NextResponse.json({ success: false, error: 'অসমর্থিত কনটেন্ট টাইপ।' }, { status: 400 });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
