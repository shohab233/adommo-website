'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  Layers, 
  FileText, 
  Video, 
  Archive,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Code,
  Copy,
  Check,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { Course } from '@/types';
import Link from 'next/link';
import { healCourse } from '@/lib/courseSubjectNormalizer';

interface CourseJsonUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditCourse?: (course: Course) => void;
}

const ACS_MASTER_DOWNLOADER_CODE = "/**\n * ADOMMO (অদম্য) — Universal ACS Multi-Subdomain Course & Archive Scraper\n * \n * সাপোর্ট করে:\n * - সকল ACS সাবডোমেন: engineering.aparsclassroom.com, frb.aparsclassroom.com, varsity.aparsclassroom.com, ইত্যাদি\n * - স্বয়ংক্রিয় API Base URL ডিটেকশন (api.varsity, api.engineering, api.aparsclassroom ইত্যাদি)\n * - নিখুঁত টাইটেল ডিটেকশন (name, subjectName, courseSubjectName, chapterName ইত্যাদি যা আগে null আসতো)\n * - YouTube (premyt / 11-char ID) এবং BunnyCDN ক্লাউড স্ট্রিম\n * - Google Drive লেকচার শিট, প্র্যাকটিস শিট ও সল্যুশন বুকলেট\n * - স্বয়ংক্রিয় আর্কাইভ ব্যাচ ডিটেকশন ও ফুল এক্সট্র্যাক্ট\n */\n\n(async function universalACSExtractor() {\n  console.clear();\n  console.log(\"%c🚀 ADOMMO — Universal ACS Multi-Subdomain Scraper শুরু হচ্ছে...\", \"color: #00c269; font-size: 16px; font-weight: bold;\");\n\n  // ১. স্বয়ংক্রিয়ভাবে JWT টোকেন শনাক্ত করা\n  let token = '';\n  let tokenSource = '';\n\n  for (let i = 0; i < localStorage.length; i++) {\n    const key = localStorage.key(i);\n    const val = localStorage.getItem(key) || '';\n    const match = val.match(/ey[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*/);\n    if (match) {\n      token = match[0];\n      tokenSource = `localStorage [${key}]`;\n      break;\n    }\n  }\n\n  if (!token) {\n    for (let i = 0; i < sessionStorage.length; i++) {\n      const key = sessionStorage.key(i);\n      const val = sessionStorage.getItem(key) || '';\n      const match = val.match(/ey[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*/);\n      if (match) {\n        token = match[0];\n        tokenSource = `sessionStorage [${key}]`;\n        break;\n      }\n    }\n  }\n\n  if (!token) {\n    const cookieMatch = document.cookie.match(/(?:token|access_token|jwt)=([^;]+)/i);\n    if (cookieMatch) {\n      token = cookieMatch[1];\n      tokenSource = 'Cookies';\n    }\n  }\n\n  console.log(token ? `🔑 অথেনটিকেশন টোকেন পাওয়া গেছে (${tokenSource})!` : `⚠️ সরাসরি টোকেন পাওয়া যায়নি, কুকি দিয়ে চেষ্টা করা হবে।`);\n\n  // ২. সাবডোমেন অনুযায়ী আসল API Base URL শনাক্ত করা\n  let API_BASE = '';\n  try {\n    const apiResources = performance.getEntriesByType('resource')\n      .map(r => r.name)\n      .filter(n => n.includes('/api/'));\n    const detected = apiResources.find(n => n.includes('/api/v1/'));\n    if (detected) {\n      const m = detected.match(/(https?:\\/\\/[^\\/]+\\/api\\/v1)/);\n      if (m) API_BASE = m[1];\n    }\n  } catch (e) {}\n\n  // যদি নেটওয়ার্ক রিসোর্স থেকে না পায়, সাবডোমেন দিয়ে অটো সিলেক্ট\n  if (!API_BASE) {\n    const host = location.hostname.toLowerCase();\n    if (host.includes('engineering')) {\n      API_BASE = 'https://api.engineering.aparsclassroom.com/api/v1';\n    } else if (host.includes('admission')) {\n      API_BASE = 'https://api.varsity.aparsclassroom.com/api/v1';\n    } else if (host.includes('varsity') || host.includes('frb')) {\n      API_BASE = 'https://api.varsity.aparsclassroom.com/api/v1';\n    } else if (host.includes('medical')) {\n      API_BASE = 'https://api.medical.aparsclassroom.com/api/v1';\n    } else {\n      API_BASE = 'https://api.varsity.aparsclassroom.com/api/v1';\n    }\n  }\n\n  console.log(`🌐 শনাক্তকৃত API এন্ডপয়েন্ট: ${API_BASE}`);\n\n  // ৩. মেইন কোর্স আইডি শনাক্ত করা\n  const urlMatch = location.href.match(/course\\/([a-zA-Z0-9-]+)/i) || \n                   location.href.match(/shop\\/([a-zA-Z0-9-]+)/i);\n  let defaultCourse = urlMatch ? urlMatch[1] : '';\n  \n  let courseInput = prompt(\"কোর্স আইডি বা কোর্স লিংক দিন:\", defaultCourse);\n  if (!courseInput) return;\n  const courseIdMatch = courseInput.trim().match(/(?:course|shop)\\/([^\\/?#]+)/i);\n  const courseId = courseIdMatch ? courseIdMatch[1] : courseInput.trim();\n\n  // ৪. পেজ থেকে আর্কাইভ (Archive) কার্ড শনাক্ত করা\n  let detectedArchiveId = '';\n  try {\n    const allLinks = Array.from(document.querySelectorAll('a[href*=\"/course/\"], a[href*=\"/shop/\"]'));\n    const archiveLink = allLinks.find(a => \n      /archive|আর্কাইভ|previous|পূর্ব|পুর্ব/i.test(a.textContent || '') || \n      /archive|previous/i.test(a.getAttribute('href') || '')\n    );\n\n    if (archiveLink) {\n      const m = (archiveLink.getAttribute('href') || '').match(/(?:course|shop)\\/([a-zA-Z0-9-]+)/i);\n      if (m && m[1] !== courseId) {\n        detectedArchiveId = m[1];\n      }\n    }\n  } catch (e) {}\n\n  if (!detectedArchiveId && (courseId.includes('c82195b9') || location.href.toLowerCase().includes('frb'))) {\n    detectedArchiveId = '52acc196-55a7-4499-9ca2-dc44ccab3568';\n  }\n\n  let archiveInput = prompt(\n    \"আর্কাইভ ব্যাচের কোর্স আইডি বা লিংক:\\\\n(পেজে পাওয়া আইডি নিচে দেয়া হয়েছে। আর্কাইভ নিতে চাইলে OK দিন, না থাকলে ফাঁকা রাখুন):\", \n    detectedArchiveId\n  );\n  let archiveCourseId = '';\n  if (archiveInput && archiveInput.trim()) {\n    const m = archiveInput.trim().match(/(?:course|shop)\\/([a-zA-Z0-9-]+)/i);\n    archiveCourseId = m ? m[1] : archiveInput.trim();\n  }\n\n  const headers = {\n    'accept': 'application/json, text/plain, */*',\n    'x-access-token': token,\n    'authorization': token ? `Bearer ${token}` : ''\n  };\n\n  console.log(`📦 কোর্স আইডি: ${courseId}`);\n  if (archiveCourseId) {\n    console.log(`🗄️ আর্কাইভ কোর্স আইডি: ${archiveCourseId}`);\n  }\n\n  let courseTitle = '';\n  try {\n    const cRes = await fetch(`${API_BASE}/course/${courseId}`, { headers, credentials: 'include' });\n    const cJson = await cRes.json();\n    if (cJson.data?.title || cJson.data?.name) {\n      courseTitle = cJson.data.title || cJson.data.name;\n    }\n  } catch(e) {}\n\n  if (!courseTitle) {\n    try {\n      const h1 = document.querySelector('h1')?.textContent?.trim();\n      if (h1 && h1.length > 2 && !/apars|dashboard|login|welcome/i.test(h1)) {\n        courseTitle = h1;\n      }\n    } catch (e) {}\n  }\n\n  if (!courseTitle || courseTitle === 'ACS Admission Special Private Programme') {\n    const docTitle = document.title?.trim();\n    if (docTitle && !/apars\\s*classroom/i.test(docTitle)) {\n      courseTitle = docTitle;\n    }\n  }\n\n  if (!courseTitle) {\n    const userTitle = prompt(\"কোর্সের নাম নিশ্চিত করুন:\", \"ACS Course\");\n    courseTitle = userTitle?.trim() || \"ACS Course\";\n  }\n\n  function formatDrivePdf(val) {\n    if (!val) return null;\n    if (typeof val === 'string' && val.startsWith('http')) return val;\n    return `https://drive.google.com/file/d/${val}/view`;\n  }\n\n  // হেল্পার ফাংশন: কোর্স স্ট্রাকচার স্ক্র্যাপ\n  async function scrapeCourseStructure(cId, isArchive = false) {\n    const label = isArchive ? \"🗄️ আর্কাইভ\" : \"📚 মেইন\";\n    console.log(`${label} কোর্স ডেটা ফেচ করা হচ্ছে... [ID: ${cId}]`);\n\n    const subRes = await fetch(`${API_BASE}/course-subject/subjects/${cId}?limit=100`, { \n      headers, \n      credentials: 'include' \n    });\n    const subJson = await subRes.json();\n    const rawSubjects = subJson.data || [];\n\n    if (!rawSubjects.length) {\n      console.warn(`⚠️ ${label} কোর্সে কোনো বিষয় পাওয়া যায়নি!`);\n      return { subjects: [], totalClasses: 0 };\n    }\n\n    console.log(`%c✅ ${label} কোর্সে ${rawSubjects.length} টি বিষয় পাওয়া গেছে!`, \"color: #00c269; font-weight: bold;\");\n\n    const formattedSubjects = [];\n    let classesCount = 0;\n\n    for (let sIdx = 0; sIdx < rawSubjects.length; sIdx++) {\n      const sub = rawSubjects[sIdx];\n      // গভীর টাইটেল ডিটেকশন (Engineering ও অন্যান্য সাবডোমেনের ভিন্ন ভিন্ন ফিল্ড নাম হ্যান্ডলিং)\n      const subTitle = sub.title || sub.name || sub.subjectName || sub.courseSubject?.title || sub.courseSubjectName || `বিষয় ${sIdx + 1}`;\n      console.log(`👉 [${sIdx + 1}/${rawSubjects.length}] বিষয়: ${subTitle}`);\n\n      const chapRes = await fetch(`${API_BASE}/course/subject/chapter/course-subject/${sub.id}?courseSubjectId=${sub.id}&limit=1000`, { \n        headers, \n        credentials: 'include' \n      });\n      const chapJson = await chapRes.json();\n      const rawChapters = chapJson.data || [];\n\n      const isBangla = /বাংলা|bangla/i.test(subTitle);\n      const isEnglish = /english|ইংরেজি/i.test(subTitle);\n\n      const subjectObj = {\n        id: sub.id,\n        title: subTitle,\n        isArchive: isArchive,\n        isMultiPaper: (isBangla || isEnglish) && rawChapters.length >= 2,\n        chapters: []\n      };\n\n      for (let cIdx = 0; cIdx < rawChapters.length; cIdx++) {\n        const ch = rawChapters[cIdx];\n        const chapTitle = ch.title || ch.name || ch.chapterName || ch.courseSubjectChapterName || `অধ্যায় ${cIdx + 1}`;\n\n        let paperTag = '';\n        if (isBangla) {\n          paperTag = cIdx === 0 ? 'বাংলা ১ম পত্র (সাহিত্য)' : 'বাংলা ২য় পত্র (ব্যাকরণ)';\n        } else if (isEnglish) {\n          paperTag = cIdx === 0 ? 'English 1st Paper' : 'English 2nd Paper';\n        }\n\n        try {\n          const classRes = await fetch(`${API_BASE}/class/all/videos/${ch.id}?limit=1000`, { \n            headers, \n            credentials: 'include' \n          });\n          const classJson = await classRes.json();\n          const rawClasses = classJson.data || [];\n\n          const classes = rawClasses.map((cl, i) => {\n            classesCount++;\n            return {\n              id: cl.id,\n              classNo: cl.classNo || (i + 1).toString(),\n              title: cl.classTitle || cl.title || cl.description || `Class ${i + 1}: ${chapTitle}`,\n              description: cl.description || '',\n              instructor: cl.instructor || cl.instructorName || 'ACS Instructor',\n              hostingType: cl.hostingType || '',\n              videoId: cl.videoId || '',\n              videoUrl: cl.videoUrl || '',\n              hlsPlaylistUrl: cl.hlsPlaylistUrl || null,\n              iframePlayerUrl: cl.iframePlayerUrl || null,\n              libraryId: cl.libraryId || '610687',\n              lectureSheetPdf: formatDrivePdf(cl.lectureSheet || cl.lectureSheetPdf),\n              practiceSheetPdf: formatDrivePdf(cl.practiceSheet || cl.practiceSheetPdf),\n              solutionSheetPdf: formatDrivePdf(cl.solutionSheet || cl.solutionSheetPdf),\n              markedBookPdf: formatDrivePdf(cl.markedBook || cl.markedBookPdf),\n              paperTag: paperTag || null\n            };\n          });\n\n          subjectObj.chapters.push({\n            id: ch.id,\n            title: chapTitle,\n            paperTag: paperTag || null,\n            classes\n          });\n        } catch(cErr) {\n          // ফাঁকা অধ্যায় বা যেগুলোতে ক্লাস হয়নি, সেগুলোকে ফাঁকা অ্যারে দিয়ে সংরক্ষণ করা যাতে পরে আপডেট হলে নেওয়া যায়\n          subjectObj.chapters.push({\n            id: ch.id,\n            title: chapTitle,\n            paperTag: paperTag || null,\n            classes: []\n          });\n        }\n      }\n\n      formattedSubjects.push(subjectObj);\n    }\n\n    return { subjects: formattedSubjects, totalClasses: classesCount };\n  }\n\n  try {\n    console.log(\"১ম ধাপ: কোর্সের ক্লাস সংগ্রহ শুরু হচ্ছে...\");\n    const mainData = await scrapeCourseStructure(courseId, false);\n\n    const fullCourseData = {\n      courseId,\n      courseTitle,\n      extractedAt: new Date().toISOString(),\n      apiBaseUsed: API_BASE,\n      subdomain: location.hostname,\n      totalSubjects: mainData.subjects.length,\n      totalClasses: mainData.totalClasses,\n      subjects: mainData.subjects\n    };\n\n    if (archiveCourseId) {\n      console.log(\"২য় ধাপ: আর্কাইভ কোর্সের ক্লাস সংগ্রহ শুরু হচ্ছে...\");\n      let archiveTitle = \"আর্কাইভ ব্যাচ (Previous Batch Archive)\";\n      try {\n        const aRes = await fetch(`${API_BASE}/course/${archiveCourseId}`, { headers, credentials: 'include' });\n        const aJson = await aRes.json();\n        if (aJson.data?.title || aJson.data?.name) {\n          archiveTitle = `আর্কাইভ: ${aJson.data.title || aJson.data.name}`;\n        }\n      } catch (e) {}\n\n      const archiveData = await scrapeCourseStructure(archiveCourseId, true);\n      fullCourseData.archive = {\n        courseId: archiveCourseId,\n        title: archiveTitle,\n        totalSubjects: archiveData.subjects.length,\n        totalClasses: archiveData.totalClasses,\n        subjects: archiveData.subjects\n      };\n\n      console.log(`%c🗄️ আর্কাইভ সফলভাবে এক্সট্র্যাক্ট হয়েছে! (${archiveData.totalClasses} টি ক্লাস)`, \"color: #eab308; font-weight: bold;\");\n    }\n\n    const totalCombinedClasses = fullCourseData.totalClasses + (fullCourseData.archive?.totalClasses || 0);\n    const blob = new Blob([JSON.stringify(fullCourseData, null, 2)], { type: 'application/json' });\n    const a = document.createElement('a');\n    a.href = URL.createObjectURL(blob);\n    const cleanName = (courseTitle.replace(/[^a-zA-Z0-9\\u0980-\\u09FF]/g, '_') || 'course') + '.json';\n    a.download = cleanName;\n    document.body.appendChild(a);\n    a.click();\n    document.body.removeChild(a);\n\n    alert(`🎉 সম্পূর্ণ কোর্স সফলভাবে এক্সপোর্ট হয়েছে!\\\\n\\\\n📌 মেইন ক্লাস: ${fullCourseData.totalClasses} টি\\\\n📌 আর্কাইভ ক্লাস: ${fullCourseData.archive?.totalClasses || 0} টি\\\\n📌 সর্বমোট ক্লাস: ${totalCombinedClasses} টি\\\\n\\\\nফাইল (${cleanName}) ডাউনলোড হয়েছে। এবার এটি আমাদের ওয়েবসাইটে আপলোড করুন।`);\n\n    console.log(\"=========================================\");\n    console.log(`%c🎉 সম্পূর্ণ কোর্স সফলভাবে এক্সপোর্ট হয়েছে!`, \"color: #00c269; font-size: 18px; font-weight: bold;\");\n    console.log(`📌 মেইন ক্লাস: ${fullCourseData.totalClasses} টি`);\n    if (fullCourseData.archive) {\n      console.log(`📌 আর্কাইভ ক্লাস: ${fullCourseData.archive.totalClasses} টি`);\n    }\n    console.log(`📌 সর্বমোট ক্লাস: ${totalCombinedClasses} টি`);\n    console.log(`📁 ফাইলটি ডাউনলোড হয়েছে: ${cleanName}`);\n    console.log(\"=========================================\");\n  } catch (err) {\n    console.error(\"❌ এক্সট্রাকশন ত্রুটি:\", err);\n    alert(\"এক্সট্র্যাক্ট করতে সমস্যা হয়েছে: \" + err.message);\n  }\n})();\n";

