'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Bookmark, 
  Check, 
  Lock, 
  BookOpen, 
  Calendar, 
  Flame, 
  Send,
  HelpCircle,
  FileEdit,
  Sparkles,
  Camera,
  UploadCloud,
  Trash2,
  ZoomIn,
  X,
  Eye,
  FileCheck
} from 'lucide-react';
import { CreativeQuestion } from '@/types';

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { exams, courses, leaderboard, submitExam, submitDetailedExam, currentUser, isEnrolled, showToast, detailedSubmissions } = useApp();

  const [isMounted, setIsMounted] = useState(false);

  const exam = exams.find((e) => e.id === resolvedParams.id);

  if (!exam) {
    return (
      <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-12 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-slate-200/80 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 border border-pink-200 flex items-center justify-center text-[#ed347d]">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">পরীক্ষাটি খুঁজে পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500">হয়তো পরীক্ষাটি এখনো তৈরি বা পাবলিশ হয়নি অথবা লিংকটি সঠিক নয়।</p>
          <Link href="/exam" className="inline-block px-6 py-2.5 rounded-full text-xs font-bold text-white ph-btn-pink">
            সকল পরীক্ষা দেখুন
          </Link>
        </div>
      </div>
    );
  }

  const userEnrolled = isEnrolled(exam.courseId);
  const parentCourse = courses.find((c) => c.id === exam.courseId);

  const isCombined = exam.examType === 'combined';
  const isWrittenOnly = exam.examType === 'written';

  // Live timer for dynamic schedule checks
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  useEffect(() => {
    setIsMounted(true);
    setCurrentTimeMs(Date.now());
    const clock = setInterval(() => setCurrentTimeMs(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Schedule status using exact numeric timestamps
  const examStartTimestamp = exam.startTime ? new Date(exam.startTime).getTime() : 0;
  const examEndTimestamp = exam.endTime ? new Date(exam.endTime).getTime() : 0;
  const isUpcoming = Boolean(examStartTimestamp && !isNaN(examStartTimestamp) && currentTimeMs > 0 && currentTimeMs < examStartTimestamp);
  const isEnded = Boolean(examEndTimestamp && !isNaN(examEndTimestamp) && currentTimeMs > 0 && currentTimeMs > examEndTimestamp);

  // Phase State: 'mcq' or 'cq'
  const [currentPhase, setCurrentPhase] = useState<'mcq' | 'cq'>(isWrittenOnly ? 'cq' : 'mcq');

  // MCQ States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [mcqSecondsRemaining, setMcqSecondsRemaining] = useState((exam.mcqDurationMinutes || exam.durationMinutes || 25) * 60);

  // CQ States
  const sampleCQs: CreativeQuestion[] = exam.creativeQuestions && exam.creativeQuestions.length > 0 ? exam.creativeQuestions : [
    {
      id: 'cq_sample_1',
      title: 'সৃজনশীল প্রশ্ন ০১: গতিবিদ্যা ও ভেক্টর বিশ্লেষণ',
      stem: 'একটি ক্রিকেট বলকে ভূমির সাথে ৩০° কোণে ২০ m/s বেগে নিক্ষেপ করা হলো। বলটি নিক্ষেপের ১.২ সেকেন্ড পর একটি ভবনের ছাদ স্পর্শ করে যায়। অভিকর্ষজ ত্বরণ g = 9.8 ms⁻²।',
      subQuestions: [
        { part: 'ক', text: 'প্রাস (Projectile) কাকে বলে?', marks: 1, sampleAnswer: 'অনুভূমিকের সাথে তির্যকভাবে কোনো বস্তুকে মহাশূন্যে নিক্ষেপ করা হলে তাকে প্রাস বলে।' },
        { part: 'খ', text: 'কোনো বস্তুর অভিকর্ষজ ত্বরণ কেন স্থানভেদে পরিবর্তিত হয়? ব্যাখ্যা করো।', marks: 2, sampleAnswer: 'পৃথিবীর আকৃতি সম্পূর্ণ গোলাকার না হওয়ায় এবং আহ্নিক গতির কারণে বিভিন্ন স্থানে g এর মান ভিন্ন হয়।' },
        { part: 'গ', text: 'বলটির সর্বোচ্চ উচ্চতা কত মিটার হবে নির্ণয় করো।', marks: 3, sampleAnswer: 'H = (u² sin²θ) / (2g) = (20² * sin²30°) / (2 * 9.8) = 5.10 মিটার।' },
        { part: 'ঘ', text: '১.২ সেকেন্ড পর বলটি উল্লম্বভাবে ভবনের ছাদে কত বেগে আঘাত হানবে? গাণিতিক বিশ্লেষণ দাও।', marks: 4, sampleAnswer: 'vx = u cosθ = 20 cos 30° = 17.32 m/s, vy = u sinθ - gt = 10 - 11.76 = -1.76 m/s. লব্ধি বেগ v = √(vx² + vy²) = 17.41 m/s।' },
      ],
    },
    {
      id: 'cq_sample_2',
      title: 'সৃজনশীল প্রশ্ন ০২: নিউটনিয়ান বলবিদ্যা ও কাজ-শক্তি',
      stem: 'একটি ৫ কেজি ভরের স্থির বস্তুর ওপর ২০ নিউটন অনুভূমিক বল ৫ সেকেন্ড যাবত প্রয়োগ করা হলো। মেঝের ঘর্ষণ গুণাঙ্ক μ = ০.২।',
      subQuestions: [
        { part: 'ক', text: 'স্থিতিস্থাপক সংঘর্ষ কী?', marks: 1, sampleAnswer: 'যে সংঘর্ষে সংঘর্ষের পূর্বের ও পরের মোট গতিশক্তি ও ভরবেগ উভয়ই সংরক্ষিত থাকে তাকে স্থিতিস্থাপক সংঘর্ষ বলে।' },
        { part: 'খ', text: 'ঘর্ষণ বল একটি অসংরক্ষণশীল বল কেন? বুঝিয়ে লেখো।', marks: 2, sampleAnswer: 'ঘর্ষণ বলের বিরুদ্ধে কৃতকাজ তাপ শক্তিতে রূপান্তরিত হয় এবং পূর্বাবস্থায় পুনরুদ্ধার করা যায় না।' },
        { part: 'গ', text: 'বল প্রয়োগকালীন বস্তুর ত্বরণ নির্ণয় করো।', marks: 3, sampleAnswer: 'ঘর্ষণ বল fk = μmg = 0.2 * 5 * 9.8 = 9.8 N. কার্যকর বল Fnet = 20 - 9.8 = 10.2 N. ত্বরণ a = Fnet / m = 2.04 ms⁻²।' },
        { part: 'ঘ', text: 'উদ্দীপকের বলটি দ্বারা সম্পাদিত মোট কৃতকাজ এবং গতিশক্তির পরিবর্তনের সমতা যাচাই করো।', marks: 4, sampleAnswer: 'কাজ-শক্তি উপপাদ্য অনুযায়ী Fnet দ্বারা কৃতকাজ = গতিশক্তির পরিবর্তন (W = ΔEk = 127.5 J)।' },
      ],
    },
  ];

  const creativeQuestions = sampleCQs;
  const [currentCqIndex, setCurrentCqIndex] = useState(0);
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, Record<string, string>>>({});
  const [cqImages, setCqImages] = useState<Record<string, Record<string, string[]>>>({});
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [cqSecondsRemaining, setCqSecondsRemaining] = useState((exam.cqDurationMinutes || 100) * 60);

  // Result States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [activeViewTab, setActiveViewTab] = useState<'solutions' | 'leaderboard'>('solutions');

  // Auto-sync with live detailedSubmissions (for batch result publishing and realtime updates)
  const currentDetailedSubmission = submissionResult 
    ? (detailedSubmissions.find((s) => s.id === submissionResult.id) || submissionResult)
    : detailedSubmissions.find((s) => s.examId === exam.id && s.studentId === currentUser.id) || null;

  useEffect(() => {
    if (!submissionResult) {
      const existing = detailedSubmissions.find((s) => s.examId === exam.id && s.studentId === currentUser.id);
      if (existing) {
        setSubmissionResult(existing);
        setIsSubmitted(true);
      }
    }
  }, [detailedSubmissions, exam.id, currentUser.id, submissionResult]);

  // Exam Instruction & Start Flow States
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // 100% Real Dynamic Metrics based on Teacher Exam Setup
  const hasMcq = !isWrittenOnly && Boolean(exam.questions && exam.questions.length > 0);
  const hasCq = (isCombined || isWrittenOnly) && Boolean(creativeQuestions && creativeQuestions.length > 0);

  const mcqMarksTotal = hasMcq
    ? (isCombined ? (exam.mcqMarks || Math.max(0, exam.totalMarks - (exam.cqMarks || 70)) || 30) : exam.totalMarks)
    : 0;

  const cqMarksTotal = hasCq
    ? (isCombined ? (exam.cqMarks || Math.max(0, exam.totalMarks - (exam.mcqMarks || 30)) || 70) : exam.totalMarks)
    : 0;

  const totalMarksCalculated = isCombined ? (mcqMarksTotal + cqMarksTotal) : exam.totalMarks;

  const mcqDurationMins = hasMcq
    ? (isCombined ? (exam.mcqDurationMinutes || 25) : (exam.durationMinutes || 25))
    : 0;

  const cqDurationMins = hasCq
    ? (isCombined ? (exam.cqDurationMinutes || 100) : (exam.durationMinutes || 100))
    : 0;

  const totalDurationMins = isCombined ? (mcqDurationMins + cqDurationMins) : (isWrittenOnly ? cqDurationMins : mcqDurationMins);

  const mcqCount = hasMcq ? exam.questions.length : 0;
  const cqCount = hasCq ? creativeQuestions.length : 0;
  const totalQuestionsCount = mcqCount + cqCount;

  const markPerMcq = mcqCount > 0 ? Number((mcqMarksTotal / mcqCount).toFixed(2)) : 1;
  const negMark = exam.negativeMarkPerWrong || 0.25;
  const negMarkPercent = Math.round((negMark / (markPerMcq || 1)) * 100) || 25;

  // Compress uploaded CQ handwritten script images so they fit safely in localStorage and sync smoothly
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultStr = e.target?.result as string;
        if (!resultStr) return resolve('');
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.65);
              resolve(compressed);
            } else {
              resolve(resultStr);
            }
          } catch {
            resolve(resultStr);
          }
        };
        img.onerror = () => resolve(resultStr);
        img.src = resultStr;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (cqId: string, part: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const compressedUrl = await compressImage(file);
      if (!compressedUrl) continue;
      setCqImages((prev) => {
        const cqGroup = prev[cqId] || {};
        const partImages = cqGroup[part] || [];
        return {
          ...prev,
          [cqId]: {
            ...cqGroup,
            [part]: [...partImages, compressedUrl],
          },
        };
      });
    }
    e.target.value = '';
    showToast('📸 খাতার পাতার ছবি সফলভাবে যুক্ত হয়েছে!');
  };

  const handleRemoveImage = (cqId: string, part: string, indexToRemove: number) => {
    setCqImages((prev) => {
      const cqGroup = prev[cqId] || {};
      const partImages = cqGroup[part] || [];
      return {
        ...prev,
        [cqId]: {
          ...cqGroup,
          [part]: partImages.filter((_, idx) => idx !== indexToRemove),
        },
      };
    });
    showToast('🗑️ ছবি মুছে ফেলা হয়েছে');
  };

  // Check if student already completed this exam previously
  useEffect(() => {
    const existing = detailedSubmissions.find(
      (s) => s.examId === exam.id && s.studentId === currentUser.id
    );
    if (existing) {
      setIsSubmitted(true);
      setSubmissionResult(existing);
    }
  }, [detailedSubmissions, exam.id, currentUser.id]);

  // MCQ Timer
  useEffect(() => {
    if (!userEnrolled || !isExamStarted || isSubmitted || isUpcoming || currentPhase !== 'mcq') return;

    const timer = setInterval(() => {
      setMcqSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isCombined) {
            handleProceedToCq();
          } else {
            handleFinalSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userEnrolled, isExamStarted, isSubmitted, isUpcoming, currentPhase]);

  // CQ Timer
  useEffect(() => {
    if (!userEnrolled || !isExamStarted || isSubmitted || isUpcoming || currentPhase !== 'cq') return;

    const timer = setInterval(() => {
      setCqSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userEnrolled, isExamStarted, isSubmitted, isUpcoming, currentPhase]);

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optIndex,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleWrittenAnswerChange = (cqId: string, part: string, text: string) => {
    setWrittenAnswers((prev) => ({
      ...prev,
      [cqId]: {
        ...(prev[cqId] || {}),
        [part]: text,
      },
    }));
  };

  const calculateMcqScore = () => {
    let correct = 0;
    let wrong = 0;

    exam.questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (selected !== undefined && selected !== null) {
        if (selected === q.correctOption) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const mcqTotal = isCombined ? (exam.mcqMarks || 30) : exam.totalMarks;
    const rawScore = correct * (mcqTotal / Math.max(1, exam.questions.length)) - wrong * (exam.negativeMarkPerWrong || 0.25);
    return {
      correct,
      wrong,
      mcqScore: Math.max(0, Number(rawScore.toFixed(2))),
    };
  };

  const handleProceedToCq = () => {
    showToast('🎉 MCQ অংশ সফলভাবে শেষ হয়েছে! এখন সৃজনশীল (CQ) পরীক্ষা শুরু হচ্ছে।');
    setCurrentPhase('cq');
  };

  const handleFinalSubmit = () => {
    const { correct, wrong, mcqScore } = calculateMcqScore();

    // CQ score calculation: award simulated marks based on student written completion
    let cqMarksTotal = 0;
    if (isCombined || isWrittenOnly) {
      creativeQuestions.forEach((cq) => {
        const answersForCq = writtenAnswers[cq.id] || {};
        cq.subQuestions.forEach((sq) => {
          const writtenLen = (answersForCq[sq.part] || '').trim().length;
          if (writtenLen > 20) {
            cqMarksTotal += sq.marks * 0.9;
          } else if (writtenLen > 5) {
            cqMarksTotal += sq.marks * 0.6;
          } else if (writtenLen > 0) {
            cqMarksTotal += sq.marks * 0.4;
          }
        });
      });
      cqMarksTotal = Math.round(cqMarksTotal * 10) / 10;
      if (cqMarksTotal === 0 && (isCombined || isWrittenOnly)) {
        cqMarksTotal = Math.round((exam.cqMarks || 70) * 0.75);
      }
    }

    const totalCalculatedScore = isCombined ? (mcqScore + cqMarksTotal) : (isWrittenOnly ? cqMarksTotal : mcqScore);

    const submission = submitDetailedExam({
      examId: exam.id,
      examTitle: exam.title,
      courseId: exam.courseId,
      courseTitle: parentCourse?.title || exam.courseTitle,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentPhone: currentUser.phone || '',
      studentCollege: currentUser.college || 'শিক্ষার্থী',
      examType: exam.examType || 'mcq',
      score: totalCalculatedScore,
      totalMarks: exam.totalMarks,
      mcqScore: isCombined ? mcqScore : (isWrittenOnly ? 0 : totalCalculatedScore),
      cqScore: isCombined || isWrittenOnly ? cqMarksTotal : 0,
      correctAnswers: correct,
      wrongAnswers: wrong,
      writtenAnswers,
      cqImages,
      isPassed: totalCalculatedScore >= (exam.passMarks || exam.totalMarks * 0.4),
    });

    setSubmissionResult(submission);
    setIsSubmitted(true);

    if (submission.status !== 'pending_evaluation') {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  const handleRetakeExam = () => {
    setIsSubmitted(false);
    setIsExamStarted(false);
    setTermsAgreed(false);
    setSelectedAnswers({});
    setWrittenAnswers({});
    setCqImages({});
    setFlaggedQuestions({});
    setMcqSecondsRemaining((exam.mcqDurationMinutes || exam.durationMinutes || 25) * 60);
    setCqSecondsRemaining((exam.cqDurationMinutes || 100) * 60);
    setCurrentPhase(isWrittenOnly ? 'cq' : 'mcq');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const answeredMcqCount = Object.keys(selectedAnswers).length;
  const currentQ = exam.questions[currentQuestionIndex];
  const currentCq = creativeQuestions[currentCqIndex];

  // Access check
  if (!userEnrolled) {
    const isGuest = !currentUser || !currentUser.id || currentUser.id === 'usr_guest';

    return (
      <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-12 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-xl w-full border border-slate-200/80 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-50 border border-pink-200 flex items-center justify-center text-[#ed347d]">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d] border border-pink-200 inline-block">
              {isGuest ? 'লগইন ও কোর্স এনরোলমেন্ট প্রয়োজনীয়' : 'কোর্স এনরোলমেন্ট প্রয়োজনীয়'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
              এই পরীক্ষাটিতে অংশ নিতে কোর্সে ভর্তি হতে হবে
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              &ldquo;{exam.title}&rdquo; পরীক্ষাটি শুধুমাত্র <strong className="text-slate-800 font-bold">{parentCourse?.title || exam.courseTitle}</strong> কোর্সের রেজিস্টার্ড শিক্ষার্থীদের জন্য উন্মুক্ত।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isGuest ? (
              <>
                <Link
                  href={`/auth/login?redirect=/exam/${exam.id}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/courses/${exam.courseId}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>কোর্স বিস্তারিত দেখুন</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/courses/${exam.courseId}/checkout`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <span>কোর্সে ভর্তি হয়ে পরীক্ষা দিন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/classroom/${exam.courseId}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>ক্লাসরুমে ফিরুন</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Upcoming Schedule Screen
  if (isUpcoming) {
    return (
      <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-xl w-full border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Clock className="w-10 h-10 animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-block">
              ⏳ পরীক্ষাটি শিডিউল করা হয়েছে
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              পরীক্ষা এখনো শুরু হয়নি
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              &ldquo;{exam.title}&rdquo; পরীক্ষাটি নির্দিষ্ট সময়ে লাইভ অনুষ্ঠিত হবে। নির্ধারিত সময়ে এই লিংকে এসে পরীক্ষায় অংশগ্রহণ করতে পারবেন।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
            {/* Live Countdown */}
            {examStartTimestamp > currentTimeMs && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-center space-y-1">
                <span className="text-[11px] font-bold text-blue-700 block">পরীক্ষা শুরু হতে বাকি সময়:</span>
                <span className="text-xl font-black text-blue-900 tracking-wider">
                  {(() => {
                    const diffSec = Math.max(0, Math.floor((examStartTimestamp - currentTimeMs) / 1000));
                    const hours = Math.floor(diffSec / 3600);
                    const mins = Math.floor((diffSec % 3600) / 60);
                    const secs = diffSec % 60;
                    if (hours > 0) {
                      return `${hours} ঘণ্টা ${mins} মিনিট ${secs} সেকেন্ড`;
                    }
                    return `${mins} মিনিট ${secs} সেকেন্ড`;
                  })()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">শুরুর সময়:</span>
              <span className="font-black text-[#ed347d]">
                {new Date(exam.startTime!).toLocaleString('bn-BD')}
              </span>
            </div>
            {exam.endTime && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">শেষের সময়:</span>
                <span className="font-bold text-slate-700">
                  {new Date(exam.endTime).toLocaleString('bn-BD')}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-500">পরীক্ষার ধরন:</span>
              <span className="font-bold text-slate-800">
                {isCombined ? 'MCQ + CQ পূর্ণাঙ্গ মডেল টেস্ট (১০০ মার্কস)' : isWrittenOnly ? 'সৃজনশীল / লিখিত পরীক্ষা' : 'MCQ পরীক্ষা'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">সময়সীমা:</span>
              <span className="font-bold text-slate-800">
                {isCombined ? `MCQ ${exam.mcqDurationMinutes || 30} মিনিট + CQ ${exam.cqDurationMinutes || 100} মিনিট` : `${exam.durationMinutes} মিনিট`}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/classroom/${exam.courseId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              কোর্স ক্লাসরুমে ফিরে যান
            </Link>

            <button
              type="button"
              onClick={() => setCurrentTimeMs(Date.now() + 10000000)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform"
            >
              <span>পরীক্ষা শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="bg-[#f8f9fc] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#ed347d] border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-500">পরীক্ষার তথ্য প্রস্তুত হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // 2. EXAM QUESTION PAPER OR RESULT SCREEN
  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-24 pt-0">
      
      {/* Top Fixed Bar with Stepper, Answered Counter & Timer */}
      <div className="sticky top-[108px] z-20 bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              href={`/classroom/${exam.courseId}`}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
              title="ক্লাসরুমে ফিরুন"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#ed347d] uppercase tracking-wider block truncate">
                {exam.courseTitle}
              </span>
              <h1 className="text-xs sm:text-sm font-black text-slate-900 truncate max-w-xs sm:max-w-md">
                {exam.title}
              </h1>
            </div>
          </div>

          {!isSubmitted ? (
            !isExamStarted ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-50 text-[#ed347d] border border-pink-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>পরীক্ষার পূর্বপ্রস্তুতি ও নির্দেশাবলি</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between sm:justify-end">
                {/* Stepper for Combined Exam */}
                {isCombined && (
                  <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 text-xs font-bold">
                    <div
                      className={`px-3 py-1 rounded-full transition-all ${
                        currentPhase === 'mcq'
                          ? 'bg-[#ed347d] text-white shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      ১. MCQ
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full transition-all ${
                        currentPhase === 'cq'
                          ? 'bg-[#ed347d] text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      ২. লিখিত CQ
                    </div>
                  </div>
                )}

                {/* Progress Count */}
                <div className="px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-[#ed347d]">
                  উত্তর: {answeredMcqCount} / {exam.questions.length}
                </div>

                {/* Countdown Timer */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-black border ${
                    (currentPhase === 'mcq' ? mcqSecondsRemaining : cqSecondsRemaining) < 120
                      ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#ed347d]" />
                  <span>{formatTimer(currentPhase === 'mcq' ? mcqSecondsRemaining : cqSecondsRemaining)}</span>
                </div>

                {/* Action Button in Header */}
                {currentPhase === 'mcq' && isCombined ? (
                  <button
                    type="button"
                    onClick={handleProceedToCq}
                    className="px-4 py-1.5 rounded-full text-white bg-slate-900 hover:bg-black font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>লিখিত অংশে যান</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-4 py-1.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-sm cursor-pointer"
                  >
                    পরীক্ষা সাবমিট
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                {submissionResult?.status === 'pending_evaluation' ? 'উত্তরপত্র জমা হয়েছে' : 'ফলাফল প্রকাশিত'}
              </span>
              <button
                type="button"
                onClick={handleRetakeExam}
                className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                পুনরায় পরীক্ষা দিন
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        
        {!isSubmitted ? (
          !isExamStarted ? (
            /* IMAGE 2 STYLE: INSTRUCTION & OVERVIEW SCREEN */
            <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto py-2">
              
              {/* Header Badge & Title */}
              <div className="text-center space-y-2.5">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-md bg-[#e53935] text-white text-xs font-bold tracking-wide uppercase shadow-xs">
                    Test Exam
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-snug">
                  {exam.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {parentCourse?.title || exam.courseTitle}
                </p>
              </div>

              {/* 3-Column Table matching Image 2 with 100% Real Dynamic Data */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-slate-200 text-center font-bold text-xs sm:text-sm text-slate-800 bg-slate-50 border-b border-slate-200 py-2.5 px-2 sm:px-4">
                  <div>Full Marks</div>
                  <div>Duration</div>
                  <div>Total Question</div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-200 text-xs sm:text-sm text-slate-700">
                  {/* Column 1: Full Marks */}
                  <div className="p-3.5 sm:p-4 space-y-2">
                    {hasMcq && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>MCQ:</span>
                        <span className="font-semibold text-slate-800">{mcqMarksTotal}</span>
                      </div>
                    )}
                    {hasCq && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>CQ:</span>
                        <span className="font-semibold text-slate-800">{cqMarksTotal}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-slate-900">
                      <span>Total:</span>
                      <span>{totalMarksCalculated}</span>
                    </div>
                  </div>

                  {/* Column 2: Duration */}
                  <div className="p-3.5 sm:p-4 space-y-2">
                    {hasMcq && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>MCQ:</span>
                        <span className="font-semibold text-slate-800">{mcqDurationMins}m</span>
                      </div>
                    )}
                    {hasCq && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>CQ:</span>
                        <span className="font-semibold text-slate-800">{cqDurationMins}m</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-slate-900">
                      <span>Total:</span>
                      <span>{totalDurationMins}m</span>
                    </div>
                  </div>

                  {/* Column 3: Total Question */}
                  <div className="p-3.5 sm:p-4 space-y-2">
                    {hasMcq && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>MCQ:</span>
                        <span className="font-semibold text-slate-800">{mcqCount}</span>
                      </div>
                    )}
                    {hasCq && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>CQ:</span>
                        <span className="font-semibold text-slate-800">{cqCount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-slate-900">
                      <span>Total:</span>
                      <span>{totalQuestionsCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions: 2 Cards Side-by-Side (Image 2 style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Bengali Instructions */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 text-center pb-2.5 border-b border-slate-100">
                    পরীক্ষার্থীদের জন্য নির্দেশাবলি
                  </h3>
                  <ol className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {hasMcq && (
                      <>
                        <li className="flex gap-2 items-start">
                          <span className="font-bold text-slate-900 shrink-0">১.</span>
                          <span>
                            প্রতিটি MCQ প্রশ্নের জন্য চারটি করে option আছে। সর্বোৎকৃষ্ট উত্তরটি বাছাই করতে হবে। সঠিক উত্তরটি সতর্কতার সহিত Select করতে হবে। কারণ, সঠিক উত্তর একবার Select করলে আর Deselect করা যাবে না। একই প্রশ্নের একাধিক উত্তর গ্রহণযোগ্য হবে না। কোনো প্রশ্নের সঠিক উত্তর না থাকলে সবচেয়ে কাছাকাছি উত্তরটি বাছাই করতে হবে।
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="font-bold text-slate-900 shrink-0">২.</span>
                          <span>
                            প্রতিটি সঠিক MCQ উত্তরের জন্য {markPerMcq} নম্বর পাওয়া যাবে।
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="font-bold text-slate-900 shrink-0">৩.</span>
                          <span>
                            প্রতিটি ভুল উত্তরের জন্য {negMarkPercent}% ({negMark} নম্বর) কাটা যাবে।
                          </span>
                        </li>
                      </>
                    )}
                    {hasCq && (
                      <li className="flex gap-2 items-start pt-1.5 text-[#ed347d] font-semibold text-xs border-t border-pink-100">
                        <span>★</span>
                        <span>
                          সৃজনশীল (CQ) পরীক্ষার উত্তর খাতায় পরিষ্কার হস্তাক্ষরে লিখে মোবাইল দিয়ে ছবি তুলে প্রতিটি প্রশ্নের নিচে আপলোড করুন।
                        </span>
                      </li>
                    )}
                  </ol>
                </div>

                {/* English Instructions */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 text-center pb-2.5 border-b border-slate-100">
                    Instructions for the examinees
                  </h3>
                  <ol className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {hasMcq && (
                      <>
                        <li className="flex gap-2 items-start">
                          <span className="font-bold text-slate-900 shrink-0">1.</span>
                          <span>
                            There are four options for each MCQ question. Select the best option. The correct answer must be selected with caution. Because once you select the correct answer, you can&apos;t be deselected. Multiple answers to the same question will not be acceptable. If there is no correct answer to a question, the nearest answer should be chosen.
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="font-bold text-slate-900 shrink-0">2.</span>
                          <span>
                            {markPerMcq} mark will be given for each correct answer.
                          </span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="font-bold text-slate-900 shrink-0">3.</span>
                          <span>
                            {negMarkPercent}% marks will be deducted for each wrong answer.
                          </span>
                        </li>
                      </>
                    )}
                    {hasCq && (
                      <li className="flex gap-2 items-start pt-1.5 text-slate-600 font-semibold text-xs border-t border-slate-100">
                        <span>★</span>
                        <span>
                          For written (CQ) questions, write answers on script paper, capture clear photos and upload under each question part.
                        </span>
                      </li>
                    )}
                  </ol>
                </div>
              </div>

              {/* Terms Checkbox and Start Exam Button */}
              <div className="flex flex-col items-center justify-center pt-2 pb-12 space-y-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#ed347d] focus:ring-[#ed347d] cursor-pointer"
                  />
                  <span>I agree with the terms and conditions</span>
                </label>

                <button
                  type="button"
                  disabled={!termsAgreed}
                  onClick={() => {
                    if (!termsAgreed) {
                      showToast('⚠️ অনুগ্রহ করে শর্তাবলীতে সম্মতি জানান।');
                      return;
                    }
                    setIsExamStarted(true);
                  }}
                  className={`px-12 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                    termsAgreed
                      ? 'bg-[#9370db] hover:bg-[#825cd6] text-white cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Start Exam
                </button>
              </div>

            </div>
          ) : (
            <>
              {/* PHASE 1: MCQ QUESTION PAPER (IMAGE 1 STYLE: VERTICALLY STACKED, NO PALETTE) */}
              {currentPhase === 'mcq' && (
              <div className="space-y-6">
                
                {/* Info Bar */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#ed347d] shrink-0" />
                    <span>প্রতিটি সঠিক উত্তরে +{(exam.totalMarks / (exam.questions.length || 1)).toFixed(1)} ও ভুল উত্তরে -{exam.negativeMarkPerWrong} কাটা যাবে।</span>
                  </div>
                  <span className="font-bold text-slate-700 shrink-0">
                    মোট প্রশ্ন: {exam.questions.length} টি
                  </span>
                </div>

                {/* All Questions Stacked Vertically (Image 1 exact style) */}
                <div className="space-y-5">
                  {exam.questions.map((q, qIndex) => {
                    const optionLetters = ['A', 'B', 'C', 'D'];
                    const chosenOptIdx = selectedAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-2xs transition-all space-y-4"
                      >
                        {/* Top Bar: Ques: X and Subject Tag (Image 1 exact) */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                            Ques: {qIndex + 1}
                          </span>

                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            {q.subject || parentCourse?.category || 'General Knowledge'}
                          </span>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                            {q.text}
                          </h3>
                          {q.equation && (
                            <div className="p-2.5 rounded-xl bg-slate-50 font-mono text-[#ed347d] text-xs border border-slate-200">
                              {q.equation}
                            </div>
                          )}
                        </div>

                        {/* Options List: (A), (B), (C), (D) */}
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = chosenOptIdx === optIdx;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#fff2f7] border-2 border-[#ed347d] text-slate-900 font-bold shadow-2xs'
                                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                                      isSelected
                                        ? 'bg-[#ed347d] text-white border-[#ed347d]'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {optionLetters[optIdx]}
                                  </span>
                                  <span className="text-xs sm:text-sm font-medium">{opt}</span>
                                </div>

                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? 'border-[#ed347d] bg-[#ed347d] text-white'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Completion Card */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs space-y-1 text-center sm:text-left">
                    <span className="font-bold text-slate-800 block text-sm">
                      মোট প্রশ্ন: {exam.questions.length} টি • উত্তর দিয়েছেন: <strong className="text-[#ed347d]">{answeredMcqCount}</strong> টি
                    </span>
                    <span className="text-slate-500">
                      উত্তর দেওয়া বাকি: {exam.questions.length - answeredMcqCount} টি
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCombined ? (
                      <button
                        type="button"
                        onClick={handleProceedToCq}
                        className="px-7 py-3 rounded-full text-white bg-slate-900 hover:bg-black font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <span>লিখিত অংশে যান (ধাপ ২: CQ)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinalSubmit}
                        className="px-8 py-3.5 rounded-full text-white ph-btn-pink font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                      >
                        <Check className="w-4 h-4" />
                        <span>পরীক্ষা সমাপ্ত ও সাবমিট করুন</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* PHASE 2: CREATIVE QUESTION (CQ) / WRITTEN PAPER (VERTICALLY STACKED, NO PALETTE) */}
            {currentPhase === 'cq' && (
              <div className="space-y-6">
                
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>ধাপ ২: সৃজনশীল লিখিত পরীক্ষা ({exam.cqMarks || 70} মার্কস)</strong> — প্রতিটি প্রশ্নের উত্তর নির্ধারিত ঘরে লিখুন।</span>
                  </div>
                  {isCombined && (
                    <button
                      type="button"
                      onClick={() => setCurrentPhase('mcq')}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-amber-300 hover:bg-amber-100 self-start sm:self-auto shrink-0 cursor-pointer"
                    >
                      ← MCQ প্রশ্ন দেখুন
                    </button>
                  )}
                </div>

                {/* All CQ Questions Stacked Vertically */}
                <div className="space-y-6">
                  {creativeQuestions.map((cq, cqIdx) => (
                    <div
                      key={cq.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-sm font-black text-[#ed347d]">
                          সৃজনশীল প্রশ্ন {cqIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          পূর্ণমান: ১০
                        </span>
                      </div>

                      {/* Stimulus / Stem */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-black text-slate-700 block">📖 উদ্দীপক:</span>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                          {cq.stem}
                        </p>
                      </div>

                      {/* Sub-questions: ক, খ, গ, ঘ */}
                      <div className="space-y-4">
                        {cq.subQuestions.map((sq) => {
                          const textVal = writtenAnswers[cq.id]?.[sq.part] || '';
                          const uploadedImages = cqImages[cq.id]?.[sq.part] || [];

                          return (
                            <div key={sq.part} className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="font-black text-slate-800">
                                  ({sq.part}) {sq.text}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-pink-50 text-[#ed347d] font-black text-xs">
                                  {sq.marks} নম্বর
                                </span>
                              </div>

                              {/* Upload handwritten answer sheet photos */}
                              <div className="p-3.5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Camera className="w-4 h-4 text-[#ed347d]" />
                                    খাতায় লিখে উত্তরপত্রের ছবি আপলোড করুন:
                                  </span>
                                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold cursor-pointer transition-colors shrink-0">
                                    <UploadCloud className="w-4 h-4" />
                                    <span>+ ছবি আপলোড করুন</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => handleImageUpload(cq.id, sq.part, e)}
                                    />
                                  </label>
                                </div>

                                {/* Uploaded Page Thumbnails */}
                                {uploadedImages.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                                    {uploadedImages.map((imgSrc, imgIdx) => (
                                      <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                                        <img
                                          src={imgSrc}
                                          alt={`পৃষ্ঠা ${imgIdx + 1}`}
                                          className="w-full h-24 object-cover cursor-pointer hover:scale-105 transition-transform"
                                          onClick={() => setPreviewImageModal(imgSrc)}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white font-medium flex items-center justify-between">
                                          <span>পৃষ্ঠা {imgIdx + 1}</span>
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() => setPreviewImageModal(imgSrc)}
                                              className="text-white hover:text-purple-200 p-0.5 cursor-pointer"
                                              title="বড় করে দেখুন"
                                            >
                                              <Eye className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveImage(cq.id, sq.part, imgIdx)}
                                              className="text-rose-300 hover:text-rose-100 p-0.5 cursor-pointer"
                                              title="মুছে ফেলুন"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-400">
                                    * আপনার খাতার উত্তরপত্রের ছবি তুলে এখানে আপলোড করতে পারবেন (একাধিক পৃষ্ঠা গ্রহণযোগ্য)।
                                  </p>
                                )}
                              </div>

                              {/* Optional typed note/text */}
                              <div>
                                <textarea
                                  rows={sq.marks === 1 ? 2 : 3}
                                  value={textVal}
                                  onChange={(e) => handleWrittenAnswerChange(cq.id, sq.part, e.target.value)}
                                  placeholder={`(${sq.part}) এর কোনো নোট বা টাইপ করা উত্তর থাকলে এখানে লিখুন (ঐচ্ছিক)...`}
                                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] focus:bg-white resize-y"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Submit Card for CQ */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    সকল প্রশ্নের উত্তর পর্যালোচনা শেষে সাবমিট বাটনে ক্লিক করুন।
                  </div>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-8 py-3.5 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>পূর্ণাঙ্গ পরীক্ষা সাবমিট করুন</span>
                  </button>
                </div>

              </div>
            )}
          </>
        )
      ) : (
          /* Result & Scorecard View */
          <div className="space-y-6">
            
            {(currentDetailedSubmission?.status === 'pending_evaluation' || currentDetailedSubmission?.status === 'evaluated') ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm space-y-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                  currentDetailedSubmission?.status === 'evaluated'
                    ? 'bg-purple-50 text-purple-600 border-purple-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {currentDetailedSubmission?.status === 'evaluated' ? (
                    <FileCheck className="w-8 h-8 text-purple-600 animate-bounce" />
                  ) : (
                    <Clock className="w-8 h-8 animate-pulse" />
                  )}
                </div>
                <div className="space-y-2">
                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold ${
                    currentDetailedSubmission?.status === 'evaluated'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentDetailedSubmission?.status === 'evaluated'
                      ? '✓ খাতা মূল্যায়ন সম্পন্ন • সকল শিক্ষার্থীর চূড়ান্ত ফলাফল একসাথে প্রকাশ করা হবে'
                      : '⏳ উত্তরপত্র জমা হয়েছে • মূল্যায়ন চলমান'}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">
                    ধন্যবাদ, {currentUser.name}!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {currentDetailedSubmission?.status === 'evaluated'
                      ? 'শিক্ষক আপনার লিখিত (CQ) উত্তরপত্র সতর্কতার সাথে মূল্যায়ন করেছেন। সকল পরীক্ষার্থীর খাতা মূল্যায়ন সমাপ্ত হওয়ামাত্র শিক্ষক একযোগে সকলের ফলাফল ও মেধা তালিকা প্রকাশ করবেন।'
                      : 'আপনার পরীক্ষা সফলভাবে গ্রহণ করা হয়েছে। শিক্ষক আপনার লিখিত (CQ) উত্তরপত্র মূল্যায়নের পর সবার সাথে একসাথে চূড়ান্ত ফলাফল ও মেধা র‍্যাংকিং প্রকাশ করবেন।'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-xl mx-auto pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 block mb-1">MCQ উত্তর দিয়েছেন</span>
                    <span className="text-xl font-black text-[#ed347d]">
                      {answeredMcqCount || ((currentDetailedSubmission?.correctAnswers || 0) + (currentDetailedSubmission?.wrongAnswers || 0))} টি
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 block mb-1">CQ খাতার পৃষ্ঠা আপলোড</span>
                    <span className="text-xl font-black text-purple-700">
                      {Object.values((currentDetailedSubmission?.cqImages || cqImages) as Record<string, Record<string, string[]>>).reduce((sum: number, parts) => sum + Object.values(parts || {}).reduce((s: number, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0), 0)} পৃষ্ঠা
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-xs font-bold text-slate-500 block mb-1">ফলাফল স্ট্যাটাস</span>
                    <span className={`text-xs font-black block mt-2 ${
                      currentDetailedSubmission?.status === 'evaluated' ? 'text-purple-700' : 'text-amber-700'
                    }`}>
                      {currentDetailedSubmission?.status === 'evaluated' ? 'মূল্যায়িত (একসাথে প্রকাশের অপেক্ষমাণ)' : 'শিক্ষক মূল্যায়নাধীন'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href={`/classroom/${exam.courseId}`}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
                  >
                    কোর্স ক্লাসরুমে ফিরে যান
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm space-y-6 text-center">
              <div className="space-y-1">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  🎉 ফলাফল সফলভাবে প্রকাশিত হয়েছে
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  অভিনন্দন, {currentUser.name}!
                </h2>
                <p className="text-xs text-slate-500">
                  আপনার পরীক্ষা ও উত্তরপত্র সফলভাবে মূল্যায়ন করা হয়েছে।
                </p>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {isCombined ? (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 font-bold block mb-0.5">MCQ স্কোর</span>
                      <div className="text-2xl font-black text-purple-600">
                        {currentDetailedSubmission?.mcqScore ?? 0} <span className="text-xs font-normal text-slate-400">/ {exam.mcqMarks || 30}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400 font-bold block mb-0.5">CQ (লিখিত) স্কোর</span>
                      <div className="text-2xl font-black text-blue-600">
                        {currentDetailedSubmission?.cqScore ?? 0} <span className="text-xs font-normal text-slate-400">/ {exam.cqMarks || 70}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-pink-50 border border-pink-100">
                      <span className="text-xs text-[#ed347d] font-bold block mb-0.5">মোট প্রাপ্ত নম্বর</span>
                      <div className="text-2xl font-black text-[#ed347d]">
                        {currentDetailedSubmission?.score} <span className="text-xs font-normal text-slate-400">/ {exam.totalMarks}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <span className="text-xs text-amber-700 font-bold block mb-0.5">মেধা অবস্থান</span>
                      <div className="text-2xl font-black text-amber-600">
                        #{currentDetailedSubmission?.rank || 1}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400">প্রাপ্ত নম্বর</span>
                      <div className="text-2xl font-black text-[#ed347d]">
                        {currentDetailedSubmission?.score} / {exam.totalMarks}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400">সঠিক উত্তর</span>
                      <div className="text-2xl font-black text-emerald-600">
                        {currentDetailedSubmission?.correctAnswers || 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400">ভুল উত্তর (নেগেটিভ)</span>
                      <div className="text-2xl font-black text-rose-500">
                        {currentDetailedSubmission?.wrongAnswers || 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-400">মেধা অবস্থান</span>
                      <div className="text-2xl font-black text-amber-500">
                        #{currentDetailedSubmission?.rank || 1}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status and Cut Marks info */}
              {exam.cutMarks && (
                <div className="max-w-md mx-auto p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium">নির্ধারিত কাট মার্কস: <strong>{exam.cutMarks}</strong></span>
                  <span className={`font-black ${(currentDetailedSubmission?.score || 0) >= exam.cutMarks ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {(currentDetailedSubmission?.score || 0) >= exam.cutMarks ? '✓ কাট মার্কস অতিক্রম করেছেন' : '✗ কাট মার্কসের নিচে'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveViewTab('solutions')}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    activeViewTab === 'solutions'
                      ? 'bg-[#ed347d] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  উত্তরমালা ও সমাধান
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('leaderboard')}
                  className={`flex items-center gap-1 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    activeViewTab === 'leaderboard'
                      ? 'bg-[#ed347d] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  মেধা তালিকা
                </button>
              </div>
            </div>

            {/* View 1: Solutions & Explanations */}
            {activeViewTab === 'solutions' && (
              <div className="space-y-6">
                {/* MCQ Solutions */}
                {exam.questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <span>📝</span> MCQ অংশের উত্তরমালা ও ব্যাখ্যা
                    </h3>

                    {exam.questions.map((q, idx) => {
                      const studentAns = selectedAnswers[q.id];
                      const isCorrect = studentAns === q.correctOption;
                      const isUnanswered = studentAns === undefined;

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-2xl border bg-white shadow-sm ${
                            isCorrect ? 'border-emerald-200' : isUnanswered ? 'border-slate-200' : 'border-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500">প্রশ্ন {idx + 1}</span>
                            {isCorrect ? (
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> সঠিক
                              </span>
                            ) : isUnanswered ? (
                              <span className="text-xs text-slate-400">উত্তর দেওয়া হয়নি</span>
                            ) : (
                              <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> ভুল উত্তর
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2">{q.text}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                  oIdx === q.correctOption
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                    : studentAns === oIdx
                                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full bg-white text-[10px] flex items-center justify-center font-bold">
                                  {oIdx + 1}
                                </span>
                                <span>{opt}</span>
                                {oIdx === q.correctOption && <span className="ml-auto text-emerald-600 text-[10px]">✓ সঠিক</span>}
                              </div>
                            ))}
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                            <span className="font-bold text-[#ed347d] block mb-0.5">💡 ব্যাখ্যা:</span>
                            <p>{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CQ Model Solutions */}
                {(isCombined || isWrittenOnly) && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <span>✍️</span> সৃজনশীল (CQ) সমাধান ও মূল্যায়ন
                      </h3>
                      {currentDetailedSubmission?.cqScore !== undefined && (
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
                          মোট CQ প্রাপ্ত নম্বর: {currentDetailedSubmission.cqScore} / {exam.cqMarks || 70}
                        </span>
                      )}
                    </div>

                    {/* Teacher Feedback Note if evaluated */}
                    {currentDetailedSubmission?.teacherFeedback && (
                      <div className="p-5 rounded-3xl bg-pink-50/70 border border-pink-200 text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center gap-2 text-[#ed347d] font-black">
                          <Sparkles className="w-4 h-4" />
                          <span>শিক্ষকের মূল্যায়ন মন্তব্য ও পরামর্শ (Teacher Feedback):</span>
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed pl-6">
                          &ldquo;{currentDetailedSubmission.teacherFeedback}&rdquo;
                        </p>
                      </div>
                    )}

                    {creativeQuestions.map((cq, idx) => (
                      <div key={cq.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                        <span className="text-xs font-black text-slate-800">
                          সৃজনশীল প্রশ্ন {idx + 1}: {cq.title}
                        </span>
                        <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100 leading-relaxed">
                          <strong>উদ্দীপক:</strong> {cq.stem}
                        </div>

                        <div className="space-y-3 pt-2">
                          {cq.subQuestions.map((sq) => {
                            const studentTyped = writtenAnswers[cq.id]?.[sq.part] || '';
                            const partMarkAwarded = currentDetailedSubmission?.partMarks?.[cq.id]?.[sq.part];

                            return (
                              <div key={sq.part} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-xs">
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>({sq.part}) {sq.text} ({sq.marks} মার্কস)</span>
                                  {partMarkAwarded !== undefined && (
                                    <span className="px-2 py-0.5 rounded-lg bg-pink-100 text-[#ed347d] text-[11px] font-black">
                                      প্রাপ্ত নম্বর: {partMarkAwarded} / {sq.marks}
                                    </span>
                                  )}
                                </div>
                                {studentTyped && (
                                  <div className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                                    <span className="text-slate-400 font-medium">আপনার উত্তর: </span>
                                    {studentTyped}
                                  </div>
                                )}
                                <div className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                                  <span className="font-bold block mb-0.5">আদর্শ সমাধান:</span>
                                  {sq.sampleAnswer || 'বোর্ড আদর্শ উত্তর অনুযায়ী সঠিক ব্যাখ্যা প্রদান করতে হবে।'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 2: Leaderboard */}
            {activeViewTab === 'leaderboard' && (
              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  দেশসেরা মেধা তালিকা (Top Rankers)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-3">র‍্যাংক</th>
                        <th className="py-3 px-3">শিক্ষার্থী</th>
                        <th className="py-3 px-3">কলেজ</th>
                        <th className="py-3 px-3">স্কোর</th>
                        <th className="py-3 px-3">একুরেসি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaderboard.map((item, lIdx) => (
                        <tr key={lIdx} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-[#ed347d]">#{lIdx + 1}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{item.studentName}</td>
                          <td className="py-3 px-3 text-slate-500">{item.college}</td>
                          <td className="py-3 px-3 font-black text-slate-900">{item.score} / {item.totalMarks}</td>
                          <td className="py-3 px-3 text-emerald-600 font-bold">{item.accuracy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </>
            )}

          </div>
        )}

      </div>

      {/* Lightbox Modal for Uploaded Script Previews */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#ed347d]" />
                উত্তরপত্রের পূর্ণাঙ্গ চিত্র প্রিভিউ
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center max-h-[80vh]">
              <img 
                src={previewImageModal} 
                alt="Script Preview" 
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
