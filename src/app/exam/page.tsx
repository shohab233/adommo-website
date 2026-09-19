'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Layers,
  ChevronRight,
  Lock,
  Zap,
  LogIn
} from 'lucide-react';

export default function ExamDirectoryPage() {
  const { exams, courses, currentUser, isEnrolled, examSubmissions } = useApp();
  const isGuest = !currentUser || !currentUser.id || currentUser.id === 'usr_guest';

  // State: Tab to toggle between 'all' exams (directory) and 'enrolled' exams
  const [viewMode, setViewMode] = useState<'all' | 'enrolled'>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Strictly filter exams to only those courses the student is enrolled in
  const userEnrolledExams = exams.filter((exam) => isEnrolled(exam.courseId));

  // Determine base list depending on viewMode
  const baseExams = viewMode === 'enrolled' ? userEnrolledExams : exams;

  // Further filter by course tab if selected
  const displayExams = selectedCourseFilter === 'all'
    ? baseExams
    : baseExams.filter((e) => e.courseId === selectedCourseFilter);

  // List of enrolled courses for filter pills
  const enrolledCourses = courses.filter((c) => isEnrolled(c.id));

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-10 shadow-sm">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d] border border-[#fecdd3] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>রিয়েল-টাইম অনলাইন ওএমআর ও মেধা তালিকা</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                অনলাইন এক্সাম হল
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                পদার্থবিজ্ঞান, রসায়ন ও গণিতের সাপ্তাহিক মডেল টেস্ট, ওএমআর ও সৃজনশীল খাতা মূল্যায়ন হাব।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 px-4 rounded-2xl border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-[#ed347d]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">মোট পরীক্ষা</div>
                  <div className="text-xl font-black text-slate-800">
                    {exams.length} <span className="text-xs font-bold text-slate-400">টি</span>
                  </div>
                </div>
              </div>

              {!isGuest && (
                <div className="flex items-center gap-3 bg-[#fff5f8] p-3.5 px-4 rounded-2xl border border-[#ffd2e2]">
                  <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-pink-700 font-medium">আপনার এনরোল্ড</div>
                    <div className="text-xl font-black text-pink-600">
                      {userEnrolledExams.length} <span className="text-xs font-bold text-pink-400">টি</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mode Switcher (All Exams vs My Enrolled Exams) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-6">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setViewMode('all');
                  setSelectedCourseFilter('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-[#ed347d] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সবগুলো পরীক্ষা ({exams.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('enrolled');
                  setSelectedCourseFilter('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'enrolled'
                    ? 'bg-white text-[#ed347d] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                আমার এনরোল্ড পরীক্ষা ({userEnrolledExams.length})
              </button>
            </div>

            {/* Enrolled Courses Filter Pills (When multiple enrolled courses exist) */}
            {viewMode === 'enrolled' && enrolledCourses.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">
                  কোর্স ফিল্টার:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCourseFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCourseFilter === 'all'
                      ? 'bg-[#ed347d] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  সকল ({userEnrolledExams.length})
                </button>
                {enrolledCourses.map((c) => {
                  const count = userEnrolledExams.filter((e) => e.courseId === c.id).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCourseFilter(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCourseFilter === c.id
                          ? 'bg-[#ed347d] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {c.title.split(' ')[0]} {c.batch} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* If user is viewing enrolled exams and has none */}
        {displayExams.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200/80 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ed347d]">
              <HelpCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                {viewMode === 'enrolled' ? 'আপনার কোনো এনরোল্ড কোর্সের পরীক্ষা নেই!' : 'বর্তমানে কোনো পরীক্ষা পাওয়া যায়নি!'}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {viewMode === 'enrolled'
                  ? 'আপনি এখনো কোনো কোর্সে যুক্ত হননি। "সবগুলো পরীক্ষা" ট্যাবে গিয়ে পরীক্ষাগুলোর বিস্তারিত দেখতে পারেন অথবা কোর্সে ভর্তি হতে পারেন।'
                  : 'শীঘ্রই নতুন পরীক্ষা ও মডেল টেস্ট যুক্ত করা হবে।'}
              </p>
            </div>

            {viewMode === 'enrolled' && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>সবগুলো পরীক্ষা দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/courses"
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>কোর্স ক্যাটালগ দেখুন</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#ed347d]" />
                <span>
                  {viewMode === 'enrolled' ? 'আপনার এনরোল্ড পরীক্ষাসমূহ' : 'সকল কোর্সের পরীক্ষা তালিকা'} ({displayExams.length})
                </span>
              </h2>
              {viewMode === 'enrolled' ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  ✓ আপনার অ্যাক্সেস অনুমোদিত
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  কোর্সভিত্তিক পরীক্ষা হাব
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayExams.map((exam) => {
                const submission = examSubmissions[exam.id];
                const isCompleted = !!submission;
                const isUserEnrolledInExam = isEnrolled(exam.courseId);
                const parentCourse = courses.find((c) => c.id === exam.courseId || c.slug === exam.courseId);

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-[#ed347d] bg-[#fff0f5] px-2.5 py-0.5 rounded-full border border-pink-100 line-clamp-1">
                          {parentCourse?.title || exam.courseTitle}
                        </span>

                        {isCompleted ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            সম্পন্ন হয়েছে
                          </span>
                        ) : exam.status === 'live' ? (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                            লাইভ চলছে
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shrink-0">
                            {exam.scheduledDate}
                          </span>
                        )}
                      </div>

                      {/* Exam Title */}
                      <h3 className="text-base font-extrabold text-slate-800 leading-snug group-hover:text-[#ed347d] transition-colors">
                        {exam.title}
                      </h3>

                      {/* Exam Meta Info */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{exam.durationMinutes} মিনিট</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                          <span>{exam.questionsCount} টি MCQ</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Award className="w-4 h-4 text-slate-400" />
                          <span>{exam.totalMarks} নম্বর</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>নেগেটিভ মার্কিং: -{exam.negativeMarkPerWrong}</span>
                        <span>পাস মার্ক: {exam.passMarks}</span>
                      </div>
                    </div>

                    {/* Result or Action Button */}
                    <div className="pt-2">
                      {isCompleted ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-600">আপনার প্রাপ্ত নম্বর:</span>
                            <span className="font-black text-emerald-600">
                              {submission.score} / {exam.totalMarks}
                            </span>
                          </div>
                          <Link
                            href={`/exam/${exam.id}`}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>সমাধান ও মেধা তালিকা দেখুন</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ) : isUserEnrolledInExam ? (
                        <Link
                          href={`/exam/${exam.id}`}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-sm hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5"
                        >
                          <span>পরীক্ষা শুরু করুন</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <Link
                          href={`/courses/${exam.courseId}`}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5 text-[#ed347d]" />
                          <span>কোর্সে ভর্তি হয়ে পরীক্ষা দিন</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#ed347d]" />
                        </Link>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
