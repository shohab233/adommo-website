async function inspectHtml() {
  const url = 'https://iframe.mediadelivery.net/embed/610665/5c5d846d-9700-4de3-8a97-4c65e44126bf';
  const res = await fetch(url, {
    headers: { 'Referer': 'https://engineering.aparsclassroom.com/' }
  });
  const html = await res.text();
  console.log('HTML Length:', html.length);
  console.log('First 500 chars:', html.slice(0, 500));
  const matches = html.match(/(https?:\/\/[^"'\s]+)/g) || [];
  const uniqueDomains = Array.from(new Set(matches.map(m => {
    try { return new URL(m).hostname; } catch(e) { return m; }
  })));
  console.log('Domains inside embed:', uniqueDomains);
}
inspectHtml();
