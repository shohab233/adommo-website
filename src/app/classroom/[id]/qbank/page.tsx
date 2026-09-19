'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ArrowLeft, 
  BookMarked, 
  ExternalLink, 
  Download, 
  Flame, 
  Lock
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

export default function CourseQuestionBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { courses, questionBanks, isEnrolled, exams, showToast } = useApp();

  const [qbankFilterType, setQbankFilterType] = useState<string>('all');
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

  // Question banks strictly filtered for this course
  const courseQBanks = questionBanks.filter((qb) => qb.courseId === course.id);

  const filteredQBanks = qbankFilterType === 'all'
    ? courseQBanks
    : courseQBanks.filter((qb) => qb.type === qbankFilterType);

  const handleDownloadSheet = (title: string, pdfUrl?: string) => {
    if (pdfUrl && pdfUrl !== '#' && !pdfUrl.startsWith('javascript:')) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      showToast(`📥 "${title}" ড্রাইভ/অনলাইন শিট ওপেন করা হচ্ছে...`);
    } else {
      showToast(`📥 "${title}" সফলভাবে ডাউনলোড শুরু হয়েছে!`);
    }
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-1 sm:pt-2 space-y-5">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              href={`/classroom/${course.id}`}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="ক্লাসরুমে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ক্লাসরুম</span>
            </Link>
            <div>
              <span className="text-[10px] font-bold text-[#ed347d] uppercase tracking-wider block">
                {course.batch} • {course.category}
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-800 line-clamp-1">
                {course.title} — প্রশ্নব্যাংক
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {relevantExam && (
              <Link
                href={`/exam/${relevantExam.id}`}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>মডেল টেস্ট দিন</span>
              </Link>
            )}

            {!enrolled && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-1.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-sm"
              >
                ফুল কোর্স আনলক করুন
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-purple-200 backdrop-blur-sm border border-white/10">
              <BookMarked className="w-3.5 h-3.5 text-purple-300" />
              <span>কোর্স এক্সক্লুসিভ প্রশ্নব্যাংক পোর্টাল</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              বিগত ২০ বছরের প্রশ্নব্যাংক ও কনসেপ্ট এনালাইসিস
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed">
              বিশ্ববিদ্যালয় ও ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার বিগত বছরগুলোর সকল প্রশ্ন, নির্ভুল ব্যাখ্যা ও সমাধান সহ প্রিন্ট উপযোগী PDF ফাইল এখান থেকে সরাসরি পড়ুন বা ডাউনলোড করুন।
            </p>
          </div>
        </div>

        {/* Filter Pills & Counter */}
        {courseQBanks.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'সকল প্রশ্নব্যাংক' },
                { id: 'varsity', label: 'ভার্সিটি "ক" ইউনিট' },
                { id: 'engineering', label: 'ইঞ্জিনিয়ারিং ও বুয়েট' },
                { id: 'medical', label: 'মেডিকেল ও ডেন্টাল' },
                { id: 'board', label: 'বোর্ড স্ট্যান্ডার্ড' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setQbankFilterType(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    qbankFilterType === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                মোট {filteredQBanks.length} টি প্রশ্নব্যাংক
              </span>
            </div>
          </div>
        )}

        {/* Question Bank Cards or Empty State */}
        {courseQBanks.length === 0 ? (
          /* Empty state when teacher hasn't added question bank for this course */
          <div className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
              <BookMarked className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                এই কোর্সে এখনো কোনো প্রশ্নব্যাংক যুক্ত করা হয়নি
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                শিক্ষক যখন এই কোর্সে নতুন প্রশ্নব্যাংক বা বিগত বছরের প্রশ্ন এনালাইসিস ফাইল আপলোড করবেন, তখন স্বয়ংক্রিয়ভাবে এখানে দেখতে পাবেন।
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={`/classroom/${course.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ক্লাসরুমে ফিরে যান</span>
              </Link>
            </div>
          </div>
        ) : filteredQBanks.length === 0 ? (
          /* Empty state for filtered category */
          <div className="p-10 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
            <BookMarked className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">এই ক্যাটাগরিতে এখনো কোনো প্রশ্নব্যাংক পাওয়া যায়নি</p>
            <button
              type="button"
              onClick={() => setQbankFilterType('all')}
              className="text-xs text-[#ed347d] font-bold hover:underline"
            >
              সকল প্রশ্নব্যাংক দেখুন
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQBanks.map((qb) => {
              const isVarsity = qb.type === 'varsity';
              const isEng = qb.type === 'engineering';
              const isMed = qb.type === 'medical';

              return (
                <div
                  key={qb.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          isVarsity
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : isEng
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isMed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isVarsity ? '🏛️ ভার্সিটি এডমিশন' : isEng ? '⚙️ ইঞ্জিনিয়ারিং ও বুয়েট' : isMed ? '🩺 মেডিকেল ও ডেন্টাল' : '📚 বোর্ড প্রশ্নব্যাংক'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                        📅 {qb.year || '২০২৪'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                      {qb.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-bold text-slate-700">📖 {qb.subject}</span>
                      <span>•</span>
                      <span>{qb.chapter}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>{qb.pages} পৃষ্ঠা</span>
                      <span>•</span>
                      <span>{qb.fileSize}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">
                        {(qb.downloadCount || 0).toLocaleString()} ডাউনলোড
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {enrolled ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDownloadSheet(qb.title, qb.pdfUrl)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          প্রশ্নব্যাংক পড়ুন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSheet(qb.title, qb.pdfUrl)}
                          className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all shrink-0 cursor-pointer"
                          title="ডাউনলোড করুন"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        আনলক করতে এনরোল করুন
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Payment Modal */}
      <PaymentModal
        course={course}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

    </div>
  );
}
