/**
 * ADOMMO (অদম্য) — Universal ACS Multi-Subdomain Course & Archive Scraper
 * 
 * সাপোর্ট করে:
 * - সকল ACS সাবডোমেন: engineering.aparsclassroom.com, frb.aparsclassroom.com, varsity.aparsclassroom.com, ইত্যাদি
 * - স্বয়ংক্রিয় API Base URL ডিটেকশন (api.varsity, api.engineering, api.aparsclassroom ইত্যাদি)
 * - নিখুঁত টাইটেল ডিটেকশন (name, subjectName, courseSubjectName, chapterName ইত্যাদি যা আগে null আসতো)
 * - YouTube (premyt / 11-char ID) এবং BunnyCDN ক্লাউড স্ট্রিম
 * - Google Drive লেকচার শিট, প্র্যাকটিস শিট ও সল্যুশন বুকলেট
 * - স্বয়ংক্রিয় আর্কাইভ ব্যাচ ডিটেকশন ও ফুল এক্সট্র্যাক্ট
 */

(async function universalACSExtractor() {
  console.clear();
  console.log("%c🚀 ADOMMO — Universal ACS Multi-Subdomain Scraper শুরু হচ্ছে...", "color: #00c269; font-size: 16px; font-weight: bold;");

  // ১. স্বয়ংক্রিয়ভাবে JWT টোকেন শনাক্ত করা
  let token = '';
  let tokenSource = '';

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key) || '';
    const match = val.match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/);
    if (match) {
      token = match[0];
      tokenSource = `localStorage [${key}]`;
      break;
    }
  }

  if (!token) {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const val = sessionStorage.getItem(key) || '';
      const match = val.match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/);
      if (match) {
        token = match[0];
        tokenSource = `sessionStorage [${key}]`;
        break;
      }
    }
  }

  if (!token) {
    const cookieMatch = document.cookie.match(/(?:token|access_token|jwt)=([^;]+)/i);
    if (cookieMatch) {
      token = cookieMatch[1];
      tokenSource = 'Cookies';
    }
  }

  console.log(token ? `🔑 অথেনটিকেশন টোকেন পাওয়া গেছে (${tokenSource})!` : `⚠️ সরাসরি টোকেন পাওয়া যায়নি, কুকি দিয়ে চেষ্টা করা হবে।`);

  // ২. সাবডোমেন অনুযায়ী আসল API Base URL শনাক্ত করা
  let API_BASE = '';
  try {
    const apiResources = performance.getEntriesByType('resource')
      .map(r => r.name)
      .filter(n => n.includes('/api/'));
    const detected = apiResources.find(n => n.includes('/api/v1/'));
    if (detected) {
      const m = detected.match(/(https?:\/\/[^\/]+\/api\/v1)/);
      if (m) API_BASE = m[1];
    }
  } catch (e) {}

  // যদি নেটওয়ার্ক রিসোর্স থেকে না পায়, সাবডোমেন দিয়ে অটো সিলেক্ট
  if (!API_BASE) {
    const host = location.hostname.toLowerCase();
    if (host.includes('engineering')) {
      API_BASE = 'https://api.engineering.aparsclassroom.com/api/v1';
    } else if (host.includes('admission')) {
      API_BASE = 'https://api.varsity.aparsclassroom.com/api/v1';
    } else if (host.includes('varsity') || host.includes('frb')) {
      API_BASE = 'https://api.varsity.aparsclassroom.com/api/v1';
    } else if (host.includes('medical')) {
      API_BASE = 'https://api.medical.aparsclassroom.com/api/v1';
    } else {
      API_BASE = 'https://api.varsity.aparsclassroom.com/api/v1';
    }
  }

  console.log(`🌐 শনাক্তকৃত API এন্ডপয়েন্ট: ${API_BASE}`);

  // ৩. মেইন কোর্স আইডি শনাক্ত করা
  const urlMatch = location.href.match(/course\/([a-zA-Z0-9-]+)/i) || 
                   location.href.match(/shop\/([a-zA-Z0-9-]+)/i);
  let defaultCourse = urlMatch ? urlMatch[1] : '';
  
  let courseInput = prompt("কোর্স আইডি বা কোর্স লিংক দিন:", defaultCourse);
  if (!courseInput) return;
  const courseIdMatch = courseInput.trim().match(/(?:course|shop)\/([^\/?#]+)/i);
  const courseId = courseIdMatch ? courseIdMatch[1] : courseInput.trim();

  // ৪. পেজ থেকে আর্কাইভ (Archive) কার্ড শনাক্ত করা
  let detectedArchiveId = '';
  try {
    const allLinks = Array.from(document.querySelectorAll('a[href*="/course/"], a[href*="/shop/"]'));
    const archiveLink = allLinks.find(a => 
      /archive|আর্কাইভ|previous|পূর্ব|পুর্ব/i.test(a.textContent || '') || 
      /archive|previous/i.test(a.getAttribute('href') || '')
    );

    if (archiveLink) {
      const m = (archiveLink.getAttribute('href') || '').match(/(?:course|shop)\/([a-zA-Z0-9-]+)/i);
      if (m && m[1] !== courseId) {
        detectedArchiveId = m[1];
      }
    }
  } catch (e) {}

  if (!detectedArchiveId && (courseId.includes('c82195b9') || location.href.toLowerCase().includes('frb'))) {
    detectedArchiveId = '52acc196-55a7-4499-9ca2-dc44ccab3568';
  }

  let archiveInput = prompt(
    "আর্কাইভ ব্যাচের কোর্স আইডি বা লিংক:\\n(পেজে পাওয়া আইডি নিচে দেয়া হয়েছে। আর্কাইভ নিতে চাইলে OK দিন, না থাকলে ফাঁকা রাখুন):", 
    detectedArchiveId
  );
  let archiveCourseId = '';
  if (archiveInput && archiveInput.trim()) {
    const m = archiveInput.trim().match(/(?:course|shop)\/([a-zA-Z0-9-]+)/i);
    archiveCourseId = m ? m[1] : archiveInput.trim();
  }

  const headers = {
    'accept': 'application/json, text/plain, */*',
    'x-access-token': token,
    'authorization': token ? `Bearer ${token}` : ''
  };

  console.log(`📦 কোর্স আইডি: ${courseId}`);
  if (archiveCourseId) {
    console.log(`🗄️ আর্কাইভ কোর্স আইডি: ${archiveCourseId}`);
  }

  let courseTitle = '';
  try {
    const cRes = await fetch(`${API_BASE}/course/${courseId}`, { headers, credentials: 'include' });
    const cJson = await cRes.json();
    if (cJson.data?.title || cJson.data?.name) {
      courseTitle = cJson.data.title || cJson.data.name;
    }
  } catch(e) {}

  if (!courseTitle) {
    try {
      const h1 = document.querySelector('h1')?.textContent?.trim();
      if (h1 && h1.length > 2 && !/apars|dashboard|login|welcome/i.test(h1)) {
        courseTitle = h1;
      }
    } catch (e) {}
  }

  if (!courseTitle || courseTitle === 'ACS Admission Special Private Programme') {
    const docTitle = document.title?.trim();
    if (docTitle && !/apars\s*classroom/i.test(docTitle)) {
      courseTitle = docTitle;
    }
  }

  if (!courseTitle) {
    const userTitle = prompt("কোর্সের নাম নিশ্চিত করুন:", "ACS Course");
    courseTitle = userTitle?.trim() || "ACS Course";
  }

  function formatDrivePdf(val) {
    if (!val) return null;
    if (typeof val === 'string' && val.startsWith('http')) return val;
    return `https://drive.google.com/file/d/${val}/view`;
  }

  // হেল্পার ফাংশন: কোর্স স্ট্রাকচার স্ক্র্যাপ
  async function scrapeCourseStructure(cId, isArchive = false) {
    const label = isArchive ? "🗄️ আর্কাইভ" : "📚 মেইন";
    console.log(`${label} কোর্স ডেটা ফেচ করা হচ্ছে... [ID: ${cId}]`);

    const subRes = await fetch(`${API_BASE}/course-subject/subjects/${cId}?limit=100`, { 
      headers, 
      credentials: 'include' 
    });
    const subJson = await subRes.json();
    const rawSubjects = subJson.data || [];

    if (!rawSubjects.length) {
      console.warn(`⚠️ ${label} কোর্সে কোনো বিষয় পাওয়া যায়নি!`);
      return { subjects: [], totalClasses: 0 };
    }

    console.log(`%c✅ ${label} কোর্সে ${rawSubjects.length} টি বিষয় পাওয়া গেছে!`, "color: #00c269; font-weight: bold;");

    const formattedSubjects = [];
    let classesCount = 0;

    for (let sIdx = 0; sIdx < rawSubjects.length; sIdx++) {
      const sub = rawSubjects[sIdx];
      // গভীর টাইটেল ডিটেকশন (Engineering ও অন্যান্য সাবডোমেনের ভিন্ন ভিন্ন ফিল্ড নাম হ্যান্ডলিং)
      const subTitle = sub.title || sub.name || sub.subjectName || sub.courseSubject?.title || sub.courseSubjectName || `বিষয় ${sIdx + 1}`;
      console.log(`👉 [${sIdx + 1}/${rawSubjects.length}] বিষয়: ${subTitle}`);

      const chapRes = await fetch(`${API_BASE}/course/subject/chapter/course-subject/${sub.id}?courseSubjectId=${sub.id}&limit=1000`, { 
        headers, 
        credentials: 'include' 
      });
      const chapJson = await chapRes.json();
      const rawChapters = chapJson.data || [];

      const isBangla = /বাংলা|bangla/i.test(subTitle);
      const isEnglish = /english|ইংরেজি/i.test(subTitle);

      const subjectObj = {
        id: sub.id,
        title: subTitle,
        isArchive: isArchive,
        isMultiPaper: (isBangla || isEnglish) && rawChapters.length >= 2,
        chapters: []
      };

      for (let cIdx = 0; cIdx < rawChapters.length; cIdx++) {
        const ch = rawChapters[cIdx];
        const chapTitle = ch.title || ch.name || ch.chapterName || ch.courseSubjectChapterName || `অধ্যায় ${cIdx + 1}`;

        let paperTag = '';
        if (isBangla) {
          paperTag = cIdx === 0 ? 'বাংলা ১ম পত্র (সাহিত্য)' : 'বাংলা ২য় পত্র (ব্যাকরণ)';
        } else if (isEnglish) {
          paperTag = cIdx === 0 ? 'English 1st Paper' : 'English 2nd Paper';
        }

        try {
          const classRes = await fetch(`${API_BASE}/class/all/videos/${ch.id}?limit=1000`, { 
            headers, 
            credentials: 'include' 
          });
          const classJson = await classRes.json();
          const rawClasses = classJson.data || [];

          const classes = rawClasses.map((cl, i) => {
            classesCount++;
            return {
              id: cl.id,
              classNo: cl.classNo || (i + 1).toString(),
              title: cl.classTitle || cl.title || cl.description || `Class ${i + 1}: ${chapTitle}`,
              description: cl.description || '',
              instructor: cl.instructor || cl.instructorName || 'ACS Instructor',
              hostingType: cl.hostingType || '',
              videoId: cl.videoId || '',
              videoUrl: cl.videoUrl || '',
              hlsPlaylistUrl: cl.hlsPlaylistUrl || null,
              iframePlayerUrl: cl.iframePlayerUrl || null,
              libraryId: cl.libraryId || '610687',
              lectureSheetPdf: formatDrivePdf(cl.lectureSheet || cl.lectureSheetPdf),
              practiceSheetPdf: formatDrivePdf(cl.practiceSheet || cl.practiceSheetPdf),
              solutionSheetPdf: formatDrivePdf(cl.solutionSheet || cl.solutionSheetPdf),
              markedBookPdf: formatDrivePdf(cl.markedBook || cl.markedBookPdf),
              paperTag: paperTag || null
            };
          });

          subjectObj.chapters.push({
            id: ch.id,
            title: chapTitle,
            paperTag: paperTag || null,
            classes
          });
        } catch(cErr) {
          // ফাঁকা অধ্যায় বা যেগুলোতে ক্লাস হয়নি, সেগুলোকে ফাঁকা অ্যারে দিয়ে সংরক্ষণ করা যাতে পরে আপডেট হলে নেওয়া যায়
          subjectObj.chapters.push({
            id: ch.id,
            title: chapTitle,
            paperTag: paperTag || null,
            classes: []
          });
        }
      }

      formattedSubjects.push(subjectObj);
    }

    return { subjects: formattedSubjects, totalClasses: classesCount };
  }

  try {
    console.log("১ম ধাপ: কোর্সের ক্লাস সংগ্রহ শুরু হচ্ছে...");
    const mainData = await scrapeCourseStructure(courseId, false);

    const fullCourseData = {
      courseId,
      courseTitle,
      extractedAt: new Date().toISOString(),
      apiBaseUsed: API_BASE,
      subdomain: location.hostname,
      totalSubjects: mainData.subjects.length,
      totalClasses: mainData.totalClasses,
      subjects: mainData.subjects
    };

    if (archiveCourseId) {
      console.log("২য় ধাপ: আর্কাইভ কোর্সের ক্লাস সংগ্রহ শুরু হচ্ছে...");
      let archiveTitle = "আর্কাইভ ব্যাচ (Previous Batch Archive)";
      try {
        const aRes = await fetch(`${API_BASE}/course/${archiveCourseId}`, { headers, credentials: 'include' });
        const aJson = await aRes.json();
        if (aJson.data?.title || aJson.data?.name) {
          archiveTitle = `আর্কাইভ: ${aJson.data.title || aJson.data.name}`;
        }
      } catch (e) {}

      const archiveData = await scrapeCourseStructure(archiveCourseId, true);
      fullCourseData.archive = {
        courseId: archiveCourseId,
        title: archiveTitle,
        totalSubjects: archiveData.subjects.length,
        totalClasses: archiveData.totalClasses,
        subjects: archiveData.subjects
      };

      console.log(`%c🗄️ আর্কাইভ সফলভাবে এক্সট্র্যাক্ট হয়েছে! (${archiveData.totalClasses} টি ক্লাস)`, "color: #eab308; font-weight: bold;");
    }

    const totalCombinedClasses = fullCourseData.totalClasses + (fullCourseData.archive?.totalClasses || 0);
    const blob = new Blob([JSON.stringify(fullCourseData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const cleanName = (courseTitle.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_') || 'course') + '.json';
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`🎉 সম্পূর্ণ কোর্স সফলভাবে এক্সপোর্ট হয়েছে!\\n\\n📌 মেইন ক্লাস: ${fullCourseData.totalClasses} টি\\n📌 আর্কাইভ ক্লাস: ${fullCourseData.archive?.totalClasses || 0} টি\\n📌 সর্বমোট ক্লাস: ${totalCombinedClasses} টি\\n\\nফাইল (${cleanName}) ডাউনলোড হয়েছে। এবার এটি আমাদের ওয়েবসাইটে আপলোড করুন।`);

    console.log("=========================================");
    console.log(`%c🎉 সম্পূর্ণ কোর্স সফলভাবে এক্সপোর্ট হয়েছে!`, "color: #00c269; font-size: 18px; font-weight: bold;");
    console.log(`📌 মেইন ক্লাস: ${fullCourseData.totalClasses} টি`);
    if (fullCourseData.archive) {
      console.log(`📌 আর্কাইভ ক্লাস: ${fullCourseData.archive.totalClasses} টি`);
    }
    console.log(`📌 সর্বমোট ক্লাস: ${totalCombinedClasses} টি`);
    console.log(`📁 ফাইলটি ডাউনলোড হয়েছে: ${cleanName}`);
    console.log("=========================================");
  } catch (err) {
    console.error("❌ এক্সট্রাকশন ত্রুটি:", err);
    alert("এক্সট্র্যাক্ট করতে সমস্যা হয়েছে: " + err.message);
  }
})();
