'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ArrowLeft, 
  Radio, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Download, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  Flame,
  BookMarked,
  Tv
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

export default function CourseLiveClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { courses, isEnrolled, exams, showToast, liveClasses, questionBanks } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const course = courses.find((c) => c.id === resolvedParams.id || c.slug === resolvedParams.id);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4 bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800">কোর্সটি পাওয়া যায়নি!</h2>
        <p className="text-xs text-slate-500">কোর্সটি মুছে ফেলা হয়েছে অথবা লিংকটি সঠিক নয়।</p>
        <Link href="/courses" className="inline-block px-5 py-2.5 rounded-full ph-btn-pink text-white font-bold text-xs">
          সকল কোর্স দেখুন
        </Link>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);
  const relevantExam = exams.find((e) => e.courseId === course.id);
  const courseQBanksCount = questionBanks.filter((qb) => qb.courseId === course.id).length;

  // Filter live classes strictly for this course
  const courseLiveClasses = liveClasses.filter((lc) => lc.courseId === course.id);
  const ongoingLiveClass = courseLiveClasses.find((lc) => lc.status === 'live');
  const upcomingLiveClasses = courseLiveClasses.filter((lc) => lc.status === 'upcoming');
  const completedLiveClasses = courseLiveClasses.filter((lc) => lc.status === 'completed');

  const filteredClasses = activeFilter === 'all'
    ? courseLiveClasses
    : activeFilter === 'upcoming'
    ? upcomingLiveClasses
    : completedLiveClasses;

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-1 sm:pt-2 space-y-6">
      
      {/* Top Header Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              href={`/classroom/${course.id}`}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="মূল ক্লাসরুমে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ক্লাসরুম</span>
            </Link>
            <div>
              <span className="text-[10px] font-bold text-[#ed347d] uppercase tracking-wider block">
                {course.batch} • {course.category}
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-800 line-clamp-1">
                {course.title} — লাইভ ক্লাস পোর্টাল
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href={`/classroom/${course.id}/qbank`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-all shadow-2xs"
            >
              <BookMarked className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">প্রশ্নব্যাংক</span>
              {courseQBanksCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-900 text-[10px]">
                  {courseQBanksCount}
                </span>
              )}
            </Link>

            {relevantExam && (
              <Link
                href={`/exam/${relevantExam.id}`}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>মডেল টেস্ট</span>
              </Link>
            )}

            {!enrolled && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-1.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-sm"
              >
                কোর্স আনলক করুন
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Hero Banner Card */}
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-red-800/40">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-rose-200 backdrop-blur-sm border border-white/10">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>ইন্টারেক্টিভ লাইভ লার্নিং অ্যান্ড সাপোর্ট সেশন</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              সরাসরি শিক্ষকের সাথে লাইভ ক্লাস ও ডাউট সলভিং
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              আপনার কোর্সের সমস্ত লাইভ ক্লাস, আসন্ন ক্লাসের সময়সূচি এবং সম্পন্ন হওয়া ক্লাসের ভিডিও রেকর্ডিং ও লেকচার নোটস এখানে সংরক্ষিত রয়েছে।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-bold border border-white/10 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-rose-300" />
                <span>মোট লাইভ সেশন: <strong>{courseLiveClasses.length}টি</strong></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-bold border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>আসন্ন শিডিউল: <strong>{upcomingLiveClasses.length}টি</strong></span>
              </span>
              {ongoingLiveClass && (
                <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 animate-pulse shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>১টি ক্লাস বর্তমানে লাইভ চলছে!</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 🔴 ONGOING LIVE CLASS SPOTLIGHT (If Any) */}
        {ongoingLiveClass && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-red-600 to-pink-700 text-white shadow-2xl p-6 sm:p-8 border-2 border-rose-300/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-400/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                </span>
                <span className="font-black text-sm sm:text-base uppercase tracking-wider bg-black/30 px-3 py-1 rounded-xl">
                  🔴 ব্রডকাস্ট চলছে (LIVE NOW)
                </span>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-black uppercase">
                  প্ল্যাটফর্ম: {ongoingLiveClass.platform.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-xl sm:text-3xl font-black leading-tight">
                {ongoingLiveClass.title}
              </h3>
              {ongoingLiveClass.description && (
                <p className="text-xs sm:text-sm text-rose-100 max-w-3xl leading-relaxed">
                  {ongoingLiveClass.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-black/25 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-[10px] text-rose-200 block">ইনস্ট্রাক্টর</span>
                  <strong className="text-xs sm:text-sm font-bold">{ongoingLiveClass.instructorName}</strong>
                </div>
                <div className="bg-black/25 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-[10px] text-rose-200 block">শুরুর সময়</span>
                  <strong className="text-xs sm:text-sm font-bold">{ongoingLiveClass.time}</strong>
                </div>
                <div className="bg-black/25 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-[10px] text-rose-200 block">ব্যাপ্তিকাল</span>
                  <strong className="text-xs sm:text-sm font-bold">{ongoingLiveClass.durationMinutes} মিনিট</strong>
                </div>
                <div className="bg-black/25 backdrop-blur-sm p-3 rounded-2xl">
                  <span className="text-[10px] text-rose-200 block">পাসকোড (যদি থাকে)</span>
                  <strong className="text-xs sm:text-sm font-mono font-bold text-amber-200">
                    {ongoingLiveClass.meetingPassword || 'উন্মুক্ত'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 pt-2 border-t border-rose-400/30">
              {enrolled ? (
                <a
                  href={ongoingLiveClass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-2xl bg-white text-rose-600 font-black text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
                >
                  <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                  <span>সরাসরি লাইভ ক্লাসে যুক্ত হোন</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-8 py-3.5 rounded-2xl bg-white text-rose-600 font-black text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                  <Lock className="w-4 h-4" />
                  <span>কোর্স আনলক করে লাইভে যুক্ত হোন</span>
                </button>
              )}

              {ongoingLiveClass.attachedSheetUrl && (
                <a
                  href={ongoingLiveClass.attachedSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-rose-800/90 hover:bg-rose-900 text-white font-bold text-xs transition-all flex items-center gap-2 border border-rose-400/40 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{ongoingLiveClass.attachedSheetTitle || 'ক্লাস লেকচার শিট ডাউনলোড'}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              সকল লাইভ সেশন ({courseLiveClasses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'upcoming'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>আসন্ন শিডিউল ({upcomingLiveClasses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'completed'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>ভিডিও রেকর্ডিং ও নোটস ({completedLiveClasses.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            মোট {filteredClasses.length}টি ক্লাস পাওয়া গেছে
          </span>
        </div>

        {/* Classes List */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredClasses.map((cls) => {
              const isLive = cls.status === 'live';
              const isUpcoming = cls.status === 'upcoming';
              const isCompleted = cls.status === 'completed';

              return (
                <div
                  key={cls.id}
                  className={`rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm ${
                    isLive 
                      ? 'bg-rose-50/70 border-rose-300 shadow-md ring-2 ring-rose-400/30' 
                      : 'bg-white border-slate-200/90 hover:border-pink-200 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isLive ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            LIVE NOW
                          </span>
                        ) : isUpcoming ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            ⏳ শিডিউল্ড
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            সম্পন্ন হয়েছে
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {cls.platform}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>{cls.date} • {cls.time}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 leading-snug">
                      {cls.title}
                    </h4>

                    {cls.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {cls.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>ইনস্ট্রাক্টর: <strong className="text-slate-700">{cls.instructorName}</strong></span>
                      <span>ব্যাপ্তি: <strong>{cls.durationMinutes} মিনিট</strong></span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {isLive && (
                      <a
                        href={cls.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>লাইভে যোগ দিন</span>
                      </a>
                    )}

                    {isUpcoming && (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed text-center"
                      >
                        ক্লাস শুরুর ১৫ মিনিট আগে লিংক খুলবে
                      </button>
                    )}

                    {isCompleted && (
                      <>
                        {cls.recordingUrl ? (
                          <a
                            href={cls.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Video className="w-4 h-4" />
                            <span>রেকর্ডিং দেখুন</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic py-2">রেকর্ডিং প্রক্রিয়াধীন</span>
                        )}

                        {cls.recordingNotesPdf && (
                          <a
                            href={cls.recordingNotesPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-rose-500" />
                            <span>নোটস PDF</span>
                          </a>
                        )}
                      </>
                    )}

                    {cls.attachedSheetUrl && !isCompleted && (
                      <a
                        href={cls.attachedSheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-[#ed347d] font-bold text-xs transition-all flex items-center gap-1.5"
                        title={cls.attachedSheetTitle || 'শিট ডাউনলোড'}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>শিট</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Radio className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">কোনো লাইভ ক্লাস পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              এই কোর্সে এখনো কোনো লাইভ ক্লাস শিডিউল করা হয়নি। শিক্ষক শিডিউল ঘোষণা করলে এখানে দেখতে পাবেন।
            </p>
          </div>
        )}

      </div>

      {/* Payment Modal if not enrolled */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
      />
    </div>
  );
}
