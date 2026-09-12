/**
 * ADOMMO (অদম্য) — Smart Course Importer & Incremental Auto-Sync Engine
 * 
 * ক্ষমতা:
 * ১. প্রথমবার রান করলে সম্পূর্ণ কোর্স ইম্পোর্ট করে src/lib/-এ রেজিস্টার করে।
 * ২. পরবর্তীতে নতুন ক্লাস যোগ হলে (যেমন: ১০০ থেকে ১১০ ক্লাস) পুনরায় ফাইল দিলে:
 *    - বিদ্যমান কোনো ক্লাস বা আইডি ডুপ্লিকেট করে না।
 *    - শুধুমাত্র নতুন ক্লাসগুলো খুঁজে বের করে স্বয়ংক্রিয়ভাবে সঠিক চ্যাপ্টারে যোগ করে।
 *    - আগে ফাঁকা থাকা অধ্যায়ে নতুন ক্লাস এলে সেই অধ্যায় সক্রিয় করে।
 *    - বিদ্যমান ক্লাসের নতুন শিট বা ভিডিও লিংক থাকলে তা নিরাপদে আপডেট করে।
 */

const fs = require('fs');
const path = require('path');

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0980-\u09FF-]+/g, '')
    .replace(/--+/g, '-');
}

function cleanChapterTitle(desc, defaultTitle) {
  if (!desc || !desc.trim()) return defaultTitle;
  const cleaned = desc.trim()
    .replace(/\s*-\s*\d+.*$/i, '')
    .replace(/-\d+.*$/i, '')
    .replace(/\s*Class\s*\d+.*$/i, '')
    .trim();
  return cleaned || defaultTitle;
}

