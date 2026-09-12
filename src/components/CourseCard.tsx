'use client';

import React from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { useApp } from '@/context/AppContext';
import { ArrowRight, CheckCircle, Video, FileText, Award, Sparkles, Star } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { isEnrolled } = useApp();
  const enrolled = isEnrolled(course.id);

  // Total lecture count across modules
  const totalLectures = course.modules?.reduce(
    (acc, m) => acc + (m.lectures?.length || 0),
    0
  ) || 45;

  const discountPercent =
    course.regularPrice > course.offerPrice
      ? Math.round(((course.regularPrice - course.offerPrice) / course.regularPrice) * 100)
      : 0;

  return (
    <div className="group bg-white rounded-[26px] border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-pink-500/10 hover:border-pink-300 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5">
      
      {/* 1. Course Banner Image with Smart Floating Badges */}
      <Link href={`/courses/${course.id}`} className="block relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={course.coverImage || '/courses/frb26_banner.png'}
          alt={course.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/courses/frb26_banner.png';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {course.batch ? (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-black tracking-wide border border-white/20 shadow-md">
              {course.batch}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-black tracking-wide border border-white/20 shadow-md">
              ADOMMO স্পেশাল
            </span>
          )}

          {discountPercent > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-500 to-[#ed347d] text-white text-[11px] font-black shadow-md">
              🔥 {discountPercent}% ছাড়
            </span>
          ) : course.offerPrice === 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-md">
              ১০০% ফ্রি
            </span>
          ) : null}
        </div>
      </Link>

      {/* 2. Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Title & Tagline */}
        <div className="space-y-1.5">
          <Link href={`/courses/${course.id}`} className="block">
            <h3 className="text-lg sm:text-[19px] font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#ed347d] transition-colors">
              {course.title}
            </h3>
          </Link>
          {course.tagline && (
            <p className="text-xs text-slate-500 line-clamp-1 font-medium">
              {course.tagline}
            </p>
          )}
        </div>

        {/* Feature Highlights Row */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 py-1 border-y border-slate-100">
          <span className="flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-[#ed347d]" />
            {totalLectures}+ ক্লাস
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            ওএমআর এক্সাম
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            পিডিএফ শিট
          </span>
        </div>

        {/* Enrolled Badge Pill + Rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="bg-white border border-[#ffd2e2] rounded-2xl p-1.5 px-3 inline-flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#fff0f5] border border-[#fecdd3] flex items-center justify-center text-sm shrink-0">
              <span>🧑‍🎓</span>
            </div>
            <div className="flex items-center gap-1 leading-none">
              <span className="text-sm sm:text-base font-black text-[#ed347d]">
                {course.enrolledCount.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                জন ভর্তি
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200/70">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>৪.৯ (১২০+)</span>
          </div>
        </div>

        {/* 3. Bottom Row: Price & Single Action Button */}
        <div className="pt-2 flex items-end justify-between gap-2">
          
          {/* Price */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 block">
              কোর্স ফি
            </span>
            <div className="flex items-baseline gap-2">
              {course.regularPrice > course.offerPrice && (
                <del className="text-slate-400 text-xs sm:text-sm font-semibold">
                  {course.regularPrice}৳
                </del>
              )}
              <span className="text-2xl sm:text-3xl font-black text-[#f53278]">
                {course.offerPrice === 0 ? 'ফ্রি' : `${course.offerPrice}৳`}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {enrolled ? (
            <Link
              href={`/classroom/${course.id}`}
              className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>ক্লাসরুম →</span>
            </Link>
          ) : (
            <Link
              href={`/courses/${course.id}`}
              className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#fa507e] to-[#ea306a] hover:opacity-95 shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <span>বিস্তারিত</span>
              <span className="text-base font-bold">→</span>
            </Link>
          )}

        </div>

      </div>

    </div>
  );
}