const ACS_BOOKMARKLET_CODE = "javascript:(async%20function%20universalACSExtractor()%20%7B%20console.clear();%20console.log(%22%25c%F0%9F%9A%80%20ADOMMO%20%E2%80%94%20Universal%20ACS%20Multi-Subdomain%20Scraper%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%22,%20%22color:%20#00c269;%20font-size:%2016px;%20font-weight:%20bold;%22);%20let%20token%20=%20'';%20let%20tokenSource%20=%20'';%20for%20(let%20i%20=%200;%20i%20%3C%20localStorage.length;%20i++)%20%7B%20const%20key%20=%20localStorage.key(i);%20const%20val%20=%20localStorage.getItem(key)%20%7C%7C%20'';%20const%20match%20=%20val.match(/ey%5BA-Za-z0-9-_=%5D+%5C.%5BA-Za-z0-9-_=%5D+%5C.?%5BA-Za-z0-9-_.+/=%5D*/);%20if%20(match)%20%7B%20token%20=%20match%5B0%5D;%20tokenSource%20=%20%60localStorage%20%5B$%7Bkey%7D%5D%60;%20break;%20%7D%20%7D%20if%20(!token)%20%7B%20for%20(let%20i%20=%200;%20i%20%3C%20sessionStorage.length;%20i++)%20%7B%20const%20key%20=%20sessionStorage.key(i);%20const%20val%20=%20sessionStorage.getItem(key)%20%7C%7C%20'';%20const%20match%20=%20val.match(/ey%5BA-Za-z0-9-_=%5D+%5C.%5BA-Za-z0-9-_=%5D+%5C.?%5BA-Za-z0-9-_.+/=%5D*/);%20if%20(match)%20%7B%20token%20=%20match%5B0%5D;%20tokenSource%20=%20%60sessionStorage%20%5B$%7Bkey%7D%5D%60;%20break;%20%7D%20%7D%20%7D%20if%20(!token)%20%7B%20const%20cookieMatch%20=%20document.cookie.match(/(?:token%7Caccess_token%7Cjwt)=(%5B%5E;%5D+)/i);%20if%20(cookieMatch)%20%7B%20token%20=%20cookieMatch%5B1%5D;%20tokenSource%20=%20'Cookies';%20%7D%20%7D%20console.log(token%20?%20%60%F0%9F%94%91%20%E0%A6%85%E0%A6%A5%E0%A7%87%E0%A6%A8%E0%A6%9F%E0%A6%BF%E0%A6%95%E0%A7%87%E0%A6%B6%E0%A6%A8%20%E0%A6%9F%E0%A7%8B%E0%A6%95%E0%A7%87%E0%A6%A8%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%97%E0%A7%87%E0%A6%9B%E0%A7%87%20($%7BtokenSource%7D)!%60%20:%20%60%E2%9A%A0%EF%B8%8F%20%E0%A6%B8%E0%A6%B0%E0%A6%BE%E0%A6%B8%E0%A6%B0%E0%A6%BF%20%E0%A6%9F%E0%A7%8B%E0%A6%95%E0%A7%87%E0%A6%A8%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%AF%E0%A6%BE%E0%A7%9F%E0%A6%A8%E0%A6%BF,%20%E0%A6%95%E0%A7%81%E0%A6%95%E0%A6%BF%20%E0%A6%A6%E0%A6%BF%E0%A7%9F%E0%A7%87%20%E0%A6%9A%E0%A7%87%E0%A6%B7%E0%A7%8D%E0%A6%9F%E0%A6%BE%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%AC%E0%A7%87%E0%A5%A4%60);%20let%20API_BASE%20=%20'';%20try%20%7B%20const%20apiResources%20=%20performance.getEntriesByType('resource')%20.map(r%20=%3E%20r.name)%20.filter(n%20=%3E%20n.includes('/api/'));%20const%20detected%20=%20apiResources.find(n%20=%3E%20n.includes('/api/v1/'));%20if%20(detected)%20%7B%20const%20m%20=%20detected.match(/(https?:%5C/%5C/%5B%5E%5C/%5D+%5C/api%5C/v1)/);%20if%20(m)%20API_BASE%20=%20m%5B1%5D;%20%7D%20%7D%20catch%20(e)%20%7B%7D%20if%20(!API_BASE)%20%7B%20const%20host%20=%20location.hostname.toLowerCase();%20if%20(host.includes('engineering'))%20%7B%20API_BASE%20=%20'https://api.engineering.aparsclassroom.com/api/v1';%20%7D%20else%20if%20(host.includes('admission'))%20%7B%20API_BASE%20=%20'https://api.varsity.aparsclassroom.com/api/v1';%20%7D%20else%20if%20(host.includes('varsity')%20%7C%7C%20host.includes('frb'))%20%7B%20API_BASE%20=%20'https://api.varsity.aparsclassroom.com/api/v1';%20%7D%20else%20if%20(host.includes('medical'))%20%7B%20API_BASE%20=%20'https://api.medical.aparsclassroom.com/api/v1';%20%7D%20else%20%7B%20API_BASE%20=%20'https://api.varsity.aparsclassroom.com/api/v1';%20%7D%20%7D%20console.log(%60%F0%9F%8C%90%20%E0%A6%B6%E0%A6%A8%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%A4%E0%A6%95%E0%A7%83%E0%A6%A4%20API%20%E0%A6%8F%E0%A6%A8%E0%A7%8D%E0%A6%A1%E0%A6%AA%E0%A6%AF%E0%A6%BC%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F:%20$%7BAPI_BASE%7D%60);%20const%20urlMatch%20=%20location.href.match(/course%5C/(%5Ba-zA-Z0-9-%5D+)/i)%20%7C%7C%20location.href.match(/shop%5C/(%5Ba-zA-Z0-9-%5D+)/i);%20let%20defaultCourse%20=%20urlMatch%20?%20urlMatch%5B1%5D%20:%20'';%20let%20courseInput%20=%20prompt(%22%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF%20%E0%A6%AC%E0%A6%BE%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%B2%E0%A6%BF%E0%A6%82%E0%A6%95%20%E0%A6%A6%E0%A6%BF%E0%A6%A8:%22,%20defaultCourse);%20if%20(!courseInput)%20return;%20const%20courseIdMatch%20=%20courseInput.trim().match(/(?:course%7Cshop)%5C/(%5B%5E%5C/?#%5D+)/i);%20const%20courseId%20=%20courseIdMatch%20?%20courseIdMatch%5B1%5D%20:%20courseInput.trim();%20let%20detectedArchiveId%20=%20'';%20try%20%7B%20const%20allLinks%20=%20Array.from(document.querySelectorAll('a%5Bhref*=%22/course/%22%5D,%20a%5Bhref*=%22/shop/%22%5D'));%20const%20archiveLink%20=%20allLinks.find(a%20=%3E%20/archive%7C%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%7Cprevious%7C%E0%A6%AA%E0%A7%82%E0%A6%B0%E0%A7%8D%E0%A6%AC%7C%E0%A6%AA%E0%A7%81%E0%A6%B0%E0%A7%8D%E0%A6%AC/i.test(a.textContent%20%7C%7C%20'')%20%7C%7C%20/archive%7Cprevious/i.test(a.getAttribute('href')%20%7C%7C%20'')%20);%20if%20(archiveLink)%20%7B%20const%20m%20=%20(archiveLink.getAttribute('href')%20%7C%7C%20'').match(/(?:course%7Cshop)%5C/(%5Ba-zA-Z0-9-%5D+)/i);%20if%20(m%20&&%20m%5B1%5D%20!==%20courseId)%20%7B%20detectedArchiveId%20=%20m%5B1%5D;%20%7D%20%7D%20%7D%20catch%20(e)%20%7B%7D%20if%20(!detectedArchiveId%20&&%20(courseId.includes('c82195b9')%20%7C%7C%20location.href.toLowerCase().includes('frb')))%20%7B%20detectedArchiveId%20=%20'52acc196-55a7-4499-9ca2-dc44ccab3568';%20%7D%20let%20archiveInput%20=%20prompt(%20%22%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%9A%E0%A7%87%E0%A6%B0%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF%20%E0%A6%AC%E0%A6%BE%20%E0%A6%B2%E0%A6%BF%E0%A6%82%E0%A6%95:%5C%5Cn(%E0%A6%AA%E0%A7%87%E0%A6%9C%E0%A7%87%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF%20%E0%A6%A8%E0%A6%BF%E0%A6%9A%E0%A7%87%20%E0%A6%A6%E0%A7%87%E0%A7%9F%E0%A6%BE%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87%E0%A5%A4%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%A8%E0%A6%BF%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A6%B2%E0%A7%87%20OK%20%E0%A6%A6%E0%A6%BF%E0%A6%A8,%20%E0%A6%A8%E0%A6%BE%20%E0%A6%A5%E0%A6%BE%E0%A6%95%E0%A6%B2%E0%A7%87%20%E0%A6%AB%E0%A6%BE%E0%A6%81%E0%A6%95%E0%A6%BE%20%E0%A6%B0%E0%A6%BE%E0%A6%96%E0%A7%81%E0%A6%A8):%22,%20detectedArchiveId%20);%20let%20archiveCourseId%20=%20'';%20if%20(archiveInput%20&&%20archiveInput.trim())%20%7B%20const%20m%20=%20archiveInput.trim().match(/(?:course%7Cshop)%5C/(%5Ba-zA-Z0-9-%5D+)/i);%20archiveCourseId%20=%20m%20?%20m%5B1%5D%20:%20archiveInput.trim();%20%7D%20const%20headers%20=%20%7B%20'accept':%20'application/json,%20text/plain,%20*/*',%20'x-access-token':%20token,%20'authorization':%20token%20?%20%60Bearer%20$%7Btoken%7D%60%20:%20''%20%7D;%20console.log(%60%F0%9F%93%A6%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF:%20$%7BcourseId%7D%60);%20if%20(archiveCourseId)%20%7B%20console.log(%60%F0%9F%97%84%EF%B8%8F%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%86%E0%A6%87%E0%A6%A1%E0%A6%BF:%20$%7BarchiveCourseId%7D%60);%20%7D%20let%20courseTitle%20=%20'';%20try%20%7B%20const%20cRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course/$%7BcourseId%7D%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20cJson%20=%20await%20cRes.json();%20if%20(cJson.data?.title%20%7C%7C%20cJson.data?.name)%20%7B%20courseTitle%20=%20cJson.data.title%20%7C%7C%20cJson.data.name;%20%7D%20%7D%20catch(e)%20%7B%7D%20if%20(!courseTitle)%20%7B%20try%20%7B%20const%20h1%20=%20document.querySelector('h1')?.textContent?.trim();%20if%20(h1%20&&%20h1.length%20%3E%202%20&&%20!/apars%7Cdashboard%7Clogin%7Cwelcome/i.test(h1))%20%7B%20courseTitle%20=%20h1;%20%7D%20%7D%20catch%20(e)%20%7B%7D%20%7D%20if%20(!courseTitle%20%7C%7C%20courseTitle%20===%20'ACS%20Admission%20Special%20Private%20Programme')%20%7B%20const%20docTitle%20=%20document.title?.trim();%20if%20(docTitle%20&&%20!/apars%5Cs*classroom/i.test(docTitle))%20%7B%20courseTitle%20=%20docTitle;%20%7D%20%7D%20if%20(!courseTitle)%20%7B%20const%20userTitle%20=%20prompt(%22%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%E0%A6%B0%20%E0%A6%A8%E0%A6%BE%E0%A6%AE%20%E0%A6%A8%E0%A6%BF%E0%A6%B6%E0%A7%8D%E0%A6%9A%E0%A6%BF%E0%A6%A4%20%E0%A6%95%E0%A6%B0%E0%A7%81%E0%A6%A8:%22,%20%22ACS%20Course%22);%20courseTitle%20=%20userTitle?.trim()%20%7C%7C%20%22ACS%20Course%22;%20%7D%20function%20formatDrivePdf(val)%20%7B%20if%20(!val)%20return%20null;%20if%20(typeof%20val%20===%20'string'%20&&%20val.startsWith('http'))%20return%20val;%20return%20%60https://drive.google.com/file/d/$%7Bval%7D/view%60;%20%7D%20async%20function%20scrapeCourseStructure(cId,%20isArchive%20=%20false)%20%7B%20const%20label%20=%20isArchive%20?%20%22%F0%9F%97%84%EF%B8%8F%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%22%20:%20%22%F0%9F%93%9A%20%E0%A6%AE%E0%A7%87%E0%A6%87%E0%A6%A8%22;%20console.log(%60$%7Blabel%7D%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%A1%E0%A7%87%E0%A6%9F%E0%A6%BE%20%E0%A6%AB%E0%A7%87%E0%A6%9A%20%E0%A6%95%E0%A6%B0%E0%A6%BE%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%20%5BID:%20$%7BcId%7D%5D%60);%20const%20subRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course-subject/subjects/$%7BcId%7D?limit=100%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20subJson%20=%20await%20subRes.json();%20const%20rawSubjects%20=%20subJson.data%20%7C%7C%20%5B%5D;%20if%20(!rawSubjects.length)%20%7B%20console.warn(%60%E2%9A%A0%EF%B8%8F%20$%7Blabel%7D%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%20%E0%A6%95%E0%A7%8B%E0%A6%A8%E0%A7%8B%20%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%AF%E0%A6%BE%E0%A7%9F%E0%A6%A8%E0%A6%BF!%60);%20return%20%7B%20subjects:%20%5B%5D,%20totalClasses:%200%20%7D;%20%7D%20console.log(%60%25c%E2%9C%85%20$%7Blabel%7D%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%20$%7BrawSubjects.length%7D%20%E0%A6%9F%E0%A6%BF%20%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F%20%E0%A6%AA%E0%A6%BE%E0%A6%93%E0%A7%9F%E0%A6%BE%20%E0%A6%97%E0%A7%87%E0%A6%9B%E0%A7%87!%60,%20%22color:%20#00c269;%20font-weight:%20bold;%22);%20const%20formattedSubjects%20=%20%5B%5D;%20let%20classesCount%20=%200;%20for%20(let%20sIdx%20=%200;%20sIdx%20%3C%20rawSubjects.length;%20sIdx++)%20%7B%20const%20sub%20=%20rawSubjects%5BsIdx%5D;%20const%20subTitle%20=%20sub.title%20%7C%7C%20sub.name%20%7C%7C%20sub.subjectName%20%7C%7C%20sub.courseSubject?.title%20%7C%7C%20sub.courseSubjectName%20%7C%7C%20%60%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F%20$%7BsIdx%20+%201%7D%60;%20console.log(%60%F0%9F%91%89%20%5B$%7BsIdx%20+%201%7D/$%7BrawSubjects.length%7D%5D%20%E0%A6%AC%E0%A6%BF%E0%A6%B7%E0%A7%9F:%20$%7BsubTitle%7D%60);%20const%20chapRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course/subject/chapter/course-subject/$%7Bsub.id%7D?courseSubjectId=$%7Bsub.id%7D&limit=1000%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20chapJson%20=%20await%20chapRes.json();%20const%20rawChapters%20=%20chapJson.data%20%7C%7C%20%5B%5D;%20const%20isBangla%20=%20/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%7Cbangla/i.test(subTitle);%20const%20isEnglish%20=%20/english%7C%E0%A6%87%E0%A6%82%E0%A6%B0%E0%A7%87%E0%A6%9C%E0%A6%BF/i.test(subTitle);%20const%20subjectObj%20=%20%7B%20id:%20sub.id,%20title:%20subTitle,%20isArchive:%20isArchive,%20isMultiPaper:%20(isBangla%20%7C%7C%20isEnglish)%20&&%20rawChapters.length%20%3E=%202,%20chapters:%20%5B%5D%20%7D;%20for%20(let%20cIdx%20=%200;%20cIdx%20%3C%20rawChapters.length;%20cIdx++)%20%7B%20const%20ch%20=%20rawChapters%5BcIdx%5D;%20const%20chapTitle%20=%20ch.title%20%7C%7C%20ch.name%20%7C%7C%20ch.chapterName%20%7C%7C%20ch.courseSubjectChapterName%20%7C%7C%20%60%E0%A6%85%E0%A6%A7%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%AF%E0%A6%BC%20$%7BcIdx%20+%201%7D%60;%20let%20paperTag%20=%20'';%20if%20(isBangla)%20%7B%20paperTag%20=%20cIdx%20===%200%20?%20'%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%20%E0%A7%A7%E0%A6%AE%20%E0%A6%AA%E0%A6%A4%E0%A7%8D%E0%A6%B0%20(%E0%A6%B8%E0%A6%BE%E0%A6%B9%E0%A6%BF%E0%A6%A4%E0%A7%8D%E0%A6%AF)'%20:%20'%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%20%E0%A7%A8%E0%A7%9F%20%E0%A6%AA%E0%A6%A4%E0%A7%8D%E0%A6%B0%20(%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A6%B0%E0%A6%A3)';%20%7D%20else%20if%20(isEnglish)%20%7B%20paperTag%20=%20cIdx%20===%200%20?%20'English%201st%20Paper'%20:%20'English%202nd%20Paper';%20%7D%20try%20%7B%20const%20classRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/class/all/videos/$%7Bch.id%7D?limit=1000%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20classJson%20=%20await%20classRes.json();%20const%20rawClasses%20=%20classJson.data%20%7C%7C%20%5B%5D;%20const%20classes%20=%20rawClasses.map((cl,%20i)%20=%3E%20%7B%20classesCount++;%20return%20%7B%20id:%20cl.id,%20classNo:%20cl.classNo%20%7C%7C%20(i%20+%201).toString(),%20title:%20cl.classTitle%20%7C%7C%20cl.title%20%7C%7C%20cl.description%20%7C%7C%20%60Class%20$%7Bi%20+%201%7D:%20$%7BchapTitle%7D%60,%20description:%20cl.description%20%7C%7C%20'',%20instructor:%20cl.instructor%20%7C%7C%20cl.instructorName%20%7C%7C%20'ACS%20Instructor',%20hostingType:%20cl.hostingType%20%7C%7C%20'',%20videoId:%20cl.videoId%20%7C%7C%20'',%20videoUrl:%20cl.videoUrl%20%7C%7C%20'',%20hlsPlaylistUrl:%20cl.hlsPlaylistUrl%20%7C%7C%20null,%20iframePlayerUrl:%20cl.iframePlayerUrl%20%7C%7C%20null,%20libraryId:%20cl.libraryId%20%7C%7C%20'610687',%20lectureSheetPdf:%20formatDrivePdf(cl.lectureSheet%20%7C%7C%20cl.lectureSheetPdf),%20practiceSheetPdf:%20formatDrivePdf(cl.practiceSheet%20%7C%7C%20cl.practiceSheetPdf),%20solutionSheetPdf:%20formatDrivePdf(cl.solutionSheet%20%7C%7C%20cl.solutionSheetPdf),%20markedBookPdf:%20formatDrivePdf(cl.markedBook%20%7C%7C%20cl.markedBookPdf),%20paperTag:%20paperTag%20%7C%7C%20null%20%7D;%20%7D);%20subjectObj.chapters.push(%7B%20id:%20ch.id,%20title:%20chapTitle,%20paperTag:%20paperTag%20%7C%7C%20null,%20classes%20%7D);%20%7D%20catch(cErr)%20%7B%20subjectObj.chapters.push(%7B%20id:%20ch.id,%20title:%20chapTitle,%20paperTag:%20paperTag%20%7C%7C%20null,%20classes:%20%5B%5D%20%7D);%20%7D%20%7D%20formattedSubjects.push(subjectObj);%20%7D%20return%20%7B%20subjects:%20formattedSubjects,%20totalClasses:%20classesCount%20%7D;%20%7D%20try%20%7B%20console.log(%22%E0%A7%A7%E0%A6%AE%20%E0%A6%A7%E0%A6%BE%E0%A6%AA:%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%E0%A6%B0%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8%20%E0%A6%B8%E0%A6%82%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%B9%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%22);%20const%20mainData%20=%20await%20scrapeCourseStructure(courseId,%20false);%20const%20fullCourseData%20=%20%7B%20courseId,%20courseTitle,%20extractedAt:%20new%20Date().toISOString(),%20apiBaseUsed:%20API_BASE,%20subdomain:%20location.hostname,%20totalSubjects:%20mainData.subjects.length,%20totalClasses:%20mainData.totalClasses,%20subjects:%20mainData.subjects%20%7D;%20if%20(archiveCourseId)%20%7B%20console.log(%22%E0%A7%A8%E0%A6%AF%E0%A6%BC%20%E0%A6%A7%E0%A6%BE%E0%A6%AA:%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%E0%A7%87%E0%A6%B0%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8%20%E0%A6%B8%E0%A6%82%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%B9%20%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81%20%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87...%22);%20let%20archiveTitle%20=%20%22%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%9A%20(Previous%20Batch%20Archive)%22;%20try%20%7B%20const%20aRes%20=%20await%20fetch(%60$%7BAPI_BASE%7D/course/$%7BarchiveCourseId%7D%60,%20%7B%20headers,%20credentials:%20'include'%20%7D);%20const%20aJson%20=%20await%20aRes.json();%20if%20(aJson.data?.title%20%7C%7C%20aJson.data?.name)%20%7B%20archiveTitle%20=%20%60%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD:%20$%7BaJson.data.title%20%7C%7C%20aJson.data.name%7D%60;%20%7D%20%7D%20catch%20(e)%20%7B%7D%20const%20archiveData%20=%20await%20scrapeCourseStructure(archiveCourseId,%20true);%20fullCourseData.archive%20=%20%7B%20courseId:%20archiveCourseId,%20title:%20archiveTitle,%20totalSubjects:%20archiveData.subjects.length,%20totalClasses:%20archiveData.totalClasses,%20subjects:%20archiveData.subjects%20%7D;%20console.log(%60%25c%F0%9F%97%84%EF%B8%8F%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%20($%7BarchiveData.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8)%60,%20%22color:%20#eab308;%20font-weight:%20bold;%22);%20%7D%20const%20totalCombinedClasses%20=%20fullCourseData.totalClasses%20+%20(fullCourseData.archive?.totalClasses%20%7C%7C%200);%20const%20blob%20=%20new%20Blob(%5BJSON.stringify(fullCourseData,%20null,%202)%5D,%20%7B%20type:%20'application/json'%20%7D);%20const%20a%20=%20document.createElement('a');%20a.href%20=%20URL.createObjectURL(blob);%20const%20cleanName%20=%20(courseTitle.replace(/%5B%5Ea-zA-Z0-9%5Cu0980-%5Cu09FF%5D/g,%20'_')%20%7C%7C%20'course')%20+%20'.json';%20a.download%20=%20cleanName;%20document.body.appendChild(a);%20a.click();%20document.body.removeChild(a);%20alert(%60%F0%9F%8E%89%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A7%82%E0%A6%B0%E0%A7%8D%E0%A6%A3%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%AA%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%5C%5Cn%5C%5Cn%F0%9F%93%8C%20%E0%A6%AE%E0%A7%87%E0%A6%87%E0%A6%A8%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%5C%5Cn%F0%9F%93%8C%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.archive?.totalClasses%20%7C%7C%200%7D%20%E0%A6%9F%E0%A6%BF%5C%5Cn%F0%9F%93%8C%20%E0%A6%B8%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A6%AE%E0%A7%8B%E0%A6%9F%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BtotalCombinedClasses%7D%20%E0%A6%9F%E0%A6%BF%5C%5Cn%5C%5Cn%E0%A6%AB%E0%A6%BE%E0%A6%87%E0%A6%B2%20($%7BcleanName%7D)%20%E0%A6%A1%E0%A6%BE%E0%A6%89%E0%A6%A8%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87%E0%A5%A4%20%E0%A6%8F%E0%A6%AC%E0%A6%BE%E0%A6%B0%20%E0%A6%8F%E0%A6%9F%E0%A6%BF%20%E0%A6%86%E0%A6%AE%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B0%20%E0%A6%93%E0%A7%9F%E0%A7%87%E0%A6%AC%E0%A6%B8%E0%A6%BE%E0%A6%87%E0%A6%9F%E0%A7%87%20%E0%A6%86%E0%A6%AA%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%95%E0%A6%B0%E0%A7%81%E0%A6%A8%E0%A5%A4%60);%20console.log(%22=========================================%22);%20console.log(%60%25c%F0%9F%8E%89%20%E0%A6%B8%E0%A6%AE%E0%A7%8D%E0%A6%AA%E0%A7%82%E0%A6%B0%E0%A7%8D%E0%A6%A3%20%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8%20%E0%A6%B8%E0%A6%AB%E0%A6%B2%E0%A6%AD%E0%A6%BE%E0%A6%AC%E0%A7%87%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%AA%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%9F%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87!%60,%20%22color:%20#00c269;%20font-size:%2018px;%20font-weight:%20bold;%22);%20console.log(%60%F0%9F%93%8C%20%E0%A6%AE%E0%A7%87%E0%A6%87%E0%A6%A8%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%60);%20if%20(fullCourseData.archive)%20%7B%20console.log(%60%F0%9F%93%8C%20%E0%A6%86%E0%A6%B0%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%87%E0%A6%AD%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BfullCourseData.archive.totalClasses%7D%20%E0%A6%9F%E0%A6%BF%60);%20%7D%20console.log(%60%F0%9F%93%8C%20%E0%A6%B8%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A6%AE%E0%A7%8B%E0%A6%9F%20%E0%A6%95%E0%A7%8D%E0%A6%B2%E0%A6%BE%E0%A6%B8:%20$%7BtotalCombinedClasses%7D%20%E0%A6%9F%E0%A6%BF%60);%20console.log(%60%F0%9F%93%81%20%E0%A6%AB%E0%A6%BE%E0%A6%87%E0%A6%B2%E0%A6%9F%E0%A6%BF%20%E0%A6%A1%E0%A6%BE%E0%A6%89%E0%A6%A8%E0%A6%B2%E0%A7%8B%E0%A6%A1%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87:%20$%7BcleanName%7D%60);%20console.log(%22=========================================%22);%20%7D%20catch%20(err)%20%7B%20console.error(%22%E2%9D%8C%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%95%E0%A6%B6%E0%A6%A8%20%E0%A6%A4%E0%A7%8D%E0%A6%B0%E0%A7%81%E0%A6%9F%E0%A6%BF:%22,%20err);%20alert(%22%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%9F%20%E0%A6%95%E0%A6%B0%E0%A6%A4%E0%A7%87%20%E0%A6%B8%E0%A6%AE%E0%A6%B8%E0%A7%8D%E0%A6%AF%E0%A6%BE%20%E0%A6%B9%E0%A7%9F%E0%A7%87%E0%A6%9B%E0%A7%87:%20%22%20+%20err.message);%20%7D%20%7D)();";

