'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdommoLogo from '@/components/AdommoLogo';
import { 
  Wrench, 
  UploadCloud, 
  FileJson, 
  FolderTree, 
  Search, 
  Eye, 
  ChevronRight, 
  ChevronDown, 
  PlayCircle, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  User,
  ShieldCheck,
  Zap,
  Monitor,
  Globe,
  SlidersHorizontal,
  Edit3
} from 'lucide-react';

interface ParsedClass {
  id: string;
  classNo?: string | number;
  title: string;
  description?: string;
  instructor?: string;
  videoUrl?: string;
  videoId?: string;
  hostingType?: string;
  lectureSheetPdf?: string;
  practiceSheetPdf?: string;
  solutionSheetPdf?: string;
  markedBookPdf?: string;
  paperTag?: string;
  date?: string;
  [key: string]: any;
}

interface ParsedChapter {
  id: string;
  title: string;
  paperTag?: string;
  classes?: ParsedClass[];
  lectures?: any[];
  [key: string]: any;
}

interface ParsedSubject {
  id: string;
  title: string;
  isArchive?: boolean;
  isMultiPaper?: boolean;
  isIgnoredTopic?: boolean;
  topicId?: number;
  chapters?: ParsedChapter[];
  modules?: any[];
  [key: string]: any;
}

interface ParsedCourseData {
  courseId?: string;
  courseTitle?: string;
  title?: string;
  name?: string;
  subdomain?: string;
  source?: string;
  extractedAt?: string;
  totalSubjects?: number;
  totalClasses?: number;
  subjects?: ParsedSubject[];
  archive?: {
    courseId?: string;
    title?: string;
    totalSubjects?: number;
    totalClasses?: number;
    subjects?: ParsedSubject[];
  };
  sections?: any[];
  modules?: any[];
  [key: string]: any;
}

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

/**
 * Robust Telegram Desktop 'result.json' Export Parser
 */