function resolveVideoUrl(cl) {
  const rawVid = (cl.videoUrl || cl.videoId || '').trim();
  const hosting = (cl.hostingType || '').toLowerCase();
  const libId = cl.libraryId || '610687';

  if (!rawVid) return '';

  // ১. সরাসরি HTTP / HTTPS URL
  if (rawVid.startsWith('http')) {
    if (/youtube\.com|youtu\.be/i.test(rawVid)) {
      return rawVid;
    } else if (rawVid.includes('mediadelivery.net') && rawVid.includes('/embed/')) {
      return rawVid;
    } else {
      const m = rawVid.match(/(?:vz-([a-zA-Z0-9]+)\.b-cdn\.net|iframe\.mediadelivery\.net\/(?:embed|play)\/([a-zA-Z0-9]+))\/([a-zA-Z0-9_-]+)/i);
      if (m) {
        return `https://iframe.mediadelivery.net/embed/${m[1] || m[2] || libId}/${m[3]}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
      }
      return rawVid;
    }
  }

  // ২. YouTube (premyt / 11-অক্ষরের YouTube ID)
  if (hosting === 'premyt' || hosting === 'youtube' || hosting === 'yt' || /^[a-zA-Z0-9_-]{11}$/.test(rawVid)) {
    return `https://www.youtube.com/watch?v=${rawVid}`;
  }

  // ৩. BunnyCDN Video UUID বা room_id
  return `https://iframe.mediadelivery.net/embed/${libId}/${rawVid}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
}

function run() {
  const args = process.argv.slice(2);
  const inputFilePath = args[0] || 'acs_full_course.json';

  const fullInputPath = path.resolve(process.cwd(), inputFilePath);
  if (!fs.existsSync(fullInputPath)) {
    console.error('❌ ফাইলটি খুঁজে পাওয়া যায়নি: ' + fullInputPath);
    console.log('ব্যবহারবিধি: node scripts/import_course.js "<ফাইলের_নাম.json>"');
    process.exit(1);
  }

  console.log('📖 কোর্স ডেটা পড়া হচ্ছে: ' + inputFilePath + '...');
  const rawData = JSON.parse(fs.readFileSync(fullInputPath, 'utf8'));

  const courseTitle = rawData.courseTitle || 'ACS Course';
  let cleanId = (rawData.courseId ? rawData.courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) : 'course_' + Date.now());
  
  // বিশেষ কোর্স আইডি হ্যান্ডলিং
  if (cleanId === 'c82195b9' || rawData.courseId?.includes('c82195b9') || /frb/i.test(courseTitle)) {
    cleanId = 'frb26';
  }

  const courseSlug = rawData.slug || slugify(courseTitle) || ('acs-course-' + cleanId);
  const courseId = 'course_acs_' + cleanId;
  const variableName = 'acsCourse_' + cleanId;

  const outFileName = courseSlug.replace(/[^a-zA-Z0-9]/g, '_') + '_data.ts';
  const outFilePath = path.join(process.cwd(), 'src', 'lib', outFileName);

  // ১. চেক করা যে কোর্সটি ইতিমধ্যে আমাদের ওয়েবসাইটে বিদ্যমান আছে কি না
  let existingCourse = null;
  const libDir = path.join(process.cwd(), 'src', 'lib');
  const libFiles = fs.readdirSync(libDir).filter(f => f.endsWith('_data.ts'));

  for (const f of libFiles) {
    const fPath = path.join(libDir, f);
    const content = fs.readFileSync(fPath, 'utf8');
    if (content.includes(`"${courseId}"`) || content.includes(`"course_acs_${cleanId}"`) || content.includes(`"${courseSlug}"`)) {
      try {
        const jsonStr = content.replace(/^import [^;]+;\s*export const \w+: Course = /, '').replace(/;?\s*$/, '');
        existingCourse = JSON.parse(jsonStr);
        console.log(`🔍 বিদ্যমান কোর্স পাওয়া গেছে: "${existingCourse.title}" (${f})!`);
        break;
      } catch (e) {}
    }
  }

  // যদি কোর্সটি ইতিমধ্যে বিদ্যমান থাকে, আমরা স্মার্ট সিঙ্ক (Incremental Merge) চালাবো
  if (existingCourse) {
    console.log('\n=========================================================');
    console.log('🔄 স্মার্ট ইনক্রিমেন্টাল অটো-সিঙ্ক মোড চালু হচ্ছে...');
    console.log('=========================================================');

    const prevLectureCount = existingCourse.modules.reduce((acc, m) => acc + (m.lectures?.length || 0), 0);
    const prevSheetCount = existingCourse.modules.reduce((acc, m) => acc + m.lectures.reduce((sAcc, l) => sAcc + (l.notes?.length || 0), 0), 0);

    let newClassesAdded = 0;
    let newSheetsAdded = 0;
    let classesUpdated = 0;
    let duplicateSkipped = 0;

    // বিদ্যমান সব লেকচার আইডির ইনডেক্স তৈরি
    const existingLectureMap = new Map();
    existingCourse.modules.forEach(m => {
      m.lectures.forEach(l => {
        const cleanLecId = l.id.replace(/^lec_/, '');
        existingLectureMap.set(cleanLecId, { lecture: l, module: m });
      });
    });

    // নতুন ক্লাসের ডেটা প্রসেসিং হেল্পার
    function syncChapterClasses(targetModule, newClasses, parentTitle) {
      newClasses.forEach((cl, clIdx) => {
        const clId = cl.id || (targetModule.id + '_' + clIdx);
        const cleanLecId = clId.replace(/^lec_/, '');

        // চেক: এই ক্লাসটি কি ইতিমধ্যে আছে?
        if (existingLectureMap.has(cleanLecId)) {
          duplicateSkipped++;
          const existing = existingLectureMap.get(cleanLecId).lecture;

          // চেক: ভিডিও বা শিট আপডেট হয়েছে কি না
          const newVid = resolveVideoUrl(cl);
          if (newVid && (!existing.videoUrl || existing.videoUrl !== newVid)) {
            existing.videoUrl = newVid;
            classesUpdated++;
          }

          // নতুন শিট যোগ হয়েছে কি না
          if (cl.lectureSheetPdf && !existing.notes?.some(n => n.type === 'lecture_sheet')) {
            existing.notes = existing.notes || [];
            existing.notes.push({
              id: 'note_' + cleanLecId + '_lec',
              title: 'লেকচার শিট (PDF)',
              type: 'lecture_sheet',
              size: '4.5 MB',
              pages: 12,
              pdfUrl: cl.lectureSheetPdf,
              downloadCount: 180,
              fileType: 'pdf',
              fileSize: '4.5 MB',
              url: cl.lectureSheetPdf
            });
            newSheetsAdded++;
          }
          if (cl.practiceSheetPdf && !existing.notes?.some(n => n.type === 'practice_sheet')) {
            existing.notes = existing.notes || [];
            existing.notes.push({
              id: 'note_' + cleanLecId + '_prac',
              title: 'প্র্যাকটিস শিট (PDF)',
              type: 'practice_sheet',
              size: '3.2 MB',
              pages: 8,
              pdfUrl: cl.practiceSheetPdf,
              downloadCount: 140,
              fileType: 'pdf',
              fileSize: '3.2 MB',
              url: cl.practiceSheetPdf
            });
            newSheetsAdded++;
          }
          return;
        }

        // নতুন ক্লাস পাওয়া গেছে!
        newClassesAdded++;
        const notes = [];

        if (cl.lectureSheetPdf) {
          newSheetsAdded++;
          notes.push({
            id: 'note_' + cleanLecId + '_lec',
            title: 'লেকচার শিট (PDF)',
            type: 'lecture_sheet',
            size: '4.5 MB',
            pages: 12,
            pdfUrl: cl.lectureSheetPdf,
            downloadCount: 180,
            fileType: 'pdf',
            fileSize: '4.5 MB',
            url: cl.lectureSheetPdf
          });
        }

        if (cl.practiceSheetPdf) {
          newSheetsAdded++;
          notes.push({
            id: 'note_' + cleanLecId + '_prac',
            title: 'প্র্যাকটিস শিট (PDF)',
            type: 'practice_sheet',
            size: '3.2 MB',
            pages: 8,
            pdfUrl: cl.practiceSheetPdf,
            downloadCount: 140,
            fileType: 'pdf',
            fileSize: '3.2 MB',
            url: cl.practiceSheetPdf
          });
        }

        const classTitle = (cl.title || cl.classTitle || cl.description || '').trim() || `Class: ${parentTitle}`;
        const newLecture = {
          id: 'lec_' + cleanLecId,
          title: classTitle,
          duration: cl.duration || '1:45:00',
          videoUrl: resolveVideoUrl(cl),
          isFreePreview: false,
          notes
        };

        targetModule.lectures.push(newLecture);
        existingLectureMap.set(cleanLecId, { lecture: newLecture, module: targetModule });
        console.log(`   ✨ [+ নতুন ক্লাস] ${parentTitle} -> ${classTitle}`);
      });
    }

    // নতুন ডেটার সব বিষয় ও অধ্যায় প্রসেস করা
    const rawSubjects = rawData.subjects || [];
    rawSubjects.forEach((sub, sIdx) => {
      const rawChapters = sub.chapters || [];
      const subTitle = sub.title || `বিষয় ${sIdx + 1}`;

      rawChapters.forEach((ch, cIdx) => {
        const classes = ch.classes || [];
        if (classes.length === 0) return;

        const modId = 'mod_' + ch.id;
        let targetMod = existingCourse.modules.find(m => m.id === modId || m.id.includes(ch.id));

        if (!targetMod) {
          // আগে ফাঁকা থাকা অধ্যায়ে নতুন ক্লাস যোগ হয়েছে
          const chapTitle = ch.title || `অধ্যায় ${cIdx + 1}`;
          let parentSec = existingCourse.sections.find(s => s.id.includes(sub.id));
          if (!parentSec) {
            parentSec = {
              id: 'sec_' + sub.id,
              title: subTitle,
              type: 'subject',
              order: existingCourse.sections.length + 1
            };
            existingCourse.sections.push(parentSec);
          }

          targetMod = {
            id: modId,
            title: chapTitle.startsWith('Chapter') ? chapTitle : `Chapter ${cIdx + 1}: ${chapTitle}`,
            order: cIdx + 1,
            parentSectionId: parentSec.id,
            parentSectionTitle: parentSec.title,
            parentSectionType: 'subject',
            lectures: []
          };
          existingCourse.modules.push(targetMod);
          console.log(`   📑 [+ নতুন অধ্যায় চালু হয়েছে] ${subTitle} -> ${chapTitle}`);
        }

        syncChapterClasses(targetMod, classes, targetMod.title);
      });
    });

    // আর্কাইভ সিঙ্ক (যদি ফাইলে থাকে)
    if (rawData.archive && rawData.archive.subjects?.length > 0) {
      const arcData = rawData.archive;
      let arcSection = existingCourse.sections.find(s => s.type === 'archive');
      if (!arcSection) {
        arcSection = {
          id: 'sec_archive_' + cleanId,
          title: arcData.title || 'আর্কাইভ ব্যাচ (Previous Batch Archive)',
          type: 'archive',
          isArchive: true,
          order: existingCourse.sections.length + 1
        };
        existingCourse.sections.push(arcSection);
      }

      arcData.subjects.forEach((arcSub, sIdx) => {
        const arcChapters = arcSub.chapters || [];
        const totalClassesInArcSub = arcChapters.reduce((acc, c) => acc + (c.classes?.length || 0), 0);
        if (totalClassesInArcSub === 0) return;

        const arcSubSecId = 'sec_arc_sub_' + (arcSub.id || sIdx + 1);
        let arcSubSec = existingCourse.sections.find(s => s.id === arcSubSecId);
        if (!arcSubSec) {
          arcSubSec = {
            id: arcSubSecId,
            title: arcSub.title,
            type: 'subject',
            isArchive: true,
            parentArchiveId: arcSection.id,
            order: existingCourse.sections.length + 1
          };
          existingCourse.sections.push(arcSubSec);
        }

        arcChapters.forEach((ch, cIdx) => {
          const classes = ch.classes || [];
          if (classes.length === 0) return;

          const modId = 'mod_arc_' + (ch.id || `${sIdx + 1}_${cIdx + 1}`);
          let targetMod = existingCourse.modules.find(m => m.id === modId || m.id.includes(ch.id));

          if (!targetMod) {
            const chTitle = ch.title && !ch.title.startsWith('অধ্যায়') ? ch.title : cleanChapterTitle(classes[0]?.title, `অধ্যায় ${cIdx + 1}`);
            targetMod = {
              id: modId,
              title: chTitle.startsWith('Chapter') ? chTitle : `Chapter ${cIdx + 1}: ${chTitle}`,
              order: cIdx + 1,
              parentSectionId: arcSubSec.id,
              parentSectionTitle: arcSub.title,
              parentSectionType: 'subject',
              parentArchiveId: arcSection.id,
              isArchive: true,
              lectures: []
            };
            existingCourse.modules.push(targetMod);
          }

          syncChapterClasses(targetMod, classes, targetMod.title);
        });
      });
    }

    const currentLectureCount = existingCourse.modules.reduce((acc, m) => acc + (m.lectures?.length || 0), 0);
    const currentSheetCount = existingCourse.modules.reduce((acc, m) => acc + m.lectures.reduce((sAcc, l) => sAcc + (l.notes?.length || 0), 0), 0);

    existingCourse.totalLectures = currentLectureCount;
    existingCourse.totalSheets = currentSheetCount;

    const fileContent = `import { Course } from '@/types';\n\nexport const ${variableName}: Course = ${JSON.stringify(existingCourse, null, 2)};\n`;
    fs.writeFileSync(outFilePath, fileContent, 'utf8');

    console.log('\n=========================================================');
    console.log(`🎉 কোর্স অটো-সিঙ্ক সম্পন্ন হয়েছে!`);
    console.log(`📌 কোর্স শিরোনাম: ${existingCourse.title}`);
    console.log(`📊 পূর্বের মোট ক্লাস: ${prevLectureCount} টি`);
    console.log(`✨ নতুন ক্লাস যুক্ত হয়েছে: ${newClassesAdded} টি`);
    console.log(`📄 নতুন শিট যুক্ত হয়েছে: ${newSheetsAdded} টি`);
    console.log(`🔄 ক্লাস তথ্য আপডেট হয়েছে: ${classesUpdated} টি`);
    console.log(`🛡️ ডুপ্লিকেট রোধ করা হয়েছে: ${duplicateSkipped} টি ক্লাস অক্ষত`);
    console.log(`🎯 বর্তমান সর্বমোট ক্লাস: ${currentLectureCount} টি`);
    console.log(`📁 ফাইল সেভ হয়েছে: src/lib/${outFileName}`);
    console.log('=========================================================\n');
    return;
  }

  // ২. যদি কোর্সটি একদম নতুন হয় (New Course Import)
  console.log('\n⚡ নতুন কোর্স ইম্পোর্ট মোড চালু হচ্ছে: "' + courseTitle + '" [ID: ' + courseId + ']');

  const sections = [];
  const modules = [];
  let totalLectures = 0;
  let totalSheets = 0;

  function processClasses(classes, parentTitle) {
    return (classes || []).map((cl, clIdx) => {
      totalLectures++;
      const notes = [];

      if (cl.lectureSheetPdf) {
        totalSheets++;
        notes.push({
          id: 'note_' + (cl.id || totalLectures) + '_lec',
          title: 'লেকচার শিট (PDF)',
          type: 'lecture_sheet',
          size: '4.5 MB',
          pages: 12,
          pdfUrl: cl.lectureSheetPdf,
          downloadCount: 180,
          fileType: 'pdf',
          fileSize: '4.5 MB',
          url: cl.lectureSheetPdf
        });
      }

      if (cl.practiceSheetPdf) {
        totalSheets++;
        notes.push({
          id: 'note_' + (cl.id || totalLectures) + '_prac',
          title: 'প্র্যাকটিস শিট (PDF)',
          type: 'practice_sheet',
          size: '3.2 MB',
          pages: 8,
          pdfUrl: cl.practiceSheetPdf,
          downloadCount: 140,
          fileType: 'pdf',
          fileSize: '3.2 MB',
          url: cl.practiceSheetPdf
        });
      }

      if (cl.solutionSheetPdf) {
        totalSheets++;
        notes.push({
          id: 'note_' + (cl.id || totalLectures) + '_sol',
          title: 'সল্যুশন শিট (PDF)',
          type: 'practice_sheet',
          size: '2.8 MB',
          pages: 6,
          pdfUrl: cl.solutionSheetPdf,
          downloadCount: 110,
          fileType: 'pdf',
          fileSize: '2.8 MB',
          url: cl.solutionSheetPdf
        });
      }

      const classTitle = (cl.title || cl.classTitle || cl.description || '').trim() || `Class ${clIdx + 1}: ${parentTitle}`;
      return {
        id: 'lec_' + (cl.id || totalLectures),
        title: classTitle,
        duration: cl.duration || '1:45:00',
        videoUrl: resolveVideoUrl(cl),
        isFreePreview: clIdx === 0 && sections.length <= 2,
        notes
      };
    });
  }

  const subjects = rawData.subjects || [];
  subjects.forEach((sub, subIdx) => {
    const rawChapters = sub.chapters || [];
    const totalClassesInSubject = rawChapters.reduce((acc, c) => acc + (c.classes?.length || 0), 0);
    if (totalClassesInSubject === 0 && subjects.length > 5) return;

    const subTitle = sub.title || `বিষয় ${subIdx + 1}`;
    const isBangla = /বাংলা|bangla/i.test(subTitle);
    const isEnglish = /english|ইংরেজি/i.test(subTitle);

    if ((isBangla || isEnglish) && rawChapters.length >= 2) {
      rawChapters.forEach((ch, chIdx) => {
        const classes = ch.classes || [];
        if (classes.length === 0) return;

        const paperTitle = isBangla
          ? (chIdx === 0 ? 'বাংলা ১ম পত্র (সাহিত্য)' : 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)')
          : (chIdx === 0 ? 'English 1st Paper' : 'English 2nd Paper');

        const secId = 'sec_' + sub.id + '_p' + (chIdx + 1);
        sections.push({
          id: secId,
          title: paperTitle,
          type: 'subject',
          order: sections.length + 1
        });

        const modId = 'mod_' + ch.id;
        const chapterTitle = ch.title || cleanChapterTitle(classes[0]?.title, `অধ্যায় ${chIdx + 1}`);
        const lectures = processClasses(classes, chapterTitle);

        modules.push({
          id: modId,
          title: chapterTitle.startsWith('Chapter') ? chapterTitle : `Chapter ${chIdx + 1}: ${chapterTitle}`,
          order: 1,
          parentSectionId: secId,
          parentSectionTitle: paperTitle,
          parentSectionType: 'subject',
          lectures
        });
      });
      return;
    }

    const secId = 'sec_' + (sub.id || subIdx + 1);
    sections.push({
      id: secId,
      title: subTitle,
      type: 'subject',
      order: sections.length + 1
    });

    let activeChapterOrder = 1;
    rawChapters.forEach((ch, chIdx) => {
      const classes = ch.classes || [];
      if (classes.length === 0) return;

      const modId = 'mod_' + (ch.id || `${subIdx + 1}_${chIdx + 1}`);
      const inferredChapterTitle = ch.title || cleanChapterTitle(classes[0]?.title, `অধ্যায় ${activeChapterOrder}`);
      const lectures = processClasses(classes, inferredChapterTitle);

      modules.push({
        id: modId,
        title: inferredChapterTitle.startsWith('Chapter') ? inferredChapterTitle : `Chapter ${activeChapterOrder}: ${inferredChapterTitle}`,
        order: activeChapterOrder,
        parentSectionId: secId,
        parentSectionTitle: subTitle,
        parentSectionType: 'subject',
        lectures
      });

      activeChapterOrder++;
    });
  });

  // আর্কাইভ প্রসেসিং
  if (rawData.archive && rawData.archive.subjects?.length > 0) {
    const arcData = rawData.archive;
    const arcSectionId = 'sec_archive_' + cleanId;

    sections.push({
      id: arcSectionId,
      title: arcData.title || 'আর্কাইভ ব্যাচ (Previous Batch Archive)',
      type: 'archive',
      isArchive: true,
      order: sections.length + 1
    });

    arcData.subjects.forEach((arcSub, arcSubIdx) => {
      const arcChapters = arcSub.chapters || [];
      const totalArcClasses = arcChapters.reduce((acc, c) => acc + (c.classes?.length || 0), 0);
      if (totalArcClasses === 0) return;

      const arcSubSecId = 'sec_arc_sub_' + (arcSub.id || arcSubIdx + 1);
      const arcSubTitle = arcSub.title || `আর্কাইভ বিষয় ${arcSubIdx + 1}`;

      sections.push({
        id: arcSubSecId,
        title: arcSubTitle,
        type: 'subject',
        isArchive: true,
        parentArchiveId: arcSectionId,
        order: sections.length + 1
      });

      arcChapters.forEach((ch, chIdx) => {
        const classes = ch.classes || [];
        if (classes.length === 0) return;

        const modId = 'mod_arc_' + (ch.id || `${arcSubIdx + 1}_${chIdx + 1}`);
        const chTitle = ch.title || cleanChapterTitle(classes[0]?.title, `অধ্যায় ${chIdx + 1}`);
        const lectures = processClasses(classes, chTitle);

        modules.push({
          id: modId,
          title: chTitle.startsWith('Chapter') ? chTitle : `Chapter ${chIdx + 1}: ${chTitle}`,
          order: chIdx + 1,
          parentSectionId: arcSubSecId,
          parentSectionTitle: arcSubTitle,
          parentSectionType: 'subject',
          parentArchiveId: arcSectionId,
          isArchive: true,
          lectures
        });
      });
    });
  }

  const courseObj = {
    id: courseId,
    title: courseTitle,
    slug: courseSlug,
    category: /hsc/i.test(courseTitle) ? 'HSC' : 'Engineering',
    level: /hsc/i.test(courseTitle) ? 'HSC 2026 রিভিশন' : 'ভার্সিটি ও ইঞ্জিনিয়ারিং এডমিশন',
    batch: /hsc/i.test(courseTitle) ? 'HSC 26 FRB Batch' : 'ACS স্পেশাল প্রাইভেট ব্যাচ',
    badge: '🔥 মেগা কোর্স',
    coverImage: '/courses/frb26_banner.png',
    tagline: 'অনলাইনে একাডেমিক ও এডমিশনের সবচেয়ে জনপ্রিয় ও অভিজ্ঞ শিক্ষক মন্ডলীকে নিয়ে একটি কম্প্যাক্ট কোর্স',
    description: `${courseTitle} — উচ্চতর প্রস্তুতি ও কনসেপ্ট মাস্টারির জন্য বিশেষ প্রোগ্রাম।`,
    instructor: {
      name: 'অপার, মাশরুর, অপূর্ব, সঞ্জয় ও টিম',
      designation: 'ACS সিনিয়র লিড মেন্টরস',
      institution: 'BUET & Top Engineering Universities',
      avatar: 'https://i.postimg.cc/RFKgPcNF/Screenshot-109.png'
    },
    regularPrice: 6500,
    offerPrice: 5250,
    discountPercentage: 19,
    enrolledCount: 6850,
    rating: 4.9,
    reviewCount: 2450,
    totalLectures: totalLectures,
    totalExams: 25,
    totalSheets: totalSheets,
    features: [
      `${totalLectures}+ স্পেশাল ভিডিও ক্লাস ও লেকচার শিট`,
      'অধ্যায়ভিত্তিক লেকচার শিট, প্র্যাকটিস শিট ও সল্যুশন বুকলেট (PDF)',
      'আর্কাইভ ব্যাচের পূর্ববর্তী বছরের পূর্ণাঙ্গ ক্লাস এক্সেস',
      'বোর্ড স্ট্যান্ডার্ড প্রস্তুতি ও ডাউট সলভিং সাপোর্ট'
    ],
    faq: [
      { question: 'কোর্সটির মেয়াদ কতদিন থাকবে?', answer: 'আপনার পরীক্ষা শেষ হওয়া পর্যন্ত সকল ক্লাস ও শিট এক্সেস থাকবে।' },
      { question: 'লেকচার শিটগুলো কি প্রিন্ট করা যাবে?', answer: 'হ্যাঁ, হাই-কোয়ালিটি PDF শিট ডাউনলোড ও প্রিন্ট করা যাবে।' }
    ],
    sections,
    modules
  };

  const fileContent = `import { Course } from '@/types';\n\nexport const ${variableName}: Course = ${JSON.stringify(courseObj, null, 2)};\n`;
  fs.writeFileSync(outFilePath, fileContent, 'utf8');

  // রেজিস্টার ইন mockData.ts
  const mockDataPath = path.join(process.cwd(), 'src', 'lib', 'mockData.ts');
  let mockContent = fs.readFileSync(mockDataPath, 'utf8');
  const importLine = `import { ${variableName} } from '@/lib/${outFileName.replace(/\.ts$/, '')}';`;

  if (!mockContent.includes(importLine)) {
    mockContent = `${importLine}\n` + mockContent;
  }
  if (!mockContent.includes(variableName + ',')) {
    mockContent = mockContent.replace(
      /export const mockCourses: Course\[\] = \[/,
      `export const mockCourses: Course[] = [\n  ${variableName},`
    );
  }
  fs.writeFileSync(mockDataPath, mockContent, 'utf8');

  console.log('\n=========================================================');
  console.log(`🎉 নতুন কোর্স সফলভাবে তৈরি হয়েছে!`);
  console.log(`📌 কোর্স শিরোনাম: ${courseTitle}`);
  console.log(`📌 বিষয় সংখ্যা: ${sections.length}`);
  console.log(`📌 মোট অধ্যায়: ${modules.length}`);
  console.log(`📌 মোট ক্লাস: ${totalLectures}`);
  console.log(`📌 মোট শিট: ${totalSheets}`);
  console.log(`🌐 ভিজিট করুন: http://localhost:3000/courses/${courseSlug}`);
  console.log('=========================================================\n');
}

run();
