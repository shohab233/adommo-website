'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  User, 
  Flame,
  HelpCircle,
  Radio
} from 'lucide-react';

export default function MyCoursesPage() {
  const { currentUser, courses, liveClasses } = useApp();
  const isGuest = !currentUser || !currentUser.id || currentUser.id === 'usr_guest';

  // Filter only the courses the student is enrolled in
  const enrolledCourseIds = currentUser.enrolledCourseIds || [];
  const enrolledCourses = courses.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );

  if (isGuest) {
    return (
      <div className="bg-[#f8f9fc] min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 text-[#ed347d] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">শিক্ষার্থী লগইন আবশ্যক</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার ভর্তিকৃত কোর্সসমূহ, রেকর্ডেড ক্লাস ও লেকচার শিট দেখতে আপনার একাউন্টে লগইন করুন।
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/auth/login?redirect=/my-courses"
              className="w-full py-3 rounded-full text-xs font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
            >
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/courses"
              className="w-full py-3 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <span>সকল কোর্স দেখুন</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d] border border-[#fecdd3] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আপনার ব্যক্তিগত লার্নিং ড্যাশবোর্ড</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                আমার কোর্সসমূহ (My Enrolled Courses)
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                আপনি যেসকল পেইড ও ফ্রি কোর্সে যুক্ত আছেন, সেগুলোর ভিডিও ক্লাস, লাইভ সাপোর্ট, লেকচার শিট ও পরীক্ষার ক্লাসরুম এখান থেকে সরাসরি অ্যাক্সেস করুন।
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-[#ed347d]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">সক্রিয় এনরোল্ড কোর্স</div>
                <div className="text-2xl font-black text-slate-800">
                  {enrolledCourses.length} <span className="text-xs font-bold text-slate-400">টি কোর্স</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Course Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {enrolledCourses.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#ed347d]" />
                <span>ভর্তিকৃত কোর্স তালিকা ({enrolledCourses.length})</span>
              </h2>
              <Link
                href="/courses"
                className="text-xs font-bold text-[#ed347d] hover:underline flex items-center gap-1"
              >
                <span>আরও কোর্স ব্রাউজ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                const isLiveNow = liveClasses.some((lc) => lc.courseId === course.id && lc.status === 'live');

                return (
                  <div
                    key={course.id}
                    className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Course Banner */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>এনরোল্ড অ্যাক্টিভ</span>
                        </span>

                        {isLiveNow && (
                          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            <span>LIVE NOW</span>
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#ed347d]">
                          <span>{course.category} • {course.batch}</span>
                          <span className="text-slate-400 font-semibold">{course.totalLectures}টি ক্লাস</span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#ed347d] transition-colors">
                          {course.title}
                        </h3>

                        <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-400 block">লেকচার</span>
                            <strong className="text-slate-800 font-bold">{course.totalLectures}টি</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-400 block">এক্সাম</span>
                            <strong className="text-[#ed347d] font-bold">{course.totalExams}টি</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-400 block">শিট PDF</span>
                            <strong className="text-slate-800 font-bold">{course.totalSheets}টি</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
                      <Link
                        href={`/courses/${course.id}`}
                        className="py-2.5 px-3 rounded-2xl text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        কোর্স বিবরণী
                      </Link>

                      <Link
                        href={`/classroom/${course.id}`}
                        className={`py-2.5 px-3 rounded-2xl text-center text-xs font-bold text-white shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5 ${
                          isLiveNow ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-rose-300' : 'ph-btn-pink'
                        }`}
                      >
                        {isLiveNow ? <Radio className="w-4 h-4 animate-pulse" /> : <PlayCircle className="w-4 h-4" />}
                        <span>{isLiveNow ? 'লাইভে যোগ দিন' : 'ক্লাসরুমে যান'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200/80 shadow-sm max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ed347d]">
              <BookOpen className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                আপনি এখনো কোনো কোর্সে ভর্তি হননি!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                আপনার পছন্দের বিষয়ে পূর্ণাঙ্গ প্রস্তুতি নিতে এবং লাইভ ক্লাস, লেকচার শিট ও পরীক্ষার সুবিধা পেতে আমাদের যেকোনো কোর্সে ভর্তি হোন।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/courses"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>সবগুলো কোর্স ব্রাউজ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
