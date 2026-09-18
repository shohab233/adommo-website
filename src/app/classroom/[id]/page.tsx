'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ProtectedVideoPlayer from '@/components/ProtectedVideoPlayer';
import PaymentModal from '@/components/PaymentModal';
import { 
  PlayCircle, 
  FileText, 
  Download, 
  Award, 
  ArrowLeft, 
  Lock, 
  MessageSquare, 
  Send, 
  Flame, 
  CheckCircle2,
  Archive,
  Folder,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookMarked,
  Clock,
  Calendar,
  Sparkles,
  Radio,
  Video,
  AlertCircle,
  Tv
} from 'lucide-react';
import { CourseModule, ResourceNote } from '@/types';

export default function ClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { courses, isEnrolled, exams, currentUser, showToast, questionBanks, examSubmissions, detailedSubmissions, liveClasses, loadFullCourse } = useApp();
  
  const course = courses.find((c) => c.id === resolvedParams.id);
  const [isFetchingCourse, setIsFetchingCourse] = useState(!course || !course.modules || course.modules.length === 0);

  useEffect(() => {
    if (resolvedParams.id && (!course || !course.modules || course.modules.length === 0)) {
      setIsFetchingCourse(true);
      loadFullCourse(resolvedParams.id).finally(() => {
        setIsFetchingCourse(false);
      });
    }
  }, [resolvedParams.id, course, loadFullCourse]);

  const [currentLectureId, setCurrentLectureId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'notes' | 'discussion'>('notes');

  const courseLiveClasses = course ? liveClasses.filter((lc) => lc.courseId === course.id) : [];
  const ongoingLiveClass = courseLiveClasses.find((lc) => lc.status === 'live');
  const upcomingLiveClasses = courseLiveClasses.filter((lc) => lc.status === 'upcoming');
  const completedLiveClasses = courseLiveClasses.filter((lc) => lc.status === 'completed');
  const courseQBanksCount = course ? questionBanks.filter((qb) => qb.courseId === course.id).length : 0;
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>(() => {
    if (typeof window !== 'undefined' && course?.id) {
      try {
        const saved = localStorage.getItem(`adommo_comments_${course.id}`);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expandedDrawerSections, setExpandedDrawerSections] = useState<Record<string, boolean>>({});
  const [expandedDrawerChapters, setExpandedDrawerChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (course && course.modules?.[0]?.lectures?.[0]?.id) {
      setCurrentLectureId((prev) => prev || course.modules[0].lectures[0].id);
    }
  }, [course]);

  if (isFetchingCourse && !course) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4 bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-[#ed347d] rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">ক্লাসরুম প্রস্তুত করা হচ্ছে...</h2>
        <p className="text-xs text-slate-500">কোর্সের সকল লেকচার ও স্টাডি উপাদান লোড হচ্ছে, এক মুহূর্ত অপেক্ষা করুন।</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4 bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800">ক্লাসরুম পাওয়া যায়নি!</h2>
        <p className="text-xs text-slate-500">কোর্সটি মুছে ফেলা হয়েছে অথবা আপনার এক্সেস অনুমতি নেই।</p>
        <Link href="/courses" className="inline-block px-5 py-2.5 rounded-full ph-btn-pink text-white font-bold text-xs">
          সকল কোর্স দেখুন
        </Link>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);

  let activeLecture = course.modules?.[0]?.lectures?.[0];
  for (const mod of (course.modules || [])) {
    const found = mod.lectures?.find((l) => l.id === currentLectureId);
    if (found) {
      activeLecture = found;
      break;
    }
  }

  const relevantExam = exams.find((e) => e.courseId === course.id);

  const handleDownloadSheet = (title: string, pdfUrl?: string) => {
    if (pdfUrl && pdfUrl !== '#' && !pdfUrl.startsWith('javascript:')) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      showToast(`📥 "${title}" ড্রাইভ/অনলাইন শিট ওপেন করা হচ্ছে...`);
    } else {
      showToast(`📥 "${title}" সফলভাবে ডাউনলোড শুরু হয়েছে!`);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      user: currentUser.name || 'শিক্ষার্থী',
      text: commentInput.trim(),
      time: 'এইমাত্র',
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    if (typeof window !== 'undefined' && course?.id) {
      try {
        localStorage.setItem(`adommo_comments_${course.id}`, JSON.stringify(updated));
      } catch {}
    }
    setCommentInput('');
    showToast('💬 আপনার মন্তব্য পোস্ট করা হয়েছে!');
  };

  const renderChapterAccordion = (
    mod: CourseModule, 
    theme: 'default' | 'amber' = 'default'
  ) => {
    const isExpanded = expandedDrawerChapters[mod.id] !== undefined
      ? expandedDrawerChapters[mod.id]
      : mod.lectures.some((l) => l.id === currentLectureId);

    const isAmber = theme === 'amber';

    const chapterNotes = (mod.lectures || []).flatMap((l) =>
      (l.notes || []).map((n) => ({
        ...n,
        fromLectureId: l.id,
        fromLectureTitle: l.title,
      }))
    );
    const directNotes = (((mod as any).notes || []) as ResourceNote[]).map((n) => ({
      ...n,
      fromLectureId: '',
      fromLectureTitle: mod.title,
    }));
    const allModNotes = [...chapterNotes, ...directNotes];
    const totalSheetsCount = allModNotes.length;

    return (
      <div 
        key={mod.id} 
        className={`rounded-xl border transition-all overflow-hidden ${
          isAmber 
            ? 'bg-amber-50/60 border-amber-200/90' 
            : 'bg-white border-slate-200/90 shadow-2xs'
        }`}
      >
        {/* Chapter Header / Toggle */}
        <button
          type="button"
          onClick={() => {
            setExpandedDrawerChapters((prev) => ({
              ...prev,
              [mod.id]: !isExpanded,
            }));
          }}
          className={`w-full p-2.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none ${
            isAmber ? 'hover:bg-amber-100/60' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isAmber ? 'text-amber-700' : 'text-[#ed347d]'}`} />
            <span className={`text-[11px] font-bold truncate ${isAmber ? 'text-amber-950' : 'text-slate-800'}`}>
              {mod.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
              isAmber ? 'bg-amber-200/80 text-amber-900' : 'bg-pink-50 text-[#ed347d]'
            }`}>
              {mod.lectures.length} ক্লাস
            </span>
            {totalSheetsCount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {totalSheetsCount} শিট
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </button>

        {/* Lecture & Sheets List */}
        {isExpanded && (
          <div className={`p-2 pt-1 space-y-1.5 border-t ${
            isAmber ? 'border-amber-200/60 bg-white/70' : 'border-slate-100 bg-slate-50/50'
          }`}>
            {mod.lectures.map((lec) => {
              const isActive = lec.id === currentLectureId;
              const lecNotes = lec.notes || [];

              return (
                <div key={lec.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setCurrentLectureId(lec.id)}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#fff2f7] border border-[#fecdd3] text-[#ed347d] font-bold shadow-xs'
                        : isAmber
                        ? 'bg-white hover:bg-amber-50/80 border border-amber-200/70 text-slate-700'
                        : 'bg-white hover:bg-slate-100/80 border border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <PlayCircle
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#ed347d]' : isAmber ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">{lec.title}</span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[9px]">
                      {lec.duration && <span className="text-slate-400 mr-1">{lec.duration}</span>}
                      {lec.isFreePreview ? (
                        <span className="text-[#ed347d] font-bold">ফ্রি</span>
                      ) : !enrolled ? (
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                      ) : null}
                    </div>
                  </button>

                  {/* Attached Sheets directly under this Lecture */}
                  {lecNotes.length > 0 && (
                    <div className="ml-4 pl-2 border-l-2 border-pink-200 space-y-1 py-0.5">
                      {lecNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-[10px] flex items-center justify-between gap-1 shadow-2xs hover:border-pink-200 transition-all"
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                            <FileText className="w-3 h-3 text-[#ed347d] shrink-0" />
                            <span className="truncate font-semibold text-slate-800" title={note.title}>
                              {note.title}
                            </span>
                            <span className="text-[8px] px-1 py-0.2 rounded bg-pink-50 text-[#ed347d] shrink-0 font-bold">
                              {note.type === 'practice_sheet' ? 'প্র্যাকটিস' : note.type === 'handnote' ? 'নোট' : 'শিট'}
                            </span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1">
                            {enrolled || lec.isFreePreview ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSheet(note.title, note.pdfUrl);
                                }}
                                className="px-2 py-0.5 rounded-full bg-[#fff2f7] hover:bg-[#ffe3ee] text-[#ed347d] font-bold text-[9px] border border-[#ffd2e2] flex items-center gap-0.5 cursor-pointer"
                              >
                                <Download className="w-2.5 h-2.5" />
                                শিট
                              </button>
                            ) : (
                              <Lock className="w-2.5 h-2.5 text-slate-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Module Sheets or When Module Has 0 Lectures */}
            {mod.lectures.length === 0 && allModNotes.length > 0 && (
              <div className="space-y-1.5 p-1">
                <div className="text-[10px] font-black text-indigo-700 flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3" />
                  অধ্যায়ের ক্লাস শিট ও নোট ({allModNotes.length} টি)
                </div>
                {allModNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs hover:border-pink-200 transition-all"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <FileText className="w-3.5 h-3.5 text-[#ed347d] shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-800 text-[11px] block truncate">{note.title}</span>
                        <span className="text-[9px] text-slate-400">{note.pages ? `${note.pages} পৃষ্ঠা • ` : ''}{note.size || '3.5 MB'}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {enrolled ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSheet(note.title, note.pdfUrl);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#fff2f7] hover:bg-[#ffe3ee] text-[#ed347d] font-bold text-[10px] border border-[#ffd2e2] flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          ডাউনলোড
                        </button>
                      ) : (
                        <Lock className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mod.lectures.length === 0 && allModNotes.length === 0 && (
              <p className="text-[10px] text-slate-400 italic py-1 text-center">এই অধ্যায়ে এখনো ক্লাস বা শিট যুক্ত নেই</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-1 sm:pt-2 space-y-4 sm:space-y-5">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${course.id}`}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold text-[#ed347d] uppercase tracking-wider block">
                {course.batch} • {course.category}
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-800 line-clamp-1">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/classroom/${course.id}/live`}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                ongoingLiveClass
                  ? 'bg-rose-50 border border-rose-300 text-rose-600 animate-pulse font-extrabold shadow-rose-200 ring-2 ring-rose-300/50'
                  : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${ongoingLiveClass ? 'text-rose-600 animate-pulse' : 'text-rose-500'}`} />
              <span>লাইভ ক্লাস</span>
              {ongoingLiveClass ? (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider">
                  LIVE
                </span>
              ) : courseLiveClasses.length > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 text-[10px]">
                  {courseLiveClasses.length}
                </span>
              ) : null}
            </Link>

            <Link
              href={`/classroom/${course.id}/qbank`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-all shadow-2xs"
            >
              <BookMarked className="w-3.5 h-3.5 text-purple-600" />
              <span>প্রশ্নব্যাংক</span>
              {courseQBanksCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-900 text-[10px]">
                  {courseQBanksCount}
                </span>
              )}
            </Link>

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

      {/* Main Grid: Player + Drawer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Video Player & Tabs */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="space-y-3">
              {/* Ongoing Live Class Top Banner Alert */}
              {ongoingLiveClass && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-red-400/40">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="relative flex h-4 w-4 shrink-0 mt-1 sm:mt-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-black uppercase tracking-wider text-rose-100">
                          🔴 লাইভ ক্লাস চলছে
                        </span>
                        <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-bold">
                          {ongoingLiveClass.platform.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black mt-1 leading-snug">
                        {ongoingLiveClass.title}
                      </h3>
                      <p className="text-xs text-rose-100 mt-0.5">
                        শিক্ষক: {ongoingLiveClass.instructorName} • সময়: {ongoingLiveClass.time} ({ongoingLiveClass.durationMinutes} মিনিট)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap">
                    {ongoingLiveClass.meetingPassword && (
                      <span className="text-xs bg-black/40 px-3 py-2 rounded-xl text-rose-100 font-mono">
                        পাসকোড: {ongoingLiveClass.meetingPassword}
                      </span>
                    )}
                    <Link
                      href={`/classroom/${course.id}/live`}
                      className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>লাইভ পোর্টাল</span>
                    </Link>
                    <a
                      href={ongoingLiveClass.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-white text-rose-600 font-black text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                    >
                      <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                      <span>সরাসরি লাইভ ক্লাসে যোগ দিন</span>
                    </a>
                  </div>
                </div>
              )}

              {activeLecture ? (
                <>
                  {enrolled || activeLecture.isFreePreview ? (
                    <ProtectedVideoPlayer
                      key={activeLecture.id || activeLecture.videoUrl}
                      videoUrl={activeLecture.videoUrl}
                      title={activeLecture.title}
                    />
                  ) : (
                    <div className="relative aspect-video rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-md">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-800">এই ক্লাসটি লক করা আছে</h3>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {!currentUser || !currentUser.id || currentUser.id === 'usr_guest'
                            ? 'লেকচার ভিডিও দেখা এবং এক্সক্লুসিভ লেকচার শিট ডাউনলোড করার জন্য অনুগ্রহ করে আপনার একাউন্টে লগইন করুন বা কোর্সে ভর্তি হোন।'
                            : 'লেকচার ভিডিও দেখা এবং এক্সক্লুসিভ লেকচার শিট ডাউনলোড করার জন্য এই কোর্সে এনরোল সম্পন্ন করুন।'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {!currentUser || !currentUser.id || currentUser.id === 'usr_guest' ? (
                          <>
                            <Link
                              href={`/auth/login?redirect=/classroom/${course.id}`}
                              className="px-5 py-2.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-md"
                            >
                              লগইন করে আনলক করুন
                            </Link>
                            <Link
                              href={`/courses/${course.id}/checkout`}
                              className="px-5 py-2.5 rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                            >
                              কোর্স কিনুন
                            </Link>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowPaymentModal(true)}
                            className="px-5 py-2.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-md"
                          >
                            ৳ {course.offerPrice} দিয়ে আনলক করুন
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-b border-slate-200 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">{activeLecture.title}</h2>
                      <span className="text-xs text-slate-500">সময়সীমা: {activeLecture.duration}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {activeLecture.isFreePreview && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#fff0f5] text-[#ed347d] font-bold border border-[#fecdd3]">
                          ফ্রি ট্রায়াল ক্লাস
                        </span>
                      )}
                      <span className="text-slate-500">ইনস্ট্রাক্টর: {course.instructor.name}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative aspect-video rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-[#ed347d] flex items-center justify-center">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">কোনো ক্লাস লেকচার পাওয়া যায়নি</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      এই কোর্সে এখনো কোনো ক্লাস আপলোড করা হয়নি। শিক্ষক ক্লাস আপলোড করলে এখানে দেখতে পাবেন।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Content Tabs (Lecture Sheets / Discussion / Exams) */}
            <div className="space-y-4">
              
              {(() => {
                const currentLectureNotes = activeLecture?.notes || [];

                return (
                  <>
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          activeTab === 'notes'
                            ? 'bg-[#ed347d] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        ক্লাসের শিট ও নোট
                        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                          {currentLectureNotes.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('discussion')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTab === 'discussion'
                            ? 'bg-[#ed347d] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        প্রশ্নোত্তর ({comments.length})
                      </button>
                    </div>

                    {/* Tab 1: Lecture & Practice Sheets for Current Playing Class */}
                    {activeTab === 'notes' && (() => {
                      const renderStudentSheetCard = (sheet: any, fromLec?: string) => {
                        const isLecture = sheet.type === 'lecture_sheet';
                        const isPractice = sheet.type === 'practice_sheet';
                        const isHandnote = sheet.type === 'handnote';

                        return (
                          <div
                            key={sheet.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-pink-200 transition-all"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                className={`p-2.5 rounded-xl shrink-0 ${
                                  isLecture
                                    ? 'bg-pink-50 text-[#ed347d]'
                                    : isPractice
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-indigo-50 text-indigo-700'
                                }`}
                              >
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                      isLecture
                                        ? 'bg-pink-100/70 text-[#ed347d] border border-pink-200'
                                        : isPractice
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    }`}
                                  >
                                    {isLecture ? '📖 লেকচার শিট' : isPractice ? '📝 প্র্যাকটিস শিট' : '✍️ হ্যান্ডনোট'}
                                  </span>
                                  {fromLec && (
                                    <span className="text-[10px] text-slate-500 font-bold truncate max-w-[220px]" title={fromLec}>
                                      🏷️ {fromLec}
                                    </span>
                                  )}
                                  {sheet.pdfUrl && sheet.pdfUrl !== '#' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      🌐 ড্রাইভ / অনলাইন শিট
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                                  {sheet.title}
                                </h4>

                                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 flex-wrap">
                                  <span>সাইজ: {sheet.size || '3.5 MB'}</span>
                                  <span>•</span>
                                  <span>{sheet.pages} পৃষ্ঠা</span>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-medium">
                                    {(sheet.downloadCount || 0).toLocaleString()} বার ডাউনলোড
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {enrolled || activeLecture?.isFreePreview ? (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSheet(sheet.title, sheet.pdfUrl)}
                                  className="px-4 py-2 rounded-full bg-[#fff2f7] hover:bg-[#ffe3ee] text-[#ed347d] font-bold text-xs border border-[#ffd2e2] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                                >
                                  {sheet.pdfUrl && sheet.pdfUrl !== '#' ? (
                                    <>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      ওপেন / ভিউ PDF
                                    </>
                                  ) : (
                                    <>
                                      <Download className="w-3.5 h-3.5" />
                                      ডাউনলোড PDF
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowPaymentModal(true)}
                                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-400 bg-slate-100 flex items-center gap-1"
                                >
                                  <Lock className="w-3 h-3" />
                                  আনলক
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      };

                      return (
                        <div className="space-y-4">
                          {/* Playing Lecture Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-[#ed347d] flex items-center gap-1.5">
                              <FileText className="w-4 h-4" />
                              বর্তমান ক্লাসের শিট ({activeLecture?.title || 'চলমান লেকচার'})
                            </span>
                            <span className="text-[11px] font-bold bg-pink-50 text-[#ed347d] px-2.5 py-0.5 rounded-full border border-pink-200">
                              {currentLectureNotes.length} টি শিট
                            </span>
                          </div>

                          {currentLectureNotes.length > 0 ? (
                            <div className="space-y-2.5">
                              {currentLectureNotes.map((sheet: any) => renderStudentSheetCard(sheet, activeLecture?.title))}
                            </div>
                          ) : (
                            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-xs text-slate-400 space-y-2">
                              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                              <p className="font-bold text-slate-700 text-sm">এই ক্লাসে কোনো শিট সংযুক্ত নেই</p>
                              <p className="text-slate-400 max-w-sm mx-auto">
                                শিক্ষক এই নির্দিষ্ট ক্লাসের জন্য এখনো কোনো শিট আপলোড করেননি। অন্যান্য ক্লাসের শিট দেখতে ডানদিকের সিলেবাস তালিকা ব্যবহার করুন।
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                );
              })()}

              {/* Tab 2: Discussion Q&A */}
              {activeTab === 'discussion' && (
                <div className="space-y-4">
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ক্লাস সংক্রান্ত যেকোনো প্রশ্ন লিখুন..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#ed347d]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full text-white ph-btn-pink font-bold text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      পোস্ট
                    </button>
                  </form>

                  <div className="space-y-2.5">
                    {comments.map((c) => (
                      <div key={c.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-sm">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#ed347d]">{c.user}</span>
                          <span className="text-slate-400">{c.time}</span>
                        </div>
                        <p className="text-xs text-slate-700">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Col: Course Syllabus Drawer */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm h-fit">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">কোর্স কারিকুলাম</h3>
                <span className="text-xs text-slate-400">বিষয়, অধ্যায় ও আর্কাইভ তালিকা</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                {course.modules?.reduce((acc, m) => acc + (m.lectures?.length || 0), 0) || course.totalLectures || 0} ক্লাস
              </span>
            </div>

            <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
              {(() => {
                const sections = course.sections || [];
                const modules = course.modules || [];

                // If course has configured sections (Subjects, Modules, Archive)
                if (sections.length > 0) {
                  if (modules.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80 space-y-2">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">কোনো অধ্যায় বা ক্লাস যুক্ত নেই</p>
                        <p className="text-[11px] text-slate-400">শিক্ষক এখনো এই কোর্সের কোনো সিলেবাস আপলোড করেননি।</p>
                      </div>
                    );
                  }

                  const regularSections = sections.filter((s) => !s.isArchive && !s.parentArchiveId);
                  const archiveSections = sections.filter((s) => s.isArchive && !s.parentArchiveId);
                  const unassignedModules = modules.filter((m) => !m.parentSectionId && !m.parentArchiveId && !(m as any).sectionId);

                  return (
                    <>
                      {/* 1. Regular Live Syllabus Subjects */}
                      {regularSections.map((sec) => {
                        const secModules = modules.filter((m) => m.parentSectionId === sec.id || (m as any).sectionId === sec.id);
                        if (secModules.length === 0) return null;
                        const isExpanded = expandedDrawerSections[sec.id] !== false;

                        return (
                          <div
                            key={sec.id}
                            className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 space-y-2.5 shadow-2xs"
                          >
                            {/* Section Header */}
                            <div
                              onClick={() => {
                                setExpandedDrawerSections((prev) => ({
                                  ...prev,
                                  [sec.id]: !isExpanded,
                                }));
                              }}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                <Folder className="w-3.5 h-3.5 text-[#ed347d] shrink-0" />
                                <span className="truncate">{sec.title}</span>
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-pink-100 text-[#ed347d]">
                                  সিলেবাস
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Modules */}
                            {isExpanded && (
                              <div className="space-y-2 pt-0.5">
                                {secModules.map((mod) => renderChapterAccordion(mod, 'default'))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 2. Archive Sections (3-Tier Hierarchy: Archive -> Subject -> Chapters -> Lectures) */}
                      {archiveSections.map((arc) => {
                        const arcSubjects = sections.filter((s) => s.parentArchiveId === arc.id);
                        const arcDirectModules = modules.filter((m) => m.parentSectionId === arc.id);
                        if (arcSubjects.length === 0 && arcDirectModules.length === 0) return null;
                        const isArcExpanded = expandedDrawerSections[arc.id] !== false;

                        return (
                          <div
                            key={arc.id}
                            className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/80 via-amber-100/30 to-white p-3 space-y-2.5 shadow-xs"
                          >
                            {/* Archive Section Header */}
                            <div
                              onClick={() => {
                                setExpandedDrawerSections((prev) => ({
                                  ...prev,
                                  [arc.id]: !isArcExpanded,
                                }));
                              }}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                <Archive className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span className="truncate">{arc.title}</span>
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                                  আর্কাইভ ব্যাচ
                                </span>
                                {isArcExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-amber-800" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-amber-800" />
                                )}
                              </div>
                            </div>

                            {/* Archive Subjects & Chapters */}
                            {isArcExpanded && (
                              <div className="space-y-3 pt-1">
                                {/* Subjects inside this Archive */}
                                {arcSubjects.map((sub) => {
                                  const subModules = modules.filter((m) => m.parentSectionId === sub.id);
                                  const isSubExpanded = expandedDrawerSections[sub.id] !== false;

                                  return (
                                    <div
                                      key={sub.id}
                                      className="bg-white/90 rounded-xl border border-amber-200/90 p-2.5 space-y-2"
                                    >
                                      {/* Archive Subject Header */}
                                      <div
                                        onClick={() => {
                                          setExpandedDrawerSections((prev) => ({
                                            ...prev,
                                            [sub.id]: !isSubExpanded,
                                          }));
                                        }}
                                        className="flex items-center justify-between cursor-pointer select-none"
                                      >
                                        <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                                          <span>📚</span>
                                          <span className="truncate">{sub.title}</span>
                                        </span>

                                        <div className="flex items-center gap-1">
                                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                            {subModules.length} অধ্যায়
                                          </span>
                                          {isSubExpanded ? (
                                            <ChevronDown className="w-3 h-3 text-slate-400" />
                                          ) : (
                                            <ChevronRight className="w-3 h-3 text-slate-400" />
                                          )}
                                        </div>
                                      </div>

                                      {/* Chapters under this Archive Subject */}
                                      {isSubExpanded && (
                                        <div className="space-y-2 pl-1 border-l-2 border-amber-200/60 ml-1">
                                          {subModules.map((mod) => renderChapterAccordion(mod, 'amber'))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Direct Archive Modules if any */}
                                {arcDirectModules.map((mod) => renderChapterAccordion(mod, 'amber'))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 3. Unassigned Modules */}
                      {unassignedModules.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                          <span className="text-xs font-bold text-slate-600 block">অন্যান্য অধ্যায়সমূহ</span>
                          <div className="space-y-2">
                            {unassignedModules.map((mod) => renderChapterAccordion(mod, 'default'))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                }

                // Fallback for default modules without explicit sections
                if (modules.length === 0) {
                  return (
                    <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80 space-y-2">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">কোনো অধ্যায় বা ক্লাস যুক্ত নেই</p>
                      <p className="text-[11px] text-slate-400">শিক্ষক এখনো এই কোর্সের কোনো সিলেবাস আপলোড করেননি।</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {modules.map((mod) => renderChapterAccordion(mod, mod.isArchive ? 'amber' : 'default'))}
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
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
