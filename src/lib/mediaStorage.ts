import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

/**
 * Ensures target directory exists under public/uploads
 */
export function ensureUploadDir(folder: string): string {
  const dir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return dir;
}

/**
 * Automatically converts any Base64 data URI (data:image/...) to a real static web file.
 * Returns the public URL (e.g. /uploads/courses/cover_1726639_a8f9.jpg).
 * If the input is already a URL or regular string, it returns it unchanged.
 */
export function sanitizeBase64Image(
  inputUrlOrBase64: string | undefined | null,
  folder: string = 'courses',
  prefix: string = 'media'
): string {
  if (!inputUrlOrBase64 || typeof inputUrlOrBase64 !== 'string') {
    return '/courses/frb26_banner.png';
  }

  // If already a static URL or external CDN, keep it
  if (!inputUrlOrBase64.startsWith('data:image/')) {
    return inputUrlOrBase64;
  }

  try {
    const matches = inputUrlOrBase64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return inputUrlOrBase64;
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const targetDir = ensureUploadDir(folder);
    const randSuffix = crypto.randomBytes(4).toString('hex');
    const filename = `${prefix}_${Date.now()}_${randSuffix}.${ext}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${folder}/${filename}`;
  } catch (err) {
    console.error('Failed to convert base64 image to static file:', err);
    return inputUrlOrBase64;
  }
}

/**
 * Saves an uploaded file buffer directly to public/uploads
 */
export function saveUploadedBuffer(
  buffer: Buffer,
  originalFilename: string,
  folder: string = 'courses',
  prefix: string = 'upload'
): string {
  const targetDir = ensureUploadDir(folder);
  const ext = path.extname(originalFilename).replace(/^\./, '').toLowerCase() || 'jpg';
  const randSuffix = crypto.randomBytes(4).toString('hex');
  const filename = `${prefix}_${Date.now()}_${randSuffix}.${ext}`;
  const filePath = path.join(targetDir, filename);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${folder}/${filename}`;
}
