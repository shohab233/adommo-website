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
  Edit3,
  Bookmark,
  FileQuestion,
  Clock,
  Award,
  HelpCircle,
  CheckSquare,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Tag,
  ArrowRight,
  Loader2,
  MousePointerClick
} from 'lucide-react';
import { resolveSubjectTitle, isGenericSubjectTitle, isGenericChapterTitle, inferChapterTitleFromClasses, inferSubjectTitleFromContent, cleanAndNormalizeChapterTitle, healCourse } from '@/lib/courseSubjectNormalizer';

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

const TELEGRAM_PROTECTED_SINGLE_CHANNEL_SCRAPER_CODE = String.raw`/**
 * ADOMMO (অদম্য) — Telegram Protected Single-Channel Scraper (Turbo v4.2)
 * কপি-প্রটেকশন অন থাকা চ্যানেলের সব ক্লাস (৪২ টি ক্লাস ও ৩ টি অধ্যায়) কোনো ডেটা মিস ছাড়াই সংগ্রহের স্ক্রিপ্ট
 */
(function launchAdommoTurboScraper() {
  console.clear();
  console.log("%c🚀 ADOMMO — প্রটেক্টেড সিঙ্গেল চ্যানেল টার্বো স্ক্র্যাপার (v4.2) চালুকৃত...", "color: #0284c7; font-size: 16px; font-weight: bold;");

  function toEngDigits(str) {
    if (!str) return '';
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return str.toString().replace(/[০-৯]/g, d => bn.indexOf(d).toString());
  }

  function toBnDigits(str) {
    if (!str) return '';
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return str.toString().replace(/[0-9]/g, d => bn[parseInt(d, 10)]);
  }

  const HSC_CHAPTERS = {
    physics_1: {
      1: "অধ্যায় ০১: ভৌত জগৎ ও পরিমাপ",
      2: "অধ্যায় ০২: ভেক্টর",
      3: "অধ্যায় ০৩: গতিবিদ্যা",
      4: "অধ্যায় ০৪: নিউটনিয়ান বলবিদ্যা",
      5: "অধ্যায় ০৫: কাজ, শক্তি ও ক্ষমতা",
      6: "অধ্যায় ০৬: মহাকর্ষ ও অভিকর্ষ",
      7: "অধ্যায় ০৭: পদার্থের গাঠনিক ধর্ম",
      8: "অধ্যায় ০৮: পর্যাবৃত্ত গতি",
      9: "অধ্যায় ০৯: তরঙ্গ",
      10: "অধ্যায় ১০: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব"
    },
    physics_2: {
      1: "অধ্যায় ০১: তাপগতিবিদ্যা",
      2: "অধ্যায় ০২: স্থির তড়িৎ",
      3: "অধ্যায় ০৩: চল তড়িৎ",
      4: "অধ্যায় ০৪: তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব",
      5: "অধ্যায় ০৫: তড়িৎচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ",
      6: "অধ্যায় ০৬: জ্যামিতিক আলোকবিজ্ঞান",
      7: "অধ্যায় ০৭: ভৌত আলোকবিজ্ঞান",
      8: "অধ্যায় ০৮: আধুনিক পদার্থবিজ্ঞানের সূচনা",
      9: "অধ্যায় ০৯: পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান",
      10: "অধ্যায় ১০: সেমিকন্ডাক্টর ও ইলেকট্রনিক্স",
      11: "অধ্যায় ১১: জ্যোতির্বিজ্ঞান"
    },
    chemistry_1: {
      1: "অধ্যায় ০১: ল্যাবরেটরির নিরাপদ ব্যবহার",
      2: "অধ্যায় ০২: গুণগত রসায়ন",
      3: "অধ্যায় ০৩: পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
      4: "অধ্যায় ০৪: রাসায়নিক পরিবর্তন",
      5: "অধ্যায় ০৫: কর্মমুখী রসায়ন"
    },
    chemistry_2: {
      1: "অধ্যায় ০১: পরিবেশ রসায়ন",
      2: "অধ্যায় ০২: জৈব রসায়ন",
      3: "অধ্যায় ০৩: পরিমাণগত রসায়ন",
      4: "অধ্যায় ০৪: তড়িৎ রসায়ন",
      5: "অধ্যায় ০৫: অর্থনৈতিক রসায়ন"
    },
    math_1: {
      1: "অধ্যায় ০১: ম্যাট্রিক্স ও নির্ণায়ক",
      2: "অধ্যায় ০২: ভেক্টর",
      3: "অধ্যায় ০৩: সরলরেখা",
      4: "অধ্যায় ০৪: বৃত্ত",
      5: "অধ্যায় ০৫: বিন্যাস ও সমাবেশ",
      6: "অধ্যায় ০৬: ত্রিকোণমিতিক অনুপাত",
      7: "অধ্যায় ০৭: সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত",
      8: "অধ্যায় ০৮: ফাংশন ও লেখচিত্র",
      9: "অধ্যায় ০৯: অন্তরীকরণ",
      10: "অধ্যায় ১০: যোগজীকরণ"
    },
    math_2: {
      1: "অধ্যায় ০১: বাস্তব সংখ্যা ও অসমতা",
      2: "অধ্যায় ০২: যোগাশ্রয়ী প্রোগ্রাম",
      3: "অধ্যায় ০৩: জটিল সংখ্যা",
      4: "অধ্যায় ০৪: বহুপদী ও বহুপদী সমীকরণ",
      5: "অধ্যায় ০৫: দ্বিপদী বিস্তার",
      6: "অধ্যায় ০৬: কণিক",
      7: "অধ্যায় ০৭: বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ",
      8: "অধ্যায় ০৮: স্থিতিবিদ্যা",
      9: "অধ্যায় ০৯: সমতলে বস্তুকণার গতি",
      10: "অধ্যায় ১০: বিস্তার পরিমাপ ও সম্ভাবনা"
    }
  };

  const lecturesMap = new Map();
  const practiceSheetUrls = [];
  let detectedSubjectKey = 'physics_1';
  let detectedCourseName = 'ACS 27 Physics Combo (1st Paper)';

  function parseNode(node) {
    const text = (node.innerText || node.textContent || '').trim();
    if (!text || text.length < 5) return;

    if (/PHYSICS\s*1ST|পদার্থ\s*১ম/i.test(text)) detectedSubjectKey = 'physics_1';
    else if (/PHYSICS\s*2ND|পদার্থ\s*২য়/i.test(text)) detectedSubjectKey = 'physics_2';
    else if (/CHEMISTRY\s*1ST|রসায়ন\s*১ম/i.test(text)) detectedSubjectKey = 'chemistry_1';
    else if (/CHEMISTRY\s*2ND|রসায়ন\s*২য়/i.test(text)) detectedSubjectKey = 'chemistry_2';
    else if (/MATH\s*1ST|উচ্চতর\s*গণিত\s*১ম/i.test(text)) detectedSubjectKey = 'math_1';
    else if (/MATH\s*2ND|উচ্চতর\s*গণিত\s*২য়/i.test(text)) detectedSubjectKey = 'math_2';

    const links = [];
    const aTags = Array.from(node.querySelectorAll('a'));
    aTags.forEach(a => {
      const href = a.href || a.getAttribute('href') || '';
      if (href && !links.includes(href)) links.push(href);
    });
    const urlMatches = text.match(/https?:\/\/[^\s\)\"\'\[\]\>]+/g) || [];
    urlMatches.forEach(u => {
      if (!links.includes(u)) links.push(u);
    });

    if (/PRACTICE\s*SHEET|প্র্যাকটিস\s*শিট|PRACTISE/i.test(text)) {
      const dLinks = links.filter(l => l.includes('drive.google.com'));
      dLinks.forEach(dl => {
        if (!practiceSheetUrls.includes(dl)) practiceSheetUrls.push(dl);
      });
      return;
    }

    const chMatch = text.match(/(?:CHAPTER|অধ্যায়|অধ্যায়|CH)[\s:：\-]*([0-9০-৯]+)/i);
    const lecMatch = text.match(/(?:LECTURE|লেকচার|CLASS|ক্লাস|LEC|L)[\s:：\-]*([0-9০-৯]+)/i);

    if (!chMatch && !lecMatch) return;

    const chNum = chMatch ? parseInt(toEngDigits(chMatch[1]), 10) : 1;
    const lecNum = lecMatch ? parseInt(toEngDigits(lecMatch[1]), 10) : 1;

    let videoUrl = '';
    const ytLink = links.find(l => /youtu\.?be|youtube\.com/i.test(l));
    if (ytLink) {
      videoUrl = ytLink;
    } else {
      const ytRaw = text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_\-\?&=]+)/i);
      if (ytRaw) videoUrl = ytRaw[1];
    }

    let slideUrl = '';
    const driveLink = links.find(l => l.includes('drive.google.com'));
    if (driveLink) {
      slideUrl = driveLink;
    } else {
      const dRaw = text.match(/(https?:\/\/drive\.google\.com\/[^\s\)\"\'\[\]\>]+)/i);
      if (dRaw) slideUrl = dRaw[1];
    }

    const bnLec = lecNum < 10 ? ('০' + lecNum) : toBnDigits(lecNum.toString());
    let title = 'লেকচার ' + bnLec;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const l of lines) {
      if (
        !l.match(/CHAPTER|LECTURE|SLIDE|YOUTUBE|COURSEMAN|PCBD|ACADEMIC|PAID|CLICK|HTTP|drive\.google/i) &&
        l.length > 3 && l.length < 50 &&
        !l.match(/^\d{1,2}:\d{2}/)
      ) {
        const clean = l.replace(/^[^\w\u0980-\u09FF]+/g, '').replace(/[^\w\u0980-\u09FF]+$/g, '').trim();
        if (clean.length > 3) {
          title += ' : ' + clean;
          break;
        }
      }
    }

    const key = chNum + '_' + lecNum;
    if (!lecturesMap.has(key)) {
      lecturesMap.set(key, {
        chNum,
        lecNum,
        title,
        videoUrl,
        lectureSheetPdf: slideUrl
      });
      console.log("%c   ✅ সংগৃহীত [অধ্যায় " + chNum + " | লেকচার " + lecNum + "] " + (videoUrl ? "🎥" : "") + (slideUrl ? " 📄" : ""), "color: #10b981; font-weight: bold;");
      updateHud();
    } else {
      const item = lecturesMap.get(key);
      if (!item.videoUrl && videoUrl) item.videoUrl = videoUrl;
      if (!item.lectureSheetPdf && slideUrl) item.lectureSheetPdf = slideUrl;
    }
  }

  function harvestAllVisible() {
    const elements = Array.from(document.querySelectorAll(
      '.Message, .message, [data-mid], [data-message-id], [data-msg-id], .bubble, .message-list-item, .MessageList-element'
    ));
    elements.forEach(el => parseNode(el));
  }

  function getScrollEl() {
    const list = [
      document.querySelector('.bubbles.has-groups'),
      document.querySelector('.bubbles'),
      document.querySelector('.MessageList.custom-scroll'),
      document.querySelector('.MessageList'),
      document.querySelector('.messages-container'),
      document.querySelector('.scrollable-y'),
      document.querySelector('.messages-layout .custom-scroll')
    ];
    for (const el of list) {
      if (el && el.scrollHeight > el.clientHeight + 50) return el;
    }
    const all = Array.from(document.querySelectorAll('*'));
    for (const el of all) {
      try {
        const st = window.getComputedStyle(el);
        if ((st.overflowY === 'auto' || st.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 100) {
          return el;
        }
      } catch(e) {}
    }
    return window;
  }

  const scrollContainer = getScrollEl();

  const hudId = 'adommo_turbo_hud';
  let hud = document.getElementById(hudId);
  if (hud) hud.remove();
  hud = document.createElement('div');
  hud.id = hudId;
  hud.style.cssText = 'position:fixed;top:16px;right:16px;z-index:9999999;background:rgba(13,17,23,0.97);backdrop-filter:blur(10px);color:#fff;border:2px solid #10b981;border-radius:16px;padding:16px 20px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:13px;box-shadow:0 15px 35px rgba(0,0,0,0.6);display:flex;flex-direction:column;gap:10px;min-width:280px;';
  
  hud.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;"><div style="font-weight:bold;color:#34d399;font-size:14px;display:flex;align-items:center;gap:6px;"><span>⚡</span> <span>অদম্য টার্বো স্ক্র্যাপার v4.2</span></div><button id="adommo_hud_close" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;padding:0 4px;">✕</button></div><div style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:4px;"><div style="color:#94a3b8;font-size:12px;">📊 লাইভ প্রগ্রেস:</div><div id="adommo_count_text" style="color:#10b981;font-weight:bold;font-size:16px;">সংগৃহীত: ০ টি ক্লাস</div><div id="adommo_chap_text" style="color:#38bdf8;font-size:11px;">অধ্যায়: ০ টি | শিট: ০ টি</div><div id="adommo_state_text" style="color:#fbbf24;font-size:11px;margin-top:2px;">🔄 প্রস্তুত...</div></div><div style="display:flex;gap:8px;"><button id="adommo_autoscroll_btn" style="flex:1;background:#0284c7;color:#fff;border:none;border-radius:8px;padding:8px;font-weight:bold;font-size:12px;cursor:pointer;">▶ অটো-স্ক্রোল শুরু</button><button id="adommo_download_btn" style="flex:1;background:#10b981;color:#fff;border:none;border-radius:8px;padding:8px;font-weight:bold;font-size:12px;cursor:pointer;">📥 JSON ডাউনলোড</button></div><div style="color:#94a3b8;font-size:10.5px;line-height:1.4;">💡 <b>টিপস:</b> আপনি মাউসের চাকা দিয়ে ওপরে-নিচে স্ক্রোল করলেও স্ক্রিপ্টটি নিজে নিজেই সব ক্লাস মেমরিতে সংরক্ষণ করে নেবে!</div>';
  document.body.appendChild(hud);

  const closeBtn = document.getElementById('adommo_hud_close');
  if (closeBtn) closeBtn.onclick = () => hud.remove();

  function updateHud(state) {
    const cText = document.getElementById('adommo_count_text');
    const chText = document.getElementById('adommo_chap_text');
    const sText = document.getElementById('adommo_state_text');

    const chSet = new Set();
    lecturesMap.forEach(l => chSet.add(l.chNum));

    if (cText) cText.innerText = 'সংগৃহীত: ' + lecturesMap.size + ' টি ক্লাস';
    if (chText) chText.innerText = 'অধ্যায়: ' + chSet.size + ' টি | প্র্যাকটিস শিট: ' + practiceSheetUrls.length + ' টি';
    if (sText && state) sText.innerText = state;
  }

  const observer = new MutationObserver(() => {
    harvestAllVisible();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  harvestAllVisible();

  let isAutoScrolling = false;
  async function runAutoScroll() {
    if (isAutoScrolling) return;
    isAutoScrolling = true;
    const btn = document.getElementById('adommo_autoscroll_btn');
    if (btn) btn.innerText = '⏸ থামান';

    updateHud('👆 ওপরে স্ক্রোল করে ১ম ক্লাসে যাওয়া হচ্ছে...');

    function doScroll(delta) {
      if (scrollContainer === window) {
        window.scrollBy({ top: delta, behavior: 'auto' });
      } else {
        scrollContainer.scrollTop += delta;
        try {
          scrollContainer.dispatchEvent(new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true }));
        } catch(e) {}
        try {
          scrollContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
        } catch(e) {}
      }
    }

    const step = 380;

    let upIdle = 0;
    let lastUpCount = lecturesMap.size;

    for (let i = 0; i < 150; i++) {
      if (!isAutoScrolling) break;
      doScroll(-step);
      await new Promise(r => setTimeout(r, 450));
      harvestAllVisible();

      const top = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      if (top <= 10) {
        doScroll(-150);
        await new Promise(r => setTimeout(r, 900));
        harvestAllVisible();
        if (lecturesMap.size > lastUpCount) {
          lastUpCount = lecturesMap.size;
          upIdle = 0;
          updateHud('🔄 নতুন ক্লাস পাওয়া গেছে! মোট: ' + lecturesMap.size);
        } else {
          upIdle++;
          if (upIdle >= 6) {
            console.log("🏁 চ্যাটের শীর্ষে পৌঁছে গেছে!");
            break;
          }
        }
      } else {
        upIdle = 0;
      }
    }

    updateHud('👇 এবার নিচে নেমে সব ক্লাস হার্ভেস্ট করা হচ্ছে...');
    let downIdle = 0;
    let lastDownCount = lecturesMap.size;

    for (let i = 0; i < 150; i++) {
      if (!isAutoScrolling) break;
      doScroll(step);
      await new Promise(r => setTimeout(r, 400));
      harvestAllVisible();

      const top = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      const clientH = scrollContainer === window ? window.innerHeight : scrollContainer.clientHeight;
      const scrollH = scrollContainer === window ? document.documentElement.scrollHeight : scrollContainer.scrollHeight;

      if (top + clientH >= scrollH - 20) {
        doScroll(150);
        await new Promise(r => setTimeout(r, 800));
        harvestAllVisible();
        if (lecturesMap.size > lastDownCount) {
          lastDownCount = lecturesMap.size;
          downIdle = 0;
          updateHud('🔄 নতুন ক্লাস পাওয়া গেছে! মোট: ' + lecturesMap.size);
        } else {
          downIdle++;
          if (downIdle >= 6) {
            console.log("🏁 চ্যাটের একদম নিচে পৌঁছে গেছে!");
            break;
          }
        }
      } else {
        downIdle = 0;
      }
    }

    isAutoScrolling = false;
    if (btn) btn.innerText = '▶ অটো-স্ক্রোল শুরু';
    updateHud('✅ সম্পূর্ণ হয়েছে! ' + lecturesMap.size + ' টি ক্লাস সংগৃহীত');
  }

  const scrollBtn = document.getElementById('adommo_autoscroll_btn');
  if (scrollBtn) {
    scrollBtn.onclick = () => {
      if (isAutoScrolling) {
        isAutoScrolling = false;
        scrollBtn.innerText = '▶ অটো-স্ক্রোল শুরু';
        updateHud('⏸ স্ক্রোল স্থগিত');
      } else {
        runAutoScroll();
      }
    };
  }

  function exportJson() {
    const list = Array.from(lecturesMap.values());
    if (list.length === 0) {
      alert("❌ কোনো ক্লাস এখনও পাওয়া যায়নি! পেজটি ওপরে-নিচে স্ক্রোল করুন যাতে ক্লাসগুলো স্ক্রিনে আসে।");
      return;
    }

    const finalCourseName = prompt("📌 কোর্সের নাম লিখুন:", detectedCourseName) || detectedCourseName;

    const groups = new Map();
    list.sort((a, b) => (a.chNum - b.chNum) || (a.lecNum - b.lecNum));

    list.forEach(item => {
      if (!groups.has(item.chNum)) groups.set(item.chNum, []);
      groups.get(item.chNum).push(item);
    });

    const syllabus = HSC_CHAPTERS[detectedSubjectKey] || HSC_CHAPTERS['physics_1'];
    const sortedChKeys = Array.from(groups.keys()).sort((a, b) => a - b);

    const chapters = [];
    let chapIndex = 1;

    for (const chNum of sortedChKeys) {
      const chLectures = groups.get(chNum);
      chLectures.sort((a, b) => a.lecNum - b.lecNum);

      const chTitle = syllabus[chNum] || ('অধ্যায় ' + (chNum < 10 ? '০' + chNum : chNum));
      const practicePdf = practiceSheetUrls[chNum - 1] || '';

      const classes = chLectures.map((l, idx) => ({
        id: 'tg_cl_' + chNum + '_' + (idx + 1),
        classNo: (idx + 1).toString(),
        title: l.title,
        videoUrl: l.videoUrl || undefined,
        lectureSheetPdf: l.lectureSheetPdf || undefined,
        practiceSheetPdf: practicePdf || undefined
      }));

      chapters.push({
        id: 'tg_chap_' + chapIndex++,
        title: chTitle,
        classes: classes
      });
    }

    const courseData = {
      courseId: 'tg_turbo_' + Date.now().toString(36),
      courseTitle: finalCourseName,
      source: 'Telegram Single Channel (Turbo v4.2)',
      extractedAt: new Date().toISOString(),
      totalSubjects: 1,
      totalClasses: list.length,
      subjects: [
        {
          id: 'tg_sub_1',
          title: finalCourseName,
          chapters: chapters
        }
      ]
    };

    const blob = new Blob([JSON.stringify(courseData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const fileName = (finalCourseName.replace(/[\\/:*?"<>|]/g, '_').trim() || 'Course_Data') + '.json';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("🎉 [" + finalCourseName + "] থেকে সর্বমোট " + list.length + " টি ক্লাস ও " + chapters.length + " টি অধ্যায় সফলভাবে এক্সপোর্ট হয়েছে!\n\n📁 ফাইল: " + fileName + "\n\nএবার Tools পেজে ফাইলটি ড্রপ করলেই সব ভিডিও ও ড্রাইভ শিট সুন্দরভাবে দেখতে পাবেন!");
  }

  const downBtn = document.getElementById('adommo_download_btn');
  if (downBtn) downBtn.onclick = exportJson;

  runAutoScroll();
})();`;

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

const MASTER_HSC_SYLLABUS: Record<string, Record<number, string>> = {
  physics_1: {
    1: "অধ্যায় ০১: ভৌত জগৎ ও পরিমাপ",
    2: "অধ্যায় ০২: ভেক্টর",
    3: "অধ্যায় ০৩: গতিবিদ্যা",
    4: "অধ্যায় ০৪: নিউটনিয়ান বলবিদ্যা",
    5: "অধ্যায় ০৫: কাজ, শক্তি ও ক্ষমতা",
    6: "অধ্যায় ০৬: মহাকর্ষ ও অভিকর্ষ",
    7: "অধ্যায় ০৭: পদার্থের গাঠনিক ধর্ম",
    8: "অধ্যায় ০৮: পর্যাবৃত্ত গতি",
    9: "অধ্যায় ০৯: তরঙ্গ",
    10: "অধ্যায় ১০: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব"
  },
  physics_2: {
    1: "অধ্যায় ০১: তাপগতিবিদ্যা",
    2: "অধ্যায় ০২: স্থির তড়িৎ",
    3: "অধ্যায় ০৩: চল তড়িৎ",
    4: "অধ্যায় ০৪: তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব",
    5: "অধ্যায় ০৫: তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ",
    6: "অধ্যায় ০৬: জ্যামিতিক আলোকবিজ্ঞান",
    7: "অধ্যায় ০৭: ভৌত আলোকবিজ্ঞান",
    8: "অধ্যায় ০৮: আধুনিক পদার্থবিজ্ঞানের সূচনা",
    9: "অধ্যায় ০৯: পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান",
    10: "অধ্যায় ১০: সেমিকন্ডাক্টর ও ইলেকট্রনিক্স",
    11: "অধ্যায় ১১: জ্যোতির্বিজ্ঞান"
  },
  chemistry_1: {
    1: "অধ্যায় ০১: ল্যাবরেটরির নিরাপদ ব্যবহার",
    2: "অধ্যায় ০২: গুণগত রসায়ন",
    3: "অধ্যায় ০৩: মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
    4: "অধ্যায় ০৪: রাসায়নিক পরিবর্তন",
    5: "অধ্যায় ০৫: কর্মমুখী রসায়ন"
  },
  chemistry_2: {
    1: "অধ্যায় ০১: পরিবেশ রসায়ন",
    2: "অধ্যায় ০২: জৈব রসায়ন",
    3: "অধ্যায় ০৩: পরিমাণগত রসায়ন",
    4: "অধ্যায় ০৪: তড়িৎ রসায়ন",
    5: "অধ্যায় ০৫: অর্থনৈতিক রসায়ন"
  },
  math_1: {
    1: "অধ্যায় ০১: ম্যাট্রিক্স ও নির্ণায়ক",
    2: "অধ্যায় ০২: ভেক্টর",
    3: "অধ্যায় ০৩: সরলরেখা",
    4: "অধ্যায় ০৪: বৃত্ত",
    5: "অধ্যায় ০৫: বিন্যাস ও সমাবেশ",
    6: "অধ্যায় ০৬: ত্রিকোণমিতিক অনুপাত",
    7: "অধ্যায় ০৭: সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত",
    8: "অধ্যায় ০৮: ফাংশন ও লেখচিত্র",
    9: "অধ্যায় ০৯: অন্তরীকরণ",
    10: "অধ্যায় ১০: যোগজীকরণ"
  },
  math_2: {
    1: "অধ্যায় ০১: বাস্তব সংখ্যা ও অসমতা",
    2: "অধ্যায় ০২: যোগাশ্রয়ী প্রোগ্রাম",
    3: "অধ্যায় ০৩: জটিল সংখ্যা",
    4: "অধ্যায় ০৪: বহুপদী ও বহুপদী সমীকরণ",
    5: "অধ্যায় ০৫: দ্বিপদী বিস্তার",
    6: "অধ্যায় ০৬: কণিক",
    7: "অধ্যায় ০৭: বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ",
    8: "অধ্যায় ০৮: স্থিতিবিদ্যা",
    9: "অধ্যায় ০৯: সমতলে বস্তুকণার গতি",
    10: "অধ্যায় ১০: বিস্তার পরিমাপ ও সম্ভাবনা"
  },
  biology_1: {
    1: "অধ্যায় ০১: কোষ ও এর গঠন",
    2: "অধ্যায় ০২: কোষ বিভাজন",
    3: "অধ্যায় ০৩: কোষ রসায়ন",
    4: "অধ্যায় ০৪: অনুজীব",
    5: "অধ্যায় ০৫: শৈবাল ও ছত্রাক",
    6: "অধ্যায় ০৬: ব্রায়োফাইটা ও টেরিডোফাইটা",
    7: "অধ্যায় ০৭: নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
    8: "অধ্যায় ০৮: টিস্যু ও টিস্যুতন্ত্র",
    9: "অধ্যায় ০৯: উদ্ভিদ শারীরতত্ত্ব",
    10: "অধ্যায় ১০: উদ্ভিদ প্রজনন",
    11: "অধ্যায় ১১: জীবপ্রযুক্তি",
    12: "অধ্যায় ১২: জীবের পরিবেশ, বিস্তার ও সংরক্ষণ"
  },
  biology_2: {
    1: "অধ্যায় ০১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস",
    2: "অধ্যায় ০২: প্রাণীর পরিচিতি",
    3: "অধ্যায় ০৩: মানব শারীরতত্ত্ব: পরিপাক ও শোষণ",
    4: "অধ্যায় ০৪: মানব শারীরতত্ত্ব: রক্ত ও সংবহন",
    5: "অধ্যায় ০৫: মানব শারীরতত্ত্ব: শ্বাসক্রিয়া ও শ্বসন",
    6: "অধ্যায় ০৬: মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন",
    7: "অধ্যায় ০৭: মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা",
    8: "অধ্যায় ০৮: মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ",
    9: "অধ্যায় ০৯: মানব জীবনের ধারাবাহিকতা",
    10: "অধ্যায় ১০: মানবদেহের প্রতিরক্ষা",
    11: "অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন",
    12: "অধ্যায় ১২: প্রাণীর আচরণ"
  },
  ict: {
    1: "অধ্যায় ০১: তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
    2: "অধ্যায় ০২: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং",
    3: "অধ্যায় ০৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
    4: "অধ্যায় ০৪: ওয়েব ডিজাইন পরিচিতি এবং HTML",
    5: "অধ্যায় ০৫: প্রোগ্রামিং ভাষা (C Language)",
    6: "অধ্যায় ০৬: ডেটাবেজ ম্যানেজমেন্ট সিস্টেম"
  }
};

