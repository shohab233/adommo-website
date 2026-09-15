import { NextRequest, NextResponse } from 'next/server';

/**
 * 🎬 ADOMMO x Physics Hunters Video Streaming Proxy
 * Bypasses Cloudflare Referer checks & proxies AES-128 M3U8 and .ts segments
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'cmp6vector_part1';
  const file = searchParams.get('file') || 'master.m3u8';
  const token = searchParams.get('token') || '109980:cmp6vector_part1:1789428291:eeefcfb169ab62fc';

  // 1. Master Key endpoint
  if (file === 'key') {
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
        return new NextResponse('Key fetch failed: ' + keyRes.status, { status: keyRes.status });
      }

      const keyBuffer = await keyRes.arrayBuffer();
      return new NextResponse(Buffer.from(keyBuffer), {
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