async function testStream() {
  const vid = '5c5d846d-9700-4de3-8a97-4c65e44126bf';
  const url = `https://vz-2d726a87-cba.b-cdn.net/${vid}/playlist.m3u8`;
  
  console.log('Testing stream URL:', url);
  const res1 = await fetch(url, { headers: { 'Referer': 'https://engineering.aparsclassroom.com/' } });
  console.log('Stream with engineering Referer:', res1.status);
  
  const res2 = await fetch(url, { headers: { 'Referer': 'http://localhost:3000/' } });
  console.log('Stream with localhost Referer:', res2.status);
  
  const res3 = await fetch(url, {});
  console.log('Stream with no Referer:', res3.status);

  if (res1.status === 200) {
    const text = await res1.text();
    console.log('Playlist contents:\n', text.slice(0, 300));
  }
}
testStream();
