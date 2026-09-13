'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  User as UserIcon, 
  GraduationCap, 
  Phone, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Settings, 
  Flame, 
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function StudentProfilePage() {
  const { currentUser, courses, enrollments, examSubmissions, exams, isEnrolled } = useApp();
  
  const isGuest = !currentUser || !currentUser.id || currentUser.id === 'usr_guest';

  const [activeTab, setActiveTab] = useState<'my_courses' | 'exam_history' | 'payments' | 'settings'>('my_courses');
  const [collegeName, setCollegeName] = useState(currentUser.college || '');
  const [studentName, setStudentName] = useState(currentUser.name);

  if (isGuest) {
    return (
      <div className="bg-[#f8f9fc] min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 text-[#ed347d] flex items-center justify-center mx-auto">
            <UserIcon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">শিক্ষার্থী লগইন আবশ্যক</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার প্রোফাইল, এনরোল্ড কোর্স ও পেমেন্ট হিস্টোরি দেখতে অনুগ্রহ করে একাউন্টে লগইন করুন।
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/auth/login?redirect=/profile"
              className="w-full py-3 rounded-full text-xs font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
            >
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register"
              className="w-full py-3 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. Real Enrolled Courses (checked via isEnrolled)
  const enrolledCourses = courses.filter((c) => isEnrolled(c.id));

  // 2. Real Exam Submissions for this user
  const allSubmissions = Object.values(examSubmissions);
  const userSubmissions = allSubmissions.filter(
    (s) => s.studentId === currentUser.id
  );

  // Real Dynamic Metrics
  const totalExamsTaken = userSubmissions.length;
  
  // Real average accuracy
  let avgAccuracyText = '-';
  if (totalExamsTaken > 0) {
    const totalAttempted = userSubmissions.reduce(
      (sum, s) => sum + (s.correctAnswers + s.wrongAnswers), 
      0
    );
    const totalCorrect = userSubmissions.reduce(
      (sum, s) => sum + s.correctAnswers, 
      0
    );
    const calculatedAcc = totalAttempted > 0 
      ? Math.round((totalCorrect / totalAttempted) * 100) 
      : 0;
    avgAccuracyText = `${calculatedAcc}%`;
  }

  // Real best rank
  let bestRankText = '-';
  if (totalExamsTaken > 0) {
    const ranks = userSubmissions
      .map((s) => s.rank)
      .filter((r): r is number => typeof r === 'number');
    if (ranks.length > 0) {
      bestRankText = `#${Math.min(...ranks)}`;
    } else {
      bestRankText = 'অংশগ্রহণকৃত';
    }
  }

  // 3. Real Payments (strictly filtered by currentUser)
  const userPhoneClean = (currentUser.phone || '').replace(/\D/g, '');
  const myEnrollments = enrollments.filter((e) => {
    if (currentUser.id && e.studentId === currentUser.id) return true;
    if (userPhoneClean) {
      const p1 = (e.studentPhone || '').replace(/\D/g, '');
      const p2 = (e.senderPhone || '').replace(/\D/g, '');
      if (p1 && p1 === userPhoneClean) return true;
      if (p2 && p2 === userPhoneClean) return true;
    }
    return false;
  });

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-6 space-y-8">
      
      {/* Top Banner with Profile Info */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-[#ed347d] p-0.5 shrink-0 shadow-md">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800">{currentUser.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff0f5] text-[#ed347d] border border-[#fecdd3]">
                    শিক্ষার্থী
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {currentUser.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-[#ed347d]" />
                      {currentUser.college}
                    </span>
                  )}
                  {currentUser.college && <span>•</span>}
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <Link
              href="/exam"
              className="px-5 py-2.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-md flex items-center gap-1.5 self-start sm:self-auto hover:scale-[1.02] transition-transform"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>অনলাইন পরীক্ষা হল</span>
            </Link>
          </div>

          {/* Real Dynamic Metrics (NO Fake Mock Numbers for new students!) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* 1. Enrolled Courses */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 block mb-1">এনরোলকৃত কোর্স</span>
              <div className="text-2xl font-black text-slate-800">
                {enrolledCourses.length} <span className="text-xs font-bold text-slate-400">টি</span>
              </div>
            </div>

            {/* 2. Exams Taken */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 block mb-1">অংশগ্রহণকৃত পরীক্ষা</span>
              <div className="text-2xl font-black text-[#ed347d]">
                {totalExamsTaken} <span className="text-xs font-bold text-slate-400">টি</span>
              </div>
            </div>

            {/* 3. Average Accuracy */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 block mb-1">গড় একুরেসি</span>
              <div className="text-2xl font-black text-emerald-600">
                {avgAccuracyText}
              </div>
            </div>

            {/* 4. Best Rank */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 block mb-1">সেরা র‍্যাংক</span>
              <div className="text-2xl font-black text-amber-500">
                {bestRankText}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Tabs & Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('my_courses')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'my_courses'
                ? 'bg-[#ed347d] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>আমার কোর্সসমূহ ({enrolledCourses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exam_history')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'exam_history'
                ? 'bg-[#ed347d] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>পরীক্ষার রিপোর্ট ({totalExamsTaken})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-[#ed347d] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>পেমেন্ট রসিদ ({myEnrollments.length})</span>
          </button>
        </div>

        {/* Tab 1: Enrolled Courses */}
        {activeTab === 'my_courses' && (
          <div className="space-y-6">
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((c) => (
                  <div key={c.id} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="aspect-video rounded-2xl overflow-hidden relative">
                      <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        সক্রিয় অ্যাক্সেস
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-[#ed347d] font-bold">{c.category} • {c.batch}</span>
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{c.title}</h3>
                    </div>

                    <Link
                      href={`/classroom/${c.id}`}
                      className="w-full py-2.5 rounded-full text-white ph-btn-pink font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] transition-transform"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>ক্লাসরুমে প্রবেশ করুন</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 space-y-4 max-w-md mx-auto shadow-xs">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#ed347d]">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">আপনি এখনো কোনো কোর্সে ভর্তি হননি</h3>
                  <p className="text-xs text-slate-500">
                    ক্লাসরুম, স্পেশাল লেকচার শিট ও ওএমআর পরীক্ষায় অংশ নিতে আপনার পছন্দের কোর্সে ভর্তি হোন।
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white ph-btn-pink text-xs font-bold shadow-md hover:scale-[1.02] transition-transform"
                >
                  <span>সবগুলো কোর্স দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Exam History */}
        {activeTab === 'exam_history' && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">সর্বশেষ পরীক্ষার ফলাফল ও রিপোর্ট</h3>
            
            {userSubmissions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {userSubmissions.map((sub) => {
                  const exam = exams.find((e) => e.id === sub.examId);
                  return (
                    <div key={sub.examId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          {exam?.title || 'অনলাইন মডেল টেস্ট'}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          তারিখ: {sub.submittedAt} | সঠিক: {sub.correctAnswers} | ভুল: {sub.wrongAnswers}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-600">
                            প্রাপ্ত নম্বর: {sub.score} / {exam?.totalMarks || 25}
                          </div>
                          {sub.rank && (
                            <span className="text-xs text-amber-500 font-bold">
                              মেরিট পজিশন: #{sub.rank}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/exam/${sub.examId}`}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                        >
                          সমাধান দেখুন
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Award className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">এখনো কোনো পরীক্ষায় অংশ নেননি</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    আপনার এনরোল্ড কোর্সের লাইভ পরীক্ষা ও মডেল টেস্ট দিলে এখানে প্রাপ্ত নম্বর, সঠিক-ভুল বিশ্লেষণ ও মেধা তালিকা দেখতে পারবেন।
                  </p>
                </div>
                <Link
                  href="/exam"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white ph-btn-pink text-xs font-bold shadow-md hover:scale-[1.02] transition-transform"
                >
                  <span>অনলাইন এক্সাম হলে যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payment Invoices */}
        {activeTab === 'payments' && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">পেমেন্ট রসিদ ও ট্রানজাকশন ইতিহাস</h3>
            
            {myEnrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400">
                      <th className="py-3 px-3">তারিখ</th>
                      <th className="py-3 px-3">কোর্সের নাম</th>
                      <th className="py-3 px-3">মেথড</th>
                      <th className="py-3 px-3">টাকা</th>
                      <th className="py-3 px-3">TrxID</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myEnrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-400">{enr.createdAt}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{enr.courseTitle}</td>
                        <td className="py-3 px-3 text-[#ed347d] font-bold">{enr.paymentMethod}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">৳ {enr.amount}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{enr.trxId}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            enr.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {enr.status === 'approved' ? 'অনুমোদিত' : 'পেন্ডিং'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">কোনো পেমেন্ট তথ্য পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    বিকাশ বা নগদ দিয়ে কোর্সে ভর্তি হয়ে TrxID সাবমিট করলে এখানে রসিদ ও অনুমোদন স্ট্যাটাস দেখতে পাবেন।
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
