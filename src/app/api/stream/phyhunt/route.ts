import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KEY_CACHE_DIR = path.join(process.cwd(), '.cache', 'phyhunt_keys');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'cmp6vector_part1';
  const file = searchParams.get('file') || 'master.m3u8';
  const token = searchParams.get('token') || '109980:cmp6vector_part1:1789428291:eeefcfb169ab62fc';
  const cacheFile = path.join(KEY_CACHE_DIR, `${slug}.key`);

  // Check if status check requested
  if (file === 'status') {
    const isCached = fs.existsSync(cacheFile);
    return NextResponse.json({
      slug,
      isKeyCached: isCached,
      cacheFile: isCached ? cacheFile : null
    });
  }

  // 1. Master Key endpoint
  if (file === 'key') {
    // Check permanent local disk cache first
    if (fs.existsSync(cacheFile)) {
      try {
        const cachedKey = fs.readFileSync(cacheFile);
        if (cachedKey.length === 16) {
          return new NextResponse(cachedKey, {
            status: 200,
            headers: {
              'Content-Type': 'application/octet-stream',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=31536000, immutable'
            }
          });
        }
      } catch (e) {
        console.error('Error reading key cache:', e);
      }
    }

    const keyUrl = `https://www.phyhunt.com/course/lms-v2/api/hls/master-key/?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`;
    try {
      const keyRes = await fetch(keyUrl, {
        headers: {
          'Referer': 'https://www.phyhunt.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store'
      });

      if (!keyRes.ok) {
        return new NextResponse(`Key fetch failed: ${keyRes.status} (PhyHunt token expired or authentication required)`, { status: keyRes.status });
      }

      const keyBuffer = await keyRes.arrayBuffer();
      const buf = Buffer.from(keyBuffer);

      // Save key permanently to disk cache so it never expires again
      if (buf.length === 16) {
        try {
          if (!fs.existsSync(KEY_CACHE_DIR)) fs.mkdirSync(KEY_CACHE_DIR, { recursive: true });
          fs.writeFileSync(cacheFile, buf);
        } catch (e) {
          console.error('Failed to write key cache file:', e);
        }
      }

      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        }
      });
    } catch (err: any) {
      return new NextResponse('Failed to fetch key: ' + err.message, { status: 500 });
    }
  }

  // 2. M3U8 Playlist endpoint
  if (file.endsWith('.m3u8')) {
    const m3u8Url = `https://stream.phyhunt.org/videos/${encodeURIComponent(slug)}/${file}`;
    try {
      const m3u8Res = await fetch(m3u8Url, {
        headers: {
          'Referer': 'https://www.phyhunt.com/',
          'Origin': 'https://www.phyhunt.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store'
      });

      if (!m3u8Res.ok) {
        return new NextResponse('Playlist fetch failed: ' + m3u8Res.status, { status: m3u8Res.status });
      }

      let m3u8Text = await m3u8Res.text();

      // Rewrite nested variant playlists
      m3u8Text = m3u8Text.replace(/^(v\d+p\.m3u8)/gm, (match) => {
        return `/api/stream/phyhunt?slug=${encodeURIComponent(slug)}&file=${match}&token=${encodeURIComponent(token)}`;
      });

      // Rewrite AES-128 KEY URI
      m3u8Text = m3u8Text.replace(/URI="https?:\/\/[^"]+"/g, () => {
        return `URI="/api/stream/phyhunt?slug=${encodeURIComponent(slug)}&file=key&token=${encodeURIComponent(token)}"`;
      });

      // Rewrite .ts segment filenames
      m3u8Text = m3u8Text.replace(/^([a-zA-Z0-9_\-]+\.ts)/gm, (match) => {
        return `/api/stream/phyhunt?slug=${encodeURIComponent(slug)}&file=${match}`;
      });

      return new NextResponse(m3u8Text, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        }
      });
    } catch (err: any) {
      return new NextResponse('Failed to fetch playlist: ' + err.message, { status: 500 });
    }
  }

  // 3. TS Segment endpoint
  if (file.endsWith('.ts')) {
    const tsUrl = `https://stream.phyhunt.org/videos/${encodeURIComponent(slug)}/${file}`;
    try {
      const tsRes = await fetch(tsUrl, {
        headers: {
          'Referer': 'https://www.phyhunt.com/',
          'Origin': 'https://www.phyhunt.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        next: { revalidate: 3600 }
      });

      if (!tsRes.ok) {
        return new NextResponse('TS segment fetch failed: ' + tsRes.status, { status: tsRes.status });
      }

      const tsBuffer = await tsRes.arrayBuffer();
      const nodeBuf = Buffer.from(tsBuffer);
      return new NextResponse(nodeBuf, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp2t',
          'Content-Length': String(nodeBuf.length),
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400, immutable'
        }
      });
    } catch (err: any) {
      return new NextResponse('Failed to fetch TS segment: ' + err.message, { status: 500 });
    }
  }

  return new NextResponse('Invalid request', { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug = 'cmp6vector_part1', keyHex, token } = body;
    const cacheFile = path.join(KEY_CACHE_DIR, `${slug}.key`);

    if (keyHex && typeof keyHex === 'string') {
      const cleanHex = keyHex.trim().replace(/^0x/i, '');
      const buf = Buffer.from(cleanHex, 'hex');
      if (buf.length === 16) {
        if (!fs.existsSync(KEY_CACHE_DIR)) fs.mkdirSync(KEY_CACHE_DIR, { recursive: true });
        fs.writeFileSync(cacheFile, buf);
        return NextResponse.json({ success: true, message: '16-byte AES-128 key saved permanently!' });
      } else {
        return NextResponse.json({ success: false, message: `Invalid key length: expected 16 bytes (32 hex characters), got ${buf.length} bytes.` }, { status: 400 });
      }
    }

    if (token && typeof token === 'string') {
      const keyUrl = `https://www.phyhunt.com/course/lms-v2/api/hls/master-key/?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token.trim())}`;
      const keyRes = await fetch(keyUrl, {
        headers: {
          'Referer': 'https://www.phyhunt.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store'
      });

      if (!keyRes.ok) {
        return NextResponse.json({ success: false, message: `PhyHunt rejected token with HTTP ${keyRes.status}. Token may be expired or invalid.` }, { status: 400 });
      }

      const keyBuffer = await keyRes.arrayBuffer();
      const buf = Buffer.from(keyBuffer);
      if (buf.length === 16) {
        if (!fs.existsSync(KEY_CACHE_DIR)) fs.mkdirSync(KEY_CACHE_DIR, { recursive: true });
        fs.writeFileSync(cacheFile, buf);
        const hex = buf.toString('hex');
        return NextResponse.json({ success: true, message: 'Master key successfully fetched and permanently saved!', keyHex: hex });
      }
    }

    return NextResponse.json({ success: false, message: 'Please provide either a valid keyHex (32 hex characters) or a fresh token.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}