'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Radio,
  Search,
  BookMarked,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  PhoneCall
} from 'lucide-react';

export default function MyCoursesPage() {
  const { currentUser, courses, liveClasses, isEnrolled, enrollments } = useApp();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'live'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGuest = mounted && (!currentUser || !currentUser.id || currentUser.id === 'usr_guest');

  // Filter only the courses the student is enrolled in (checked via isEnrolled with id and slug support)
  const enrolledCourses = useMemo(() => {
    return courses.filter((c) => isEnrolled(c.id) || (c.slug && isEnrolled(c.slug)));
  }, [courses, isEnrolled]);

  const cleanPhone = (currentUser?.phone || '').replace(/\D/g, '');

  // Pending Enrollments (waiting for Admin TrxID verification)
  const pendingEnrollments = useMemo(() => {
    return (enrollments || []).filter((e) => {
      if (e.status !== 'pending') return false;
      if (currentUser?.id && e.studentId === currentUser.id) return true;
      if (cleanPhone) {
        const p1 = (e.studentPhone || '').replace(/\D/g, '');
        const p2 = (e.senderPhone || '').replace(/\D/g, '');
        if (p1 && p1 === cleanPhone) return true;
        if (p2 && p2 === cleanPhone) return true;
      }
      return false;
    });
  }, [enrollments, currentUser, cleanPhone]);

  // Rejected Enrollments (need student attention: wrong TrxID or mismatched phone)
  const rejectedEnrollments = useMemo(() => {
    return (enrollments || []).filter((e) => {
      if (e.status !== 'rejected') return false;
      if (currentUser?.id && e.studentId === currentUser.id) return true;
      if (cleanPhone) {
        const p1 = (e.studentPhone || '').replace(/\D/g, '');
        const p2 = (e.senderPhone || '').replace(/\D/g, '');
        if (p1 && p1 === cleanPhone) return true;
        if (p2 && p2 === cleanPhone) return true;
      }
      return false;
    });
  }, [enrollments, currentUser, cleanPhone]);

  // Filtered enrolled courses based on search and pills
  const filteredCourses = useMemo(() => {
    return enrolledCourses.filter((course) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (course.title || '').toLowerCase().includes(q);
        const catMatch = (course.category || '').toLowerCase().includes(q);
        const batchMatch = (course.batch || '').toLowerCase().includes(q);
        const instMatch = (course.instructor?.name || '').toLowerCase().includes(q);
        if (!titleMatch && !catMatch && !batchMatch && !instMatch) return false;
      }

      // Filter pills
      if (activeFilter === 'live') {
        const isLive = liveClasses.some(
          (lc) => (lc.courseId === course.id || lc.courseId === course.slug) && lc.status === 'live'
        );
        if (!isLive) return false;
      }

      return true;
    });
  }, [enrolledCourses, searchQuery, activeFilter, liveClasses]);

  // If still hydrating, render a sleek skeleton instead of flashing the login screen
  if (!mounted) {
    return (
      <div className="bg-[#f8f9fc] min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-[#ed347d] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">কোর্সসমূহ প্রস্তুত করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="bg-[#f8f9fc] min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 text-[#ed347d] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">শিক্ষার্থী লগইন আবশ্যক</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার ভর্তিকৃত কোর্সসমূহ, রেকর্ডেড ক্লাস, লেকচার শিট ও পরীক্ষার ক্লাসরুম দেখতে আপনার অ্যাকাউন্টে লগইন করুন।
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
      <div className="bg-white border-b border-slate-200 py-8 sm:py-10 shadow-sm">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d] border border-[#fecdd3] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ব্যক্তিগত শিক্ষার্থী ড্যাশবোর্ড</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                আমার কোর্সসমূহ (My Enrolled Courses)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
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

      {/* Teacher Account Quick-Switch Banner */}
      {currentUser?.role === 'teacher' && (
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-blue-900">আপনি শিক্ষক অ্যাকাউন্টে লগইন আছেন</h4>
                <p className="text-[11px] text-blue-700">
                  আপনার তৈরি করা কোর্স ও পাঠ্যসূচি পরিচালনা করতে শিক্ষক ড্যাশবোর্ডে প্রবেশ করুন।
                </p>
              </div>
            </div>
            <Link
              href="/teacher"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
            >
              <span>শিক্ষক প্যানেলে যান</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Pending Enrollments Banner/List */}
      {pendingEnrollments.length > 0 && (
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>পেমেন্ট ভেরিফিকেশন চলমান ({pendingEnrollments.length} টি আবেদন)</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              আপনার পেমেন্ট ট্রানজেকশন আইডি (TrxID) আমাদের অ্যাডমিন টিম যাচাই করছে। ভেরিফিকেশন সম্পন্ন হওয়া মাত্রই আপনার ক্লাসরুম স্বয়ংক্রিয়ভাবে খুলে যাবে।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingEnrollments.map((pen) => (
                <div key={pen.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold">{pen.paymentMethod}</span>
                    <span className="text-slate-500 font-mono">TrxID: {pen.trxId}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 line-clamp-1">{pen.courseTitle}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>ফি: <strong>৳{pen.amount}</strong></span>
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      অ্যাডমিন রিভিউ চলছে
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rejected Enrollments Banner/List */}
      {rejectedEnrollments.length > 0 && (
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>পেমেন্ট আবেদন স্থগিত / বাতিল ({rejectedEnrollments.length} টি)</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              ভুল ট্রানজেকশন আইডি (TrxID) বা অমিল তথ্যের কারণে নিচের আবেদনটি গ্রহণ করা সম্ভব হয়নি। অনুগ্রহ করে সঠিক TrxID দিয়ে পুনরায় আবেদন করুন অথবা হেল্পলাইনে যোগাযোগ করুন।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rejectedEnrollments.map((rej) => (
                <div key={rej.id} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-extrabold">{rej.paymentMethod}</span>
                    <span className="text-rose-600 font-mono">TrxID: {rej.trxId}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 line-clamp-1">{rej.courseTitle}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="text-rose-600 font-bold">আবেদন বাতিল</span>
                    <Link
                      href={`/courses/${rej.courseId}/checkout`}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>পুনরায় আবেদন করুন</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Course Section */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Controls: Search and Filters */}
        {enrolledCourses.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কোর্সের নাম বা বিষয় দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-[#ed347d] focus:bg-white transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#ed347d] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সবগুলো ({enrolledCourses.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('live')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  activeFilter === 'live'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>লাইভ চলছে</span>
              </button>

              <Link
                href="/courses"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#ed347d] hover:bg-pink-50 transition-colors whitespace-nowrap ml-auto flex items-center gap-1"
              >
                <span>নতুন কোর্স দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        )}

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isLiveNow = liveClasses.some(
                (lc) => (lc.courseId === course.id || lc.courseId === course.slug) && lc.status === 'live'
              );

              // Calculated fallback counts for bulletproof stats
              const lectureCount =
                course.totalLectures ||
                course.modules?.reduce((acc: number, m) => acc + (m.lectures?.length || 0), 0) ||
                0;
              const sheetCount = course.totalSheets || 0;
              const examCount = course.totalExams || 0;

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Course Banner */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                      <img
                        src={course.coverImage || '/courses/frb26_banner.png'}
                        alt={course.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
                        }}
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
                        <span className="text-slate-400 font-semibold">{lectureCount}টি ক্লাস</span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#ed347d] transition-colors">
                        {course.title}
                      </h3>

                      {course.instructor?.name && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            <img
                              src={course.instructor.avatar || 'https://i.postimg.cc/RFKgPcNF/Screenshot-109.png'}
                              alt={course.instructor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-semibold text-slate-700 truncate">{course.instructor.name}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-50">
                          <span className="text-[10px] text-slate-400 block">লেকচার</span>
                          <strong className="text-slate-800 font-bold">{lectureCount}টি</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50">
                          <span className="text-[10px] text-slate-400 block">এক্সাম</span>
                          <strong className="text-[#ed347d] font-bold">{examCount}টি</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50">
                          <span className="text-[10px] text-slate-400 block">শিট PDF</span>
                          <strong className="text-slate-800 font-bold">{sheetCount}টি</strong>
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
        ) : enrolledCourses.length > 0 ? (
          /* Search mismatch */
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">কোনো কোর্স পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">
              &quot;{searchQuery}&quot; দিয়ে কোনো কোর্স ম্যাচ করেনি। সার্চ ফিল্টার ক্লিয়ার করে দেখুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              ফিল্টার রিসেট করুন
            </button>
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
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
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