export default function CourseJsonUploadModal({ isOpen, onClose, onEditCourse }: CourseJsonUploadModalProps) {
  const { courses, addCourse, updateCourse, showToast, currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedMasterCode, setCopiedMasterCode] = useState(false);
  const [copiedBookmarkletCode, setCopiedBookmarkletCode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isExistingCourse, setIsExistingCourse] = useState(false);
  const [matchedCourseTitle, setMatchedCourseTitle] = useState('');
  const [courseTitleInput, setCourseTitleInput] = useState('');
  const [detectedFileName, setDetectedFileName] = useState('');
  const [importMode, setImportMode] = useState<'new' | 'sync'>('new');
  const [selectedTargetCourseId, setSelectedTargetCourseId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setParsedData(null);
    setIsExistingCourse(false);
    setMatchedCourseTitle('');
    setCourseTitleInput('');
    setDetectedFileName('');
    setImportMode('new');
    setSelectedTargetCourseId('');
    setIsUploading(false);
    setErrorMessage(null);
    setSyncResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

    const handleCopyMasterCode = () => {
    try {
      navigator.clipboard.writeText(ACS_MASTER_DOWNLOADER_CODE);
      setCopiedMasterCode(true);
      showToast('📋 মাস্টার স্ক্রিপ্ট ক্লিপবোর্ডে কপি হয়েছে! এবার ACS কনসোলে পেস্ট করুন।');
      setTimeout(() => setCopiedMasterCode(false), 3000);
    } catch {
      showToast('❌ ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে!');
    }
  };

  
  const handleCopyBookmarkletCode = () => {
    try {
      navigator.clipboard.writeText(ACS_BOOKMARKLET_CODE);
      setCopiedBookmarkletCode(true);
      showToast('⭐ বুকমার্কলেট কোড কপি হয়েছে! ব্রাউজারের বুকমার্ক URL-এ পেস্ট করুন।');
      setTimeout(() => setCopiedBookmarkletCode(false), 3000);
    } catch {
      showToast('❌ ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে!');
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMessage('অনুগ্রহ করে একটি বৈধ .json ফাইল নির্বাচন করুন!');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setSyncResult(null);

    const fileNameOnly = file.name.replace(/\.json$/i, '').trim();
    setDetectedFileName(fileNameOnly);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const isTg = !!json.messages && Array.isArray(json.messages);
        const isStandard = (!!json.sections || !!json.modules);
        const isScraper = (!!json.subjects || !!json.archive);
        const isChapters = !!json.chapters && Array.isArray(json.chapters);

        if (!isTg && !isStandard && !isScraper && !isChapters) {
          setErrorMessage('অবৈধ কোর্স ডেটা! ফাইলে কোনো বিষয়, অধ্যায় বা ক্লাস পাওয়া যায়নি।');
          setParsedData(null);
          return;
        }

        const healedJson = healCourse(json);
        setParsedData(healedJson);

        // কোর্সের নাম নির্ধারণ
        let initialTitle = json.courseTitle || fileNameOnly || 'ACS Course';
        if (
          (!json.courseTitle || json.courseTitle === 'ACS Admission Special Private Programme' || json.courseTitle === 'ACS Course') &&
          fileNameOnly && fileNameOnly !== 'ACS Admission Special Private Programme'
        ) {
          initialTitle = fileNameOnly;
        }
        setCourseTitleInput(initialTitle);

        // শুধুমাত্র কোর্স GUID / আইডি মিলিয়ে এক্সিস্টিং কোর্স যাচাই (ফলস পজিটিভ প্রতিরোধ)
        const rawId = (json.courseId || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
        const isFrb = (json.courseId || '').includes('c82195b9') || /frb/i.test(initialTitle);
        const expectedId = isFrb ? 'course_acs_frb26' : ('course_acs_' + rawId);

        let matched = rawId ? courses.find(c => c.id === expectedId || (rawId.length >= 6 && c.id.includes(rawId))) : null;

        // যদি আইডিতে সরাসরি না মিলে, তবে টাইটেল (শিরোনাম) মিলিয়ে নিশ্চিত করা
        if (!matched && initialTitle) {
          const normInitial = initialTitle.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
          matched = courses.find(c => {
            if (!c.title) return false;
            const normTitle = c.title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
            return normTitle === normInitial || (normTitle.length > 5 && normInitial.length > 5 && (normTitle.includes(normInitial) || normInitial.includes(normTitle)));
          }) || null;
        }

        if (matched) {
          setIsExistingCourse(true);
          setImportMode('sync');
          setSelectedTargetCourseId(matched.id);
          setMatchedCourseTitle(matched.title);
        } else {
          setIsExistingCourse(false);
          setImportMode('new');
          setSelectedTargetCourseId(courses[0]?.id || '');
          setMatchedCourseTitle('');
        }
      } catch (err: any) {
        setErrorMessage('JSON ফাইলটি পার্স করতে সমস্যা হয়েছে: ' + err.message);
        setParsedData(null);
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

  const handleConfirmUpload = async () => {
    if (!parsedData) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...parsedData,
        courseTitle: courseTitleInput.trim() || parsedData.courseTitle || parsedData.title || parsedData.name || 'ACS Course',
        forceNew: importMode === 'new',
        targetCourseId: importMode === 'sync' ? selectedTargetCourseId : undefined,
        instructorId: currentUser?.id || '',
        teacherEmail: currentUser?.email || '',
        teacherPhone: currentUser?.phone || '',
        teacherName: currentUser?.name || 'শিক্ষক'
      };

      const res = await fetch('/api/course/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'সার্ভারে কোর্স আপলোড করতে সমস্যা হয়েছে!');
      }

      setSyncResult(data);

      // AppContext আপডেট করা (যাতে ব্রাউজার রিফ্রেশ ছাড়াই তৎক্ষণাৎ সর্বত্র শো করে)
      if (data.course) {
        const exists = courses.some(c => c.id === data.course.id);
        if (exists) {
          updateCourse(data.course.id, data.course);
        } else {
          addCourse(data.course);
        }
      }

      // কনফেটি অ্যানিমেশন
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      showToast(data.isNew ? '📝 নতুন কোর্স ড্রাফট (খসড়া) হিসেবে সেভ হয়েছে!' : '🔄 কোর্স সফলভাবে অটো-সিঙ্ক ও আপডেট হয়েছে!');
    } catch (err: any) {
      setErrorMessage(err.message || 'কোর্স আপলোড করতে সমস্যা হয়েছে!');
      showToast('❌ ' + (err.message || 'কোর্স আপলোড করতে সমস্যা হয়েছে!'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-pink-50/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#fff0f5] border border-pink-200 text-[#ed347d] flex items-center justify-center shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                ১-ক্লিকে কোর্স জেসন আপলোড ও অটো-সিঙ্ক
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-[#ed347d]">
                  LIVE SYNC
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                ACS থেকে এক্সপোর্টকৃত .json ফাইল দিন। স্বয়ংক্রিয়ভাবে নতুন ক্লাস ও শিট যুক্ত হবে।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Result View */}
          {syncResult ? (
            <div className="space-y-5">
              <div className={`p-5 rounded-2xl border space-y-3 shadow-xs ${
                syncResult.isNew 
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${syncResult.isNew ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <h4 className="text-sm font-black">
                    {syncResult.isNew 
                      ? '📝 নতুন কোর্সটি ড্রাফট (খসড়া) হিসেবে সেভ হয়েছে!' 
                      : '🔄 কোর্স সফলভাবে সিঙ্ক ও আপডেট হয়েছে!'}
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
                  <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">মোট ক্লাস</span>
                    <span className="text-base font-black text-slate-800">
                      {syncResult.course?.totalLectures || syncResult.diff?.currentLectureCount || 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">নতুন ক্লাস যুক্ত</span>
                    <span className="text-base font-black text-emerald-600">
                      +{syncResult.diff?.newClassesAdded ?? syncResult.diff?.totalLectures ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">নতুন শিট যুক্ত</span>
                    <span className="text-base font-black text-[#ed347d]">
                      +{syncResult.diff?.newSheetsAdded ?? syncResult.diff?.totalSheets ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">ডুপ্লিকেট রোধ</span>
                    <span className="text-base font-black text-slate-600">
                      {syncResult.diff?.duplicateSkipped ?? 0} অক্ষত
                    </span>
                  </div>
                </div>

                {syncResult.isNew ? (
                  <div className="p-3.5 bg-amber-100/70 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <span>🔒 বর্তমানে খসড়া (Draft) অবস্থায় সংরক্ষিত:</span>
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      কোর্সটি শিক্ষার্থীদের কাছে এখনো সরাসরি দৃশ্যমান নয়। আপনি চাইলে এখনই কোর্স এডিটরে গিয়ে এর মূল্য (Price), ব্যানার ছবি, ডিসকাউন্ট ও বিবরণ পরিবর্তন করে লাইভ পাবলিশ করতে পারেন।
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-100/70 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <span>✅ লাইভ কোর্স সরাসরি আপডেট হয়েছে (ড্রাফট হয়নি):</span>
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      📌 <strong>{syncResult.course?.title || syncResult.diff?.courseTitle}</strong> কোর্সের কনটেন্ট সরাসরি লাইভে আপডেট হয়েছে। আপনার পূর্বের নির্ধারিত মূল্য, ব্যানার ছবি ও সেটিংস অক্ষত রয়েছে।
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons after Success */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetState}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  আরেকটি ফাইল আপলোড
                </button>
                {syncResult.course && onEditCourse && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = syncResult.course;
                      handleClose();
                      onEditCourse(c);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>✏️ কোর্স তথ্য এডিট ও পাবলিশ করুন</span>
                  </button>
                )}
                {syncResult.course?.id && (
                  <Link
                    href={`/classroom/${syncResult.course.id}`}
                    target="_blank"
                    className="px-4 py-2.5 rounded-xl ph-btn-pink text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow"
                  >
                    <span>ক্লাসরুম প্রিভিউ দেখুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Master Scraper Code & 1-Click Copy Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50/50 to-amber-50 border border-purple-200/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-[#ed347d] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>১-ক্লিক ব্রাউজার মাস্টার কোড (JSON ডাউনলোডার)</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-purple-700">
                          MASTER SCRIPT
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ACS কনসোলে পেস্ট করলেই অটো সম্পূর্ণ কোর্স ফাইল ডাউনলোড হয়ে যাবে
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopyMasterCode}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                        copiedMasterCode
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-purple-600 to-[#ed347d] text-white hover:from-purple-700 hover:to-[#d0246a] active:scale-[0.98]'
                      }`}
                    >
                      {copiedMasterCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedMasterCode ? 'মাস্টার কোড কপি হয়েছে!' : '📋 কনসোল কোড'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyBookmarkletCode}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                        copiedBookmarkletCode
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white hover:opacity-90 active:scale-[0.98]'
                      }`}
                    >
                      {copiedBookmarkletCode ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{copiedBookmarkletCode ? 'বুকমার্কলেট কপি হয়েছে!' : '⭐ ১-ক্লিক বুকমার্কলেট (F12 ছাড়া)'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-2 bg-white/90 p-3 rounded-xl border border-purple-100/90 leading-relaxed">
                  <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>💡 F12 ছাড়া ১-ক্লিকে ডাউনলোড করার নিয়ম (সবচেয়ে সহজ):</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-extrabold">১০০% নো-ব্লক</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>১. ব্রাউজারের বুকমার্ক বারে রাইট ক্লিক করে <strong>Add page...</strong> (বা Add bookmark) দিন।</div>
                    <div>২. নাম দিন <strong className="text-pink-600">ACS Download</strong> এবং URL বক্সে উপরের <strong>&quot;⭐ ১-ক্লিক বুকমার্কলেট&quot;</strong> কোডটি পেস্ট করে Save দিন।</div>
                    <div>৩. এবার ACS কোর্সের পেজে থাকা অবস্থায় বুকমার্কটিতে ১টি ক্লিক করুন — <strong>কোনো F12 চাপার দরকার নেই</strong>, নিমিষে JSON ফাইল ডাউনলোড শুরু হবে!</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <span>🛡️ ACS-এ F12 চাপলে &quot;কপিরাইট সতর্কতা&quot; পপ-আপ আসলে কী করবেন?</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    ভয়ের কিছু নেই! এটি একটি সাধারণ ব্রাউজার সাইড স্ক্রিপ্ট (কোনো অ্যাকাউন্ট ব্যান নয়)। স্ক্রিনে সতর্কতা থাকলেও কনসোলে কোড পেস্ট করে <strong>Enter</strong> দিলে স্বয়ংক্রিয়ভাবে ডাউনলোড হয়ে যাবে। অথবা DevTools-এর থ্রি-ডট (⋮) থেকে <strong>&quot;Undock into separate window&quot;</strong> নির্বাচন করুন।
                  </p>
                </div>
              </div>

              {/* Dropzone Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all select-none ${
                  isDragging 
                    ? 'border-[#ed347d] bg-pink-50/50 scale-[0.99]' 
                    : selectedFile 
                    ? 'border-emerald-300 bg-emerald-50/30' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  {selectedFile ? (
                    <FileCheck className="w-7 h-7 text-emerald-500 animate-bounce" />
                  ) : (
                    <UploadCloud className="w-7 h-7 text-[#ed347d]" />
                  )}
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB • ফাইল সফলভাবে লোড হয়েছে</p>
                    <span className="inline-block text-[11px] text-[#ed347d] font-semibold underline mt-1">অন্য ফাইল পরিবর্তন করুন</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">ACS থেকে এক্সপোর্টকৃত .json ফাইলটি এখানে ড্র্যাগ করুন</p>
                    <p className="text-[11px] text-slate-400">অথবা আপনার কম্পিউটার থেকে নির্বাচন করতে ক্লিক করুন</p>
                    <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 mt-2 shadow-2xs">
                      সাপোর্ট করে: .json ফরম্যাট
                    </span>
                  </div>
                )}
              </div>

              {/* Parsed JSON Preview & Settings */}
              {parsedData && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 animate-in fade-in duration-150">
                  
                  {/* Mode Selector Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      অ্যাকশন মোড নির্বাচন করুন
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('new')}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          importMode === 'new'
                            ? 'bg-pink-50 border-[#ed347d] text-[#ed347d] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>✨ নতুন কোর্স হিসেবে যোগ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportMode('sync')}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          importMode === 'sync'
                            ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>🔄 বিদ্যমান কোর্সে সিঙ্ক</span>
                      </button>
                    </div>
                  </div>

                  {/* Course Title Field (Editable) */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        কোর্স শিরোনাম (Course Title)
                      </label>
                      {detectedFileName && detectedFileName !== courseTitleInput && (
                        <button
                          type="button"
                          onClick={() => setCourseTitleInput(detectedFileName)}
                          className="text-[10px] font-bold text-[#ed347d] hover:underline cursor-pointer"
                        >
                          ফাইলের নাম ব্যবহার করুন ({detectedFileName})
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={courseTitleInput}
                      onChange={(e) => setCourseTitleInput(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#ed347d] focus:outline-none transition-all"
                      placeholder="কোর্সের নাম লিখুন..."
                    />
                  </div>

                  {/* Target Course Selector if Sync Mode */}
                  {importMode === 'sync' && (
                    <div className="space-y-1.5 bg-amber-50/70 p-3 rounded-xl border border-amber-200/90">
                      <label className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                        কোন কোর্সের সাথে নতুন ক্লাস ও শিট মার্জ হবে?
                      </label>
                      <select
                        value={selectedTargetCourseId}
                        onChange={(e) => setSelectedTargetCourseId(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-white border border-amber-300 rounded-lg focus:border-[#ed347d] focus:outline-none cursor-pointer"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.totalLectures} ক্লাস)
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-amber-800 pt-0.5 font-medium">
                        💡 নির্বাচিত লাইভ কোর্সের সাথে নতুন ক্লাস ও শিট সরাসরি যুক্ত হবে। পূর্বের মূল্য, ব্যানার ছবি ও লাইভ স্ট্যাটাস অক্ষত থাকবে (ড্রাফট হবে না)।
                      </p>
                    </div>
                  )}

                  {/* Quick Info Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">মেইন বিষয়</span>
                      <span className="font-bold text-slate-700">{parsedData.subjects?.length || 0} টি</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">মেইন ক্লাস</span>
                      <span className="font-bold text-slate-700">{parsedData.totalClasses || 0} টি</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">আর্কাইভ ক্লাস</span>
                      <span className="font-bold text-amber-700">{parsedData.archive?.totalClasses || 0} টি</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">সর্বমোট ক্লাস</span>
                      <span className="font-bold text-emerald-600">
                        {(parsedData.totalClasses || 0) + (parsedData.archive?.totalClasses || 0)} টি
                      </span>
                    </div>
                  </div>

                  {/* Auto-detected Subjects Preview */}
                  {(() => {
                    const detectedList = (parsedData.subjects || parsedData.sections || [])
                      .filter((s: any) => s.title && !s.title.includes('আর্কাইভ ব্যাচ') && !s.title.includes('Previous Batch Archive'))
                      .map((s: any) => s.title);
                    if (!detectedList.length) return null;
                    return (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>শনাক্তকৃত বিষয়সমূহ ({detectedList.length} টি):</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                            অটো-নরমালাইজড
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-24 overflow-y-auto">
                          {detectedList.map((name: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                            >
                              📚 {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {importMode === 'new' && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        এটি সম্পূর্ণ নতুন কোর্স হিসেবে ওয়েবসাইটে যোগ হবে। অন্যান্য কোনো কোর্সের ডেটা প্রভাবিত হবে না।
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        {!syncResult && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              বাতিল করুন
            </button>

            <button
              type="button"
              disabled={!parsedData || isUploading}
              onClick={handleConfirmUpload}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-white transition-all shadow-sm ${
                !parsedData || isUploading
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'ph-btn-pink hover:shadow-md active:scale-95 cursor-pointer'
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>প্রসেসিং ও সিঙ্ক হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{importMode === 'sync' ? 'আপডেট ও সিঙ্ক করুন' : 'নতুন কোর্স তৈরি করুন'}</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
