import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Course, CourseSection, CourseModule, Lecture, ResourceNote } from '@/types';

function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0980-\u09FF-]+/g, '')
    .replace(/--+/g, '-');
}

function cleanChapterTitle(desc: string | undefined, defaultTitle: string): string {
  if (!desc || !desc.trim()) return defaultTitle;
  const cleaned = desc.trim()
    .replace(/\s*-\s*\d+.*$/i, '')
    .replace(/-\d+.*$/i, '')
    .replace(/\s*Class\s*\d+.*$/i, '')
    .trim();
  return cleaned || defaultTitle;
}

function resolveVideoUrl(cl: any): string {
  const rawVid = (cl.videoUrl || cl.videoId || '').trim();
  const hosting = (cl.hostingType || '').toLowerCase();
  const libId = cl.libraryId || '610687';

  if (!rawVid) return '';

  // 1. HTTP / HTTPS URL
  if (rawVid.startsWith('http')) {
    if (/youtube\.com|youtu\.be/i.test(rawVid)) {
      return rawVid;
    } else if (rawVid.includes('mediadelivery.net') && rawVid.includes('/embed/')) {
      const m = rawVid.match(/(?:embed|play)\/([a-zA-Z0-9]+)\/([a-zA-Z0-9_-]+)/i);
      if (m) {
        return `/api/player?lib=${m[1]}&video=${m[2]}`;
      }
      return rawVid;
    } else {
      const m = rawVid.match(/(?:vz-([a-zA-Z0-9]+)\.b-cdn\.net|iframe\.mediadelivery\.net\/(?:embed|play)\/([a-zA-Z0-9]+))\/([a-zA-Z0-9_-]+)/i);
      if (m) {
        const foundLib = m[1] || m[2] || libId;
        const vid = m[3];
        return `/api/player?lib=${foundLib}&video=${vid}`;
      }
      return rawVid;
    }
  }

  // 2. YouTube (premyt / 11-char ID)
  if (hosting === 'premyt' || hosting === 'youtube' || hosting === 'yt' || /^[a-zA-Z0-9_-]{11}$/.test(rawVid)) {
    return `https://www.youtube.com/watch?v=${rawVid}`;
  }

  // 3. BunnyCDN Video UUID বা room_id
  return `/api/player?lib=${libId}&video=${rawVid}`;
}

function formatDrivePdf(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'string' && val.startsWith('http')) return val;
  return `https://drive.google.com/file/d/${val}/view`;
}

