'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  MessageSquare, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  PlusCircle, 
  ShieldCheck, 
  Users, 
  ArrowLeft, 
  Filter, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function StudentMessagesPage() {
  const { 
    currentUser, 
    courses, 
    conversations, 
    sendChatMessage, 
    createDoubtThread, 
    markThreadAsRead,
    isEnrolled,
    getOrCreateBatchGroup
  } = useApp();

  const [activeTab, setActiveTab] = useState<'doubts' | 'direct' | 'support' | 'batch'>('doubts');
  
  const isGuest = !currentUser || !currentUser.id || currentUser.id === 'usr_guest';

  // Strictly filter only enrolled courses for student
  const enrolledCourseIds = currentUser?.enrolledCourseIds || [];
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

  const [studentBatchCourseId, setStudentBatchCourseId] = useState<string>('');

  if (isGuest) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 text-[#ed347d] flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">শিক্ষার্থী লগইন আবশ্যক</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              শিক্ষকদের কাছে একাডেমিক প্রশ্ন (ডাউট) পাঠাতে এবং সরাসরি মেসেজ আদান-প্রদান করতে অনুগ্রহ করে লগইন করুন।
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/auth/login?redirect=/messages"
              className="w-full py-3 rounded-full text-xs font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
            >
              <span>লগইন করুন</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <span>হোমে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Ask Doubt Modal State
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [doubtSubject, setDoubtSubject] = useState('পদার্থবিজ্ঞান ১ম পত্র');
  const [doubtChapter, setDoubtChapter] = useState('অধ্যায় ৩: গতিবিদ্যা (প্রাস)');
  const [doubtTopic, setDoubtTopic] = useState('সর্বোচ্চ উচ্চতায় বেগ ও ত্বরণ');
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtImageUrl, setDoubtImageUrl] = useState('');

  // Active selected thread states
  const [selectedDoubtId, setSelectedDoubtId] = useState<string>('');
  const [selectedDirectId, setSelectedDirectId] = useState<string>('');
  const [studentReplyText, setStudentReplyText] = useState('');
  const [directReplyText, setDirectReplyText] = useState('');
  const [supportReplyText, setSupportReplyText] = useState('');
  const [batchPostText, setBatchPostText] = useState('');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  // Filter threads for student
  const doubtThreads = conversations.filter((c) => c.type === 'doubt');
  const directThreads = conversations.filter((c) => c.type === 'direct');
  const supportThreads = conversations.filter((c) => c.type === 'support');
  const batchThreads = conversations.filter((c) => c.type === 'batch_group');

  const activeStudentBatchCourse = enrolledCourses.find((c) => c.id === studentBatchCourseId) || enrolledCourses[0];
  const currentStudentBatch = activeStudentBatchCourse
    ? (conversations.find((c) => c.type === 'batch_group' && c.courseId === activeStudentBatchCourse.id) || getOrCreateBatchGroup(activeStudentBatchCourse.id, activeStudentBatchCourse.title))
    : undefined;

  const activeDoubt = doubtThreads.find((d) => d.id === selectedDoubtId) || doubtThreads[0];
  const activeDirect = directThreads.find((d) => d.id === selectedDirectId) || directThreads[0];
  const activeSupport = supportThreads[0];

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;

    const courseIdToUse = selectedCourseId || enrolledCourses[0]?.id || courses[0]?.id || 'course_campus6';
    const courseObj = courses.find((c) => c.id === courseIdToUse);
    const newThreadId = createDoubtThread({
      courseId: courseIdToUse,
      courseTitle: courseObj ? courseObj.title : 'Campus 6.0',
      subject: doubtSubject,
      chapter: doubtChapter,
      topic: doubtTopic,
      question: doubtQuestion.trim(),
      imageUrl: doubtImageUrl.trim() || undefined,
    });

    setSelectedDoubtId(newThreadId);
    setDoubtQuestion('');
    setDoubtImageUrl('');
    setIsDoubtModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-pink-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোমে ফিরে যান</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDoubtModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-[#ed347d] hover:bg-[#d82a6e] shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন প্রশ্ন পাঠান (Ask a Doubt)</span>
          </button>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-3">
                <HelpCircle className="w-3 h-3" />
                Student Doubt Solver & Academic Messenger
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                আপনার অ্যাকাডেমিক প্রশ্ন ও টিচার ইনবক্স
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                পড়ার যেকোনো সমস্যা, ম্যাথ কিংবা সূত্রের খটকা আটকে গেলে সরাসরি সম্মানিত শিক্ষকের কাছে প্রশ্ন পাঠান এবং বিস্তারিত সমাধান বুঝে নিন।
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 block font-medium">আপনার প্রশ্ন</span>
                <span className="text-lg font-black text-white">{doubtThreads.length}টি</span>
              </div>
              <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-200 block font-medium">সমাধানকৃত</span>
                <span className="text-lg font-black text-emerald-400">
                  {doubtThreads.filter((d) => d.status === 'solved').length}টি
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1.5">
          {[
            { id: 'doubts', label: '১. আমার ডাউট প্রশ্নসমূহ', icon: HelpCircle, badge: doubtThreads.length },
            { id: 'direct', label: '২. টিচার ডিরেক্ট চ্যাট', icon: MessageSquare, badge: directThreads.length },
            { id: 'support', label: '৩. হেল্প ও সাপোর্ট ডেস্ক', icon: ShieldCheck },
            { id: 'batch', label: '৪. ব্যাচ ডিসকাশন ফোরাম', icon: Users, badge: enrolledCourses.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ed347d] text-white shadow-md shadow-pink-500/25'
                    : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: STUDENT DOUBTS (প্রশ্ন ও সমাধান হাব) */}
        {activeTab === 'doubts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
            {/* Left list: Questions submitted by students */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  আপনার জমা দেয়া প্রশ্নসমূহ ({doubtThreads.length})
                </h3>
              </div>

              {doubtThreads.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">আপনি এখনও কোনো প্রশ্ন জমা দেননি</p>
                  <button
                    type="button"
                    onClick={() => setIsDoubtModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#ed347d] bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer"
                  >
                    এখনই প্রশ্ন করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                  {doubtThreads.map((d) => {
                    const isSelected = activeDoubt?.id === d.id;
                    const isSolved = d.status === 'solved';
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDoubtId(d.id);
                          markThreadAsRead(d.id, 'student');
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-[#ed347d] shadow-md ring-2 ring-pink-500/10'
                            : 'bg-white border-slate-200/90 hover:border-pink-200 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-indigo-700 text-[11px] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {d.subject}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isSolved
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                          }`}>
                            {isSolved ? '✓ সমাধান হয়েছে' : '● টিচারের উত্তরের অপেক্ষায়'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-1.5">
                          {d.lastMessageText}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>{d.chapter}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {d.lastMessageTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Active Doubt Detailed View & Teacher Answer */}
            <div className="lg:col-span-7">
              {activeDoubt ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 sticky top-24">
                  {/* Doubt Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {activeDoubt.courseTitle}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {activeDoubt.subject} • {activeDoubt.chapter}
                      </h3>
                      {activeDoubt.topic && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">টপিক: {activeDoubt.topic}</p>
                      )}
                    </div>

                    <span className={`text-xs font-black px-3 py-1 rounded-full shrink-0 ${
                      activeDoubt.status === 'solved'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {activeDoubt.status === 'solved' ? '✓ সমাধান হয়েছে' : 'অপেক্ষমান'}
                    </span>
                  </div>

                  {/* Student Question Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-800 leading-relaxed">
                    <span className="text-[11px] font-bold text-slate-500 block">আপনার প্রশ্ন:</span>
                    <p className="font-semibold text-slate-900 text-[13px]">{activeDoubt.lastMessageText}</p>

                    {activeDoubt.doubtImageUrl && (
                      <div className="pt-2">
                        <img
                          src={activeDoubt.doubtImageUrl}
                          alt="Diagram"
                          className="w-48 h-32 rounded-xl object-cover border border-slate-200 cursor-pointer shadow-xs hover:opacity-90"
                          onClick={() => setSelectedZoomImage(activeDoubt.doubtImageUrl!)}
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">ক্লিক করে ছবি বড় করুন</span>
                      </div>
                    )}
                  </div>

                  {/* Discussion and Teacher Answers */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      শিক্ষকের সমাধান ও রিপ্লাই ({activeDoubt.messages.length})
                    </h4>

                    {activeDoubt.messages.map((m) => {
                      const isTeacher = m.senderRole === 'teacher';
                      return (
                        <div
                          key={m.id}
                          className={`p-4 rounded-2xl text-xs leading-relaxed ${
                            isTeacher
                              ? 'bg-gradient-to-br from-pink-50 to-white border border-pink-200 shadow-xs'
                              : 'bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
                            <span className={isTeacher ? 'text-[#ed347d] font-black flex items-center gap-1.5' : 'text-slate-700'}>
                              {m.senderName} {isTeacher && '★ (কোর্স মেন্টর)'}
                            </span>
                            <span className="text-slate-400 font-normal">{m.createdAt}</span>
                          </div>
                          <p className="text-slate-800 text-[12px] leading-relaxed">{m.text}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Student Follow-up Reply Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!studentReplyText.trim()) return;
                      sendChatMessage(activeDoubt.id, studentReplyText, undefined, 'student');
                      setStudentReplyText('');
                    }}
                    className="pt-3 border-t border-slate-100 flex gap-2"
                  >
                    <input
                      type="text"
                      value={studentReplyText}
                      onChange={(e) => setStudentReplyText(e.target.value)}
                      placeholder="টিচারকে কোনো ফলো-আপ প্রশ্ন বা ধন্যবাদ জানান..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#ed347d] hover:bg-[#d82a6e] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>পাঠান</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <p className="text-xs font-bold text-slate-500">কোনো প্রশ্ন নির্বাচন করা নেই</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT CHAT 1-ON-1 WITH TEACHER */}
        {activeTab === 'direct' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px] animate-fade-in">
            {/* Left: Mentors List */}
            <div className="md:col-span-4 border-r border-slate-200 p-4 space-y-3 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                আপনার কোর্স শিক্ষকগণ
              </h4>
              <div className="space-y-2">
                {directThreads.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedDirectId(m.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all ${
                      activeDirect?.id === m.id
                        ? 'bg-white shadow-xs border border-pink-300'
                        : 'hover:bg-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                        alt="Teacher"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">আবির মাহমুদ (মাস্টার ট্রেইনার)</h5>
                        <p className="text-[10px] text-slate-500">ক্যাম্পাস ৬.০ ফিজিক্স মেন্টর</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Chat Thread */}
            <div className="md:col-span-8 p-6 flex flex-col justify-between">
              {activeDirect && (
                <>
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                        alt="Teacher"
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="text-xs font-black text-slate-900">আবির মাহমুদ (মাস্টার ট্রেইনার)</h4>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> অনলাইনে আছেন
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[360px]">
                    {activeDirect.messages.map((m) => {
                      const isMe = m.senderRole === 'student';
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#ed347d] text-white rounded-br-xs'
                                : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                            }`}
                          >
                            <p>{m.text}</p>
                            <span className={`text-[9px] block mt-1 text-right ${
                              isMe ? 'text-pink-100' : 'text-slate-400'
                            }`}>
                              {m.createdAt}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!directReplyText.trim()) return;
                      sendChatMessage(activeDirect.id, directReplyText, undefined, 'student');
                      setDirectReplyText('');
                    }}
                    className="pt-3 border-t border-slate-100 flex gap-2"
                  >
                    <input
                      type="text"
                      value={directReplyText}
                      onChange={(e) => setDirectReplyText(e.target.value)}
                      placeholder="শিক্ষককে সরাসরি বার্তা পাঠান..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#ed347d] hover:bg-[#d82a6e] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>পাঠান</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUPPORT DESK */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-black text-slate-900">অদম্য হেল্প ও টেকনিক্যাল সাপোর্ট ডেস্ক</h3>
                <p className="text-xs text-slate-500">পেমেন্ট, ভিডিও সমস্যা বা এক্সেস সংক্রান্ত সহায়তার জন্য টিকেট হিস্টোরি</p>
              </div>
            </div>

            {activeSupport && (
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-700">টিকেট আইডি: {activeSupport.ticketNumber || '#TKT-4892'}</span>
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                    ওপেন
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {activeSupport.messages.map((m) => (
                    <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className={m.senderRole === 'admin' ? 'text-indigo-700 font-black' : 'text-slate-800'}>
                          {m.senderName}
                        </span>
                        <span>{m.createdAt}</span>
                      </div>
                      <p className="text-slate-700">{m.text}</p>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!supportReplyText.trim()) return;
                    sendChatMessage(activeSupport.id, supportReplyText, undefined, 'student');
                    setSupportReplyText('');
                  }}
                  className="pt-2 flex gap-2"
                >
                  <input
                    type="text"
                    value={supportReplyText}
                    onChange={(e) => setSupportReplyText(e.target.value)}
                    placeholder="সাপোর্ট ডেস্কের সাথে যোগাযোগ করুন..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>পাঠান</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BATCH DISCUSSION (ENROLLED COURSES ONLY) */}
        {activeTab === 'batch' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fade-in">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#ed347d] flex items-center justify-center mx-auto border border-pink-100 shadow-sm">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">আপনি এখনও কোনো কোর্সে এনরোল করেননি</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    অফিসিয়াল ব্যাচমেট ফোরামটি শুধুমাত্র ভর্তিকৃত শিক্ষার্থীদের জন্য উন্মুক্ত। আপনি যে যে কোর্সে এনরোল করবেন সেই কোর্সের ব্যাচমেটদের সাথেই আলোচনা করতে পারবেন।
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#ed347d] hover:bg-[#d82a6e] shadow-md shadow-pink-500/20 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>কোর্সসমূহ দেখুন ও ভর্তি হোন</span>
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-[#ed347d]" />
                      <h3 className="text-base font-black text-slate-900">
                        {activeStudentBatchCourse?.title} - অফিসিয়াল ব্যাচমেট ফোরাম
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      আপনার এনরোল করা কোর্সের সহপাঠী ও সম্মানিত মেন্টরদের সাথে মুক্ত অ্যাকাডেমিক আলোচনা ও স্টাডি সার্কেল।
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>এনরোল্ড ব্যাচ</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                      {activeStudentBatchCourse?.enrolledCount || 120}+ ব্যাচমেট
                    </span>
                  </div>
                </div>

                {/* Enrolled Courses Selector Pills */}
                {enrolledCourses.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#ed347d]" />
                      <span>আপনার এনরোল্ড কোর্সসমূহ (ক্লিক করে ব্যাচ পরিবর্তন করুন):</span>
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {enrolledCourses.map((c) => {
                        const isSelected = (activeStudentBatchCourse?.id || studentBatchCourseId) === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setStudentBatchCourseId(c.id)}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-pink-50 hover:border-pink-200 hover:text-[#ed347d]'
                            }`}
                          >
                            <span>{c.title}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Batch Discussion Feed */}
                {currentStudentBatch && (
                  <>
                    <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-3.5 max-h-[380px] overflow-y-auto">
                      {currentStudentBatch.messages.map((m) => {
                        const isTeacher = m.senderRole === 'teacher';
                        const isMe = m.senderRole === 'student' && (m.senderId === currentUser.id || m.senderName === currentUser.name);
                        return (
                          <div
                            key={m.id}
                            className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                              isTeacher
                                ? 'bg-gradient-to-r from-pink-50 via-rose-50/30 to-white border-pink-200 shadow-2xs'
                                : isMe
                                ? 'bg-blue-50/50 border-blue-200/80 shadow-2xs'
                                : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <div className="flex items-center gap-2">
                                <img
                                  src={m.senderAvatar || (isTeacher ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                />
                                <span className={isTeacher ? 'text-[#ed347d] font-black' : isMe ? 'text-blue-700 font-black' : 'text-slate-800'}>
                                  {m.senderName} {isTeacher ? '★ কোর্স মেন্টর' : isMe ? '(আপনি)' : '• ব্যাচমেট'}
                                </span>
                              </div>
                              <span className="text-slate-400 font-normal">{m.createdAt}</span>
                            </div>
                            <p className="text-slate-700 text-[12px] leading-relaxed">{m.text}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Post Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!batchPostText.trim() || !currentStudentBatch) return;
                        sendChatMessage(currentStudentBatch.id, batchPostText, undefined, 'student');
                        setBatchPostText('');
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={batchPostText}
                        onChange={(e) => setBatchPostText(e.target.value)}
                        placeholder={`"${activeStudentBatchCourse?.title || 'এই কোর্স'}" ব্যাচমেটদের সাথে আপনার প্রশ্ন বা মতামত শেয়ার করুন...`}
                        className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl text-xs font-black text-white bg-[#ed347d] hover:bg-[#d82a6e] shadow-md shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>পোস্ট করুন</span>
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ASK A DOUBT MODAL */}
        {isDoubtModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#ed347d]" />
                  <h3 className="text-base font-black text-slate-900">শিক্ষকের কাছে প্রশ্ন পাঠান</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDoubtModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDoubt} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">কোর্স নির্বাচন করুন</label>
                  <select
                    value={selectedCourseId || enrolledCourses[0]?.id || courses[0]?.id || ''}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {(enrolledCourses.length > 0 ? enrolledCourses : courses).map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">বিষয়</label>
                    <input
                      type="text"
                      value={doubtSubject}
                      onChange={(e) => setDoubtSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্র"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">অধ্যায় / টপিক</label>
                    <input
                      type="text"
                      value={doubtChapter}
                      onChange={(e) => setDoubtChapter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      placeholder="যেমন: গতিবিদ্যা"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">আপনার প্রশ্ন বা গাণিতিক সমস্যাটি বিস্তারিত লিখুন</label>
                  <textarea
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    rows={4}
                    required
                    placeholder="প্রশ্নটি সুস্পষ্টভাবে লিখুন, কোথায় খটকা লাগছে তা উল্লেখ করুন..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">খাতার অংক বা ডায়াগ্রামের ছবির লিংক (ঐচ্ছিক)</label>
                  <input
                    type="url"
                    value={doubtImageUrl}
                    onChange={(e) => setDoubtImageUrl(e.target.value)}
                    placeholder="https://... (ছবি লিংক)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDoubtModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#ed347d] hover:bg-[#d82a6e] shadow-md shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>প্রশ্ন জমা দিন</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* IMAGE ZOOM MODAL */}
        {selectedZoomImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-800">ছবি বড় করে দেখুন</h4>
                <button
                  type="button"
                  onClick={() => setSelectedZoomImage(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="p-3 overflow-auto flex items-center justify-center max-h-[70vh]">
                <img
                  src={selectedZoomImage}
                  alt="Zoomed"
                  className="max-h-[65vh] w-auto rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
