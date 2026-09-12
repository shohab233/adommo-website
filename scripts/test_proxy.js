async function testProxy() {
  const lib = '610665';
  const videoId = '5c5d846d-9700-4de3-8a97-4c65e44126bf';
  const bunnyUrl = `https://iframe.mediadelivery.net/embed/${lib}/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

  const upstreamRes = await fetch(bunnyUrl, {
    headers: {
      'Referer': 'https://engineering.aparsclassroom.com/',
      'Origin': 'https://engineering.aparsclassroom.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = await upstreamRes.text();
  console.log('Status:', upstreamRes.status);
  console.log('Contains 403?', html.includes('403'));
  console.log('Contains video player?', html.includes('plyr') || html.includes('mediadelivery'));
}
testProxy();