export async function processCourseImport(rawData: any) {
  try {
    if (!rawData || (!rawData.subjects && !rawData.archive)) {
      return { success: false, message: 'অবৈধ কোর্স ডেটা ফরম্যাট। কোনো বিষয় বা অধ্যায় খুঁজে পাওয়া যায়নি।' };
    }

    const courseTitle = rawData.courseTitle || 'ACS Course';
    let cleanId = (rawData.courseId ? rawData.courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) : 'course_' + Date.now());

    if (cleanId === 'c82195b9' || rawData.courseId?.includes('c82195b9') || /frb/i.test(courseTitle)) {
      cleanId = 'frb26';
    }

    const courseSlug = rawData.slug || slugify(courseTitle) || ('acs-course-' + cleanId);
    const courseId = 'course_acs_' + cleanId;
    const variableName = 'acsCourse_' + cleanId;

    const outFileName = courseSlug.replace(/[^a-zA-Z0-9]/g, '_') + '_data.ts';
    const libDir = path.join(process.cwd(), 'src', 'lib');
    const outFilePath = path.join(libDir, outFileName);

    // চেক করা বিদ্যমান কোনো কোর্স আছে কি না (যদি forceNew না হয়)
    let existingCourse: Course | null = null;
    let existingTargetFile = outFilePath;

    if (!rawData.forceNew && fs.existsSync(libDir)) {
      const libFiles = fs.readdirSync(libDir).filter(f => f.endsWith('_data.ts'));
      const targetSearchId = rawData.targetCourseId || courseId;

      for (const f of libFiles) {
        const fPath = path.join(libDir, f);
        const content = fs.readFileSync(fPath, 'utf8');
        
        const isMatch = rawData.targetCourseId 
          ? content.includes(`"${rawData.targetCourseId}"`)
          : (content.includes(`"${courseId}"`) || (cleanId.length >= 6 && content.includes(`"course_acs_${cleanId}"`)));

        if (isMatch) {
          try {
            const jsonStr = content.replace(/^import [^;]+;\s*export const \w+: Course = /, '').replace(/;?\s*$/, '');
            existingCourse = JSON.parse(jsonStr);
            existingTargetFile = fPath;
            break;
          } catch (e) {}
        }
      }
    }

    // =========================================================================
    // ১. INCREMENTAL SYNC MODE (যদি কোর্সটি ইতিমধ্যে সাইটে থাকে)
    // =========================================================================
    if (existingCourse) {
      const prevLectureCount = existingCourse.modules.reduce((acc, m) => acc + (m.lectures?.length || 0), 0);
      const prevSheetCount = existingCourse.modules.reduce((acc, m) => acc + m.lectures.reduce((sAcc, l) => sAcc + (l.notes?.length || 0), 0), 0);

      let newClassesAdded = 0;
      let newSheetsAdded = 0;
      let classesUpdated = 0;
      let duplicateSkipped = 0;

      if (!existingCourse.sections) existingCourse.sections = [];
      if (!existingCourse.modules) existingCourse.modules = [];

      const existingLectureMap = new Map<string, { lecture: Lecture; module: CourseModule }>();
      existingCourse.modules.forEach(m => {
        m.lectures.forEach(l => {
          const cleanLecId = l.id.replace(/^lec_/, '');
          existingLectureMap.set(cleanLecId, { lecture: l, module: m });
        });
      });

      const syncClasses = (targetMod: CourseModule, classes: any[], parentTitle: string) => {
        classes.forEach((cl, clIdx) => {
          const clId = cl.id || (targetMod.id + '_' + clIdx);
          const cleanLecId = clId.replace(/^lec_/, '');

          if (existingLectureMap.has(cleanLecId)) {
            duplicateSkipped++;
            const existing = existingLectureMap.get(cleanLecId)!.lecture;
            const newVid = resolveVideoUrl(cl);
            if (newVid && (!existing.videoUrl || existing.videoUrl !== newVid)) {
              existing.videoUrl = newVid;
              classesUpdated++;
            }

            const lecSheetUrl = formatDrivePdf(cl.lectureSheet || cl.lectureSheetPdf);
            if (lecSheetUrl && !existing.notes?.some(n => n.type === 'lecture_sheet')) {
              existing.notes = existing.notes || [];
              existing.notes.push({
                id: 'note_' + cleanLecId + '_lec',
                title: 'লেকচার শিট (PDF)',
                type: 'lecture_sheet',
                size: '4.5 MB',
                pages: 12,
                pdfUrl: lecSheetUrl,
                downloadCount: 180,
                fileType: 'pdf',
                fileSize: '4.5 MB',
                url: lecSheetUrl
              });
              newSheetsAdded++;
            }

            const pracSheetUrl = formatDrivePdf(cl.practiceSheet || cl.practiceSheetPdf);
            if (pracSheetUrl && !existing.notes?.some(n => n.type === 'practice_sheet')) {
              existing.notes = existing.notes || [];
              existing.notes.push({
                id: 'note_' + cleanLecId + '_prac',
                title: 'প্র্যাকটিস শিট (PDF)',
                type: 'practice_sheet',
                size: '3.2 MB',
                pages: 8,
                pdfUrl: pracSheetUrl,
                downloadCount: 140,
                fileType: 'pdf',
                fileSize: '3.2 MB',
                url: pracSheetUrl
              });
              newSheetsAdded++;
            }
            return;
          }

          // নতুন ক্লাস পাওয়া গেছে
          newClassesAdded++;
          const notes: ResourceNote[] = [];

          const lecSheetUrl = formatDrivePdf(cl.lectureSheet || cl.lectureSheetPdf);
          if (lecSheetUrl) {
            newSheetsAdded++;
            notes.push({
              id: 'note_' + cleanLecId + '_lec',
              title: 'লেকচার শিট (PDF)',
              type: 'lecture_sheet',
              size: '4.5 MB',
              pages: 12,
              pdfUrl: lecSheetUrl,
              downloadCount: 180,
              fileType: 'pdf',
              fileSize: '4.5 MB',
              url: lecSheetUrl
            });
          }

          const pracSheetUrl = formatDrivePdf(cl.practiceSheet || cl.practiceSheetPdf);
          if (pracSheetUrl) {
            newSheetsAdded++;
            notes.push({
              id: 'note_' + cleanLecId + '_prac',
              title: 'প্র্যাকটিস শিট (PDF)',
              type: 'practice_sheet',
              size: '3.2 MB',
              pages: 8,
              pdfUrl: pracSheetUrl,
              downloadCount: 140,
              fileType: 'pdf',
              fileSize: '3.2 MB',
              url: pracSheetUrl
            });
          }

          const classTitle = (cl.title || cl.classTitle || cl.description || '').trim() || `Class: ${parentTitle}`;
          const newLecture: Lecture = {
            id: 'lec_' + cleanLecId,
            title: classTitle,
            duration: cl.duration || '1:45:00',
            videoUrl: resolveVideoUrl(cl),
            isFreePreview: false,
            notes
          };

          targetMod.lectures.push(newLecture);
          existingLectureMap.set(cleanLecId, { lecture: newLecture, module: targetMod });
        });
      };

      // মেইন সাবজেক্টস সিঙ্ক
      const rawSubjects = rawData.subjects || [];
      rawSubjects.forEach((sub: any, sIdx: number) => {
        const rawChapters = sub.chapters || [];
        const subTitle = sub.title || sub.name || sub.subjectName || `বিষয় ${sIdx + 1}`;

        rawChapters.forEach((ch: any, cIdx: number) => {
          const classes = ch.classes || [];
          if (classes.length === 0) return;

          const modId = 'mod_' + ch.id;
          const courseModules = existingCourse.modules!;
          const courseSections = existingCourse.sections!;
          let targetMod = courseModules.find(m => m.id === modId || m.id.includes(ch.id));

          if (!targetMod) {
            const chapTitle = ch.title || cleanChapterTitle(classes[0]?.title, `অধ্যায় ${cIdx + 1}`);
            let parentSec = courseSections.find(s => s.id.includes(sub.id));
            if (!parentSec) {
              parentSec = {
                id: 'sec_' + sub.id,
                title: subTitle,
                type: 'subject',
                order: courseSections.length + 1
              };
              courseSections.push(parentSec);
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
            courseModules.push(targetMod);
          }

          syncClasses(targetMod, classes, targetMod.title);
        });
      });

      // আর্কাইভ সিঙ্ক
      if (rawData.archive && rawData.archive.subjects?.length > 0) {
        const arcData = rawData.archive;
        const courseSections = existingCourse.sections!;
        const courseModules = existingCourse.modules!;
        let arcSection = courseSections.find(s => s.type === 'archive');
        if (!arcSection) {
          arcSection = {
            id: 'sec_archive_' + cleanId,
            title: arcData.title || 'আর্কাইভ ব্যাচ (Previous Batch Archive)',
            type: 'archive',
            isArchive: true,
            order: courseSections.length + 1
          };
          courseSections.push(arcSection);
        }

        arcData.subjects.forEach((arcSub: any, sIdx: number) => {
          const arcChapters = arcSub.chapters || [];
          const totalClassesInArcSub = arcChapters.reduce((acc: number, c: any) => acc + (c.classes?.length || 0), 0);
          if (totalClassesInArcSub === 0) return;

          const arcSubSecId = 'sec_arc_sub_' + (arcSub.id || sIdx + 1);
          let arcSubSec = courseSections.find(s => s.id === arcSubSecId);
          if (!arcSubSec) {
            arcSubSec = {
              id: arcSubSecId,
              title: arcSub.title || `আর্কাইভ বিষয় ${sIdx + 1}`,
              type: 'subject',
              isArchive: true,
              parentArchiveId: arcSection!.id,
              order: courseSections.length + 1
            };
            courseSections.push(arcSubSec);
          }

          arcChapters.forEach((ch: any, cIdx: number) => {
            const classes = ch.classes || [];
            if (classes.length === 0) return;

            const modId = 'mod_arc_' + (ch.id || `${sIdx + 1}_${cIdx + 1}`);
            let targetMod = courseModules.find(m => m.id === modId || m.id.includes(ch.id));

            if (!targetMod) {
              const chTitle = ch.title && !ch.title.startsWith('অধ্যায়') ? ch.title : cleanChapterTitle(classes[0]?.title, `অধ্যায় ${cIdx + 1}`);
              targetMod = {
                id: modId,
                title: chTitle.startsWith('Chapter') ? chTitle : `Chapter ${cIdx + 1}: ${chTitle}`,
                order: cIdx + 1,
                parentSectionId: arcSubSec!.id,
                parentSectionTitle: arcSubSec!.title,
                parentSectionType: 'subject',
                parentArchiveId: arcSection!.id,
                isArchive: true,
                lectures: []
              };
              courseModules.push(targetMod);
            }

            syncClasses(targetMod, classes, targetMod.title);
          });
        });
      }

      existingCourse.totalLectures = existingCourse.modules.reduce((acc, m) => acc + (m.lectures?.length || 0), 0);
      existingCourse.totalSheets = existingCourse.modules.reduce((acc, m) => acc + m.lectures.reduce((sAcc, l) => sAcc + (l.notes?.length || 0), 0), 0);

      const fileContent = `import { Course } from '@/types';\n\nexport const ${variableName}: Course = ${JSON.stringify(existingCourse, null, 2)};\n`;
      fs.writeFileSync(existingTargetFile, fileContent, 'utf8');

      return {
        success: true,
        isNew: false,
        diff: {
          courseTitle: existingCourse.title,
          prevLectureCount,
          prevSheetCount,
          newClassesAdded,
          newSheetsAdded,
          classesUpdated,
          duplicateSkipped,
          currentLectureCount: existingCourse.totalLectures,
          currentSheetCount: existingCourse.totalSheets
        },
        course: existingCourse
      };
    }

    // =========================================================================
    // ২. NEW COURSE IMPORT MODE (যদি কোর্সটি সম্পূর্ণ নতুন হয়)
    // =========================================================================
    const sections: CourseSection[] = [];
    const modules: CourseModule[] = [];
    let totalLectures = 0;
    let totalSheets = 0;

    function processNewClasses(classes: any[], parentTitle: string) {
      return (classes || []).map((cl: any, clIdx: number) => {
        totalLectures++;
        const notes: ResourceNote[] = [];

        const lecSheetUrl = formatDrivePdf(cl.lectureSheet || cl.lectureSheetPdf);
        if (lecSheetUrl) {
          totalSheets++;
          notes.push({
            id: 'note_' + (cl.id || totalLectures) + '_lec',
            title: 'লেকচার শিট (PDF)',
            type: 'lecture_sheet',
            size: '4.5 MB',
            pages: 12,
            pdfUrl: lecSheetUrl,
            downloadCount: 180,
            fileType: 'pdf',
            fileSize: '4.5 MB',
            url: lecSheetUrl
          });
        }

        const pracSheetUrl = formatDrivePdf(cl.practiceSheet || cl.practiceSheetPdf);
        if (pracSheetUrl) {
          totalSheets++;
          notes.push({
            id: 'note_' + (cl.id || totalLectures) + '_prac',
            title: 'প্র্যাকটিস শিট (PDF)',
            type: 'practice_sheet',
            size: '3.2 MB',
            pages: 8,
            pdfUrl: pracSheetUrl,
            downloadCount: 140,
            fileType: 'pdf',
            fileSize: '3.2 MB',
            url: pracSheetUrl
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

    const rawSubjects = rawData.subjects || [];
    rawSubjects.forEach((sub: any, subIdx: number) => {
      const rawChapters = sub.chapters || [];
      const totalClassesInSubject = rawChapters.reduce((acc: number, c: any) => acc + (c.classes?.length || 0), 0);
      if (totalClassesInSubject === 0 && rawSubjects.length > 5) return;

      const subTitle = sub.title || sub.name || sub.subjectName || `বিষয় ${subIdx + 1}`;
      const isBangla = /বাংলা|bangla/i.test(subTitle);
      const isEnglish = /english|ইংরেজি/i.test(subTitle);

      if ((isBangla || isEnglish) && rawChapters.length >= 2) {
        rawChapters.forEach((ch: any, chIdx: number) => {
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
          const lectures = processNewClasses(classes, chapterTitle);

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
      rawChapters.forEach((ch: any, chIdx: number) => {
        const classes = ch.classes || [];
        if (classes.length === 0) return;

        const modId = 'mod_' + (ch.id || `${subIdx + 1}_${chIdx + 1}`);
        const inferredChapterTitle = ch.title || cleanChapterTitle(classes[0]?.title, `অধ্যায় ${activeChapterOrder}`);
        const lectures = processNewClasses(classes, inferredChapterTitle);

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

    // নতুন কোর্সের আর্কাইভ
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

      arcData.subjects.forEach((arcSub: any, arcSubIdx: number) => {
        const arcChapters = arcSub.chapters || [];
        const totalArcClasses = arcChapters.reduce((acc: number, c: any) => acc + (c.classes?.length || 0), 0);
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

        arcChapters.forEach((ch: any, chIdx: number) => {
          const classes = ch.classes || [];
          if (classes.length === 0) return;

          const modId = 'mod_arc_' + (ch.id || `${arcSubIdx + 1}_${chIdx + 1}`);
          const chTitle = ch.title || cleanChapterTitle(classes[0]?.title, `অধ্যায় ${chIdx + 1}`);
          const lectures = processNewClasses(classes, chTitle);

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

    const newCourseObj: Course = {
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
      totalLectures,
      totalExams: 25,
      totalSheets,
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
      modules,
      isDraft: true
    };

    const fileContent = `import { Course } from '@/types';\n\nexport const ${variableName}: Course = ${JSON.stringify(newCourseObj, null, 2)};\n`;
    fs.writeFileSync(outFilePath, fileContent, 'utf8');

    // Save to real database (data/courses.json)
    try {
      const { db } = await import('@/lib/db');
      const existing = await db.findOneAsync<any>('courses', (c: any) => c.id === newCourseObj.id);
      if (existing) {
        await db.updateAsync('courses', newCourseObj.id, newCourseObj);
      } else {
        await db.createAsync('courses', newCourseObj);
      }
    } catch (dbErr) {
      console.warn('DB save warning in course import:', dbErr);
    }

    return {
      success: true,
      isNew: true,
      diff: {
        courseTitle,
        totalSubjects: sections.length,
        totalModules: modules.length,
        totalLectures,
        totalSheets
      },
      course: newCourseObj
    };
  } catch (err: any) {
    console.error('Course import error:', err);
    return { success: false, message: 'কোর্স প্রসেস করতে ব্যর্থ হয়েছে: ' + err.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    const result = await processCourseImport(rawData);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    console.error('POST /api/course/import error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
