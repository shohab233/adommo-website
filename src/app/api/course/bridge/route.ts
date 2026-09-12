import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { processCourseImport } from '../import/route';

interface BridgeConfig {
  id: string;
  courseId: string;
  title: string;
  targetCourseId: string;
  subdomain: string;
  apiBase: string;
  token: string;
  archiveCourseId?: string;
  lastSyncedAt: string;
  totalLectures: number;
  status: 'connected' | 'error';
  lastError?: string;
  lastDiff?: any;
}

const BRIDGE_CONFIG_PATH = path.join(process.cwd(), 'src', 'lib', 'bridge_config.json');

function loadBridgeConfigs(): BridgeConfig[] {
  try {
    if (fs.existsSync(BRIDGE_CONFIG_PATH)) {
      const data = fs.readFileSync(BRIDGE_CONFIG_PATH, 'utf8');
      return JSON.parse(data) || [];
    }
  } catch (e) {}
  return [];
}

function saveBridgeConfigs(configs: BridgeConfig[]) {
  try {
    fs.writeFileSync(BRIDGE_CONFIG_PATH, JSON.stringify(configs, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving bridge config:', e);
  }
}

function resolveApiBaseAndSubdomain(input: string): { apiBase: string; subdomain: string } {
  const lower = (input || '').toLowerCase();
  let subdomain = 'admission.aparsclassroom.com';
  const apiBase = 'https://api.varsity.aparsclassroom.com/api/v1';

  if (lower.includes('engineering')) {
    subdomain = 'engineering.aparsclassroom.com';
  } else if (lower.includes('admission')) {
    subdomain = 'admission.aparsclassroom.com';
  } else if (lower.includes('medical')) {
    subdomain = 'medical.aparsclassroom.com';
  } else if (lower.includes('varsity') || lower.includes('frb')) {
    subdomain = 'varsity.aparsclassroom.com';
  }

  return { apiBase, subdomain };
}

function extractCourseId(input: string): string {
  if (!input) return '';
  const match = input.trim().match(/(?:course|shop)\/([a-zA-Z0-9-]+)/i);
  if (match) return match[1];
  return input.trim().replace(/^["']|["']$/g, '');
}

function extractJwt(input: string): string {
  if (!input) return '';
  const match = input.match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/);
  if (match) return match[0].trim();
  return input.trim().replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '');
}

interface ClientHeaders {
  userAgent?: string;
  secChUa?: string;
  secChUaPlatform?: string;
  secChUaMobile?: string;
  acceptLanguage?: string;
}

async function fetchAcs(url: string, rawToken: string, subdomain = 'admission.aparsclassroom.com', clientHeaders?: ClientHeaders) {
  const token = extractJwt(rawToken);
  const ua = clientHeaders?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  console.log('[fetchAcs] URL:', url, 'Token length:', token.length, 'Subdomain:', subdomain);
  
  const headers: Record<string, string> = {
    'accept': 'application/json, text/plain, */*',
    'authorization': `Bearer ${token}`,
    'x-access-token': token,
    'origin': `https://${subdomain}`,
    'referer': `https://${subdomain}/`,
    'user-agent': ua,
  };

  if (clientHeaders?.secChUa) headers['sec-ch-ua'] = clientHeaders.secChUa;
  if (clientHeaders?.secChUaPlatform) headers['sec-ch-ua-platform'] = clientHeaders.secChUaPlatform;
  if (clientHeaders?.secChUaMobile) headers['sec-ch-ua-mobile'] = clientHeaders.secChUaMobile;
  if (clientHeaders?.acceptLanguage) headers['accept-language'] = clientHeaders.acceptLanguage;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.error(`[fetchAcs] HTTP Error ${res.status}:`, errorBody);

    let acsMsg = '';
    try {
      const parsed = JSON.parse(errorBody);
      acsMsg = parsed.message || (parsed.erroSourses && parsed.erroSourses[0]?.message) || '';
    } catch {}

    if (acsMsg) {
      throw new Error(`[ACS সার্ভার বার্তা]: ${acsMsg}`);
    }

    if (res.status === 406 || res.status === 401 || errorBody.includes('Session expired') || errorBody.includes('login again')) {
      throw new Error(`আপনার ACS টোকেনটি অকার্যকর বা মেয়াদোত্তীর্ণ (Session expired)। দয়া করে ব্রাউজারে লগইন থাকা অবস্থায় নতুন টোকেন কপি করে দিন।`);
    }

    throw new Error(`ACS API HTTP Error: ${res.status} (${res.statusText}) - ${errorBody.slice(0, 100)}`);
  }
  return await res.json();
}

async function fetchCourseFromAcs(courseId: string, apiBase: string, rawToken: string, initialSubdomain: string, isArchive = false, clientHeaders?: ClientHeaders) {
  const candidateSubdomains = [
    initialSubdomain,
    'admission.aparsclassroom.com',
    'engineering.aparsclassroom.com',
    'varsity.aparsclassroom.com',
    'medical.aparsclassroom.com'
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  let subRes: any = null;
  let activeSubdomain = initialSubdomain;
  let lastErrorMsg = '';

  for (const sub of candidateSubdomains) {
    try {
      subRes = await fetchAcs(`${apiBase}/course-subject/subjects/${courseId}?limit=100`, rawToken, sub, clientHeaders);
      if (subRes && subRes.data) {
        activeSubdomain = sub;
        break;
      }
    } catch (err: any) {
      lastErrorMsg = err.message || '';
      if (err.message?.includes('[ACS সার্ভার বার্তা]') || err.message?.includes('Session expired') || err.message?.includes('ডিভাইস')) {
        throw err; // ACS gave a definitive policy message, don't swallow or retry!
      }
      console.warn(`[fetchCourseFromAcs] Origin ${sub} failed, trying next...`);
    }
  }

  if (!subRes) {
    throw new Error(lastErrorMsg || `ACS সার্ভার থেকে কোর্সের তথ্য ফেচ করা যায়নি। কোর্স আইডি বা টোকেন সঠিক কিনা যাচাই করুন।`);
  }

  const rawSubjects = subRes.data || [];
  const formattedSubjects: any[] = [];
  let classesCount = 0;

  for (let sIdx = 0; sIdx < rawSubjects.length; sIdx++) {
    const sub = rawSubjects[sIdx];
    const subTitle = sub.title || sub.name || sub.subjectName || sub.courseSubject?.title || sub.courseSubjectName || `বিষয় ${sIdx + 1}`;

    const chapRes = await fetchAcs(`${apiBase}/course/subject/chapter/course-subject/${sub.id}?courseSubjectId=${sub.id}&limit=1000`, rawToken, activeSubdomain, clientHeaders);
    const rawChapters = chapRes.data || [];

    const formattedChapters: any[] = [];
    rawChapters.forEach((ch: any, cIdx: number) => {
      const classes = ch.classes || ch.courseClasses || [];
      classesCount += classes.length;

      const formattedClasses = classes.map((cl: any) => ({
        id: cl.id || cl.classId,
        title: cl.title || cl.name || cl.classTitle || '',
        videoUrl: cl.videoUrl || cl.video || cl.room_id || cl.videoId || '',
        hosting: cl.videoType || cl.hosting || '',
        libraryId: cl.libraryId || cl.libId || '',
        lectureSheet: cl.lectureSheetPdf || cl.lectureSheet || '',
        practiceSheet: cl.practiceSheetPdf || cl.practiceSheet || '',
        description: cl.description || '',
        duration: cl.duration || ''
      }));

      formattedChapters.push({
        id: ch.id || `${sub.id}_ch_${cIdx + 1}`,
        title: ch.title || ch.name || ch.chapterName || `অধ্যায় ${cIdx + 1}`,
        classes: formattedClasses
      });
    });

    formattedSubjects.push({
      id: sub.id,
      title: subTitle,
      chapters: formattedChapters
    });
  }

  return { subjects: formattedSubjects, totalClasses: classesCount, usedSubdomain: activeSubdomain };
}

// GET: সকল কানেক্টেড ব্রিজের তালিকা
export async function GET() {
  const configs = loadBridgeConfigs();
  const safeList = configs.map(b => ({
    ...b,
    tokenMasked: b.token ? `${b.token.slice(0, 10)}...${b.token.slice(-6)}` : ''
  }));

  return NextResponse.json({ success: true, bridges: safeList });
}

// POST: নতুন কোর্স কানেক্ট ও প্রাথমিক সিঙ্ক
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseUrlOrId, token, archiveUrlOrId, courseTitle, forceNew } = body;

    if (!courseUrlOrId || !token) {
      return NextResponse.json({ success: false, message: 'কোর্স আইডি / লিংক এবং অথেন্টিকেশন টোকেন বাধ্যতামূলক!' }, { status: 400 });
    }

    const courseId = extractCourseId(courseUrlOrId);
    const archiveCourseId = archiveUrlOrId ? extractCourseId(archiveUrlOrId) : undefined;
    const { apiBase, subdomain } = resolveApiBaseAndSubdomain(courseUrlOrId);

    const clientHeaders: ClientHeaders = {
      userAgent: request.headers.get('user-agent') || undefined,
      secChUa: request.headers.get('sec-ch-ua') || undefined,
      secChUaPlatform: request.headers.get('sec-ch-ua-platform') || undefined,
      secChUaMobile: request.headers.get('sec-ch-ua-mobile') || undefined,
      acceptLanguage: request.headers.get('accept-language') || undefined
    };

    // ১. ACS থেকে কোর্স টাইটেল আনা (যদি ইউজার না দিয়ে থাকেন)
    let finalTitle = courseTitle ? courseTitle.trim() : '';
    if (!finalTitle) {
      try {
        const cRes = await fetchAcs(`${apiBase}/course/${courseId}`, token, subdomain, clientHeaders);
        if (cRes.data?.title || cRes.data?.name) {
          finalTitle = cRes.data.title || cRes.data.name;
        }
      } catch (e) {}
    }
    if (!finalTitle || finalTitle === 'ACS Course') {
      finalTitle = `ACS Course (${courseId.slice(0, 8)})`;
    }

    // ২. মেইন কোর্স স্ট্রাকচার ও ক্লাস ফেচ করা
    const mainData = await fetchCourseFromAcs(courseId, apiBase, token, subdomain, false, clientHeaders);

    if (mainData.subjects.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'কোর্সে কোনো বিষয় বা ক্লাস পাওয়া যায়নি। দয়া করে টোকেন বা কোর্স আইডি সঠিক কি না যাচাই করুন।' 
      }, { status: 400 });
    }

    // ৩. আর্কাইভ থাকলে ফেচ করা
    let archiveData: any = null;
    if (archiveCourseId) {
      try {
        const arc = await fetchCourseFromAcs(archiveCourseId, apiBase, token, subdomain, true, clientHeaders);
        archiveData = {
          courseId: archiveCourseId,
          title: 'আর্কাইভ ব্যাচ (Previous Batch Archive)',
          totalSubjects: arc.subjects.length,
          totalClasses: arc.totalClasses,
          subjects: arc.subjects
        };
      } catch (e: any) {
        console.warn('Archive fetch error:', e.message);
      }
    }

    const payloadToImport: any = {
      courseId,
      courseTitle: finalTitle,
      totalClasses: mainData.totalClasses,
      subjects: mainData.subjects,
      forceNew: Boolean(forceNew)
    };
    if (archiveData) {
      payloadToImport.archive = archiveData;
    }

    // ৪. ইমপোর্ট প্রসেসরে পাঠানো (ইনক্রিমেন্টাল বা নতুন কোর্স)
    const importResult = await processCourseImport(payloadToImport);

    if (!importResult.success) {
      return NextResponse.json({ success: false, message: importResult.message }, { status: 400 });
    }

    // ৫. ব্রিজ কনফিগারেশন সেভ করা
    const configs = loadBridgeConfigs();
    const cleanId = courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const bridgeId = 'bridge_' + cleanId;
    const targetCourseId = importResult.course?.id || ('course_acs_' + cleanId);

    const newBridge: BridgeConfig = {
      id: bridgeId,
      courseId,
      title: finalTitle,
      targetCourseId,
      subdomain,
      apiBase,
      token,
      archiveCourseId,
      lastSyncedAt: new Date().toISOString(),
      totalLectures: importResult.course?.totalLectures || (mainData.totalClasses + (archiveData?.totalClasses || 0)),
      status: 'connected',
      lastDiff: importResult.diff
    };

    const existingIdx = configs.findIndex(b => b.id === bridgeId || b.courseId === courseId);
    if (existingIdx >= 0) {
      configs[existingIdx] = newBridge;
    } else {
      configs.push(newBridge);
    }
    saveBridgeConfigs(configs);

    return NextResponse.json({
      success: true,
      bridge: { ...newBridge, tokenMasked: `${token.slice(0, 10)}...${token.slice(-6)}` },
      diff: importResult.diff,
      course: importResult.course
    });

  } catch (err: any) {
    console.error('Bridge connect error:', err);
    const cleanMsg = (err.message || 'অপ্রত্যাশিত ত্রুটি ঘটেছে').replace(/^Error:\s*/i, '');
    return NextResponse.json({ success: false, message: cleanMsg, detail: err.message }, { status: 500 });
  }
}

