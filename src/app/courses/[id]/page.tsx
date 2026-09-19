'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import PaymentModal from '@/components/PaymentModal';
import { 
  PlayCircle, 
  FileText, 
  Award, 
  Users, 
  Star, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  Video,
  Download,
  Calendar,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Tag
} from 'lucide-react';

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { courses, isEnrolled } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  const course = courses.find((c) => c.id === resolvedParams.id || c.slug === resolvedParams.id);

  // Dynamic Live Countdown Timer (PhyHunt exact feature with real course data)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!course) return;

    const computeTargetMs = () => {
      if (course.discountExpires) {
        const ms = new Date(course.discountExpires).getTime();
        if (!isNaN(ms)) return ms;
      }
      if (course.countdownDays !== undefined || course.countdownHours !== undefined) {
        const base = new Date((course as any).updatedAt || (course as any).createdAt || Date.now()).getTime();
        return base + ((course.countdownDays || 0) * 86400000) + ((course.countdownHours || 0) * 3600000);
      }
      // Default fallback 4 days 14 hours
      return Date.now() + (4 * 86400000) + (14 * 3600000);
    };

    const targetMs = computeTargetMs();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetMs - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [course?.id, course?.discountExpires, course?.countdownDays, course?.countdownHours]);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4 bg-white">
        <h2 className="text-2xl font-bold text-slate-800">কোর্সটি খুঁজে পাওয়া যায়নি!</h2>
        <p className="text-xs text-slate-500">হয়তো কোর্সটি মুছে ফেলা হয়েছে অথবা লিংকটি সঠিক নয়।</p>
        <Link href="/courses" className="inline-block px-5 py-2.5 rounded-full ph-btn-pink text-white font-bold text-xs">
          সকল কোর্স দেখুন
        </Link>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Dedicated Faculty Mentors (real data only)
  const mentors = course.mentors && course.mentors.length > 0 
    ? course.mentors 
    : (course.instructor?.name ? [
        {
          name: course.instructor.name,
          role: course.instructor.designation || 'লিড মেন্টর',
          institution: course.instructor.institution || 'ADOMMO একাডেমি',
          avatar: course.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        }
      ] : []);

  // Related introductory videos (real data only)
  const relatedVideos = course.relatedVideos || [];

  // Other combo courses
  const comboCourses = course.comboCourseIds && course.comboCourseIds.length > 0
    ? courses.filter((c) => course.comboCourseIds?.includes(c.id))
    : [];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 pt-2 font-sans text-slate-800">
      
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4 shadow-sm">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Link href="/" className="hover:text-[#ed347d] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোম</span>
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-[#ed347d] transition-colors text-slate-600">
              কোর্সসমূহ
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#ed347d] font-bold truncate max-w-[200px] sm:max-w-xs">{course.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ভর্তি চলমান • নতুন সেশন ২০২৬</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: 2 Columns */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* =========================================================
              LEFT 2 COLUMNS: COURSE CORE CONTENT
             ========================================================= */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Hero Card with Title, Video Trailer & Tagline */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
              
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d] border border-[#fecdd3]">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {course.batch}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating}</span>
                  <span className="text-slate-400 font-normal">({course.reviewCount} রিভিউ)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {course.title}
              </h1>

              {/* Video Player / Video Trailer Thumbnail (PhyHunt exact design) */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group shadow-md">
                {course.trailerVideoUrl && isPlayingTrailer ? (
                  <iframe
                    className="w-full h-full"
                    src={
                      course.trailerVideoUrl.includes('embed') 
                        ? course.trailerVideoUrl 
                        : (course.trailerVideoUrl.includes('watch?v=') 
                            ? course.trailerVideoUrl.replace('watch?v=', 'embed/') 
                            : course.trailerVideoUrl)
                    }
                    title="Course Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={course.coverImage || '/courses/frb26_banner.png'}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/courses/frb26_banner.png';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Center Big Play Button (only if trailer exists) */}
                    {course.trailerVideoUrl ? (
                      <button
                        type="button"
                        onClick={() => setIsPlayingTrailer(true)}
                        className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 hover:bg-white text-[#ed347d] shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-10 group"
                        aria-label="Play Trailer"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#ed347d] text-white flex items-center justify-center shadow-lg group-hover:bg-[#f53278] transition-colors">
                          <PlayCircle className="w-7 h-7 fill-white text-[#ed347d] ml-0.5" />
                        </div>
                      </button>
                    ) : null}

                    {/* Bottom overlay pill button */}
                    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{course.trailerVideoUrl ? 'কোর্স ট্রেইলার ও ফ্রি ডেমো ক্লাস' : course.title}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Tagline / Overview */}
              <div className="p-4 rounded-2xl bg-[#fff5f8] border border-[#ffd2e2] text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {course.tagline}
              </div>

              {/* Quick stats pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-100">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <Users className="w-5 h-5 text-[#ed347d] mb-1" />
                  <strong className="text-slate-900 text-sm">{course.enrolledCount.toLocaleString()}+</strong>
                  <span className="text-slate-500 text-[11px]">এনরোল্ড শিক্ষার্থী</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <PlayCircle className="w-5 h-5 text-blue-600 mb-1" />
                  <strong className="text-slate-900 text-sm">{course.totalLectures}+ টি</strong>
                  <span className="text-slate-500 text-[11px]">ফুল এইচডি ক্লাস</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <Award className="w-5 h-5 text-emerald-600 mb-1" />
                  <strong className="text-slate-900 text-sm">{course.totalExams}+ টি</strong>
                  <span className="text-slate-500 text-[11px]">ওএমআর এক্সাম</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <FileText className="w-5 h-5 text-purple-600 mb-1" />
                  <strong className="text-slate-900 text-sm">{course.totalSheets}+ টি</strong>
                  <span className="text-slate-500 text-[11px]">লেকচার শিট PDF</span>
                </div>
              </div>

            </div>

            {/* 2. আমাদের মেন্টর (Our Mentors Grid - Exact PhyHunt section) */}
            {mentors.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">আমাদের মেন্টর ও ফ্যাকাল্টি</h2>
                    <p className="text-xs text-slate-500">দেশসেরা অভিজ্ঞ শিক্ষক মণ্ডলীর তত্ত্বাবধানে পাঠদান</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {mentors.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#fafafa] border border-slate-200/80 hover:border-[#ffd1e1] hover:bg-[#fff9fb] transition-all flex items-center gap-3.5 shadow-sm"
                    >
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#ed347d] shadow-sm shrink-0"
                      />
                      <div className="space-y-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{m.name}</h3>
                        <p className="text-xs font-semibold text-[#ed347d]">{m.role}</p>
                        <p className="text-[11px] text-slate-500">{m.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. কোর্স সম্পর্কিত ভিডিও (Related Videos - Exact PhyHunt section) */}
            {relatedVideos.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">কোর্স সম্পর্কিত ভিডিও ও গাইডলাইন</h2>
                    <p className="text-xs text-slate-500">ভর্তির পূর্বে কোর্স প্ল্যান ও রোডম্যাপ জেনে নিন</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {relatedVideos.map((rv, rIdx) => (
                    <div
                      key={rIdx}
                      onClick={() => setIsPlayingTrailer(true)}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#fff5f8] border border-slate-200/80 hover:border-[#ffd1e1] flex items-center justify-between gap-4 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-[#ed347d] border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-[#ed347d] group-hover:text-white transition-colors">
                          <PlayCircle className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#ed347d] transition-colors">
                          {rv.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {rv.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{rv.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. বিস্তারিত বিবরণ (Course Overview) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">কোর্সের বিস্তারিত তথ্য</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {course.description}
                </p>
              </div>

            </div>

            {/* 5. সাধারণ জিজ্ঞাসা (FAQ Accordion) */}
            {course.faq && course.faq.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <HelpCircle className="w-5 h-5 text-[#ed347d]" />
                  <h3 className="text-base sm:text-lg font-black">সাধারণ জিজ্ঞাসা (FAQ)</h3>
                </div>

                <div className="space-y-2.5">
                  {course.faq.map((f, fIdx) => (
                    <div key={fIdx} className="rounded-2xl border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleFaq(fIdx)}
                        className="w-full p-4 text-left text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between hover:bg-slate-50"
                      >
                        <span>{f.question}</span>
                        {openFaqIndex === fIdx ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      {openFaqIndex === fIdx && (
                        <div className="p-4 pt-0 text-xs text-slate-600 bg-slate-50/60 leading-relaxed border-t border-slate-100">
                          {f.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>


          {/* =========================================================
              RIGHT 1 COLUMN: STICKY PRICING & ENROLL CARD (PhyHunt style)
             ========================================================= */}
          <div className="space-y-6 lg:sticky lg:top-28">
            
            {/* Feature Checklist Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
              
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  এই কোর্সের ভেতরে যা যা রয়েছে
                </h3>
              </div>

              {/* Custom Green Tick List (Exact PhyHunt) */}
              {course.features && course.features.length > 0 && (
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {course.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-snug font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Glowing Routine Download Button (Exact PhyHunt feature) */}
              {course.routinePdfUrl && course.routinePdfUrl !== '#' && (
                <div className="pt-2">
                  <a
                    href={course.routinePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{course.routineTitle || 'ক্লাস রুটিন ডাউনলোড করুন (PDF)'}</span>
                  </a>
                </div>
              )}

              {/* Combo Courses (Exact PhyHunt feature) */}
              {comboCourses.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">কম্বো ও সম্পর্কিত কোর্সসমূহ</h4>
                  <div className="space-y-2">
                    {comboCourses.map((cc) => (
                      <Link
                        key={cc.id}
                        href={`/courses/${cc.id}`}
                        className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-[#fff3f7] border border-slate-100 transition-colors group"
                      >
                        <img
                          src={cc.coverImage}
                          alt={cc.title}
                          className="w-12 h-8 rounded-lg object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-bold text-slate-800 group-hover:text-[#ed347d] truncate">
                            {cc.title}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-extrabold">
                            {cc.offerPrice === 0 ? 'ফ্রি' : `৳${cc.offerPrice}`}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>


            {/* Price & Enrollment Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500">কোর্সের মূল্য</span>
                {course.offerPrice > 0 && (
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-pink-100 text-[#ed347d]">
                    {course.discountPercentage}% বিশেষ ছাড়
                  </span>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-baseline justify-between">
                {(course.regularPrice || 0) > (course.offerPrice || 0) && (
                  <del className="text-sm font-semibold text-slate-400">
                    ৳{(course.regularPrice || 0).toLocaleString()}
                  </del>
                )}
                <span className="text-3xl font-black text-slate-900">
                  {course.offerPrice === 0 ? 'সম্পূর্ণ ফ্রি' : `৳${(course.offerPrice || 0).toLocaleString()}`}
                </span>
              </div>

              {/* Admission Timer (PhyHunt exact feature) */}
              <div className="p-3 rounded-2xl bg-slate-900 text-white text-center space-y-1 shadow-inner">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                  ভর্তি শেষ হতে বাকি
                </span>
                <div className="flex items-center justify-center gap-2 font-mono font-bold text-sm">
                  <div className="bg-slate-800 px-2 py-1 rounded-lg">
                    <span>{timeLeft.days}</span>
                    <span className="text-[9px] block text-slate-400 font-normal">দিন</span>
                  </div>
                  <span>:</span>
                  <div className="bg-slate-800 px-2 py-1 rounded-lg">
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] block text-slate-400 font-normal">ঘণ্টা</span>
                  </div>
                  <span>:</span>
                  <div className="bg-slate-800 px-2 py-1 rounded-lg">
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] block text-slate-400 font-normal">মিনিট</span>
                  </div>
                  <span>:</span>
                  <div className="bg-slate-800 px-2 py-1 rounded-lg">
                    <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] block text-slate-400 font-normal">সেকেন্ড</span>
                  </div>
                </div>
              </div>

              {/* Coupon Code Banner */}
              {course.offerPrice > 0 && !enrolled && course.couponCode && (
                <div className="p-2.5 rounded-2xl bg-[#fff2f7] border border-[#fecdd3] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#ed347d]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>কুপন কোড: <strong>{course.couponCode}</strong></span>
                  </div>
                  <span className="text-[10px] font-black bg-[#ed347d] text-white px-2 py-0.5 rounded-full">
                    ৳{course.couponDiscount || 200} ছাড়
                  </span>
                </div>
              )}

              {/* Action Button */}
              {enrolled ? (
                <Link
                  href={`/classroom/${course.id}`}
                  className="w-full py-3.5 rounded-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>আপনি এনরোল্ড আছেন — ক্লাসরুমে যান</span>
                </Link>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-3.5 rounded-full font-bold text-xs text-white ph-btn-pink shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{course.offerPrice === 0 ? 'ফ্রি এনরোল করুন' : 'এখনই ভর্তি হোন (Enroll Now)'}</span>
                  </button>

                  <Link
                    href={`/courses/${course.id}/checkout`}
                    className="block text-center text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors py-1"
                  >
                    ফুল-স্ক্রিন চেকআউট পেইজে যান →
                  </Link>
                </div>
              )}

              {/* Security & Guarantee Note */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>১০০% নিরাপদ bKash / Nagad TrxID পেমেন্ট ভেরিফিকেশন</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Clock className="w-4 h-4 text-[#ed347d] shrink-0" />
                  <span>দ্রুত অ্যাক্সেস ও আনলিমিটেড ভ্যালিডিটি</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* bKash / Nagad TrxID Payment Modal */}
      <PaymentModal
        course={course}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccessRedirect={() => {
          window.location.href = `/classroom/${course.id}`;
        }}
      />

    </div>
  );
}