function parseTelegramDesktopExport(data: any): ParsedCourseData {
  const IGNORED_TOPICS_REGEX = /announcement|notice|নোটিশ|অ্যানাউন্সমেন্ট|routine|রুটিন|schedule|সময়সূচী|rule|rules|নিয়ম|guideline|নির্দেশনা|chat|discussion|আড্ডা|কথোপকথন|doubt|problem|q&a|প্রশ্নোত্তর|admin|অ্যাডমিন|support|group\s*link|গ্রুপ\s*লিংক/i;

  const topicMap = new Map<number, string>();
  const replyMap = new Map<number, number>();

  const messages: any[] = Array.isArray(data.messages) ? data.messages : [];

  // 1. Identify all forum topics from service messages
  for (const m of messages) {
    if (m.type === 'service' && (m.action === 'topic_created' || m.action === 'create_topic' || m.title)) {
      if (m.title) {
        topicMap.set(m.id, m.title.trim());
      }
    }
    if (m.reply_to_message_id) {
      replyMap.set(m.id, m.reply_to_message_id);
    }
  }

  const getTopicTitleForMessage = (m: any): string | null => {
    let curr = m.reply_to_message_id;
    let depth = 0;
    while (curr && depth < 20) {
      if (topicMap.has(curr)) return topicMap.get(curr)!;
      curr = replyMap.get(curr);
      depth++;
    }
    return m.topic_name || null;
  };

  // 2. Parse classes and resources
  const topicClassesMap = new Map<string, ParsedClass[]>();

  for (const m of messages) {
    if (m.type !== 'message') continue;

    let fullText = '';
    const links: { url: string; label: string }[] = [];

    // Extract text and link objects from text
    if (typeof m.text === 'string') {
      fullText = m.text;
    } else if (Array.isArray(m.text)) {
      for (const item of m.text) {
        if (typeof item === 'string') {
          fullText += item;
        } else if (item && typeof item === 'object') {
          fullText += item.text || '';
          if (item.type === 'link' || item.type === 'text_link') {
            links.push({
              url: item.href || item.text || '',
              label: item.text || ''
            });
          }
        }
      }
    }

    // Modern Telegram Desktop text_entities
    if (Array.isArray(m.text_entities)) {
      for (const ent of m.text_entities) {
        if (ent.type === 'link' || ent.type === 'text_link') {
          const u = ent.href || ent.text || '';
          if (u && !links.some(l => l.url === u)) {
            links.push({ url: u, label: ent.text || '' });
          }
        }
      }
    }

    // Extract raw URLs
    const rawUrls = fullText.match(/https?:\/\/[^\s\)\]\">]+/g) || [];
    for (const u of rawUrls) {
      if (!links.some(l => l.url === u)) {
        links.push({ url: u, label: '' });
      }
    }

    // Find YouTube Video URL
    let videoUrl = '';
    const ytMatch = fullText.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s\)\"\'\]]*)/i);
    if (ytMatch) {
      videoUrl = ytMatch[1];
    } else {
      const linkYt = links.find(l => /youtube\.com|youtu\.be/i.test(l.url));
      if (linkYt) videoUrl = linkYt.url;
    }

    // Drive Sheet Extractor
    const extractDriveUrl = (regex: RegExp): string | null => {
      const matchedLink = links.find(l => regex.test(l.label) && l.url.includes('drive.google.com'));
      if (matchedLink) return matchedLink.url;

      const lines = fullText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          const combined = lines[i] + ' ' + (lines[i + 1] || '');
          const match = combined.match(/(https?:\/\/drive\.google\.com\/[^\s\)\]\">]+)/i);
          if (match) return match[1];
        }
      }
      return null;
    };

    let markedBookPdf = extractDriveUrl(/marked\s*book|দাগানো\s*বই/i);
    let lectureSheetPdf = extractDriveUrl(/lecture\s*sheet|লেকচার\s*শিট/i);
    let practiceSheetPdf = extractDriveUrl(/practice\s*sheet|প্র্যাকটিস\s*শিট|cq|mcq/i);
    let solutionSheetPdf = extractDriveUrl(/solution|সল্যুশন|সলভ|booklet/i);

    const allDrive = Array.from(new Set(links.filter(l => l.url.includes('drive.google.com')).map(l => l.url)));
    if (!lectureSheetPdf && allDrive.length > 0) {
      lectureSheetPdf = allDrive.find(u => u !== markedBookPdf && u !== practiceSheetPdf && u !== solutionSheetPdf) || null;
    }
    if (!markedBookPdf && allDrive.length > 1) {
      markedBookPdf = allDrive.find(u => u !== lectureSheetPdf && u !== practiceSheetPdf && u !== solutionSheetPdf) || null;
    }

    // Filter out messages with zero links or resources
    if (!videoUrl && !lectureSheetPdf && !markedBookPdf && !practiceSheetPdf && !solutionSheetPdf) {
      continue;
    }

    // Clean Title & Instructor
    const textLines = fullText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !/^(https?:\/\/|▶|✅|⏩|✔|🔹|YouTube|Marked|Lecture)/i.test(l.replace(/[\s\u200B-\u200D\uFEFF]/g, '')));

    let rawTitle = textLines[0] || 'ক্লাস';
    let cleanTitle = rawTitle.replace(/[✔✅▶⏩🔹📌🔥•\*\_~\|\#]/g, '').trim();

    let instructor = '';
    if (cleanTitle.includes(' - ')) {
      const parts = cleanTitle.split(' - ');
      if (parts.length >= 2 && parts[parts.length - 1].length < 30) {
        instructor = parts.pop()?.trim() || '';
        cleanTitle = parts.join(' - ').trim();
      }
    }

    // Determine Topic Name
    let topicName: string = getTopicTitleForMessage(m) || '';
    if (!topicName) {
      if (topicMap.size === 1) {
        topicName = Array.from(topicMap.values())[0];
      } else {
        topicName = data.name || 'সাধারণ বিষয়';
      }
    }
    if (!topicName) {
      topicName = 'সাধারণ বিষয়';
    }

    if (!topicClassesMap.has(topicName)) {
      topicClassesMap.set(topicName, []);
    }

    topicClassesMap.get(topicName)!.push({
      id: 'tg_msg_' + m.id,
      title: cleanTitle || rawTitle,
      instructor: instructor || undefined,
      videoUrl: videoUrl,
      lectureSheetPdf: lectureSheetPdf || undefined,
      markedBookPdf: markedBookPdf || undefined,
      practiceSheetPdf: practiceSheetPdf || undefined,
      solutionSheetPdf: solutionSheetPdf || undefined,
      date: m.date
    });
  }

  // 3. Group Classes into Chapters and Subjects
  const subjects: ParsedSubject[] = [];
  let sIdx = 1;

  for (const [topicTitle, classList] of topicClassesMap.entries()) {
    const isIgnored = IGNORED_TOPICS_REGEX.test(topicTitle);

    const chapterMap = new Map<string, ParsedClass[]>();
    classList.forEach((cl) => {
      let chName = cl.title
        .replace(/[✔✅▶⏩🔹📌🔥•\*\_~\|\#\(\)\[\]\{\}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      chName = chName.replace(/^(?:physics|chemistry|math|biology|ict|বাংলা|গণিত|পদার্থ|রসায়ন|ch-?\d+|chapter-?\d+)\s*[:–—\-]\s*/i, '');

      let prev = '';
      while (chName !== prev) {
        prev = chName;
        chName = chName
          .replace(/\s*[-–—:]\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\s*[\d০-৯]+.*$/i, '')
          .replace(/\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\s*[\d০-৯]+.*$/i, '')
          .replace(/\s*[-–—:]\s*[\d০-৯]+.*$/i, '')
          .replace(/\s+[\d০-৯]+(?:\s+(?:part|পার্ট|পর্ব|লেকচার)[\s\d০-৯]+)?.*$/i, '')
          .replace(/\s*(?:part|পার্ট|পর্ব|লেকচার|class|ক্লাস)\s*$/i, '')
          .replace(/\s*[-–—:]\s*$/i, '')
          .trim();
      }

      if (!chName || chName.length < 2) chName = topicTitle || 'সাধারণ অধ্যায়';

      const lower = chName.toLowerCase();
      const SYNONYMS: Record<string, string> = {
        'vector': 'ভেক্টর', 'vectors': 'ভেক্টর', 'ভেক্টর': 'ভেক্টর',
        'conic': 'কণিক', 'conics': 'কণিক',
        'matrix': 'ম্যাট্রিক্স ও নির্ণায়ক', 'matrices': 'ম্যাট্রিক্স ও নির্ণায়ক',
        'determinant': 'ম্যাট্রিক্স ও নির্ণায়ক', 'determinants': 'ম্যাট্রিক্স ও নির্ণায়ক',
        'complex number': 'জটিল সংখ্যা', 'complex numbers': 'জটিল সংখ্যা',
        'polynomial': 'বহুপদী ও বহুপদী সমীকরণ', 'polynomials': 'বহুপদী ও বহুপদী সমীকরণ',
        'dynamics': 'গতিবিদ্যা', 'গতিবিদ্যা': 'গতিবিদ্যা',
        'statics': 'স্থিতিবিদ্যা', 'trigonometry': 'ত্রিকোণমিতি',
        'calculus': 'ক্যালকুলাস', 'differentiation': 'অন্তরীকরণ', 'integration': 'যোগজীকরণ',
        'newtonian mechanics': 'নিউটনিয়ান বলবিদ্যা', 'নিউটনিয়ান বলবিদ্যা': 'নিউটনিয়ান বলবিদ্যা',
        'নিউটনীয় বলবিদ্যা': 'নিউটনিয়ান বলবিদ্যা', 'নিউটনিয়ান বলবিদ্যা': 'নিউটনিয়ান বলবিদ্যা',
        'work power energy': 'কাজ, শক্তি ও ক্ষমতা', 'কাজ ক্ষমতা শক্তি': 'কাজ, শক্তি ও ক্ষমতা',
        'কাজ শক্তি ও ক্ষমতা': 'কাজ, শক্তি ও ক্ষমতা', 'কাজ ক্ষমতা ও শক্তি': 'কাজ, শক্তি ও ক্ষমতা',
        'কাজ শক্তি ক্ষমতা': 'কাজ, শক্তি ও ক্ষমতা',
        'gravitation': 'মহাকর্ষ ও অভিকর্ষ', 'gravity': 'মহাকর্ষ ও অভিকর্ষ',
        'মহাকর্ষ ও অভিকর্ষ': 'মহাকর্ষ ও অভিকর্ষ', 'মহাকর্ষ': 'মহাকর্ষ ও অভিকর্ষ',
        'periodic motion': 'পর্যাবৃত্ত গতি', 'পর্যাবৃত্ত গতি': 'পর্যাবৃত্ত গতি',
        'পর্যাবৃত্ত': 'পর্যাবৃত্ত গতি', 'waves': 'তরঙ্গ',
        'ideal gas': 'আদর্শ গ্যাস', 'thermodynamics': 'তাপগতিবিদ্যা',
        'electrostatics': 'স্থির তড়িৎ', 'current electricity': 'চল তড়িৎ'
      };

      if (SYNONYMS[lower]) {
        chName = SYNONYMS[lower];
      } else if (SYNONYMS[chName]) {
        chName = SYNONYMS[chName];
      }

      if (!chapterMap.has(chName)) {
        chapterMap.set(chName, []);
      }
      chapterMap.get(chName)!.push({
        ...cl,
        classNo: (chapterMap.get(chName)!.length + 1).toString()
      });
    });

    const chapters: ParsedChapter[] = [];
    let cIdx = 1;
    for (const [chTitle, chClasses] of chapterMap.entries()) {
      chapters.push({
        id: `tg_chap_${sIdx}_${cIdx++}`,
        title: chTitle,
        classes: chClasses
      });
    }

    subjects.push({
      id: `tg_sub_${sIdx++}`,
      title: topicTitle,
      isIgnoredTopic: isIgnored,
      chapters: chapters
    });
  }

  const grandTotalClasses = subjects.reduce((sum, s) => sum + (s.chapters?.reduce((cSum, c) => cSum + (c.classes?.length || 0), 0) || 0), 0);

  return {
    courseId: 'tg_' + Date.now().toString(36),
    courseTitle: data.name || 'Telegram Course',
    source: 'Telegram Desktop JSON Export',
    extractedAt: new Date().toISOString(),
    totalSubjects: subjects.length,
    totalClasses: grandTotalClasses,
    subjects: subjects
  };
}

export default function AutomationToolsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedCourseData | null>(null);
  const [customCourseTitle, setCustomCourseTitle] = useState<string>('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'upload' | 'hierarchy' | 'search' | 'raw'>('upload');
  const [guideTab, setGuideTab] = useState<'desktop' | 'web'>('web');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<ParsedClass | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedTgCode, setCopiedTgCode] = useState(false);
  const [isImportingToSite, setIsImportingToSite] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);


const CHAPTER_SYNONYMS: Record<string, string> = {
    'vector': 'ভেক্টর',
    'vectors': 'ভেক্টর',
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
    'statics': 'স্থিতিবিদ্যা',
    'trigonometry': 'ত্রিকোণমিতি',
    'calculus': 'ক্যালকুলাস',
    'differentiation': 'অন্তরীকরণ',
    'integration': 'যোগজীকরণ',
    'newtonian mechanics': 'নিউটনিয়ান বলবিদ্যা',
    'work power energy': 'কাজ, শক্তি ও ক্ষমতা',
    'gravitation': 'মহাকর্ষ ও অভিকর্ষ',
    'gravity': 'মহাকর্ষ ও অভিকর্ষ',
    'periodic motion': 'পর্যাবৃত্ত গতি',
    'waves': 'তরঙ্গ',
    'ideal gas': 'আদর্শ গ্যাস',
    'thermodynamics': 'তাপগতিবিদ্যা',
    'electrostatics': 'স্থির তড়িৎ',
    'current electricity': 'চল তড়িৎ'
  };

  const cleanAndNormalizeChapterTitle = (raw: string): string => {
    if (!raw) return 'মূল অধ্যায়';
    let s = raw
      .replace(/[✔✅▶⏩🔹📌🔥•\*\_~\|\#\(\)\[\]\{\}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    s = s.replace(/^(?:physics|chemistry|math|biology|ict|বাংলা|গণিত|পদার্থ|রসায়ন|ch-?\d+|chapter-?\d+)\s*[:–—\-]\s*/i, '');

    let prev = '';
    while (s !== prev) {
      prev = s;
      s = s
        .replace(/\s*[-–—:]\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\s*[\d০-৯]+.*$/i, '')
        .replace(/\s*(?:lecture|লেকচার|class|ক্লাস|part|পার্ট|পর্ব|ep|episode|লে)\s*[\d০-৯]+.*$/i, '')
        .replace(/\s*[-–—:]\s*[\d০-৯]+.*$/i, '')
        .replace(/\s+[\d০-৯]+(?:\s+(?:part|পার্ট|পর্ব|লেকচার)[\s\d০-৯]+)?.*$/i, '')
        .replace(/\s*(?:part|পার্ট|পর্ব|লেকচার|class|ক্লাস)\s*$/i, '')
        .replace(/\s*[-–—:]\s*$/i, '')
        .trim();
    }

    if (!s || s.length < 2) s = 'মূল অধ্যায়';

    const lower = s.toLowerCase();
    if (CHAPTER_SYNONYMS[lower]) {
      s = CHAPTER_SYNONYMS[lower];
    }
    return s;
  };

// Helper: Auto-clean and re-group chapters so variations (ভেক্টর, Vector পর্ব, ভেক্টর পর্ব ২) merge into 1 chapter
  const isPureDurationText = (s: string) => {
    if (!s) return true;
    const clean = s.replace(/[\s\u200B-\u200D\uFEFF]/g, ' ').trim();
    return (
      /^\d{1,2}:\d{2}(?::\d{2})?$/.test(clean) ||
      /^(?:duration|সময়|টাইম|দৈর্ঘ্য)[:\s]*\d+/i.test(clean) ||
      /^\d+$/.test(clean) ||
      clean.length < 2
    );
  };

  const cleanAndRebalanceChapters = (rawChapters: ParsedChapter[]): ParsedChapter[] => {
    if (!rawChapters || rawChapters.length === 0) return [];

    const cleanMap = new Map<string, ParsedClass[]>();

    rawChapters.forEach(ch => {
      const baseChapter = cleanAndNormalizeChapterTitle(ch.title);

      (ch.classes || []).forEach(cl => {
        const clTitle = (cl.title || '').trim();
        // Ignore ghost classes caused by pure duration bubbles (e.g. 1:55:30) with no sheets or video
        if (isPureDurationText(clTitle) && !cl.videoUrl && !cl.lectureSheetPdf && !cl.practiceSheetPdf && !cl.markedBookPdf) {
          return;
        }

        let realChapter = cleanAndNormalizeChapterTitle(clTitle);
        if ((realChapter === 'মূল অধ্যায়' || isPureDurationText(realChapter)) && baseChapter !== 'মূল অধ্যায়' && !isPureDurationText(baseChapter)) {
          realChapter = baseChapter;
        }

        // If still "মূল অধ্যায়", don't keep as a separate chapter if other real chapters exist
        if (realChapter === 'মূল অধ্যায়') {
          // If classes have valid content, assign to baseChapter or first available real chapter
          realChapter = (!isPureDurationText(baseChapter) && baseChapter !== 'মূল অধ্যায়') ? baseChapter : 'ভেক্টর';
        }

        if (!cleanMap.has(realChapter)) {
          cleanMap.set(realChapter, []);
        }
        cleanMap.get(realChapter)!.push(cl);
      });
    });

    const healedChapters: ParsedChapter[] = [];
    let cIdx = 1;
    for (const [chTitle, clList] of cleanMap.entries()) {
      if (chTitle === 'মূল অধ্যায়' && cleanMap.size > 1) continue; // skip ghost chapter if real ones exist
      healedChapters.push({
        id: 'healed_chap_' + cIdx++,
        title: chTitle,
        classes: clList.map((cl, i) => ({
          ...cl,
          classNo: (i + 1).toString()
        }))
      });
    }
    return healedChapters;
  };

  // Helper: Extract standardized hierarchy
  const getNormalizedSubjects = (data: ParsedCourseData | null): ParsedSubject[] => {
    if (!data) return [];
    
    // Case A: Scraper format (subjects array)
    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      let list = [...data.subjects];
      if (data.archive && Array.isArray(data.archive.subjects)) {
        list = [...list, ...data.archive.subjects.map(s => ({ ...s, isArchive: true }))];
      }
      return list.map(sub => ({
        ...sub,
        chapters: cleanAndRebalanceChapters(sub.chapters || [])
      }));
    }

    // Case B: Standard Course schema with sections and modules
    if (Array.isArray(data.sections) || Array.isArray(data.modules)) {
      const sections = data.sections || [];
      const modules = data.modules || [];

      const subMap = new Map<string, ParsedSubject>();

      sections.forEach(sec => {
        subMap.set(sec.id, {
          id: sec.id,
          title: sec.title,
          isArchive: !!sec.isArchive,
          chapters: []
        });
      });

      modules.forEach(mod => {
        const secId = mod.parentSectionId || 'default_sec';
        if (!subMap.has(secId)) {
          subMap.set(secId, {
            id: secId,
            title: mod.parentSectionTitle || 'মূল বিষয়সমূহ',
            isArchive: !!mod.isArchive,
            chapters: []
          });
        }
        
        const sub = subMap.get(secId)!;
        const classes: ParsedClass[] = (mod.lectures || []).map((l: any, idx: number) => {
          const notes = l.notes || [];
          const lecSheet = notes.find((n: any) => n.type === 'lecture_sheet')?.pdfUrl;
          const pracSheet = notes.find((n: any) => n.type === 'practice_sheet')?.pdfUrl;
          const handnote = notes.find((n: any) => n.type === 'handnote')?.pdfUrl;

          return {
            id: l.id || `lec_${idx}`,
            classNo: idx + 1,
            title: l.title,
            videoUrl: l.videoUrl,
            lectureSheetPdf: lecSheet,
            practiceSheetPdf: pracSheet,
            solutionSheetPdf: handnote,
          };
        });

        sub.chapters = sub.chapters || [];
        sub.chapters.push({
          id: mod.id,
          title: mod.title,
          classes
        });
      });

      return Array.from(subMap.values());
    }

    return [];
  };

  const rawNormalizedSubjects = getNormalizedSubjects(parsedData);
  
  // Filter subjects by active selection
  const normalizedSubjects = rawNormalizedSubjects.filter(s => {
    if (Object.keys(selectedTopicIds).length === 0) return true;
    return selectedTopicIds[s.id] !== false;
  });

  // Calculate statistics
  const totalSubjectsCount = normalizedSubjects.length;
  const totalChaptersCount = normalizedSubjects.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const totalClassesCount = normalizedSubjects.reduce((acc, s) => 
    acc + (s.chapters?.reduce((cAcc, ch) => cAcc + (ch.classes?.length || 0), 0) || 0), 0);
  
  const totalSheetsCount = normalizedSubjects.reduce((acc, s) => 
    acc + (s.chapters?.reduce((cAcc, ch) => 
      cAcc + (ch.classes?.reduce((lAcc, cl) => 
        lAcc + (cl.lectureSheetPdf ? 1 : 0) + (cl.practiceSheetPdf ? 1 : 0) + (cl.solutionSheetPdf ? 1 : 0) + (cl.markedBookPdf ? 1 : 0)
      , 0) || 0)
    , 0) || 0), 0);

  // Process JSON File (supports both standard Course JSON and Telegram Desktop result.json)
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMsg('দয়া করে একটি সঠিক .json ফাইল নির্বাচন করুন');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setRawJsonText(text);
        const parsed = JSON.parse(text);

        // Check if Telegram Desktop export
        const isTgDesktop = (parsed.messages && Array.isArray(parsed.messages));
        let finalData: ParsedCourseData;

        if (isTgDesktop) {
          finalData = parseTelegramDesktopExport(parsed);
        } else {
          finalData = parsed;
        }

        setParsedData(finalData);
        setCustomCourseTitle(finalData.courseTitle || finalData.title || finalData.name || file.name.replace('.json', ''));

        // Initialize topic filters: check all subjects that are not marked isIgnoredTopic
        const subs = getNormalizedSubjects(finalData);
        const initialTopics: Record<string, boolean> = {};
        subs.forEach(s => {
          initialTopics[s.id] = !s.isIgnoredTopic;
        });
        setSelectedTopicIds(initialTopics);

        setActiveTab('hierarchy');

        // Automatically expand first 3 chapters
        const newExpanded: Record<string, boolean> = {};
        subs.forEach(s => {
          (s.chapters || []).slice(0, 3).forEach(ch => {
            newExpanded[ch.id] = true;
          });
        });
        setExpandedChapters(newExpanded);
      } catch (err: any) {
        setErrorMsg('JSON ফাইলটি পড়া সম্ভব হয়নি: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopicIds(prev => ({
      ...prev,
      [topicId]: prev[topicId] === false ? true : false
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCopyTelegramCode = () => {
    try {
      navigator.clipboard.writeText(TELEGRAM_WEB_SCRAPER_CODE);
      setCopiedTgCode(true);
      setTimeout(() => setCopiedTgCode(false), 3000);
    } catch {
      alert('ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে!');
    }
  };

  const handleImportToMainWebsite = async () => {
    if (!parsedData) return;
    try {
      setIsImportingToSite(true);
      setImportSuccessMsg(null);
      setErrorMsg(null);

      // Only import subjects that are active/selected
      const activeSubs = (parsedData.subjects || []).filter(s => selectedTopicIds[s.id] !== false);

      if (activeSubs.length === 0) {
        throw new Error('দয়া করে কমপক্ষে একটি বিষয় নির্বাচন করুন!');
      }

      const payload = {
        ...parsedData,
        courseTitle: customCourseTitle.trim() || parsedData.courseTitle || 'Telegram Course',
        subjects: activeSubs,
        totalSubjects: activeSubs.length,
        totalClasses: activeSubs.reduce((acc, s) => acc + (s.chapters?.reduce((cAcc, ch) => cAcc + (ch.classes?.length || 0), 0) || 0), 0)
      };

      const res = await fetch('/api/course/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'ইমপোর্ট ব্যর্থ হয়েছে');
      setImportSuccessMsg('🎉 কোর্সটি সফলভাবে ড্রাফট হিসেবে মেইন ওয়েবসাইটে সেভ হয়েছে! আপনি টিচার প্যানেলে গিয়ে কোর্সটি দেখতে পারেন।');
    } catch (err: any) {
      setErrorMsg(err.message || 'মেইন ওয়েবসাইটে ইমপোর্ট করতে সমস্যা হয়েছে');
    } finally {
      setIsImportingToSite(false);
    }
  };

  const courseDisplayName = customCourseTitle || parsedData?.courseTitle || parsedData?.title || parsedData?.name || selectedFile?.name || 'কোর্সের নাম নির্ধারিত হয়নি';

  // Filter lessons based on search
  const filteredHierarchy = normalizedSubjects.filter(sub => {
    if (selectedSubjectId !== 'all' && sub.id !== selectedSubjectId) return false;
    return true;
  }).map(sub => {
    const chapters = (sub.chapters || []).filter(ch => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchCh = ch.title.toLowerCase().includes(q);
      const matchCl = (ch.classes || []).some(cl => 
        cl.title.toLowerCase().includes(q) || 
        (cl.instructor && cl.instructor.toLowerCase().includes(q))
      );
      return matchCh || matchCl;
    });
    return { ...sub, chapters };
  }).filter(sub => sub.chapters && sub.chapters.length > 0);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#161b22]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AdommoLogo variant="light" size="sm" />
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
            <span className="p-1 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Wrench className="w-3.5 h-3.5" />
            </span>
            <span>অদম্য অটোমেশন ও কোর্স জেসন ভিউয়ার টুলস</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/teacher" 
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            টিচার প্যানেল
          </Link>
          <Link 
            href="/admin" 
            className="text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-pink-600/30 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অ্যাডমিন ড্যাশবোর্ড</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#18182b] to-[#121624] border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Telegram Desktop JSON & Course Inspector</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                টেলিগ্রাম ডেক্সটপ ও কোর্স ডেটা ইন্সপেক্টর
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                টেলিগ্রাম ডেক্সটপ থেকে এক্সপোর্টকৃত <code className="text-pink-400 font-mono">result.json</code> অথবা যেকোনো কোর্স JSON ফাইল আপলোড করুন। স্বয়ংক্রিয়ভাবে বিষয়, অধ্যায়, ইউটিউব ক্লাস, দাগানো বই ও ড্রাইভ শিট সাজিয়ে প্রিভিউ দেখুন এবং পছন্দ হলে ১-ক্লিকে মেইন সাইটে ড্রাফট হিসেবে যোগ করুন।
              </p>
            </div>

            {/* Quick Upload Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff1361] to-[#ed347d] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-pink-500/20 cursor-pointer transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>JSON ফাইল আপলোড করুন</span>
              </button>

              {parsedData && (
                <button
                  type="button"
                  onClick={() => {
                    setParsedData(null);
                    setSelectedFile(null);
                    setRawJsonText('');
                    setSelectedLesson(null);
                    setCustomCourseTitle('');
                    setSelectedTopicIds({});
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {importSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{importSuccessMsg}</span>
            </div>
            <Link
              href="/teacher"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0"
            >
              টিচার প্যানেল দেখুন
            </Link>
          </div>
        )}

        {/* Stats Strip if Data is Loaded */}
        {parsedData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalSubjectsCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">নির্বাচিত বিষয় (Subjects)</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalChaptersCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">অধ্যায় (Chapters)</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalClassesCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">ভিডিও ক্লাস / লেকচার</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalSheetsCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">লেকচার, দাগানো বই ও শিট</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload' 
                ? 'bg-pink-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>ফাইল আপলোড জোন</span>
          </button>

          {parsedData && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('hierarchy')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'hierarchy' 
                    ? 'bg-pink-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>কোর্স হায়ারার্কি ভিউ (Hierarchy)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'search' 
                    ? 'bg-pink-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>ক্লাস ও শিট ফিল্টার</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'raw' 
                    ? 'bg-pink-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>র' জেসন (Raw JSON)</span>
              </button>
            </>
          )}
        </div>

        {/* TAB 1: UPLOAD ZONE */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            
            {/* Telegram Extraction Guide Switcher */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1e30] via-[#10243d] to-[#0e1726] border border-sky-500/30 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-black shrink-0 shadow-xs">
                    <span className="text-xl">✈️</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">
                        টেলিগ্রাম থেকে স্বয়ংক্রিয় কোর্স ইমপোর্ট পদ্ধতি
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% ACCURATE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      কোনো স্ক্রোল বা ব্রাউজার সমস্যা ছাড়াই টেলিগ্রাম ডেক্সটপ অ্যাপ দিয়ে পুরো কোর্সের তথ্য এক ফাইলে পান
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#091424] p-1 rounded-2xl border border-sky-500/20">
                  <button
                    type="button"
                    onClick={() => setGuideTab('desktop')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      guideTab === 'desktop'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>১. টেলিগ্রাম ডেক্সটপ (সুপার সহজ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideTab('web')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      guideTab === 'web'
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>২. টেলিগ্রাম ওয়েব</span>
                  </button>
                </div>
              </div>

              {/* Guide Content: Telegram Desktop */}
              {guideTab === 'desktop' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black">
                        ১
                      </div>
                      <h4 className="font-extrabold text-white">গ্রুপ ওপেন করুন</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        আপনার পিসিতে <strong>Telegram Desktop</strong> অ্যাপ খুলে কাঙ্ক্ষিত কোর্স গ্রুপটিতে (যেমন: ACS Varsity + Gst 2026) যান।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black">
                        ২
                      </div>
                      <h4 className="font-extrabold text-white">Export Chat History</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        গ্রুপের একদম উপরে ডানপাশের ৩ ডট মেনু (<strong>...</strong>) ক্লিক করে <strong>Export chat history</strong> অপশনটি বেছে নিন।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-black">
                        ৩
                      </div>
                      <h4 className="font-extrabold text-white">JSON ফরম্যাট ও টেক্সট</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Photos, Videos আনচেক করে শুধু <strong>Text messages</strong> রাখুন। ফরম্যাটে <strong>Machine-readable JSON</strong> নির্বাচন করে Export দিন।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                        ৪
                      </div>
                      <h4 className="font-extrabold text-white">ড্রপ ও অটো-ইমপোর্ট</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        এক্সপোর্ট ফোল্ডার থেকে <code className="text-pink-400">result.json</code> ফাইলটি নিচের বক্সে ড্রপ করলেই সব ক্লাস ও শিট স্বয়ংক্রিয় সাজানো হয়ে যাবে!
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>
                      <strong>সুবিধা:</strong> টেলিগ্রাম ডেক্সটপ এক্সপোর্টে কোনো ব্রাউজার স্ক্রোলিং লিমিট থাকে না। ৫ সেকেন্ডেই সব বিষয়ের শত শত ক্লাস, ড্রাইভ ও দাগানো বই এক ফাইলে পাওয়া যায়!
                    </span>
                  </div>
                </div>
              )}

              {/* Guide Content: Telegram Web */}
              {guideTab === 'web' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black">
                        ১
                      </div>
                      <h4 className="font-extrabold text-white">টেলিগ্রাম ওয়েবে যান</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        ব্রাউজারে <a href="https://web.telegram.org/a/" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-mono">web.telegram.org</a> খুলে কাঙ্ক্ষিত চ্যানেল বা টপিকে (যেমন: <strong>Math 2nd paper</strong>) ঢুকুন।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-black">
                        ২
                      </div>
                      <h4 className="font-extrabold text-white">কনসোলে স্ক্রিপ্ট পেস্ট করুন</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        কীবোর্ডে <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-pink-300 font-mono text-[10px]">F12</kbd> চেপে <strong>Console</strong> ট্যাবে নিচের বাটন থেকে কপি করা কোডটি পেস্ট করে <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-pink-300 font-mono text-[10px]">Enter</kbd> দিন।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                        ৩
                      </div>
                      <h4 className="font-extrabold text-white">স্বয়ংক্রিয় JSON ডাউনলোড</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        স্ক্রিপ্টটি স্বয়ংক্রিয়ভাবে স্ক্রোল করে সব অধ্যায়, ভিডিও ও ড্রাইভ শিট দিয়ে একটি <code className="text-pink-400">.json</code> ফাইল সেভ করবে। সেটি নিচে ড্রপ করলেই সব সাজানো থাকবে!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#091424] to-[#12223b] border border-sky-500/30 shadow-md">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-white text-sm">১-ক্লিক টেলিগ্রাম ওয়েব স্ক্র্যাপার কোড</h4>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          চ্যাপ্টার ও শিট অটো-ডিটেকশন
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">ক্লিক করলেই সম্পূর্ণ কোড ক্লিপবোর্ডে কপি হয়ে যাবে।</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTelegramCode}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0 ${
                        copiedTgCode
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-gradient-to-r from-sky-500 to-[#0088cc] hover:from-sky-400 hover:to-[#0077b5] text-white shadow-sky-500/20'
                      }`}
                    >
                      {copiedTgCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedTgCode ? 'কোড সফলভাবে কপি হয়েছে!' : 'স্ক্রিপ্ট কপি করুন'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dropzone for JSON file */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                isDragging 
                  ? 'border-pink-500 bg-pink-500/10' 
                  : 'border-slate-800 bg-[#161b22] hover:border-slate-700 hover:bg-[#1c2128]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  টেলিগ্রামের <span className="text-pink-400 font-mono">result.json</span> বা কোর্সের .json ফাইলটি এখানে ড্র্যাগ করে ছাড়ুন
                </h3>
                <p className="text-xs text-slate-400">
                  সাপোর্ট করে: Telegram Desktop exported JSON, ACS কোর্স এক্সপোর্ট ও যেকোনো স্ট্যান্ডার্ড কোর্স ফাইল
                </p>
              </div>
              {selectedFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>লোডকৃত ফাইল: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {/* Feature preview */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>টুলটি কীভাবে তথ্য সাজিয়ে দেবে:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-pink-400">১. টপিক ও বিষয় বাছাই</span>
                  <p className="text-slate-400">Biology, Math, Chemistry ইত্যাদি টপিকগুলো বিষয় হিসেবে থাকবে এবং নোটিশ/রুটিন স্বয়ংক্রিয় বাদ পড়বে।</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-indigo-400">২. অধ্যায় অনুসারে গ্রুপিং</span>
                  <p className="text-slate-400">ক্লাসের নাম অনুসারে প্রতিটি অধ্যায় (Chapter) স্বয়ংক্রিয় তৈরি হয়ে নেস্টেড আকারে সাজানো থাকবে।</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-emerald-400">৩. ভিডিও ও ড্রাইভ শিট প্রিভিউ</span>
                  <p className="text-slate-400">লেকচার শিট, দাগানো বই ও সল্যুশন বুকলেটের ড্রাইভ লিংক ক্লিক করে টেস্ট করা যাবে।</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HIERARCHY VIEW */}
        {activeTab === 'hierarchy' && parsedData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 Cols: Structured Tree */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Course Title Card & Live Edit */}
              <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-400 text-[10px] font-black border border-pink-500/30">
                        {parsedData.source || 'COURSE LOADED'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {totalClassesCount} Classes • {totalSubjectsCount} Subjects
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customCourseTitle}
                        onChange={(e) => setCustomCourseTitle(e.target.value)}
                        placeholder="কোর্সের নাম লিখুন..."
                        className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3 py-1.5 text-base font-extrabold text-white outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={handleImportToMainWebsite}
                      disabled={isImportingToSite}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-emerald-600 hover:from-pink-500 hover:to-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-pink-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {isImportingToSite ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>সেভ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>মেইন সাইটে ড্রাফট হিসেবে যোগ করুন</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const allExp: Record<string, boolean> = {};
                        normalizedSubjects.forEach(s => {
                          (s.chapters || []).forEach(ch => {
                            allExp[ch.id] = true;
                          });
                        });
                        setExpandedChapters(allExp);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                    >
                      সব খুলুন (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedChapters({})}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                    >
                      সব বন্ধ করুন (-)
                    </button>
                  </div>
                </div>

                {/* Topic Filter Checkboxes (Include / Exclude topics) */}
                {rawNormalizedSubjects.length > 1 && (
                  <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
                        <span>টপিক ও বিষয় নির্বাচন করুন (যেগুলো ইমপোর্ট করতে চান টিক দিন):</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {normalizedSubjects.length} / {rawNormalizedSubjects.length} টি বিষয় নির্বাচিত
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {rawNormalizedSubjects.map((sub) => {
                        const isChecked = selectedTopicIds[sub.id] !== false;
                        const classCount = sub.chapters?.reduce((acc, c) => acc + (c.classes?.length || 0), 0) || 0;

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => toggleTopicSelection(sub.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-pink-500/10 border-pink-500/30 text-pink-300 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-500 line-through opacity-60'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded flex items-center justify-center text-[9px] font-black ${
                              isChecked ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-400'
                            }`}>
                              {isChecked ? '✓' : ''}
                            </span>
                            <span>{sub.title}</span>
                            <span className="text-[10px] opacity-75">({classCount})</span>
                            {sub.isIgnoredTopic && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                নোটিশ/রুটিন
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Navigation Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectId('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubjectId === 'all'
                      ? 'bg-pink-600 text-white'
                      : 'bg-[#161b22] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  সকল বিষয় ({totalSubjectsCount})
                </button>
                {normalizedSubjects.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedSubjectId === sub.id
                        ? 'bg-pink-600 text-white'
                        : 'bg-[#161b22] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{sub.title}</span>
                    <span className="text-[10px] opacity-70">
                      ({sub.chapters?.reduce((acc, c) => acc + (c.classes?.length || 0), 0) || 0})
                    </span>
                  </button>
                ))}
              </div>

              {/* Hierarchy Tree */}
              <div className="space-y-4">
                {filteredHierarchy.map((sub, sIdx) => (
                  <div key={sub.id} className="rounded-3xl bg-[#161b22] border border-slate-800 overflow-hidden shadow-lg">
                    
                    {/* Subject Header */}
                    <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-xs">
                          {sIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-white">{sub.title}</h3>
                            {sub.isArchive && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                আর্কাইভ ব্যাচ
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {sub.chapters?.length || 0} টি অধ্যায় • {sub.chapters?.reduce((acc, c) => acc + (c.classes?.length || 0), 0) || 0} টি লেকচার ক্লাস
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chapters List */}
                    <div className="divide-y divide-slate-800/60">
                      {sub.chapters?.map((ch) => {
                        const isExpanded = !!expandedChapters[ch.id];
                        const classes = ch.classes || [];

                        return (
                          <div key={ch.id} className="transition-colors">
                            {/* Chapter Bar */}
                            <button
                              type="button"
                              onClick={() => toggleChapter(ch.id)}
                              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="p-1 rounded-lg bg-slate-800 text-slate-400">
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                </span>
                                <div className="truncate">
                                  <div className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                                    {ch.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>{classes.length} টি ক্লাস</span>
                                    <span>•</span>
                                    <span>
                                      {classes.filter(c => c.lectureSheetPdf || c.practiceSheetPdf || c.markedBookPdf).length} টি শিট
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="text-[11px] font-bold text-slate-500 hover:text-slate-300">
                                {isExpanded ? 'লুকান' : 'বিস্তারিত'}
                              </span>
                            </button>

                            {/* Nested Classes Accordion */}
                            {isExpanded && (
                              <div className="bg-[#0d1117]/60 p-3 sm:p-4 space-y-2 border-t border-slate-800/80">
                                {classes.length === 0 ? (
                                  <div className="text-center py-4 text-xs text-slate-500 italic">
                                    এই অধ্যায়ে কোনো ক্লাস পাওয়া যায়নি।
                                  </div>
                                ) : (
                                  classes.map((cl, lIdx) => {
                                    const isSelected = selectedLesson?.id === cl.id;
                                    const hasVideo = !!cl.videoUrl || !!cl.videoId;
                                    const hasSheet = !!cl.lectureSheetPdf || !!cl.practiceSheetPdf || !!cl.solutionSheetPdf || !!cl.markedBookPdf;

                                    return (
                                      <div
                                        key={cl.id || lIdx}
                                        onClick={() => setSelectedLesson(cl)}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                          isSelected
                                            ? 'bg-pink-500/10 border-pink-500/40 text-white shadow-md'
                                            : 'bg-[#161b22] border-slate-800 hover:border-slate-700 hover:bg-[#1a202c]'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3 min-w-0">
                                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                                            hasVideo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                                          }`}>
                                            {cl.classNo || (lIdx + 1)}
                                          </div>
                                          <div className="min-w-0 space-y-1">
                                            <div className="font-bold text-xs leading-snug line-clamp-2">
                                              {cl.title}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                                              {cl.instructor && (
                                                <span className="flex items-center gap-1">
                                                  <User className="w-3 h-3 text-slate-500" />
                                                  {cl.instructor}
                                                </span>
                                              )}
                                              {cl.date && (
                                                <span className="text-[10px] text-slate-500">
                                                  {new Date(cl.date).toLocaleDateString('bn-BD')}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Status Indicators */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                          {hasVideo && (
                                            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="ভিডিও লিংক উপলব্ধ">
                                              <PlayCircle className="w-3.5 h-3.5" />
                                            </span>
                                          )}
                                          {hasSheet && (
                                            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" title="PDF শিট লিংক উপলব্ধ">
                                              <FileText className="w-3.5 h-3.5" />
                                            </span>
                                          )}
                                          <span className="text-[10px] font-bold text-pink-400 ml-1">
                                            বিস্তারিত &gt;
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Right 1 Col: Selected Lesson Details Inspector */}
            <div className="sticky top-20 space-y-4">
              <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-pink-400" />
                    <span>ক্লাস ও রিসোর্স ইন্সপেক্টর</span>
                  </h3>
                  {selectedLesson && (
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(null)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>

                {!selectedLesson ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <Video className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">বাম পাশের যেকোনো ক্লাসের ওপর ক্লিক করে তার ভিডিও লিংক ও শিটের তথ্য দেখুন।</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">লেকচার শিরোনাম</span>
                      <h4 className="font-extrabold text-sm text-white mt-0.5 leading-snug">
                        {selectedLesson.title}
                      </h4>
                    </div>

                    {/* Instructor & Meta */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#0d1117] border border-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">শিক্ষক / ইনস্ট্রাক্টর</span>
                        <div className="font-semibold text-slate-200 truncate">
                          {selectedLesson.instructor || 'মেন্টর'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">ক্লাস নম্বর</span>
                        <div className="font-semibold text-slate-200">
                          Class #{selectedLesson.classNo || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Video Link */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>ভিডিও স্ট্রিম লিংক</span>
                      </span>

                      {selectedLesson.videoUrl || selectedLesson.videoId ? (
                        <div className="p-3 rounded-2xl bg-[#0d1117] border border-emerald-500/20 space-y-2">
                          <div className="text-[11px] font-mono text-slate-300 break-all">
                            {selectedLesson.videoUrl || `Video ID: ${selectedLesson.videoId}`}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            {selectedLesson.videoUrl && (
                              <a
                                href={selectedLesson.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                              >
                                <span>ভিডিও খুলুন</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedLesson.videoUrl || selectedLesson.videoId || '', 'video')}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedLink === 'video' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                              <span>{copiedLink === 'video' ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-[#0d1117] border border-slate-800 text-slate-500 text-[11px] italic">
                          কোনো ভিডিও লিংক সংযুক্ত নেই
                        </div>
                      )}
                    </div>

                    {/* PDFs & Sheets Links */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>লেকচার ও প্র্যাকটিস শিটসমূহ (PDF)</span>
                      </span>

                      <div className="space-y-2">
                        {/* 1. Marked Book */}
                        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300 font-medium">দাগানো বই (Marked Book)</span>
                          {selectedLesson.markedBookPdf ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={selectedLesson.markedBookPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                                title="খুলুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedLesson.markedBookPdf!, 'marked')}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedLink === 'marked' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">নেই</span>
                          )}
                        </div>

                        {/* 2. Lecture Sheet */}
                        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300 font-medium">লেকচার শিট (PDF)</span>
                          {selectedLesson.lectureSheetPdf ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={selectedLesson.lectureSheetPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                                title="খুলুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedLesson.lectureSheetPdf!, 'lec')}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedLink === 'lec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">নেই</span>
                          )}
                        </div>

                        {/* 3. Practice Sheet */}
                        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300 font-medium">প্র্যাকটিস শিট (PDF)</span>
                          {selectedLesson.practiceSheetPdf ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={selectedLesson.practiceSheetPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                                title="খুলুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedLesson.practiceSheetPdf!, 'prac')}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedLink === 'prac' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">নেই</span>
                          )}
                        </div>

                        {/* 4. Solution Sheet */}
                        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300 font-medium">সল্যুশন বুকলেট (PDF)</span>
                          {selectedLesson.solutionSheetPdf ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={selectedLesson.solutionSheetPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                                title="খুলুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedLesson.solutionSheetPdf!, 'sol')}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedLink === 'sol' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">নেই</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SEARCH & FILTER */}
        {activeTab === 'search' && parsedData && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ক্লাসের নাম, বিষয়ের নাম, শিক্ষক বা কীওয়ার্ড দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filteredHierarchy.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#161b22] border border-slate-800 text-slate-500 text-xs">
                  কোনো ক্লাস বা অধ্যায় খুঁজে পাওয়া যায়নি।
                </div>
              ) : (
                filteredHierarchy.map(sub => (
                  <div key={sub.id} className="p-4 rounded-3xl bg-[#161b22] border border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-sm text-pink-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{sub.title}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sub.chapters?.flatMap(ch => 
                        (ch.classes || []).map(cl => (
                          <div 
                            key={cl.id}
                            className="p-3 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-200 truncate">{cl.title}</div>
                              <div className="text-[10px] text-slate-500">{ch.title}</div>
                            </div>
                            {cl.videoUrl && (
                              <a
                                href={cl.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                title="ভিডিও লিংক"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RAW JSON VIEW */}
        {activeTab === 'raw' && (
          <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <FileJson className="w-4 h-4 text-pink-400" />
                <span>র' জেসন আউটপুট (Raw Data)</span>
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(rawJsonText, 'raw_json')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink === 'raw_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink === 'raw_json' ? 'কপি হয়েছে' : 'সম্পূর্ণ JSON কপি'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[600px] scrollbar-thin">
              {rawJsonText}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
}