function detectSubjectAndCourse(sampleText: string, defaultName: string = '', forcedSubject: string = 'auto'): {
  subjectKey: string;
  subjectTitle: string;
  courseTitle: string;
} {
  const norm = sampleText.normalize('NFKD').normalize('NFC');
  
  let extractedChannel = '';
  const channelMatch = norm.match(/\[\d{1,2}\/\d{1,2}\/\d{4}[^\]]*\]\s*([^:\n]+):/);
  if (channelMatch && channelMatch[1]) {
    const raw = channelMatch[1].trim();
    if (raw.length > 2 && !/^(photo|video|message|user|admin)$/i.test(raw)) {
      extractedChannel = raw;
    }
  }

  const subjectTitleMap: Record<string, string> = {
    physics_1: 'পদার্থবিজ্ঞান ১ম পত্র',
    physics_2: 'পদার্থবিজ্ঞান ২য় পত্র',
    chemistry_1: 'রসায়ন ১ম পত্র',
    chemistry_2: 'রসায়ন ২য় পত্র',
    math_1: 'উচ্চতর গণিত ১ম পত্র',
    math_2: 'উচ্চতর গণিত ২য় পত্র',
    biology_1: 'উদ্ভিদবিজ্ঞান (জীববিজ্ঞান ১ম পত্র)',
    biology_2: 'প্রাণিবিজ্ঞান (জীববিজ্ঞান ২য় পত্র)',
    ict: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)'
  };

  if (forcedSubject && forcedSubject !== 'auto') {
    return {
      subjectKey: forcedSubject,
      subjectTitle: subjectTitleMap[forcedSubject] || 'সাধারণ বিষয়',
      courseTitle: extractedChannel || defaultName || subjectTitleMap[forcedSubject] || 'Course'
    };
  }

  // Strip URLs and placeholder tags so random URL hashes never trigger false positives like 'ict' or 'html'
  const t = (norm + ' ' + defaultName + ' ' + extractedChannel)
    .replace(/https?:\/\/[^\s\)\"\'\[\]\>]+/gi, ' ')
    .replace(/\[\s*(?:photo|video|picture|document|audio|file|contact|location)\s*\]/gi, ' ')
    .toLowerCase();

  let subjectKey = 'physics_1';
  let subjectTitle = 'পদার্থবিজ্ঞান ১ম পত্র';

  // 1. Math Detection (High Priority & comprehensive matching)
  const isMath = /(?:h\.?\s*math|hmath|higher\s*math|math(?:ematics)?|গণিত|উচ্চতর|ম্যাথ|ম্যাট্রিক্স|সরলরেখা|বৃত্ত|বিন্যাস|সমাবেশ|ত্রিকোণমিতি|অন্তরীকরণ|যোগজীকরণ|ক্যালকুলাস|কণিক|জটিল\s*সংখ্যা|বহুপদী|দ্বিপদী|স্থিতিবিদ্যা)/i.test(t);
  if (isMath) {
    const isMath2 = /(?:2nd|২য়|২য়|\b2\b|paper\s*2|c2|cycle\s*2|কণিক|জটিল\s*সংখ্যা|বহুপদী|দ্বিপদী|স্থিতিবিদ্যা|বিপরীত\s*ত্রিকোণমিতিক)/i.test(t);
    if (isMath2) {
      subjectKey = 'math_2';
      subjectTitle = 'উচ্চতর গণিত ২য় পত্র';
    } else {
      subjectKey = 'math_1';
      subjectTitle = 'উচ্চতর গণিত ১ম পত্র';
    }
  }
  // 2. Physics Detection
  else if (/(?:phy(?:sics)?|পদার্থ(?:বিজ্ঞান)?|ভেক্টর|গতিবিদ্যা|নিউটনিয়ান|মহাকর্ষ|পর্যাবৃত্ত|আদর্শ\s*গ্যাস|তাপগতি|স্থির\s*তড়িৎ|চল\s*তড়িৎ|আলোকবিজ্ঞান)/i.test(t)) {
    const isPhy2 = /(?:2nd|২য়|২য়|\b2\b|paper\s*2|c2|cycle\s*2|তাপগতি|স্থির\s*তড়িৎ|চল\s*তড়িৎ|ভৌত\s*আলোক|জ্যামিতিক\s*আলোক|আধুনিক\s*পদার্থ|সেমিকন্ডাক্টর)/i.test(t);
    if (isPhy2) {
      subjectKey = 'physics_2';
      subjectTitle = 'পদার্থবিজ্ঞান ২য় পত্র';
    } else {
      subjectKey = 'physics_1';
      subjectTitle = 'পদার্থবিজ্ঞান ১ম পত্র';
    }
  }
  // 3. Chemistry Detection
  else if (/(?:chem(?:istry)?|রসায়ন|রসায়ন|কেমিস্ট্রি|গুণগত|পর্যাবৃত্ত|রাসায়নিক\s*পরিবর্তন|পরিবেশ\s*রসায়ন|জৈব\s*যৌগ|পরিমাণগত|তড়িৎ\s*রসায়ন)/i.test(t)) {
    const isChem2 = /(?:2nd|২য়|২য়|\b2\b|paper\s*2|c2|cycle\s*2|পরিবেশ\s*রসায়ন|জৈব\s*যৌগ|পরিমাণগত|তড়িৎ\s*রসায়ন|অর্থনৈতিক\s*রসায়ন)/i.test(t);
    if (isChem2) {
      subjectKey = 'chemistry_2';
      subjectTitle = 'রসায়ন ২য় পত্র';
    } else {
      subjectKey = 'chemistry_1';
      subjectTitle = 'রসায়ন ১ম পত্র';
    }
  }
  // 4. Biology Detection
  else if (/(?:bio(?:logy)?|জীব(?:বিজ্ঞান)?|বায়োলজি|কোষ|অনুজীব|নগ্নবীজী|প্রাণি|প্রাণী|zoology|botany)/i.test(t)) {
    const isBio2 = /(?:2nd|২য়|২য়|\b2\b|paper\s*2|c2|cycle\s*2|প্রাণি|প্রাণী|zoology|পরিপাক|রক্ত|সংবহন|মানব\s*শারীরতত্ত্ব)/i.test(t);
    if (isBio2) {
      subjectKey = 'biology_2';
      subjectTitle = 'প্রাণিবিজ্ঞান (জীববিজ্ঞান ২য় পত্র)';
    } else {
      subjectKey = 'biology_1';
      subjectTitle = 'উদ্ভিদবিজ্ঞান (জীববিজ্ঞান ১ম পত্র)';
    }
  }
  // 5. ICT Detection (Strict word boundary only)
  else if (/\bict\b|তথ্য\s*(?:ও|এবং)?\s*যোগাযোগ|digital\s*device|ডিজিটাল\s*ডিভাইস|c\s*programming|\bhtml\b/i.test(t)) {
    subjectKey = 'ict';
    subjectTitle = 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)';
  } else {
    const inferred = inferSubjectTitleFromContent(t, defaultName || 'সাধারণ বিষয়');
    subjectTitle = inferred;
    subjectKey = 'custom';
  }

  const courseTitle = extractedChannel || defaultName || subjectTitle;
  return { subjectKey, subjectTitle, courseTitle };
}

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

    // Check single-channel card format (e.g. ☆ CHAPTER : 01 / ☆ LECTURE : 01)
    const chMatch = fullText.match(/(?:CHAPTER|অধ্যায়|অধ্যায়|CH)[\s:：\-]*([0-9০-৯]+)/i);
    const lecMatch = fullText.match(/(?:LECTURE|লেকচার|CLASS|ক্লাস|LEC|L)[\s:：\-]*([0-9০-৯]+)/i);

    let detectedChNum: number | null = null;
    let detectedLecNum: number | null = null;
    if (chMatch) {
      const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      const e = chMatch[1].replace(/[০-৯]/g, d => bnDigits.indexOf(d).toString());
      detectedChNum = parseInt(e, 10) || null;
    }
    if (lecMatch) {
      const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      const e = lecMatch[1].replace(/[০-৯]/g, d => bnDigits.indexOf(d).toString());
      detectedLecNum = parseInt(e, 10) || null;
    }

    // Clean Title & Instructor
    const textLines = fullText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !/^(https?:\/\/|▶|✅|⏩|✔|🔹|YouTube|Marked|Lecture)/i.test(l.replace(/[\s\u200B-\u200D\uFEFF]/g, '')));

    let rawTitle = textLines[0] || 'ক্লাস';
    let cleanTitle = rawTitle.replace(/[✔✅▶⏩🔹📌🔥•\*\_~\|\#]/g, '').trim();

    if (detectedLecNum) {
      cleanTitle = 'লেকচার ' + (detectedLecNum < 10 ? '০' + detectedLecNum : detectedLecNum.toString());
      // Check if extra topic name is given
      for (const line of textLines) {
        if (!line.match(/CHAPTER|LECTURE|SLIDE|YOUTUBE|COURSEMAN|PCBD|ACADEMIC|PAID|CLICK/i) && line.length > 3 && line.length < 50 && !line.match(/^\d{1,2}:\d{2}/)) {
          const c = line.replace(/^[^\w\u0980-\u09FF]+/g, '').replace(/[^\w\u0980-\u09FF]+$/g, '').trim();
          if (c.length > 3) {
            cleanTitle += ' : ' + c;
            break;
          }
        }
      }
    }

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
      chapterNumber: detectedChNum || undefined,
      lectureNumber: detectedLecNum || undefined,
      date: m.date
    });
  }

  // 3. Group Classes into Chapters and Subjects
  const subjects: ParsedSubject[] = [];
  let sIdx = 1;

  for (const [topicTitle, classList] of topicClassesMap.entries()) {
    const isIgnored = IGNORED_TOPICS_REGEX.test(topicTitle);

    // Universally detect subject syllabus for this topic
    const topicTextSample = topicTitle + ' ' + classList.slice(0, 10).map(c => c.title).join(' ');
    const { subjectKey: topicSubKey } = detectSubjectAndCourse(topicTextSample, topicTitle);
    const topicSyllabus = MASTER_HSC_SYLLABUS[topicSubKey] || {};

    const chapterMap = new Map<string, ParsedClass[]>();
    classList.forEach((cl) => {
      let chName = '';
      if (cl.chapterNumber && topicSyllabus[cl.chapterNumber]) {
        chName = topicSyllabus[cl.chapterNumber];
      } else if (cl.chapterNumber) {
        chName = 'অধ্যায় ' + (cl.chapterNumber < 10 ? '০' + cl.chapterNumber : cl.chapterNumber);
      } else {
        chName = cl.title
          .replace(/[✔✅▶⏩🔹📌🔥•\*\_~\|\#\(\)\[\]\{\}]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        chName = chName.replace(/^(?:physics|chemistry|math|biology|ict|বাংলা|গণিত|পদার্থ|রসায়ন|ch-?\d+|chapter-?\d+)\s*[:–—\-]\s*/i, '');
      }

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

/**
 * Smart Parser for Copied Telegram / AyuGram Text
 * Unicode Styled Fonts (NFKD), Click Here Hyperlinks, Drive & Google Sheets support
 */
function parsePastedTelegramText(rawText: string, forcedSubject: string = 'auto'): ParsedCourseData {
  if (!rawText || !rawText.trim()) {
    throw new Error('কোনো টেক্সট পাওয়া যায়নি! টেলিগ্রাম থেকে মেসেজ কপি করে পেস্ট করুন।');
  }

  // 1. Normalize unicode (NFKD decomposes mathematical styled bold/blackboard/italic to ASCII, NFC recomposes Bengali vowels)
  const text = rawText.normalize('NFKD').normalize('NFC').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Detect subject and course universally
  const { subjectKey, subjectTitle, courseTitle } = detectSubjectAndCourse(text, 'Telegram Course', forcedSubject);
  const syllabus = MASTER_HSC_SYLLABUS[subjectKey] || {};

  // Split messages on timestamp headers: [date time] ACS27... or double newlines
  const messageBlocks = text.split(/(?=\[\d{1,2}\/\d{1,2}\/\d{4}[^\]]*\])/g);

  // Dynamic chapter container: Map<number, { customTitle?: string; classes: ParsedClass[]; practiceSheets: string[] }>
  const chaptersMap = new Map<number, {
    customTitle?: string;
    classes: ParsedClass[];
    practiceSheets: string[];
  }>();
  const namedChapterSlots = new Map<string, number>();

  let currentChapter = 1;

  for (const block of messageBlocks) {
    const b = block.trim();
    if (!b) continue;

    // Detect if this block designates or switches chapter
    // Matches: ✰ CHAPTER : কোষ বিভাজন।, ✰ CHAPTER : 03, অধ্যায় : ০২ (কোষ বিভাজন), CH : 01
    const chLineMatch = b.match(/(?:CHAPTER|অধ্যায়|অধ্যায়|CH)[\s:：\-]+([^\n\r★✰✪✷📌\"\'\(\)]+)/i);
    let explicitChNum: number | null = null;
    let explicitChTitle: string | undefined = undefined;

    if (chLineMatch) {
      const rawVal = chLineMatch[1].trim()
        .replace(/[।\.\:\;\|\,\-\_\'\"\`]+$/g, '')
        .trim();

      if (rawVal) {
        const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        const numStartMatch = rawVal.match(/^([0-9০-৯]+)(?:[\s:：\-\.\)]+(.*))?$/);

        if (numStartMatch) {
          // Case A: Starts with a number (e.g. "03" or "02 - কোষ বিভাজন" or "০২")
          const rawNumStr = numStartMatch[1].replace(/[০-৯]/g, d => bnDigits.indexOf(d).toString());
          explicitChNum = parseInt(rawNumStr, 10) || null;
          if (numStartMatch[2] && numStartMatch[2].trim()) {
            explicitChTitle = `অধ্যায় ${(explicitChNum && explicitChNum < 10 ? '০' + explicitChNum : explicitChNum)}: ${numStartMatch[2].trim()}`;
          }
        } else {
          // Case B: Direct chapter name (e.g. "কোষ বিভাজন" or "ম্যাট্রিক্স ও নির্ণায়ক")
          const cleanName = rawVal.replace(/^[0-9০-৯\s:：\-\.]+/g, '').trim();

          // 1. Search in current subject's syllabus first
          if (syllabus) {
            for (const [sNum, sTitle] of Object.entries(syllabus)) {
              const cleanSTitle = sTitle.replace(/^অধ্যায়\s*[0-9০-৯]+:\s*/, '').toLowerCase();
              if (cleanSTitle.includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(cleanSTitle)) {
                explicitChNum = parseInt(sNum, 10);
                explicitChTitle = sTitle;
                break;
              }
            }
          }

          // 2. If not matched in current subject, search across ALL HSC syllabuses
          if (explicitChNum === null) {
            for (const [subKey, subSyllabus] of Object.entries(MASTER_HSC_SYLLABUS)) {
              for (const [sNum, sTitle] of Object.entries(subSyllabus)) {
                const cleanSTitle = sTitle.replace(/^অধ্যায়\s*[0-9০-৯]+:\s*/, '').toLowerCase();
                if (cleanSTitle.includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(cleanSTitle)) {
                  explicitChNum = parseInt(sNum, 10);
                  explicitChTitle = sTitle;
                  break;
                }
              }
              if (explicitChNum !== null) break;
            }
          }

          // 3. If still not matched, assign a dynamic sequential chapter slot
          if (explicitChNum === null && cleanName) {
            const key = cleanName.toLowerCase();
            let slot = namedChapterSlots.get(key);
            if (!slot) {
              const existingKeys = Array.from(chaptersMap.keys());
              slot = (existingKeys.length > 0 ? Math.max(...existingKeys) : 0) + 1;
              namedChapterSlots.set(key, slot);
            }
            explicitChNum = slot;
            explicitChTitle = `অধ্যায় ${(slot < 10 ? '০' + slot : slot)}: ${cleanName}`;
          }
        }
      }
    } else {
      // Check for named chapter mentions like "Vector Class 21"
      const chNameDetected = cleanAndNormalizeChapterTitle(b);
      if (chNameDetected && !isGenericChapterTitle(chNameDetected)) {
        for (const [sNum, sTitle] of Object.entries(syllabus)) {
          if (sTitle.toLowerCase().includes(chNameDetected.toLowerCase())) {
            explicitChNum = parseInt(sNum, 10);
            explicitChTitle = sTitle;
            break;
          }
        }
      }
    }

    if (explicitChNum !== null) {
      currentChapter = explicitChNum;
    }

    if (!chaptersMap.has(currentChapter)) {
      chaptersMap.set(currentChapter, {
        customTitle: explicitChTitle || (syllabus ? syllabus[currentChapter] : undefined),
        classes: [],
        practiceSheets: []
      });
    } else if (explicitChTitle && !chaptersMap.get(currentChapter)!.customTitle) {
      chaptersMap.get(currentChapter)!.customTitle = explicitChTitle;
    }

    // Check if it's a practice sheet block
    if (b.includes('PRACTICE SHEET') || b.includes('PRACTISE SHEET') || b.includes('প্র্যাকটিস শিট')) {
      const driveUrls = b.match(/https:\/\/drive\.google\.com\/[^\s\)\"\'\[\]\>]+/g) || [];
      if (driveUrls.length > 0) {
        chaptersMap.get(currentChapter)!.practiceSheets.push(...driveUrls);
      }
      continue;
    }

    // Detect Lecture number and parts (e.g. LECTURE : 10 Part 02)
    let lecNum: number | null = null;
    let lecSub = '';
    const lecMatch = b.match(/(?:LECTURE|লেকচার|CLASS|ক্লাস|LEC)[\s:：\-]*([0-9০-৯]+)(?:\s*(?:Part|পার্ট)\s*([0-9০-৯]+))?/i);
    if (lecMatch) {
      const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      const eNum = lecMatch[1].replace(/[০-৯]/g, d => bnDigits.indexOf(d).toString());
      lecNum = parseInt(eNum, 10);
      if (lecMatch[2]) {
        const eSub = lecMatch[2].replace(/[০-৯]/g, d => bnDigits.indexOf(d).toString());
        lecSub = ' (পার্ট ' + (parseInt(eSub, 10) < 10 ? '০' + eSub : eSub) + ')';
      }
    } else {
      const vMatch = b.match(/Class\s*([0-9০-৯]+)/i);
      if (vMatch) {
        const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        const eNum = vMatch[1].replace(/[০-৯]/g, d => bnDigits.indexOf(d).toString());
        lecNum = parseInt(eNum, 10);
      }
    }

    // Extract YouTube / Video Link
    let videoUrl = '';
    const ytMatch = b.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_\-\?&=]+)/i);
    if (ytMatch) {
      videoUrl = ytMatch[1];
    } else {
      const fbMatch = b.match(/(https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch)\/[^\s\)\"\'\[\]\>]+)/i);
      if (fbMatch) videoUrl = fbMatch[1];
    }

    // Extract Slide Link (Click Here hyper links or direct links or Google Spreadsheets / Drive)
    let slideUrl = '';
    const slideMatch = b.match(/SLIDE\s*[:\s]*(?:Click Here\s*)?\(?\s*\n?\s*(https?:\/\/[^\s\)\"\'\[\]\>]+)/i);
    if (slideMatch) {
      slideUrl = slideMatch[1];
    } else {
      const altSlide = b.match(/SLIDE\s*[:\s]*([^\n]+)/i);
      if (altSlide) {
        const u = altSlide[1].match(/https?:\/\/[^\s\)\"\'\[\]\>]+/);
        if (u) slideUrl = u[0];
      }
    }
    if (!slideUrl) {
      const anyDoc = b.match(/https?:\/\/(?:docs\.google\.com|drive\.google\.com)\/[^\s\)\"\'\[\]\>]+/i);
      if (anyDoc) {
        slideUrl = anyDoc[0];
      }
    }

    // Determine custom lecture title if given
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const toBn = (n: number) => n.toString().replace(/[0-9]/g, d => bnDigits[parseInt(d, 10)]);
    let title = 'লেকচার ' + (lecNum ? (lecNum < 10 ? '০' + toBn(lecNum) : toBn(lecNum)) : '০০') + lecSub;

    // Check extra sub-title
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (!line.match(/CHAPTER|LECTURE|SLIDE|YOUTUBE|COURSEMAN|PCBD|ACADEMIC|PAID|CLICK|HTTP|drive\.google/i) && line.length > 3 && line.length < 50 && !line.match(/^\d{1,2}:\d{2}/) && !line.startsWith('[')) {
        const clean = line.replace(/^[^\w\u0980-\u09FF]+/g, '').replace(/[^\w\u0980-\u09FF]+$/g, '').trim();
        if (clean.length > 3) {
          title += ' : ' + clean;
          break;
        }
      }
    }

    if (b.includes('Orientation Class')) {
      title += ' (Orientation Class)';
    } else if (b.includes('Last Class')) {
      title += ' (Last Class)';
    }

    if (videoUrl || slideUrl || lecNum !== null) {
      const currentList = chaptersMap.get(currentChapter)!.classes;
      const classNo = (currentList.length + 1).toString();
      currentList.push({
        id: `tg_lec_${currentChapter}_${classNo}`,
        classNo: classNo,
        title,
        videoUrl: videoUrl || undefined,
        lectureSheetPdf: slideUrl || undefined,
        paperTag: subjectTitle
      });
    }
  }

  // Convert chaptersMap to sorted array of ParsedChapter
  const sortedChNumbers = Array.from(chaptersMap.keys()).sort((a, b) => a - b);
  if (sortedChNumbers.length === 0 || Array.from(chaptersMap.values()).every(c => c.classes.length === 0)) {
    throw new Error('পেস্ট করা টেক্সটে কোনো ক্লাস বা লেকচার শনাক্ত হয়নি! অনুগ্রহ করে নিশ্চিত করুন যে আপনি মেসেজের টেক্সট কপি করেছেন।');
  }

  let totalClassesCount = 0;
  const parsedChapters: ParsedChapter[] = [];

  for (const chNum of sortedChNumbers) {
    const chData = chaptersMap.get(chNum)!;
    if (chData.classes.length === 0 && chData.practiceSheets.length === 0) continue;

    totalClassesCount += chData.classes.length;

    // Resolve chapter title
    let chTitle = chData.customTitle || syllabus[chNum];
    if (!chTitle) {
      const inferredFromClasses = inferChapterTitleFromClasses(chData.classes, chNum);
      if (inferredFromClasses && !isGenericChapterTitle(inferredFromClasses)) {
        chTitle = `অধ্যায় ${(chNum < 10 ? '০' + chNum : chNum)}: ${inferredFromClasses}`;
      } else {
        chTitle = `অধ্যায় ${(chNum < 10 ? '০' + chNum : chNum)}`;
      }
    }

    // Attach practice sheets to classes if available
    const practiceUrl = chData.practiceSheets[0] || undefined;
    const classesWithSheets = chData.classes.map(c => ({
      ...c,
      practiceSheetPdf: c.practiceSheetPdf || practiceUrl
    }));

    parsedChapters.push({
      id: `tg_chap_${chNum}`,
      title: chTitle,
      classes: classesWithSheets,
      practiceSheets: chData.practiceSheets
    });
  }

  const fullCourseData: ParsedCourseData = {
    courseId: 'tg_' + Date.now().toString(36),
    courseTitle: courseTitle,
    source: 'Telegram Smart Text Paste',
    extractedAt: new Date().toISOString(),
    totalSubjects: 1,
    totalClasses: totalClassesCount,
    subjects: [
      {
        id: 'tg_sub_1',
        title: subjectTitle,
        chapters: parsedChapters
      }
    ]
  };

  return healCourse(fullCourseData);
}

const ACS_BOOKMARKLET_CODE = "javascript:(async%20function%20universalACSExtractor()%20%7B%20console.clear();%20console.log(%22%25c%F0%9F%9A%80%20ADOMMO%20%E2%80%94%20Universal%20ACS%20Multi-Subdomain%20Scraper%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%22,%20%22color:%20#00c269;%20font-size:%2016px;%20font-weight:%20bold;%22);%20let%20token%20=%20'';%20let%20tokenSource%20=%20'';%20for%20(let%20i%20=%200;%20i%20%3C%20localStorage.length;%20i++)%20%7B%20const%20key%20=%20localStorage.key(i);%20const%20val%20=%20localStorage.getItem(key)%20%7C%7C%20'';%20const%20match%20=%20val.match(/ey%5BA-Za-z0-9-_=%5D+%5C.%5BA-Za-z0-9-_=%5D+%5C.?%5BA-Za-z0-9-_.+/=%5D*/);%20if%20(match)%20%7B%20token%20=%20match%5B0%5D;%20tokenSource%20=%20%60localStorage%20%5B$%7Bkey%7D%5D%60;%20break;%20%7D%20%7D%20if%20(!token)%20%7B%20for%20(let%20i%20=%200;%20i%20%3C%20sessionStorage.length;%20i++)%20%7B%20const%20key%20=%20sessionStorage.key(i);%20const%20val%20=%20sessionStorage.getItem(key)%20%7C%7C%20'';%20const%20match%20=%20val.match(/ey%5BA-Za-z0-9-_=%5D+%5C.%5BA-Za-z0-9-_=%5D+%5C.?%5BA-Za-z0-9-_.+/=%5D*/);%20if%20(match)%20%7B%20token%20=%20match%5B0%5D;%20tokenSource%20=%20%60sessionStorage%20%5B$%7Bkey%7D%5D%60;%20break;%20%7D%20%7D%20%7D%20if%20(!token)%20%7B%20const%20cookieMatch%20=%20document.cookie.match(/(?:token%7Caccess_token%7Cjwt)=(%5B%5E;%5D+)/i);%20if%20(cookieMatch)%20%7B%20token%20=%20cookieMatch%5B1%5D;%20tokenSource%20=%20'Cookies';%20%7D%20%7D%20console.log(token%20?%20%60%F0%9F%94%91%20%E0%A6%85%E0%A6%A5%E0%A7%87%E0%A6%A8%E0%A6%9F%E0%A6%BF%E0%A6%95%E0%A7%87%E0%A6%B6%E0%A6%A8%20%E0%A6%9F%E0%A7%8B%E0%A6%95%E0%A7%87%E0%A6%A8%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%97%E0%A7%87%E0%A6%9B%E0%A7%87%20($%7BtokenSource%7D)!%60%20:%20%60%E2%9A%A0%EF%B8%8F%20%E0%A6%B8%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A6%B0%E0%A6%BF%20%E0%A6%9F%E0%A7%8B%E0%A6%95%E0%A7%87%E0%A6%A8%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%AF%E0%A6%BE%E0%A7%9F%E0%A6%A8%E0%A6%BF,%20%E0%A6%95%E0%A7%81%E0%A6%95%E0%A6%BF%20%E0%A6%A6%E0%A6%BF%E0%A7%9F%E0%A7%87%20%E0%A6%9A%E0%A7%87%E0%A6%B7%E0%A7%8D%E0%A6%9F%E0%A6%BE%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%AC%E0%A7%87%E0%A5%A4%60);%20let%20API_BASE%20=%20'';%20try%20%7B%20const%20apiResources%20=%20performance.getEntriesByType('resource')%20.map(r%20=%3E%20r.name)%20.filter(n%20=%3E%20n.includes('/api/'));%20const%20detected%20=%20apiResources.find(n%20=%3E%20n.includes('/api/v1/'));%20if%20(detected)%20%7B%20const%20m%20=%20detected.match(/(https?:%5C/%5C/%5B%5E%5C/%5D+%5C/api%5C/v1)/);%20if%20(m)%20API_BASE%20=%20m%5B1%5D;%20%7D%20%7D%20catch%20(e)%20%7B%7D%20if%20(!API_BASE)%20%7B%20const%20host%20=%20location.hostname.toLowerCase();%20if%20(host.includes('engineering'))%20%7B%20API_BASE%20=%20'https://api.engineering.aparsclassroom.com/api/v1';%20%7D%20else%20if%20(host.includes('admission'))%20%7B%20API_BASE%20=%20'https://api.varsity.aparsclassroom.com/api/v1';%20%7D%20else%20if%20(host.includes('varsity')%20%7C%7C%20host.includes('frb'))%20%7B%20API_BASE%20=%20'https://api.varsity.aparsclassroom.com/api/v1';%20%7D%20else%20if%20(host.includes('medical'))%20%7B%20API_BASE%20=%20'https://api.medical.aparsclassroom.com/api/v1';%20%7D%20else%20%7B%20API_BASE%20=%20'https://api.varsity.aparsclassroom.com/api/v1';%20%7D%20%7D%20console.log(%60%F0%9F%8C%90%20%E0%A6%B6%E0%A6%A8%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%A4%E0%A6%95%E0%A7%83%E0%A6%A4%20API%20%E0%A6%8F%E0%A6%A8%E0%A7%8D%E0%A6%A1%E0%A6%AA%E0%A6%AF%E0%A6%BC%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F:%20$%7BAPI_BASE%7D%60);%20const%20urlMatch%20=%20location.href.match(/course%5C/(%5Ba-zA-Z0-9-%5D+)/i)%20%7C%7C%20location.href.match(/shop%5C/(%5Ba-zA-Z0-9-%5D+)/i);%20let%20defaultCourse%20=%20urlMatch%20?%20urlMatch%5B1%5D%20:%20'';%20let%20courseInput%20=%20prompt(%22%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF%20%E0%A6%AC%E0%A6%BE%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%B2%E0%A6%BF%E0%A6%82%E0%A6%95%20%E0%A6%A6%E0%A6%BF%E0%A6%A8:%22,%20defaultCourse);%20if%20(!courseInput)%20return;%20const%20courseIdMatch%20=%20courseInput.trim().match(/(?:course%7Cshop)%5C/(%5B%5E%5C/?#%5D+)/i);%20const%20courseId%20=%20courseIdMatch%20?%20courseIdMatch%5B1%5D%20:%20courseInput.trim();%20let%20detectedArchiveId%20=%20'';%20try%20%7B%20const%20allLinks%20=%20Array.from(document.querySelectorAll('a%5Bhref*=%22/course/%22%5D,%20a%5Bhref*=%22/shop/%22%5D'));%20const%20archiveLink%20=%20allLinks.find(a%20=%3E%20/archive%7C%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%7Cprevious%7C%E0%A6%AA%E0%A7%82%E0%A6%B0%E0%A7%8D%E0%A6%AC%7C%E0%A6%AA%E0%A7%81%E0%A6%B0%E0%A7%8D%E0%A6%AC/i.test(a.textContent%20%7C%7C%20'')%20%7C%7C%20/archive%7Cprevious/i.test(a.getAttribute('href')%20%7C%7C%20'')%20);%20if%20(archiveLink)%20%7B%20const%20m%20=%20(archiveLink.getAttribute('href')%20%7C%7C%20'').match(/(?:course%7Cshop)%5C/(%5Ba-zA-Z0-9-%5D+)/i);%20if%20(m%20&&%20m%5B1%5D%20!==%20courseId)%20%7B%20detectedArchiveId%20=%20m%5B1%5D;%20%7D%20%7D%20%7D%20catch%20(e)%20%7B%7D%20if%20(!detectedArchiveId%20&&%20(courseId.includes('c82195b9')%20%7C%7C%20location.href.toLowerCase().includes('frb')))%20%7B%20detectedArchiveId%20=%20'52acc196-55a7-4499-9ca2-dc44ccab3568';%20%7D%20let%20archiveInput%20=%20prompt(%20%22%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%9A%E0%A7%87%E0%A6%B0%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF%20%E0%A6%AC%E0%A6%BE%20%E0%A6%B2%E0%A6%BF%E0%A6%82%E0%A6%95:%5C%5Cn(%E0%A6%AA%E0%A7%87%E0%A6%9C%E0%A7%87%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF%20%E0%A6%A8%E0%A6%BF%E0%A6%9A%E0%A7%87%20%E0%A6%A6%E0%A7%87%E0%A7%9F%E0%A6%BE%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87%E0%A5%A4%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%A8%E0%A6%BF%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A6%B2%E0%A7%87%20OK%20%E0%A6%A6%E0%A6%BF%E0%A6%A8,%20%E0%A6%A8%E0%A6%BE%20%E0%A6%A5%E0%A6%BE%E0%A6%95%E0%A6%B2%E0%A7%87%20%E0%A6%AB%E0%A6%BE%E0%A6%81%E0%A6%95%E0%A6%BE%20%E0%A6%B0%E0%A6%BE%E0%A6%96%E0%A7%81%E0%A6%A8):%22,%20detectedArchiveId%20);%20let%20archiveCourseId%20=%20'';%20if%20(archiveInput%20&&%20archiveInput.trim())%20%7B%20const%20m%20=%20archiveInput.trim().match(/(?:course%7Cshop)%5C/(%5Ba-zA-Z0-9-%5D+)/i);%20archiveCourseId%20=%20m%20?%20m%5B1%5D%20:%20archiveInput.trim();%20%7D%20const%20headers%20=%20%7B%20'accept':%20'application/json,%20text/plain,%20*/*',%20'x-access-token':%20token,%20'authorization':%20token%20?%20%60Bearer%20$%7Btoken%7D%60%20:%20''%20%7D;%20console.log(%60%F0%9F%93%A6%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF:%20$%7BcourseId%7D%60);%20if%20(archiveCourseId)%20%7B%20console.log(%60%F0%9F%97%84%EF%B8%8F%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF:%20$%7BarchiveCourseId%7D%60);%20%7D%20let%20courseTitle%20=%20'';%20try%20%7B%20const%20cRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course/$%7BcourseId%7D%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20cJson%20=%20await%20cRes.json();%20if%20(cJson.data?.title%20%7C%7C%20cJson.data?.name)%20%7B%20courseTitle%20=%20cJson.data.title%20%7C%7C%20cJson.data.name;%20%7D%20%7D%20catch(e)%20%7B%7D%20if%20(!courseTitle)%20%7B%20try%20%7B%20const%20h1%20=%20document.querySelector('h1')?.textContent?.trim();%20if%20(h1%20&&%20h1.length%20%3E%202%20&&%20!/apars%7Cdashboard%7Clogin%7Cwelcome/i.test(h1))%20%7B%20courseTitle%20=%20h1;%20%7D%20%7D%20catch%20(e)%20%7B%7D%20%7D%20if%20(!courseTitle%20%7C%7C%20courseTitle%20===%20'ACS%20Admission%20Special%20Private%20Programme')%20%7B%20const%20docTitle%20=%20document.title?.trim();%20if%20(docTitle%20&&%20!/apars%5Cs*classroom/i.test(docTitle))%20%7B%20courseTitle%20=%20docTitle;%20%7D%20%7D%20if%20(!courseTitle)%20%7B%20const%20userTitle%20=%20prompt(%22%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%E0%A6%B0%20%E0%A6%A8%E0%A6%BE%E0%A6%AE%20%E0%A6%A8%E0%A6%BF%E0%A6%B6%E0%A7%8D%E0%A6%9A%E0%A6%BF%E0%A6%A4%20%E0%A6%95%E0%A6%B0%E0%A7%81%E0%A6%A8:%22,%20%22ACS%20Course%22);%20courseTitle%20=%20userTitle?.trim()%20%7C%7C%20%22ACS%20Course%22;%20%7D%20function%20formatDrivePdf(val)%20%7B%20if%20(!val)%20return%20null;%20if%20(typeof%20val%20===%20'string'%20&&%20val.startsWith('http'))%20return%20val;%20return%20%60https://drive.google.com/file/d/$%7Bval%7D/view%60;%20%7D%20async%20function%20scrapeCourseStructure(cId,%20isArchive%20=%20false)%20%7B%20const%20label%20=%20isArchive%20?%20%22%F0%9F%97%84%EF%B8%8F%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%22%20:%20%22%F0%9F%93%9A%20%E0%A6%AE%E0%A7%87%E0%A6%87%E0%A6%A8%22;%20console.log(%60$%7Blabel%7D%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%A1%E0%A7%87%E0%A6%9F%E0%A6%BE%20%E0%A6%AB%E0%A7%87%E0%A6%9A%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%20%5BID:%20$%7BcId%7D%5D%60);%20const%20subRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course-subject/subjects/$%7BcId%7D?limit=100%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20subJson%20=%20await%20subRes.json();%20const%20rawSubjects%20=%20subJson.data%20%7C%7C%20%5B%5D;%20if%20(!rawSubjects.length)%20%7B%20console.warn(%60%E2%9A%A0%EF%B8%8F%20$%7Blabel%7D%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%20%E0%A6%95%E0%A7%8B%E0%A6%A8%E0%A7%8B%20%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%AF%E0%A6%BE%E0%A7%9F%E0%A6%A8%E0%A6%BF!%60);%20return%20%7B%20subjects:%20%5B%5D,%20totalClasses:%200%20%7D;%20%7D%20console.log(%60%25c%E2%9C%85%20$%7Blabel%7D%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%20$%7BrawSubjects.length%7D%20%E0%A6%9F%E0%A6%BF%20%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%97%E0%A7%87%E0%A6%9B%E0%A7%87!%60,%20%22color:%20#00c269;%20font-weight:%20bold;%22);%20const%20formattedSubjects%20=%20%5B%5D;%20let%20classesCount%20=%200;%20for%20(let%20sIdx%20=%200;%20sIdx%20%3C%20rawSubjects.length;%20sIdx++)%20%7B%20const%20sub%20=%20rawSubjects%5BsIdx%5D;%20const%20subTitle%20=%20sub.title%20%7C%7C%20sub.name%20%7C%7C%20sub.subjectName%20%7C%7C%20sub.courseSubject?.title%20%7C%7C%20sub.courseSubjectName%20%7C%7C%20%60%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F%20$%7BsIdx%20+%201%7D%60;%20console.log(%60%F0%9F%91%89%20%5B$%7BsIdx%20+%201%7D/$%7BrawSubjects.length%7D%5D%20%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F:%20$%7BsubTitle%7D%60);%20const%20chapRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course/subject/chapter/course-subject/$%7Bsub.id%7D?courseSubjectId=$%7Bsub.id%7D&limit=1000%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20chapJson%20=%20await%20chapRes.json();%20const%20rawChapters%20=%20chapJson.data%20%7C%7C%20%5B%5D;%20const%20isBangla%20=%20/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%7Cbangla/i.test(subTitle);%20const%20isEnglish%20=%20/english%7C%E0%A6%87%E0%A6%82%E0%A6%B0%E0%A7%87%E0%A6%9C%E0%A6%BF/i.test(subTitle);%20const%20subjectObj%20=%20%7B%20id:%20sub.id,%20title:%20subTitle,%20isArchive:%20isArchive,%20isMultiPaper:%20(isBangla%20%7C%7C%20isEnglish)%20&&%20rawChapters.length%20%3E=%202,%20chapters:%20%5B%5D%20%7D;%20for%20(let%20cIdx%20=%200;%20cIdx%20%3C%20rawChapters.length;%20cIdx++)%20%7B%20const%20ch%20=%20rawChapters%5BcIdx%5D;%20const%20chapTitle%20=%20ch.title%20%7C%7C%20ch.name%20%7C%7C%20ch.chapterName%20%7C%7C%20ch.courseSubjectChapterName%20%7C%7C%20%60%E0%A6%85%E0%A6%A7%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%AF%E0%A6%BC%20$%7BcIdx%20+%201%7D%60;%20let%20paperTag%20=%20'';%20if%20(isBangla)%20%7B%20paperTag%20=%20cIdx%20===%200%20?%20'%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%20%E0%A7%A7%E0%A6%AE%20%E0%A6%AA%E0%A6%A4%E0%A7%8D%E0%A6%B0%20(%E0%A6%B8%E0%A6%BE%E0%A6%B9%E0%A6%BF%E0%A6%A4%E0%A7%8D%E0%A6%AF)'%20:%20'%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%20%E0%A7%A8%E0%A7%9F%20%E0%A6%AA%E0%A6%A4%E0%A7%8D%E0%A6%B0%20(%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A6%B0%E0%A6%A3)';%20%7D%20else%20if%20(isEnglish)%20%7B%20paperTag%20=%20cIdx%20===%200%20?%20'English%201st%20Paper'%20:%20'English%202nd%20Paper';%20%7D%20try%20%7B%20const%20classRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/class/all/videos/$%7Bch.id%7D?limit=1000%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20classJson%20=%20await%20classRes.json();%20const%20rawClasses%20=%20classJson.data%20%7C%7C%20%5B%5D;%20const%20classes%20=%20rawClasses.map((cl,%20i)%20=%3E%20%7B%20classesCount++;%20return%20%7B%20id:%20cl.id,%20classNo:%20cl.classNo%20%7C%7C%20(i%20+%201).toString(),%20title:%20cl.classTitle%20%7C%7C%20cl.title%20%7C%7C%20cl.description%20%7C%7C%20%60Class%20$%7Bi%20+%201%7D:%20$%7BchapTitle%7D%60,%20description:%20cl.description%20%7C%7C%20'',%20instructor:%20cl.instructor%20%7C%7C%20cl.instructorName%20%7C%7C%20'ACS%20Instructor',%20hostingType:%20cl.hostingType%20%7C%7C%20'',%20videoId:%20cl.videoId%20%7C%7C%20'',%20videoUrl:%20cl.videoUrl%20%7C%7C%20'',%20hlsPlaylistUrl:%20cl.hlsPlaylistUrl%20%7C%7C%20null,%20iframePlayerUrl:%20cl.iframePlayerUrl%20%7C%7C%20null,%20libraryId:%20cl.libraryId%20%7C%7C%20'610687',%20lectureSheetPdf:%20formatDrivePdf(cl.lectureSheet%20%7C%7C%20cl.lectureSheetPdf),%20practiceSheetPdf:%20formatDrivePdf(cl.practiceSheet%20%7C%7C%20cl.practiceSheetPdf),%20solutionSheetPdf:%20formatDrivePdf(cl.solutionSheet%20%7C%7C%20cl.solutionSheetPdf),%20markedBookPdf:%20formatDrivePdf(cl.markedBook%20%7C%7C%20cl.markedBookPdf),%20paperTag:%20paperTag%20%7C%7C%20null%20%7D;%20%7D);%20subjectObj.chapters.push(%7B%20id:%20ch.id,%20title:%20chapTitle,%20paperTag:%20paperTag%20%7C%7C%20null,%20classes%20%7D);%20%7D%20catch(cErr)%20%7B%20subjectObj.chapters.push(%7B%20id:%20ch.id,%20title:%20chapTitle,%20paperTag:%20paperTag%20%7C%7C%20null,%20classes:%20%5B%5D%20%7D);%20%7D%20%7D%20formattedSubjects.push(subjectObj);%20%7D%20return%20%7B%20subjects:%20formattedSubjects,%20totalClasses:%20classesCount%20%7D;%20%7D%20try%20%7B%20console.log(%22%E0%A7%A7%E0%A6%AE%20%E0%A6%A7%E0%A6%BE%E0%A6%AA:%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%E0%A6%B0%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8%20%E0%A6%B8%E0%A6%82%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%B9%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%22);%20const%20mainData%20=%20await%20scrapeCourseStructure(courseId,%20false);%20const%20fullCourseData%20=%20%7B%20courseId,%20courseTitle,%20extractedAt:%20new%20Date().toISOString(),%20apiBaseUsed:%20API_BASE,%20subdomain:%20location.hostname,%20totalSubjects:%20mainData.subjects.length,%20totalClasses:%20mainData.totalClasses,%20subjects:%20mainData.subjects%20%7D;%20if%20(archiveCourseId)%20%7B%20console.log(%22%E0%A7%A8%E0%A6%AF%E0%A6%BC%20%E0%A6%A7%E0%A6%BE%E0%A6%AA:%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%E0%A6%B0%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8%20%E0%A6%B8%E0%A6%82%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%B9%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%22);%20let%20archiveTitle%20=%20%22%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%9A%20(Previous%20Batch%20Archive)%22;%20try%20%7B%20const%20aRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course/$%7BarchiveCourseId%7D%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20aJson%20=%20await%20aRes.json();%20if%20(aJson.data?.title%20%7C%7C%20aJson.data?.name)%20%7B%20archiveTitle%20=%20%60%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD:%20$%7BaJson.data.title%20%7C%7C%20aJson.data.name%7D%60;%20%7D%20%7D%20catch%20(e)%20%7B%7D%20const%20archiveData%20=%20await%20scrapeCourseStructure(archiveCourseId,%20true);%20fullCourseData.archive%20=%20%7B%20courseId:%20archiveCourseId,%20title:%20archiveTitle,%20totalSubjects:%20archiveData.subjects.length,%20totalClasses:%20archiveData.totalClasses,%20subjects:%20archiveData.subjects%20%7D;%20console.log(%60%25c%F0%9F%97%84%EF%B8%8F%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%20($%7BarchiveData.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8)%60,%20%22color:%20#eab308;%20font-weight:%20bold;%22);%20%7D%20const%20totalCombinedClasses%20=%20fullCourseData.totalClasses%20+%20(fullCourseData.archive?.totalClasses%20%7C%7C%200);%20const%20blob%20=%20new%20Blob(%5BJSON.stringify(fullCourseData,%20null,%202)%5D,%20%7B%20type:%20'application/json'%20%7D);%20const%20a%20=%20document.createElement('a');%20a.href%20=%20URL.createObjectURL(blob);%20const%20cleanName%20=%20(courseTitle.replace(/%5B%5Ea-zA-Z0-9%5Cu0980-%5Cu09FF%5D/g,%20'_')%20%7C%7C%20'course')%20+%20'.json';%20a.download%20=%20cleanName;%20document.body.appendChild(a);%20a.click();%20document.body.removeChild(a);%20alert(%60%F0%9F%8E%89%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A7%82%E0%A6%B0%E0%A7%8D%E0%A6%A3%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%AA%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%5C%5Cn%5C%5Cn%F0%9F%93%8C%20%E0%A6%AE%E0%A7%87%E0%A6%87%E0%A6%A8%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%5C%5Cn%F0%9F%93%8C%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.archive?.totalClasses%20%7C%7C%200%7D%20%E0%A6%9F%E0%A6%BF%5C%5Cn%F0%9F%93%8C%20%E0%A6%B8%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A6%AE%E0%A7%8B%E0%A6%9F%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BtotalCombinedClasses%7D%20%E0%A6%9F%E0%A6%BF%5C%5Cn%5C%5Cn%E0%A6%AB%E0%A6%BE%E0%A6%87%E0%A6%B2%20($%7BcleanName%7D)%20%E0%A6%A1%E0%A6%BE%E0%A6%89%E0%A6%A8%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87%E0%A5%A4%20%E0%A6%8F%E0%A6%AC%E0%A6%BE%E0%A6%B0%20%E0%A6%8F%E0%A6%9F%E0%A6%BF%20%E0%A6%86%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B0%20%E0%A6%93%E0%A7%9F%E0%A7%87%E0%A6%AC%E0%A6%B8%E0%A6%BE%E0%A6%87%E0%A6%9F%E0%A7%87%20%E0%A6%86%E0%A6%AA%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%95%E0%A6%B0%E0%A7%81%E0%A6%A8%E0%A5%A4%60);%20console.log(%22=========================================%22);%20console.log(%60%25c%F0%9F%8E%89%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A7%82%E0%A6%B0%E0%A7%8D%E0%A6%A3%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%AA%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%60,%20%22color:%20#00c269;%20font-size:%2018px;%20font-weight:%20bold;%22);%20console.log(%60%F0%9F%93%8C%20%E0%A6%AE%E0%A7%87%E0%A6%87%E0%A6%A8%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%60);%20if%20(fullCourseData.archive)%20%7B%20console.log(%60%F0%9F%93%8C%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.archive.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%60);%20%7D%20console.log(%60%F0%9F%93%8C%20%E0%A6%B8%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A6%AE%E0%A7%8B%E0%A6%9F%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BtotalCombinedClasses%7D%20%E0%A6%9F%E0%A6%BF%60);%20console.log(%60%F0%9F%93%81%20%E0%A6%AB%E0%A6%BE%E0%A6%87%E0%A6%B2%E0%A6%9F%E0%A6%BF%20%E0%A6%A1%E0%A6%BE%E0%A6%89%E0%A6%A8%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87:%20$%7BcleanName%7D%60);%20console.log(%22=========================================%22);%20%7D%20catch%20(err)%20%7B%20console.error(%22%E2%9D%8C%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%95%E0%A6%B6%E0%A6%A8%20%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A7%81%E0%A6%9F%E0%A6%BF:%22,%20err);%20alert(%22%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%9F%20%E0%A6%95%E0%A6%B0%E0%A6%A4%E0%A7%87%20%E0%A6%B8%E0%A6%AE%E0%A6%B8%E0%A7%8D%E0%A6%AF%E0%A6%BE%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87:%20%22%20+%20err.message);%20%7D%20%7D)();";


const ACS_EXAM_BOOKMARKLET_CODE = "javascript:(async%20function%20extractAcsMasterUniversalV4()%20%7B%20console.clear()%3B%20console.log(%22%25c%F0%9F%9A%80%20ADOMMO%20%E2%80%94%20ACS%20Universal%20Master%20Exam%20Scraper%20v4%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%22%2C%20%22color%3A%20%2300c269%3B%20font-size%3A%2016px%3B%20font-weight%3A%20bold%3B%22)%3B%20let%20banner%20%3D%20document.getElementById('adommo-exam-banner')%3B%20if%20(!banner)%20%7B%20banner%20%3D%20document.createElement('div')%3B%20banner.id%20%3D%20'adommo-exam-banner'%3B%20banner.style.position%20%3D%20'fixed'%3B%20banner.style.top%20%3D%20'20px'%3B%20banner.style.right%20%3D%20'20px'%3B%20banner.style.zIndex%20%3D%20'999999'%3B%20banner.style.padding%20%3D%20'16px%2020px'%3B%20banner.style.borderRadius%20%3D%20'16px'%3B%20banner.style.background%20%3D%20'%23161b22'%3B%20banner.style.color%20%3D%20'%23fff'%3B%20banner.style.boxShadow%20%3D%20'0%2010px%2030px%20rgba(0%2C0%2C0%2C0.5)'%3B%20banner.style.border%20%3D%20'2px%20solid%20%238b5cf6'%3B%20banner.style.fontFamily%20%3D%20'system-ui%2C%20sans-serif'%3B%20banner.style.fontSize%20%3D%20'14px'%3B%20banner.style.maxWidth%20%3D%20'380px'%3B%20banner.innerHTML%20%3D%20'%3Cdiv%20style%3D%22font-weight%3Abold%3Bcolor%3A%23a78bfa%3Bmargin-bottom%3A4px%3B%22%3E%F0%9F%9A%80%20ADOMMO%20Master%20Scraper%20v4%3C%2Fdiv%3E%3Cdiv%3E%E0%A6%B8%E0%A6%AC%20%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%20%E0%A6%93%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%3C%2Fdiv%3E'%3B%20document.body.appendChild(banner)%3B%20%7D%20function%20updateBanner(html%2C%20isSuccess)%20%7B%20if%20(!banner)%20return%3B%20if%20(isSuccess)%20banner.style.borderColor%20%3D%20'%2310b981'%3B%20banner.innerHTML%20%3D%20html%3B%20%7D%20try%20%7B%20const%20showAnswerButtons%20%3D%20Array.from(document.querySelectorAll('button%2C%20a%2C%20div%5Brole%3D%22button%22%5D')).filter(b%20%3D%3E%20%7B%20const%20t%20%3D%20(b.textContent%20%7C%7C%20'').trim().toLowerCase()%3B%20return%20t%20%3D%3D%3D%20'show%20answer'%20%7C%7C%20t%20%3D%3D%3D%20'view%20answer'%20%7C%7C%20t%20%3D%3D%3D%20'%E0%A6%B8%E0%A6%AE%E0%A6%BE%E0%A6%A7%E0%A6%BE%E0%A6%A8%20%E0%A6%A6%E0%A7%87%E0%A6%96%E0%A7%81%E0%A6%A8'%20%7C%7C%20t%20%3D%3D%3D%20'%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%20%E0%A6%A6%E0%A7%87%E0%A6%96%E0%A7%81%E0%A6%A8'%3B%20%7D)%3B%20if%20(showAnswerButtons.length%20%3E%200)%20%7B%20console.log(%60%F0%9F%94%93%20%24%7BshowAnswerButtons.length%7D%20%E0%A6%9F%E0%A6%BF%20%22show%20answer%22%20%E0%A6%AC%E0%A6%BE%E0%A6%9F%E0%A6%A8%E0%A7%87%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BF%E0%A6%95%20%E0%A6%95%E0%A6%B0%E0%A7%87%20%E0%A6%B8%E0%A6%AE%E0%A6%BE%E0%A6%A7%E0%A6%BE%E0%A6%A8%20%E0%A6%89%E0%A6%A8%E0%A7%8D%E0%A6%AE%E0%A7%8B%E0%A6%9A%E0%A6%A8%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%60)%3B%20updateBanner(%60%3Cdiv%20style%3D%22font-weight%3Abold%3Bcolor%3A%23a78bfa%3B%22%3E%F0%9F%94%93%20%E0%A6%B8%E0%A6%AE%E0%A6%BE%E0%A6%A7%E0%A6%BE%E0%A6%A8%20%E0%A6%89%E0%A6%A8%E0%A7%8D%E0%A6%AE%E0%A7%8B%E0%A6%9A%E0%A6%A8%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%3C%2Fdiv%3E%3Cdiv%3E%24%7BshowAnswerButtons.length%7D%20%E0%A6%9F%E0%A6%BF%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%E0%A7%87%E0%A6%B0%20%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%20%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87%3C%2Fdiv%3E%60)%3B%20showAnswerButtons.forEach(btn%20%3D%3E%20btn.click())%3B%20await%20new%20Promise(r%20%3D%3E%20setTimeout(r%2C%20600))%3B%20%7D%20%7D%20catch%20(e)%20%7B%20console.warn(%22Auto-expand%20show%20answer%20warning%3A%22%2C%20e)%3B%20%7D%20let%20token%20%3D%20''%3B%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20localStorage.length%3B%20i%2B%2B)%20%7B%20const%20k%20%3D%20localStorage.key(i)%3B%20const%20v%20%3D%20localStorage.getItem(k)%20%7C%7C%20''%3B%20const%20m%20%3D%20v.match(%2Fey%5BA-Za-z0-9-_%3D%5D%2B%5C.%5BA-Za-z0-9-_%3D%5D%2B%5C.%3F%5BA-Za-z0-9-_.%2B%2F%3D%5D*%2F)%3B%20if%20(m)%20%7B%20token%20%3D%20m%5B0%5D%3B%20break%3B%20%7D%20%7D%20const%20urlMatch%20%3D%20location.href.match(%2F(%3F%3Amcq%7Cwritten%7Cexam%7Ctest%7Ctest-details)%5C%2F(%5Ba-zA-Z0-9-%5D%2B)%2Fi)%3B%20const%20testId%20%3D%20urlMatch%20%3F%20urlMatch%5B1%5D%20%3A%20''%3B%20let%20examTitle%20%3D%20''%3B%20const%20titleEl%20%3D%20document.querySelector('h1%2C%20h2%2C%20%5Bclass*%3D%22title%22%5D%2C%20%5Bclass*%3D%22Title%22%5D')%3B%20if%20(titleEl%20%26%26%20titleEl.textContent%20%26%26%20titleEl.textContent.trim().length%20%3E%203%20%26%26%20!%2Fapars%7Cexam%20portal%7C%E0%A6%B6%E0%A6%BF%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A5%E0%A7%80%E0%A6%A6%E0%A7%87%E0%A6%B0%2Fi.test(titleEl.textContent))%20%7B%20examTitle%20%3D%20titleEl.textContent.trim()%3B%20%7D%20else%20%7B%20examTitle%20%3D%20document.title.replace(%2Fapars%5Cs*classroom%2Fi%2C%20'').trim()%20%7C%7C%20'ACS%20Exam%20'%20%2B%20(testId%20%3F%20testId.slice(0%2C%208)%20%3A%20'')%3B%20%7D%20updateBanner(%60%3Cdiv%20style%3D%22font-weight%3Abold%3Bcolor%3A%23a78bfa%3B%22%3E%F0%9F%93%9D%20%24%7BexamTitle%7D%3C%2Fdiv%3E%3Cdiv%3E%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%93%20%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A6%BE%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%3C%2Fdiv%3E%60)%3B%20function%20detectSubjectFromText(text)%20%7B%20const%20s%20%3D%20(text%20%7C%7C%20'').toLowerCase()%3B%20if%20(s.includes('%E0%A6%B0%E0%A6%B8%E0%A6%BE%E0%A7%9F%E0%A6%A8')%20%7C%7C%20s.includes('chemistry')%20%7C%7C%20s.includes('%E0%A6%B9%E0%A6%BE%E0%A6%9C%E0%A6%BE%E0%A6%B0%E0%A7%80'))%20return%20'%E0%A6%B0%E0%A6%B8%E0%A6%BE%E0%A7%9F%E0%A6%A8'%3B%20if%20(s.includes('%E0%A6%AA%E0%A6%A6%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A5')%20%7C%7C%20s.includes('physics')%20%7C%7C%20s.includes('%E0%A6%87%E0%A6%B8%E0%A6%B9%E0%A6%BE%E0%A6%95')%20%7C%7C%20s.includes('%E0%A6%A4%E0%A6%AA%E0%A6%A8'))%20return%20'%E0%A6%AA%E0%A6%A6%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A5%E0%A6%AC%E0%A6%BF%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%BE%E0%A6%A8'%3B%20if%20(s.includes('%E0%A6%89%E0%A6%9A%E0%A7%8D%E0%A6%9A%E0%A6%A4%E0%A6%B0%20%E0%A6%97%E0%A6%A3%E0%A6%BF%E0%A6%A4')%20%7C%7C%20s.includes('math')%20%7C%7C%20s.includes('%E0%A6%95%E0%A7%87%E0%A6%A4%E0%A6%BE%E0%A6%AC')%20%7C%7C%20s.includes('%E0%A6%85%E0%A6%B8%E0%A7%80%E0%A6%AE'))%20return%20'%E0%A6%89%E0%A6%9A%E0%A7%8D%E0%A6%9A%E0%A6%A4%E0%A6%B0%20%E0%A6%97%E0%A6%A3%E0%A6%BF%E0%A6%A4'%3B%20if%20(s.includes('%E0%A6%9C%E0%A7%80%E0%A6%AC%E0%A6%AC%E0%A6%BF%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%BE%E0%A6%A8')%20%7C%7C%20s.includes('biology')%20%7C%7C%20s.includes('%E0%A6%86%E0%A6%9C%E0%A6%AE%E0%A6%B2')%20%7C%7C%20s.includes('%E0%A6%B9%E0%A6%BE%E0%A6%B8%E0%A6%BE%E0%A6%A8')%20%7C%7C%20s.includes('%E0%A6%89%E0%A6%A6%E0%A7%8D%E0%A6%AD%E0%A6%BF%E0%A6%A6')%20%7C%7C%20s.includes('%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%A3%E0%A7%80'))%20return%20'%E0%A6%9C%E0%A7%80%E0%A6%AC%E0%A6%AC%E0%A6%BF%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%BE%E0%A6%A8'%3B%20if%20(s.includes('%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%20%E0%A7%A8%E0%A7%9F')%20%7C%7C%20s.includes('bangla%202nd')%20%7C%7C%20s.includes('%E0%A6%86%E0%A6%AC%E0%A7%87%E0%A6%A6%E0%A6%A8')%20%7C%7C%20s.includes('%E0%A6%A6%E0%A6%BF%E0%A6%A8%E0%A6%B2%E0%A6%BF%E0%A6%AA%E0%A6%BF')%20%7C%7C%20s.includes('%E0%A6%AC%E0%A7%88%E0%A6%A6%E0%A7%8D%E0%A6%AF%E0%A7%81%E0%A6%A4%E0%A6%BF%E0%A6%A8%20%E0%A6%9A%E0%A6%BF%E0%A6%A0%E0%A6%BF')%20%7C%7C%20s.includes('%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A4%E0%A6%BF%E0%A6%AC%E0%A7%87%E0%A6%A6%E0%A6%A8')%20%7C%7C%20s.includes('%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A6%BE%E0%A6%82%E0%A6%B6')%20%7C%7C%20s.includes('%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A6%A3'))%20return%20'%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%20%E0%A7%A8%E0%A7%9F%20%E0%A6%AA%E0%A6%A4%E0%A7%8D%E0%A6%B0'%3B%20if%20(s.includes('%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE')%20%7C%7C%20s.includes('bangla'))%20return%20'%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%20%E0%A7%A7%E0%A6%AE%20%E0%A6%AA%E0%A6%A4%E0%A7%8D%E0%A6%B0'%3B%20if%20(s.includes('english')%20%7C%7C%20s.includes('%E0%A6%87%E0%A6%82%E0%A6%B0%E0%A7%87%E0%A6%9C%E0%A6%BF'))%20return%20'English'%3B%20if%20(s.includes('ict')%20%7C%7C%20s.includes('%E0%A6%A4%E0%A6%A5%E0%A7%8D%E0%A6%AF'))%20return%20'%E0%A6%A4%E0%A6%A5%E0%A7%8D%E0%A6%AF%20%E0%A6%93%20%E0%A6%AF%E0%A7%8B%E0%A6%97%E0%A6%BE%E0%A6%AF%E0%A7%8B%E0%A6%97%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%AF%E0%A7%81%E0%A6%95%E0%A7%8D%E0%A6%A4%E0%A6%BF%20(ICT)'%3B%20return%20'General'%3B%20%7D%20function%20parseCreativeQuestionBlock(qText%2C%20solText)%20%7B%20const%20solParts%20%3D%20%7B%7D%3B%20const%20solRegex%20%3D%20%2F(%3F%3A%E0%A6%A8%E0%A6%AE%E0%A7%81%E0%A6%A8%E0%A6%BE%5Cs*%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%5B%3A%5Cs%5D*%7C%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%5B%3A%5Cs%5D*)%5C((%5B%E0%A6%95-%E0%A6%98a-dA-D%5Cd%5D)%5C)%7C(%3F%3A%E0%A6%A8%E0%A6%AE%E0%A7%81%E0%A6%A8%E0%A6%BE%5Cs*%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%5B%3A%5Cs%5D*%7C%E0%A6%89%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%B0%5B%3A%5Cs%5D*)(%5B%E0%A6%95-%E0%A6%98a-dA-D%5Cd%5D)%5B%5C.%5C)%5D%2Fg%3B%20let%20match%3B%20let%20indices%20%3D%20%5B%5D%3B%20while%20((match%20%3D%20solRegex.exec(solText))%20!%3D%3D%20null)%20%7B%20indices.push(%7B%20part%3A%20match%5B1%5D%20%7C%7C%20match%5B2%5D%2C%20index%3A%20match.index%2C%20length%3A%20match%5B0%5D.length%20%7D)%3B%20%7D%20if%20(indices.length%20%3E%200)%20%7B%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20indices.length%3B%20i%2B%2B)%20%7B%20const%20start%20%3D%20indices%5Bi%5D.index%20%2B%20indices%5Bi%5D.length%3B%20const%20end%20%3D%20(i%20%2B%201%20%3C%20indices.length)%20%3F%20indices%5Bi%2B1%5D.index%20%3A%20solText.length%3B%20solParts%5Bindices%5Bi%5D.part%5D%20%3D%20solText.slice(start%2C%20end).trim()%3B%20%7D%20%7D%20const%20cleanedQ%20%3D%20qText.replace(%2Fshow%20answer%7Chide%20answer%7Canswered%7Cnot%20answered%2Fgi%2C%20'').trim()%3B%20const%20subQRegex%20%3D%20%2F(%3F%3A%5E%7C%5Cn%7C%5Cs)(%3F%3A%E0%A6%85%E0%A6%A5%E0%A6%AC%E0%A6%BE%2C%5Cs*)%3F(%3F%3A%5C((%5B%E0%A6%95-%E0%A6%98a-dA-D%5Cd%5D%2B)%5C)%7C(%5B%E0%A6%95-%E0%A6%98a-dA-D%5Cd%5D)%5B%5C.%5C)%5D)%5Cs*%2Fg%3B%20const%20subMatches%20%3D%20%5B%5D%3B%20while%20((match%20%3D%20subQRegex.exec(cleanedQ))%20!%3D%3D%20null)%20%7B%20subMatches.push(%7B%20part%3A%20match%5B1%5D%20%7C%7C%20match%5B2%5D%2C%20index%3A%20match.index%2C%20length%3A%20match%5B0%5D.length%20%7D)%3B%20%7D%20let%20stem%20%3D%20''%3B%20const%20subQuestions%20%3D%20%5B%5D%3B%20if%20(subMatches.length%20%3E%200)%20%7B%20stem%20%3D%20cleanedQ.slice(0%2C%20subMatches%5B0%5D.index).trim()%3B%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20subMatches.length%3B%20i%2B%2B)%20%7B%20const%20start%20%3D%20subMatches%5Bi%5D.index%20%2B%20subMatches%5Bi%5D.length%3B%20const%20end%20%3D%20(i%20%2B%201%20%3C%20subMatches.length)%20%3F%20subMatches%5Bi%2B1%5D.index%20%3A%20cleanedQ.length%3B%20const%20text%20%3D%20cleanedQ.slice(start%2C%20end).trim()%3B%20const%20markMatch%20%3D%20text.match(%2F%5C%5B(%5Cd%2B)%5C%5D%2F)%20%7C%7C%20text.match(%2F%5C((%5Cd%2B)%5C)%2F)%3B%20let%20marks%20%3D%2010%3B%20if%20(markMatch)%20%7B%20marks%20%3D%20parseInt(markMatch%5B1%5D%2C%2010)%3B%20%7D%20else%20if%20(subMatches.length%20%3D%3D%3D%204)%20%7B%20marks%20%3D%20%5B1%2C%202%2C%203%2C%204%5D%5Bi%5D%20%7C%7C%202%3B%20%7D%20else%20if%20(subMatches.length%20%3D%3D%3D%202)%20%7B%20marks%20%3D%2010%3B%20%7D%20const%20partKey%20%3D%20subMatches%5Bi%5D.part%3B%20subQuestions.push(%7B%20part%3A%20partKey%2C%20text%3A%20text%2C%20marks%3A%20marks%2C%20sampleAnswer%3A%20solParts%5BpartKey%5D%20%7C%7C%20''%20%7D)%3B%20%7D%20%7D%20else%20%7B%20const%20markMatch%20%3D%20cleanedQ.match(%2F%5C%5B(%5Cd%2B)%5C%5D%2F)%20%7C%7C%20cleanedQ.match(%2F%5C((%5Cd%2B)%5C)%2F)%3B%20const%20marks%20%3D%20markMatch%20%3F%20parseInt(markMatch%5B1%5D%2C%2010)%20%3A%2010%3B%20subQuestions.push(%7B%20part%3A%20'%E0%A7%A7'%2C%20text%3A%20cleanedQ%2C%20marks%3A%20marks%2C%20sampleAnswer%3A%20solText%20%7C%7C%20''%20%7D)%3B%20%7D%20return%20%7B%20stem%2C%20subQuestions%20%7D%3B%20%7D%20let%20extractedMcqs%20%3D%20%5B%5D%3B%20let%20extractedCqs%20%3D%20%5B%5D%3B%20const%20allElements%20%3D%20Array.from(document.querySelectorAll('*'))%3B%20const%20quesBadges%20%3D%20allElements.filter(el%20%3D%3E%20%7B%20const%20t%20%3D%20(el.textContent%20%7C%7C%20'').trim()%3B%20return%20el.children.length%20%3D%3D%3D%200%20%26%26%20%2F%5EQues%3A%5Cs*%5Cd%2B%2Fi.test(t)%3B%20%7D)%3B%20const%20cqBadges%20%3D%20allElements.filter(el%20%3D%3E%20%7B%20const%20t%20%3D%20(el.textContent%20%7C%7C%20'').trim()%3B%20return%20el.children.length%20%3D%3D%3D%200%20%26%26%20%2F%5EQuestion%3A%5Cs*%5Cd%2B%2Fi.test(t)%3B%20%7D)%3B%20console.log(%60%F0%9F%94%8E%20%E0%A6%B6%E0%A6%A8%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%A4%E0%A6%95%E0%A6%B0%E0%A6%A3%20%E0%A6%AB%E0%A6%B2%E0%A6%BE%E0%A6%AB%E0%A6%B2%3A%20MCQ%20%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%9C%20%3D%20%24%7BquesBadges.length%7D%20%E0%A6%9F%E0%A6%BF%2C%20CQ%20%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%9C%20%3D%20%24%7BcqBadges.length%7D%20%E0%A6%9F%E0%A6%BF%60)%3B%20if%20(cqBadges.length%20%3E%200)%20%7B%20cqBadges.forEach((badge%2C%20idx)%20%3D%3E%20%7B%20try%20%7B%20const%20qNoMatch%20%3D%20badge.textContent.trim().match(%2F%5EQuestion%3A%5Cs*(%5Cd%2B)%2Fi)%3B%20const%20qNo%20%3D%20qNoMatch%20%3F%20parseInt(qNoMatch%5B1%5D%2C%2010)%20%3A%20idx%20%2B%201%3B%20let%20card%20%3D%20badge.parentElement%3B%20let%20depth%20%3D%200%3B%20while%20(card%20%26%26%20depth%20%3C%206)%20%7B%20const%20hasButton%20%3D%20card.querySelector('button%2C%20%5Bclass*%3D%22button%22%5D')%3B%20const%20hasBorder%20%3D%20card.className%20%26%26%20(card.className.includes('border')%20%7C%7C%20card.className.includes('rounded')%20%7C%7C%20card.className.includes('shadow')%20%7C%7C%20card.className.includes('card'))%3B%20const%20otherBadges%20%3D%20Array.from(card.querySelectorAll('*')).filter(el%20%3D%3E%20%7B%20const%20t%20%3D%20(el.textContent%20%7C%7C%20'').trim()%3B%20return%20el%20!%3D%3D%20badge%20%26%26%20el.children.length%20%3D%3D%3D%200%20%26%26%20%2F%5EQuestion%3A%5Cs*%5Cd%2B%2Fi.test(t)%3B%20%7D)%3B%20if%20(otherBadges.length%20%3D%3D%3D%200%20%26%26%20(hasButton%20%7C%7C%20hasBorder)%20%26%26%20card.children.length%20%3E%3D%202)%20%7B%20break%3B%20%7D%20if%20(otherBadges.length%20%3E%200)%20%7B%20card%20%3D%20card.children%5B0%5D%20%7C%7C%20badge.parentElement%3B%20break%3B%20%7D%20if%20(!card.parentElement%20%7C%7C%20card.parentElement%20%3D%3D%3D%20document.body)%20break%3B%20card%20%3D%20card.parentElement%3B%20depth%2B%2B%3B%20%7D%20if%20(!card)%20card%20%3D%20badge.parentElement%3F.parentElement%20%7C%7C%20badge.parentElement%3B%20let%20cardText%20%3D%20card.innerText%20%7C%7C%20''%3B%20if%20(cardText.includes('%E0%A6%B6%E0%A6%BF%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A5%E0%A7%80%E0%A6%A6%E0%A7%87%E0%A6%B0%20%E0%A6%9C%E0%A6%A8%E0%A7%8D%E0%A6%AF%20%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A7%8D%E0%A6%A6%E0%A7%87%E0%A6%B6%E0%A6%BF%E0%A6%95%E0%A6%BE'))%20%7B%20const%20parts%20%3D%20cardText.split(%2FQuestion%3A%5Cs*%5Cd%2B%2Fi)%3B%20if%20(parts.length%20%3E%201)%20%7B%20cardText%20%3D%20'Question%3A%20'%20%2B%20qNo%20%2B%20'%5Cn'%20%2B%20parts%5Bparts.length%20-%201%5D%3B%20%7D%20%7D%20let%20explanation%20%3D%20''%3B%20let%20questionRawText%20%3D%20''%3B%20const%20solParts%20%3D%20cardText.split(%2FSolution%3A%5Cs*%2Fi)%3B%20if%20(solParts.length%20%3E%201)%20%7B%20questionRawText%20%3D%20solParts%5B0%5D.replace(%2F%5EQuestion%3A%5Cs*%5Cd%2B%2Fi%2C%20'').trim()%3B%20explanation%20%3D%20solParts%5B1%5D.split(%2F(%3F%3DQuestion%3A%5Cs*%5Cd%2B)%2Fi)%5B0%5D.trim()%3B%20%7D%20else%20%7B%20questionRawText%20%3D%20cardText.replace(%2F%5EQuestion%3A%5Cs*%5Cd%2B%2Fi%2C%20'').trim()%3B%20%7D%20const%20parsedCq%20%3D%20parseCreativeQuestionBlock(questionRawText%2C%20explanation)%3B%20let%20cleanStem%20%3D%20parsedCq.stem%3B%20if%20(cleanStem.includes('My%20Profile')%20%7C%7C%20cleanStem.includes('%E0%A6%B6%E0%A6%BF%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A5%E0%A7%80%E0%A6%A6%E0%A7%87%E0%A6%B0%20%E0%A6%9C%E0%A6%A8%E0%A7%8D%E0%A6%AF'))%20%7B%20cleanStem%20%3D%20''%3B%20%7D%20extractedCqs.push(%7B%20id%3A%20%60cq_%24%7BqNo%7D%60%2C%20title%3A%20%60%E0%A6%B8%E0%A7%83%E0%A6%9C%E0%A6%A8%E0%A6%B6%E0%A7%80%E0%A6%B2%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A7%A6%24%7BqNo%7D%60%2C%20stem%3A%20cleanStem%2C%20marks%3A%2010%2C%20subject%3A%20detectSubjectFromText(questionRawText%20%2B%20'%20'%20%2B%20explanation%20%2B%20'%20'%20%2B%20examTitle)%2C%20subQuestions%3A%20parsedCq.subQuestions%2C%20rawSolution%3A%20explanation%20%7D)%3B%20%7D%20catch%20(err)%20%7B%20console.error(%22CQ%20%E0%A6%AA%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A6%BF%E0%A6%82%20%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A7%81%E0%A6%9F%E0%A6%BF%3A%22%2C%20err)%3B%20%7D%20%7D)%3B%20%7D%20if%20(quesBadges.length%20%3E%200)%20%7B%20quesBadges.forEach((badge%2C%20idx)%20%3D%3E%20%7B%20try%20%7B%20const%20qNoMatch%20%3D%20badge.textContent.trim().match(%2F%5EQues%3A%5Cs*(%5Cd%2B)%2Fi)%3B%20const%20qNo%20%3D%20qNoMatch%20%3F%20parseInt(qNoMatch%5B1%5D%2C%2010)%20%3A%20idx%20%2B%201%3B%20let%20card%20%3D%20badge.parentElement%3B%20let%20depth%20%3D%200%3B%20while%20(card%20%26%26%20depth%20%3C%206)%20%7B%20const%20otherBadges%20%3D%20Array.from(card.querySelectorAll('*')).filter(el%20%3D%3E%20%7B%20const%20t%20%3D%20(el.textContent%20%7C%7C%20'').trim()%3B%20return%20el%20!%3D%3D%20badge%20%26%26%20el.children.length%20%3D%3D%3D%200%20%26%26%20%2F%5EQues%3A%5Cs*%5Cd%2B%2Fi.test(t)%3B%20%7D)%3B%20if%20(otherBadges.length%20%3D%3D%3D%200%20%26%26%20(card.innerText%20%7C%7C%20'').includes('Solution%3A')%20%26%26%20card.children.length%20%3E%3D%203)%20break%3B%20if%20(!card.parentElement%20%7C%7C%20card.parentElement%20%3D%3D%3D%20document.body)%20break%3B%20card%20%3D%20card.parentElement%3B%20depth%2B%2B%3B%20%7D%20if%20(!card)%20card%20%3D%20badge.parentElement%3F.parentElement%20%7C%7C%20badge.parentElement%3B%20let%20questionText%20%3D%20''%3B%20const%20pOrH%20%3D%20card.querySelectorAll('p%2C%20h3%2C%20h4%2C%20h5%2C%20%5Bclass*%3D%22question%22%5D%2C%20%5Bclass*%3D%22ques%22%5D%2C%20%5Bclass*%3D%22title%22%5D')%3B%20for%20(const%20el%20of%20pOrH)%20%7B%20const%20t%20%3D%20el.innerText%3F.trim()%20%7C%7C%20''%3B%20if%20(t%20%26%26%20!%2F%5EQues%3A%2Fi.test(t)%20%26%26%20!%2FNot%20Answered%7CAnswered%2Fi.test(t)%20%26%26%20!%2FSolution%3A%2Fi.test(t)%20%26%26%20t.length%20%3E%202)%20%7B%20questionText%20%3D%20t%3B%20break%3B%20%7D%20%7D%20let%20explanation%20%3D%20''%3B%20const%20solHeader%20%3D%20Array.from(card.querySelectorAll('*')).find(el%20%3D%3E%20(el.textContent%20%7C%7C%20'').trim()%20%3D%3D%3D%20'Solution%3A')%3B%20if%20(solHeader%20%26%26%20solHeader.parentElement)%20%7B%20const%20solBox%20%3D%20solHeader.parentElement.querySelector('%5Bclass*%3D%22green%22%5D%2C%20%5Bclass*%3D%22border%22%5D%2C%20div%3Anth-child(2)')%3B%20if%20(solBox%20%26%26%20solBox%20!%3D%3D%20solHeader)%20explanation%20%3D%20solBox.innerText%3F.trim()%20%7C%7C%20''%3B%20%7D%20if%20(!explanation)%20%7B%20const%20solParts%20%3D%20(card.innerText%20%7C%7C%20'').split(%2FSolution%3A%5Cs*%2Fi)%3B%20if%20(solParts.length%20%3E%201)%20explanation%20%3D%20solParts%5B1%5D.split(%2F(%3F%3DQues%3A%5Cs*%5Cd%2B)%2Fi)%5B0%5D.trim()%3B%20%7D%20const%20lines%20%3D%20(card.innerText%20%7C%7C%20'').split('%5Cn').map(l%20%3D%3E%20l.trim()).filter(Boolean)%3B%20let%20qLineIdx%20%3D%20-1%3B%20let%20solLineIdx%20%3D%20-1%3B%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20lines.length%3B%20i%2B%2B)%20%7B%20const%20line%20%3D%20lines%5Bi%5D%3B%20if%20(qLineIdx%20%3D%3D%3D%20-1%20%26%26%20(line.includes('%3F')%20%7C%7C%20line.includes('%E0%A6%95%E0%A6%BF')%20%7C%7C%20line.includes('%E0%A6%95%E0%A7%80')%20%7C%7C%20line%20%3D%3D%3D%20questionText))%20qLineIdx%20%3D%20i%3B%20if%20(%2F%5ESolution%5B%3A%5Cs%5D%2Fi.test(line))%20%7B%20solLineIdx%20%3D%20i%3B%20break%3B%20%7D%20%7D%20if%20(qLineIdx%20%3D%3D%3D%20-1)%20%7B%20const%20bIdx%20%3D%20lines.findIndex(l%20%3D%3E%20%2F%5EQues%3A%5Cs*%5Cd%2B%2Fi.test(l))%3B%20if%20(bIdx%20!%3D%3D%20-1)%20%7B%20for%20(let%20j%20%3D%20bIdx%20%2B%201%3B%20j%20%3C%20lines.length%3B%20j%2B%2B)%20%7B%20if%20(!%2FNot%20Answered%7CAnswered%2Fi.test(lines%5Bj%5D))%20%7B%20qLineIdx%20%3D%20j%3B%20if%20(!questionText)%20questionText%20%3D%20lines%5Bj%5D%3B%20break%3B%20%7D%20%7D%20%7D%20%7D%20if%20(solLineIdx%20%3D%3D%3D%20-1)%20solLineIdx%20%3D%20lines.length%3B%20let%20rawOptionLines%20%3D%20%5B%5D%3B%20if%20(qLineIdx%20!%3D%3D%20-1%20%26%26%20solLineIdx%20%3E%20qLineIdx)%20rawOptionLines%20%3D%20lines.slice(qLineIdx%20%2B%201%2C%20solLineIdx)%3B%20const%20candidateOptions%20%3D%20%5B%5D%3B%20let%20currentOptionText%20%3D%20''%3B%20for%20(const%20l%20of%20rawOptionLines)%20%7B%20if%20(!l%20%7C%7C%20%2F%5E(Ques%3A%7CNot%20Answered%7CAnswered)%2Fi.test(l))%20continue%3B%20if%20(%2F%5E%5BA-D%E2%9C%93%E2%9C%94%E2%80%A2%5C(%5C)%5C.%5Cs%5D%7B1%2C4%7D%24%2Fi.test(l))%20%7B%20if%20(currentOptionText)%20%7B%20candidateOptions.push(currentOptionText)%3B%20currentOptionText%20%3D%20''%3B%20%7D%20continue%3B%20%7D%20const%20cleaned%20%3D%20l.replace(%2F%5E%5BA-D%E2%9C%93%E2%9C%94%E2%80%A2%5C(%5C)%5C.%5Cs%5D%7B1%2C4%7D%2Fi%2C%20'').trim()%3B%20if%20(cleaned)%20%7B%20if%20(currentOptionText)%20candidateOptions.push(currentOptionText)%3B%20currentOptionText%20%3D%20cleaned%3B%20%7D%20%7D%20if%20(currentOptionText)%20candidateOptions.push(currentOptionText)%3B%20let%20options%20%3D%20candidateOptions.slice(0%2C%204)%3B%20let%20correctOption%20%3D%200%3B%20const%20greenElements%20%3D%20Array.from(card.querySelectorAll('*')).filter(el%20%3D%3E%20%7B%20const%20cls%20%3D%20(el.className%20%7C%7C%20'').toString().toLowerCase()%3B%20const%20style%20%3D%20(el.getAttribute('style')%20%7C%7C%20'').toLowerCase()%3B%20const%20txt%20%3D%20(el.textContent%20%7C%7C%20'').trim()%3B%20return%20(cls.includes('green')%20%7C%7C%20cls.includes('emerald')%20%7C%7C%20style.includes('green')%20%7C%7C%20txt.includes('%E2%9C%93')%20%7C%7C%20txt.includes('%E2%9C%94')%20%7C%7C%20!!el.querySelector('svg'))%20%26%26%20!txt.includes('Solution%3A')%3B%20%7D)%3B%20if%20(greenElements.length%20%3E%200)%20%7B%20for%20(let%20o%20%3D%200%3B%20o%20%3C%20options.length%3B%20o%2B%2B)%20%7B%20if%20(greenElements.some(gel%20%3D%3E%20(gel.innerText%20%7C%7C%20'').includes(options%5Bo%5D)))%20%7B%20correctOption%20%3D%20o%3B%20break%3B%20%7D%20%7D%20%7D%20extractedMcqs.push(%7B%20id%3A%20%60q_%24%7BqNo%7D%60%2C%20questionNo%3A%20qNo%2C%20text%3A%20questionText%20%7C%7C%20%60%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%24%7BqNo%7D%60%2C%20subject%3A%20detectSubjectFromText(explanation%20%2B%20'%20'%20%2B%20examTitle)%2C%20options%3A%20options.length%20%3E%3D%202%20%3F%20options%20%3A%20%5B'%E0%A6%95'%2C%20'%E0%A6%96'%2C%20'%E0%A6%97'%2C%20'%E0%A6%98'%5D%2C%20correctOption%3A%20correctOption%2C%20explanation%3A%20explanation%20%7D)%3B%20%7D%20catch%20(err)%20%7B%20console.error(%22MCQ%20%E0%A6%AA%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A6%BF%E0%A6%82%20%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A7%81%E0%A6%9F%E0%A6%BF%3A%22%2C%20err)%3B%20%7D%20%7D)%3B%20%7D%20const%20totalQuestions%20%3D%20extractedMcqs.length%20%2B%20extractedCqs.length%3B%20if%20(totalQuestions%20%3D%3D%3D%200)%20%7B%20updateBanner('%3Cdiv%20style%3D%22font-weight%3Abold%3Bcolor%3A%23f87171%3B%22%3E%E2%9A%A0%EF%B8%8F%20%E0%A6%95%E0%A7%8B%E0%A6%A8%E0%A7%8B%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%AF%E0%A6%BE%E0%A7%9F%E0%A6%A8%E0%A6%BF%3C%2Fdiv%3E'%2C%20false)%3B%20alert(%22%E2%9A%A0%EF%B8%8F%20%E0%A6%95%E0%A7%8B%E0%A6%A8%E0%A7%8B%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%AF%E0%A6%BE%E0%A7%9F%E0%A6%A8%E0%A6%BF!%20%E0%A6%85%E0%A6%A8%E0%A7%81%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%B9%20%E0%A6%95%E0%A6%B0%E0%A7%87%20%E0%A6%AA%E0%A6%B0%E0%A7%80%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A6%B0%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%AC%E0%A6%BE%20%E0%A6%B0%E0%A7%87%E0%A6%9C%E0%A6%BE%E0%A6%B2%E0%A7%8D%E0%A6%9F%20%E0%A6%AA%E0%A7%87%E0%A6%9C%E0%A7%87%20%E0%A6%A5%E0%A6%BE%E0%A6%95%E0%A6%BE%20%E0%A6%85%E0%A6%AC%E0%A6%B8%E0%A7%8D%E0%A6%A5%E0%A6%BE%E0%A7%9F%20%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AA%E0%A7%8D%E0%A6%9F%E0%A6%9F%E0%A6%BF%20%E0%A6%9A%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%A8%E0%A5%A4%22)%3B%20return%3B%20%7D%20let%20examType%20%3D%20'mcq'%3B%20if%20(extractedMcqs.length%20%3E%200%20%26%26%20extractedCqs.length%20%3E%200)%20examType%20%3D%20'combined'%3B%20else%20if%20(extractedCqs.length%20%3E%200)%20examType%20%3D%20'cq'%3B%20console.log(%60%25c%F0%9F%8E%89%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%20%E0%A6%AE%E0%A7%8B%E0%A6%9F%3A%20%24%7BtotalQuestions%7D%20%E0%A6%9F%E0%A6%BF%20(%24%7BextractedMcqs.length%7D%20MCQ%2C%20%24%7BextractedCqs.length%7D%20CQ)%60%2C%20%22color%3A%20%2300c269%3B%20font-weight%3A%20bold%3B%20font-size%3A%2016px%3B%22)%3B%20const%20fullExamData%20%3D%20%7B%20id%3A%20'exam_acs_'%20%2B%20(testId%20%3F%20testId.replace(%2F-%2Fg%2C%20'').slice(0%2C%2012)%20%3A%20Date.now())%2C%20title%3A%20examTitle%2C%20testId%3A%20testId%2C%20courseTitle%3A%20'ACS%20Exam%20Portal'%2C%20extractedAt%3A%20new%20Date().toISOString()%2C%20sourceUrl%3A%20location.href%2C%20examType%3A%20examType%2C%20durationMinutes%3A%20examType%20%3D%3D%3D%20'combined'%20%3F%20190%20%3A%20(examType%20%3D%3D%3D%20'cq'%20%3F%20190%20%3A%2030)%2C%20mcqDurationMinutes%3A%20extractedMcqs.length%20%3E%200%20%3F%2030%20%3A%200%2C%20cqDurationMinutes%3A%20extractedCqs.length%20%3E%200%20%3F%20160%20%3A%200%2C%20totalMarks%3A%20(extractedMcqs.length%20*%201)%20%2B%20(extractedCqs.length%20*%2010)%2C%20mcqMarks%3A%20extractedMcqs.length%2C%20cqMarks%3A%20extractedCqs.length%20*%2010%2C%20passMarks%3A%20Math.ceil(((extractedMcqs.length%20*%201)%20%2B%20(extractedCqs.length%20*%2010))%20*%200.33)%2C%20negativeMarkPerWrong%3A%200.25%2C%20questionsCount%3A%20extractedMcqs.length%2C%20status%3A%20'live'%2C%20questions%3A%20extractedMcqs%2C%20creativeQuestions%3A%20extractedCqs%20%7D%3B%20const%20blob%20%3D%20new%20Blob(%5BJSON.stringify(fullExamData%2C%20null%2C%202)%5D%2C%20%7B%20type%3A%20'application%2Fjson'%20%7D)%3B%20const%20a%20%3D%20document.createElement('a')%3B%20a.href%20%3D%20URL.createObjectURL(blob)%3B%20const%20cleanFileName%20%3D%20(examTitle.replace(%2F%5B%5Ea-zA-Z0-9%5Cu0980-%5Cu09FF%5D%2Fg%2C%20'_')%20%7C%7C%20'acs_master_exam')%20%2B%20'.json'%3B%20a.download%20%3D%20cleanFileName%3B%20document.body.appendChild(a)%3B%20a.click()%3B%20document.body.removeChild(a)%3B%20updateBanner(%60%3Cdiv%20style%3D%22font-weight%3Abold%3Bcolor%3A%2334d399%3B%22%3E%F0%9F%8E%89%20%E0%A6%AE%E0%A6%BE%E0%A6%B8%E0%A7%8D%E0%A6%9F%E0%A6%BE%E0%A6%B0%20%E0%A6%A1%E0%A6%BE%E0%A6%89%E0%A6%A8%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A6%A8%E0%A7%8D%E0%A6%A8!%3C%2Fdiv%3E%3Cdiv%20style%3D%22font-size%3A12px%3Bcolor%3A%23cbd5e1%3Bmargin-top%3A4px%3B%22%3EMCQ%3A%20%3Cstrong%3E%24%7BextractedMcqs.length%7D%3C%2Fstrong%3E%20%E0%A6%9F%E0%A6%BF%20%7C%20CQ%3A%20%3Cstrong%3E%24%7BextractedCqs.length%7D%3C%2Fstrong%3E%20%E0%A6%9F%E0%A6%BF%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A6%BE%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A6%BE%20%E0%A6%B8%E0%A6%BE%E0%A6%9C%E0%A6%BE%E0%A6%A8%E0%A7%8B%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87%E0%A5%A4%3C%2Fdiv%3E%60%2C%20true)%3B%20setTimeout(()%20%3D%3E%20%7B%20alert(%60%F0%9F%8E%89%20%E0%A6%B8%E0%A7%83%E0%A6%9C%E0%A6%A8%E0%A6%B6%E0%A7%80%E0%A6%B2%20(CQ)%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%BE%E0%A6%AE%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%AA%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%5Cn%5Cn%F0%9F%93%8C%20%E0%A6%AA%E0%A6%B0%E0%A7%80%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%E0%A6%B0%20%E0%A6%A8%E0%A6%BE%E0%A6%AE%3A%20%24%7BexamTitle%7D%5Cn%F0%9F%93%8C%20%E0%A6%AE%E0%A7%8B%E0%A6%9F%20%E0%A6%B8%E0%A7%83%E0%A6%9C%E0%A6%A8%E0%A6%B6%E0%A7%80%E0%A6%B2%20(CQ)%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%3A%20%24%7BextractedCqs.length%7D%20%E0%A6%9F%E0%A6%BF%5Cn%F0%9F%93%8C%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A4%E0%A6%BF%E0%A6%9F%E0%A6%BF%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A6%BE%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A6%BE%20%E0%A6%95%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A1%20%E0%A6%B9%E0%A6%BF%E0%A6%B8%E0%A7%87%E0%A6%AC%E0%A7%87%20%E0%A6%B8%E0%A7%87%E0%A6%AD%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87%E0%A5%A4%5Cn%F0%9F%93%8C%20%E0%A6%AB%E0%A6%BE%E0%A6%87%E0%A6%B2%3A%20%24%7BcleanFileName%7D%60)%3B%20%7D%2C%20500)%3B%20%7D)()%3B";

const ACS_EXAM_CONSOLE_CODE = "/**\n * ADOMMO (অদম্য) — Ultimate ACS Exam Master Scraper v4 (MCQ + CQ + Combined)\n * Specifically handles:\n *  - Individual Question Cards (Separates Question 1, Question 2, Question 3...)\n *  - Auto-clicks \"show answer\" buttons so full Solution & Model Answers are revealed\n *  - Excludes page-level headers/instructions (e.g. \"শিক্ষার্থীদের জন্য নির্দেশিকা\")\n *  - Accurately splits (ক) and (খ) / (ক), (খ), (গ), (ঘ) for each CQ separately!\n */\n(async function extractAcsMasterUniversalV4() {\n  console.clear();\n  console.log(\"%c🚀 ADOMMO — ACS Universal Master Exam Scraper v4 শুরু হচ্ছে...\", \"color: #00c269; font-size: 16px; font-weight: bold;\");\n\n  // Visual Overlay Banner\n  let banner = document.getElementById('adommo-exam-banner');\n  if (!banner) {\n    banner = document.createElement('div');\n    banner.id = 'adommo-exam-banner';\n    banner.style.position = 'fixed';\n    banner.style.top = '20px';\n    banner.style.right = '20px';\n    banner.style.zIndex = '999999';\n    banner.style.padding = '16px 20px';\n    banner.style.borderRadius = '16px';\n    banner.style.background = '#161b22';\n    banner.style.color = '#fff';\n    banner.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';\n    banner.style.border = '2px solid #8b5cf6';\n    banner.style.fontFamily = 'system-ui, sans-serif';\n    banner.style.fontSize = '14px';\n    banner.style.maxWidth = '380px';\n    banner.innerHTML = '<div style=\"font-weight:bold;color:#a78bfa;margin-bottom:4px;\">🚀 ADOMMO Master Scraper v4</div><div>সব উত্তর ও প্রশ্ন লোড করা হচ্ছে...</div>';\n    document.body.appendChild(banner);\n  }\n\n  function updateBanner(html, isSuccess) {\n    if (!banner) return;\n    if (isSuccess) banner.style.borderColor = '#10b981';\n    banner.innerHTML = html;\n  }\n\n  // ১. সব \"show answer\" বাটনে স্বয়ংক্রিয় ক্লিক করা যেন সব সলিউশন দৃশ্যমান হয়\n  try {\n    const showAnswerButtons = Array.from(document.querySelectorAll('button, a, div[role=\"button\"]')).filter(b => {\n      const t = (b.textContent || '').trim().toLowerCase();\n      return t === 'show answer' || t === 'view answer' || t === 'সমাধান দেখুন' || t === 'উত্তর দেখুন';\n    });\n    if (showAnswerButtons.length > 0) {\n      console.log(`🔓 ${showAnswerButtons.length} টি \"show answer\" বাটনে ক্লিক করে সমাধান উন্মোচন করা হচ্ছে...`);\n      updateBanner(`<div style=\"font-weight:bold;color:#a78bfa;\">🔓 সমাধান উন্মোচন করা হচ্ছে...</div><div>${showAnswerButtons.length} টি প্রশ্নের উত্তর লোড হচ্ছে</div>`);\n      showAnswerButtons.forEach(btn => btn.click());\n      // DOM আপডেটের জন্য ৫০০ মিলি-সেকেন্ড অপেক্ষা\n      await new Promise(r => setTimeout(r, 600));\n    }\n  } catch (e) {\n    console.warn(\"Auto-expand show answer warning:\", e);\n  }\n\n  // ২. অথেনটিকেশন টোকেন বের করা\n  let token = '';\n  for (let i = 0; i < localStorage.length; i++) {\n    const k = localStorage.key(i);\n    const v = localStorage.getItem(k) || '';\n    const m = v.match(/ey[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*/);\n    if (m) { token = m[0]; break; }\n  }\n\n  // ৩. টেস্ট আইডি ও টাইটেল শনাক্ত করা\n  const urlMatch = location.href.match(/(?:mcq|written|exam|test|test-details)\\/([a-zA-Z0-9-]+)/i);\n  const testId = urlMatch ? urlMatch[1] : '';\n\n  let examTitle = '';\n  const titleEl = document.querySelector('h1, h2, [class*=\"title\"], [class*=\"Title\"]');\n  if (titleEl && titleEl.textContent && titleEl.textContent.trim().length > 3 && !/apars|exam portal|শিক্ষার্থীদের/i.test(titleEl.textContent)) {\n    examTitle = titleEl.textContent.trim();\n  } else {\n    examTitle = document.title.replace(/apars\\s*classroom/i, '').trim() || 'ACS Exam ' + (testId ? testId.slice(0, 8) : '');\n  }\n\n  updateBanner(`<div style=\"font-weight:bold;color:#a78bfa;\">📝 ${examTitle}</div><div>প্রশ্ন ও উত্তর আলাদা করা হচ্ছে...</div>`);\n\n  // ৪. সাবজেক্ট ডিটেকশন হেল্পার\n  function detectSubjectFromText(text) {\n    const s = (text || '').toLowerCase();\n    if (s.includes('রসায়ন') || s.includes('chemistry') || s.includes('হাজারী')) return 'রসায়ন';\n    if (s.includes('পদার্থ') || s.includes('physics') || s.includes('ইসহাক') || s.includes('তপন')) return 'পদার্থবিজ্ঞান';\n    if (s.includes('উচ্চতর গণিত') || s.includes('math') || s.includes('কেতাব') || s.includes('অসীম')) return 'উচ্চতর গণিত';\n    if (s.includes('জীববিজ্ঞান') || s.includes('biology') || s.includes('আজমল') || s.includes('হাসান') || s.includes('উদ্ভিদ') || s.includes('প্রাণী')) return 'জীববিজ্ঞান';\n    if (s.includes('বাংলা ২য়') || s.includes('bangla 2nd') || s.includes('আবেদন') || s.includes('দিনলিপি') || s.includes('বৈদ্যুতিন চিঠি') || s.includes('প্রতিবেদন') || s.includes('সারাংশ') || s.includes('ভাবসম্প্রসারণ')) return 'বাংলা ২য় পত্র';\n    if (s.includes('বাংলা') || s.includes('bangla')) return 'বাংলা ১ম পত্র';\n    if (s.includes('english') || s.includes('ইংরেজি')) return 'English';\n    if (s.includes('ict') || s.includes('তথ্য')) return 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)';\n    return 'General';\n  }\n\n  // ৫. সৃজনশীল প্রশ্নের (ক), (খ) ইত্যাদি এবং নমুনা উত্তর পার্সিং\n  function parseCreativeQuestionBlock(qText, solText) {\n    const solParts = {};\n    const solRegex = /(?:নমুনা\\s*উত্তর[:\\s]*|উত্তর[:\\s]*)\\(([ক-ঘa-dA-D\\d])\\)|(?:নমুনা\\s*উত্তর[:\\s]*|উত্তর[:\\s]*)([ক-ঘa-dA-D\\d])[\\.\\)]/g;\n    let match;\n    let indices = [];\n    while ((match = solRegex.exec(solText)) !== null) {\n      indices.push({ part: match[1] || match[2], index: match.index, length: match[0].length });\n    }\n\n    if (indices.length > 0) {\n      for (let i = 0; i < indices.length; i++) {\n        const start = indices[i].index + indices[i].length;\n        const end = (i + 1 < indices.length) ? indices[i+1].index : solText.length;\n        solParts[indices[i].part] = solText.slice(start, end).trim();\n      }\n    }\n\n    const cleanedQ = qText.replace(/show answer|hide answer|answered|not answered/gi, '').trim();\n    const subQRegex = /(?:^|\\n|\\s)(?:অথবা,\\s*)?(?:\\(([ক-ঘa-dA-D\\d]+)\\)|([ক-ঘa-dA-D\\d])[\\.\\)])\\s*/g;\n    const subMatches = [];\n    while ((match = subQRegex.exec(cleanedQ)) !== null) {\n      subMatches.push({ part: match[1] || match[2], index: match.index, length: match[0].length });\n    }\n\n    let stem = '';\n    const subQuestions = [];\n\n    if (subMatches.length > 0) {\n      stem = cleanedQ.slice(0, subMatches[0].index).trim();\n      for (let i = 0; i < subMatches.length; i++) {\n        const start = subMatches[i].index + subMatches[i].length;\n        const end = (i + 1 < subMatches.length) ? subMatches[i+1].index : cleanedQ.length;\n        const text = cleanedQ.slice(start, end).trim();\n        const markMatch = text.match(/\\[(\\d+)\\]/) || text.match(/\\((\\d+)\\)/);\n        let marks = 10;\n        if (markMatch) {\n          marks = parseInt(markMatch[1], 10);\n        } else if (subMatches.length === 4) {\n          marks = [1, 2, 3, 4][i] || 2;\n        } else if (subMatches.length === 2) {\n          marks = 10;\n        }\n\n        const partKey = subMatches[i].part;\n        subQuestions.push({\n          part: partKey,\n          text: text,\n          marks: marks,\n          sampleAnswer: solParts[partKey] || ''\n        });\n      }\n    } else {\n      const markMatch = cleanedQ.match(/\\[(\\d+)\\]/) || cleanedQ.match(/\\((\\d+)\\)/);\n      const marks = markMatch ? parseInt(markMatch[1], 10) : 10;\n      subQuestions.push({\n        part: '১',\n        text: cleanedQ,\n        marks: marks,\n        sampleAnswer: solText || ''\n      });\n    }\n\n    return { stem, subQuestions };\n  }\n\n  let extractedMcqs = [];\n  let extractedCqs = [];\n\n  // =========================================================================\n  // ৬. DOM ভিত্তিক প্রতিটি প্রশ্ন কার্ড আলাদা করে নিষ্কাশন\n  // =========================================================================\n  const allElements = Array.from(document.querySelectorAll('*'));\n\n  // ১) MCQ কার্ড খোঁজা: 'Ques: 1'\n  const quesBadges = allElements.filter(el => {\n    const t = (el.textContent || '').trim();\n    return el.children.length === 0 && /^Ques:\\s*\\d+/i.test(t);\n  });\n\n  // ২) CQ ব্যাজ খোঁজা: 'Question: 1', 'Question: 2'\n  const cqBadges = allElements.filter(el => {\n    const t = (el.textContent || '').trim();\n    return el.children.length === 0 && /^Question:\\s*\\d+/i.test(t);\n  });\n\n  console.log(`🔎 শনাক্তকরণ ফলাফল: MCQ ব্যাজ = ${quesBadges.length} টি, CQ ব্যাজ = ${cqBadges.length} টি`);\n\n  // --- CQ (সৃজনশীল) কার্ড বাই কার্ড নির্ভুল নিষ্কাশন ---\n  if (cqBadges.length > 0) {\n    cqBadges.forEach((badge, idx) => {\n      try {\n        const qNoMatch = badge.textContent.trim().match(/^Question:\\s*(\\d+)/i);\n        const qNo = qNoMatch ? parseInt(qNoMatch[1], 10) : idx + 1;\n\n        // কার্ড খোঁজার জন্য সুনির্দিষ্ট লজিক:\n        // এমন ক্ষুদ্রতম প্যারেন্ট এলিমেন্ট যার ভেতরে \"Question: X\" আছে এবং যাতে পরবর্তী \"Question: Y\" নেই!\n        let card = badge.parentElement;\n        let depth = 0;\n        while (card && depth < 6) {\n          const hasButton = card.querySelector('button, [class*=\"button\"]');\n          const hasBorder = card.className && (card.className.includes('border') || card.className.includes('rounded') || card.className.includes('shadow') || card.className.includes('card'));\n          // পরবর্তী Question এর ব্যাজ যেন না থাকে\n          const otherBadges = Array.from(card.querySelectorAll('*')).filter(el => {\n            const t = (el.textContent || '').trim();\n            return el !== badge && el.children.length === 0 && /^Question:\\s*\\d+/i.test(t);\n          });\n\n          if (otherBadges.length === 0 && (hasButton || hasBorder) && card.children.length >= 2) {\n            break;\n          }\n          if (otherBadges.length > 0) {\n            // যদি প্যারেন্টে অন্য প্রশ্নও ঢুকে যায়, তবে আগের চাইল্ডেই থামতে হবে\n            card = card.children[0] || badge.parentElement;\n            break;\n          }\n          if (!card.parentElement || card.parentElement === document.body) break;\n          card = card.parentElement;\n          depth++;\n        }\n        if (!card) card = badge.parentElement?.parentElement || badge.parentElement;\n\n        // প্রশ্ন কার্ডের টেক্সট\n        let cardText = card.innerText || '';\n\n        // যদি কোনো কারণে কার্ডে উপরের পেজের হেডার বা অন্য টেক্সট ঢুকে থাকে, তা ছাঁটাই করা:\n        // যেমন \"শিক্ষার্থীদের জন্য নির্দেশিকা\" বা \"My Profile\"\n        if (cardText.includes('শিক্ষার্থীদের জন্য নির্দেশিকা')) {\n          const parts = cardText.split(/Question:\\s*\\d+/i);\n          if (parts.length > 1) {\n            cardText = 'Question: ' + qNo + '\\n' + parts[parts.length - 1];\n          }\n        }\n\n        // Solution ব্লক আলাদা করা\n        let explanation = '';\n        let questionRawText = '';\n\n        const solParts = cardText.split(/Solution:\\s*/i);\n        if (solParts.length > 1) {\n          questionRawText = solParts[0].replace(/^Question:\\s*\\d+/i, '').trim();\n          explanation = solParts[1].split(/(?=Question:\\s*\\d+)/i)[0].trim();\n        } else {\n          questionRawText = cardText.replace(/^Question:\\s*\\d+/i, '').trim();\n        }\n\n        // সৃজনশীল প্রশ্নের (ক) ও (খ) অংশ আলাদা করা\n        const parsedCq = parseCreativeQuestionBlock(questionRawText, explanation);\n\n        // উদ্দীপক যদি ভুলক্রমে পুরো পেজের টেক্সট হয়ে থাকে তা সাফ করা\n        let cleanStem = parsedCq.stem;\n        if (cleanStem.includes('My Profile') || cleanStem.includes('শিক্ষার্থীদের জন্য')) {\n          cleanStem = '';\n        }\n\n        extractedCqs.push({\n          id: `cq_${qNo}`,\n          title: `সৃজনশীল প্রশ্ন ০${qNo}`,\n          stem: cleanStem,\n          marks: 10,\n          subject: detectSubjectFromText(questionRawText + ' ' + explanation + ' ' + examTitle),\n          subQuestions: parsedCq.subQuestions,\n          rawSolution: explanation\n        });\n      } catch (err) {\n        console.error(\"CQ পার্সিং ত্রুটি:\", err);\n      }\n    });\n  }\n\n  // --- MCQ নিষ্কাশন (যদি থাকে) ---\n  if (quesBadges.length > 0) {\n    quesBadges.forEach((badge, idx) => {\n      try {\n        const qNoMatch = badge.textContent.trim().match(/^Ques:\\s*(\\d+)/i);\n        const qNo = qNoMatch ? parseInt(qNoMatch[1], 10) : idx + 1;\n\n        let card = badge.parentElement;\n        let depth = 0;\n        while (card && depth < 6) {\n          const otherBadges = Array.from(card.querySelectorAll('*')).filter(el => {\n            const t = (el.textContent || '').trim();\n            return el !== badge && el.children.length === 0 && /^Ques:\\s*\\d+/i.test(t);\n          });\n          if (otherBadges.length === 0 && (card.innerText || '').includes('Solution:') && card.children.length >= 3) break;\n          if (!card.parentElement || card.parentElement === document.body) break;\n          card = card.parentElement;\n          depth++;\n        }\n        if (!card) card = badge.parentElement?.parentElement || badge.parentElement;\n\n        let questionText = '';\n        const pOrH = card.querySelectorAll('p, h3, h4, h5, [class*=\"question\"], [class*=\"ques\"], [class*=\"title\"]');\n        for (const el of pOrH) {\n          const t = el.innerText?.trim() || '';\n          if (t && !/^Ques:/i.test(t) && !/Not Answered|Answered/i.test(t) && !/Solution:/i.test(t) && t.length > 2) {\n            questionText = t;\n            break;\n          }\n        }\n\n        let explanation = '';\n        const solHeader = Array.from(card.querySelectorAll('*')).find(el => (el.textContent || '').trim() === 'Solution:');\n        if (solHeader && solHeader.parentElement) {\n          const solBox = solHeader.parentElement.querySelector('[class*=\"green\"], [class*=\"border\"], div:nth-child(2)');\n          if (solBox && solBox !== solHeader) explanation = solBox.innerText?.trim() || '';\n        }\n        if (!explanation) {\n          const solParts = (card.innerText || '').split(/Solution:\\s*/i);\n          if (solParts.length > 1) explanation = solParts[1].split(/(?=Ques:\\s*\\d+)/i)[0].trim();\n        }\n\n        const lines = (card.innerText || '').split('\\n').map(l => l.trim()).filter(Boolean);\n        let qLineIdx = -1;\n        let solLineIdx = -1;\n        for (let i = 0; i < lines.length; i++) {\n          const line = lines[i];\n          if (qLineIdx === -1 && (line.includes('?') || line.includes('কি') || line.includes('কী') || line === questionText)) qLineIdx = i;\n          if (/^Solution[:\\s]/i.test(line)) { solLineIdx = i; break; }\n        }\n        if (qLineIdx === -1) {\n          const bIdx = lines.findIndex(l => /^Ques:\\s*\\d+/i.test(l));\n          if (bIdx !== -1) {\n            for (let j = bIdx + 1; j < lines.length; j++) {\n              if (!/Not Answered|Answered/i.test(lines[j])) { qLineIdx = j; if (!questionText) questionText = lines[j]; break; }\n            }\n          }\n        }\n        if (solLineIdx === -1) solLineIdx = lines.length;\n\n        let rawOptionLines = [];\n        if (qLineIdx !== -1 && solLineIdx > qLineIdx) rawOptionLines = lines.slice(qLineIdx + 1, solLineIdx);\n\n        const candidateOptions = [];\n        let currentOptionText = '';\n        for (const l of rawOptionLines) {\n          if (!l || /^(Ques:|Not Answered|Answered)/i.test(l)) continue;\n          if (/^[A-D✓✔•\\(\\)\\.\\s]{1,4}$/i.test(l)) {\n            if (currentOptionText) { candidateOptions.push(currentOptionText); currentOptionText = ''; }\n            continue;\n          }\n          const cleaned = l.replace(/^[A-D✓✔•\\(\\)\\.\\s]{1,4}/i, '').trim();\n          if (cleaned) {\n            if (currentOptionText) candidateOptions.push(currentOptionText);\n            currentOptionText = cleaned;\n          }\n        }\n        if (currentOptionText) candidateOptions.push(currentOptionText);\n\n        let options = candidateOptions.slice(0, 4);\n        let correctOption = 0;\n\n        const greenElements = Array.from(card.querySelectorAll('*')).filter(el => {\n          const cls = (el.className || '').toString().toLowerCase();\n          const style = (el.getAttribute('style') || '').toLowerCase();\n          const txt = (el.textContent || '').trim();\n          return (cls.includes('green') || cls.includes('emerald') || style.includes('green') || txt.includes('✓') || txt.includes('✔') || !!el.querySelector('svg')) && !txt.includes('Solution:');\n        });\n\n        if (greenElements.length > 0) {\n          for (let o = 0; o < options.length; o++) {\n            if (greenElements.some(gel => (gel.innerText || '').includes(options[o]))) {\n              correctOption = o;\n              break;\n            }\n          }\n        }\n\n        extractedMcqs.push({\n          id: `q_${qNo}`,\n          questionNo: qNo,\n          text: questionText || `প্রশ্ন ${qNo}`,\n          subject: detectSubjectFromText(explanation + ' ' + examTitle),\n          options: options.length >= 2 ? options : ['ক', 'খ', 'গ', 'ঘ'],\n          correctOption: correctOption,\n          explanation: explanation\n        });\n      } catch (err) {\n        console.error(\"MCQ পার্সিং ত্রুটি:\", err);\n      }\n    });\n  }\n\n  // ৭. রেজাল্ট যাচাই\n  const totalQuestions = extractedMcqs.length + extractedCqs.length;\n  if (totalQuestions === 0) {\n    updateBanner('<div style=\"font-weight:bold;color:#f87171;\">⚠️ কোনো প্রশ্ন পাওয়া যায়নি</div>', false);\n    alert(\"⚠️ কোনো প্রশ্ন পাওয়া যায়নি! অনুগ্রহ করে পরীক্ষার প্রশ্ন বা রেজাল্ট পেজে থাকা অবস্থায় স্ক্রিপ্টটি চালান।\");\n    return;\n  }\n\n  let examType = 'mcq';\n  if (extractedMcqs.length > 0 && extractedCqs.length > 0) examType = 'combined';\n  else if (extractedCqs.length > 0) examType = 'cq';\n\n  console.log(`%c🎉 সফলভাবে এক্সট্র্যাক্ট হয়েছে! মোট: ${totalQuestions} টি (${extractedMcqs.length} MCQ, ${extractedCqs.length} CQ)`, \"color: #00c269; font-weight: bold; font-size: 16px;\");\n\n  const fullExamData = {\n    id: 'exam_acs_' + (testId ? testId.replace(/-/g, '').slice(0, 12) : Date.now()),\n    title: examTitle,\n    testId: testId,\n    courseTitle: 'ACS Exam Portal',\n    extractedAt: new Date().toISOString(),\n    sourceUrl: location.href,\n    examType: examType,\n    durationMinutes: examType === 'combined' ? 190 : (examType === 'cq' ? 190 : 30),\n    mcqDurationMinutes: extractedMcqs.length > 0 ? 30 : 0,\n    cqDurationMinutes: extractedCqs.length > 0 ? 160 : 0,\n    totalMarks: (extractedMcqs.length * 1) + (extractedCqs.length * 10),\n    mcqMarks: extractedMcqs.length,\n    cqMarks: extractedCqs.length * 10,\n    passMarks: Math.ceil(((extractedMcqs.length * 1) + (extractedCqs.length * 10)) * 0.33),\n    negativeMarkPerWrong: 0.25,\n    questionsCount: extractedMcqs.length,\n    status: 'live',\n    questions: extractedMcqs,\n    creativeQuestions: extractedCqs\n  };\n\n  const blob = new Blob([JSON.stringify(fullExamData, null, 2)], { type: 'application/json' });\n  const a = document.createElement('a');\n  a.href = URL.createObjectURL(blob);\n  const cleanFileName = (examTitle.replace(/[^a-zA-Z0-9\\u0980-\\u09FF]/g, '_') || 'acs_master_exam') + '.json';\n  a.download = cleanFileName;\n  document.body.appendChild(a);\n  a.click();\n  document.body.removeChild(a);\n\n  updateBanner(`<div style=\"font-weight:bold;color:#34d399;\">🎉 মাস্টার ডাউনলোড সম্পন্ন!</div><div style=\"font-size:12px;color:#cbd5e1;margin-top:4px;\">MCQ: <strong>${extractedMcqs.length}</strong> টি | CQ: <strong>${extractedCqs.length}</strong> টি আলাদা আলাদা সাজানো হয়েছে।</div>`, true);\n\n  setTimeout(() => {\n    alert(`🎉 সৃজনশীল (CQ) এক্সাম সফলভাবে এক্সপোর্ট হয়েছে!\\n\\n📌 পরীক্ষার নাম: ${examTitle}\\n📌 মোট সৃজনশীল (CQ) প্রশ্ন: ${extractedCqs.length} টি\\n📌 প্রতিটি প্রশ্ন আলাদা আলাদা কার্ড হিসেবে সেভ হয়েছে।\\n📌 ফাইল: ${cleanFileName}`);\n  }, 500);\n})();\n";

const SAMPLE_ACS_EXAM_DATA = {
  id: "exam_frb26_bangla_1st",
  title: "FRB 26 Final Model Test || Bangla 1st Paper (Practice)",
  courseTitle: "ACS HSC 26 Final Revision Batch || FRB-26",
  subject: "Bangla 1st Paper",
  examType: "combined",
  durationMinutes: 190,
  mcqDurationMinutes: 30,
  cqDurationMinutes: 160,
  totalMarks: 100,
  mcqMarks: 30,
  cqMarks: 70,
  passMarks: 33,
  negativeMarkPerWrong: 0.25,
  questionsCount: 30,
  status: "live",
  questions: [
    {
      id: "q_1",
      questionNo: 1,
      text: "'সিরাজউদ্দৌলা' নাটকের শেষ দৃশ্যের স্থানিক পটভূমি কোথায়?",
      subject: "Bangla",
      options: [
        "জাফরগঞ্জের কয়েদখানা",
        "নবাবের দরবার",
        "ফোর্ট উইলিয়াম দুর্গ",
        "ক্লাইভের বাসভবন"
      ],
      correctOption: 0,
      explanation: "সিরাজউদ্দৌলা নাটকের ৪র্থ অঙ্ক, ৮ম দৃশ্য (শেষ দৃশ্য) জাফরগঞ্জের কয়েদখানায় সংঘটিত হয়, যেখানে মীরনের নির্দেশে মোহাম্মদী বেগ সিরাজউদ্দৌলাকে নির্মমভাবে হত্যা করে।"
    },
    {
      id: "q_2",
      questionNo: 2,
      text: "'লালসালু' উপন্যাসে মজিদ গ্রামে প্রবেশ করেছিল কোন বেশে?",
      subject: "Bangla",
      options: [
        "পীরের বেশে",
        "ভিক্ষুকের বেশে",
        "ভণ্ড ফকিরের বেশে",
        "সাধারণ কৃষকের বেশে"
      ],
      correctOption: 2,
      explanation: "মজিদ মহব্বতনগর গ্রামে প্রবেশ করেছিল নাটুকে ভঙ্গিতে মোদাচ্ছের পীরের মাজারের খাদেম হিসেবে ভণ্ড ফকিরের বেশে।"
    },
    {
      id: "q_3",
      questionNo: 3,
      text: "'রেইনকোট' গল্পে নুরুল হুদার গায়ে রেইনকোটটি চাপিয়ে দিয়েছিলেন কে?",
      subject: "Bangla",
      options: [
        "আসমাত",
        "আকবর সাজিদ",
        "আসমা",
        "প্রিন্সিপাল ড. আফাজ আহমদ"
      ],
      correctOption: 2,
      explanation: "নুরুল হুদার স্ত্রী আসমা তার মুক্তিযোদ্ধা ভাই মিন্টুর ফেলে যাওয়া রেইনকোটটি নুরুল হুদার গায়ে পরিয়ে দিয়েছিলেন।"
    }
  ],
  creativeQuestions: [
    {
      id: "cq_1",
      title: "সৃজনশীল প্রশ্ন ০১: অপরিচিতা",
      stem: "আনিস সাহেব যৌতুক ছাড়া তার একমাত্র কন্যার বিয়ে দিতে চেয়েছিলেন। কিন্তু বরের পিতা বিয়ের আসরে কন্যার স্বর্ণালঙ্কারের খাঁটিত্ব নিয়ে অপমানজনক মন্তব্য করায় আনিস সাহেব নিজেই বিয়ে ভেঙে দেন এবং কন্যাকে উচ্চশিক্ষায় শিক্ষিত করার সিদ্ধান্ত নেন।",
      subQuestions: [
        { part: "ক", text: "অনুপমের পিতার পেশা কী ছিল?", marks: 1, sampleAnswer: "অনুপমের পিতা পেশায় ওকালতি করতেন।" },
        { part: "খ", text: "'তাহাকে সুন্দর বলিলে সুন্দরকে খাটো করা হয়' — উক্তিটি ব্যাখ্যা করো।", marks: 2, sampleAnswer: "কল্যাণীর অসাধারণ লাবণ্য ও ব্যক্তিত্বকে সাধারণ রূপচর্চার সীমানার ঊর্ধ্বে তুলে ধরতে অনুপম এ মন্তব্য করেছে।" },
        { part: "গ", text: "উদ্দীপকের আনিস সাহেবের আচরণ 'অপরিচিতা' গল্পের শম্ভুনাথ সেনের সাথে কীভাবে সাদৃশ্যপূর্ণ? বুঝিয়ে লেখো।", marks: 3, sampleAnswer: "উভয়েই কন্যাদায়গ্রস্ত পিতার চিরাচরিত অসহায়ত্ব ভেঙে আত্মমর্যাদাবোধের পরাকাষ্ঠা প্রদর্শন করেছেন।" },
        { part: "ঘ", text: "উদ্দীপকটি যেন 'অপরিচিতা' গল্পের শম্ভুনাথ সেনের দৃঢ় আত্মমর্যাদাবোধের প্রতীকী প্রতিফলন — উক্তিটি বিশ্লেষণ করো।", marks: 4, sampleAnswer: "যৌতুকলোভী সমাজের বিরুদ্ধে শম্ভুনাথ সেন যেভাবে নীরব প্রতিরোধ গড়ে তুলেছিলেন, উদ্দীপকের আনিস সাহেবও অনুরূপ বলিষ্ঠ পদক্ষেপ গ্রহণ করেছেন।" }
      ]
    }
  ]
};

export default function AutomationToolsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedCourseData | null>(null);
  const [customCourseTitle, setCustomCourseTitle] = useState<string>('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'upload' | 'hierarchy' | 'search' | 'raw'>('upload');
  const [guideTab, setGuideTab] = useState<'protected' | 'desktop' | 'web' | 'acs'>('protected');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<ParsedClass | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedTgCode, setCopiedTgCode] = useState(false);
  const [copiedTgProtectedCode, setCopiedTgProtectedCode] = useState(false);
  const [isImportingToSite, setIsImportingToSite] = useState(false);
  const [toolMode, setToolMode] = useState<'course' | 'exam' | 'details'>('course');
  const [pastedChatText, setPastedChatText] = useState<string>('');
  const [pastedSubjectChoice, setPastedSubjectChoice] = useState<string>('auto');
  const [isProcessingPaste, setIsProcessingPaste] = useState<boolean>(false);
  const [pasteSuccessNotice, setPasteSuccessNotice] = useState<string | null>(null);
  
  // ACS Course Details Extractor States
  const [detailsUrl, setDetailsUrl] = useState('');
  const [isExtractingDetails, setIsExtractingDetails] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<any | null>(null);
  const [detailsErrorMsg, setDetailsErrorMsg] = useState<string | null>(null);
  const [copiedDetailKey, setCopiedDetailKey] = useState<string | null>(null);
  const [copiedUnlockerBookmarklet, setCopiedUnlockerBookmarklet] = useState(false);

  const ACS_COPY_UNLOCKER_BOOKMARKLET = `javascript:(function(){document.oncontextmenu=null;document.onselectstart=null;document.ondragstart=null;document.oncopy=null;document.oncut=null;document.onkeydown=null;document.querySelectorAll('*').forEach(e=>{e.style.userSelect='text';e.style.webkitUserSelect='text';e.removeAttribute('unselectable');});alert('🔓 এই পেজের সব টেক্সট এখন সিলেক্ট ও কপি করা যাবে!');})();`;

  const handleCopyUnlockerBookmarklet = () => {
    try {
      navigator.clipboard.writeText(ACS_COPY_UNLOCKER_BOOKMARKLET);
      setCopiedUnlockerBookmarklet(true);
      setTimeout(() => setCopiedUnlockerBookmarklet(false), 3000);
    } catch {
      alert('ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে!');
    }
  };

  const handleCopyDetailText = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedDetailKey(key);
      setTimeout(() => setCopiedDetailKey(null), 2500);
    } catch {
      alert('কপি করতে সমস্যা হয়েছে!');
    }
  };

  const handleExtractCourseDetails = async (targetUrl?: string) => {
    const urlToUse = (targetUrl || detailsUrl).trim();
    if (!urlToUse) {
      setDetailsErrorMsg('দয়া করে একটি ACS কোর্স লিংক পেস্ট করুন');
      return;
    }

    setIsExtractingDetails(true);
    setDetailsErrorMsg(null);
    try {
      const res = await fetch('/api/tools/extract-course-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'কোর্স তথ্য সংগ্রহ করা সম্ভব হয়নি');
      }
      setExtractedDetails(data.data);
    } catch (err: any) {
      setDetailsErrorMsg(err.message || 'কোর্স লিংক থেকে তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsExtractingDetails(false);
    }
  };
  const examFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedExamFile, setSelectedExamFile] = useState<File | null>(null);
  const [parsedExamData, setParsedExamData] = useState<any | null>(null);
  const [copiedExamBookmarklet, setCopiedExamBookmarklet] = useState(false);
  const [copiedExamConsole, setCopiedExamConsole] = useState(false);
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [selectedExamSubject, setSelectedExamSubject] = useState<string>('all');
  const [isImportingExamToSite, setIsImportingExamToSite] = useState(false);
  const [examImportSuccessMsg, setExamImportSuccessMsg] = useState<string | null>(null);
  const [examErrorMsg, setExamErrorMsg] = useState<string | null>(null);
  const [expandedExamQuestions, setExpandedExamQuestions] = useState<Record<string, boolean>>({});

  const handleCopyExamBookmarklet = () => {
    try {
      navigator.clipboard.writeText(ACS_EXAM_BOOKMARKLET_CODE);
      setCopiedExamBookmarklet(true);
      setTimeout(() => setCopiedExamBookmarklet(false), 3000);
    } catch {
      alert('ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে!');
    }
  };

  const handleCopyExamConsole = () => {
    try {
      navigator.clipboard.writeText(ACS_EXAM_CONSOLE_CODE);
      setCopiedExamConsole(true);
      setTimeout(() => setCopiedExamConsole(false), 3000);
    } catch {
      alert('ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে!');
    }
  };

  const handleExamFile = (file: File) => {
    setSelectedExamFile(file);
    setExamErrorMsg(null);
    setExamImportSuccessMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.questions || parsed.exam || parsed.title) {
          const formatted = {
            ...parsed,
            title: parsed.title || parsed.examTitle || file.name.replace('.json', ''),
            questions: parsed.questions || parsed.exam?.questions || [],
            creativeQuestions: parsed.creativeQuestions || parsed.cqQuestions || []
          };
          setParsedExamData(formatted);
        } else {
          throw new Error('ফাইলটিতে কোনো বৈধ এক্সাম বা প্রশ্ন তালিকা পাওয়া যায়নি!');
        }
      } catch (err: any) {
        setExamErrorMsg('JSON ফাইলটি পার্স করতে সমস্যা হয়েছে: ' + err.message);
        setParsedExamData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleExam = () => {
    setParsedExamData(SAMPLE_ACS_EXAM_DATA);
    setSelectedExamFile(null);
    setExamErrorMsg(null);
    setExamImportSuccessMsg(null);
  };

  const handleDownloadCleanExamJson = () => {
    if (!parsedExamData) return;
    const blob = new Blob([JSON.stringify(parsedExamData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const cleanFileName = ((parsedExamData.title || 'acs_exam').replace(/[^a-zA-Z0-9ঀ-৿]/g, '_')) + '.json';
    a.download = cleanFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportExamToMainWebsite = async () => {
    if (!parsedExamData) return;
    try {
      setIsImportingExamToSite(true);
      setExamErrorMsg(null);
      setExamImportSuccessMsg(null);

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsedExamData,
          courseId: parsedExamData.courseId || 'course_acs_frb26',
          courseTitle: parsedExamData.courseTitle || 'ACS HSC 26 Final Revision Batch || FRB-26',
          status: 'live'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'এক্সাম সেভ করতে সমস্যা হয়েছে!');
      }

      setExamImportSuccessMsg('🎉 এক্সামটি সফলভাবে আমাদের মেইন ওয়েবসাইটে যুক্ত হয়েছে! শিক্ষার্থীরা এখন পরীক্ষাটি দিতে পারবে।');
    } catch (err: any) {
      setExamErrorMsg(err.message || 'মেইন ওয়েবসাইটে এক্সাম সেভ করতে সমস্যা হয়েছে!');
    } finally {
      setIsImportingExamToSite(false);
    }
  };

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
          // If classes have valid content, assign to baseChapter or fallback
          realChapter = (!isPureDurationText(baseChapter) && baseChapter !== 'মূল অধ্যায়') ? baseChapter : (baseChapter || 'অধ্যায় ১');
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

  // Helper: Extract standardized hierarchy (Universal 1:1 ACS Pattern)
  const getNormalizedSubjects = (data: ParsedCourseData | null): ParsedSubject[] => {
    if (!data) return [];
    
    // Case A: Scraper / ACS format (subjects array)
    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      let list = [...data.subjects];
      if (data.archive && Array.isArray(data.archive.subjects)) {
        list = [...list, ...data.archive.subjects.map(s => ({ ...s, isArchive: true }))];
      }

      const isFromTelegram = !!(data as any).messages || !!(data as any).isTelegram;

      return list.map((sub, sIdx) => {
        // ১. সাবজেক্ট টাইটেল: ACS এর আসল নাম (যেমন: Architecture, Archive, Physics) ১০০% হুবহু সংরক্ষণ
        const rawSubTitle = (sub.title || sub.name || sub.subjectName || sub.courseSubject?.title || sub.courseSubjectName || '').trim();
        const title = (rawSubTitle && !isGenericSubjectTitle(rawSubTitle))
          ? rawSubTitle
          : resolveSubjectTitle(rawSubTitle, sub.chapters, sIdx + 1);

        const rawChapters = sub.chapters || [];

        // ২. চ্যাপ্টারের তালিকা:
        // শুধুমাত্র অসংগঠিত টেলিগ্রাম এক্সপোর্টের ক্ষেত্রে চ্যাপ্টার রিগ্রুপ দরকার
        // ACS JSON-এর ক্ষেত্রে ACS-এর নিজস্ব চ্যাপ্টার (যেমন: Prologue, Composition, Logo, Poster & Book Cover) হুবহু ১:১ থাকবে
        let chapters: ParsedChapter[] = [];
        if (isFromTelegram) {
          chapters = cleanAndRebalanceChapters(rawChapters);
        } else {
          chapters = rawChapters.map((ch: any, cIdx: number) => {
            const rawChapTitle = (ch.title || ch.name || ch.chapterName || ch.courseSubjectChapterName || '').trim();
            const classes: ParsedClass[] = (ch.classes || ch.lectures || []).map((cl: any, i: number) => {
              const classTitle = (cl.title || cl.classTitle || cl.description || `Class ${i + 1}`).trim();
              return {
                id: cl.id || `cl_${cIdx + 1}_${i + 1}`,
                classNo: cl.classNo || (i + 1).toString(),
                title: classTitle,
                description: cl.description || '',
                instructor: cl.instructor || cl.instructorName || 'Instructor',
                videoUrl: cl.videoUrl || '',
                videoId: cl.videoId || '',
                hostingType: cl.hostingType || cl.platform || '',
                streamKey: cl.streamKey || '',
                platform: cl.platform || '',
                duration: cl.duration || '',
                lectureSheetPdf: cl.lectureSheetPdf || cl.lectureSheet || (cl.materials && cl.materials[0]?.url) || null,
                practiceSheetPdf: cl.practiceSheetPdf || cl.practiceSheet || (cl.materials && cl.materials[1]?.url) || null,
                solutionSheetPdf: cl.solutionSheetPdf || cl.solutionSheet || (cl.materials && cl.materials[2]?.url) || null,
                markedBookPdf: cl.markedBookPdf || cl.markedBook || null,
                notes: cl.notes || [],
                materials: cl.materials || []
              };
            });

            // যদি চ্যাপ্টারের নাম ফাঁকা থাকে বা জেনেরিক থাকে (যেমন: "অধ্যায় 1", "Chapter 2", "টপিক ৩")
            let chapTitle = rawChapTitle;
            if (!chapTitle || isGenericChapterTitle(chapTitle)) {
              chapTitle = inferChapterTitleFromClasses(classes, cIdx + 1);
            }

            return {
              id: ch.id || `chap_${sIdx + 1}_${cIdx + 1}`,
              title: chapTitle,
              paperTag: ch.paperTag || null,
              classes
            };
          });
        }

        return {
          ...sub,
          id: sub.id || `sub_${sIdx + 1}`,
          title,
          chapters
        };
      });
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

      return Array.from(subMap.values()).map((sub, sIdx) => {
        const rawSubTitle = (sub.title || '').trim();
        const title = (rawSubTitle && !isGenericSubjectTitle(rawSubTitle))
          ? rawSubTitle
          : resolveSubjectTitle(sub.title, sub.chapters, sIdx + 1);
        return {
          ...sub,
          title
        };
      });
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
  
  const handleCopyBookmarklet = () => {
    try {
      navigator.clipboard.writeText(ACS_BOOKMARKLET_CODE);
      setCopiedBookmarklet(true);
      setTimeout(() => setCopiedBookmarklet(false), 3000);
    } catch (e) {}
  };

  const handleProcessPastedText = () => {
    if (!pastedChatText.trim()) {
      setErrorMsg('দয়া করে AyuGram বা টেলিগ্রাম থেকে কপি করা মেসেজের টেক্সট পেস্ট করুন');
      return;
    }
    try {
      setIsProcessingPaste(true);
      setErrorMsg(null);
      setImportSuccessMsg(null);
      const parsed = parsePastedTelegramText(pastedChatText, pastedSubjectChoice);
      setParsedData(parsed);
      setCustomCourseTitle(parsed.courseTitle || 'ACS Course');

      const subs = getNormalizedSubjects(parsed);
      const initialTopics: Record<string, boolean> = {};
      subs.forEach(s => {
        initialTopics[s.id] = !s.isIgnoredTopic;
      });
      setSelectedTopicIds(initialTopics);

      setActiveTab('hierarchy');

      const newExpanded: Record<string, boolean> = {};
      subs.forEach(s => {
        (s.chapters || []).forEach(ch => {
          newExpanded[ch.id] = true;
        });
      });
      setExpandedChapters(newExpanded);
      setPasteSuccessNotice(`🎉 সফলভাবে ${parsed.totalClasses} টি ক্লাস ও ${(parsed.subjects?.[0]?.chapters || []).length} টি অধ্যায় তৈরি হয়েছে!`);
      setTimeout(() => setPasteSuccessNotice(null), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || 'টেক্সট পার্স করতে সমস্যা হয়েছে');
    } finally {
      setIsProcessingPaste(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPastedChatText(text);
      } else {
        alert('ক্লিপবোর্ডে কোনো টেক্সট পাওয়া যায়নি! আগে টেলিগ্রাম থেকে মেসেজ কপি করুন।');
      }
    } catch {
      alert('ব্রাউজার ক্লিপবোর্ড পারমিশন দেয়নি! সরাসরি বক্সে Ctrl + V দিয়ে পেস্ট করুন।');
    }
  };

  const handleLoadAcs27Physics = async () => {
    try {
      const res = await fetch('/ACS27_Physics_1st_Paper_Full.json');
      const data = await res.json();
      setParsedData(data);
      setCustomCourseTitle(data.courseTitle || 'ACS 27 Physics Combo (1st Paper)');
      const subs = getNormalizedSubjects(data);
      const initialTopics: Record<string, boolean> = {};
      subs.forEach(s => { initialTopics[s.id] = true; });
      setSelectedTopicIds(initialTopics);
      setActiveTab('hierarchy');
      const newExpanded: Record<string, boolean> = {};
      subs.forEach(s => {
        (s.chapters || []).forEach(ch => { newExpanded[ch.id] = true; });
      });
      setExpandedChapters(newExpanded);
      setPasteSuccessNotice('🎉 ACS 27 Physics Combo (1st Paper) কোর্সের সব ৩টি অধ্যায় ও ৪২টি ক্লাস সফলভাবে লোড হয়েছে!');
      setTimeout(() => setPasteSuccessNotice(null), 6000);
    } catch (e: any) {
      setErrorMsg('কোর্স লোড করতে সমস্যা হয়েছে: ' + e.message);
    }
  };

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
        
        if (isTgDesktop && parsed.messages.length === 0) {
          setErrorMsg('⚠️ এই result.json ফাইলটিতে কোনো মেসেজ নেই (টেলিগ্রাম নতুন লগইনে ২৪ ঘণ্টার সিকিউরিটি লক দেয়)। কিন্তু চিন্তা নেই! AyuGram থেকে সরাসরি মেসেজ সিলেক্ট করে কপি (Ctrl+C) করুন এবং নিচের "AyuGram স্মার্ট টেক্সট পেস্ট" বক্সে পেস্ট (Ctrl+V) করলেই সাথে সাথে ৪২টি ক্লাস লোড হয়ে যাবে!');
          return;
        }

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

  const handleCopyTelegramProtectedCode = () => {
    try {
      navigator.clipboard.writeText(TELEGRAM_PROTECTED_SINGLE_CHANNEL_SCRAPER_CODE);
      setCopiedTgProtectedCode(true);
      setTimeout(() => setCopiedTgProtectedCode(false), 3000);
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

      // Only import subjects that are active/selected (use normalizedSubjects which has clean & rebalanced chapters)
      const activeSubs = (normalizedSubjects.length > 0 ? normalizedSubjects : (parsedData.subjects || [])).filter(s => selectedTopicIds[s.id] !== false);

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

  const handleDownloadCleanCourseJson = () => {
    if (!parsedData) return;
    try {
      const activeSubs = (normalizedSubjects.length > 0 ? normalizedSubjects : (parsedData.subjects || [])).filter(s => selectedTopicIds[s.id] !== false);
      if (activeSubs.length === 0) {
        alert('দয়া করে কমপক্ষে একটি বিষয় নির্বাচন করুন!');
        return;
      }

      const totalClassesCount = activeSubs.reduce((acc, s) => acc + (s.chapters?.reduce((cAcc, ch) => cAcc + (ch.classes?.length || 0), 0) || 0), 0);
      const title = customCourseTitle.trim() || parsedData.courseTitle || parsedData.title || parsedData.name || 'course';

      const exportPayload = {
        courseId: parsedData.courseId || `course_${Date.now()}`,
        courseTitle: title,
        title: title,
        name: title,
        source: parsedData.source || 'ADOMMO Smart Course Organizer',
        extractedAt: new Date().toISOString(),
        totalSubjects: activeSubs.length,
        totalClasses: totalClassesCount,
        subjects: activeSubs
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const cleanFileName = (title.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_') || 'adommo_course') + '.json';
      a.download = cleanFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err: any) {
      alert('JSON ফাইল ডাউনলোড করতে সমস্যা হয়েছে: ' + (err.message || 'ত্রুটি'));
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
{/* Top-level Mode Switcher: Course Scraper vs ACS Exam Scraper */}
        <div className="flex items-center gap-3 p-1.5 bg-[#161b22] rounded-2xl border border-slate-800 w-fit max-w-full overflow-x-auto shadow-md">
          <button
            type="button"
            onClick={() => setToolMode('course')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              toolMode === 'course'
                ? 'bg-gradient-to-r from-[#ff1361] to-[#ed347d] text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 কোর্স ক্লাস ও শিট এক্সট্রাক্টর</span>
          </button>

          <button
            type="button"
            onClick={() => setToolMode('exam')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              toolMode === 'exam'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>📝 ACS এক্সাম ও প্রশ্নপত্র এক্সট্রাক্টর</span>
          </button>

          <button
            type="button"
            onClick={() => setToolMode('details')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              toolMode === 'details'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>🔍 ACS কোর্স ডিটেইলস ও কপি টুল</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 animate-pulse">
              HOT ⭐
            </span>
          </button>
        </div>

        {toolMode === 'course' && (
          <div className="space-y-6">

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
                onClick={handleLoadAcs27Physics}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-emerald-500/30 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>⚡ ACS 27 ফিজিক্স (৪২টি ক্লাস) এখনই খুলুন</span>
              </button>

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

        {/* Success Notifications */}
        {pasteSuccessNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="font-bold">{pasteSuccessNotice}</span>
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

                <div className="flex items-center gap-2 bg-[#091424] p-1 rounded-2xl border border-sky-500/20 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setGuideTab('protected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      guideTab === 'protected'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>🔒 প্রটেক্টেড সিঙ্গেল চ্যানেল (No Export)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideTab('acs')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      guideTab === 'acs'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">🎓</span>
                    <span>১. ACS ওয়েবসাইট</span>
                  </button>

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
                    <span>২. টেলিগ্রাম ডেক্সটপ</span>
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
                    <span>৩. টেলিগ্রাম ওয়েব গ্রুপ</span>
                  </button>
                </div>
              </div>

              {/* Guide Content: Protected Single Channel Scraper */}
              {guideTab === 'protected' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                    <div className="space-y-1">
                      <strong className="text-white block font-bold">চ্যানেলে &quot;Restrict saving content&quot; অন থাকার কারণে ডেক্সটপ অ্যাপে Export Chat History কাজ করছে না?</strong>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        কোনো সমস্যা নেই! টেলিগ্রাম ওয়েবে (<a href="https://web.telegram.org/k/" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">web.telegram.org/k</a>) সব মেসেজ ব্রাউজারের DOM-এ সরাসরি উন্মুক্ত থাকে। নিচের কোডটি ১ ক্লিকে কপি করে ব্রাউজার কনসোলে পেস্ট করলেই সে ইনডেক্স, লেকচার, ইউটিউব ভিডিও ও ড্রাইভ স্লাইড/প্র্যাকটিস শিট একসাথে গুছিয়ে ডাউনলোড করে দেবে!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black">
                        ১
                      </div>
                      <h4 className="font-extrabold text-white">টেলিগ্রাম ওয়েব-K খুলুন</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        ক্রোমে <a href="https://web.telegram.org/k/" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-mono">web.telegram.org/k</a> ওপেন করে আপনার প্রাইভেট বা সুরক্ষিত চ্যানেলে যান।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-black">
                        ২
                      </div>
                      <h4 className="font-extrabold text-white">Console-এ পেস্ট করুন</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        কীবোর্ডে <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-pink-300 font-mono text-[10px]">F12</kbd> চেপে <strong>Console</strong> ট্যাবে যান। নিচের বাটন থেকে কোড কপি করে পেস্ট করে <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-pink-300 font-mono text-[10px]">Enter</kbd> চাপুন।
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#091424] border border-sky-500/20 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                        ৩
                      </div>
                      <h4 className="font-extrabold text-white">স্বয়ংক্রিয় JSON ডাউনলোড</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        স্ক্রিপ্টটি ইনডেক্স থেকে অধ্যায় মেলাবে, লেকচার ও প্র্যাকটিস শিট সাজাবে এবং <code className="text-pink-400">.json</code> ফাইল সেভ করবে। সেটি নিচে ড্রপ করলেই সম্পূর্ণ কোর্স রেডি!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#091424] via-[#0f243a] to-[#122e48] border border-emerald-500/40 shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>প্রটেক্টেড সিঙ্গেল চ্যানেল ও ইনডেক্স স্ক্র্যাপার কোড (v4)</span>
                        </h4>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          রেস্ট্রিকশন বাইপাস
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        সাপোর্ট করে: CHAPTER 01, LECTURE 01, SLIDE (ড্রাইভ লিংক), YOUTUBE এবং প্র্যাকটিস শিট পোস্ট
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTelegramProtectedCode}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0 ${
                        copiedTgProtectedCode
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
                      }`}
                    >
                      {copiedTgProtectedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedTgProtectedCode ? 'কোড সফলভাবে কপি হয়েছে!' : 'স্ক্রিপ্ট কপি করুন'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Guide Content: ACS Website Bookmarklet */}
              {guideTab === 'acs' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#091424] border border-pink-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <span>⭐ ১-ক্লিক বুকমার্কলেট (F12 ছাড়া ACS থেকে ডাউনলোড)</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            কপিরাইট সতর্কতা বাইপাস
                          </span>
                        </h4>
                        <p className="text-slate-300 text-xs mt-1">
                          ACS ওয়েবসাইটে F12 চাপলে যে &quot;কপিরাইট সতর্কতা&quot; পপ-আপ আসে, এই বুকমার্কলেট ব্যবহার করলে <strong>কোনো F12 বা Inspect খুলতেই হবে না!</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyBookmarklet}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0 ${
                          copiedBookmarklet
                            ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white active:scale-[0.98]'
                        }`}
                      >
                        {copiedBookmarklet ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        <span>{copiedBookmarklet ? '⭐ বুকমার্কলেট কোড কপি হয়েছে!' : '⭐ ১-ক্লিক বুকমার্কলেট কোড কপি করুন'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-black text-xs">
                          ১
                        </div>
                        <h5 className="font-bold text-white">কোডটি কপি করুন</h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          উপরের <strong>&quot;⭐ ১-ক্লিক বুকমার্কলেট কোড কপি করুন&quot;</strong> বাটনে চাপ দিন। কোড কপি হয়ে যাবে।
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                          ২
                        </div>
                        <h5 className="font-bold text-white">বুকমার্কে সেভ করুন</h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          ব্রাউজারের বুকমার্ক বারে (Ctrl+Shift+B) রাইট-ক্লিক করে <strong>Add page...</strong> দিন। Name দিন <strong className="text-pink-400">ACS Download</strong> এবং URL বক্সে কপি করা কোডটি পেস্ট করে Save দিন।
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                          ৩
                        </div>
                        <h5 className="font-bold text-white">ACS পেজে ক্লিক করুন!</h5>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          ACS কোর্সের পেজে যান (কোনো F12 চাপবেন না)। জাস্ট বুকমার্ক বারের <strong>ACS Download</strong>-এ ক্লিক করলেই চোখের পলকে JSON ফাইল ডাউনলোড হয়ে যাবে!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

            {/* Smart Direct Text Paste Zone (Bypasses 24h Telegram Export Lockout) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#121b2a] via-[#162238] to-[#0e1626] border-2 border-emerald-500/40 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-black text-xl shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        AyuGram বা টেলিগ্রাম থেকে সরাসরি টেক্সট পেস্ট (সবচেয়ে সহজ ও দ্রুততম উপায়)
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                        ইনস্ট্যান্ট • ২৪ ঘণ্টা অপেক্ষা করতে হবে না
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      AyuGram বা টেলিগ্রামে মেসেজগুলো সিলেক্ট ও কপি করে এখানে পেস্ট করলেই সাথে সাথে সব অধ্যায়, ক্লাস ও শিট স্বয়ংক্রিয়ভাবে সাজিয়ে দেওয়া হবে।
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>📋 ক্লিপবোর্ড থেকে পেস্ট</span>
                </button>
              </div>

              {/* Instructions Pill */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#0a121e] border border-emerald-500/20 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">১</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>AyuGram অ্যাপ খুলুন:</strong> চ্যানেলে মেসেজের ওপর Right Click করে <strong>&quot;Select Messages&quot;</strong> দিন।
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a121e] border border-emerald-500/20 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">২</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>সব মেসেজ সিলেক্ট:</strong> ১ম থেকে শেষ ক্লাস পর্যন্ত সিলেক্ট করে কিবোর্ডে <strong>Ctrl + C</strong> চাপুন (কপি হবে)।
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a121e] border border-emerald-500/20 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">৩</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>এখানে পেস্ট:</strong> নিচের বক্সে <strong>Ctrl + V</strong> চাপুন এবং <strong>&quot;স্মার্ট কোর্স ও ক্লাস সাজান&quot;</strong> বাটনে চাপ দিন।
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-3">
                <textarea
                  value={pastedChatText}
                  onChange={(e) => setPastedChatText(e.target.value)}
                  placeholder="AyuGram বা টেলিগ্রাম থেকে কপি করা সব মেসেজের টেক্সট এখানে পেস্ট করুন (Ctrl + V)..."
                  rows={6}
                  className="w-full bg-[#0a121e] border border-slate-700/80 rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors resize-y leading-relaxed"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-[#0a121e] border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
                      <span className="text-slate-400 font-medium">বিষয়:</span>
                      <select
                        value={pastedSubjectChoice}
                        onChange={(e) => setPastedSubjectChoice(e.target.value)}
                        className="bg-transparent text-emerald-300 font-semibold focus:outline-none cursor-pointer text-xs"
                      >
                        <option value="auto" className="bg-[#121b2a] text-slate-200">🤖 স্বয়ংক্রিয় শনাক্তকরণ (Auto Detect)</option>
                        <option value="math_1" className="bg-[#121b2a] text-slate-200">📐 উচ্চতর গণিত ১ম পত্র</option>
                        <option value="math_2" className="bg-[#121b2a] text-slate-200">📐 উচ্চতর গণিত ২য় পত্র</option>
                        <option value="physics_1" className="bg-[#121b2a] text-slate-200">⚛️ পদার্থবিজ্ঞান ১ম পত্র</option>
                        <option value="physics_2" className="bg-[#121b2a] text-slate-200">⚛️ পদার্থবিজ্ঞান ২য় পত্র</option>
                        <option value="chemistry_1" className="bg-[#121b2a] text-slate-200">🧪 রসায়ন ১ম পত্র</option>
                        <option value="chemistry_2" className="bg-[#121b2a] text-slate-200">🧪 রসায়ন ২য় পত্র</option>
                        <option value="biology_1" className="bg-[#121b2a] text-slate-200">🌿 জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)</option>
                        <option value="biology_2" className="bg-[#121b2a] text-slate-200">🐾 জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)</option>
                        <option value="ict" className="bg-[#121b2a] text-slate-200">💻 তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</option>
                      </select>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {pastedChatText.trim() ? (
                        <span className="text-emerald-300 font-medium">
                          ✓ {pastedChatText.length} অক্ষর পেস্ট করা হয়েছে
                        </span>
                      ) : (
                        <span>যেকোনো বিষয়ের এক বা একাধিক মেসেজ একসাথে পেস্ট করতে পারবেন</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {pastedChatText.trim() && (
                      <button
                        type="button"
                        onClick={() => setPastedChatText('')}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        মুছে ফেলুন
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleProcessPastedText}
                      disabled={isProcessingPaste || !pastedChatText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {isProcessingPaste ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>🚀 স্মার্ট কোর্স ও ক্লাস সাজান</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">অথবা JSON ফাইল ড্রপ করুন</span>
              <div className="h-px bg-slate-800 flex-1" />
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
                      onClick={handleDownloadCleanCourseJson}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                    >
                      <FileJson className="w-3.5 h-3.5" />
                      <span>📥 সম্পূর্ণ কোর্স JSON ডাউনলোড</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleImportToMainWebsite}
                      disabled={isImportingToSite}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                    >
                      {isImportingToSite ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>সেভ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                          <span>মেইন সাইটে ডিরেক্ট যোগ (অপশনাল)</span>
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

                      {selectedLesson.videoUrl || selectedLesson.videoId || selectedLesson.streamKey ? (
                        <div className="p-3 rounded-2xl bg-[#0d1117] border border-emerald-500/20 space-y-2">
                          <div className="text-[11px] font-mono text-slate-300 break-all">
                            {selectedLesson.videoUrl ? selectedLesson.videoUrl : selectedLesson.streamKey ? `Stream Key (${selectedLesson.platform || 'R2'}): ${selectedLesson.streamKey.slice(0, 45)}...` : `Video ID: ${selectedLesson.videoId}`}
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
                              onClick={() => copyToClipboard(selectedLesson.videoUrl || selectedLesson.streamKey || selectedLesson.videoId || '', 'video')}
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
        )}

        {/* ========================================================================= */}
        {/* ACS EXAM & QUESTION EXTRACTOR SECTION */}
        {/* ========================================================================= */}
        {toolMode === 'exam' && (
          <div className="space-y-6">
            {/* Exam Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#1e1533] to-[#121624] border border-purple-900/40 p-6 sm:p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ACS Exam Portal Automation (Zero-Loss v1)</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    <span>ACS এক্সাম ও প্রশ্নপত্র ডাউনলোডার</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      LIVE EXAM
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    <code className="text-purple-300 font-mono">https://exam.aparsclassroom.com/</code> এর যেকোনো লাইভ পরীক্ষা, প্র্যাকটিস এক্সাম, ফাইনাল মডেল টেস্ট অথবা রেজাল্ট পেজ থেকে ১-ক্লিকে সকল MCQ ও CQ প্রশ্নপত্র JSON আকারে ডাউনলোড করুন এবং প্রিভিউ দেখে সরাসরি আমাদের ওয়েবসাইটে লাইভ এক্সাম হিসেবে যুক্ত করুন।
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    ref={examFileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleExamFile(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => examFileInputRef.current?.click()}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-purple-500/20 cursor-pointer transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>এক্সাম JSON আপলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleExam}
                    className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span>ডেমো ACS এক্সাম দেখুন</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notification / Success / Error */}
            {examImportSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{examImportSuccessMsg}</span>
              </div>
            )}
            {examErrorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{examErrorMsg}</span>
              </div>
            )}

            {/* Master 1-Click Bookmarklet & Console Code Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#171329] via-[#1c1836] to-[#14182b] border border-purple-800/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>১-ক্লিক ACS এক্সাম স্ক্র্যাপার (Bookmarklet & Console)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        AUTOMATION TOOL
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      ACS এক্সাম পোর্টালে (পরীক্ষার স্ক্রিন বা রেজাল্ট পেজে) ১-ক্লিকেই সকল প্রশ্ন সহ JSON ডাউনলোড হয়ে যাবে
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyExamBookmarklet}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                      copiedExamBookmarklet
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white hover:opacity-95'
                    }`}
                  >
                    {copiedExamBookmarklet ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span>{copiedExamBookmarklet ? 'বুকমার্কলেট কপি হয়েছে!' : '⭐ ১-ক্লিক এক্সাম বুকমার্কলেট'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyExamConsole}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                      copiedExamConsole
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {copiedExamConsole ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedExamConsole ? 'কোড কপি হয়েছে!' : '📋 কনসোল কোড'}</span>
                  </button>
                </div>
              </div>

              {/* Step by step instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#0f121d]/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-[10px]">১</span>
                    <span>বুকমার্ক সংরক্ষণ</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ব্রাউজারের বুকমার্ক বারে রাইট ক্লিক করে <strong>Add bookmark</strong> দিন এবং URL বক্সে উপরের <strong>&quot;⭐ ১-ক্লিক এক্সাম বুকমার্কলেট&quot;</strong> পেস্ট করুন।
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0f121d]/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-pink-400/20 flex items-center justify-center text-[10px]">২</span>
                    <span>ACS এক্সাম পেজে ১-ক্লিক</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <code className="text-pink-300">exam.aparsclassroom.com</code> এ যেকোনো পরীক্ষা শুরু করার পর বা রেজাল্ট পেজে বুকমার্কে ক্লিক করুন — সাথে সাথে সম্পূর্ণ প্রশ্নপত্র ডাউনলোড হবে!
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0f121d]/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center text-[10px]">৩</span>
                    <span>টুলস পেজে প্রিভিউ ও লাইভ</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ডাউনলোড করা JSON ফাইলটি নিচের বক্সে আপলোড করুন। সকল প্রশ্ন, অপশন ও মার্কস পরীক্ষা করে ১-ক্লিকেই আপনার মেইন ওয়েবসাইটে যুক্ত করুন।
                  </p>
                </div>
              </div>
            </div>

            {/* If Exam Data is Loaded */}
            {parsedExamData ? (
              <div className="space-y-6">
                {/* Exam Metadata Summary Card */}
                <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-5 shadow-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {parsedExamData.subject || 'Bangla 1st Paper'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          MCQ & CQ COMBINED
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                          {parsedExamData.courseTitle || 'ACS Exam'}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        {parsedExamData.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleDownloadCleanExamJson}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-2 border border-slate-700 cursor-pointer transition-all"
                      >
                        <UploadCloud className="w-4 h-4 text-purple-400" />
                        <span>📥 ক্লিন এক্সাম JSON ডাউনলোড</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleImportExamToMainWebsite}
                        disabled={isImportingExamToSite}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:opacity-95 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {isImportingExamToSite ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>{isImportingExamToSite ? 'সংরক্ষণ হচ্ছে...' : '🚀 মেইন সাইটে এক্সাম হিসেবে সেভ করুন'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setParsedExamData(null);
                          setSelectedExamFile(null);
                        }}
                        className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        আরেকটি আপলোড
                      </button>
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
                        <FileQuestion className="w-3.5 h-3.5 text-purple-400" />
                        <span>মোট প্রশ্ন</span>
                      </div>
                      <div className="text-lg font-black text-white">
                        {parsedExamData.questions?.length || 0} টি MCQ
                        {parsedExamData.creativeQuestions?.length ? ` • ${parsedExamData.creativeQuestions.length} টি CQ` : ''}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>পূর্ণমান (Full Marks)</span>
                      </div>
                      <div className="text-lg font-black text-amber-400">
                        {parsedExamData.totalMarks || 100} নম্বর
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                        <span>সময় (Duration)</span>
                      </div>
                      <div className="text-lg font-black text-pink-400">
                        {parsedExamData.durationMinutes || 30} মিনিট
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>নেগেটিভ মার্কিং</span>
                      </div>
                      <div className="text-lg font-black text-rose-400">
                        -{parsedExamData.negativeMarkPerWrong || 0.25} (প্রতি ভুল)
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="প্রশ্ন দিয়ে সার্চ করুন..."
                        value={examSearchQuery}
                        onChange={(e) => setExamSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0d1117] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs text-slate-400 font-bold">বিষয়:</span>
                      <select
                        value={selectedExamSubject}
                        onChange={(e) => setSelectedExamSubject(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[#0d1117] border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="all">সকল বিষয় ({(parsedExamData.questions || []).length})</option>
                        {Array.from(new Set((parsedExamData.questions || []).map((q: any) => q.subject || 'General'))).map((sub: any) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>বহুনির্বাচনী প্রশ্নপত্র (MCQ Questions List)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300">
                      {(parsedExamData.questions || []).length} টি প্রশ্ন
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {(parsedExamData.questions || [])
                      .filter((q: any) => {
                        if (selectedExamSubject !== 'all' && q.subject !== selectedExamSubject) return false;
                        if (examSearchQuery && !q.text.toLowerCase().includes(examSearchQuery.toLowerCase())) return false;
                        return true;
                      })
                      .map((q: any, qIdx: number) => (
                        <div
                          key={q.id || qIdx}
                          className="p-5 rounded-2xl bg-[#161b22] border border-slate-800 hover:border-purple-800/60 transition-all space-y-3 shadow-md"
                        >
                          {/* Question Header */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-black">
                                Ques: {q.questionNo || qIdx + 1}
                              </span>
                              {q.subject && (
                                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold">
                                  {q.subject}
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] font-bold text-slate-500">
                              ১.০ মার্ক • নেগেটিভ ০.২৫
                            </span>
                          </div>

                          {/* Question Text */}
                          <h4 className="text-sm font-bold text-white leading-relaxed">
                            {q.text}
                          </h4>

                          {/* Options Grid (4 options) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {(q.options || []).map((opt: string, optIdx: number) => {
                              const letters = ['A', 'B', 'C', 'D'];
                              const isCorrect = q.correctOption === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-3 rounded-xl border flex items-center gap-3 text-xs transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
                                      : 'bg-[#0d1117] border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                      isCorrect
                                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                                  >
                                    {letters[optIdx] || optIdx + 1}
                                  </span>
                                  <span className="flex-1 leading-snug">{opt}</span>
                                  {isCorrect && (
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
                                      সঠিক উত্তর
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation if available */}
                          {q.explanation && (
                            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs text-purple-200/90 leading-relaxed">
                              <span className="font-black text-purple-300 block mb-0.5">💡 ব্যাখ্যা / সমাধান:</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Creative Questions (CQ) if available */}
                {parsedExamData.creativeQuestions && parsedExamData.creativeQuestions.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>সৃজনশীল প্রশ্নপত্র (Creative Written Questions)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300">
                        {parsedExamData.creativeQuestions.length} টি সৃজনশীল
                      </span>
                    </h3>

                    <div className="space-y-4">
                      {parsedExamData.creativeQuestions.map((cq: any, cqIdx: number) => (
                        <div
                          key={cq.id || cqIdx}
                          className="p-5 rounded-2xl bg-[#161b22] border border-slate-800 space-y-4 shadow-md"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="font-extrabold text-amber-400 text-sm">
                              {cq.title || `সৃজনশীল প্রশ্ন ০${cqIdx + 1}`}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              পূর্ণমান: ১০
                            </span>
                          </div>

                          {/* Stem / দৃশ্যকল্প */}
                          <div className="p-4 rounded-xl bg-[#0d1117] border border-slate-800/80 text-xs leading-relaxed text-slate-200">
                            <strong className="text-purple-400 block mb-1">উদ্দীপক / দৃশ্যকল্প:</strong>
                            {cq.stem}
                          </div>

                          {/* Sub Questions (ক, খ, গ, ঘ) */}
                          <div className="space-y-2">
                            {(cq.subQuestions || []).map((subQ: any, sIdx: number) => (
                              <div
                                key={sIdx}
                                className="p-3 rounded-xl bg-[#0d1117]/60 border border-slate-800/60 flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                                      {subQ.part}
                                    </span>
                                    <span className="text-white font-medium">{subQ.text}</span>
                                  </div>
                                  {subQ.sampleAnswer && (
                                    <div className="text-[11px] text-slate-400 pl-7">
                                      <span className="text-emerald-400 font-bold">নমুনা উত্তর: </span>
                                      {subQ.sampleAnswer}
                                    </div>
                                  )}
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold shrink-0">
                                  {subQ.marks} নম্বর
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Dropzone when no exam is loaded */
              <div
                onClick={() => examFileInputRef.current?.click()}
                className="p-12 rounded-3xl border-2 border-dashed border-purple-800/40 hover:border-purple-500 bg-[#161b22]/50 hover:bg-purple-950/10 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer text-center group shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 flex items-center justify-center transition-transform group-hover:scale-110">
                  <FileQuestion className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">
                  ACS এক্সাম JSON ফাইলটি ড্র্যাগ করে এখানে ছাড়ুন
                </h3>
                <p className="text-xs text-slate-400 max-w-md">
                  অথবা ব্রাউজ করতে এখানে ক্লিক করুন। যেকোনো ACS Live Exam, Practice Exam বা Model Test এর ডাউনলোড করা JSON ফাইল সাপোর্ট করে।
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleExam();
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  📋 অথবা ডেমো ACS এক্সাম প্রিভিউ লোড করুন
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACS COURSE DETAILS & DIRECT COPY TOOL SECTION */}
        {/* ========================================================================= */}
        {toolMode === 'details' && (
          <div className="space-y-6">
            {/* Details Extractor Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#132724] to-[#121624] border border-emerald-900/40 p-6 sm:p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ACS Shop & Course Details Extractor</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    <span>ACS কোর্স ডিটেইলস ও কপি টুল</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      COPY UNLOCKED
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Apar&apos;s Classroom বা যেকোনো ACS কোর্স পেজে কপি ও রাইট-ক্লিক ব্লক করা থাকে। নিচের বক্সে শুধু কোর্সের লিংক পেস্ট করুন — স্বয়ংক্রিয়ভাবে টাইটেল, ফি (রেগুলার ও ডিসকাউন্ট), কভার ব্যানার, ডেসক্রিপশন, রুটিন এবং FAQ এক ক্লিকে কপি উপযোগী আকারে চলে আসবে!
                  </p>
                </div>

                {/* Direct 1-Click Bookmarklet Unlocker */}
                <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
                  <button
                    type="button"
                    onClick={handleCopyUnlockerBookmarklet}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all border border-emerald-400/30"
                  >
                    {copiedUnlockerBookmarklet ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>বুকমার্কলেট কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-emerald-200" />
                        <span>⭐ ১-ক্লিক কপি আনলকার বুকমার্কলেট</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400 text-center sm:text-right">
                    💡 ব্রাউজার বুকমার্কে সেভ করে যেকোনো ACS পেজে ১-ক্লিকে কপি আনলক করুন
                  </span>
                </div>
              </div>
            </div>

            {/* URL Input Form Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#161b22] border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  <span>ACS কোর্স পেজের লিংক (URL) দিন</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type="url"
                      value={detailsUrl}
                      onChange={(e) => setDetailsUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExtractCourseDetails();
                      }}
                      placeholder="যেমন: https://aparsclassroom.com/shop/FRB26/"
                      className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-[#0d1117] border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none font-mono"
                    />
                    <Globe className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    disabled={isExtractingDetails}
                    onClick={() => handleExtractCourseDetails()}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/20 shrink-0"
                  >
                    {isExtractingDetails ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>তথ্য আনা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>🚀 কোর্স তথ্য এক্সট্র্যাক্ট করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Quick Links */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium">ডেমো ট্রাই করুন:</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = 'https://aparsclassroom.com/shop/FRB26/';
                    setDetailsUrl(sample);
                    handleExtractCourseDetails(sample);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/20 transition-all cursor-pointer"
                >
                  FRB 26 (HSC 26)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = 'https://aparsclassroom.com/shop/ACS-HSC-26-Cycle-01/';
                    setDetailsUrl(sample);
                    handleExtractCourseDetails(sample);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-mono border border-teal-500/20 transition-all cursor-pointer"
                >
                  HSC 26 Cycle 1
                </button>
              </div>

              {detailsErrorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{detailsErrorMsg}</span>
                </div>
              )}
            </div>

            {/* Extracted Details Results View */}
            {extractedDetails && (
              <div className="space-y-6">
                {/* Overview Header & Copy All */}
                <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      সফলভাবে এক্সট্র্যাক্ট করা হয়েছে
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-white mt-2">
                      {extractedDetails.courseTitle}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1 break-all">
                      {extractedDetails.sourceUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const allContent = `【কোর্সের নাম】\n${extractedDetails.courseTitle}\n\n【কোর্স ফি】\nরেগুলার ফি: ৳${extractedDetails.regularPrice || 0}\nঅফার ফি: ৳${extractedDetails.offerPrice || 0}\nডিসকাউন্ট: ${extractedDetails.discountPercentage || 0}%\n\n【ব্যানার লিংক】\n${extractedDetails.bannerImage || 'নেই'}\n\n【রুটিন ও ড্রাইভ】\n${(extractedDetails.routines || []).join('\n')}\n\n【কোর্স ডেসক্রিপশন】\n${extractedDetails.description || ''}\n\n【কোর্স ফিচারসমূহ】\n${(extractedDetails.features || []).map((f: string) => '• ' + f).join('\n')}`;
                        handleCopyDetailText(allContent, 'all_details');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                    >
                      {copiedDetailKey === 'all_details' ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>সব কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>📋 সম্পূর্ণ তথ্য ১-ক্লিকে কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Grid of Course Detail Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Pricing & Info */}
                  <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Tag className="w-4 h-4 text-emerald-400" />
                        <span>কোর্স ফি ও কোড</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const pText = `রেগুলার: ৳${extractedDetails.regularPrice}, অফার: ৳${extractedDetails.offerPrice}`;
                          handleCopyDetailText(pText, 'pricing');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {copiedDetailKey === 'pricing' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDetailKey === 'pricing' ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0d1117] border border-slate-800/80">
                        <span className="text-xs text-slate-400">রেগুলার ফি:</span>
                        <span className="text-sm font-bold text-slate-300 line-through">
                          ৳{extractedDetails.regularPrice ? Number(extractedDetails.regularPrice).toLocaleString() : '0'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs font-bold text-emerald-300">অফার প্রাইস:</span>
                        <span className="text-lg font-black text-emerald-400">
                          ৳{extractedDetails.offerPrice ? Number(extractedDetails.offerPrice).toLocaleString() : '0'}
                        </span>
                      </div>

                      {extractedDetails.discountPercentage > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-bold text-amber-300">
                          🎉 {extractedDetails.discountPercentage}% স্পেশাল ডিসকাউন্ট
                        </div>
                      )}

                      {extractedDetails.productCode && (
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                          <span>প্রোডাক্ট কোড:</span>
                          <span className="font-mono text-slate-200">{extractedDetails.productCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Course Banner Image */}
                  <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl md:col-span-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>কোর্স ব্যানার ছবি</span>
                      </div>
                      {extractedDetails.bannerImage && (
                        <button
                          type="button"
                          onClick={() => handleCopyDetailText(extractedDetails.bannerImage, 'banner')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          {copiedDetailKey === 'banner' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedDetailKey === 'banner' ? 'লিংক কপি হয়েছে' : 'লিংক কপি'}</span>
                        </button>
                      )}
                    </div>

                    {extractedDetails.bannerImage ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800 group bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={extractedDetails.bannerImage}
                          alt={extractedDetails.courseTitle}
                          className="w-full max-h-56 object-cover"
                          crossOrigin="anonymous"
                        />
                        <div className="p-3 bg-[#0d1117]/90 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
                            {extractedDetails.bannerImage}
                          </span>
                          <a
                            href={extractedDetails.bannerImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/30 transition-all shrink-0"
                          >
                            <span>ওপেন</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                        কোর্সের ব্যানার ছবি শনাক্ত করা যায়নি
                      </div>
                    )}
                  </div>
                </div>

                {/* Routines & Drive Spreadsheets */}
                {extractedDetails.routines && extractedDetails.routines.length > 0 && (
                  <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>কোর্স রুটিন ও গুগল ড্রাইভ লিংক ({extractedDetails.routines.length} টি)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyDetailText(extractedDetails.routines.join('\n'), 'routines')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {copiedDetailKey === 'routines' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDetailKey === 'routines' ? 'কপি হয়েছে' : 'সব লিংক কপি'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {extractedDetails.routines.map((link: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 font-mono truncate">{link}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyDetailText(link, `routine_${idx}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                              title="লিংক কপি"
                            >
                              {copiedDetailKey === `routine_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all"
                              title="নতুন ট্যাবে ওপেন"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Description & Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bengali Description */}
                  <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Edit3 className="w-4 h-4 text-emerald-400" />
                        <span>কোর্স বিবরণী (Description)</span>
                      </div>
                      {extractedDetails.description && (
                        <button
                          type="button"
                          onClick={() => handleCopyDetailText(extractedDetails.description, 'description')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          {copiedDetailKey === 'description' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedDetailKey === 'description' ? 'কপি হয়েছে' : 'ডেসক্রিপশন কপি'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 p-4 rounded-2xl bg-[#0d1117] border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre-line select-text scrollbar-thin">
                      {extractedDetails.description || 'কোনো ডেসক্রিপশন পাওয়া যায়নি।'}
                    </div>
                  </div>

                  {/* Course Features / Highlights */}
                  <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>কোর্স ফিচারসমূহ (Features)</span>
                      </div>
                      {extractedDetails.features && extractedDetails.features.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const featText = extractedDetails.features.map((f: string) => '• ' + f).join('\n');
                            handleCopyDetailText(featText, 'features');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          {copiedDetailKey === 'features' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedDetailKey === 'features' ? 'কপি হয়েছে' : 'ফিচার কপি'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2.5 max-h-[380px] overflow-y-auto select-text scrollbar-thin">
                      {extractedDetails.features && extractedDetails.features.length > 0 ? (
                        extractedDetails.features.map((feat: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feat}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">কোনো ফিচার শনাক্ত হয়নি।</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* FAQs Section if exists */}
                {extractedDetails.faqs && extractedDetails.faqs.length > 0 && (
                  <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <HelpCircle className="w-4 h-4 text-emerald-400" />
                        <span>সচরাচর জিজ্ঞাসা ও প্রশ্নোত্তর (FAQs)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const faqText = extractedDetails.faqs.map((faq: any) => `প্রশ্ন: ${faq.question}\nউত্তর: ${faq.answer}`).join('\n\n');
                          handleCopyDetailText(faqText, 'faqs');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {copiedDetailKey === 'faqs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDetailKey === 'faqs' ? 'কপি হয়েছে' : 'সব FAQ কপি'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {extractedDetails.faqs.map((faq: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2 select-text">
                          <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-300">
                            <span>❓ {faq.question}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyDetailText(`প্রশ্ন: ${faq.question}\nউত্তর: ${faq.answer}`, `faq_${idx}`)}
                              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 shrink-0 cursor-pointer"
                            >
                              {copiedDetailKey === `faq_${idx}` ? 'কপি হয়েছে' : 'কপি'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed pl-5">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bookmarklet Explanation Guide Box */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161b22] to-[#111827] border border-emerald-500/20 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <MousePointerClick className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        বিকল্প সহজ উপায়: সরাসরি Apar&apos;s Classroom পেজে কপি আনলক করবেন কীভাবে?
                      </h4>
                      <p className="text-xs text-slate-400">
                        এই বুকমার্কলেট ব্যবহার করলে ব্রাউজারের বুকমার্ক বারে ১-ক্লিকেই যেকোনো ব্লক পেজের টেক্সট আনলক হয়ে যাবে:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 pt-2">
                    <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-400">১. বুকমার্ক তৈরি:</span>
                      <p className="leading-relaxed">
                        ব্রাউজারের বুকমার্ক বারে রাইট ক্লিক করে &quot;Add Page&quot; বা &quot;Add bookmark&quot; দিন এবং নামের জায়গায় লিখুন <strong>&quot;🔓 Unlock Copy&quot;</strong>।
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-400">২. কোড পেস্ট:</span>
                      <p className="leading-relaxed">
                        URL বক্সে উপরের <strong>&quot;⭐ ১-ক্লিক কপি আনলকার বুকমার্কলেট&quot;</strong> বাটনে ক্লিক করে কপি করা কোডটি পেস্ট করে Save দিন।
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-400">৩. যেকোনো সময় ১-ক্লিক:</span>
                      <p className="leading-relaxed">
                        এখন যেকোনো ACS কোর্স পেজে গিয়ে বুকমার্কে ক্লিক করলেই সাথে সাথে ব্লক উঠে যাবে এবং মাউস দিয়ে টেনে সব টেক্সট কপি করা যাবে!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}


