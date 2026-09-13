const TELEGRAM_WEB_SCRAPER_CODE = String.raw`/**
 * ADOMMO (অদম্য) — 1-Click Telegram Web Course & Chapter Scraper (Zero-Loss v3)
 * টেলিগ্রাম ওয়েবের (K & A ভার্সন) যে-কোনো চ্যানেল বা টপিক থেকে সব ক্লাস, ভিডিও ও ড্রাইভ শিট চ্যাপ্টার অনুযায়ী স্বয়ংক্রিয় সংগ্রহ করে
 */
(async function extractTelegramChapterCourse() {
  console.clear();
  console.log("%c🚀 ADOMMO — টেলিগ্রাম কোর্স ও চ্যাপ্টার স্ক্র্যাপার (Zero-Loss v3) শুরু হচ্ছে...", "color: #0088cc; font-size: 16px; font-weight: bold;");

  // ১. গ্রুপ বা টপিকের নাম স্বয়ংক্রিয় শনাক্ত করা
  function getDetectedTitle() {
    const selectors = [
      '.top-title',
      '.chat-info .peer-title',
      '.chat-info .title',
      '.header-tools .peer-title',
      '.middle-column .chat-info h3',
      'header .peer-title',
      '.sidebar-header .title'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent && el.textContent.trim()) {
        let t = el.textContent.trim();
        if (t.includes(':')) t = t.split(':').pop().trim();
        return t;
      }
    }
    return '';
  }

  let autoTitle = getDetectedTitle() || "Telegram Course";
  const userTitle = prompt("📌 কোন বিষয় বা কোর্সের টপিক স্ক্র্যাপ করছেন? (নাম নিশ্চিত করুন):", autoTitle);
  if (!userTitle || !userTitle.trim()) {
    console.log("❌ ব্যবহারকারী বাতিল করেছেন।");
    return;
  }
  const cleanSubjectName = userTitle.trim();

  // ২. স্ক্রোল কন্টেইনার নিখুঁতভাবে শনাক্ত করা (Telegram Web A & K উভয় সাপোর্ট)
  function getScrollContainer() {
    const candidates = [
      document.querySelector('.Transition_slide-active .MessageList'),
      document.querySelector('.MessageList.custom-scroll'),
      document.querySelector('.MessageList'),
      document.querySelector('.messages-container'),
      document.querySelector('.bubbles-inner'),
      document.querySelector('.bubbles'),
      document.querySelector('.messages-layout .custom-scroll'),
      document.querySelector('.custom-scroll')
    ].filter(Boolean);

    for (const el of candidates) {
      if (el && el.scrollHeight > el.clientHeight + 50) return el;
    }

    const all = Array.from(document.querySelectorAll('.middle-column *, main *, #middle-column *, #column-center *'));
    for (const el of all) {
      try {
        const style = window.getComputedStyle(el);
        const oy = style.overflowY || '';
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 50) {
          return el;
        }
      } catch(e) {}
    }
    return window;
  }

  const scrollEl = getScrollContainer();
  console.log("⏳ আগের সব ক্লাস ও শিট লোড করার জন্য চ্যাট হিস্টোরি নিখুঁতভাবে স্ক্রোল করা হচ্ছে...");

  // ৩. মেসেজ পার্সিং ফাংশন (কোনো ক্লাস যেন মিস না যায়)
  function parseMessageElement(msgEl, index) {
    const text = (msgEl.innerText || msgEl.textContent || '').trim();
    if (!text || text.length < 4) return null;

    const hasYouTube = /youtu\.?be|youtube\.com/i.test(text);
    const hasFacebook = /facebook\.com|fb\.watch/i.test(text);
    const hasDrive = /drive\.google\.com/i.test(text);
    const hasVideo = msgEl.querySelector('video, .video-player, .tgico-play, .media-video') !== null;
    const isOnlyDuration = /^\d{1,2}:\d{2}(?::\d{2})?$/.test(text.trim());
    if (isOnlyDuration) return null; // Pure duration badge is not a class!
    const hasDuration = /^\d{1,2}:\d{2}(?::\d{2})?$/m.test(text);
    const hasClass = /class|ক্লাস|part|পার্ট|পর্ব|বই|book|sheet|লেকচার|অধ্যায়|chapter|লেক|cq|mcq/i.test(text);

    // কোনো ক্লাস বা ভিডিও বা ড্রাইভের আলামত না থাকলে বাদ
    if (!hasYouTube && !hasFacebook && !hasDrive && !hasVideo && !hasDuration && !hasClass) {
      return null;
    }

    // লিংক সংগ্রহ
    const linkEls = Array.from(msgEl.querySelectorAll('a'));
    const links = linkEls.map(a => ({
      href: a.href || a.getAttribute('href') || '',
      text: (a.innerText || a.textContent || '').trim()
    }));

    const rawUrls = text.match(/https?:\/\/[^\s\)\"\'\[\]\>]+/g) || [];
    for (const u of rawUrls) {
      if (!links.some(l => l.href === u)) {
        links.push({ href: u, text: '' });
      }
    }

    // Video URL detection (YouTube, Facebook, etc.)
    let videoUrl = '';
    const ytMatch = text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s\)\"\'\[\]\>]*)/i);
    if (ytMatch) {
      videoUrl = ytMatch[1];
    } else {
      const fbMatch = text.match(/(https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch)\/[^\s\)\"\'\[\]\>]+)/i);
      if (fbMatch) {
        videoUrl = fbMatch[1];
      } else {
        const lYt = links.find(l => /youtube\.com|youtu\.be/i.test(l.href));
        if (lYt) videoUrl = lYt.href;
      }
    }

    // ড্রাইভ লিংক খোঁজা
    const extractDrive = (regex) => {
      const mLink = links.find(l => regex.test(l.text) && l.href.includes('drive.google.com'));
      if (mLink) return mLink.href;

      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          const combined = lines[i] + ' ' + (lines[i + 1] || '');
          const m = combined.match(/(https?:\/\/drive\.google\.com\/[^\s\)\"\'\[\]\>]+)/i);
          if (m) return m[1];
        }
      }
      return null;
    };

    let markedBookPdf = extractDrive(/marked\s*book|দাগানো\s*বই/i);
    let lectureSheetPdf = extractDrive(/lecture\s*sheet|লেকচার\s*শিট|নোট|handnote/i);
    let practiceSheetPdf = extractDrive(/practice\s*sheet|প্র্যাকটিস\s*শিট|cq|mcq/i);
    let solutionSheetPdf = extractDrive(/solution|সল্যুশন|সলভ|booklet/i);

    const allDrive = Array.from(new Set(links.filter(l => l.href.includes('drive.google.com')).map(l => l.href)));
    if (!lectureSheetPdf && allDrive.length > 0) {
      lectureSheetPdf = allDrive.find(u => u !== markedBookPdf && u !== practiceSheetPdf && u !== solutionSheetPdf) || null;
    }
    if (!markedBookPdf && allDrive.length > 1) {
      markedBookPdf = allDrive.find(u => u !== lectureSheetPdf && u !== practiceSheetPdf && u !== solutionSheetPdf) || null;
    }

    // যদি ভিডিও লিংক না থাকে কিন্তু ভিডিও বা সময় থাকে
    if (!videoUrl && (hasVideo || hasDuration)) {
      videoUrl = ''; // Telegram Native Video
    }

    // শিরোনাম নিখুঁতভাবে নির্ধারণ
    function extractBestTitle(msgText) {
      const allLines = msgText.split('\n').map(l => l.trim()).filter(Boolean);

      const isMetadataLine = (line) => {
        const clean = line
          .replace(/[^\w\s\u0980-\u09FF]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();

        // Pure URL
        if (/^https?:\/\//i.test(line)) return true;

        // Pure duration or timestamp
        if (/^\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:am|pm))?$/i.test(clean)) return true;
        if (/^(?:duration|সময়|টাইম|দৈর্ঘ্য)[:\s]*\d+/i.test(clean)) return true;
        if (/^\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}$/.test(clean)) return true;
        if (/^edited\s*\d{1,2}:\d{2}/i.test(clean)) return true;

        // Pure link labels
        if (/^(?:youtube|facebook|lecture\s*sheet|practice\s*sheet|practice\s*sheet\s*solution|solution|solution\s*sheet|marked\s*book|দাগানো\s*বই|লেকচার\s*শিট|প্র্যাকটিস\s*শিট|সল্যুশন|ড্রাইভ\s*লিংক|drive\s*link)$/i.test(clean)) {
          return true;
        }

        if (!/[a-zA-Z\u0980-\u09FF]/.test(clean)) return true;
        return false;
      };

      for (const line of allLines) {
        if (!isMetadataLine(line)) {
          const cleanLine = line
            .replace(/^[^\w\u0980-\u09FF]+/g, '')
            .replace(/[^\w\u0980-\u09FF]+$/g, '')
            .trim();
          if (cleanLine.length >= 2) return cleanLine;
        }
      }
      return '';
    }

    let cleanTitle = extractBestTitle(text);
    if (!cleanTitle) {
      cleanTitle = 'ক্লাস ' + (index + 1);
    }

    let instructor = '';
    if (cleanTitle.includes(' - ')) {
      const parts = cleanTitle.split(' - ');
      if (parts.length >= 2 && parts[parts.length - 1].length < 30) {
        instructor = parts.pop()?.trim() || '';
        cleanTitle = parts.join(' - ').trim();
      }
    }

    const mid = msgEl.getAttribute('data-mid') || msgEl.getAttribute('data-message-id') || msgEl.getAttribute('data-msg-id') || msgEl.id || '';

    return {
      mid: mid,
      title: cleanTitle,
      instructor: instructor || undefined,
      videoUrl: videoUrl,
      lectureSheetPdf: lectureSheetPdf,
      markedBookPdf: markedBookPdf,
      practiceSheetPdf: practiceSheetPdf,
      solutionSheetPdf: solutionSheetPdf
    };
  }

  // ৪. মেসেজ হার্ভেস্টিং (ডুপ্লিকেট ছাড়াই সব মেসেজ নেওয়া)
  const collectedMap = new Map();

  function harvest() {
    const rawElements = Array.from(document.querySelectorAll(
      '.Message, .message, [data-mid], [data-message-id], [data-msg-id], .bubble, .message-list-item, .MessageList-element'
    ));

    rawElements.forEach((el, idx) => {
      const p = parseMessageElement(el, idx);
      if (p) {
        // ইউনিক কি: ভিডিও লিংক থাকলে সেটা, নইলে ড্রাইভ লিংক, নইলে নরম্যালাইজড টাইটেল
        const normTitle = (p.title || '').toLowerCase().replace(/[^\w\u0980-\u09FF]/g, '');
        const uniqueKey = p.videoUrl 
          ? ('vid_' + p.videoUrl)
          : (p.lectureSheetPdf ? ('pdf_' + p.lectureSheetPdf) : ('title_' + normTitle));

        if (!collectedMap.has(uniqueKey)) {
          collectedMap.set(uniqueKey, p);
          console.log("%c   ✅ সংগৃহীত [" + collectedMap.size + "]: " + p.title, "color: #10b981; font-weight: bold;");
        }
      }
    });
  }

  // প্রাথমিক হার্ভেস্ট
  harvest();
  console.log("👉 প্রাথমিক স্ক্রিনে " + collectedMap.size + " টি ক্লাস পাওয়া গেছে।");

  // স্ক্রোল করার জন্য সহায়ক ফাংশন
  function triggerScroll(delta) {
    if (scrollEl === window) {
      window.scrollBy({ top: delta, behavior: 'auto' });
    } else {
      scrollEl.scrollTop += delta;
      try {
        scrollEl.dispatchEvent(new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true }));
      } catch(e) {}
      try {
        scrollEl.dispatchEvent(new Event('scroll', { bubbles: true }));
      } catch(e) {}
    }
  }

  const scrollStep = Math.min(480, Math.max(280, Math.floor((scrollEl.clientHeight || 700) * 0.6)));

  // ধাপ ১: সম্পূর্ণ ওপরে স্ক্রোল করে চ্যাটের শুরু (১ম ক্লাস) পর্যন্ত পৌঁছানো
  console.log("%c👆 ধাপ ১/২: চ্যাটের একদম শুরুর ১ম ক্লাস পর্যন্ত স্ক্রোল করা হচ্ছে...", "color: #0284c7; font-size: 13px; font-weight: bold;");
  let topIdleRounds = 0;
  let lastTopHeight = scrollEl === window ? document.documentElement.scrollHeight : scrollEl.scrollHeight;
  let lastTopCount = collectedMap.size;

  for (let u = 0; u < 80; u++) {
    triggerScroll(-scrollStep);
    await new Promise(r => setTimeout(r, 360));
    harvest();

    const currentScrollTop = scrollEl === window ? (window.scrollY || window.pageYOffset || 0) : scrollEl.scrollTop;
    const currentHeight = scrollEl === window ? document.documentElement.scrollHeight : scrollEl.scrollHeight;

    // ওপরে পৌঁছালে (scrollTop <= 10)
    if (currentScrollTop <= 10) {
      // পুরনো মেসেজ ফেচ করার ট্রিগার
      triggerScroll(-150);
      await new Promise(r => setTimeout(r, 700));
      harvest();

      if (collectedMap.size > lastTopCount || currentHeight !== lastTopHeight) {
        lastTopCount = collectedMap.size;
        lastTopHeight = currentHeight;
        topIdleRounds = 0;
        console.log("   🔄 শীর্ষে নতুন ক্লাস লোড হয়েছে! মোট সংগৃহীত: " + collectedMap.size + " টি");
      } else {
        topIdleRounds++;
        if (topIdleRounds >= 5) {
          console.log("🏁 চ্যাটের একদম শীর্ষ (১ম ক্লাস) সফলভাবে নিশ্চিত করা হয়েছে!");
          break;
        }
      }
    } else {
      topIdleRounds = 0;
    }
  }

  console.log("✅ ১ম ধাপ সম্পন্ন! এ পর্যন্ত সংগৃহীত: " + collectedMap.size + " টি ক্লাস");

  // ধাপ ২: এবার ওপর থেকে একদম নিচে স্ক্রোল করে শেষ ক্লাস পর্যন্ত সব হার্ভেস্ট করা
  console.log("%c👇 ধাপ ২/২: এবার ওপর থেকে ক্রমান্বয়ে নিচে স্ক্রোল করে সব শেষের ক্লাস সংগ্রহ করা হচ্ছে...", "color: #0284c7; font-size: 13px; font-weight: bold;");
  let bottomIdleRounds = 0;
  let lastBottomHeight = scrollEl === window ? document.documentElement.scrollHeight : scrollEl.scrollHeight;
  let lastBottomCount = collectedMap.size;

  for (let d = 0; d < 80; d++) {
    triggerScroll(scrollStep);
    await new Promise(r => setTimeout(r, 320));
    harvest();

    const currentScrollTop = scrollEl === window ? (window.scrollY || window.pageYOffset || 0) : scrollEl.scrollTop;
    const clientH = scrollEl === window ? window.innerHeight : scrollEl.clientHeight;
    const currentHeight = scrollEl === window ? document.documentElement.scrollHeight : scrollEl.scrollHeight;

    // নিচে পৌঁছালে
    if (currentScrollTop + clientH >= currentHeight - 20) {
      triggerScroll(150);
      await new Promise(r => setTimeout(r, 600));
      harvest();

      if (collectedMap.size > lastBottomCount || currentHeight !== lastBottomHeight) {
        lastBottomCount = collectedMap.size;
        lastBottomHeight = currentHeight;
        bottomIdleRounds = 0;
        console.log("   🔄 নিচে নতুন ক্লাস লোড হয়েছে! মোট সংগৃহীত: " + collectedMap.size + " টি");
      } else {
        bottomIdleRounds++;
        if (bottomIdleRounds >= 4) {
          console.log("🏁 চ্যাটের একদম শেষ ক্লাস সফলভাবে নিশ্চিত করা হয়েছে!");
          break;
        }
      }
    } else {
      bottomIdleRounds = 0;
    }
  }

  // ক্রমানুসারে সাজানো
  const classList = Array.from(collectedMap.values());

  if (classList.length === 0) {
    alert("❌ কোনো ক্লাস বা ড্রাইভ শিট খুঁজে পাওয়া যায়নি! নিশ্চিত করুন যে আপনি টপিকটিতে আছেন এবং মেসেজগুলো লোড হয়েছে।");
    return;
  }

  console.log("%c📋 সংগৃহীত সকল ক্লাস (" + classList.length + " টি):", "color: #f59e0b; font-weight: bold; font-size: 14px;");
  classList.forEach((cl, i) => {
    console.log("   " + (i + 1) + ". " + cl.title + (cl.videoUrl ? " [ভিডিও আছে]" : "") + (cl.lectureSheetPdf ? " [শিট আছে]" : ""));
  });

  // ৫. নিখুঁত অধ্যায় (Chapter) গ্রুপিং ও সিনোনিম মার্জার
  const CHAPTER_SYNONYMS = {
    'vector': 'ভেক্টর',
    'vectors': 'ভেক্টর',
    'ভেক্টর': 'ভেক্টর',
    'conic': 'কণিক',
    'conics': 'কণিক',
    'matrix': 'ম্যাট্রিক্স ও নির্ণায়ক',
    'matrices': 'ম্যাট্রিক্স ও নির্ণায়ক',
    'determinant': 'ম্যাট্রিক্স ও নির্ণায়ক',
    'determinants': 'ম্যাট্রিক্স ও নির্ণায়ক',
    'complex number': 'জটিল সংখ্যা',
    'complex numbers': 'জটিল সংখ্যা',
    'polynomial': 'বহুপদী ও বহুপদী সমীকরণ',
    'polynomials': 'বহুপদী ও বহুপদী সমীকরণ',
    'dynamics': 'গতিবিদ্যা',
    'গতিবিদ্যা': 'গতিবিদ্যা',
    'statics': 'স্থিতিবিদ্যা',
    'trigonometry': 'ত্রিকোণমিতি',
    'calculus': 'ক্যালকুলাস',
    'differentiation': 'অন্তরীকরণ',
    'integration': 'যোগজীকরণ',
    'newtonian mechanics': 'নিউটনিয়ান বলবিদ্যা',
    'নিউটনিয়ান বলবিদ্যা': 'নিউটনিয়ান বলবিদ্যা',
    'নিউটনীয় বলবিদ্যা': 'নিউটনিয়ান বলবিদ্যা',
    'নিউটনিয়ান বলবিদ্যা': 'নিউটনিয়ান বলবিদ্যা',
    'work power energy': 'কাজ, শক্তি ও ক্ষমতা',
    'কাজ ক্ষমতা শক্তি': 'কাজ, শক্তি ও ক্ষমতা',
    'কাজ শক্তি ও ক্ষমতা': 'কাজ, শক্তি ও ক্ষমতা',
    'কাজ ক্ষমতা ও শক্তি': 'কাজ, শক্তি ও ক্ষমতা',
    'কাজ শক্তি ক্ষমতা': 'কাজ, শক্তি ও ক্ষমতা',
    'gravitation': 'মহাকর্ষ ও অভিকর্ষ',
    'gravity': 'মহাকর্ষ ও অভিকর্ষ',
    'মহাকর্ষ ও অভিকর্ষ': 'মহাকর্ষ ও অভিকর্ষ',
    'মহাকর্ষ': 'মহাকর্ষ ও অভিকর্ষ',
    'periodic motion': 'পর্যাবৃত্ত গতি',
    'পর্যাবৃত্ত গতি': 'পর্যাবৃত্ত গতি',
    'পর্যাবৃত্ত': 'পর্যাবৃত্ত গতি',
    'waves': 'তরঙ্গ',
    'ideal gas': 'আদর্শ গ্যাস',
    'thermodynamics': 'তাপগতিবিদ্যা',
    'electrostatics': 'স্থির তড়িৎ',
    'current electricity': 'চল তড়িৎ'
  };

  function detectChapterName(title) {
    if (!title) return 'মূল অধ্যায়';
    let s = title
      .replace(/[✔✅▶⏩🔹📌🔥•\\*\\_~\\|\\#\\(\\)\\[\\]\\{\\}]/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();

    s = s.replace(/^(?:physics|chemistry|math|biology|ict|বাংলা|গণিত|পদার্থ|রসায়ন|ch-?\\d+|chapter-?\\d+)\\s*[:–—\\-]\\s*/i, '');

    let prev = '';
    while (s !== prev) {
      prev = s;
      s = s
        .replace(/\\s*[-–—:]\\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\\s*[\\d০-৯]+.*$/i, '')
        .replace(/\\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\\s*[\\d০-৯]+.*$/i, '')
        .replace(/\\s*[-–—:]\s*[\\d০-৯]+.*$/i, '')
        .replace(/\\s+[\\d০-৯]+(?:\\s+(?:part|পার্ট|পর্ব|লেকচার)[\\s\\d০-৯]+)?.*$/i, '')
        .replace(/\\s*(?:part|পার্ট|পর্ব|লেকচার|class|ক্লাস)\\s*$/i, '')
        .replace(/\\s*[-–—:]\\s*$/i, '')
        .trim();
    }

    if (!s || s.length < 2) s = cleanSubjectName || 'মূল অধ্যায়';

    const lower = s.toLowerCase();
    if (CHAPTER_SYNONYMS[lower]) {
      s = CHAPTER_SYNONYMS[lower];
    } else if (CHAPTER_SYNONYMS[s]) {
      s = CHAPTER_SYNONYMS[s];
    }
    return s;
  }

  const chapterMap = new Map();
  classList.forEach((cl, idx) => {
    const chName = detectChapterName(cl.title);

    if (!chapterMap.has(chName)) {
      chapterMap.set(chName, []);
    }
    chapterMap.get(chName).push({
      id: 'tg_cl_' + (idx + 1),
      classNo: (chapterMap.get(chName).length + 1).toString(),
      ...cl
    });
  });

  const chapters = [];
  let cIdx = 1;
  for (const [chTitle, classes] of chapterMap.entries()) {
    chapters.push({
      id: 'tg_chap_' + cIdx++,
      title: chTitle,
      classes: classes
    });
  }

  const courseData = {
    courseId: 'tg_' + Date.now().toString(36),
    courseTitle: cleanSubjectName,
    source: 'Telegram Web (Zero-Loss v3)',
    extractedAt: new Date().toISOString(),
    totalSubjects: 1,
    totalClasses: classList.length,
    subjects: [
      {
        id: 'tg_sub_1',
        title: cleanSubjectName,
        chapters: chapters
      }
    ]
  };

  const blob = new Blob([JSON.stringify(courseData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const fileName = (cleanSubjectName.replace(/[\\\\/:*?"<>|]/g, '_').trim() || 'telegram_course') + '.json';
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  alert("🎉 [" + cleanSubjectName + "] থেকে সর্বমোট " + classList.length + " টি ক্লাস সফলভাবে এক্সপোর্ট হয়েছে!\n\n📁 ফাইল: " + fileName + "\n\nএবার ফাইলটি Tools পেজে আপলোড করে নিশ্চিত হয়ে নিন!");
  console.log("%c🎉 সফলভাবে এক্সপোর্ট সম্পন্ন হয়েছে! মোট অধ্যায়: " + chapters.length + ", সর্বমোট ক্লাস: " + classList.length, "color: #00c269; font-size: 16px; font-weight: bold;");
})();`;

module.exports = { TELEGRAM_WEB_SCRAPER_CODE };
