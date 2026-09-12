import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lib = searchParams.get('lib') || '610687';
  const videoId = searchParams.get('video') || '';

  if (!videoId) {
    return new NextResponse('Missing video ID', { status: 400 });
  }

  const bunnyUrl = `https://iframe.mediadelivery.net/embed/${lib}/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

  try {
    const upstreamRes = await fetch(bunnyUrl, {
      headers: {
        'Referer': 'https://engineering.aparsclassroom.com/',
        'Origin': 'https://engineering.aparsclassroom.com',
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      cache: 'no-store'
    });

    let html = await upstreamRes.text();

    // If upstream returned 403, retry with aparsclassroom.com referer
    if (html.includes('403') || upstreamRes.status === 403) {
      const retryRes = await fetch(bunnyUrl, {
        headers: {
          'Referer': 'https://aparsclassroom.com/',
          'Origin': 'https://aparsclassroom.com',
          'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store'
      });
      if (retryRes.status === 200) {
        html = await retryRes.text();
      }
    }

    // Inject base href and no-referrer so video segments stream without 403
    const injection = `
      <meta name="referrer" content="no-referrer">
      <base href="https://iframe.mediadelivery.net">
    `;

    html = html.replace('<head>', '<head>' + injection);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Referrer-Policy': 'no-referrer',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new NextResponse('Failed to load video player: ' + err.message, { status: 500 });
  }
}