// PUT: ১-ক্লিক ম্যানুয়াল বা ব্যাকগ্রাউন্ড রি-সিঙ্ক
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bridgeId, token } = body;

    if (!bridgeId) {
      return NextResponse.json({ success: false, message: 'bridgeId প্রদান করুন।' }, { status: 400 });
    }

    const configs = loadBridgeConfigs();
    const bridge = configs.find(b => b.id === bridgeId);

    if (!bridge) {
      return NextResponse.json({ success: false, message: 'ব্রিজ কনফিগারেশন খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    const clientHeaders: ClientHeaders = {
      userAgent: request.headers.get('user-agent') || undefined,
      secChUa: request.headers.get('sec-ch-ua') || undefined,
      secChUaPlatform: request.headers.get('sec-ch-ua-platform') || undefined,
      secChUaMobile: request.headers.get('sec-ch-ua-mobile') || undefined,
      acceptLanguage: request.headers.get('accept-language') || undefined
    };

    const activeToken = token ? token.trim() : bridge.token;
    if (token) bridge.token = token.trim();

    // ACS থেকে লাইভ ফেচ
    const activeSubdomain = bridge.subdomain || 'admission.aparsclassroom.com';
    const mainData = await fetchCourseFromAcs(bridge.courseId, bridge.apiBase, activeToken, activeSubdomain, false, clientHeaders);

    let archiveData: any = null;
    if (bridge.archiveCourseId) {
      try {
        const arc = await fetchCourseFromAcs(bridge.archiveCourseId, bridge.apiBase, activeToken, activeSubdomain, true, clientHeaders);
        archiveData = {
          courseId: bridge.archiveCourseId,
          title: 'আর্কাইভ ব্যাচ (Previous Batch Archive)',
          totalSubjects: arc.subjects.length,
          totalClasses: arc.totalClasses,
          subjects: arc.subjects
        };
      } catch (e) {}
    }

    const payloadToImport: any = {
      courseId: bridge.courseId,
      courseTitle: bridge.title,
      targetCourseId: bridge.targetCourseId,
      totalClasses: mainData.totalClasses,
      subjects: mainData.subjects,
      forceNew: false
    };
    if (archiveData) payloadToImport.archive = archiveData;

    const importResult = await processCourseImport(payloadToImport);

    if (!importResult.success) {
      bridge.status = 'error';
      bridge.lastError = importResult.message;
      saveBridgeConfigs(configs);
      return NextResponse.json({ success: false, message: importResult.message }, { status: 400 });
    }

    bridge.status = 'connected';
    bridge.lastSyncedAt = new Date().toISOString();
    bridge.totalLectures = importResult.course?.totalLectures || bridge.totalLectures;
    bridge.lastDiff = importResult.diff;
    delete bridge.lastError;
    saveBridgeConfigs(configs);

    return NextResponse.json({
      success: true,
      bridge: { ...bridge, tokenMasked: `${activeToken.slice(0, 10)}...${activeToken.slice(-6)}` },
      diff: importResult.diff,
      course: importResult.course
    });

  } catch (err: any) {
    console.error('Bridge sync error:', err);
    return NextResponse.json({ success: false, message: 'লাইভ সিঙ্ক ব্যর্থ হয়েছে: ' + err.message }, { status: 500 });
  }
}

// DELETE: ব্রিজ ডিসকানেক্ট করা
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bridgeId = searchParams.get('id');

    if (!bridgeId) {
      return NextResponse.json({ success: false, message: 'id প্যারামিটার অনুপস্থিত।' }, { status: 400 });
    }

    const configs = loadBridgeConfigs();
    const filtered = configs.filter(b => b.id !== bridgeId);
    saveBridgeConfigs(filtered);

    return NextResponse.json({ success: true, message: 'ব্রিজ সফলভাবে ডিসকানেক্ট করা হয়েছে।' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
