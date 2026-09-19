import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/db';
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

import { 
  CHAPTER_SYNONYMS, 
  cleanAndNormalizeChapterTitle, 
  isGenericChapterTitle, 
  inferChapterTitleFromClasses, 
  resolveChapterTitle, 
  isGenericSubjectTitle, 
  inferSubjectTitleFromChapters, 
  resolveSubjectTitle, 
  healCourse 
} from '@/lib/courseSubjectNormalizer';

function cleanChapterTitle(desc: string | undefined, defaultTitle: string): string {
  if (!desc || !desc.trim()) return defaultTitle;
  const inferred = cleanAndNormalizeChapterTitle(desc);
  return inferred || defaultTitle;
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
    if (!rawData) {
      return { success: false, message: 'অবৈধ কোর্স ডেটা ফরম্যাট।' };
    }

    // A. Direct chapters support
    if (rawData.chapters && !rawData.subjects) {
      rawData.subjects = [{
        id: 'sub_1',
        title: rawData.courseTitle || 'মূল বিষয়সমূহ',
        chapters: rawData.chapters
      }];
    }

    // B. Sections/Modules support
    if ((rawData.sections || rawData.modules) && !rawData.subjects) {
      const subMap = new Map<string, any>();
      (rawData.sections || []).forEach((sec: any) => {
        subMap.set(sec.id, { id: sec.id, title: sec.title, isArchive: !!sec.isArchive, chapters: [] });
      });
      (rawData.modules || []).forEach((mod: any) => {
        const secId = mod.parentSectionId || 'default_sec';
        if (!subMap.has(secId)) {
          subMap.set(secId, { id: secId, title: mod.parentSectionTitle || 'মূল বিষয়সমূহ', isArchive: !!mod.isArchive, chapters: [] });
        }
        const sub = subMap.get(secId);
        if (sub) {
          sub.chapters.push({
            id: mod.id,
            title: mod.title,
            classes: (mod.lectures || []).map((l: any, idx: number) => ({
              id: l.id || ('cl_' + idx),
              classNo: (idx + 1).toString(),
              title: l.title,
              videoUrl: l.videoUrl,
              lectureSheetPdf: l.notes?.find((n: any) => n.type === 'lecture_sheet')?.pdfUrl,
              practiceSheetPdf: l.notes?.find((n: any) => n.type === 'practice_sheet')?.pdfUrl,
              solutionSheetPdf: l.notes?.find((n: any) => n.type === 'handnote')?.pdfUrl
            }))
          });
        }
      });
      rawData.subjects = Array.from(subMap.values());
    }

    if (!rawData.subjects && !rawData.archive) {
      return { success: false, message: 'অবৈধ কোর্স ডেটা ফরম্যাট। কোনো বিষয় বা অধ্যায় খুঁজে পাওয়া যায়নি।' };
    }

    const courseTitle = rawData.courseTitle || 'ACS Course';
    let cleanId = (rawData.courseId ? rawData.courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) : 'course_' + Date.now());

    if (cleanId === 'c82195b9' || rawData.courseId?.includes('c82195b9') || /frb/i.test(courseTitle)) {
      cleanId = 'frb26';
    }

    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const baseSlug = rawData.slug || slugify(courseTitle) || ('acs-course-' + cleanId);
    const courseSlug = rawData.forceNew ? `${baseSlug}-${uniqueSuffix}` : baseSlug;
    const courseId = rawData.forceNew ? `course_acs_${cleanId}_${uniqueSuffix}` : `course_acs_${cleanId}`;
    const variableName = 'acsCourse_' + cleanId + (rawData.forceNew ? '_' + uniqueSuffix : '');

    const outFileName = courseSlug.replace(/[^a-zA-Z0-9]/g, '_') + '_data.ts';
    const libDir = path.join(process.cwd(), 'src', 'lib');
    const outFilePath = path.join(libDir, outFileName);

    // চেক করা বিদ্যমান কোনো কোর্স আছে কি না (যদি forceNew না হয়)
    let existingCourse: Course | null = null;
    let existingTargetFile = outFilePath;

    if (!rawData.forceNew) {
      // ১. ডাটাবেজ (MongoDB Atlas / data/courses.json) থেকে বিদ্যমান কোর্স খোঁজা
      try {
        const { db } = await import('@/lib/db');
        const dbCourse = await db.findOneAsync<any>('courses', (c: any) => {
          if (rawData.targetCourseId && (c.id === rawData.targetCourseId || c.slug === rawData.targetCourseId)) return true;
          if (courseId && (c.id === courseId || c.slug === courseSlug)) return true;
          if (cleanId.length >= 6 && c.id && c.id.includes(cleanId)) return true;
          if (courseTitle && c.title && c.title.toLowerCase().trim() === courseTitle.toLowerCase().trim()) return true;
          return false;
        });
        if (dbCourse) {
          existingCourse = dbCourse;
        }
      } catch (dbErr) {
        console.warn('DB lookup error for existing course:', dbErr);
      }

      // ২. যদি ডাটাবেজে না পাওয়া যায়, তবে লোকাল lib ফাইলে খোঁজা
      if (!existingCourse && fs.existsSync(libDir)) {
        const libFiles = fs.readdirSync(libDir).filter(f => f.endsWith('_data.ts'));
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
        const rawSubTitle = sub.title || sub.name || sub.subjectName || sub.courseSubject?.title || sub.courseSubjectName || sub.courseSubject?.name;
        const subTitle = resolveSubjectTitle(rawSubTitle, rawChapters, sIdx + 1);

        rawChapters.forEach((ch: any, cIdx: number) => {
          const classes = ch.classes || [];
          if (classes.length === 0) return;

          const modId = 'mod_' + ch.id;
          const courseModules = existingCourse.modules!;
          const courseSections = existingCourse.sections!;
          let targetMod = courseModules.find(m => m.id === modId || m.id.includes(ch.id));

          if (!targetMod) {
            const chapTitle = resolveChapterTitle(ch.title, classes, cIdx + 1);
            let parentSec = courseSections.find(s => s.id.includes(sub.id));
            if (!parentSec) {
              parentSec = {
                id: 'sec_' + sub.id,
                title: subTitle,
                type: 'subject',
                order: courseSections.length + 1
              };
              courseSections.push(parentSec);
            } else if (isGenericSubjectTitle(parentSec.title) && !isGenericSubjectTitle(subTitle)) {
              parentSec.title = subTitle;
            }

            targetMod = {
              id: modId,
              title: chapTitle,
              order: cIdx + 1,
              parentSectionId: parentSec.id,
              parentSectionTitle: parentSec.title,
              parentSectionType: 'subject',
              lectures: []
            };
            courseModules.push(targetMod);
          } else if (isGenericChapterTitle(targetMod.title)) {
            targetMod.title = resolveChapterTitle(ch.title, classes, cIdx + 1);
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
          const rawArcSubTitle = arcSub.title || arcSub.name || arcSub.subjectName || arcSub.courseSubject?.title || arcSub.courseSubjectName;
          const arcSubTitle = resolveSubjectTitle(rawArcSubTitle, arcChapters, sIdx + 1);
          let arcSubSec = courseSections.find(s => s.id === arcSubSecId);
          if (!arcSubSec) {
            arcSubSec = {
              id: arcSubSecId,
              title: arcSubTitle,
              type: 'subject',
              isArchive: true,
              parentArchiveId: arcSection!.id,
              order: courseSections.length + 1
            };
            courseSections.push(arcSubSec);
          } else if (isGenericSubjectTitle(arcSubSec.title) && !isGenericSubjectTitle(arcSubTitle)) {
            arcSubSec.title = arcSubTitle;
          }

          arcChapters.forEach((ch: any, cIdx: number) => {
            const classes = ch.classes || [];
            if (classes.length === 0) return;

            const modId = 'mod_arc_' + (ch.id || `${sIdx + 1}_${cIdx + 1}`);
            let targetMod = courseModules.find(m => m.id === modId || m.id.includes(ch.id));

            if (!targetMod) {
              const chTitle = resolveChapterTitle(ch.title, classes, cIdx + 1);
              targetMod = {
                id: modId,
                title: chTitle,
                order: cIdx + 1,
                parentSectionId: arcSubSec!.id,
                parentSectionTitle: arcSubSec!.title,
                parentSectionType: 'subject',
                parentArchiveId: arcSection!.id,
                isArchive: true,
                lectures: []
              };
              courseModules.push(targetMod);
            } else if (isGenericChapterTitle(targetMod.title)) {
              targetMod.title = resolveChapterTitle(ch.title, classes, cIdx + 1);
            }

            syncClasses(targetMod, classes, targetMod.title);
          });
        });
      }

      existingCourse.totalLectures = existingCourse.modules.reduce((acc, m) => acc + (m.lectures?.length || 0), 0);
      existingCourse.totalSheets = existingCourse.modules.reduce((acc, m) => acc + m.lectures.reduce((sAcc, l) => sAcc + (l.notes?.length || 0), 0), 0);

      // গুরুত্বপূর্ণ: যদি কোর্সটি পূর্বে লাইভ/পাবলিশড থাকে, তা কোনো অবস্থাতেই ড্রাফট হবে না!
      // সমস্ত পূর্ববর্তী টিচার সেটিংস (মূল্য, ডিসকাউন্ট, কভার ছবি, ডেসক্রিপশন) ১০০% অক্ষত থাকবে।
      if (existingCourse.isPublished === undefined) {
        existingCourse.isPublished = true;
      }
      if (existingCourse.isPublished) {
        existingCourse.isDraft = false;
      } else if (existingCourse.isDraft === undefined) {
        existingCourse.isDraft = false;
      }

      try {
        if (existingTargetFile && fs.existsSync(existingTargetFile)) {
          const fileContent = `import { Course } from '@/types';\n\nexport const ${variableName}: Course = ${JSON.stringify(existingCourse, null, 2)};\n`;
          fs.writeFileSync(existingTargetFile, fileContent, 'utf8');
        }
      } catch (fsErr) {
        console.warn('Vercel read-only filesystem, skipping local file write:', fsErr);
      }

      // Auto-heal entire course hierarchy before database save
      const finalCourse = healCourse(existingCourse);

      // Sync to database
      try {
        const { db, invalidateCollectionCache } = await import('@/lib/db');
        const updated = await db.updateAsync('courses', finalCourse.id, finalCourse);
        if (!updated) {
          await db.createAsync('courses', finalCourse);
        }
        try {
          if (typeof invalidateCollectionCache === 'function') {
            invalidateCollectionCache('courses');
          }
        } catch {}
      } catch (dbErr) {
        console.warn('DB update warning in existing course sync:', dbErr);
      }

      return {
        success: true,
        isNew: false,
        diff: {
          courseTitle: finalCourse.title,
          prevLectureCount,
          prevSheetCount,
          newClassesAdded,
          newSheetsAdded,
          classesUpdated,
          duplicateSkipped,
          currentLectureCount: finalCourse.totalLectures,
          currentSheetCount: finalCourse.totalSheets
        },
        course: finalCourse
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

        const markedBookUrl = formatDrivePdf(cl.markedBook || cl.markedBookPdf);
        if (markedBookUrl) {
          totalSheets++;
          notes.push({
            id: 'note_' + (cl.id || totalLectures) + '_book',
            title: 'দাগানো বই (Marked Book PDF)',
            type: 'handnote',
            size: '8.5 MB',
            pages: 45,
            pdfUrl: markedBookUrl,
            downloadCount: 220,
            fileType: 'pdf',
            fileSize: '8.5 MB',
            url: markedBookUrl
          });
        }

        const solSheetUrl = formatDrivePdf(cl.solutionSheet || cl.solutionSheetPdf);
        if (solSheetUrl) {
          totalSheets++;
          notes.push({
            id: 'note_' + (cl.id || totalLectures) + '_sol',
            title: 'সল্যুশন বুকলেট (Solution PDF)',
            type: 'practice_sheet',
            size: '3.0 MB',
            pages: 10,
            pdfUrl: solSheetUrl,
            downloadCount: 160,
            fileType: 'pdf',
            fileSize: '3.0 MB',
            url: solSheetUrl
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

      const rawSubTitle = (sub.title || sub.name || sub.subjectName || sub.courseSubject?.title || sub.courseSubjectName || sub.courseSubject?.name || '').trim();
      const subTitle = (rawSubTitle && !isGenericSubjectTitle(rawSubTitle))
        ? rawSubTitle
        : resolveSubjectTitle(rawSubTitle, rawChapters, subIdx + 1);

      // পেপার স্প্লিটিং শুধুমাত্র তখনই প্রযোজ্য হবে যদি ডাটাতে সুস্পষ্টভাবে ২টি পত্র থাকে (isMultiPaper === true)
      const isMultiPaperAdmission = sub.isMultiPaper === true && rawChapters.length === 2 && (/বাংলা|bangla/i.test(subTitle) || /english|ইংরেজি/i.test(subTitle));

      if (isMultiPaperAdmission) {
        rawChapters.forEach((ch: any, chIdx: number) => {
          const classes = ch.classes || ch.lectures || [];
          if (classes.length === 0) return;

          const isBangla = /বাংলা|bangla/i.test(subTitle);
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
          const rawChapTitle = (ch.title || ch.name || ch.chapterName || '').trim();
          const chapterTitle = (rawChapTitle && !isGenericChapterTitle(rawChapTitle))
            ? rawChapTitle
            : resolveChapterTitle(rawChapTitle, classes, chIdx + 1);
          const lectures = processNewClasses(classes, chapterTitle);

          modules.push({
            id: modId,
            title: chapterTitle,
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
        const classes = ch.classes || ch.lectures || [];
        if (classes.length === 0) return;

        const modId = 'mod_' + (ch.id || `${subIdx + 1}_${chIdx + 1}`);
        const rawChapTitle = (ch.title || ch.name || ch.chapterName || ch.courseSubjectChapterName || '').trim();
        const chapterTitle = (rawChapTitle && !isGenericChapterTitle(rawChapTitle))
          ? rawChapTitle
          : resolveChapterTitle(rawChapTitle, classes, activeChapterOrder);
        const lectures = processNewClasses(classes, chapterTitle);

        modules.push({
          id: modId,
          title: chapterTitle,
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
        const rawArcSubTitle = arcSub.title || arcSub.name || arcSub.subjectName || arcSub.courseSubject?.title || arcSub.courseSubjectName;
        const arcSubTitle = resolveSubjectTitle(rawArcSubTitle, arcChapters, arcSubIdx + 1);

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
          const chTitle = resolveChapterTitle(ch.title, classes, chIdx + 1);
          const lectures = processNewClasses(classes, chTitle);

          modules.push({
            id: modId,
            title: chTitle,
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
      instructorId: rawData.instructorId || '',
      teacherEmail: rawData.teacherEmail || '',
      teacherPhone: rawData.teacherPhone || '',
      instructor: {
        name: rawData.teacherName || 'অনবোর্ডেড শিক্ষক',
        designation: 'অদম্য সিনিয়র মেন্টর',
        institution: 'শীর্ষ প্রকৌশল ও বিশ্ববিদ্যালয় ফ্যাকাল্টি',
        avatar: 'https://i.postimg.cc/RFKgPcNF/Screenshot-109.png'
      },
      regularPrice: 6500,
      offerPrice: 5250,
      discountPercentage: 19,
      enrolledCount: 0,
      rating: 5.0,
      reviewCount: 0,
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
      isDraft: rawData.forceNew ? true : (rawData.isDraft !== undefined ? Boolean(rawData.isDraft) : true),
      isPublished: rawData.forceNew ? false : (rawData.isPublished !== undefined ? Boolean(rawData.isPublished) : false)
    };

    // Auto-heal entire new course before saving
    const finalCourse = healCourse(newCourseObj);

    try {
      const fileContent = `import { Course } from '@/types';\n\nexport const ${variableName}: Course = ${JSON.stringify(finalCourse, null, 2)};\n`;
      fs.writeFileSync(outFilePath, fileContent, 'utf8');
    } catch (fsErr) {
      console.warn('Vercel read-only filesystem, skipping local file write:', fsErr);
    }

    // Save to real database (data/courses.json & MongoDB Atlas)
    try {
      const { db, invalidateCollectionCache } = await import('@/lib/db');
      const existing = await db.findOneAsync<any>('courses', (c: any) => c.id === finalCourse.id);
      if (existing) {
        await db.updateAsync('courses', finalCourse.id, finalCourse);
      } else {
        await db.createAsync('courses', finalCourse);
      }
      try {
        if (typeof invalidateCollectionCache === 'function') {
          invalidateCollectionCache('courses');
        }
      } catch {}
    } catch (dbErr) {
      console.warn('DB save warning in course import:', dbErr);
    }

    return {
      success: true,
      isNew: true,
      diff: {
        courseTitle,
        totalSubjects: finalCourse.sections?.length || 0,
        totalModules: finalCourse.modules?.length || 0,
        totalLectures,
        totalSheets
      },
      course: finalCourse
    };
  } catch (err: any) {
    console.error('Course import error:', err);
    return { success: false, message: 'কোর্স প্রসেস করতে ব্যর্থ হয়েছে: ' + err.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json();
    const token = request.cookies.get('adommo_auth_token')?.value;
    const authPayload = token ? verifyToken<any>(token) : null;
    if (authPayload) {
      // Authenticated teacher/admin: override or bind ownership
      if (rawData.forceNew || !rawData.instructorId) rawData.instructorId = authPayload.id;
      if (rawData.forceNew || !rawData.teacherEmail) rawData.teacherEmail = authPayload.email;
      if (rawData.forceNew || !rawData.teacherPhone) rawData.teacherPhone = authPayload.phone;
      if (rawData.forceNew || !rawData.teacherName) rawData.teacherName = authPayload.name;
    }
    const result = await processCourseImport(rawData);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    console.error('POST /api/course/import error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
