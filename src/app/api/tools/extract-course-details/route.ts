import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ success: false, message: 'দয়া করে একটি সঠিক কোর্স লিংক দিন (যেমন: https://aparsclassroom.com/shop/FRB26/)' }, { status: 400 });
    }

    const cleanUrl = url.trim().replace(/\/+$/, '') + '/';

    // ১. পেজ ফেচ করা
    const pageRes = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      next: { revalidate: 3600 }
    });

    if (!pageRes.ok) {
      return NextResponse.json({ success: false, message: `পেজটি লোড করা যায়নি (Status: ${pageRes.status})` }, { status: pageRes.status });
    }

    const html = await pageRes.text();

    let courseTitle = '';
    let regularPrice = 0;
    let offerPrice = 0;
    let productCode = '';

    // ২. info.js ফেচ করে আসল প্রাইস ও প্রডাক্ট নেম বের করা
    try {
      const infoUrl = cleanUrl + 'assets/info.js';
      const infoRes = await fetch(infoUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (infoRes.ok) {
        const infoJs = await infoRes.text();
        const nameMatch = infoJs.match(/productName\s*=\s*["'`]([^"'`]+)["'`]/);
        if (nameMatch) courseTitle = nameMatch[1].trim();

        const fixMatch = infoJs.match(/fix\s*=\s*(\d+)/);
        if (fixMatch) regularPrice = parseInt(fixMatch[1], 10);

        const plsMatch = infoJs.match(/pls\s*=\s*(\d+)/);
        if (plsMatch) offerPrice = parseInt(plsMatch[1], 10);

        const codeMatch = infoJs.match(/productCode\s*=\s*["']?(\d+)["']?/);
        if (codeMatch) productCode = codeMatch[1];
      }
    } catch (e) {}

    // ৩. টাইটেল ফলব্যাক
    if (!courseTitle) {
      const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
      if (ldMatch) {
        try {
          const ld = JSON.parse(ldMatch[1]);
          if (ld.name) courseTitle = ld.name;
        } catch (e) {}
      }
    }
    if (!courseTitle) {
      const tMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (tMatch) {
        courseTitle = tMatch[1]
          .replace(/\|\s*ASG\s*Shop/i, '')
          .replace(/Apar['’]s\s*Classroom/i, '')
          .replace(/[-–|]\s*Shop/i, '')
          .trim();
      }
    }

    // ৪. ব্যানার ছবি বের করা
    let bannerImage = '';
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
    for (const im of imgMatches) {
      const src = im.match(/src=["']([^"']+)["']/i)?.[1] || '';
      if (!bannerImage && (src.includes('banner') || src.includes('cover') || src.includes('postimg') || src.includes('poster') || src.includes('thumb'))) {
        bannerImage = src.startsWith('http') ? src : (new URL(src, cleanUrl)).href;
      }
    }
    if (!bannerImage) {
      for (const im of imgMatches) {
        const src = im.match(/src=["']([^"']+)["']/i)?.[1] || '';
        if (!src.includes('icon') && !src.includes('logo') && !src.includes('clarity') && !src.includes('google') && !src.includes('badge')) {
          bannerImage = src.startsWith('http') ? src : (new URL(src, cleanUrl)).href;
          break;
        }
      }
    }

    // ৫. রুটিন ও গুগল ড্রাইভ লিংক
    const routineMatches = html.match(/https?:\/\/(?:cutt\.ly|docs\.google\.com\/spreadsheets|drive\.google\.com)[^\s"'>)]+/gi) || [];
    const routines = Array.from(new Set(routineMatches));

    // ৬. প্যারাগ্রাফ ও কোর্স ডেসক্রিপশন
    const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const rawParagraphs = pMatches
      .map(p => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 25 && !/copyright|all rights reserved|designed by|terms and conditions|privacy policy|return and refund/i.test(p));

    const description = Array.from(new Set(rawParagraphs)).join('\n\n');

    // ৭. বুলেট পয়েন্ট / কোর্স ফিচার
    const liMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const rawFeatures = liMatches
      .map(l => l.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(l => l.length > 15 && l.length < 300 && !/terms|privacy|policy|contact|refund/i.test(l));

    let features = Array.from(new Set(rawFeatures));
    if (features.length === 0 && rawParagraphs.length > 0) {
      // যদি আলাদা li ট্যাগ না থাকে, তবে ডেসক্রিপশনের গুরুত্বপূর্ণ বাক্যগুলোকে ফিচার বানাই
      features = rawParagraphs.slice(0, 5).map(p => p.slice(0, 150) + (p.length > 150 ? '...' : ''));
    }

    // ৮. সচরাচর জিজ্ঞাসা (FAQ)
    const faqs: { question: string; answer: string }[] = [];
    const cardHeaders = html.match(/<div[^>]*class=["'][^"']*card-header[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class=["'][^"']*collapse[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi) || [];
    for (const ch of cardHeaders) {
      const qMatch = ch.match(/<button[^>]*>([\s\S]*?)<\/button>/i) || ch.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
      const aMatch = ch.match(/<div[^>]*class=["'][^"']*card-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      if (qMatch && aMatch) {
        const q = qMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const a = aMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (q && a) faqs.push({ question: q, answer: a });
      }
    }

    // ৯. ডিসকাউন্ট হিসাব
    let discountPercentage = 0;
    if (regularPrice > 0 && offerPrice > 0 && regularPrice > offerPrice) {
      discountPercentage = Math.round(((regularPrice - offerPrice) / regularPrice) * 100);
    }

    return NextResponse.json({
      success: true,
      data: {
        sourceUrl: cleanUrl,
        courseTitle: courseTitle || 'ACS Course',
        regularPrice: regularPrice || offerPrice || 0,
        offerPrice: offerPrice || regularPrice || 0,
        discountPercentage,
        productCode,
        bannerImage,
        routines,
        features,
        description,
        faqs
      }
    });
  } catch (err: any) {
    console.error('Extract course details error:', err);
    return NextResponse.json({ success: false, message: 'কোর্স তথ্য এক্সট্র্যাক্ট করতে সমস্যা হয়েছে: ' + err.message }, { status: 500 });
  }
}
