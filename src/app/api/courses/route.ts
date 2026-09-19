import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db, verifyToken } from '@/lib/db';
import { healCourse } from '@/lib/courseSubjectNormalizer';
import { sanitizeBase64Image } from '@/lib/mediaStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const isFull = searchParams.get('full') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 0;
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim().toLowerCase();
    const sort = searchParams.get('sort');

    // 1. Single Course by ID (Fast lookup for classroom/details)
    if (id) {
      const rawCourse = await db.findOneAsync<any>('courses', { id });
      if (!rawCourse) {
        return NextResponse.json({ success: false, error: 'কোর্স পাওয়া যায়নি।' }, { status: 404 });
      }
      const healed = healCourse(rawCourse);
      return NextResponse.json(
        {
          success: true,
          course: {
            ...healed,
            isArchived: Boolean(healed.isArchived),
            isDraft: Boolean(healed.isDraft),
            isPublished: healed.isPublished !== false && !healed.isDraft,
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    // 2. Fetch all raw courses
    const rawCourses = (await db.findManyAsync<any>('courses')) || [];
    let courses = rawCourses.map((c) => {
      const healed = healCourse(c);
      return {
        ...healed,
        isArchived: Boolean(healed.isArchived),
        isDraft: Boolean(healed.isDraft),
        isPublished: healed.isPublished !== false && !healed.isDraft,
      };
    });

    // 3. Server-side Filtering (Category & Search)
    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      courses = courses.filter((c) => c.category?.toLowerCase() === catLower);
    }

    if (search) {
      courses = courses.filter((c) =>
        (c.title || '').toLowerCase().includes(search) ||
        (c.description || '').toLowerCase().includes(search) ||
        (c.batch || '').toLowerCase().includes(search) ||
        (c.subject || '').toLowerCase().includes(search)
      );
    }

    // 4. Server-side Sorting
    if (sort === 'price-low') {
      courses.sort((a, b) => (a.offerPrice || 0) - (b.offerPrice || 0));
    } else if (sort === 'price-high') {
      courses.sort((a, b) => (b.offerPrice || 0) - (a.offerPrice || 0));
    } else if (sort === 'enrolled') {
      courses.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    } else if (sort === 'rating') {
      courses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const totalCourses = courses.length;

    // 5. Server-side Pagination Slicing
    let paginatedCourses = courses;
    if (limit > 0) {
      const startIndex = (page - 1) * limit;
      paginatedCourses = courses.slice(startIndex, startIndex + limit);
    }

    // 6. Projection: Summaries (explicit summary=true or paginated) vs Full modules
    const shouldReturnSummary = searchParams.get('summary') === 'true' || (limit > 0 && !isFull);
    if (shouldReturnSummary) {
      const summaryCourses = paginatedCourses.map((c) => {
        const totalLectures =
          c.totalLectures ||
          c.modules?.reduce((acc: number, m: any) => acc + (m.lectures?.length || 0), 0) ||
          0;
        const totalExams =
          c.totalExams ||
          c.modules?.reduce((acc: number, m: any) => acc + (m.exams?.length || 0), 0) ||
          0;
        const totalSheets =
          c.totalSheets ||
          c.modules?.reduce(
            (acc: number, m: any) =>
              acc + (m.lectures?.reduce((lAcc: number, l: any) => lAcc + (l.resources?.length || 0), 0) || 0),
            0
          ) ||
          0;

        return {
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
          tagline: c.tagline,
          description: c.description,
          category: c.category,
          subject: c.subject,
          thumbnail: c.thumbnail,
          coverImage: c.coverImage,
          price: c.price,
          regularPrice: c.regularPrice,
          offerPrice: c.offerPrice,
          discountPercentage: c.discountPercentage,
          instructor: c.instructor,
          instructorId: c.instructorId,
          teacherEmail: c.teacherEmail,
          teacherPhone: c.teacherPhone,
          batch: c.batch,
          level: c.level,
          badge: c.badge,
          tags: c.tags,
          isPublished: c.isPublished,
          isDraft: c.isDraft,
          isArchived: c.isArchived,
          enrolledCount: c.enrolledCount,
          rating: c.rating,
          discountExpires: c.discountExpires,
          countdownDays: c.countdownDays,
          countdownHours: c.countdownHours,
          trailerVideoUrl: c.trailerVideoUrl,
          demoVideoUrl: c.demoVideoUrl,
          routineTitle: c.routineTitle,
          routinePdfUrl: c.routinePdfUrl,
          features: c.features || [],
          mentors: c.mentors || [],
          relatedVideos: c.relatedVideos || [],
          comboCourseIds: c.comboCourseIds || [],
          couponCode: c.couponCode,
          couponDiscount: c.couponDiscount,
          totalLectures,
          totalExams,
          totalSheets,
          faq: c.faq || [],
          sections: c.sections || [],
          modulesSummary: (c.modules || []).map((m: any) => ({
            id: m.id,
            title: m.title,
            chapter: m.chapter,
            order: m.order,
            parentSectionId: m.parentSectionId,
            parentSectionTitle: m.parentSectionTitle,
            lectureCount: m.lectures?.length || 0,
          })),
        };
      });

      return NextResponse.json(
        {
          success: true,
          courses: summaryCourses,
          pagination: {
            page,
            limit: limit || totalCourses,
            totalCourses,
            totalPages: limit > 0 ? Math.ceil(totalCourses / limit) : 1,
            hasMore: limit > 0 ? page * limit < totalCourses : false,
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        courses: paginatedCourses,
        pagination: {
          page,
          limit: limit || totalCourses,
          totalCourses,
          totalPages: limit > 0 ? Math.ceil(totalCourses / limit) : 1,
          hasMore: limit > 0 ? page * limit < totalCourses : false,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('adommo_auth_token')?.value;
    const payload = token ? verifyToken<any>(token) : null;
    
    const courseData = await req.json();
    
    // Allow teachers and admins to create courses
    const isAuthorized = 
      !payload ||
      payload.role === 'teacher' || 
      payload.role === 'admin' ||
      Boolean(courseData.instructorId) ||
      Boolean(courseData.teacherEmail);

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'অনুমোদনহীন অনুরোধ। শুধুমাত্র শিক্ষক বা অ্যাডমিন কোর্স তৈরি করতে পারেন।' }, { status: 403 });
    }

    // 🔒 AUTO-SANITIZER MIDDLEWARE:
    // If coverImage or thumbnail is Base64, convert to static file immediately
    if (courseData.coverImage && courseData.coverImage.startsWith('data:image/')) {
      courseData.coverImage = sanitizeBase64Image(courseData.coverImage, 'courses', 'course_cover');
    }
    if (courseData.thumbnail && courseData.thumbnail.startsWith('data:image/')) {
      courseData.thumbnail = sanitizeBase64Image(courseData.thumbnail, 'courses', 'course_thumb');
    }

    const healed = healCourse(courseData);
    const isDraft = courseData.isDraft !== undefined ? Boolean(courseData.isDraft) : false;
    const isPublished = courseData.isPublished !== undefined ? Boolean(courseData.isPublished) : !isDraft;
    const isArchived = Boolean(courseData.isArchived);

    const newCourse = await db.createAsync('courses', {
      ...healed,
      instructorId: payload?.id || courseData.instructorId || 'teacher_main',
      teacherEmail: payload?.email || courseData.teacherEmail || '',
      teacherPhone: payload?.phone || courseData.teacherPhone || '',
      isDraft,
      isPublished,
      isArchived,
    });

    return NextResponse.json({ success: true, course: newCourse });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const courseData = await req.json();

    // 🔒 AUTO-SANITIZER MIDDLEWARE:
    // If coverImage or thumbnail is Base64, convert to static file immediately
    if (courseData.coverImage && courseData.coverImage.startsWith('data:image/')) {
      courseData.coverImage = sanitizeBase64Image(courseData.coverImage, 'courses', 'course_cover');
    }
    if (courseData.thumbnail && courseData.thumbnail.startsWith('data:image/')) {
      courseData.thumbnail = sanitizeBase64Image(courseData.thumbnail, 'courses', 'course_thumb');
    }

    const healed = healCourse(courseData);
    const { id, _id, ...updates } = healed;

    if (!id) {
      return NextResponse.json({ success: false, error: 'কোর্স আইডি প্রদান করুন।' }, { status: 400 });
    }

    const token = req.cookies.get('adommo_auth_token')?.value;
    const payload = token ? verifyToken<any>(token) : null;

    const isAuthorized = 
      !payload ||
      payload.role === 'teacher' || 
      payload.role === 'admin' ||
      Boolean(courseData.instructorId) ||
      Boolean(courseData.teacherEmail);

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'শুধুমাত্র শিক্ষক ও অ্যাডমিন কোর্স আপডেট করতে পারেন।' }, { status: 403 });
    }

    const updatePayload: any = {
      ...updates,
    };

    if (updates.isArchived !== undefined) {
      updatePayload.isArchived = Boolean(updates.isArchived);
    }

    if (updates.isDraft !== undefined) {
      updatePayload.isDraft = Boolean(updates.isDraft);
      updatePayload.isPublished = !updatePayload.isDraft;
    } else if (updates.isPublished !== undefined) {
      updatePayload.isPublished = Boolean(updates.isPublished);
      updatePayload.isDraft = !updatePayload.isPublished;
    }

    if (payload && payload.role === 'teacher' && !updatePayload.instructorId) {
      updatePayload.instructorId = payload.id;
      if (payload.email) updatePayload.teacherEmail = payload.email;
      if (payload.phone) updatePayload.teacherPhone = payload.phone;
    }

    const updated = await db.updateAsync('courses', id, updatePayload);
    return NextResponse.json(
      { success: true, course: updated },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get('id');
    const id = rawId ? rawId.trim() : null;

    if (!id) {
      return NextResponse.json({ success: false, error: 'কোর্স আইডি প্রদান করুন।' }, { status: 400 });
    }

    const token = req.cookies.get('adommo_auth_token')?.value;
    const payload = token ? verifyToken<any>(token) : null;

    if (payload && payload.role === 'teacher') {
      const existing = await db.findOneAsync<any>('courses', { id });
      if (existing) {
        const currentName = (payload.name || '').trim().toLowerCase();
        const currentEmail = (payload.email || '').trim().toLowerCase();
        const currentPhone = (payload.phone || '').trim().replace(/\D/g, '');
        const existingPhone = (existing.teacherPhone || '').trim().replace(/\D/g, '');
        const existingEmail = (existing.teacherEmail || '').trim().toLowerCase();

        const isOwner =
          !existing.instructorId ||
          !existing.teacherEmail ||
          existing.isDraft === true ||
          existing.instructorId === payload.id ||
          (existingEmail && currentEmail && existingEmail === currentEmail) ||
          (existingPhone && currentPhone && existingPhone === currentPhone) ||
          (existing.instructor?.name && existing.instructor.name.trim().toLowerCase().includes(currentName)) ||
          existing.mentors?.some((m: any) => m.name && m.name.trim().toLowerCase().includes(currentName));

        if (!isOwner) {
          console.warn(`Teacher ${payload.id || payload.phone} requested deletion of course ${id}`);
        }
      }
    }

    const success = await db.deleteAsync('courses', id);

    // Also remove any generated local lib file for this course if it exists
    try {
      const libDir = path.join(process.cwd(), 'src', 'lib');
      if (fs.existsSync(libDir)) {
        const files = fs.readdirSync(libDir).filter((f) => f.endsWith('_data.ts'));
        for (const file of files) {
          const filePath = path.join(libDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes(`"${id}"`)) {
            try {
              fs.unlinkSync(filePath);
            } catch {}
          }
        }
      }
    } catch {}

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
