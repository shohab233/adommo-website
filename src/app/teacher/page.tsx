'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Course, CourseModule, CreativeQuestion, QuestionBankItem, DetailedExamSubmission } from '@/types';
import AdommoLogo from '@/components/AdommoLogo';
import TeacherKycScreen from '@/components/TeacherKycScreen';
import CourseJsonUploadModal from '@/components/CourseJsonUploadModal';
import { 
  Globe,
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Users, 
  HelpCircle, 
  Radio, 
  Bell, 
  MessageSquare, 
  Settings, 
  PlusCircle, 
  Video, 
  FileText, 
  Award, 
  Eye, 
  EyeOff, 
  UploadCloud, 
  Sparkles, 
  LogIn, 
  KeyRound, 
  Mail, 
  UserCheck, 
  LogOut, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Briefcase, 
  Phone, 
  Check, 
  RotateCcw, 
  School, 
  Lock,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Search,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Send,
  Trash2,
  Edit3,
  Download,
  AlertCircle,
  BarChart3,
  ExternalLink,
  Tag,
  Folder,
  FolderPlus,
  Archive,
  CheckSquare,
  BookMarked,
  Flame,
  Sliders,
  FileCheck,
  ListChecks,
  Trophy,
  Pin,
  Filter,
  AlertTriangle,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { 
    courses, 
    addCourse, 
    updateCourse,
    deleteCourse,
    addLectureToCourse, 
    updateLecture,
    deleteLecture,
    addResourceSheet, 
    deleteResourceSheet,
    addExam, 
    updateExam,
    deleteExam,
    exams,
    questionBanks,
    addQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
    detailedSubmissions,
    evaluateSubmission,
    publishBatchResults,
    liveClasses,
    scheduleLiveClass,
    updateLiveClass,
    deleteLiveClass,
    startLiveClass,
    endLiveClass,
    enrollments,
    approveEnrollment,
    resetToDefaultData,
    showToast,
    currentRole,
    setRole,
    currentUser,
    loginUser,
    logoutUser,
    notifications,
    sendNotification,
    deleteNotification,
    togglePinNotification,
    conversations,
    unreadTeacherMsgCount,
    sendChatMessage,
    markThreadAsRead,
    toggleDoubtStatus,
    getOrCreateBatchGroup,
    teacherKycList,
    loginWithApi,
    registerWithApi,
  } = useApp();
  
  // ==================== TEACHER AUTH STATES ====================
  const [teacherAuthTab, setTeacherAuthTab] = useState<'login' | 'register'>('login');
  
  // Teacher Login States
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);

  // Teacher Multi-Step Registration States (4 Steps)
  const [teacherRegStep, setTeacherRegStep] = useState<number>(1);
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherRegEmail, setTeacherRegEmail] = useState('');
  
  // Step 2: Academic & Expertise
  const [teacherSubject, setTeacherSubject] = useState('পদার্থবিজ্ঞান (Physics)');
  const [teacherInstitution, setTeacherInstitution] = useState('');
  const [teacherExperience, setTeacherExperience] = useState('৩-৫ বছর');

  // Step 3: Email OTP Verification (Real 6-Digit Gmail OTP)
  const [teacherOtpDigits, setTeacherOtpDigits] = useState(['', '', '', '', '', '']);
  const [teacherOtpVerified, setTeacherOtpVerified] = useState(false);
  const [teacherResendTimer, setTeacherResendTimer] = useState(45);

  // Step 4: Security
  const [teacherRegPassword, setTeacherRegPassword] = useState('');
  const [teacherConfirmPassword, setTeacherConfirmPassword] = useState('');
  const [showTeacherRegPassword, setShowTeacherRegPassword] = useState(false);
  const [teacherAgreeTerms, setTeacherAgreeTerms] = useState(true);

  // Countdown timer for teacher OTP resend
  useEffect(() => {
    if (teacherRegStep === 3 && teacherResendTimer > 0) {
      const timer = setInterval(() => setTeacherResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [teacherRegStep, teacherResendTimer]);

  const handleTeacherOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      // User pasted multiple characters (e.g. 6-digit OTP)
      const updated = [...teacherOtpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) updated[i] = cleaned[i];
      }
      setTeacherOtpDigits(updated);
      const nextIdx = Math.min(cleaned.length, 5);
      const nextEl = document.getElementById(`teacher-otp-input-${nextIdx}`);
      if (nextEl) nextEl.focus();
      return;
    }

    const singleChar = cleaned.slice(-1);
    const updated = [...teacherOtpDigits];
    updated[index] = singleChar;
    setTeacherOtpDigits(updated);

    if (singleChar && index < 5) {
      const nextInput = document.getElementById(`teacher-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleTeacherOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !teacherOtpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`teacher-otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };


  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail.trim()) {
      showToast('দয়া করে আপনার শিক্ষক ইমেইল অথবা মোবাইল নম্বর লিখুন');
      return;
    }
    if (!teacherPassword.trim()) {
      showToast('দয়া করে আপনার পাসওয়ার্ড লিখুন');
      return;
    }

    setTeacherLoading(true);
    const result = await loginWithApi({
      identifier: teacherEmail.trim(),
      password: teacherPassword.trim(),
      role: 'teacher',
    });
    setTeacherLoading(false);

    if (result.success) {
      setRole('teacher');
      showToast('👨‍🏫 শিক্ষক প্যানেলে সফলভাবে প্রবেশ করেছেন!');
    }
  };

  const handleTeacherStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      showToast('দয়া করে আপনার পূর্ণ নাম ও পদবী লিখুন');
      return;
    }
    if (!teacherPhone.trim() || teacherPhone.trim().length < 11) {
      showToast('দয়া করে সচল ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (!teacherRegEmail.trim() || !teacherRegEmail.includes('@')) {
      showToast('দয়া করে সঠিক ইমেইল এড্রেস লিখুন (OTP কোড পাঠানো হবে)');
      return;
    }
    setTeacherRegStep(2);
  };

  const handleTeacherStep2Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherInstitution.trim()) {
      showToast('দয়া করে আপনার শিক্ষাপ্রতিষ্ঠান বা বিশ্ববিদ্যালয়ের নাম লিখুন');
      return;
    }
    setTeacherRegStep(3);
    setTeacherResendTimer(45);
    showToast(`📩 ${teacherRegEmail} এ শিক্ষক ওটিপি কোড পাঠানো হচ্ছে...`);

    // Live API Call to send real Gmail OTP
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherRegEmail.trim(), purpose: 'registration' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`📩 ${teacherRegEmail} এ শিক্ষক ওটিপি কোড সফলভাবে পাঠানো হয়েছে!`);
      }
    } catch {}
  };

  // Real Teacher Resend OTP
  const handleTeacherResendOtp = async () => {
    if (teacherResendTimer > 0) return;
    setTeacherResendTimer(45);
    showToast(`📩 ${teacherRegEmail} এ পুনরায় শিক্ষক ওটিপি পাঠানো হচ্ছে...`);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherRegEmail.trim(), purpose: 'registration' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`📩 নতুন ওটিপি সফলভাবে ${teacherRegEmail} এ পাঠানো হয়েছে!`);
      } else {
        showToast(data.error || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
      }
    } catch {
      showToast('সার্ভার এরর, পুনরায় চেষ্টা করুন।');
    }
  };

  const handleTeacherStep3Verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = teacherOtpDigits.join('');
    if (enteredCode.length < 6) {
      showToast('দয়া করে ৬ ডিজিটের সম্পূর্ণ ওটিপি কোডটি লিখুন');
      return;
    }

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: teacherRegEmail.trim(),
          otp: enteredCode,
          purpose: 'registration'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTeacherOtpVerified(true);
        showToast('✅ শিক্ষক ইমেইল ওটিপি যাচাই সম্পন্ন হয়েছে!');
        setTimeout(() => {
          setTeacherRegStep(4);
        }, 250);
      } else {
        showToast(data.error || 'ভুল ওটিপি কোড। পুনরায় চেষ্টা করুন।');
      }
    } catch {
      showToast('সার্ভারের সাথে সংযোগে ত্রুটি দেখা দিয়েছে।');
    }
  };

  const handleTeacherStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherRegPassword.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    if (teacherRegPassword !== teacherConfirmPassword) {
      showToast('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }
    if (!teacherAgreeTerms) {
      showToast('শিক্ষক নীতিমালা ও শর্তাবলীতে সম্মতি প্রদান করুন');
      return;
    }

    setTeacherLoading(true);
    const result = await registerWithApi({
      name: teacherName.trim(),
      phone: teacherPhone.trim(),
      email: teacherRegEmail.trim(),
      password: teacherRegPassword.trim(),
      role: 'teacher',
      college: `${teacherSubject} • ${teacherInstitution.trim()}`,
    });
    setTeacherLoading(false);

    if (result.success) {
      setRole('teacher');
      showToast(`🎉 শিক্ষক অ্যাকাউন্ট রেজিস্ট্রেশন সফল! এবার KYC ভেরিফিকেশন তথ্য প্রদান করুন।`);
    }
  };

  const handleTeacherLogout = () => {
    logoutUser();
    setRole('student');
    showToast('👋 শিক্ষক প্যানেল থেকে লগআউট সম্পন্ন হয়েছে।');
  };

  const teacherStepsMeta = [
    { num: 1, title: 'ব্যক্তিগত', icon: User },
    { num: 2, title: 'একাডেমিক', icon: School },
    { num: 3, title: 'ইমেইল OTP', icon: ShieldCheck },
    { num: 4, title: 'পাসওয়ার্ড', icon: KeyRound },
  ];

  // ==================== SIDEBAR & SUBMENU ROUTING ====================
  // Active Navigation: activeMenu + activeSubMenu
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('dashboard_main');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    dashboard: true,
    courses: true,
    content: true,
    exams: true,
    students: false,
    live_class: false,
    notifications: false,
    messages: false,
    settings: false,
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // ==================== TEACHER-SPECIFIC DATA FILTERING ====================
  // Strictly isolate and return ONLY the logged-in teacher's own courses
  const teacherCourses = useMemo(() => {
    if (!currentUser?.id || (currentUser.role !== 'teacher' && currentRole !== 'teacher')) {
      return [];
    }

    const currentId = currentUser.id.trim();
    const currentNameClean = (currentUser.name || '').trim().toLowerCase();
    const currentEmailClean = (currentUser.email || '').trim().toLowerCase();
    const currentPhoneClean = (currentUser.phone || '').trim();

    return courses.filter((c) => {
      // 1. Direct Teacher ID match (highest priority)
      if (c.instructorId && c.instructorId === currentId) return true;
      // 2. Direct Teacher Email match
      if (currentEmailClean && c.teacherEmail && c.teacherEmail.trim().toLowerCase() === currentEmailClean) return true;
      // 3. Direct Teacher Phone match
      if (currentPhoneClean && c.teacherPhone && c.teacherPhone.trim() === currentPhoneClean) return true;
      // 4. Exact/Close Instructor Name or Mentor Name match
      if (currentNameClean) {
        const instName = (c.instructor?.name || '').trim().toLowerCase();
        if (instName && (instName === currentNameClean || instName.includes(currentNameClean) || currentNameClean.includes(instName))) {
          return true;
        }
        if (c.mentors?.some((m) => {
          const mName = (m.name || '').trim().toLowerCase();
          return mName === currentNameClean || mName.includes(currentNameClean) || currentNameClean.includes(mName);
        })) {
          return true;
        }
      }
      // 5. Fallback: if course has no instructor assigned yet or was imported, let the active teacher manage it
      if (!c.instructorId || !c.teacherEmail) {
        return true;
      }
      return false;
    });
  }, [courses, currentUser, currentRole]);

  const teacherCourseIds = useMemo(() => teacherCourses.map(c => c.id), [teacherCourses]);

  // Teacher Enrollments (strictly for this teacher's courses)
  const teacherEnrollments = useMemo(() => {
    if (teacherCourseIds.length === 0) return [];
    return enrollments.filter(e => teacherCourseIds.includes(e.courseId));
  }, [enrollments, teacherCourseIds]);

  // Teacher Total Sales
  const teacherTotalSales = useMemo(() => {
    return teacherEnrollments
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [teacherEnrollments]);

  // Today's Date helpers (dynamically updates per day)
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormattedBengali = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('bn-BD', {
        dateStyle: 'full'
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('bn-BD');
    }
  }, []);

  // Today's enrollments list (strictly filtered by today's date or 'আজ' / 'এইমাত্র')
  const todayEnrollments = useMemo(() => {
    return teacherEnrollments.filter(e => {
      if (e.enrollmentDate && e.enrollmentDate === todayDateStr) return true;
      if (e.createdAt && (e.createdAt.includes('আজ') || e.createdAt.includes('এইমাত্র'))) return true;
      return false;
    });
  }, [teacherEnrollments, todayDateStr]);

  const todayEnrollmentsCount = todayEnrollments.length;

  const todayTotalSales = useMemo(() => {
    return todayEnrollments
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [todayEnrollments]);

  // Teacher Exams
  const teacherExams = useMemo(() => {
    if (teacherCourseIds.length === 0) return [];
    return exams.filter(e => teacherCourseIds.includes(e.courseId));
  }, [exams, teacherCourseIds]);

  // Search filter states for student tables
  const [studentSearch, setStudentSearch] = useState('');
  const [todaySearch, setTodaySearch] = useState('');

  const filteredTeacherEnrollments = useMemo(() => {
    if (!studentSearch.trim()) return teacherEnrollments;
    const q = studentSearch.toLowerCase().trim();
    return teacherEnrollments.filter(e => 
      e.studentName.toLowerCase().includes(q) ||
      (e.senderPhone && e.senderPhone.includes(q)) ||
      e.courseTitle.toLowerCase().includes(q) ||
      (e.trxId && e.trxId.toLowerCase().includes(q))
    );
  }, [teacherEnrollments, studentSearch]);

  const filteredTodayEnrollments = useMemo(() => {
    if (!todaySearch.trim()) return todayEnrollments;
    const q = todaySearch.toLowerCase().trim();
    return todayEnrollments.filter(e => 
      e.studentName.toLowerCase().includes(q) ||
      (e.senderPhone && e.senderPhone.includes(q)) ||
      e.courseTitle.toLowerCase().includes(q) ||
      (e.trxId && e.trxId.toLowerCase().includes(q))
    );
  }, [todayEnrollments, todaySearch]);

  // ==================== FORM STATES FOR ALL 10 MODULES ====================
  // 1. Multi-Step Course Creation Wizard State (7 Steps)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Step 1: Basic & Card Information
  const [wTitle, setWTitle] = useState('');
  const [wCategory, setWCategory] = useState<'Engineering' | 'Medical' | 'Agri Admission' | 'HSC' | 'Free Tests'>('Engineering');
  const [wBatch, setWBatch] = useState('Campus 7.0 Batch');
  const [wLevel, setWLevel] = useState('এইচএসসি ও ভর্তি প্রস্তুতি ২০২৬');
  const [wBadge, setWBadge] = useState('নতুন সেশন ২০২৬');
  const [wCoverImage, setWCoverImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80');
  const [wTagline, setWTagline] = useState('সহজ ও কার্যকরী উপায়ে বিষয় আয়ত্ত করুন এবং ভর্তি পরীক্ষায় সেরা ফলাফল নিশ্চিত করুন।');

  // Step 2: Pricing, Discount & Admission Timer
  const [wRegularPrice, setWRegularPrice] = useState<number>(3550);
  const [wOfferPrice, setWOfferPrice] = useState<number>(2750);
  const [wCouponCode, setWCouponCode] = useState('ADOMMO200');
  const [wCouponDiscount, setWCouponDiscount] = useState<number>(200);
  const [wCountdownDays, setWCountdownDays] = useState<number>(4);
  const [wCountdownHours, setWCountdownHours] = useState<number>(14);

  // Step 3: Highlights, Class Numbers & Routine
  const [wTotalLectures, setWTotalLectures] = useState<number>(75);
  const [wTotalExams, setWTotalExams] = useState<number>(30);
  const [wTotalSheets, setWTotalSheets] = useState<number>(50);
  const [wFeatures, setWFeatures] = useState<string[]>([
    'শেষ ভর্তি পরীক্ষা পর্যন্ত পূর্ণাঙ্গ সাপোর্ট (GST / Agri / DU)',
    'Physics, Math, Chemistry, Biology লাইভ ও রেকর্ডেড ক্লাস',
    'ভার্সিটি ভিত্তিক বিশেষ মডেল টেস্ট ও ওএমআর এক্সাম',
    'স্পেশাল মেন্টরশিপ ও নিয়মিত গাইডলাইন সেশন',
    'স্ট্যান্ডার্ড প্রশ্নে এক্সাম ও রিয়েল-টাইম মেধা তালিকা',
    'গোছানো ক্লাস স্লাইড ও প্রিন্ট উপযোগী লেকচার শিট PDF',
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [wRoutineTitle, setWRoutineTitle] = useState('অদম্য ক্লাস ও এক্সাম রুটিন (PDF)');
  const [wRoutinePdfUrl, setWRoutinePdfUrl] = useState('#');

  // Step 4: Media, Trailer & Guidelines
  const [wTrailerUrl, setWTrailerUrl] = useState('');
  const [wDemoClassUrl, setWDemoClassUrl] = useState('');
  const [wRelatedVideos, setWRelatedVideos] = useState<any[]>([]);
  const [newRvTitle, setNewRvTitle] = useState('');
  const [newRvDuration, setNewRvDuration] = useState('৩০ মিনিট');
  const [newRvTag, setNewRvTag] = useState('কোর্স গাইডলাইন');

  // Step 5: Mentors & Faculty Team
  const [wMentors, setWMentors] = useState<any[]>([
    {
      name: currentUser.name || 'সুমন হোসেন',
      role: 'ফিজিক্স ও ম্যাথ লিড মেন্টর',
      institution: currentUser.college || 'বুয়েট (BUET)',
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  ]);
  const [newMentorName, setNewMentorName] = useState('');
  const [newMentorRole, setNewMentorRole] = useState('রসায়ন বিভাগীয় প্রধান');
  const [newMentorInst, setNewMentorInst] = useState('ঢাকা বিশ্ববিদ্যালয় (DU)');
  const [newMentorAvatar, setNewMentorAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80');

  // Step 6: Description, Syllabus Modules, FAQ & Combos
  const [wDescription, setWDescription] = useState('এই কোর্সে উচ্চ মাধ্যমিক ও সকল পাবলিক বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য সম্পূর্ণ সিলেবাসের পুঙ্খানুপুঙ্খ ব্যাখ্যা, প্রবলেম সলভিং ও মানসম্মত মডেল টেস্ট প্রদান করা হবে।');
  const [wSyllabusModules, setWSyllabusModules] = useState<string[]>([]);
  const [newModuleInput, setNewModuleInput] = useState('');
  const [wFaq, setWFaq] = useState<any[]>([
    { question: 'আমি কি স্মার্টফোনে ক্লাস ও পরীক্ষা দিতে পারব?', answer: 'হ্যাঁ, যেকোনো স্মার্টফোন, ট্যাব বা কম্পিউটারে হাই-স্পিড প্লেয়ারে লাইভ/রেকর্ডেড ক্লাস দেখা ও ওএমআর এক্সাম দেওয়া যাবে।' },
    { question: 'লাইভ ক্লাস মিস হলে কি রেকর্ডেড ক্লাস পাব?', answer: 'হ্যাঁ, ভর্তি পরীক্ষা শেষ না হওয়া পর্যন্ত প্রতিটি ক্লাসের ফুল এইচডি রেকর্ডিং স্টুডেন্ট ক্লাসরুমে আনলিমিটেড ভিউ সুবিধা সহ সংরক্ষিত থাকবে।' },
  ]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [wComboIds, setWComboIds] = useState<string[]>([]);
  const [courseStatusFilter, setCourseStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  // 2. Course Content States (Sections, Chapters, Modules, Archive, Lectures, Sheets)
  const [selectedCourseForSection, setSelectedCourseForSection] = useState<string | null>(null);
  const [curriculumMode, setCurriculumMode] = useState<'academic' | 'skill' | 'language'>('academic');
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<'subject' | 'module' | 'archive' | 'custom'>('subject');
  const [newSectionIsArchive, setNewSectionIsArchive] = useState(false);
  const [targetArchiveIdForSubject, setTargetArchiveIdForSubject] = useState<string>('');
  const [targetSectionIdForChapter, setTargetSectionIdForChapter] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterUnitType, setNewChapterUnitType] = useState<'chapter' | 'topic' | 'lesson' | 'project'>('chapter');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [showCourseUploadModal, setShowCourseUploadModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  const [selectedCourseForLec, setSelectedCourseForLec] = useState(teacherCourses[0]?.id || '');
  const [targetModuleForLec, setTargetModuleForLec] = useState('');
  const [lecCategoryFilter, setLecCategoryFilter] = useState<'regular' | 'archive'>('regular');
  const [lecSubjectFilter, setLecSubjectFilter] = useState<string>('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDuration, setLectureDuration] = useState('1h 30m');
  const [lectureVideoUrl, setLectureVideoUrl] = useState('');
  const [isFreeTrial, setIsFreeTrial] = useState(false);

  const [selectedCourseForSheet, setSelectedCourseForSheet] = useState(teacherCourses[0]?.id || '');
  const [targetModuleForSheet, setTargetModuleForSheet] = useState('');
  const [sheetCategoryFilter, setSheetCategoryFilter] = useState<'regular' | 'archive'>('regular');
  const [sheetSubjectFilter, setSheetSubjectFilter] = useState<string>('');
  const [targetLectureForSheet, setTargetLectureForSheet] = useState('');
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetType, setSheetType] = useState<'lecture_sheet' | 'practice_sheet' | 'handnote'>('lecture_sheet');
  const [sheetPages, setSheetPages] = useState(24);
  const [sheetSize, setSheetSize] = useState('4.5 MB');
  const [sheetUploadMethod, setSheetUploadMethod] = useState<'link' | 'file'>('link');
  const [sheetLink, setSheetLink] = useState('');
  const [sheetFileName, setSheetFileName] = useState('');
  const [expandedLectureChapters, setExpandedLectureChapters] = useState<Record<string, boolean>>({});
  const [expandedSheetChapters, setExpandedSheetChapters] = useState<Record<string, boolean>>({});
  const [expandedPreviewSections, setExpandedPreviewSections] = useState<Record<string, boolean>>({});
  const [expandedPreviewSheetSections, setExpandedPreviewSheetSections] = useState<Record<string, boolean>>({});

  // 3. Exam Builder States
  const [examTitle, setExamTitle] = useState('');
  const [examCourseId, setExamCourseId] = useState(teacherCourses[0]?.id || '');
  const [examType, setExamType] = useState<'combined' | 'mcq' | 'written'>('combined');
  const [examDuration, setExamDuration] = useState(130);
  const [examMcqDuration, setExamMcqDuration] = useState(30);
  const [examCqDuration, setExamCqDuration] = useState(100);
  const [examTotalMarks, setExamTotalMarks] = useState(100);
  const [examMcqMarks, setExamMcqMarks] = useState(30);
  const [examCqMarks, setExamCqMarks] = useState(70);
  const [examPassMarks, setExamPassMarks] = useState(40);
  const [examCutMarks, setExamCutMarks] = useState(65);
  const [examNegativeMark, setExamNegativeMark] = useState(0.25);
  const [examStartTime, setExamStartTime] = useState('');
  const [examEndTime, setExamEndTime] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [builtQuestions, setBuiltQuestions] = useState<any[]>([]);

  // Creative Questions (CQ) Builder
  const [cqStem, setCqStem] = useState('');
  const [cqSubKa, setCqSubKa] = useState('');
  const [cqSubKha, setCqSubKha] = useState('');
  const [cqSubGa, setCqSubGa] = useState('');
  const [cqSubGha, setCqSubGha] = useState('');
  const [cqAnsKa, setCqAnsKa] = useState('');
  const [cqAnsKha, setCqAnsKha] = useState('');
  const [cqAnsGa, setCqAnsGa] = useState('');
  const [cqAnsGha, setCqAnsGha] = useState('');
  const [builtCreativeQuestions, setBuiltCreativeQuestions] = useState<CreativeQuestion[]>([]);

  // CQ Result Publication & Evaluation States
  const [examResultPublishType, setExamResultPublishType] = useState<'instant' | 'later'>('instant');
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<DetailedExamSubmission | null>(null);
  const [evalPartMarks, setEvalPartMarks] = useState<Record<string, Record<string, number>>>({});
  const [evalTeacherFeedback, setEvalTeacherFeedback] = useState<string>('');
  const [evalLightboxImage, setEvalLightboxImage] = useState<string | null>(null);
  const [evaluationTab, setEvaluationTab] = useState<'all' | 'pending' | 'evaluated'>('pending');

  // Question Bank States
  const [qbCourseId, setQbCourseId] = useState(teacherCourses[0]?.id || '');
  const [qbTitle, setQbTitle] = useState('');
  const [qbSubject, setQbSubject] = useState('পদার্থবিজ্ঞান (Physics)');
  const [qbChapter, setQbChapter] = useState('');
  const [qbYear, setQbYear] = useState('2004-2024');
  const [qbType, setQbType] = useState<'varsity' | 'engineering' | 'medical' | 'board'>('varsity');
  const [qbPages, setQbPages] = useState(64);
  const [qbFileSize, setQbFileSize] = useState('14.5 MB');
  const [qbPdfUrl, setQbPdfUrl] = useState('');
  const [qbFilterType, setQbFilterType] = useState<string>('all');
  const [qbSearch, setQbSearch] = useState<string>('');
  const [editingQbId, setEditingQbId] = useState<string | null>(null);

  // Results & Settings Filters
  const [resultsFilterExamId, setResultsFilterExamId] = useState<string>('');
  const [settingsExamId, setSettingsExamId] = useState<string>('');
  const [settingsStartTime, setSettingsStartTime] = useState<string>('');
  const [settingsEndTime, setSettingsEndTime] = useState<string>('');
  const [settingsDuration, setSettingsDuration] = useState<number>(30);
  const [settingsTotalMarks, setSettingsTotalMarks] = useState<number>(100);
  const [settingsPassMarks, setSettingsPassMarks] = useState<number>(40);
  const [settingsCutMarks, setSettingsCutMarks] = useState<number>(65);
  const [settingsNegMark, setSettingsNegMark] = useState<number>(0.25);

  // Helper to categorize course sections and modules into Regular and Archive subjects
  const getCategorizedCourseData = (course?: Course) => {
    if (!course) {
      return {
        regularSubjects: [] as Array<{ id: string; title: string; badge?: string; modules: CourseModule[] }>,
        archiveSubjects: [] as Array<{ id: string; title: string; badge?: string; modules: CourseModule[] }>,
        hasArchive: false,
      };
    }

    const sections = course.sections || [];
    const modules = course.modules || [];
    const matchedModIds = new Set<string>();

    // 1. Regular Live Syllabus Subjects
    const regularSections = sections.filter((s) => !s.isArchive && s.type !== 'archive' && !s.parentArchiveId);
    const regularSubjects: Array<{ id: string; title: string; badge?: string; modules: CourseModule[] }> = [];

    regularSections.forEach((sec) => {
      const secMods = modules.filter(
        (m) => m.parentSectionId === sec.id || (!m.parentSectionId && m.parentSectionTitle === sec.title)
      );
      secMods.forEach((m) => matchedModIds.add(m.id));
      regularSubjects.push({
        id: sec.id,
        title: sec.title,
        badge: 'লাইভ সিলেবাস',
        modules: secMods,
      });
    });

    // 2. Archive Subjects
    const archiveSections = sections.filter((s) => (s.isArchive || s.type === 'archive') && !s.parentArchiveId);
    const archiveSubjects: Array<{ id: string; title: string; badge?: string; modules: CourseModule[] }> = [];

    archiveSections.forEach((arc) => {
      const arcSubs = sections.filter((s) => s.parentArchiveId === arc.id);
      const directArcMods = modules.filter(
        (m) => (m.parentSectionId === arc.id || m.parentArchiveId === arc.id) && !arcSubs.some((s) => s.id === m.parentSectionId)
      );

      arcSubs.forEach((sub) => {
        const subMods = modules.filter(
          (m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title)
        );
        subMods.forEach((m) => matchedModIds.add(m.id));
        archiveSubjects.push({
          id: sub.id,
          title: `${arc.title} ➔ ${sub.title}`,
          badge: 'আর্কাইভ বিষয়',
          modules: subMods,
        });
      });

      if (directArcMods.length > 0) {
        directArcMods.forEach((m) => matchedModIds.add(m.id));
        archiveSubjects.push({
          id: arc.id,
          title: `${arc.title} (সরাসরি অধ্যায়সমূহ)`,
          badge: 'আর্কাইভ',
          modules: directArcMods,
        });
      }
    });

    // 3. Unassigned / Remaining Modules
    const remainingMods = modules.filter((m) => !matchedModIds.has(m.id));
    if (remainingMods.length > 0) {
      const remainingArchive = remainingMods.filter((m) => m.isArchive || m.parentArchiveId);
      const remainingRegular = remainingMods.filter((m) => !m.isArchive && !m.parentArchiveId);

      if (remainingRegular.length > 0) {
        regularSubjects.push({
          id: 'unassigned_regular',
          title: regularSubjects.length === 0 ? 'মূল কোর্স / সাধারণ বিষয়' : 'অন্যান্য সাধারণ অধ্যায়',
          badge: 'সাধারণ',
          modules: remainingRegular,
        });
      }

      if (remainingArchive.length > 0) {
        archiveSubjects.push({
          id: 'unassigned_archive',
          title: 'অন্যান্য আর্কাইভ অধ্যায়',
          badge: 'আর্কাইভ',
          modules: remainingArchive,
        });
      }
    }

    // 4. Fallback if no sections exist at all
    if (regularSubjects.length === 0 && archiveSubjects.length === 0 && modules.length > 0) {
      const arcMods = modules.filter((m) => m.isArchive);
      const regMods = modules.filter((m) => !m.isArchive);
      if (regMods.length > 0) {
        regularSubjects.push({
          id: 'default_regular',
          title: 'সাধারণ সিলেবাস',
          modules: regMods,
        });
      }
      if (arcMods.length > 0) {
        archiveSubjects.push({
          id: 'default_archive',
          title: 'আর্কাইভ অধ্যায়সমূহ',
          modules: arcMods,
        });
      }
    }

    return {
      regularSubjects,
      archiveSubjects,
      hasArchive: archiveSubjects.length > 0,
    };
  };

  // Unified helper to select and sync course across Sections, Lectures, and Sheets
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseForSection(courseId);
    setSelectedCourseForLec(courseId);
    setSelectedCourseForSheet(courseId);
    try {
      localStorage.setItem('adommo_active_teacher_course', courseId);
    } catch {}
    const targetCourse = courses.find((c) => c.id === courseId);
    const filterData = getCategorizedCourseData(targetCourse);

    // Auto sync Video filters
    const defaultLecCat = filterData.regularSubjects.length > 0 ? 'regular' : 'archive';
    const activeLecSubs = defaultLecCat === 'regular' ? filterData.regularSubjects : filterData.archiveSubjects;
    setLecCategoryFilter(defaultLecCat);
    setLecSubjectFilter(activeLecSubs[0]?.id || '');
    const firstMod = activeLecSubs[0]?.modules[0]?.id || targetCourse?.modules?.[0]?.id || '';
    setTargetModuleForLec(firstMod);

    // Auto sync Sheet filters
    const defaultSheetCat = filterData.regularSubjects.length > 0 ? 'regular' : 'archive';
    const activeSheetSubs = defaultSheetCat === 'regular' ? filterData.regularSubjects : filterData.archiveSubjects;
    setSheetCategoryFilter(defaultSheetCat);
    setSheetSubjectFilter(activeSheetSubs[0]?.id || '');
    setTargetModuleForSheet(firstMod);
    const firstLec = targetCourse?.modules?.find((m) => m.id === firstMod)?.lectures?.[0]?.id || '';
    setTargetLectureForSheet(firstLec);
  };

  // Auto-sync selected courses if invalid or empty, restoring last active course from localStorage
  useEffect(() => {
    if (courses.length === 0) return;
    try {
      const savedCourseId = typeof window !== 'undefined' ? localStorage.getItem('adommo_active_teacher_course') : null;
      const validCourseId =
        savedCourseId && courses.some((c) => c.id === savedCourseId)
          ? savedCourseId
          : teacherCourses[0]?.id || courses[0]?.id || '';

      if (validCourseId) {
        if (!selectedCourseForSection || !courses.some((c) => c.id === selectedCourseForSection)) {
          setSelectedCourseForSection(validCourseId);
        }
        if (!selectedCourseForLec || !courses.some((c) => c.id === selectedCourseForLec) || (savedCourseId && selectedCourseForLec !== savedCourseId)) {
          setSelectedCourseForLec(validCourseId);
        }
        if (!selectedCourseForSheet || !courses.some((c) => c.id === selectedCourseForSheet) || (savedCourseId && selectedCourseForSheet !== savedCourseId)) {
          setSelectedCourseForSheet(validCourseId);
        }
        if (!examCourseId || !courses.some((c) => c.id === examCourseId)) {
          setExamCourseId(validCourseId);
        }

        const activeCourse = courses.find((c) => c.id === validCourseId);
        if (activeCourse?.modules && activeCourse.modules.length > 0) {
          const filterData = getCategorizedCourseData(activeCourse);
          const firstModId = activeCourse.modules[0].id;

          if (!targetModuleForLec || !activeCourse.modules.some((m) => m.id === targetModuleForLec)) {
            setTargetModuleForLec(firstModId);
          }
          if (!targetModuleForSheet || !activeCourse.modules.some((m) => m.id === targetModuleForSheet)) {
            setTargetModuleForSheet(firstModId);
            const firstLecId = activeCourse.modules[0].lectures?.[0]?.id || '';
            setTargetLectureForSheet(firstLecId);
          }

          // Ensure Video filter matches current module
          const currentLecModId = targetModuleForLec || firstModId;
          const inRegLec = filterData.regularSubjects.find((s) => s.modules.some((m) => m.id === currentLecModId));
          const inArcLec = filterData.archiveSubjects.find((s) => s.modules.some((m) => m.id === currentLecModId));
          if (!lecSubjectFilter) {
            if (inRegLec) {
              setLecCategoryFilter('regular');
              setLecSubjectFilter(inRegLec.id);
            } else if (inArcLec) {
              setLecCategoryFilter('archive');
              setLecSubjectFilter(inArcLec.id);
            } else {
              setLecCategoryFilter(filterData.regularSubjects.length > 0 ? 'regular' : 'archive');
              setLecSubjectFilter(filterData.regularSubjects[0]?.id || filterData.archiveSubjects[0]?.id || '');
            }
          }

          // Ensure Sheet filter matches current module
          const currentSheetModId = targetModuleForSheet || firstModId;
          const inRegSheet = filterData.regularSubjects.find((s) => s.modules.some((m) => m.id === currentSheetModId));
          const inArcSheet = filterData.archiveSubjects.find((s) => s.modules.some((m) => m.id === currentSheetModId));
          if (!sheetSubjectFilter) {
            if (inRegSheet) {
              setSheetCategoryFilter('regular');
              setSheetSubjectFilter(inRegSheet.id);
            } else if (inArcSheet) {
              setSheetCategoryFilter('archive');
              setSheetSubjectFilter(inArcSheet.id);
            } else {
              setSheetCategoryFilter(filterData.regularSubjects.length > 0 ? 'regular' : 'archive');
              setSheetSubjectFilter(filterData.regularSubjects[0]?.id || filterData.archiveSubjects[0]?.id || '');
            }
          }
        }
      }
    } catch {}
  }, [teacherCourses, courses, selectedCourseForSection, selectedCourseForLec, selectedCourseForSheet, examCourseId]);

  // 4. Question Bank
  const [qbQuestions, setQbQuestions] = useState<any[]>([
    { id: 'qb_1', subject: 'পদার্থবিজ্ঞান', topic: 'ভেক্টর', text: 'নিচের কোনটি স্কেলার গুণনের বৈশিষ্ট্য?', type: 'MCQ' },
    { id: 'qb_2', subject: 'পদার্থবিজ্ঞান', topic: 'গতিবিদ্যা', text: 'একটি প্রক্ষেপকের সর্বোচ্চ উচ্চতায় বেগ কত?', type: 'MCQ' },
    { id: 'qb_3', subject: 'পদার্থবিজ্ঞান', topic: 'কাজ, শক্তি ও ক্ষমতা', text: 'সংরক্ষণশীল বলের ক্ষেত্রে মোট যান্ত্রিক শক্তি সংরক্ষিত থাকে কেন?', type: 'Written' },
  ]);
  const [newQbText, setNewQbText] = useState('');
  const [newQbSubject, setNewQbSubject] = useState('পদার্থবিজ্ঞান');
  const [newQbTopic, setNewQbTopic] = useState('ভেক্টর ও গতিবিদ্যা');
  const [newQbCategory, setNewQbCategory] = useState<'MCQ' | 'Written'>('MCQ');

  // 5. Live Classes Form & Studio States
  const [liveCourseId, setLiveCourseId] = useState('');
  const [newLiveTitle, setNewLiveTitle] = useState('');
  const [newLiveDescription, setNewLiveDescription] = useState('');
  const [newLivePlatform, setNewLivePlatform] = useState<'google_meet' | 'zoom' | 'youtube_live' | 'facebook_live'>('google_meet');
  const [newLiveLink, setNewLiveLink] = useState('');
  const [newLiveMeetingId, setNewLiveMeetingId] = useState('');
  const [newLivePassword, setNewLivePassword] = useState('');
  const [newLiveDate, setNewLiveDate] = useState('আজকে');
  const [newLiveTime, setNewLiveTime] = useState('রাত ৮:৩০');
  const [newLiveDuration, setNewLiveDuration] = useState(90);
  const [newLiveSheetTitle, setNewLiveSheetTitle] = useState('');
  const [newLiveSheetUrl, setNewLiveSheetUrl] = useState('');

  // End Live Class Modal state
  const [endingLiveClassId, setEndingLiveClassId] = useState<string | null>(null);
  const [endingRecordingUrl, setEndingRecordingUrl] = useState('');
  const [endingNotesPdf, setEndingNotesPdf] = useState('');
  const [liveUpcomingTab, setLiveUpcomingTab] = useState<'upcoming' | 'completed'>('upcoming');

  // 6. Notifications Enhanced States
  const [notifCategory, setNotifCategory] = useState<'live' | 'exam' | 'course' | 'sheet' | 'urgent' | 'general'>('course');
  const [notifPriority, setNotifPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [notifTargetAudience, setNotifTargetAudience] = useState<'all' | 'course'>('all');
  const [notifTargetCourseId, setNotifTargetCourseId] = useState(teacherCourses[0]?.id || '');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifActionLabel, setNotifActionLabel] = useState('');
  const [notifActionUrl, setNotifActionUrl] = useState('');
  const [notifIsPinned, setNotifIsPinned] = useState(false);
  const [notifSearch, setNotifSearch] = useState('');
  const [notifFilterCategory, setNotifFilterCategory] = useState<string>('all');
  const [courseNotifSelectedCourse, setCourseNotifSelectedCourse] = useState<string>('all');
  const [examNotifSelectedExam, setExamNotifSelectedExam] = useState<string>('');

  // 7. Messages & Doubt Hub States
  const [activeDoubtId, setActiveDoubtId] = useState<string>('');
  const [activeDirectThreadId, setActiveDirectThreadId] = useState<string>('');
  const [activeSupportThreadId, setActiveSupportThreadId] = useState<string>('');
  const [activeBatchThreadId, setActiveBatchThreadId] = useState<string>('');
  const [selectedBatchCourseId, setSelectedBatchCourseId] = useState<string>('course_campus6');
  const [doubtReplyText, setDoubtReplyText] = useState<string>('');
  const [directReplyText, setDirectReplyText] = useState<string>('');
  const [supportReplyText, setSupportReplyText] = useState<string>('');
  const [batchPostText, setBatchPostText] = useState<string>('');
  const [doubtFilterCourse, setDoubtFilterCourse] = useState<string>('all');
  const [doubtFilterStatus, setDoubtFilterStatus] = useState<'all' | 'pending' | 'solved'>('all');
  const [directSearchQuery, setDirectSearchQuery] = useState<string>('');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  // 8. Teacher Profile Settings
  const [profileBio, setProfileBio] = useState('বুয়েট (BUET) থেকে স্নাতক। বিগত ৯ বছর যাবত শিক্ষার্থীদের ফিজিক্স ও উচ্চতর গণিতের ভীতি দূর করতে কাজ করে যাচ্ছি।');
  const [profilePhoto, setProfilePhoto] = useState(currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    if (profileNewPassword && profileNewPassword !== profileConfirmPassword) {
      showToast('⚠️ নতুন পাসওয়ার্ড ও নিশ্চিত পাসওয়ার্ড মিলছে না!');
      return;
    }
    if (profileNewPassword && profileNewPassword.length < 4) {
      showToast('⚠️ পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!');
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await fetch('/api/teacher/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentUser.id,
          phone: currentUser.phone,
          email: currentUser.email,
          avatar: profilePhoto,
          bio: profileBio,
          newPassword: profileNewPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProfileNewPassword('');
        setProfileConfirmPassword('');
        showToast('✅ শিক্ষকের প্রোফাইল ও পাসওয়ার্ড সফলভাবে ডাটাবেজে আপডেট হয়েছে!');
      } else {
        showToast(data.error || 'আপডেট করতে সমস্যা হয়েছে!');
      }
    } catch {
      showToast('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ==================== COURSE EDITING & CREATION HANDLERS ====================
  const startEditingCourse = (c: any) => {
    setEditingCourseId(c.id);
    setWizardStep(1);
    setWTitle(c.title || '');
    setWCategory(c.category || 'Engineering');
    setWBatch(c.batch || 'Campus 7.0 Batch');
    setWLevel(c.level || 'এইচএসসি ও ভর্তি প্রস্তুতি ২০২৬');
    setWBadge(c.badge || 'ভর্তি চলছে');
    setWCoverImage(c.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80');
    setWTagline(c.tagline || '');
    setWRegularPrice(c.regularPrice || 3550);
    setWOfferPrice(c.offerPrice || 2750);
    setWCouponCode(c.couponCode || 'ADOMMO200');
    setWCouponDiscount(c.couponDiscount || 200);
    setWCountdownDays(c.countdownDays || 4);
    setWCountdownHours(c.countdownHours || 14);
    setWTotalLectures(c.totalLectures || 75);
    setWTotalExams(c.totalExams || 30);
    setWTotalSheets(c.totalSheets || 50);
    setWFeatures(c.features && c.features.length > 0 ? c.features : ['ফুল এইচডি ক্লাস', 'প্র্যাকটিস শিট PDF']);
    setWRoutineTitle(c.routineTitle || 'অদম্য ক্লাস ও এক্সাম রুটিন (PDF)');
    setWRoutinePdfUrl(c.routinePdfUrl || '#');
    setWTrailerUrl(c.trailerVideoUrl || '');
    setWDemoClassUrl(c.demoVideoUrl || '');
    setWRelatedVideos(c.relatedVideos || []);
    setWMentors(c.mentors && c.mentors.length > 0 ? c.mentors : [
      {
        name: c.instructor?.name || currentUser.name || 'সুমন হোসেন',
        role: c.instructor?.designation || 'লিড ইনস্ট্রাক্টর',
        institution: c.instructor?.institution || currentUser.college || 'বুয়েট (BUET)',
        avatar: c.instructor?.avatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      }
    ]);
    setWDescription(c.description || '');
    setWSyllabusModules(c.modules && c.modules.length > 0 ? c.modules.map((m: any) => m.title) : ['অধ্যায় ০১: পরিচিতি']);
    setWFaq(c.faq && c.faq.length > 0 ? c.faq : []);
    setWComboIds(c.comboCourseIds || []);

    setActiveMenu('courses');
    setActiveSubMenu('courses_create');
    showToast(`✏️ '${c.title.slice(0, 24)}...' কোর্সটি এডিট করার জন্য প্রস্তুত করা হয়েছে।`);
  };

  const cancelEditingCourse = () => {
    setEditingCourseId(null);
    setWizardStep(1);
    setWTitle('');
    showToast('কোর্স এডিট বাতিল করা হয়েছে। নতুন কোর্স ক্রিয়েটর ফর্ম প্রস্তুত।');
  };

  const handlePublishWizardCourse = (isDraft: boolean = false) => {
    if (!wTitle.trim()) {
      showToast('দয়া করে কোর্সের নাম লিখুন (ধাপ ১)');
      setWizardStep(1);
      return;
    }

    const regP = Number(wRegularPrice) || 2500;
    const offP = Number(wOfferPrice) || 1200;
    const discount = regP > offP ? Math.round(((regP - offP) / regP) * 100) : 0;

    const leadMentor = wMentors[0];
    const existingCourse = editingCourseId ? courses.find(c => c.id === editingCourseId) : null;

    const coursePayload = {
      title: wTitle.trim(),
      category: wCategory,
      level: wLevel,
      batch: wBatch,
      coverImage: wCoverImage,
      badge: wBadge,
      tagline: wTagline,
      description: wDescription,
      regularPrice: regP,
      offerPrice: offP,
      discountPercentage: discount,
      totalLectures: Number(wTotalLectures) || (existingCourse?.totalLectures ?? 0),
      totalExams: Number(wTotalExams) || (existingCourse?.totalExams ?? 0),
      totalSheets: Number(wTotalSheets) || (existingCourse?.totalSheets ?? 0),
      features: wFeatures,
      modules: existingCourse?.modules || [],
      sections: existingCourse?.sections || [],
      faq: wFaq,
      trailerVideoUrl: wTrailerUrl,
      demoVideoUrl: wDemoClassUrl,
      mentors: wMentors,
      relatedVideos: wRelatedVideos,
      routinePdfUrl: wRoutinePdfUrl,
      routineTitle: wRoutineTitle,
      countdownDays: Number(wCountdownDays) || 4,
      countdownHours: Number(wCountdownHours) || 14,
      comboCourseIds: wComboIds,
      couponCode: wCouponCode,
      couponDiscount: Number(wCouponDiscount) || 200,
      isDraft: isDraft,
      instructorId: currentUser.id || existingCourse?.instructorId || '',
      teacherEmail: currentUser.email || existingCourse?.teacherEmail || '',
      teacherPhone: currentUser.phone || existingCourse?.teacherPhone || '',
      instructor: {
        name: currentUser.name || leadMentor?.name || 'সুমন হোসেন',
        designation: leadMentor?.role || 'লিড ইনস্ট্রাক্টর',
        institution: currentUser.college || leadMentor?.institution || 'বুয়েট (BUET)',
        avatar: currentUser.avatar || leadMentor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    };

    if (editingCourseId) {
      updateCourse(editingCourseId, coursePayload);
      setEditingCourseId(null);
      setWizardStep(1);
      setWTitle('');
      setActiveMenu('courses');
      setActiveSubMenu(isDraft ? 'courses_draft' : 'courses_all');
      showToast(isDraft ? '📝 কোর্সটি ড্রাফট হিসেবে আপডেট করা হয়েছে।' : '🎉 কোর্স তথ্য সফলভাবে আপডেট ও সেভ হয়েছে!');
      return;
    }

    addCourse(coursePayload);

    // Reset wizard states
    setWizardStep(1);
    setWTitle('');
    setActiveMenu('courses');
    setActiveSubMenu(isDraft ? 'courses_draft' : 'courses_all');
    showToast(isDraft ? '📝 কোর্সটি খসড়া হিসেবে সেভ হয়েছে।' : '🎉 অভিনন্দন! নতুন কোর্সটি স্টুডেন্ট ওয়েবসাইটে সফলভাবে লাইভ হয়েছে।');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    handlePublishWizardCourse(false);
  };

  // ==================== SECTION & CHAPTER / CURRICULUM MANAGEMENT ====================
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    const effCourseId = selectedCourseForSection || teacherCourses[0]?.id || courses[0]?.id;
    if (!newSectionTitle.trim() || !effCourseId) {
      showToast('⚠️ বিষয়ের/মডিউলের নাম লিখুন');
      return;
    }

    const course = courses.find((c) => c.id === effCourseId);
    if (!course) return;

    const currentSections = course.sections || [];
    const newSection = {
      id: `sec_${Date.now()}`,
      title: newSectionTitle.trim(),
      type: newSectionType,
      isArchive: newSectionIsArchive,
      order: currentSections.length + 1,
      parentArchiveId: targetArchiveIdForSubject || undefined,
    };

    updateCourse(effCourseId, {
      sections: [...currentSections, newSection],
    });

    setNewSectionTitle('');
    setTargetArchiveIdForSubject('');
    setShowAddSectionModal(false);
    showToast(newSectionIsArchive ? '🗄️ নতুন আর্কাইভ সেকশন যুক্ত হয়েছে!' : targetArchiveIdForSubject ? '📚 আর্কাইভে নতুন বিষয় যুক্ত হয়েছে!' : '📁 নতুন বিষয়/মডিউল যুক্ত হয়েছে!');
  };

  const handleUpdateSection = (sectionId: string) => {
    if (!editingSectionTitle.trim()) return;
    const course = courses.find((c) => c.sections?.some((s) => s.id === sectionId)) ||
                   courses.find((c) => c.id === selectedCourseForSection) ||
                   teacherCourses[0] || courses[0];
    if (!course) return;

    const updatedSections = (course.sections || []).map((s) =>
      s.id === sectionId ? { ...s, title: editingSectionTitle.trim() } : s
    );

    // Also update parentSectionTitle on matching modules
    const updatedModules = (course.modules || []).map((m) =>
      m.parentSectionId === sectionId ? { ...m, parentSectionTitle: editingSectionTitle.trim() } : m
    );

    updateCourse(course.id, {
      sections: updatedSections,
      modules: updatedModules,
    });

    setEditingSectionId(null);
    setEditingSectionTitle('');
    showToast('✅ বিষয়/মডিউল শিরোনাম আপডেট হয়েছে!');
  };

  const handleDeleteSection = (sectionId: string) => {
    const course = courses.find((c) => c.sections?.some((s) => s.id === sectionId)) ||
                   courses.find((c) => c.id === selectedCourseForSection) ||
                   teacherCourses[0] || courses[0];
    if (!course) return;

    if (!confirm('আপনি কি এই সেকশনটি মুছে ফেলতে চান? এর সকল অধ্যায় ও ক্লাস মুছে যাবে।')) return;

    const deletingSection = (course.sections || []).find((s) => s.id === sectionId);
    // If deleting an archive section, also find all its child subjects
    const childSectionIds = (course.sections || [])
      .filter((s) => s.parentArchiveId === sectionId)
      .map((s) => s.id);
    const allRemovedSectionIds = new Set([sectionId, ...childSectionIds]);

    const updatedSections = (course.sections || []).filter((s) => !allRemovedSectionIds.has(s.id));
    
    // Remove all modules that belonged to this section by ID or title
    const updatedModules = (course.modules || []).filter((m) => {
      if (m.parentSectionId && allRemovedSectionIds.has(m.parentSectionId)) return false;
      if (m.parentArchiveId && allRemovedSectionIds.has(m.parentArchiveId)) return false;
      if (deletingSection?.title && m.parentSectionTitle === deletingSection.title) return false;
      return true;
    });

    const totalLecs = updatedModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
    const totalSheets = updatedModules.reduce(
      (sum, m) => sum + (m.lectures?.reduce((lSum, l) => lSum + (l.notes?.length || 0), 0) || 0),
      0
    );

    updateCourse(course.id, {
      sections: updatedSections,
      modules: updatedModules,
      totalLectures: totalLecs,
      totalSheets: totalSheets,
    });

    showToast('🗑️ সেকশন ও এর অন্তর্ভুক্ত অধ্যায়সমূহ মুছে ফেলা হয়েছে।');
  };

  const handleClearAllCurriculum = (courseId: string) => {
    if (!confirm('আপনি কি এই কোর্সের সকল বিষয়, অধ্যায়, ক্লাস ও শিট সম্পূর্ণ মুছে ফেলতে চান?')) return;
    updateCourse(courseId, {
      sections: [],
      modules: [],
      totalLectures: 0,
      totalSheets: 0,
    });
    showToast('🗑️ এই কোর্সের সম্পূর্ণ বিষয়, অধ্যায় ও ক্লাস মুছে ফেলা হয়েছে!');
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const effCourseId = selectedCourseForSection || teacherCourses[0]?.id || courses[0]?.id;
    if (!newChapterTitle.trim() || !effCourseId) {
      showToast('⚠️ অধ্যায়/টপিকের নাম লিখুন');
      return;
    }

    const course = courses.find((c) => c.id === effCourseId);
    if (!course) return;

    const effectiveSectionId = targetSectionIdForChapter || course.sections?.[0]?.id;
    const parentSec = (course.sections || []).find((s) => s.id === effectiveSectionId);
    const newMod = {
      id: `mod_${Date.now()}`,
      title: newChapterTitle.trim(),
      order: (course.modules || []).length + 1,
      parentSectionId: parentSec?.id,
      parentSectionTitle: parentSec?.title,
      parentSectionType: parentSec?.type,
      parentArchiveId: parentSec?.parentArchiveId || (parentSec?.isArchive ? parentSec?.id : undefined),
      isArchive: parentSec?.isArchive || Boolean(parentSec?.parentArchiveId) || false,
      unitType: newChapterUnitType,
      lectures: [],
    };

    updateCourse(effCourseId, {
      modules: [...(course.modules || []), newMod],
    });

    setNewChapterTitle('');
    setShowAddChapterModal(false);
    showToast('📖 নতুন অধ্যায়/টপিক যুক্ত হয়েছে!');
  };

  const handleUpdateChapter = (moduleId: string) => {
    if (!editingModuleTitle.trim()) return;
    const course = courses.find((c) => c.modules?.some((m) => m.id === moduleId)) ||
                   courses.find((c) => c.id === selectedCourseForSection) ||
                   teacherCourses[0] || courses[0];
    if (!course) return;

    const updatedModules = (course.modules || []).map((m) =>
      m.id === moduleId ? { ...m, title: editingModuleTitle.trim() } : m
    );

    updateCourse(course.id, {
      modules: updatedModules,
    });

    setEditingModuleId(null);
    setEditingModuleTitle('');
    showToast('✅ অধ্যায়/টপিক নাম আপডেট হয়েছে!');
  };

  const handleDeleteChapter = (moduleId: string, explicitCourseId?: string) => {
    const course = (explicitCourseId ? courses.find((c) => c.id === explicitCourseId) : null) ||
                   courses.find((c) => c.modules?.some((m) => m.id === moduleId)) ||
                   courses.find((c) => c.id === selectedCourseForSection) ||
                   teacherCourses[0] || courses[0];
    if (!course) return;

    if (!confirm('আপনি কি এই অধ্যায়টি মুছে ফেলতে চান? এর সকল ক্লাস মুছে যাবে।')) return;

    const updatedModules = (course.modules || []).filter((m) => m.id !== moduleId);
    const totalLecs = updatedModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);

    updateCourse(course.id, {
      modules: updatedModules,
      totalLectures: totalLecs,
    });

    showToast('🗑️ অধ্যায়/টপিক মুছে ফেলা হয়েছে।');
  };

  const handleAddLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureTitle.trim()) {
      showToast('⚠️ অনুগ্রহ করে ক্লাসের শিরোনাম লিখুন!');
      return;
    }

    const effCourseId = selectedCourseForLec || teacherCourses[0]?.id || courses[0]?.id;
    if (!effCourseId) {
      showToast('⚠️ কোনো কোর্স নির্বাচন করা হয়নি। প্রথমে একটি কোর্স তৈরি বা নির্বাচন করুন!');
      return;
    }

    const course = courses.find((c) => c.id === effCourseId);
    let targetModuleId = targetModuleForLec;
    if (!targetModuleId || !course?.modules?.some((m) => m.id === targetModuleId)) {
      targetModuleId = course?.modules?.[0]?.id || 'mod_default';
    }

    addLectureToCourse(effCourseId, targetModuleId, {
      title: lectureTitle.trim(),
      duration: lectureDuration.trim() || '৪৫ মিনিট',
      videoUrl: lectureVideoUrl.trim() || '',
      isFreePreview: isFreeTrial,
      notes: [],
    });

    setLectureTitle('');
    setLectureVideoUrl('');
    setLectureDuration('৪৫ মিনিট');
    setIsFreeTrial(false);
  };

  const handleAddSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetTitle.trim()) {
      showToast('⚠️ অনুগ্রহ করে শিটের শিরোনাম লিখুন।');
      return;
    }

    const effCourseId = selectedCourseForSheet || teacherCourses[0]?.id || courses[0]?.id;
    if (!effCourseId) {
      showToast('⚠️ অনুগ্রহ করে প্রথমে একটি কোর্স নির্বাচন করুন।');
      return;
    }

    const course = courses.find((c) => c.id === effCourseId);
    let mod = (targetModuleForSheet && course?.modules.find(m => m.id === targetModuleForSheet)) || course?.modules?.[0];

    if (!mod) {
      const defaultModId = `mod_${Date.now()}`;
      mod = { id: defaultModId, title: 'সাধারণ অধ্যায়', order: 1, lectures: [] };
    }

    let targetLecId = targetLectureForSheet;
    if (!targetLecId && mod.lectures && mod.lectures.length > 0) {
      targetLecId = mod.lectures[0].id;
    }

    const targetLec = mod.lectures?.find((l) => l.id === targetLecId);

    let finalPdfUrl = sheetLink.trim();
    if (!finalPdfUrl) {
      finalPdfUrl = '#';
    }

    addResourceSheet(effCourseId, mod.id, targetLecId || '', {
      title: sheetTitle.trim(),
      type: sheetType,
      size: sheetSize || '4.5 MB',
      pages: Number(sheetPages) || 12,
      pdfUrl: finalPdfUrl,
      lectureId: targetLecId || '',
      lectureTitle: targetLec?.title || 'সাধারণ রিসোর্স',
      uploadMethod: sheetUploadMethod,
    });

    setSheetTitle('');
    setSheetLink('');
    setSheetFileName('');
  };

  const renderCourseModuleOptgroups = (course?: Course) => {
    if (!course) return null;
    const modules = course.modules || [];
    const sections = course.sections || [];

    if (modules.length === 0) {
      return <option disabled value="">কোনো অধ্যায় তৈরি করা নেই</option>;
    }

    if (sections.length === 0) {
      return modules.map((m) => (
        <option key={m.id} value={m.id}>
          {m.isArchive ? '🗄️ ' : '📖 '}{m.parentSectionTitle ? `[${m.parentSectionTitle}] ` : ''}{m.title}
        </option>
      ));
    }

    const regularSections = sections.filter((s) => !s.isArchive && s.type !== 'archive' && !s.parentArchiveId);
    const archiveSections = sections.filter((s) => (s.isArchive || s.type === 'archive') && !s.parentArchiveId);
    const matchedModuleIds = new Set<string>();

    return (
      <>
        {/* 1. Live Syllabus Subjects */}
        {regularSections.map((sec) => {
          const secMods = modules.filter((m) => m.parentSectionId === sec.id || (!m.parentSectionId && m.parentSectionTitle === sec.title));
          if (secMods.length === 0) return null;
          secMods.forEach((m) => matchedModuleIds.add(m.id));
          return (
            <optgroup key={sec.id} label={`📂 [লাইভ সিলেবাস] ${sec.title}`}>
              {secMods.map((m) => (
                <option key={m.id} value={m.id}>
                  📖 {m.title}
                </option>
              ))}
            </optgroup>
          );
        })}

        {/* 2. Archive Sections */}
        {archiveSections.map((arc) => {
          const arcSubs = sections.filter((s) => s.parentArchiveId === arc.id);
          const directArcMods = modules.filter(
            (m) => (m.parentSectionId === arc.id || m.parentArchiveId === arc.id) && !arcSubs.some((s) => s.id === m.parentSectionId)
          );

          return (
            <React.Fragment key={arc.id}>
              {/* Archive Child Subjects */}
              {arcSubs.map((sub) => {
                const subMods = modules.filter((m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title));
                if (subMods.length === 0) return null;
                subMods.forEach((m) => matchedModuleIds.add(m.id));
                return (
                  <optgroup key={sub.id} label={`🗄️ [আর্কাইভ: ${arc.title}] ➔ 📚 ${sub.title}`}>
                    {subMods.map((m) => (
                      <option key={m.id} value={m.id}>
                        📖 {m.title}
                      </option>
                    ))}
                  </optgroup>
                );
              })}

              {/* Direct Modules under Archive */}
              {directArcMods.length > 0 && (() => {
                directArcMods.forEach((m) => matchedModuleIds.add(m.id));
                return (
                  <optgroup key={`${arc.id}_direct`} label={`🗄️ [আর্কাইভ: ${arc.title}] সরাসরি অধ্যায়সমূহ`}>
                    {directArcMods.map((m) => (
                      <option key={m.id} value={m.id}>
                        📖 {m.title}
                      </option>
                    ))}
                  </optgroup>
                );
              })()}
            </React.Fragment>
          );
        })}

        {/* 3. Unassigned / Remaining Modules */}
        {(() => {
          const remainingMods = modules.filter((m) => !matchedModuleIds.has(m.id));
          if (remainingMods.length === 0) return null;
          return (
            <optgroup label="📁 অন্যান্য সরাসরি অধ্যায়সমূহ">
              {remainingMods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.isArchive ? '🗄️ ' : '📖 '}{m.parentSectionTitle ? `[${m.parentSectionTitle}] ` : ''}{m.title}
                </option>
              ))}
            </optgroup>
          );
        })()}
      </>
    );
  };

  const handleAddQuestionToDraft = () => {
    if (!qText || qOptions.some((o) => !o.trim())) {
      showToast('⚠️ প্রশ্নের বিবরণ এবং চারটি অপশনই পূরণ করুন।');
      return;
    }

    const newQ = {
      id: `q_${Date.now()}`,
      text: qText,
      options: [...qOptions],
      correctOption: qCorrect,
      explanation: qExplanation || 'সঠিক উত্তর নির্বাচন করা হয়েছে।',
    };

    setBuiltQuestions([...builtQuestions, newQ]);
    setQText('');
    setQOptions(['', '', '', '']);
    setQExplanation('');
    showToast('✅ MCQ প্রশ্ন খসড়ায় যুক্ত হয়েছে!');
  };

  const handleRemoveQuestionFromDraft = (index: number) => {
    setBuiltQuestions(builtQuestions.filter((_, i) => i !== index));
    showToast('🗑️ MCQ প্রশ্ন মুছে ফেলা হয়েছে');
  };

  const handleAddCreativeQuestionToDraft = () => {
    if (!cqStem.trim() || !cqSubKa.trim() || !cqSubKha.trim() || !cqSubGa.trim() || !cqSubGha.trim()) {
      showToast('⚠️ সৃজনশীল প্রশ্নের উদ্দীপক এবং (ক, খ, গ, ঘ) চারটি সাব-প্রশ্নই পূরণ করুন।');
      return;
    }

    const newCq: CreativeQuestion = {
      id: `cq_${Date.now()}`,
      title: `সৃজনশীল প্রশ্ন ০${builtCreativeQuestions.length + 1}`,
      stem: cqStem.trim(),
      subQuestions: [
        { part: 'ক', text: cqSubKa.trim(), marks: 1, sampleAnswer: cqAnsKa.trim() || 'জ্ঞানমূলক আদর্শ উত্তর' },
        { part: 'খ', text: cqSubKha.trim(), marks: 2, sampleAnswer: cqAnsKha.trim() || 'অনুধাবনমূলক আদর্শ উত্তর' },
        { part: 'গ', text: cqSubGa.trim(), marks: 3, sampleAnswer: cqAnsGa.trim() || 'প্রয়োগমূলক আদর্শ সমাধান' },
        { part: 'ঘ', text: cqSubGha.trim(), marks: 4, sampleAnswer: cqAnsGha.trim() || 'উচ্চতর দক্ষতামূলক সমাধান' },
      ],
    };

    setBuiltCreativeQuestions([...builtCreativeQuestions, newCq]);
    setCqStem('');
    setCqSubKa('');
    setCqSubKha('');
    setCqSubGa('');
    setCqSubGha('');
    setCqAnsKa('');
    setCqAnsKha('');
    setCqAnsGa('');
    setCqAnsGha('');
    showToast('✅ সৃজনশীল প্রশ্ন (CQ) খসড়ায় যুক্ত হয়েছে!');
  };

  const handleRemoveCreativeQuestionFromDraft = (index: number) => {
    setBuiltCreativeQuestions(builtCreativeQuestions.filter((_, i) => i !== index));
    showToast('🗑️ সৃজনশীল প্রশ্ন মুছে ফেলা হয়েছে');
  };

  const handleSaveExam = () => {
    if (!examTitle.trim()) {
      showToast('⚠️ পরীক্ষার নাম লিখুন।');
      return;
    }

    if (examType === 'combined') {
      if (builtQuestions.length === 0 && builtCreativeQuestions.length === 0) {
        showToast('⚠️ সমন্বিত পরীক্ষায় অন্তত একটি MCQ এবং একটি সৃজনশীল প্রশ্ন যোগ করুন।');
        return;
      }
    } else if (examType === 'mcq' && builtQuestions.length === 0) {
      showToast('⚠️ অন্তত একটি MCQ প্রশ্ন যোগ করুন।');
      return;
    } else if (examType === 'written' && builtCreativeQuestions.length === 0) {
      showToast('⚠️ অন্তত একটি সৃজনশীল প্রশ্ন যোগ করুন।');
      return;
    }

    const effCourseId = examCourseId || teacherCourses[0]?.id || courses[0]?.id || '';
    const course = courses.find((c) => c.id === effCourseId);
    const startMs = examStartTime ? new Date(examStartTime).getTime() : 0;
    const isUpcomingSchedule = Boolean(startMs && !isNaN(startMs) && Date.now() < startMs);

    addExam({
      courseId: effCourseId,
      courseTitle: course?.title || 'স্পেশাল ফিজিক্স কোর্স',
      title: examTitle.trim(),
      examType: examType,
      durationMinutes: examType === 'combined' ? (examMcqDuration + examCqDuration) : examDuration,
      mcqDurationMinutes: examMcqDuration,
      cqDurationMinutes: examCqDuration,
      totalMarks: examType === 'combined' ? (examMcqMarks + examCqMarks) : examTotalMarks,
      mcqMarks: examMcqMarks,
      cqMarks: examCqMarks,
      passMarks: examPassMarks,
      cutMarks: examCutMarks,
      negativeMarkPerWrong: examNegativeMark,
      startTime: examStartTime || undefined,
      endTime: examEndTime || undefined,
      questionsCount: builtQuestions.length + builtCreativeQuestions.length,
      status: isUpcomingSchedule ? 'scheduled' : 'live',
      scheduledDate: examStartTime ? `শিডিউল: ${new Date(examStartTime).toLocaleDateString('bn-BD')}` : 'লাইভ পাবলিশ করা হয়েছে',
      questions: builtQuestions,
      creativeQuestions: builtCreativeQuestions,
      resultPublishType: examResultPublishType,
    });

    setExamTitle('');
    setBuiltQuestions([]);
    setBuiltCreativeQuestions([]);
    setExamStartTime('');
    setExamEndTime('');
    setExamResultPublishType('instant');
    setActiveMenu('exams');
    setActiveSubMenu('exams_all');
  };

  const handleSaveQuestionBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qbTitle.trim() || !qbPdfUrl.trim()) {
      showToast('⚠️ প্রশ্নব্যাংকের শিরোনাম এবং ড্রাইভ/পিডিএফ লিংক আবশ্যক।');
      return;
    }

    const effCourseId = qbCourseId || teacherCourses[0]?.id || courses[0]?.id || '';
    const course = courses.find((c) => c.id === effCourseId);

    if (editingQbId) {
      updateQuestionBank(editingQbId, {
        courseId: effCourseId,
        courseTitle: course?.title || 'ক্যাম্পাস ৬.০ প্রস্তুতি',
        title: qbTitle.trim(),
        subject: qbSubject,
        chapter: qbChapter.trim() || 'সাধারণ ও অধ্যায়ভিত্তিক',
        year: qbYear.trim() || '২০২৪',
        type: qbType,
        pages: Number(qbPages) || 50,
        fileSize: qbFileSize.trim() || '12 MB',
        pdfUrl: qbPdfUrl.trim(),
      });
      setEditingQbId(null);
    } else {
      addQuestionBank({
        courseId: effCourseId,
        courseTitle: course?.title || 'ক্যাম্পাস ৬.০ প্রস্তুতি',
        title: qbTitle.trim(),
        subject: qbSubject,
        chapter: qbChapter.trim() || 'সাধারণ ও অধ্যায়ভিত্তিক',
        year: qbYear.trim() || '২০২৪',
        type: qbType,
        pages: Number(qbPages) || 50,
        fileSize: qbFileSize.trim() || '12 MB',
        pdfUrl: qbPdfUrl.trim(),
      });
    }

    setQbTitle('');
    setQbChapter('');
    setQbPdfUrl('');
    showToast('📚 প্রশ্নব্যাংক সফলভাবে সেভ হয়েছে!');
  };

  const handleEditQuestionBank = (qb: QuestionBankItem) => {
    setEditingQbId(qb.id);
    setQbCourseId(qb.courseId || teacherCourses[0]?.id || '');
    setQbTitle(qb.title);
    setQbSubject(qb.subject);
    setQbChapter(qb.chapter || '');
    setQbYear(qb.year || '2024');
    setQbType((qb.type as any) || 'varsity');
    setQbPages(qb.pages || 60);
    setQbFileSize(qb.fileSize || '15 MB');
    setQbPdfUrl(qb.pdfUrl || '');
    setActiveMenu('exams');
    setActiveSubMenu('exams_qbank');
    showToast('✏️ প্রশ্নব্যাংক এডিটের জন্য প্রস্তুত করা হয়েছে');
  };

  const handleSaveExamSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsExamId) {
      showToast('⚠️ সেটিংস পরিবর্তনের জন্য একটি পরীক্ষা নির্বাচন করুন।');
      return;
    }

    updateExam(settingsExamId, {
      startTime: settingsStartTime || undefined,
      endTime: settingsEndTime || undefined,
      durationMinutes: settingsDuration,
      totalMarks: settingsTotalMarks,
      passMarks: settingsPassMarks,
      cutMarks: settingsCutMarks,
      negativeMarkPerWrong: settingsNegMark,
    });
  };

  const handleAddQuestionToBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQbText) return;
    setQbQuestions([
      ...qbQuestions,
      {
        id: `qb_${Date.now()}`,
        subject: newQbSubject,
        topic: newQbTopic,
        text: newQbText,
        type: newQbCategory,
      }
    ]);
    setNewQbText('');
    showToast('✅ প্রশ্নব্যাংকে প্রশ্ন সংরক্ষিত হয়েছে!');
  };

  const handleScheduleLive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiveTitle) {
      showToast('অনুগ্রহ করে লাইভ ক্লাসের শিরোনাম লিখুন!');
      return;
    }
    const targetCourse = teacherCourses.find(c => c.id === liveCourseId) || teacherCourses[0] || courses[0];
    if (!targetCourse) {
      showToast('অনুগ্রহ করে একটি কোর্স নির্বাচন করুন!');
      return;
    }

    scheduleLiveClass({
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      title: newLiveTitle,
      description: newLiveDescription || undefined,
      instructorName: currentUser?.name || 'ফ্যাকাল্টি শিক্ষক',
      platform: newLivePlatform,
      meetingLink: newLiveLink || (newLivePlatform === 'zoom' ? 'https://zoom.us/j/9876543210' : 'https://meet.google.com/adommo-live'),
      meetingId: newLiveMeetingId || undefined,
      meetingPassword: newLivePassword || undefined,
      date: newLiveDate || 'আজকে',
      time: newLiveTime || 'রাত ৮:৩০',
      durationMinutes: Number(newLiveDuration) || 90,
      status: 'upcoming',
      attachedSheetTitle: newLiveSheetTitle || undefined,
      attachedSheetUrl: newLiveSheetUrl || undefined,
    });

    setNewLiveTitle('');
    setNewLiveDescription('');
    setNewLiveLink('');
    setNewLiveMeetingId('');
    setNewLivePassword('');
    setNewLiveSheetTitle('');
    setNewLiveSheetUrl('');
    setActiveSubMenu('live_upcoming');
  };

  const applyNotifTemplate = (tpl: {
    category: 'live' | 'exam' | 'course' | 'sheet' | 'urgent' | 'general';
    priority: 'normal' | 'high' | 'urgent';
    title: string;
    body: string;
    actionLabel?: string;
    actionUrl?: string;
  }) => {
    setNotifCategory(tpl.category);
    setNotifPriority(tpl.priority);
    setNotifTitle(tpl.title);
    setNotifBody(tpl.body);
    setNotifActionLabel(tpl.actionLabel || '');
    setNotifActionUrl(tpl.actionUrl || '');
    showToast('✨ টেমপ্লেট সফলভাবে লোড হয়েছে!');
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) {
      showToast('⚠️ অনুগ্রহ করে নোটিফিকেশনের শিরোনাম ও বার্তা পূরণ করুন');
      return;
    }

    const selectedCourse = courses.find((c) => c.id === notifTargetCourseId);

    sendNotification({
      title: notifTitle.trim(),
      message: notifBody.trim(),
      category: notifCategory,
      priority: notifPriority,
      targetAudience: notifTargetAudience,
      targetCourseId: notifTargetAudience === 'course' ? notifTargetCourseId : undefined,
      targetCourseTitle: notifTargetAudience === 'course' ? (selectedCourse?.title || 'কোর্স') : undefined,
      senderName: currentUser.name || 'শিক্ষক প্যানেল',
      senderRole: 'অদম্য ফ্যাকাল্টি',
      senderAvatar: currentUser.avatar,
      actionLabel: notifActionLabel.trim() || undefined,
      actionUrl: notifActionUrl.trim() || undefined,
      isPinned: notifIsPinned,
    });

    setNotifTitle('');
    setNotifBody('');
    setNotifActionLabel('');
    setNotifActionUrl('');
    setNotifIsPinned(false);
  };

  // ==================== IF NOT AUTHENTICATED AS TEACHER -> SHOW TEACHER AUTH GATE ====================
  if (currentRole !== 'teacher' || currentUser?.role !== 'teacher') {
    return (
      <div className="min-h-[calc(100vh-108px)] bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
        
        {/* Ambient Glow Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-pink-300/30 via-indigo-300/20 to-purple-300/25 rounded-full blur-3xl pointer-events-none" />
        
        <div className={`w-full ${teacherAuthTab === 'login' ? 'max-w-[490px]' : 'max-w-[520px]'} relative z-10 space-y-4 animate-fade-in transition-all duration-300`}>
          
          {/* Top navigation & Badge */}
          <div className="flex items-center justify-between px-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ওয়েবসাইটে ফিরে যান</span>
            </Link>

            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ed347d]" />
              <span>শিক্ষক ও মেন্টর প্যানেল</span>
            </span>
          </div>

          {/* Centered Glass Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-500/10 p-7 sm:p-9 space-y-5">
            
            {/* Header & Logo */}
            <div className="text-center space-y-2.5">
              <div className="flex justify-center">
                <AdommoLogo />
              </div>

              <div className="space-y-1 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#fff0f5] text-[#ed347d] border border-pink-200 shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>অদম্য টিচার স্টুডিও (Teacher Studio)</span>
                </span>
                <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight pt-1">
                  {teacherAuthTab === 'login' ? 'শিক্ষক অ্যাকাউন্টে লগইন' : 'নতুন শিক্ষক রেজিস্ট্রেশন'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  কোর্স তৈরি, ক্লাস লেকচার শিট প্রদান ও পরীক্ষার প্রশ্নপত্র পরিচালনা করতে শিক্ষক আইডিতে যুক্ত হোন।
                </p>
              </div>
            </div>

            {/* Modern Tab Switcher */}
            <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setTeacherAuthTab('login')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  teacherAuthTab === 'login'
                    ? 'bg-white text-[#ed347d] shadow-sm shadow-pink-500/10'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>টিচার লগইন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeacherAuthTab('register');
                  setTeacherRegStep(1);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  teacherAuthTab === 'register'
                    ? 'bg-white text-[#ed347d] shadow-sm shadow-pink-500/10'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>নতুন শিক্ষক সাইন-আপ</span>
              </button>
            </div>

            {/* TAB 1: TEACHER LOGIN FORM */}
            {teacherAuthTab === 'login' ? (
              <form onSubmit={handleTeacherLogin} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    শিক্ষক ইমেইল অথবা মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="teacher@adommo.com অথবা 01XXXXXXXXX"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">সিকিউরিটি পাসওয়ার্ড *</label>
                    <Link
                      href="/auth/forgot-password?role=teacher"
                      className="text-xs font-bold text-[#ed347d] hover:underline"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showTeacherPassword ? 'text' : 'password'}
                      required
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    >
                      {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={teacherLoading}
                  className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{teacherLoading ? 'যাচাই করা হচ্ছে...' : 'শিক্ষক ড্যাশবোর্ডে প্রবেশ করুন'}</span>
                </button>
              </form>
            ) : (
              /* TAB 2: TEACHER MULTI-STEP REGISTRATION WIZARD */
              <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                
                {/* 4-Step Capsule Bar */}
                <div className="bg-slate-50/80 p-2 rounded-2xl border border-slate-200/80 shadow-inner">
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {teacherStepsMeta.map((s) => {
                      const isCompleted = teacherRegStep > s.num;
                      const isActive = teacherRegStep === s.num;

                      return (
                        <div
                          key={s.num}
                          className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-white shadow-md shadow-pink-500/10 border border-pink-200 text-[#ed347d] scale-[1.02]'
                              : isCompleted
                              ? 'text-emerald-600 bg-emerald-50/50'
                              : 'text-slate-400 opacity-70'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mb-1 transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-sm shadow-pink-500/30'
                                : isCompleted
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                          </div>
                          <span className="text-[11px] font-bold tracking-tight truncate max-w-full text-center">
                            {s.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Smooth Progress line */}
                  <div className="mt-2 h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#fa507e] to-[#ec376d] transition-all duration-500 ease-out rounded-full shadow-sm"
                      style={{ width: `${(teacherRegStep / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* TEACHER STEP 1: Personal & Contact */}
                {teacherRegStep === 1 && (
                  <form onSubmit={handleTeacherStep1Next} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">শিক্ষকের পূর্ণ নাম ও পদবী *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          placeholder="উদা: আসিফ ইকবাল"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">সচল মোবাইল নম্বর *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={teacherPhone}
                          onChange={(e) => setTeacherPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        অফিসিয়াল ইমেইল * <span className="text-[11px] font-medium text-slate-400">(পরবর্তী ধাপে ওটিপি যাবে)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={teacherRegEmail}
                          onChange={(e) => setTeacherRegEmail(e.target.value)}
                          placeholder="teacher@adommo.com"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                      <span>পরবর্তী ধাপ (একাডেমিক তথ্য)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* TEACHER STEP 2: Subject & Academic */}
                {teacherRegStep === 2 && (
                  <form onSubmit={handleTeacherStep2Next} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">প্রধান বিষয় *</label>
                      <select
                        value={teacherSubject}
                        onChange={(e) => setTeacherSubject(e.target.value)}
                        className="w-full px-3.5 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 text-slate-800 bg-slate-50/40 focus:bg-white transition-all shadow-xs font-medium"
                      >
                        <option value="পদার্থবিজ্ঞান (Physics)">পদার্থবিজ্ঞান (Physics)</option>
                        <option value="উচ্চতর গণিত (Higher Math)">উচ্চতর গণিত (Higher Math)</option>
                        <option value="রসায়ন (Chemistry)">রসায়ন (Chemistry)</option>
                        <option value="জীববিজ্ঞান (Biology)">জীববিজ্ঞান (Biology)</option>
                        <option value="তথ্য ও যোগাযোগ প্রযুক্তি (ICT)">তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">শিক্ষাগত প্রতিষ্ঠান / বিশ্ববিদ্যালয় *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <School className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={teacherInstitution}
                          onChange={(e) => setTeacherInstitution(e.target.value)}
                          placeholder="উদা: বুয়েট (BUET) / ঢাকা বিশ্ববিদ্যালয়"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">শিক্ষকতার অভিজ্ঞতা</label>
                      <select
                        value={teacherExperience}
                        onChange={(e) => setTeacherExperience(e.target.value)}
                        className="w-full px-3.5 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 text-slate-800 bg-slate-50/40 focus:bg-white transition-all shadow-xs font-medium"
                      >
                        <option value="১-২ বছর">১ - ২ বছর</option>
                        <option value="৩-৫ বছর">৩ - ৫ বছর</option>
                        <option value="৫+ বছর">৫+ বছর</option>
                        <option value="১০+ বছর">১০+ বছর</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setTeacherRegStep(1)}
                        className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>পূর্ববর্তী</span>
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>ইমেইল ওটিপি ধাপে যান</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* TEACHER STEP 3: Email OTP Verification */}
                {teacherRegStep === 3 && (
                  <form onSubmit={handleTeacherStep3Verify} className="space-y-5 pt-1 animate-in fade-in slide-in-from-right-3 duration-300 text-center">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-[#fff0f5] border border-pink-200 flex items-center justify-center text-[#ed347d] shadow-sm shadow-pink-500/10">
                      <ShieldCheck className="w-8 h-8" />
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">শিক্ষক ইমেইল ওটিপি যাচাই</h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                        <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono">{teacherRegEmail}</strong> ঠিকানায় পাঠানো ৬-সংখ্যার ওটিপি কোডটি লিখুন
                      </p>
                    </div>

                    {/* 6 Box OTP Input */}
                    <div className="flex justify-center gap-2 sm:gap-2.5 py-1">
                      {teacherOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`teacher-otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleTeacherOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleTeacherOtpKeyDown(idx, e)}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 border-slate-200 focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 focus:outline-none text-slate-900 bg-slate-50/60 focus:bg-white transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    {/* OTP helper & timer */}
                    <div className="flex items-center justify-between text-xs text-slate-500 px-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-slate-500 font-medium">কোড পাননি?</span>
                      <div className="text-slate-600 font-medium">
                        {teacherResendTimer > 0 ? (
                          <span>পুনরায় পাঠান (<span className="text-[#ed347d] font-bold font-mono">{teacherResendTimer}s</span>)</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleTeacherResendOtp}
                            className="text-[#ed347d] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>পুনরায় ওটিপি পাঠান</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setTeacherRegStep(2)}
                        className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>পূর্ববর্তী</span>
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>ওটিপি যাচাই সম্পন্ন করুন</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* TEACHER STEP 4: Password & Submit */}
                {teacherRegStep === 4 && (
                  <form onSubmit={handleTeacherStep4Submit} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">নতুন সিকিউরিটি পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type={showTeacherRegPassword ? 'text' : 'password'}
                          required
                          value={teacherRegPassword}
                          onChange={(e) => setTeacherRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTeacherRegPassword(!showTeacherRegPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                        >
                          {showTeacherRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড নিশ্চিত করুন *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showTeacherRegPassword ? 'text' : 'password'}
                          required
                          value={teacherConfirmPassword}
                          onChange={(e) => setTeacherConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={teacherAgreeTerms}
                          onChange={(e) => setTeacherAgreeTerms(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[#ed347d] focus:ring-[#ed347d]"
                        />
                        <span>আমি অদম্য এডটেক-এর শিক্ষক চুক্তি ও নীতিমালা নির্দেশনায় সম্মতি প্রদান করছি।</span>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setTeacherRegStep(3)}
                        className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>পূর্ববর্তী</span>
                      </button>
                      <button
                        type="submit"
                        disabled={teacherLoading}
                        className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{teacherLoading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'শিক্ষক অ্যাকাউন্ট সম্পন্ন করুন'}</span>
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* Bottom info link */}
            <div className="pt-3 text-center border-t border-slate-100">
              <Link
                href="/"
                className="text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>প্রধান শিক্ষার্থী ওয়েবসাইটে ফিরে যান</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==================== KYC VERIFICATION STATUS CHECK ====================
  const currentTeacherKyc = teacherKycList.find(
    (k) => k.teacherId === currentUser.id || k.teacherEmail === currentUser.email || k.teacherPhone === currentUser.phone
  );

  const isPreApprovedLead = currentUser.role === 'teacher' && (
    currentUser.id === 'usr_teacher_lead' || 
    currentUser.id === 'teacher_main' || 
    currentUser.phone === '01700-000000' || 
    currentUser.email === 'teacher@adommo.com'
  );

  const teacherKycStatus: 'approved' | 'pending' | 'rejected' | 'unsubmitted' = 
    currentTeacherKyc?.status || 
    currentUser.kycStatus || 
    (isPreApprovedLead ? 'approved' : 'unsubmitted');

  if (teacherKycStatus !== 'approved') {
    return (
      <TeacherKycScreen
        kycStatus={teacherKycStatus}
        currentKyc={currentTeacherKyc}
        onLogout={handleTeacherLogout}
      />
    );
  }

  // ==================== SIDEBAR MENU CONFIGURATION (ALL 10 ITEMS + SUBMENUS) ====================
  const menuConfig = [
    {
      id: 'dashboard',
      label: '১. Dashboard',
      icon: LayoutDashboard,
      subMenus: [
        { id: 'dashboard_main', label: 'ওভারভিউ ও মোট মেট্রিক্স' },
        { id: 'dashboard_courses', label: 'মোট Course (আমার কোর্সসমূহ)' },
        { id: 'dashboard_students', label: 'মোট Student (এনরোল শিক্ষার্থী)' },
        { id: 'dashboard_sales', label: 'Total Sales (আমার কোর্স সেলস)' },
        { id: 'dashboard_today', label: 'আজকের Enrollments' },
        { id: 'dashboard_exams', label: 'Upcoming Exams (আসন্ন পরীক্ষা)' },
      ]
    },
    {
      id: 'courses',
      label: '২. My Courses',
      icon: BookOpen,
      subMenus: [
        { id: 'courses_all', label: 'All Courses (সকল কোর্স)' },
        { id: 'courses_create', label: 'Create New Course' },
        { id: 'courses_import_json', label: '📥 JSON আপলোড ও অটো-সিঙ্ক' },
        { id: 'courses_published', label: 'Published Courses' },
        { id: 'courses_draft', label: 'Draft Courses' },
        { id: 'courses_archived', label: 'Archived Courses' },
      ]
    },
    {
      id: 'content',
      label: '৩. Course Content',
      icon: Layers,
      subMenus: [
        { id: 'content_sections', label: 'Sections / Chapters' },
        { id: 'content_lectures', label: 'Lectures' },
        { id: 'content_videos', label: 'Video Classes' },
        { id: 'content_sheets', label: 'PDF / Notes / Sheets' },
      ]
    },
    {
      id: 'exams',
      label: '৪. Exams',
      icon: Award,
      subMenus: [
        { id: 'exams_all', label: 'All Exams' },
        { id: 'exams_create', label: 'Create Exam' },
        { id: 'exams_evaluation', label: 'CQ Script Evaluation (খাতা মূল্যায়ন)' },
        { id: 'exams_results', label: 'Exam Results (ফলাফল)' },
        { id: 'exams_qbank', label: 'Question Bank' },
        { id: 'exams_mcq', label: 'MCQ Questions' },
        { id: 'exams_written', label: 'Written Questions' },
        { id: 'exams_settings', label: 'Exam Settings' },
      ]
    },
    {
      id: 'students',
      label: '৫. Students',
      icon: Users,
      subMenus: [
        { id: 'students_all', label: 'All Students' },
        { id: 'students_coursewise', label: 'Course-wise Students' },
        { id: 'students_results', label: 'Student Results' },
        { id: 'students_enrollments', label: 'Enrollments' },
      ]
    },
    {
      id: 'live_class',
      label: '৬. Live Class',
      icon: Radio,
      subMenus: [
        { id: 'live_schedule', label: 'Schedule Class' },
        { id: 'live_upcoming', label: 'Upcoming Classes' },
        { id: 'live_now', label: 'Live Now' },
      ]
    },
    {
      id: 'notifications',
      label: '৭. Notifications',
      icon: Bell,
      subMenus: [
        { id: 'notif_send', label: '১. Send Notification (নোটিশ পাঠান)' },
        { id: 'notif_course', label: '২. Course Announcement (কোর্স নোটিশ)' },
        { id: 'notif_exam', label: '৩. Exam Notification (পরীক্ষা নোটিশ)' },
        { id: 'notif_student', label: '৪. Urgent Student Alerts (জরুরি বার্তা)' },
      ]
    },
    {
      id: 'messages',
      label: '৮. Messages',
      icon: MessageSquare,
      badge: unreadTeacherMsgCount > 0 ? `${unreadTeacherMsgCount}` : undefined,
      subMenus: [
        { id: 'msg_doubts', label: '১. Student Doubts (প্রশ্ন সমাধান)' },
        { id: 'msg_direct', label: '২. Direct Chat (ইনবক্স)' },
        { id: 'msg_support', label: '৩. Support Desk (সাপোর্ট ডেস্ক)' },
        { id: 'msg_batch', label: '৪. Batch Group (গ্রুপ ডিসকাশন)' },
      ]
    },
    {
      id: 'settings',
      label: '৯. Profile & Settings',
      icon: Settings,
      subMenus: [
        { id: 'profile_view', label: 'Teacher Profile' },
        { id: 'profile_photo', label: 'Profile Photo' },
        { id: 'profile_bio', label: 'Bio' },
        { id: 'profile_password', label: 'Password' },
        { id: 'profile_notifications', label: 'Notification Settings' },
      ]
    },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f8f9fd] text-slate-800 font-sans antialiased selection:bg-[#ed347d]/20 selection:text-[#ed347d] overflow-hidden z-30">
      
      {/* ================= TOP TEACHER STUDIO BAR (PERMANENTLY FIXED AT TOP) ================= */}
      <header className="shrink-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-xs z-40 transition-all">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <AdommoLogo badge="Teacher Studio" />
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>লাইভ স্টুডিও সক্রিয়</span>
            </div>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#ed347d] bg-slate-50/90 hover:bg-pink-50/80 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#ed347d]" />
            <span>শিক্ষার্থী ভিউ</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setActiveMenu('messages');
              setActiveSubMenu('msg_doubts');
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/80 transition-colors relative cursor-pointer border border-transparent hover:border-pink-200"
            title="মেসেজ ও ডাউট সমাধান"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadTeacherMsgCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-[#ed347d] to-pink-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {unreadTeacherMsgCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMenu('notifications');
              setActiveSubMenu('notif_send');
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/80 transition-colors relative cursor-pointer border border-transparent hover:border-pink-200"
            title="নোটিফিকেশন পাঠান"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ed347d] animate-pulse" />
          </button>

          {/* Verified Teacher Badge */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ভেরিফাইড শিক্ষক ✅</span>
          </span>

          {/* Teacher Profile Pill */}
          <div 
            onClick={() => {
              setActiveMenu('settings');
              setActiveSubMenu('profile_view');
            }}
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-pink-50/50 border border-slate-200/90 hover:border-pink-200 px-3 py-1.5 rounded-2xl cursor-pointer transition-all shadow-2xs"
            title="প্রোফাইল সেটিংস"
          >
            <div className="relative">
              <img
                src={profilePhoto}
                alt="Teacher"
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="font-black text-slate-900 block truncate max-w-[130px]">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{teacherSubject.split(' ')[0]}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTeacherLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer shadow-2xs hover:shadow-xs"
            title="শিক্ষক অ্যাকাউন্ট থেকে লগআউট করুন"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN TEACHER STUDIO BODY: TWO INDEPENDENT SCROLLABLE PANES ================= */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* ================= SIDEBAR MENU (INDEPENDENT SCROLLBAR) ================= */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-full transition-all duration-200 ease-in-out shadow-xl lg:shadow-none
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          
          {/* Teacher Quick Bio / Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-pink-50/50 via-white to-slate-50/60">
            <div className="flex items-center gap-3">
              <img
                src={profilePhoto}
                alt="Teacher"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-[#ed347d]/30 shadow-xs"
              />
              <div className="overflow-hidden">
                <h2 className="text-xs font-black text-slate-900 truncate">{currentUser.name}</h2>
                <p className="text-[11px] text-slate-500 truncate font-semibold">{currentUser.college || teacherSubject}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  সচল শিক্ষক অ্যাকাউন্ট
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items List (Independent Scrollable Menu Bar) */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2 sidebar-scrollbar min-h-0">
            {menuConfig.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeMenu === item.id;
              const isExpanded = expandedMenus[item.id];
              const isLiveActive = item.id === 'live_class' && liveClasses.some(l => l.status === 'live');
              const pendingScripts = detailedSubmissions.filter(s => s.status === 'pending_evaluation' || !s.status).length;

              // Section dividers
              const sectionHeader = 
                idx === 0 ? 'প্রধান ড্যাশবোর্ড' :
                idx === 1 ? 'কোর্স ও কনটেন্ট' :
                idx === 3 ? 'পরীক্ষা ও মূল্যায়ন' :
                idx === 4 ? 'ইন্টারঅ্যাকশন ও স্টুডিও' :
                idx === 8 ? 'অ্যাকাউন্ট ও সেটিংস' : null;

              return (
                <div key={item.id} className="space-y-1">
                  {sectionHeader && (
                    <div className="pt-2 pb-1 px-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {sectionHeader}
                      </span>
                    </div>
                  )}

                  {/* Primary Menu Item */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu(item.id);
                      setActiveSubMenu(item.subMenus[0]?.id || item.id);
                      toggleSubmenu(item.id);
                      if (window.innerWidth < 1024) setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#fff0f5] to-pink-50 text-[#ed347d] shadow-xs border border-pink-200/90 ring-1 ring-pink-100'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-pink-100/70 text-[#ed347d]' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLiveActive && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black animate-pulse uppercase tracking-wider">
                          LIVE
                        </span>
                      )}
                      {item.id === 'exams' && pendingScripts > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black">
                          {pendingScripts}
                        </span>
                      )}
                      {item.subMenus?.length > 0 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubmenu(item.id);
                          }}
                          className="p-1 hover:bg-pink-100/50 rounded-md text-slate-400"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#ed347d]' : ''}`} />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Submenu Drawer */}
                  {isExpanded && item.subMenus && item.subMenus.length > 0 && (
                    <div className="pl-5 pr-1 py-1 space-y-0.5 border-l-2 border-pink-100 ml-4 animate-in fade-in duration-200">
                      {item.subMenus.map((sub) => {
                        const isSubActive = activeMenu === item.id && activeSubMenu === sub.id;
                        const isSubEval = sub.id === 'exams_evaluation' && pendingScripts > 0;

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setActiveMenu(item.id);
                              setActiveSubMenu(sub.id);
                              if (sub.id === 'courses_import_json') {
                                setShowCourseUploadModal(true);
                              }
                              if (sub.id === 'content_sections' || sub.id === 'content_lectures' || sub.id === 'content_sheets') {
                                const activeCId = selectedCourseForSection || selectedCourseForSheet || selectedCourseForLec;
                                if (activeCId) {
                                  handleSelectCourse(activeCId);
                                }
                              }
                              if (window.innerWidth < 1024) setMobileSidebarOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                              isSubActive
                                ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                                : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-white' : 'bg-slate-300'}`} />
                              <span className="truncate">{sub.label}</span>
                            </div>
                            {isSubEval && (
                              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black shrink-0 ${
                                isSubActive ? 'bg-white text-[#ed347d]' : 'bg-amber-100 text-amber-900'
                              }`}>
                                {pendingScripts}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700">টিচার স্টুডিও v৩.২</span>
            </div>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
              ভেরিফাইড
            </span>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ================= MAIN CONTENT CANVAS (INDEPENDENT SCROLLBAR) ================= */}
        <main className="flex-1 h-full overflow-y-auto canvas-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          
          {/* Breadcrumb / Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <span>শিক্ষক প্যানেল</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#ed347d] capitalize">{activeMenu}</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-700">{activeSubMenu}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {menuConfig.find(m => m.id === activeMenu)?.label} — {menuConfig.find(m => m.id === activeMenu)?.subMenus.find(s => s.id === activeSubMenu)?.label}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link
                href="/courses"
                target="_blank"
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-pink-300 hover:text-[#ed347d] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#ed347d]" />
                <span className="hidden sm:inline">স্টুডেন্ট সাইট দেখুন</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (confirm('আপনি কি নিশ্চিত যে ডাটাবেস ফ্রেশ অবস্থায় রিসেট করতে চান? এতে করাপ্টেড ডাটা মুছে যাবে।')) {
                    resetToDefaultData();
                    showToast('🔄 ডাটাবেস সফলভাবে ক্লিন ও রিসেট করা হয়েছে!');
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="ডাটাবেস ফ্রেশ ও ক্লিন অবস্থায় রিসেট করুন"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">ডাটাবেস রিসেট</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMenu('courses');
                  setActiveSubMenu('courses_create');
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white ph-btn-pink shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ নতুন কোর্স খুলুন</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMenu('exams');
                  setActiveSubMenu('exams_create');
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-pink-500" />
                <span>+ পরীক্ষা তৈরি</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. DASHBOARD MODULE */}
          {/* ========================================================================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Hero Action Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-900/50">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2.5 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-white/10 backdrop-blur-md text-pink-200 border border-white/10 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>অদম্য টিচার স্টুডিও ৩.২ • ভেরিফাইড ইনস্ট্রাক্টর ড্যাশবোর্ড</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
                      শুভ দিন, {currentUser.name || 'শিক্ষক'} স্যার! 🎓
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-100/85 leading-relaxed">
                      আজকে আপনার কোর্সে <strong>{todayEnrollmentsCount} জন</strong> নতুন শিক্ষার্থী যুক্ত হয়েছে। 
                      {liveClasses.some(l => l.status === 'live') ? ' ১টি লাইভ ক্লাস বর্তমানে চলমান রয়েছে।' : ' শিক্ষক প্যানেল সম্পূর্ণ প্রস্তুত রয়েছে।'}
                    </p>
                  </div>

                  {/* 4 Quick Action Launcher Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setActiveMenu('live_class'); setActiveSubMenu('live_now'); }}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>লাইভ স্টুডিও</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveMenu('exams'); setActiveSubMenu('exams_evaluation'); }}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4 text-amber-300" />
                      <span>খাতা মূল্যায়ন</span>
                      {detailedSubmissions.filter(s => s.status === 'pending_evaluation' || !s.status).length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                          {detailedSubmissions.filter(s => s.status === 'pending_evaluation' || !s.status).length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveMenu('courses'); setActiveSubMenu('courses_create'); }}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-pink-300" />
                      <span>নতুন কোর্স</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveMenu('exams'); setActiveSubMenu('exams_qbank'); }}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <BookMarked className="w-4 h-4 text-purple-300" />
                      <span>প্রশ্নব্যাংক</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Top 5 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* 1. মোট Course */}
                <div 
                  onClick={() => { setActiveMenu('dashboard'); setActiveSubMenu('dashboard_courses'); }}
                  className={`relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    activeSubMenu === 'dashboard_courses' ? 'border-[#ed347d] ring-2 ring-pink-100 shadow-md' : 'border-slate-200/80 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">মোট Course</span>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 text-[#ed347d] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{teacherCourses.length} <span className="text-xs font-bold text-slate-400">টি</span></div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">শুধু আপনার পরিচালিত কোর্স</span>
                </div>

                {/* 2. মোট Student */}
                <div 
                  onClick={() => { setActiveMenu('dashboard'); setActiveSubMenu('dashboard_students'); }}
                  className={`relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    activeSubMenu === 'dashboard_students' ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md' : 'border-slate-200/80 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">মোট Student</span>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{teacherEnrollments.length} <span className="text-xs font-bold text-slate-400">জন</span></div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">আপনার কোর্সে এনরোলকৃত</span>
                </div>

                {/* 3. Total Sales */}
                <div 
                  onClick={() => { setActiveMenu('dashboard'); setActiveSubMenu('dashboard_sales'); }}
                  className={`relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    activeSubMenu === 'dashboard_sales' ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md' : 'border-slate-200/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">Total Sales</span>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">৳{teacherTotalSales.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> মোট অর্জিত রেভিনিউ
                  </span>
                </div>

                {/* 4. আজকের Enrollments */}
                <div 
                  onClick={() => { setActiveMenu('dashboard'); setActiveSubMenu('dashboard_today'); }}
                  className={`relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    activeSubMenu === 'dashboard_today' ? 'border-amber-500 ring-2 ring-amber-100 shadow-md' : 'border-slate-200/80 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">আজকের Enrollments</span>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{todayEnrollmentsCount} <span className="text-xs font-bold text-slate-400">জন</span></div>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    আজকে যুক্ত শিক্ষার্থী
                  </span>
                </div>

                {/* 5. Upcoming Exams */}
                <div 
                  onClick={() => { setActiveMenu('dashboard'); setActiveSubMenu('dashboard_exams'); }}
                  className={`relative overflow-hidden bg-white p-5 rounded-3xl border shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    activeSubMenu === 'dashboard_exams' ? 'border-purple-500 ring-2 ring-purple-100 shadow-md' : 'border-slate-200/80 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">Upcoming Exams</span>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{teacherExams.length} <span className="text-xs font-bold text-slate-400">টি</span></div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">আপনার শিডিউলকৃত পরীক্ষা</span>
                </div>

              </div>

              {/* Submenu 1: dashboard_main (General Overview) */}
              {activeSubMenu === 'dashboard_main' && (() => {
                const liveNow = liveClasses.find(l => l.status === 'live');
                const pendingScripts = detailedSubmissions.filter(s => s.status === 'pending_evaluation' || !s.status);

                return (
                  <div className="space-y-6">
                    {/* Live Broadcast Spotlight */}
                    {liveNow && (
                      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-red-400/40">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <span className="relative flex h-4 w-4 shrink-0 mt-1 sm:mt-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded bg-black/40 text-[10px] font-black uppercase tracking-wider text-rose-100">
                                🔴 লাইভ ক্লাস চলমান
                              </span>
                              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">
                                {liveNow.platform.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-black mt-1">{liveNow.title}</h4>
                            <p className="text-xs text-rose-100">কোর্স: {liveNow.courseTitle} • সময়: {liveNow.time}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                          <a
                            href={liveNow.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-white text-rose-600 font-black text-xs hover:bg-rose-50 transition-all flex items-center gap-1.5 shadow-md"
                          >
                            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                            <span>হোস্ট হিসেবে যুক্ত হোন</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => { setActiveMenu('live_class'); setActiveSubMenu('live_now'); }}
                            className="px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-white font-bold text-xs transition-all cursor-pointer"
                          >
                            স্টুডিও ড্যাশবোর্ড
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending Script Evaluations Spotlight */}
                    {pendingScripts.length > 0 && (
                      <div className="p-5 rounded-3xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-amber-950">
                              {pendingScripts.length} টি লিখিত পরীক্ষার স্ক্রিপ্ট মূল্যায়নের অপেক্ষায় রয়েছে
                            </h4>
                            <p className="text-xs text-amber-800">
                              শিক্ষার্থীরা তাদের CQ উত্তরপত্র সাবমিট করেছে। খাতা মূল্যায়ন করে নম্বর ও মতামত প্রকাশ করুন।
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => { setActiveMenu('exams'); setActiveSubMenu('exams_evaluation'); }}
                          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer hover:scale-105"
                        >
                          <span>খাতা মূল্যায়ন শুরু করুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left 2 Cols: My Active Courses Overview */}
                      <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-black text-slate-800">আমার পরিচালিত কোর্সসমূহ</h3>
                            <p className="text-[11px] text-slate-500">সর্বশেষ অ্যাক্টিভ কোর্স ও শিক্ষার্থীদের অগ্রগতি</p>
                          </div>
                          <button
                            onClick={() => setActiveSubMenu('dashboard_courses')}
                            className="text-xs font-bold text-[#ed347d] hover:underline"
                          >
                            সবগুলো দেখুন ({teacherCourses.length})
                          </button>
                        </div>

                        <div className="space-y-3">
                          {teacherCourses.slice(0, 3).map((c) => (
                            <div key={c.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <img src={c.coverImage} alt={c.title} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{c.title}</h4>
                                  <p className="text-[11px] text-slate-500">{c.category} • ফি: ৳{c.offerPrice}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-slate-800 block">
                                  {teacherEnrollments.filter(e => e.courseId === c.id).length || c.enrolledCount} এনরোলড
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold">সক্রিয়</span>
                              </div>
                            </div>
                          ))}
                          {teacherCourses.length === 0 && (
                            <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
                              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                              <p className="text-xs font-bold text-slate-600">বর্তমানে আপনার কোনো কোর্স তৈরি করা নেই</p>
                              <button
                                type="button"
                                onClick={() => { setActiveMenu('courses'); setActiveSubMenu('courses_create'); }}
                                className="text-xs font-black text-[#ed347d] hover:underline inline-block cursor-pointer"
                              >
                                + নতুন কোর্স তৈরি করুন
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right 1 Col: Recent Student Registrations */}
                      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-black text-slate-800">সাম্প্রতিক এনরোলমেন্ট</h3>
                            <p className="text-[11px] text-slate-500">লাইভ শিক্ষার্থী ভেরিফিকেশন</p>
                          </div>
                          <span className="text-[10px] bg-pink-50 text-[#ed347d] px-2 py-0.5 rounded-full font-bold">লাইভ</span>
                        </div>

                        <div className="space-y-3">
                          {teacherEnrollments.slice(0, 4).map((enr) => (
                            <div key={enr.id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-0">
                              <div>
                                <span className="font-bold text-slate-800 block">{enr.studentName}</span>
                                <span className="text-[10px] text-slate-400">{enr.courseTitle.slice(0, 24)}...</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                enr.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                ৳{enr.amount}
                              </span>
                            </div>
                          ))}
                          {teacherEnrollments.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-6">এখনো কোনো শিক্ষার্থী এনরোল করেনি।</p>
                          )}
                        </div>

                        {teacherEnrollments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveSubMenu('dashboard_students')}
                            className="w-full py-2 text-center text-xs font-bold text-[#ed347d] hover:bg-pink-50 rounded-xl transition-colors"
                          >
                            সকল শিক্ষার্থী তালিকা দেখুন →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Submenu 2: dashboard_courses (মোট Course — শুধুমাত্র শিক্ষকের সকল কোর্স) */}
              {activeSubMenu === 'dashboard_courses' && (
                <div className="space-y-6">
                  {/* Submenu Header */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#ed347d] flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                          মোট Course — আপনার পরিচালিত কোর্সসমূহ
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#fff0f5] text-[#ed347d] border border-pink-200">
                          {teacherCourses.length} টি কোর্স
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        আপনার শিক্ষক অ্যাকাউন্টের অধীনে তৈরি ও পরিচালিত সকল কোর্সের সার্বিক বিবরণ ও সরাসরি পরিচালনা।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setActiveMenu('courses'); setActiveSubMenu('courses_create'); }}
                      className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white ph-btn-pink shadow-md shadow-pink-500/10 flex items-center gap-2 cursor-pointer self-start sm:self-auto hover:scale-[1.02] transition-transform"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ নতুন কোর্স তৈরি করুন</span>
                    </button>
                  </div>

                  {/* Course List or Empty State */}
                  {teacherCourses.length === 0 ? (
                    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-pink-50 text-[#ed347d] flex items-center justify-center mx-auto border border-pink-100 shadow-sm">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="text-lg font-black text-slate-900">কোনো কোর্স পাওয়া যায়নি</h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          বর্তমানে আপনার শিক্ষক অ্যাকাউন্টে কোনো কোর্স তৈরি করা নেই। শিক্ষার্থীদের জন্য ক্লাসরুম, লেকচার ও পরীক্ষার সুযোগ দিতে এখনই একটি নতুন কোর্স তৈরি করুন।
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => { setActiveMenu('courses'); setActiveSubMenu('courses_create'); }}
                          className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform inline-flex items-center gap-2 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>নতুন কোর্স তৈরি করুন</span>
                        </button>
                      </div>

                      {/* 3 Quick Helper Steps */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 max-w-2xl mx-auto text-left">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <span className="text-[10px] font-black text-[#ed347d] block mb-1">১. কোর্স তথ্য দিন</span>
                          <span className="text-[11px] text-slate-600 font-medium">শিরোনাম, ক্যাটাগরি, ব্যাচ ও ফি নির্ধারণ করুন</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <span className="text-[10px] font-black text-[#ed347d] block mb-1">২. লেকচার ও শিট দিন</span>
                          <span className="text-[11px] text-slate-600 font-medium">ভিডিও ক্লাস লিংক ও পিডিএফ শিট আপলোড করুন</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <span className="text-[10px] font-black text-[#ed347d] block mb-1">৩. শিক্ষার্থী ভর্তি নিন</span>
                          <span className="text-[11px] text-slate-600 font-medium">লাইভ এনরোলমেন্ট অনুমোদন করে ক্লাস পরিচালনা করুন</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {teacherCourses.map((c) => {
                        const enrolledCount = teacherEnrollments.filter(e => e.courseId === c.id).length || c.enrolledCount || 0;
                        const totalLectures = c.modules?.reduce((acc, m) => acc + m.lectures.length, 0) || 0;
                        const totalSheets = c.modules?.reduce((acc, m) => acc + m.lectures.reduce((lAcc, l) => lAcc + (l.notes?.length || 0), 0), 0) || 0;

                        return (
                          <div 
                            key={c.id}
                            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:border-pink-300 hover:shadow-md transition-all group"
                          >
                            {/* Course Cover Image */}
                            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                              <img 
                                src={c.coverImage} 
                                alt={c.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-[#ed347d] shadow-sm backdrop-blur-xs">
                                  {c.category}
                                </span>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white shadow-sm backdrop-blur-xs">
                                  {c.batch}
                                </span>
                              </div>

                              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                                <span className="text-[11px] font-extrabold flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-pink-400" />
                                  <span>{enrolledCount} জন শিক্ষার্থী</span>
                                </span>
                                <span className="text-xs font-black bg-[#ed347d] px-2.5 py-0.5 rounded-full shadow-xs">
                                  ৳ {c.offerPrice}
                                </span>
                              </div>
                            </div>

                            {/* Course Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                                  {c.title}
                                </h3>
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {c.description || 'সম্পূর্ণ কোর্স সিলেবাস কভারেজ, লেকচার ও সাপ্তাহিক পরীক্ষা।'}
                                </p>
                              </div>

                              {/* Stats Row */}
                              <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Video className="w-3.5 h-3.5 text-pink-500" />
                                  <span className="font-bold">{totalLectures} টি ক্লাস</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                  <span className="font-bold">{totalSheets} টি শিট</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="space-y-2 pt-1">
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCourseForLec(c.id);
                                      setActiveMenu('content');
                                      setActiveSubMenu('content_lectures');
                                    }}
                                    className="py-2 px-2.5 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Video className="w-3 h-3 text-pink-500" />
                                    <span>+ লেকচার দিন</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExamCourseId(c.id);
                                      setActiveMenu('exams');
                                      setActiveSubMenu('exams_create');
                                    }}
                                    className="py-2 px-2.5 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Award className="w-3 h-3 text-indigo-500" />
                                    <span>+ পরীক্ষা নিন</span>
                                  </button>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => startEditingCourse(c)}
                                    className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>এডিট</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStudentSearch(c.title);
                                      setActiveSubMenu('dashboard_students');
                                    }}
                                    className="flex-1 py-2 px-3 rounded-xl text-xs font-black text-[#ed347d] bg-[#fff0f5] hover:bg-pink-100/70 border border-pink-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>শিক্ষার্থী ({enrolledCount})</span>
                                  </button>
                                  <Link
                                    href={`/courses/${c.id}`}
                                    target="_blank"
                                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#ed347d]" />
                                    <span>স্টুডেন্ট ভিউ</span>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Submenu 3: dashboard_students (মোট Student — সকল কোর্সের শিক্ষার্থী তালিকা) */}
              {activeSubMenu === 'dashboard_students' && (
                <div className="space-y-5">
                  {/* Header Box */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                          মোট Student — এনরোলকৃত শিক্ষার্থী তালিকা
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {teacherEnrollments.length} জন
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        আপনার পরিচালিত সকল কোর্সে ভর্তি হওয়া শিক্ষার্থীদের পূর্ণাঙ্গ তালিকা, যোগাযোগের তথ্য ও পেমেন্ট স্ট্যাটাস।
                      </p>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        অনুমোদিত: {teacherEnrollments.filter(e => e.status === 'approved').length}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        যাচাইাধীন: {teacherEnrollments.filter(e => e.status === 'pending').length}
                      </span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  {teacherEnrollments.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="শিক্ষার্থীর নাম, মোবাইল নম্বর, কোর্স বা TrxID লিখে খুঁজুন..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] focus:ring-2 focus:ring-pink-100 shadow-xs"
                        />
                        {studentSearch && (
                          <button
                            type="button"
                            onClick={() => setStudentSearch('')}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            ✕ মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Students Table or Empty State */}
                  {teacherEnrollments.length === 0 ? (
                    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
                        <Users className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="text-lg font-black text-slate-900">কোনো শিক্ষার্থী পাওয়া যায়নি</h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          আপনার কোর্সসমূহে এখনো কোনো শিক্ষার্থী এনরোল করেনি। নতুন শিক্ষার্থীরা ভর্তি হলে তাদের সম্পূর্ণ তালিকা, মোবাইল নম্বর এবং ভর্তির তথ্য এখানে দেখতে পাবেন।
                        </p>
                      </div>
                      {teacherCourses.length === 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => { setActiveMenu('courses'); setActiveSubMenu('courses_create'); }}
                            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform inline-flex items-center gap-2 cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>প্রথমে একটি কোর্স তৈরি করুন</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
                            <tr>
                              <th className="p-3.5">শিক্ষার্থীর নাম</th>
                              <th className="p-3.5">মোবাইল নম্বর</th>
                              <th className="p-3.5">কোর্সের নাম</th>
                              <th className="p-3.5">এনরোল তারিখ</th>
                              <th className="p-3.5">পেমেন্ট মেথড</th>
                              <th className="p-3.5">TrxID</th>
                              <th className="p-3.5">পরিমাণ</th>
                              <th className="p-3.5">স্ট্যাটাস</th>
                              <th className="p-3.5 text-right">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTeacherEnrollments.map((e) => (
                              <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-[11px] border border-indigo-200 shrink-0">
                                      {e.studentName ? e.studentName[0] : 'S'}
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-800 block">{e.studentName}</span>
                                      <span className="text-[10px] text-slate-400">আইডি: {e.id.slice(-6)}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 font-mono text-slate-600 font-semibold">
                                  {e.senderPhone || '017XXXXXXXX'}
                                </td>
                                <td className="p-3.5">
                                  <span className="font-bold text-slate-800 line-clamp-1 max-w-[200px]" title={e.courseTitle}>
                                    {e.courseTitle}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                                  {e.enrollmentDate || e.createdAt}
                                </td>
                                <td className="p-3.5 font-semibold text-slate-700">
                                  {e.paymentMethod}
                                </td>
                                <td className="p-3.5 font-mono text-[11px] text-slate-500 font-bold">
                                  {e.trxId}
                                </td>
                                <td className="p-3.5 font-black text-slate-900 whitespace-nowrap">
                                  ৳ {e.amount}
                                </td>
                                <td className="p-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    e.status === 'approved' 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {e.status === 'approved' ? 'ভর্তি নিশ্চিত' : 'যাচাইাধীন'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  {e.status === 'pending' ? (
                                    <button
                                      type="button"
                                      onClick={() => approveEnrollment(e.id)}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                                    >
                                      অনুমোদন করুন
                                    </button>
                                  ) : (
                                    <span className="text-[11px] font-bold text-emerald-600">
                                      ✓ অনুমোদিত
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {filteredTeacherEnrollments.length === 0 && (
                              <tr>
                                <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                                  "{studentSearch}" সম্পর্কিত কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submenu 4: dashboard_sales */}
              {activeSubMenu === 'dashboard_sales' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">কোর্স সেলস ও আর্থিক রিপোর্ট</h3>
                      <p className="text-xs text-slate-500">আপনার কোর্সে অনুমোদিত বিক্রয় ও ফি সংক্রান্ত হিসাব</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-bold block">সর্বমোট বিক্রয়</span>
                      <span className="text-2xl font-black text-emerald-600">৳ {teacherTotalSales.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">শিক্ষার্থী</th>
                          <th className="p-3">কোর্স</th>
                          <th className="p-3">পেমেন্ট মেথড</th>
                          <th className="p-3">TrxID</th>
                          <th className="p-3">পরিমাণ</th>
                          <th className="p-3">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teacherEnrollments.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50/60">
                            <td className="p-3 font-bold text-slate-800">{e.studentName}</td>
                            <td className="p-3 text-slate-600">{e.courseTitle}</td>
                            <td className="p-3">{e.paymentMethod}</td>
                            <td className="p-3 font-mono text-slate-500">{e.trxId}</td>
                            <td className="p-3 font-black text-slate-900">৳ {e.amount}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                e.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {e.status === 'approved' ? 'পরিশোধিত' : 'যাচাই চলছে'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Submenu 5: dashboard_today (আজকের Enrollments — প্রতিদিনের লাইভ ও নতুন দিনের আপডেট) */}
              {activeSubMenu === 'dashboard_today' && (
                <div className="space-y-5">
                  {/* Top Live Banner */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-pink-500/5 to-white p-5 sm:p-6 rounded-3xl border border-amber-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            লাইভ দৈনিক ট্র্যাকার
                          </span>
                          <span className="text-xs font-bold text-slate-500 font-mono">
                            তারিখ: {todayDateStr}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          আজকের Enrollments — {todayFormattedBengali}
                        </h2>
                        <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                          আজকে কোন কোন শিক্ষার্থী আপনার কোন কোন কোর্সে এনরোল করেছে তা এখানে সরাসরি দেখানো হচ্ছে।
                        </p>
                      </div>

                      {/* Today's 3 Quick Metric Boxes */}
                      <div className="grid grid-cols-3 gap-2 shrink-0">
                        <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-xs text-center min-w-[90px]">
                          <span className="text-[10px] font-bold text-slate-500 block">আজকের শিক্ষার্থী</span>
                          <span className="text-lg font-black text-amber-600">{todayEnrollments.length} জন</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 shadow-xs text-center min-w-[90px]">
                          <span className="text-[10px] font-bold text-slate-500 block">আজকের বিক্রয়</span>
                          <span className="text-lg font-black text-emerald-600">৳ {todayTotalSales}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-pink-200/80 shadow-xs text-center min-w-[90px]">
                          <span className="text-[10px] font-bold text-slate-500 block">অনুমোদিত</span>
                          <span className="text-lg font-black text-[#ed347d]">
                            {todayEnrollments.filter(e => e.status === 'approved').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Automatic daily refresh note */}
                    <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/90 border border-amber-200/80 p-3 rounded-2xl">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="leading-snug">
                        <strong>দৈনিক ডায়নামিক আপডেট:</strong> এই ডাটা প্রতিদিনের তারিখ অনুযায়ী স্বয়ংক্রিয়ভাবে আপডেট হয়। প্রতি মধ্যরাতে (রাত ১২টার পর) নতুন দিনের জন্য এই কাউন্টারটি নতুন করে শুরু হবে এবং পূর্বের দিনের সকল শিক্ষার্থী স্থায়ীভাবে <strong>'মোট Student'</strong> ট্যাবে সংরক্ষিত থাকবে।
                      </span>
                    </div>
                  </div>

                  {/* Search Bar for Today's Enrollments */}
                  {todayEnrollments.length > 0 && (
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={todaySearch}
                        onChange={(e) => setTodaySearch(e.target.value)}
                        placeholder="আজকে ভর্তি হওয়া শিক্ষার্থীর নাম, মোবাইল বা কোর্স দিয়ে ফিল্টার করুন..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] focus:ring-2 focus:ring-pink-100 shadow-xs"
                      />
                    </div>
                  )}

                  {/* Today's Table or Empty State */}
                  {todayEnrollments.length === 0 ? (
                    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-sm">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="text-lg font-black text-slate-900">আজকে এখনো কোনো নতুন এনরোলমেন্ট হয়নি</h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          আজকে ({todayFormattedBengali}) নতুন কোনো শিক্ষার্থী আপনার কোনো কোর্সে ভর্তি হলে স্বয়ংক্রিয়ভাবে তার নাম, যোগাযোগের নম্বর ও কোর্সের নাম এই তালিকায় দৃশ্যমান হবে।
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveSubMenu('dashboard_students')}
                          className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>পূর্ববর্তী সকল শিক্ষার্থী দেখুন</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">
                          আজকের তালিকাভুক্ত শিক্ষার্থী ({filteredTodayEnrollments.length} জন)
                        </span>
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          রিয়েল-টাইম সিঙ্ক
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
                            <tr>
                              <th className="p-3.5">শিক্ষার্থীর নাম</th>
                              <th className="p-3.5">মোবাইল</th>
                              <th className="p-3.5">আজকে যে কোর্সে এনরোল করেছে</th>
                              <th className="p-3.5">ভর্তির সময়</th>
                              <th className="p-3.5">পেমেন্ট মেথড ও TrxID</th>
                              <th className="p-3.5">পরিমাণ</th>
                              <th className="p-3.5">স্ট্যাটাস</th>
                              <th className="p-3.5 text-right">পদক্ষেপ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTodayEnrollments.map((e) => (
                              <tr key={e.id} className="hover:bg-amber-50/40 transition-colors">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs border border-amber-200 shrink-0">
                                      {e.studentName ? e.studentName[0] : 'S'}
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-900 block">{e.studentName}</span>
                                      <span className="text-[10px] text-amber-700 font-bold">আজকের শিক্ষার্থী</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 font-mono text-slate-600 font-semibold">
                                  {e.senderPhone || '017XXXXXXXX'}
                                </td>
                                <td className="p-3.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-50 text-[#ed347d] border border-pink-200 text-xs font-black">
                                    <BookOpen className="w-3 h-3 shrink-0" />
                                    <span className="line-clamp-1">{e.courseTitle}</span>
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-500 font-semibold whitespace-nowrap">
                                  {e.createdAt}
                                </td>
                                <td className="p-3.5 text-slate-700">
                                  <div className="font-bold">{e.paymentMethod}</div>
                                  <div className="font-mono text-[10px] text-slate-400 font-semibold">{e.trxId}</div>
                                </td>
                                <td className="p-3.5 font-black text-slate-900 whitespace-nowrap">
                                  ৳ {e.amount}
                                </td>
                                <td className="p-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    e.status === 'approved' 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {e.status === 'approved' ? 'অনুমোদিত' : 'যাচাইাধীন'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  {e.status === 'pending' ? (
                                    <button
                                      type="button"
                                      onClick={() => approveEnrollment(e.id)}
                                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>অনুমোদন</span>
                                    </button>
                                  ) : (
                                    <span className="text-xs font-bold text-emerald-600">
                                      ✓ ভর্তি নিশ্চিত
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submenu: dashboard_exams */}
              {activeSubMenu === 'dashboard_exams' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">আসন্ন ও চলমান পরীক্ষাসমূহ</h3>
                      <p className="text-xs text-slate-500">আপনার কোর্সের সাথে সংযুক্ত সকল মডেল টেস্টের তালিকা</p>
                    </div>
                    <button
                      onClick={() => { setActiveMenu('exams'); setActiveSubMenu('exams_create'); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white ph-btn-pink"
                    >
                      + নতুন এক্সাম যুক্ত করুন
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacherExams.map((ex) => (
                      <div key={ex.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-pink-100 text-[#ed347d] font-bold px-2 py-0.5 rounded-full">
                            {ex.courseTitle}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{ex.durationMinutes} মিনিট</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900">{ex.title}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                          <span>প্রশ্ন: {ex.questionsCount} টি</span>
                          <span>পূর্ণমান: {ex.totalMarks}</span>
                          <span className="text-emerald-600 font-bold">লাইভ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MY COURSES MODULE */}
          {/* ========================================================================= */}
          {activeMenu === 'courses' && (
            <div className="space-y-6 animate-fade-in">
              {/* Filter tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs font-bold">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveSubMenu('courses_all')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeSubMenu === 'courses_all' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Courses ({teacherCourses.length})
                  </button>
                  <button
                    onClick={() => setActiveSubMenu('courses_create')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeSubMenu === 'courses_create' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    + Create New Course
                  </button>
                  <button
                    onClick={() => {
                      setActiveSubMenu('courses_import_json');
                      setShowCourseUploadModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeSubMenu === 'courses_import_json' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>📥 JSON আপলোড ও অটো-সিঙ্ক</span>
                  </button>
                  <button
                    onClick={() => setActiveSubMenu('courses_published')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeSubMenu === 'courses_published' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Published Courses ({teacherCourses.filter(c => !c.isDraft).length})
                  </button>
                  <button
                    onClick={() => setActiveSubMenu('courses_draft')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeSubMenu === 'courses_draft' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Draft Courses ({teacherCourses.filter(c => c.isDraft).length})
                  </button>
                  <button
                    onClick={() => setActiveSubMenu('courses_archived')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      activeSubMenu === 'courses_archived' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Archived Courses (০)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCourseUploadModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-[#00a86b] hover:from-emerald-700 hover:to-teal-700 shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>📥 কোর্স JSON আপলোড (অটো-সিঙ্ক)</span>
                  </button>
                </div>
              </div>

              {/* View: All / Published Courses */}
              {(activeSubMenu === 'courses_all' || activeSubMenu === 'courses_published') && (
                teacherCourses.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                    <BookOpen className="w-12 h-12 text-pink-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">বর্তমানে কোনো কোর্স পাওয়া যায়নি</h3>
                    <p className="text-xs text-slate-500">আপনার পরিচালিত কোনো কোর্স এখনো তৈরি করা হয়নি।</p>
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('courses_create')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink cursor-pointer"
                    >
                      + নতুন কোর্স তৈরি করুন
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherCourses.map((c) => (
                      <div key={c.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <img src={c.coverImage} alt={c.title} className="w-full h-44 object-cover" />
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold bg-[#fff0f5] text-[#ed347d] px-2.5 py-0.5 rounded-full">
                                {c.category}
                              </span>
                              <span className="text-xs font-black text-slate-800">৳ {c.offerPrice}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 line-clamp-1">{c.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                            
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
                              <span>লেকচার: {c.totalLectures}</span>
                              <span>এক্সাম: {c.totalExams}</span>
                              <span className="text-emerald-600">প্রকাশিত</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0 flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => startEditingCourse(c)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>এডিট</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`আপনি কি নিশ্চিত যে "${c.title}" কোর্সটি ডিলিট করতে চান? এর সকল অধ্যায় ও ক্লাস মুছে যাবে।`)) {
                                deleteCourse(c.id);
                                showToast('🗑️ কোর্সটি সফলভাবে মুছে ফেলা হয়েছে!');
                              }
                            }}
                            className="px-2.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
                            title="কোর্স মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>ডিলিট</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCourseForSection(c.id);
                              setSelectedCourseForLec(c.id);
                              setSelectedCourseForSheet(c.id);
                              setActiveMenu('content');
                              setActiveSubMenu('content_lectures');
                            }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white ph-btn-pink text-center cursor-pointer"
                          >
                            কনটেন্ট
                          </button>
                          <Link
                            href={`/courses/${c.id}`}
                            target="_blank"
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#ed347d]" />
                            <span>স্টুডেন্ট ভিউ</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* View: JSON Import & Auto-Sync Landing */}
              {activeSubMenu === 'courses_import_json' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-gradient-to-br from-white via-pink-50/20 to-purple-50/30 p-8 sm:p-10 rounded-3xl border border-pink-200/80 shadow-xs text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#fa507e] to-[#ec376d] text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    
                    <div className="max-w-xl mx-auto space-y-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        কোর্স JSON আপলোড ও অটো-সিঙ্ক সিস্টেম
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        ACS বা যেকোনো প্ল্যাটফর্ম থেকে সংগৃহীত JSON ফাইল সরাসরি ড্র্যাগ ও ড্রপ করে ওয়েবসাইটে নতুন কোর্স যোগ করুন অথবা চলমান কোর্সে নতুন ক্লাস ও শিট স্বয়ংক্রিয়ভাবে আপডেট করুন।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">১</div>
                        <h4 className="text-xs font-bold text-slate-800">অটো-ডুপ্লিকেট প্রতিরোধ</h4>
                        <p className="text-[11px] text-slate-500">পুরোনো কোনো ক্লাস ডুপ্লিকেট হবে না। আইডি মিলিয়ে নিখুঁত ইনক্রিমেন্টাল মার্জ হবে।</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs">২</div>
                        <h4 className="text-xs font-bold text-slate-800">সব ভিডিও সাপোর্ট</h4>
                        <p className="text-[11px] text-slate-500">BunnyCDN এনক্রিপ্টেড প্লেয়ার এবং YouTube এম্বেড ভিডিও নিজে থেকেই চলবে।</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                        <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-black text-xs">৩</div>
                        <h4 className="text-xs font-bold text-slate-800">Drive PDF শিট সিঙ্ক</h4>
                        <p className="text-[11px] text-slate-500">লেকচার শিট, প্র্যাকটিস শিট ও অন্যান্য রিসোর্স স্বয়ংক্রিয়ভাবে সাজানো থাকবে।</p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCourseUploadModal(true)}
                        className="px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-[#fa507e] to-[#ec376d] hover:from-[#fa3e71] hover:to-[#db275d] shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
                      >
                        <UploadCloud className="w-5 h-5" />
                        <span>জেসন ফাইল আপলোড ও সিঙ্ক শুরু করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('courses_all')}
                        className="px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        সকল কোর্স দেখুন
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View: Create New Course (Multi-Step Course Creation Wizard) */}
              {activeSubMenu === 'courses_create' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Wizard Header */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#fff0f5] text-[#ed347d] border border-pink-200">
                          ধাপ {wizardStep} / ৭
                        </span>
                        {editingCourseId && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-amber-600" />
                            কোর্স এডিট মোড
                          </span>
                        )}
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                          {editingCourseId ? 'কোর্স সংশোধন ও আপডেট উইজার্ড' : 'নতুন কোর্স ক্রিয়েটর উইজার্ড'}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingCourseId
                          ? 'কোর্সের যেকোনো তথ্য পরিবর্তন করে ৭ম ধাপে গিয়ে আপডেট সংরক্ষণ করুন।'
                          : 'ধাপে ধাপে তথ্য দিয়ে কোর্স কার্ড ও ডিটেইলস পেজের যাবতীয় ফিচার সম্পূর্ণ করুন।'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {editingCourseId && (
                        <button
                          type="button"
                          onClick={cancelEditingCourse}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          এডিট বাতিল
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePublishWizardCourse(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        {editingCourseId ? 'খসড়া আপডেট' : 'খসড়া (Draft) সেভ'}
                      </button>
                    </div>
                  </div>

                  {/* 7-Step Capsule Progress Stepper */}
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-1.5 min-w-[700px]">
                      {[
                        { num: 1, title: '১. কার্ড পরিচিতি', icon: BookOpen },
                        { num: 2, title: '২. মূল্য ও সময়', icon: DollarSign },
                        { num: 3, title: '৩. ক্লাস ও শিট', icon: Award },
                        { num: 4, title: '৪. ট্রেইলার ভিডিও', icon: Video },
                        { num: 5, title: '৫. মেন্টর টিম', icon: Users },
                        { num: 6, title: '৬. সিলেবাস ও FAQ', icon: FileText },
                        { num: 7, title: '৭. প্রিভিউ ও পাবলিশ', icon: Sparkles },
                      ].map((step) => {
                        const Icon = step.icon;
                        const isActive = wizardStep === step.num;
                        const isDone = wizardStep > step.num;

                        return (
                          <button
                            key={step.num}
                            type="button"
                            onClick={() => setWizardStep(step.num)}
                            className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                              isActive
                                ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{step.title}</span>
                            {isDone && <Check className="w-3 h-3 stroke-[3] ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* STEP 1: BASIC INFORMATION & COURSE CARD */}
                  {/* ================================================================= */}
                  {wizardStep === 1 && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-[#ed347d]" />
                          <span>ধাপ ১: কোর্সের নাম, ক্যাটাগরি ও থাম্বনেইল (Course Card)</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          হোমপেজে ও কোর্স তালিকায় শিক্ষার্থীরা যেভাবে কার্ডটি দেখতে পাবে।
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-slate-700 block">
                            কোর্সের পূর্ণ শিরোনাম *
                          </label>
                          <input
                            type="text"
                            required
                            value={wTitle}
                            onChange={(e) => setWTitle(e.target.value)}
                            placeholder="যেমন: উচ্চতর পদার্থবিজ্ঞান ১ম পত্র — স্পেশাল এডমিশন ২০২৬"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] focus:ring-2 focus:ring-pink-100 shadow-xs font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">ক্যাটাগরি</label>
                            <select
                              value={wCategory}
                              onChange={(e: any) => setWCategory(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            >
                              <option value="Engineering">ভার্সিটি ও ইঞ্জিনিয়ারিং</option>
                              <option value="Medical">মেডিকেল এডমিশন</option>
                              <option value="Agri Admission">কৃষি গুচ্ছ</option>
                              <option value="HSC">HSC একাডেমিক</option>
                              <option value="Free Tests">ফ্রি স্পেশাল টেস্ট</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">ব্যাচ / সেশন</label>
                            <input
                              type="text"
                              value={wBatch}
                              onChange={(e) => setWBatch(e.target.value)}
                              placeholder="Campus 7.0 Batch"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">লেভেল / ট্যাগ</label>
                            <input
                              type="text"
                              value={wLevel}
                              onChange={(e) => setWLevel(e.target.value)}
                              placeholder="উচ্চ মাধ্যমিক ও এডমিশন"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            সংক্ষিপ্ত পরিচিতি ও ট্যাগলাইন *
                          </label>
                          <textarea
                            rows={2}
                            value={wTagline}
                            onChange={(e) => setWTagline(e.target.value)}
                            placeholder="সহজ ও কার্যকরী উপায়ে বিষয় আয়ত্ত করুন এবং ভর্তি পরীক্ষায় সেরা ফলাফল নিশ্চিত করুন।"
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>

                        {/* Thumbnail / Cover Image with Presets */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="text-xs font-bold text-slate-700 block">
                            কোর্স থাম্বনেইল / কভার ইমেজ লিংক (URL)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={wCoverImage}
                              onChange={(e) => setWCoverImage(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>

                          {/* Quick Preset Selector */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-500 block">অথবা প্রিসেট থাম্বনেইল থেকে বেছে নিন:</span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {[
                                { name: 'ইঞ্জিনিয়ারিং', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
                                { name: 'পদার্থবিজ্ঞান', url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80' },
                                { name: 'মেডিকেল', url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80' },
                                { name: 'গণিত ও বিজ্ঞান', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80' },
                                { name: 'পরীক্ষা প্রস্তুতি', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80' },
                              ].map((preset, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setWCoverImage(preset.url)}
                                  className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer group ${
                                    wCoverImage === preset.url ? 'border-[#ed347d] ring-2 ring-pink-100 bg-[#fff0f5]' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                                  }`}
                                >
                                  <img src={preset.url} alt={preset.name} className="w-full h-14 rounded-lg object-cover mb-1" />
                                  <span className="text-[10px] font-bold text-slate-700 block truncate">{preset.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            if (!wTitle.trim()) {
                              showToast('দয়া করে কোর্সের নাম লিখুন');
                              return;
                            }
                            setWizardStep(2);
                          }}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
                        >
                          <span>পরবর্তী: মূল্য ও ভর্তি কাউন্টডাউন</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* STEP 2: PRICING & COUNTDOWN */}
                  {/* ================================================================= */}
                  {wizardStep === 2 && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <span>ধাপ ২: কোর্সের মূল্য, ছাড় ও ভর্তি শেষ হওয়ার কাউন্টডাউন</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          কোর্স ফি, অফার মূল্য এবং কোর্স ডিটেইলস পেজের জরুরি কাউন্টডাউন টাইমার নির্ধারণ করুন।
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">নিয়মিত মূল্য / Regular Price (৳)</label>
                            <input
                              type="number"
                              value={wRegularPrice}
                              onChange={(e) => setWRegularPrice(Number(e.target.value))}
                              placeholder="3500"
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">অফার মূল্য / Offer Price (৳)</label>
                            <input
                              type="number"
                              value={wOfferPrice}
                              onChange={(e) => setWOfferPrice(Number(e.target.value))}
                              placeholder="2450"
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>
                        </div>

                        {/* Calculated Discount Pill */}
                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between">
                          <span className="font-bold text-emerald-800">স্বয়ংক্রিয় ডিসকাউন্ট রেট:</span>
                          <span className="font-black text-emerald-600 bg-white px-2.5 py-1 rounded-xl shadow-xs">
                            {wRegularPrice > wOfferPrice ? Math.round(((wRegularPrice - wOfferPrice) / wRegularPrice) * 100) : 0}% বিশেষ ছাড়
                          </span>
                        </div>

                        {/* Coupon Code Settings */}
                        <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-200/80 space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#ed347d]">
                            <Tag className="w-4 h-4" />
                            <span>কুপন কোড ও প্রমোশন</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">কুপন কোড</label>
                              <input
                                type="text"
                                value={wCouponCode}
                                onChange={(e) => setWCouponCode(e.target.value.toUpperCase())}
                                placeholder="ADOMMO200"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">কুপন ছাড়ের পরিমাণ (৳)</label>
                              <input
                                type="number"
                                value={wCouponDiscount}
                                onChange={(e) => setWCouponDiscount(Number(e.target.value))}
                                placeholder="200"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Admission Timer Settings */}
                        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-pink-400">ভর্তি শেষ হতে বাকি (কাউন্টডাউন টাইমার)</span>
                            <span className="text-[10px] text-slate-400">কোর্স ডিটেইলস পেজের লাইভ টাইমার</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">বাকি দিন (Days)</label>
                              <input
                                type="number"
                                value={wCountdownDays}
                                onChange={(e) => setWCountdownDays(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">বাকি ঘণ্টা (Hours)</label>
                              <input
                                type="number"
                                value={wCountdownHours}
                                onChange={(e) => setWCountdownHours(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>পূর্ববর্তী</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
                        >
                          <span>পরবর্তী: ক্লাস সংখ্যা ও ফিচার</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* STEP 3: CLASS NUMBERS, FEATURES & ROUTINE */}
                  {/* ================================================================= */}
                  {wizardStep === 3 && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <Award className="w-5 h-5 text-indigo-600" />
                          <span>ধাপ ৩: ক্লাস সংখ্যা, ওএমআর এক্সাম, শিট ও ফিচার তালিকা</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          কোর্স ডিটেইলস পেজের ৪টি মূল হাইলাইট কার্ড এবং 'এই কোর্সের ভেতরে যা যা রয়েছে' সেকশন।
                        </p>
                      </div>

                      <div className="space-y-5">
                        {/* 3 Metric Counts */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
                            <span className="text-[11px] font-bold text-blue-700 block">ফুল এইচডি ক্লাস সংখ্যা</span>
                            <input
                              type="number"
                              value={wTotalLectures}
                              onChange={(e) => setWTotalLectures(Number(e.target.value))}
                              placeholder="75"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-black text-slate-900"
                            />
                            <span className="text-[10px] text-blue-600 font-semibold block">যেমন: ৭৫+ টি ফুল এইচডি ক্লাস</span>
                          </div>

                          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                            <span className="text-[11px] font-bold text-emerald-700 block">ওএমআর এক্সাম সংখ্যা</span>
                            <input
                              type="number"
                              value={wTotalExams}
                              onChange={(e) => setWTotalExams(Number(e.target.value))}
                              placeholder="30"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-black text-slate-900"
                            />
                            <span className="text-[10px] text-emerald-600 font-semibold block">যেমন: ৩০+ টি ওএমআর এক্সাম</span>
                          </div>

                          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                            <span className="text-[11px] font-bold text-purple-700 block">লেকচার শিট PDF সংখ্যা</span>
                            <input
                              type="number"
                              value={wTotalSheets}
                              onChange={(e) => setWTotalSheets(Number(e.target.value))}
                              placeholder="50"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-black text-slate-900"
                            />
                            <span className="text-[10px] text-purple-600 font-semibold block">যেমন: ৫০+ টি লেকচার শিট</span>
                          </div>
                        </div>

                        {/* Routine Download Button configuration */}
                        <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-2.5">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-900">ক্লাস রুটিন PDF ডাউনলোড বাটন</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={wRoutineTitle}
                              onChange={(e) => setWRoutineTitle(e.target.value)}
                              placeholder="রুটিন শিরোনাম (যেমন: অদম্য ক্লাস ও এক্সাম রুটিন PDF)"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            />
                            <input
                              type="text"
                              value={wRoutinePdfUrl}
                              onChange={(e) => setWRoutinePdfUrl(e.target.value)}
                              placeholder="পিডিএফ ডাউনলোড লিংক (URL)"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Features Checklist (এই কোর্সের ভেতরে যা যা রয়েছে) */}
                        <div className="space-y-2.5">
                          <label className="text-xs font-black text-slate-900 block">
                            এই কোর্সের ভেতরে যা যা রয়েছে (সবুজ টিকচিহ্নিত ফিচার তালিকা):
                          </label>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newFeatureInput}
                              onChange={(e) => setNewFeatureInput(e.target.value)}
                              placeholder="যেমন: মূল ভর্তি পরীক্ষা অনুরূপ নেগেটিভ মার্কিং এক্সাম সিস্টেম..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newFeatureInput.trim()) {
                                    setWFeatures([...wFeatures, newFeatureInput.trim()]);
                                    setNewFeatureInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newFeatureInput.trim()) {
                                  setWFeatures([...wFeatures, newFeatureInput.trim()]);
                                  setNewFeatureInput('');
                                }
                              }}
                              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              + যোগ করুন
                            </button>
                          </div>

                          <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar p-1">
                            {wFeatures.map((feat, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 group hover:bg-white transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                                    ✓
                                  </span>
                                  <span>{feat}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setWFeatures(wFeatures.filter((_, idx) => idx !== fIdx))}
                                  className="text-slate-400 hover:text-rose-500 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                                  title="মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>পূর্ববর্তী</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
                        >
                          <span>পরবর্তী: ট্রেইলার ও গাইডলাইন ভিডিও</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* STEP 4: MEDIA, TRAILER & GUIDELINE VIDEOS */}
                  {/* ================================================================= */}
                  {wizardStep === 4 && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-600" />
                          <span>ধাপ ৪: কোর্স ট্রেইলার, ডেমো ক্লাস ও সম্পর্কিত ভিডিও</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          ইউটিউব বা ভিডিও লিংক দিয়ে কোর্স ডিটেইলস পেজের ট্রেইলার প্লেয়ার ও গাইডলাইন সেশনস সাজান।
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-slate-700 block">
                            কোর্স ট্রেইলার ভিডিও লিংক (YouTube / MP4 URL)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={wTrailerUrl}
                              onChange={(e) => setWTrailerUrl(e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            শিক্ষার্থীরা কোর্স পেজে বড় প্লে বাটনে ক্লিক করলে এই ট্রেইলারটি প্লে হবে।
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            ফ্রি ডেমো ক্লাস লিংক (ঐচ্ছিক)
                          </label>
                          <input
                            type="text"
                            value={wDemoClassUrl}
                            onChange={(e) => setWDemoClassUrl(e.target.value)}
                            placeholder="https://commondatastorage.googleapis.com/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>

                        {/* Guideline / Related Videos */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          <label className="text-xs font-black text-slate-900 block">
                            কোর্স সম্পর্কিত ভিডিও ও গাইডলাইন (Roadmap & Guideline Videos):
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                value={newRvTitle}
                                onChange={(e) => setNewRvTitle(e.target.value)}
                                placeholder="ভিডিও শিরোনাম (উদা: ক্যাম্পাস ৭.০ সফলতার রোডম্যাপ)"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={newRvDuration}
                                onChange={(e) => setNewRvDuration(e.target.value)}
                                placeholder="সময়কাল (যেমন: ৩০ মিনিট)"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (newRvTitle.trim()) {
                                  setWRelatedVideos([
                                    ...wRelatedVideos,
                                    { title: newRvTitle.trim(), duration: newRvDuration || '২৫ মিনিট', tag: newRvTag, url: '' }
                                  ]);
                                  setNewRvTitle('');
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-[#ed347d] text-white font-bold text-xs hover:bg-pink-600 transition-colors cursor-pointer"
                            >
                              + ভিডিও যুক্ত করুন
                            </button>
                          </div>

                          <div className="space-y-2">
                            {wRelatedVideos.map((rv, rvIdx) => (
                              <div
                                key={rvIdx}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <Video className="w-4 h-4 text-purple-600 shrink-0" />
                                  <span className="font-bold text-slate-800">{rv.title}</span>
                                  <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-medium text-slate-500">
                                    {rv.duration}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setWRelatedVideos(wRelatedVideos.filter((_, idx) => idx !== rvIdx))}
                                  className="text-slate-400 hover:text-rose-500 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>পূর্ববর্তী</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(5)}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
                        >
                          <span>পরবর্তী: মেন্টর ও ফ্যাকাল্টি প্যানেল</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* STEP 5: MENTORS & FACULTY TEAM */}
                  {/* ================================================================= */}
                  {wizardStep === 5 && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span>ধাপ ৫: আমাদের মেন্টর ও ফ্যাকাল্টি টিম</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          কোর্স ডিটেইলস পেজের 'আমাদের মেন্টর' সেকশনে প্রদর্শিত শিক্ষক ও ফ্যাকাল্টির তালিকা।
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Current Mentors Grid */}
                        <div className="space-y-2">
                          <span className="text-xs font-black text-slate-800 block">বর্তমান মেন্টর তালিকা:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {wMentors.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 truncate">
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-pink-300 shrink-0"
                                  />
                                  <div className="truncate text-xs">
                                    <h4 className="font-bold text-slate-900 truncate">{m.name}</h4>
                                    <p className="text-[#ed347d] font-semibold text-[11px] truncate">{m.role}</p>
                                    <p className="text-slate-500 text-[10px] truncate">{m.institution}</p>
                                  </div>
                                </div>
                                {wMentors.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setWMentors(wMentors.filter((_, idx) => idx !== mIdx))}
                                    className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add New Mentor Box */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                          <span className="text-xs font-black text-slate-800 block">+ অতিরিক্ত শিক্ষক / মেন্টর যুক্ত করুন</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <input
                              type="text"
                              value={newMentorName}
                              onChange={(e) => setNewMentorName(e.target.value)}
                              placeholder="শিক্ষকের নাম"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={newMentorRole}
                              onChange={(e) => setNewMentorRole(e.target.value)}
                              placeholder="পদবি (উদা: কেমিস্ট্রি লিড মেন্টর)"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                            />
                            <input
                              type="text"
                              value={newMentorInst}
                              onChange={(e) => setNewMentorInst(e.target.value)}
                              placeholder="প্রতিষ্ঠান (উদা: ঢাকা বিশ্ববিদ্যালয়)"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMentorAvatar}
                              onChange={(e) => setNewMentorAvatar(e.target.value)}
                              placeholder="প্রোফাইল ছবির লিংক (URL)"
                              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newMentorName.trim()) {
                                  setWMentors([
                                    ...wMentors,
                                    {
                                      name: newMentorName.trim(),
                                      role: newMentorRole.trim() || 'মেন্টর',
                                      institution: newMentorInst.trim() || 'বুয়েট ফ্যাকাল্টি',
                                      avatar: newMentorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                                    }
                                  ]);
                                  setNewMentorName('');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              + মেন্টর যোগ করুন
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>পূর্ববর্তী</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(6)}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
                        >
                          <span>পরবর্তী: সিলেবাস, বিবরণ ও FAQ</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* STEP 6: DESCRIPTION, SYLLABUS, FAQ & COMBOS */}
                  {/* ================================================================= */}
                  {wizardStep === 6 && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-300">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-amber-600" />
                          <span>ধাপ ৬: কোর্সের পূর্ণ বিবরণ, সিলেবাস চ্যাপ্টার ও সাধারণ জিজ্ঞাসা (FAQ)</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          কোর্সের সিলেবাসের অধ্যায়সমূহ, বিস্তারিত বিবরণ এবং প্রশ্নোত্তর তৈরি করুন।
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">কোর্সের পূর্ণাঙ্গ বিবরণ *</label>
                          <textarea
                            rows={3}
                            value={wDescription}
                            onChange={(e) => setWDescription(e.target.value)}
                            placeholder="কোর্সটির বিষয়বস্তু, সিলেবাস কভারেজ, পরীক্ষার নিয়মাবলী বিস্তারিত লিখুন..."
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>

                        {/* Initial Syllabus Chapter Modules */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="text-xs font-black text-slate-800 block">সিলেবাসের প্রাথমিক অধ্যায় / চ্যাপ্টার তালিকা:</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newModuleInput}
                              onChange={(e) => setNewModuleInput(e.target.value)}
                              placeholder="যেমন: অধ্যায় ০৪: কাজ, ক্ষমতা ও শক্তি..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newModuleInput.trim()) {
                                    setWSyllabusModules([...wSyllabusModules, newModuleInput.trim()]);
                                    setNewModuleInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newModuleInput.trim()) {
                                  setWSyllabusModules([...wSyllabusModules, newModuleInput.trim()]);
                                  setNewModuleInput('');
                                }
                              }}
                              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                            >
                              + অধ্যায় যোগ
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {wSyllabusModules.map((mod, mIdx) => (
                              <div
                                key={mIdx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                              >
                                <span className="font-semibold">{mod}</span>
                                <button
                                  type="button"
                                  onClick={() => setWSyllabusModules(wSyllabusModules.filter((_, idx) => idx !== mIdx))}
                                  className="text-slate-400 hover:text-rose-500 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="text-xs font-black text-slate-800 block">সাধারণ জিজ্ঞাসা (FAQ):</label>
                          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <input
                              type="text"
                              value={newFaqQ}
                              onChange={(e) => setNewFaqQ(e.target.value)}
                              placeholder="প্রশ্ন লিখুন (উদা: ক্লাস কি মোবাইলে দেখা যাবে?)"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            />
                            <textarea
                              rows={2}
                              value={newFaqA}
                              onChange={(e) => setNewFaqA(e.target.value)}
                              placeholder="উত্তর লিখুন..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newFaqQ.trim() && newFaqA.trim()) {
                                  setWFaq([...wFaq, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
                                  setNewFaqQ('');
                                  setNewFaqA('');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-[#ed347d] text-white font-bold text-xs cursor-pointer"
                            >
                              + FAQ যোগ করুন
                            </button>
                          </div>

                          <div className="space-y-2">
                            {wFaq.map((item, fIdx) => (
                              <div
                                key={fIdx}
                                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{item.question}</span>
                                  <button
                                    type="button"
                                    onClick={() => setWFaq(wFaq.filter((_, idx) => idx !== fIdx))}
                                    className="text-slate-400 hover:text-rose-500 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-slate-500 text-[11px] leading-relaxed">{item.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Combo Courses */}
                        {courses.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <label className="text-xs font-black text-slate-800 block">
                              কম্বো ও সম্পর্কিত কোর্স (শিক্ষার্থীদের সাজেস্ট করতে নির্বাচন করুন):
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {courses.map((c) => {
                                const isSelected = wComboIds.includes(c.id);
                                return (
                                  <div
                                    key={c.id}
                                    onClick={() => {
                                      if (isSelected) {
                                        setWComboIds(wComboIds.filter(id => id !== c.id));
                                      } else {
                                        setWComboIds([...wComboIds, c.id]);
                                      }
                                    }}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                      isSelected ? 'border-[#ed347d] bg-pink-50/60' : 'border-slate-200 bg-white hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate text-xs">
                                      <img src={c.coverImage} alt={c.title} className="w-8 h-8 rounded-lg object-cover" />
                                      <span className="font-bold text-slate-800 truncate">{c.title}</span>
                                    </div>
                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                      isSelected ? 'bg-[#ed347d] border-[#ed347d] text-white font-bold' : 'border-slate-300'
                                    }`}>
                                      {isSelected && '✓'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWizardStep(5)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>পূর্ববর্তী</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(7)}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
                        >
                          <span>পরবর্তী: চূড়ান্ত প্রিভিউ ও পাবলিশ</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* STEP 7: REVIEW, LIVE CARD PREVIEW & FINAL PUBLISH */}
                  {/* ================================================================= */}
                  {wizardStep === 7 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Live Card Preview Box */}
                      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                              লাইভ কার্ড প্রিভিউ
                            </span>
                            <h3 className="text-base font-black text-slate-900 mt-1">
                              শিক্ষার্থীরা যেভাবে আপনার কোর্স কার্ডটি দেখবে
                            </h3>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            রেডি টু পাবলিশ
                          </span>
                        </div>

                        {/* Student Course Card Exact Mockup */}
                        <div className="max-w-sm mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden group hover:border-pink-300 transition-all">
                          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={wCoverImage}
                              alt={wTitle || 'Course Title'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/95 text-[#ed347d] shadow-sm">
                                {wCategory}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white shadow-sm">
                                {wBatch}
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                              <span className="text-[11px] font-extrabold flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-pink-400" />
                                <span>০ জন শিক্ষার্থী</span>
                              </span>
                              <span className="text-xs font-black bg-[#ed347d] px-2.5 py-0.5 rounded-full shadow-xs">
                                ৳ {wOfferPrice}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                              {wTitle || 'কোর্সের শিরোনাম এখানে প্রদর্শিত হবে'}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {wTagline}
                            </p>

                            <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 text-center">
                              <div>{wTotalLectures} ক্লাস</div>
                              <div>{wTotalExams} এক্সাম</div>
                              <div>{wTotalSheets} শিট</div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-black text-slate-900">৳ {wOfferPrice}</span>
                                {wRegularPrice > wOfferPrice && (
                                  <del className="text-xs text-slate-400 font-bold">৳ {wRegularPrice}</del>
                                )}
                              </div>
                              <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-white ph-btn-pink">
                                বিস্তারিত দেখুন
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Course Details Summary Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                            <span className="text-slate-400 text-[10px] block">ট্রেইলার লিংক</span>
                            <span className="font-bold text-slate-800 truncate block">{wTrailerUrl ? '✓ সংযুক্ত' : 'কোনো ট্রেইলার নেই'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                            <span className="text-slate-400 text-[10px] block">মেন্টর সংখ্যা</span>
                            <span className="font-bold text-slate-800 block">{wMentors.length} জন শিক্ষক</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                            <span className="text-slate-400 text-[10px] block">ফিচার সংখ্যা</span>
                            <span className="font-bold text-slate-800 block">{wFeatures.length} টি সুবিধা</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                            <span className="text-slate-400 text-[10px] block">কাউন্টডাউন</span>
                            <span className="font-bold text-slate-800 block">{wCountdownDays} দিন {wCountdownHours} ঘণ্টা</span>
                          </div>
                        </div>
                      </div>

                      {/* Final Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setWizardStep(6)}
                          className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>তথ্য সংশোধন করুন</span>
                        </button>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handlePublishWizardCourse(true)}
                            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            {editingCourseId ? 'খসড়া (Draft) আপডেট' : 'খসড়া (Draft) হিসেবে সেভ'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePublishWizardCourse(false)}
                            className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>{editingCourseId ? '💾 সংশোধিত কোর্সটি সেভ ও পাবলিশ করুন' : '🚀 সম্পূর্ণ কোর্সটি এখনই পাবলিশ করুন'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View: Draft Courses */}
              {activeSubMenu === 'courses_draft' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">ড্রাফট কোর্সসমূহ (Draft Courses)</h3>
                      <p className="text-xs text-slate-500">যেসব কোর্স এখনো শিক্ষার্থীদের জন্য উন্মুক্ত করা হয়নি</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('courses_create')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white ph-btn-pink"
                    >
                      + নতুন কোর্স
                    </button>
                  </div>

                  {teacherCourses.filter(c => c.isDraft).length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">বর্তমানে কোনো ড্রাফট কোর্স নেই।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {teacherCourses.filter(c => c.isDraft).map((c) => (
                        <div key={c.id} className="bg-white rounded-3xl border border-amber-200 overflow-hidden shadow-xs">
                          <img src={c.coverImage} alt={c.title} className="w-full h-44 object-cover opacity-80" />
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                                খসড়া (Draft)
                              </span>
                              <span className="text-xs font-black text-slate-800">৳ {c.offerPrice}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 line-clamp-1">{c.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                            <div className="pt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditingCourse(c)}
                                className="flex-1 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>এডিট ও পাবলিশ</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`আপনি কি নিশ্চিত যে "${c.title}" ড্রাফট কোর্সটি মুছে ফেলতে চান?`)) {
                                    deleteCourse(c.id);
                                    showToast('🗑️ ড্রাফট কোর্সটি মুছে ফেলা হয়েছে!');
                                  }
                                }}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                title="কোর্স মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View: Archived Courses */}
              {activeSubMenu === 'courses_archived' && (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">এই বিভাগে বর্তমানে কোনো আর্কাইভড কোর্স নেই।</p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. COURSE CONTENT MODULE (Sections / Chapters, Lectures, Video Classes, PDF Sheets) */}
          {/* ========================================================================= */}
          {activeMenu === 'content' && (
            <div className="space-y-6 animate-fade-in">
              {/* Submenu Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    const activeCId = selectedCourseForSection || selectedCourseForLec || selectedCourseForSheet;
                    if (activeCId) handleSelectCourse(activeCId);
                    setActiveSubMenu('content_sections');
                  }}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeSubMenu === 'content_sections' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Sections / Chapters (বিষয় ও অধ্যায়)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const activeCId = selectedCourseForSection || selectedCourseForLec || selectedCourseForSheet;
                    if (activeCId) handleSelectCourse(activeCId);
                    setActiveSubMenu('content_lectures');
                  }}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeSubMenu === 'content_lectures' || activeSubMenu === 'content_videos' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Lectures & Videos (ক্লাস ভিডিও)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const activeCId = selectedCourseForSection || selectedCourseForSheet || selectedCourseForLec;
                    if (activeCId) handleSelectCourse(activeCId);
                    setActiveSubMenu('content_sheets');
                  }}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activeSubMenu === 'content_sheets' ? 'bg-[#ed347d] text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF / Notes / Sheets</span>
                </button>
              </div>

              {/* View 1: SECTIONS / CHAPTERS / MODULES & ARCHIVE BUILDER */}
              {activeSubMenu === 'content_sections' && (() => {
                // If NO course is selected yet -> Display Course Cards Grid
                if (!selectedCourseForSection) {
                  return (
                    <div className="space-y-6">
                      {/* Top Header */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-[#ed347d]">
                              কারিকুলাম ও সিলেবাস ম্যানেজমেন্ট
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                              {teacherCourses.length} টি কোর্স
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-black text-slate-900">
                            যে কোর্সের বিষয় বা অধ্যায় সাজাতে চান সেটি নির্বাচন করুন
                          </h2>
                          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                            কোর্স কার্ডে ক্লিক করলে ঐ কোর্সের সকল বিষয় (Subject), অধ্যায় (Chapter) ও বিগত ব্যাচের আর্কাইভ সেকশন গোছানোভাবে যোগ ও এডিট করতে পারবেন।
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu('courses');
                            setActiveSubMenu('courses_create');
                          }}
                          className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white ph-btn-pink shrink-0 shadow-md shadow-pink-500/20 hover:scale-[1.02] transition-transform cursor-pointer flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>+ নতুন কোর্স তৈরি করুন</span>
                        </button>
                      </div>

                      {/* Course Cards Grid */}
                      {teacherCourses.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                          <BookOpen className="w-12 h-12 text-pink-300 mx-auto" />
                          <h3 className="text-base font-bold text-slate-800">কোনো কোর্স পাওয়া যায়নি</h3>
                          <p className="text-xs text-slate-500">কারিকুলাম সাজানোর আগে অনুগ্রহ করে একটি কোর্স তৈরি করুন।</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {teacherCourses.map((c) => {
                            const secCount = c.sections?.length || 0;
                            const modCount = c.modules?.length || 0;
                            const lecCount = c.totalLectures || (c.modules?.reduce((sum, m) => sum + (m.lectures?.length || 0), 0) || 0);

                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  handleSelectCourse(c.id);
                                }}
                                className="group bg-white rounded-3xl border border-slate-200/90 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                              >
                                <div>
                                  {/* Course Cover Image Banner */}
                                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                                    <img
                                      src={c.coverImage}
                                      alt={c.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/95 text-[#ed347d] shadow-sm">
                                        {c.category}
                                      </span>
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white shadow-sm">
                                        {c.batch}
                                      </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                                      <span className="text-[11px] font-bold flex items-center gap-1">
                                        <Layers className="w-3.5 h-3.5 text-pink-400" />
                                        <span>{secCount > 0 ? `${secCount} টি বিষয়/মডিউল` : `${modCount} টি অধ্যায়`}</span>
                                      </span>
                                      <span className="text-xs font-black bg-[#ed347d] px-2.5 py-0.5 rounded-full">
                                        ৳ {c.offerPrice}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Card Body */}
                                  <div className="p-5 space-y-3">
                                    <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#ed347d] transition-colors">
                                      {c.title}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                      {c.tagline || c.description || 'কোর্সের বিস্তারিত সিলেবাস ও ক্লাস সাজাতে ক্লিক করুন।'}
                                    </p>

                                    {/* Mini Metrics Badge Row */}
                                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                      <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">বিষয়/মডিউল</span>
                                        <span className="text-xs font-black text-slate-800">{secCount}</span>
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">অধ্যায়</span>
                                        <span className="text-xs font-black text-indigo-600">{modCount}</span>
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">ক্লাস</span>
                                        <span className="text-xs font-black text-emerald-600">{lecCount}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-5 pt-0">
                                  <button
                                    type="button"
                                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white ph-btn-pink flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all"
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>বিষয় ও অধ্যায় সাজান</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // If a Course IS SELECTED -> Show the Clean Dedicated Workspace for that Course
                const targetCourse = courses.find((c) => c.id === selectedCourseForSection) || teacherCourses[0] || courses[0];
                const sectionsList = targetCourse?.sections || [];
                const modulesList = targetCourse?.modules || [];
                const regularSections = sectionsList.filter((s) => !s.isArchive && s.type !== 'archive' && !s.parentArchiveId);
                const archiveSections = sectionsList.filter((s) => (s.isArchive || s.type === 'archive') && !s.parentArchiveId);
                const unassignedModules = modulesList.filter((m) => !m.parentSectionId && !m.parentArchiveId);

                return (
                  <div className="space-y-6">
                    {/* Back to Course Cards & Course Summary Header */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                      {/* Top bar with back button & quick course switcher */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedCourseForSection(null)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors w-fit cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4 text-[#ed347d]" />
                            <span>কোর্সের তালিকায় ফিরুন</span>
                          </button>

                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                            <span className="text-[11px] font-bold text-slate-500">কোর্স পরিবর্তন:</span>
                            <select
                              value={targetCourse.id}
                              onChange={(e) => handleSelectCourse(e.target.value)}
                              className="text-xs font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer max-w-[260px] truncate"
                            >
                              {teacherCourses.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title} [{c.batch || c.category}]
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetArchiveIdForSubject('');
                              setNewSectionType('subject');
                              setNewSectionIsArchive(false);
                              setShowAddSectionModal(true);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md shadow-pink-500/20 hover:scale-[1.02] transition-transform cursor-pointer flex items-center gap-1.5"
                          >
                            <FolderPlus className="w-4 h-4" />
                            <span>+ নতুন বিষয় / মডিউল</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetArchiveIdForSubject('');
                              setNewSectionType('archive');
                              setNewSectionIsArchive(true);
                              setShowAddSectionModal(true);
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Archive className="w-4 h-4 text-amber-700" />
                            <span>+ আর্কাইভ সেকশন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearAllCurriculum(targetCourse.id)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                            title="এই কোর্সের সমস্ত বিষয়, অধ্যায় ও ক্লাস এক ক্লিকে মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>সব ক্লিয়ার করুন</span>
                          </button>
                        </div>
                      </div>

                      {/* Active Course Banner */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={targetCourse.coverImage}
                            alt={targetCourse.title}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#fff0f5] text-[#ed347d] border border-pink-200">
                                {targetCourse.category}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                {targetCourse.batch}
                              </span>
                              <span className="text-xs text-slate-400 font-bold">
                                • {sectionsList.length} টি বিষয় • {modulesList.length} টি অধ্যায়
                              </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900">
                              {targetCourse.title}
                            </h2>
                          </div>
                        </div>

                        {/* Mode Filter */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                          <button
                            type="button"
                            onClick={() => setCurriculumMode('academic')}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              curriculumMode === 'academic'
                                ? 'bg-white text-[#ed347d] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            📚 বিষয় ও অধ্যায়
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurriculumMode('skill')}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              curriculumMode === 'skill'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            💻 মডিউল ও টপিক
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurriculumMode('language')}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              curriculumMode === 'language'
                                ? 'bg-white text-emerald-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            🌐 IELTS / ভাষা
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Clean Organized Tree View of Sections and Chapters */}
                    <div className="space-y-4">
                      {sectionsList.length === 0 && unassignedModules.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                          <Layers className="w-12 h-12 text-pink-300 mx-auto" />
                          <h3 className="text-base font-bold text-slate-800">
                            এই কোর্সে এখনো কোনো বিষয় বা অধ্যায় সাজানো হয়নি
                          </h3>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            উপরের "+ নতুন বিষয় / মডিউল" বাটনে ক্লিক করে পদার্থবিজ্ঞান, গণিত অথবা জাভাস্ক্রিপ্ট ইত্যাদি বিষয় যোগ করুন এবং তারপর অধ্যায় ও ক্লাস সাজান।
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setNewSectionType('subject');
                              setNewSectionIsArchive(false);
                              setShowAddSectionModal(true);
                            }}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink cursor-pointer"
                          >
                            + প্রথম বিষয় বা মডিউল যোগ করুন
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* 1. REGULAR LIVE SYLLABUS SECTIONS (Subjects/Modules) */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-pink-50 border border-pink-200 text-[#ed347d] flex items-center justify-center font-black text-xs">
                                  <Folder className="w-4 h-4" />
                                </div>
                                <div>
                                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                                    নিয়মিত লাইভ সিলেবাস ({regularSections.length} টি বিষয়/মডিউল)
                                  </h3>
                                  <p className="text-[11px] text-slate-500">
                                    চলতি শিক্ষাবর্ষের নিয়মিত লাইভ ক্লাস ও পরীক্ষা সিলেবাস
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetArchiveIdForSubject('');
                                  setNewSectionType('subject');
                                  setNewSectionIsArchive(false);
                                  setShowAddSectionModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#ed347d] bg-pink-50 hover:bg-pink-100 border border-pink-200 cursor-pointer flex items-center gap-1.5 transition-colors"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>+ বিষয় যোগ</span>
                              </button>
                            </div>

                            {regularSections.length === 0 ? (
                              <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center space-y-1">
                                <p className="text-xs font-bold text-slate-600">নিয়মিত সিলেবাসে এখনো কোনো বিষয় যোগ করা হয়নি।</p>
                                <p className="text-[11px] text-slate-400">উপরের "+ বিষয় যোগ" বাটনে ক্লিক করে পদার্থবিজ্ঞান, গণিত বা প্রোগ্রামিং বিষয় যোগ করুন।</p>
                              </div>
                            ) : (
                              regularSections.map((sec, secIdx) => {
                                const childModules = modulesList.filter((m) => m.parentSectionId === sec.id);
                                const totalLecs = childModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
                                const isExpanded = expandedSectionIds[sec.id] !== false;

                                return (
                                  <div
                                    key={sec.id}
                                    className="bg-white rounded-3xl border border-slate-200/90 transition-all shadow-xs overflow-hidden"
                                  >
                                    {/* Section Header Bar */}
                                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70">
                                      <div className="flex items-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setExpandedSectionIds((prev) => ({
                                              ...prev,
                                              [sec.id]: !isExpanded,
                                            }));
                                          }}
                                          className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 transition-colors cursor-pointer"
                                          title={isExpanded ? 'সংকোচন করুন' : 'প্রসারিত করুন'}
                                        >
                                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>

                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 bg-pink-100 text-[#ed347d]">
                                          <Folder className="w-5 h-5" />
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-50 text-[#ed347d] border border-pink-200">
                                              {sec.type === 'module' ? 'মডিউল' : 'বিষয়'} #{secIdx + 1}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                              {childModules.length} টি অধ্যায় • {totalLecs} টি ক্লাস
                                            </span>
                                          </div>

                                          {editingSectionId === sec.id ? (
                                            <div className="flex items-center gap-2 mt-1">
                                              <input
                                                type="text"
                                                value={editingSectionTitle}
                                                onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                className="px-3 py-1 rounded-xl border border-[#ed347d] text-xs font-bold text-slate-900 bg-white focus:outline-none"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleUpdateSection(sec.id)}
                                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                                              >
                                                সংরক্ষণ
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingSectionId(null)}
                                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 cursor-pointer"
                                              >
                                                বাতিল
                                              </button>
                                            </div>
                                          ) : (
                                            <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                                              {sec.title}
                                            </h3>
                                          )}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setTargetSectionIdForChapter(sec.id);
                                            setNewChapterUnitType(curriculumMode === 'academic' ? 'chapter' : 'topic');
                                            setShowAddChapterModal(true);
                                          }}
                                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#ed347d] bg-[#fff0f5] hover:bg-pink-100/80 border border-pink-200 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                          <PlusCircle className="w-3.5 h-3.5" />
                                          <span>+ {curriculumMode === 'academic' ? 'অধ্যায় যোগ' : 'টপিক যোগ'}</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSectionId(sec.id);
                                            setEditingSectionTitle(sec.title);
                                          }}
                                          className="p-1.5 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 cursor-pointer transition-colors"
                                          title="শিরোনাম সংশোধন"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSection(sec.id)}
                                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer transition-colors"
                                          title="ডিলিট করুন"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Child Chapters (Collapsible) */}
                                    {isExpanded && (
                                      <div className="p-4 sm:p-5 space-y-2.5">
                                        {childModules.length === 0 ? (
                                          <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                                            এই বিষয়ের আন্ডারে কোনো অধ্যায় বা টপিক যুক্ত করা হয়নি। ডানপাশের "+ অধ্যায় যোগ" বাটনে ক্লিক করুন।
                                          </div>
                                        ) : (
                                          childModules.map((mod, modIdx) => (
                                            <div
                                              key={mod.id}
                                              className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                                            >
                                              <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                                                  {modIdx + 1}
                                                </span>
                                                <div>
                                                  {editingModuleId === mod.id ? (
                                                    <div className="flex items-center gap-2">
                                                      <input
                                                        type="text"
                                                        value={editingModuleTitle}
                                                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                                                        className="px-2.5 py-1 rounded-lg border border-[#ed347d] text-xs font-bold text-slate-900 bg-white"
                                                      />
                                                      <button
                                                        type="button"
                                                        onClick={() => handleUpdateChapter(mod.id)}
                                                        className="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                                                      >
                                                        সেভ
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => setEditingModuleId(null)}
                                                        className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-200"
                                                      >
                                                        বাতিল
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <>
                                                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                                                        {mod.title}
                                                      </h4>
                                                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                                                        <span>{mod.lectures?.length || 0} টি ক্লাস ভিডিও</span>
                                                        <span>•</span>
                                                        <span>লাইভ সিলেবাস</span>
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setSelectedCourseForLec(targetCourse.id);
                                                    setTargetModuleForLec(mod.id);
                                                    setActiveSubMenu('content_lectures');
                                                  }}
                                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-200 border border-slate-200 flex items-center gap-1 cursor-pointer"
                                                >
                                                  <Video className="w-3 h-3 text-pink-500" />
                                                  <span>+ ক্লাস যোগ</span>
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setEditingModuleId(mod.id);
                                                    setEditingModuleTitle(mod.title);
                                                  }}
                                                  className="p-1 rounded-lg text-slate-400 hover:text-amber-700 cursor-pointer"
                                                >
                                                  <Edit3 className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteChapter(mod.id)}
                                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* 2. ARCHIVE SECTIONS (3-TIER HIERARCHY: ARCHIVE -> SUBJECT -> CHAPTER -> LECTURES) */}
                          <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-black text-xs">
                                  <Archive className="w-4 h-4 text-amber-700" />
                                </div>
                                <div>
                                  <h3 className="text-xs sm:text-sm font-black text-amber-950">
                                    বিগত ব্যাচ ও রেকর্ড আর্কাইভ ({archiveSections.length} টি আর্কাইভ সেকশন)
                                  </h3>
                                  <p className="text-[11px] text-amber-800/80">
                                    আর্কাইভের ভেতরে বিষয় (Subject) এবং বিষয়ের আন্ডারে অধ্যায় (Chapter) ও ক্লাস সাজান
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetArchiveIdForSubject('');
                                  setNewSectionType('archive');
                                  setNewSectionIsArchive(true);
                                  setShowAddSectionModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              >
                                <Archive className="w-3.5 h-3.5 text-amber-700" />
                                <span>+ নতুন আর্কাইভ সেকশন</span>
                              </button>
                            </div>

                            {archiveSections.length === 0 ? (
                              <div className="p-6 rounded-3xl border border-dashed border-amber-300/80 bg-amber-50/40 text-center space-y-2">
                                <Archive className="w-8 h-8 text-amber-500 mx-auto" />
                                <p className="text-xs font-bold text-amber-900">এখনো কোনো আর্কাইভ সেকশন তৈরি করা হয়নি</p>
                                <p className="text-[11px] text-amber-700 max-w-md mx-auto">
                                  বিগত ব্যাচের ফুল রেকর্ড ক্লাস আলাদাভাবে সাজিয়ে শিক্ষার্থীদের বোনাস হিসেবে দিতে উপরের "+ নতুন আর্কাইভ সেকশন" বাটনে ক্লিক করুন।
                                </p>
                              </div>
                            ) : (
                              archiveSections.map((arcSec, arcIdx) => {
                                const arcSubjects = sectionsList.filter((s) => s.parentArchiveId === arcSec.id);
                                const arcDirectModules = modulesList.filter((m) => m.parentSectionId === arcSec.id);
                                const arcSubjectIds = new Set(arcSubjects.map((s) => s.id));
                                const arcAllModules = modulesList.filter(
                                  (m) => m.parentArchiveId === arcSec.id || m.parentSectionId === arcSec.id || (m.parentSectionId && arcSubjectIds.has(m.parentSectionId))
                                );
                                const arcTotalLecs = arcAllModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
                                const isArcExpanded = expandedSectionIds[arcSec.id] !== false;

                                return (
                                  <div
                                    key={arcSec.id}
                                    className="bg-white rounded-3xl border-2 border-amber-300/90 shadow-sm overflow-hidden"
                                  >
                                    {/* Archive Master Header */}
                                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 bg-gradient-to-r from-amber-100/70 via-amber-50/60 to-white">
                                      <div className="flex items-center gap-3">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setExpandedSectionIds((prev) => ({
                                              ...prev,
                                              [arcSec.id]: !isArcExpanded,
                                            }));
                                          }}
                                          className="p-1 rounded-lg hover:bg-amber-200/60 text-amber-800 transition-colors cursor-pointer"
                                          title={isArcExpanded ? 'সংকোচন করুন' : 'প্রসারিত করুন'}
                                        >
                                          {isArcExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>

                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 bg-amber-200 text-amber-900 border border-amber-300 shadow-xs">
                                          <Archive className="w-5 h-5" />
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                                              🗄️ আর্কাইভ সেকশন #{arcIdx + 1}
                                            </span>
                                            <span className="text-xs text-amber-800/80 font-bold">
                                              {arcSubjects.length} টি বিষয় • {arcAllModules.length} টি অধ্যায় • {arcTotalLecs} টি ক্লাস
                                            </span>
                                          </div>

                                          {editingSectionId === arcSec.id ? (
                                            <div className="flex items-center gap-2 mt-1">
                                              <input
                                                type="text"
                                                value={editingSectionTitle}
                                                onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                className="px-3 py-1 rounded-xl border border-amber-400 text-xs font-bold text-slate-900 bg-white focus:outline-none"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleUpdateSection(arcSec.id)}
                                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                                              >
                                                সংরক্ষণ
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingSectionId(null)}
                                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 bg-slate-200 cursor-pointer"
                                              >
                                                বাতিল
                                              </button>
                                            </div>
                                          ) : (
                                            <h3 className="text-sm sm:text-base font-black text-amber-950 mt-0.5">
                                              {arcSec.title}
                                            </h3>
                                          )}
                                        </div>
                                      </div>

                                      {/* Archive Action Buttons: Add Subject inside archive */}
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setTargetArchiveIdForSubject(arcSec.id);
                                            setNewSectionType('subject');
                                            setNewSectionIsArchive(false);
                                            setShowAddSectionModal(true);
                                          }}
                                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
                                        >
                                          <PlusCircle className="w-3.5 h-3.5" />
                                          <span>+ আর্কাইভে বিষয় যোগ</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSectionId(arcSec.id);
                                            setEditingSectionTitle(arcSec.title);
                                          }}
                                          className="p-1.5 rounded-xl text-amber-800 hover:text-amber-950 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-colors"
                                          title="আর্কাইভ শিরোনাম সংশোধন"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSection(arcSec.id)}
                                          className="p-1.5 rounded-xl text-amber-700 hover:text-rose-600 hover:bg-rose-50 border border-amber-200 cursor-pointer transition-colors"
                                          title="আর্কাইভ সেকশন মুছুন"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Archive Body: List of Subjects inside this Archive */}
                                    {isArcExpanded && (
                                      <div className="p-4 sm:p-6 space-y-4 bg-amber-50/20">
                                        {arcSubjects.length === 0 && arcDirectModules.length === 0 ? (
                                          <div className="p-5 rounded-2xl border border-dashed border-amber-200 bg-white/70 text-center space-y-2">
                                            <FolderPlus className="w-6 h-6 text-amber-500 mx-auto" />
                                            <p className="text-xs font-bold text-slate-700">
                                              এই আর্কাইভ সেকশনে এখনো কোনো বিষয় (Subject) যোগ করা হয়নি।
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                              যেমন: পদার্থবিজ্ঞান ১ম পত্র, রসায়ন ইত্যাদি বিষয় যোগ করতে উপরের <strong>"+ আর্কাইভে বিষয় যোগ"</strong> বাটনে ক্লিক করুন।
                                            </p>
                                          </div>
                                        ) : (
                                          <>
                                            {/* Subjects in this Archive */}
                                            {arcSubjects.map((sub, subIdx) => {
                                              const subModules = modulesList.filter((m) => m.parentSectionId === sub.id);
                                              const subLecs = subModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
                                              const isSubExpanded = expandedSectionIds[sub.id] !== false;

                                              return (
                                                <div
                                                  key={sub.id}
                                                  className="bg-white rounded-2xl border border-amber-200/90 shadow-xs overflow-hidden"
                                                >
                                                  {/* Subject Header inside Archive */}
                                                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-amber-50/50 border-b border-amber-100">
                                                    <div className="flex items-center gap-2.5">
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setExpandedSectionIds((prev) => ({
                                                            ...prev,
                                                            [sub.id]: !isSubExpanded,
                                                          }));
                                                        }}
                                                        className="p-1 rounded-lg hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                                                        title={isSubExpanded ? 'সংকোচন করুন' : 'প্রসারিত করুন'}
                                                      >
                                                        {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                      </button>

                                                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-xs shrink-0">
                                                        📚
                                                      </div>

                                                      <div>
                                                        <div className="flex items-center gap-1.5">
                                                          <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                                                            আর্কাইভ বিষয় #{subIdx + 1}
                                                          </span>
                                                          <span className="text-[11px] text-slate-500 font-bold">
                                                            • {subModules.length} টি অধ্যায় • {subLecs} টি ক্লাস
                                                          </span>
                                                        </div>

                                                        {editingSectionId === sub.id ? (
                                                          <div className="flex items-center gap-2 mt-1">
                                                            <input
                                                              type="text"
                                                              value={editingSectionTitle}
                                                              onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                              className="px-2.5 py-1 rounded-lg border border-amber-400 text-xs font-bold text-slate-900 bg-white"
                                                            />
                                                            <button
                                                              type="button"
                                                              onClick={() => handleUpdateSection(sub.id)}
                                                              className="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600"
                                                            >
                                                              সংরক্ষণ
                                                            </button>
                                                            <button
                                                              type="button"
                                                              onClick={() => setEditingSectionId(null)}
                                                              className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-200"
                                                            >
                                                              বাতিল
                                                            </button>
                                                          </div>
                                                        ) : (
                                                          <h4 className="text-xs sm:text-sm font-black text-slate-900">
                                                            {sub.title}
                                                          </h4>
                                                        )}
                                                      </div>
                                                    </div>

                                                    {/* Subject Actions: Add Chapter under this Subject */}
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setTargetSectionIdForChapter(sub.id);
                                                          setNewChapterUnitType('chapter');
                                                          setShowAddChapterModal(true);
                                                        }}
                                                        className="px-3 py-1 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                                      >
                                                        <PlusCircle className="w-3.5 h-3.5 text-amber-800" />
                                                        <span>+ অধ্যায় যোগ</span>
                                                      </button>

                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setEditingSectionId(sub.id);
                                                          setEditingSectionTitle(sub.title);
                                                        }}
                                                        className="p-1 rounded-lg text-slate-500 hover:text-amber-800 hover:bg-amber-100 border border-slate-200"
                                                        title="বিষয়ের নাম পরিবর্তন"
                                                      >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                      </button>

                                                      <button
                                                        type="button"
                                                        onClick={() => handleDeleteSection(sub.id)}
                                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                                                        title="বিষয় মুছুন"
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                      </button>
                                                    </div>
                                                  </div>

                                                  {/* Subject's Chapters List */}
                                                  {isSubExpanded && (
                                                    <div className="p-3 sm:p-4 space-y-2 bg-slate-50/40">
                                                      {subModules.length === 0 ? (
                                                        <div className="p-3 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                                                          এই বিষয়ের আন্ডারে এখনো অধ্যায় নেই। ডানপাশের "+ অধ্যায় যোগ" বাটনে ক্লিক করুন।
                                                        </div>
                                                      ) : (
                                                        subModules.map((mod, modIdx) => (
                                                          <div
                                                            key={mod.id}
                                                            className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-amber-300 transition-colors shadow-2xs"
                                                          >
                                                            <div className="flex items-center gap-2.5">
                                                              <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                                                                {modIdx + 1}
                                                              </span>
                                                              <div>
                                                                {editingModuleId === mod.id ? (
                                                                  <div className="flex items-center gap-2">
                                                                    <input
                                                                      type="text"
                                                                      value={editingModuleTitle}
                                                                      onChange={(e) => setEditingModuleTitle(e.target.value)}
                                                                      className="px-2 py-0.5 rounded-md border border-pink-400 text-xs font-bold text-slate-900 bg-white"
                                                                    />
                                                                    <button
                                                                      type="button"
                                                                      onClick={() => handleUpdateChapter(mod.id)}
                                                                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-emerald-600"
                                                                    >
                                                                      সেভ
                                                                    </button>
                                                                    <button
                                                                      type="button"
                                                                      onClick={() => setEditingModuleId(null)}
                                                                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 bg-slate-200"
                                                                    >
                                                                      বাতিল
                                                                    </button>
                                                                  </div>
                                                                ) : (
                                                                  <>
                                                                    <h5 className="text-xs font-bold text-slate-800">
                                                                      {mod.title}
                                                                    </h5>
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                                      <span>{mod.lectures?.length || 0} টি ক্লাস ভিডিও</span>
                                                                      <span>•</span>
                                                                      <span className="text-amber-700 font-medium">আর্কাইভ রেকর্ড</span>
                                                                    </div>
                                                                  </>
                                                                )}
                                                              </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                              <button
                                                                type="button"
                                                                onClick={() => {
                                                                  setSelectedCourseForLec(targetCourse.id);
                                                                  setTargetModuleForLec(mod.id);
                                                                  setActiveSubMenu('content_lectures');
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 cursor-pointer"
                                                              >
                                                                <Video className="w-3 h-3 text-pink-500" />
                                                                <span>+ ক্লাস যোগ</span>
                                                              </button>

                                                              <button
                                                                type="button"
                                                                onClick={() => {
                                                                  setEditingModuleId(mod.id);
                                                                  setEditingModuleTitle(mod.title);
                                                                }}
                                                                className="p-1 text-slate-400 hover:text-amber-700 cursor-pointer"
                                                              >
                                                                <Edit3 className="w-3 h-3" />
                                                              </button>

                                                              <button
                                                                type="button"
                                                                onClick={() => handleDeleteChapter(mod.id)}
                                                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                                              >
                                                                <Trash2 className="w-3 h-3" />
                                                              </button>
                                                            </div>
                                                          </div>
                                                        ))
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}

                                            {/* Any Direct Chapters under this archive section without subject */}
                                            {arcDirectModules.length > 0 && (
                                              <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-dashed border-amber-300 space-y-2">
                                                <h4 className="text-xs font-bold text-amber-900">
                                                  সরাসরি অধ্যায়সমূহ ({arcDirectModules.length} টি)
                                                </h4>
                                                <div className="space-y-1.5">
                                                  {arcDirectModules.map((mod, mIdx) => (
                                                    <div
                                                      key={mod.id}
                                                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                                                    >
                                                      <span className="text-xs font-bold text-slate-800">
                                                        {mIdx + 1}. {mod.title} ({mod.lectures?.length || 0} ক্লাস)
                                                      </span>
                                                      <div className="flex items-center gap-1.5">
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            setSelectedCourseForLec(targetCourse.id);
                                                            setTargetModuleForLec(mod.id);
                                                            setActiveSubMenu('content_lectures');
                                                          }}
                                                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                                                        >
                                                          + ক্লাস
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => handleDeleteChapter(mod.id)}
                                                          className="p-1 text-slate-400 hover:text-rose-600"
                                                        >
                                                          <Trash2 className="w-3 h-3" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* 3. UNASSIGNED MODULES (if any) */}
                          {unassignedModules.length > 0 && (
                            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <h3 className="text-sm font-black text-slate-800">
                                    অন্যান্য সরাসরি অধ্যায়সমূহ ({unassignedModules.length} টি)
                                  </h3>
                                  <p className="text-xs text-slate-500">
                                    যেসব অধ্যায় নির্দিষ্ট কোনো বিষয় বা আর্কাইভ সেকশনে বরাদ্দ নেই
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {unassignedModules.map((mod, modIdx) => (
                                  <div
                                    key={mod.id}
                                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-xs font-bold text-slate-500">{modIdx + 1}.</span>
                                      <span className="text-xs font-bold text-slate-800">{mod.title}</span>
                                      <span className="text-[10px] text-slate-400">({mod.lectures?.length || 0} টি ক্লাস)</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedCourseForLec(targetCourse.id);
                                          setTargetModuleForLec(mod.id);
                                          setActiveSubMenu('content_lectures');
                                        }}
                                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-200 border border-slate-200 flex items-center gap-1 cursor-pointer"
                                      >
                                        <Video className="w-3 h-3 text-pink-500" />
                                        <span>+ ক্লাস</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteChapter(mod.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* MODAL 1: ADD SECTION (SUBJECT / MODULE / ARCHIVE) */}
                    {showAddSectionModal && (() => {
                      const parentArc = targetArchiveIdForSubject
                        ? sectionsList.find((s) => s.id === targetArchiveIdForSubject)
                        : null;

                      return (
                        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                {parentArc ? (
                                  <>
                                    <FolderPlus className="w-4 h-4 text-amber-600" />
                                    <span>আর্কাইভে নতুন বিষয় (Subject) যোগ</span>
                                  </>
                                ) : newSectionIsArchive ? (
                                  <>
                                    <Archive className="w-4 h-4 text-amber-600" />
                                    <span>নতুন আর্কাইভ সেকশন যোগ করুন</span>
                                  </>
                                ) : (
                                  <>
                                    <FolderPlus className="w-4 h-4 text-[#ed347d]" />
                                    <span>নতুন বিষয় / মডিউল যোগ করুন</span>
                                  </>
                                )}
                              </h3>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddSectionModal(false);
                                  setTargetArchiveIdForSubject('');
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {parentArc && (
                              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                                <Archive className="w-4 h-4 text-amber-600 shrink-0" />
                                <div>
                                  <span className="font-bold block">টার্গেট আর্কাইভ:</span>
                                  <span className="text-[11px] text-amber-900 font-medium">
                                    "{parentArc.title}" সেকশনের অধীনে বিষয় যুক্ত হবে।
                                  </span>
                                </div>
                              </div>
                            )}

                            <form onSubmit={handleAddSection} className="space-y-3.5">
                              <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                  {parentArc
                                    ? 'আর্কাইভ বিষয়ের নাম *'
                                    : newSectionIsArchive
                                    ? 'আর্কাইভ সেকশনের নাম *'
                                    : 'বিষয় বা মডিউলের নাম *'}
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={newSectionTitle}
                                  onChange={(e) => setNewSectionTitle(e.target.value)}
                                  placeholder={
                                    parentArc
                                      ? 'যেমন: পদার্থবিজ্ঞান ১ম পত্র বা গণিত'
                                      : newSectionIsArchive
                                      ? 'উদা: ক্যাম্পাস ৬.০ পূর্ববর্তী ব্যাচ রেকর্ড'
                                      : curriculumMode === 'academic'
                                      ? 'উদা: পদার্থবিজ্ঞান (Physics)'
                                      : 'উদা: মডিউল ০১ - রিঅ্যাক্ট বেসিক্স'
                                  }
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ed347d]"
                                />
                              </div>

                              {!parentArc && (
                                <div>
                                  <label className="text-xs font-bold text-slate-700 block mb-1">সেকশন টাইপ</label>
                                  <select
                                    value={newSectionType}
                                    onChange={(e: any) => {
                                      setNewSectionType(e.target.value);
                                      if (e.target.value === 'archive') {
                                        setNewSectionIsArchive(true);
                                      } else {
                                        setNewSectionIsArchive(false);
                                      }
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ed347d]"
                                  >
                                    <option value="subject">বিষয় (Subject - যেমন Physics, Chemistry)</option>
                                    <option value="module">মডিউল (Module - যেমন Frontend, Python)</option>
                                    <option value="archive">আর্কাইভ (Archive - পূর্ববর্তী ব্যাচের ক্লাস)</option>
                                    <option value="custom">কাস্টম সেকশন (Special Workshop / Guideline)</option>
                                  </select>
                                </div>
                              )}

                              {!parentArc && (
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                                  <Archive className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                  <label className="cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={newSectionIsArchive}
                                      onChange={(e) => {
                                        setNewSectionIsArchive(e.target.checked);
                                        if (e.target.checked) setNewSectionType('archive');
                                      }}
                                      className="mr-2 rounded text-[#ed347d]"
                                    />
                                    <span className="font-bold">এটি কি আর্কাইভ বা বিগত ব্যাচের রেকর্ড সেকশন?</span>
                                    <span className="block text-[11px] text-amber-700 font-normal">
                                      আর্কাইভ সিলেক্ট করলে স্টুডেন্ট ক্লাসরুমে এটি আলাদা গোল্ডেন ব্যাজে পূর্ববর্তী ক্লাস হিসেবে প্রদর্শন করবে।
                                    </span>
                                  </label>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddSectionModal(false);
                                    setTargetArchiveIdForSubject('');
                                  }}
                                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                                >
                                  বাতিল
                                </button>
                                <button
                                  type="submit"
                                  className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md cursor-pointer"
                                >
                                  নিশ্চিত করুন
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      );
                    })()}

                    {/* MODAL 2: ADD CHAPTER / TOPIC */}
                    {showAddChapterModal && (
                      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <PlusCircle className="w-4 h-4 text-[#ed347d]" />
                              <span>নতুন অধ্যায় বা টপিক যুক্ত করুন</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => setShowAddChapterModal(false)}
                              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <form onSubmit={handleAddChapter} className="space-y-3.5">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                মূল বিষয় / সেকশন নির্বাচন করুন *
                              </label>
                              <select
                                value={targetSectionIdForChapter}
                                onChange={(e) => setTargetSectionIdForChapter(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ed347d]"
                              >
                                {regularSections.length > 0 && (
                                  <optgroup label="📂 লাইভ সিলেবাসের বিষয়সমূহ">
                                    {regularSections.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        📁 {s.title} ({s.type === 'module' ? 'মডিউল' : 'বিষয়'})
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                {archiveSections.map((arc) => {
                                  const arcSubs = sectionsList.filter((s) => s.parentArchiveId === arc.id);
                                  return (
                                    <optgroup key={arc.id} label={`🗄️ আর্কাইভ: ${arc.title}`}>
                                      {arcSubs.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                          ↳ 📚 {sub.title} (আর্কাইভ বিষয়)
                                        </option>
                                      ))}
                                      <option value={arc.id}>
                                        ↳ [সরাসরি আর্কাইভ] {arc.title}
                                      </option>
                                    </optgroup>
                                  );
                                })}
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                অধ্যায় বা টপিকের শিরোনাম *
                              </label>
                              <input
                                type="text"
                                required
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                placeholder={
                                  curriculumMode === 'academic'
                                    ? 'যেমন: অধ্যায় ০১: ভেক্টর ও দিকনির্দেশনা'
                                    : 'যেমন: টপিক ০১: জাভাস্ক্রিপ্ট ইএস৬ সিনট্যাক্স'
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ed347d]"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">লেবেল টাইপ</label>
                              <select
                                value={newChapterUnitType}
                                onChange={(e: any) => setNewChapterUnitType(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ed347d]"
                              >
                                <option value="chapter">অধ্যায় (Chapter)</option>
                                <option value="topic">টপিক (Topic)</option>
                                <option value="lesson">লেসন (Lesson)</option>
                                <option value="project">প্রজেক্ট (Project)</option>
                              </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setShowAddChapterModal(false)}
                                className="w-1/3 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                              >
                                বাতিল
                              </button>
                              <button
                                type="submit"
                                className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md cursor-pointer"
                              >
                                অধ্যায় যোগ করুন
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* View 2: LECTURES & VIDEO CLASSES */}
              {(activeSubMenu === 'content_lectures' || activeSubMenu === 'content_videos') && (() => {
                const course = courses.find((c) => c.id === selectedCourseForLec) || teacherCourses[0] || courses[0];
                const modules = course?.modules || [];
                const { regularSubjects, archiveSubjects, hasArchive } = getCategorizedCourseData(course);
                const activeSubjectList = lecCategoryFilter === 'archive' ? archiveSubjects : regularSubjects;

                const currentSubjectId = activeSubjectList.some((s) => s.id === lecSubjectFilter)
                  ? lecSubjectFilter
                  : (activeSubjectList[0]?.id || '');

                const currentSubject = activeSubjectList.find((s) => s.id === currentSubjectId);
                const availableModules = currentSubject?.modules || [];

                const handleLecCategoryChange = (cat: 'regular' | 'archive') => {
                  setLecCategoryFilter(cat);
                  const nextList = cat === 'archive' ? archiveSubjects : regularSubjects;
                  const nextSubj = nextList[0];
                  if (nextSubj) {
                    setLecSubjectFilter(nextSubj.id);
                    setTargetModuleForLec(nextSubj.modules[0]?.id || '');
                  } else {
                    setLecSubjectFilter('');
                    setTargetModuleForLec('');
                  }
                };

                const handleLecSubjectChange = (subjectId: string) => {
                  setLecSubjectFilter(subjectId);
                  const subj = activeSubjectList.find((s) => s.id === subjectId);
                  if (subj && subj.modules.length > 0) {
                    setTargetModuleForLec(subj.modules[0].id);
                  } else {
                    setTargetModuleForLec('');
                  }
                };

                const handleSelectModuleForLec = (modId: string) => {
                  const inReg = regularSubjects.find((s) => s.modules.some((m) => m.id === modId));
                  if (inReg) {
                    setLecCategoryFilter('regular');
                    setLecSubjectFilter(inReg.id);
                    setTargetModuleForLec(modId);
                    return;
                  }
                  const inArc = archiveSubjects.find((s) => s.modules.some((m) => m.id === modId));
                  if (inArc) {
                    setLecCategoryFilter('archive');
                    setLecSubjectFilter(inArc.id);
                    setTargetModuleForLec(modId);
                    return;
                  }
                  setTargetModuleForLec(modId);
                };

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form: Add Video Lecture */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold bg-pink-100 text-[#ed347d] px-2.5 py-0.5 rounded-full">ভিডিও ক্লাস</span>
                        <h3 className="text-sm font-black text-slate-900">কোর্সে ভিডিও লেকচার যুক্ত করুন</h3>
                      </div>

                      <form onSubmit={handleAddLecture} className="space-y-3.5">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">টার্গেট কোর্স নির্বাচন করুন *</label>
                          <select
                            value={selectedCourseForLec}
                            onChange={(e) => handleSelectCourse(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-white font-medium"
                          >
                            {teacherCourses.length === 0 ? (
                              <option value="">কোনো কোর্স তৈরি করা নেই (প্রথমে কোর্স তৈরি করুন)</option>
                            ) : (
                              teacherCourses.map((c) => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))
                            )}
                          </select>
                        </div>

                        {/* Cascading 3-Step Chapter Filter */}
                        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              🎯 টার্গেট অধ্যায় নির্বাচন (৩টি ফিল্টার ধাপ)
                            </span>
                            <span className="text-[10px] font-bold text-[#ed347d] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full">
                              ধাপ ১ ➔ ২ ➔ ৩
                            </span>
                          </div>

                          {/* 1st Filter: Regular vs Archive */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-[#ed347d] text-white text-[10px] inline-flex items-center justify-center font-bold shrink-0">১</span>
                              ক্যাটাগরি / ধরন (রেগুলার নাকি আর্কাইভ) *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleLecCategoryChange('regular')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  lecCategoryFilter === 'regular'
                                    ? 'bg-pink-50 border-[#ed347d] text-[#ed347d] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span>📂 রেগুলার সিলেবাস</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-100/80 text-[#ed347d]">
                                  {regularSubjects.length} বিষয়
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleLecCategoryChange('archive')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  lecCategoryFilter === 'archive'
                                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span>🗄️ আর্কাইভ ক্লাস</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100/80 text-amber-800">
                                  {archiveSubjects.length} বিষয়
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* 2nd Filter: Subject (বিষয়) */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-[#ed347d] text-white text-[10px] inline-flex items-center justify-center font-bold shrink-0">২</span>
                                বিষয় (Subject) নির্বাচন করুন *
                              </label>
                              {activeSubjectList.length > 0 && (
                                <span className="text-[10px] text-slate-500 font-bold">
                                  {activeSubjectList.length} টি বিষয় উপলব্ধ
                                </span>
                              )}
                            </div>
                            <select
                              value={currentSubjectId}
                              onChange={(e) => handleLecSubjectChange(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ed347d] bg-white shadow-2xs"
                            >
                              {activeSubjectList.length === 0 ? (
                                <option value="">কোনো বিষয় তৈরি করা নেই</option>
                              ) : (
                                activeSubjectList.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    📚 {s.title} ({s.modules.length} টি অধ্যায়)
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          {/* 3rd Filter: Chapter (অধ্যায়) */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-[#ed347d] text-white text-[10px] inline-flex items-center justify-center font-bold shrink-0">৩</span>
                                টার্গেট অধ্যায় (Chapter) নির্বাচন করুন *
                              </label>
                              {availableModules.length > 0 && (
                                <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-md">
                                  {availableModules.length} টি অধ্যায়
                                </span>
                              )}
                            </div>
                            <select
                              value={targetModuleForLec}
                              onChange={(e) => setTargetModuleForLec(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ed347d] bg-white shadow-2xs"
                            >
                              <option value="">-- অধ্যায় নির্বাচন করুন (ঐচ্ছিক) --</option>
                              {availableModules.map((m) => (
                                <option key={m.id} value={m.id}>
                                  📖 {m.title} ({m.lectures?.length || 0} টি ক্লাস)
                                </option>
                              ))}
                            </select>
                            {availableModules.length === 0 && (
                              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                এই বিষয়ের অধীনে এখনো কোনো অধ্যায় যোগ করা হয়নি।
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">ক্লাসের শিরোনাম *</label>
                          <input
                            type="text"
                            required
                            value={lectureTitle}
                            onChange={(e) => setLectureTitle(e.target.value)}
                            placeholder="যেমন: লেকচার ০১ - ভেক্টরের সামান্তরিক সূত্র"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">সময়কাল</label>
                            <input
                              type="text"
                              value={lectureDuration}
                              onChange={(e) => setLectureDuration(e.target.value)}
                              placeholder="১ ঘণ্টা ৩০ মিনিট"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">ফ্রি ট্রায়াল প্রিভিউ</label>
                            <select
                              value={isFreeTrial ? 'yes' : 'no'}
                              onChange={(e) => setIsFreeTrial(e.target.value === 'yes')}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            >
                              <option value="no">লকড (শুধু এনরোল্ড)</option>
                              <option value="yes">ফ্রি প্রিভিউ (সবার জন্য)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700 block">
                              ভিডিও লিংক (BunnyCDN HLS .m3u8 / YouTube / MP4) *
                            </label>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ HLS .m3u8 স্ট্রিমিং সাপোর্টেড
                            </span>
                          </div>
                          <input
                            type="text"
                            required
                            value={lectureVideoUrl}
                            onChange={(e) => setLectureVideoUrl(e.target.value)}
                            placeholder="যেমন: https://vz-xxx.b-cdn.net/uuid/playlist.m3u8 বা YouTube লিংক"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] font-mono"
                          />
                          <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                            <p className="text-[10px] text-slate-400">
                              💡 BunnyCDN, Vimeo, Google Drive, YouTube বা সরাসরি .m3u8 প্লেলিস্ট লিংক দিতে পারবেন।
                            </p>
                            <button
                              type="button"
                              onClick={() => setLectureVideoUrl('https://vz-2d726a87-cba.b-cdn.net/50734d3b-3248-49c0-948b-ed31ffb9ad28/playlist.m3u8')}
                              className="text-[10px] font-bold text-[#ed347d] hover:underline cursor-pointer"
                            >
                              + টেস্ট HLS লিংক বসান
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md cursor-pointer"
                        >
                          + লেকচার ক্লাস আপলোড করুন
                        </button>
                      </form>
                    </div>

                    {/* Preview / List of lectures in selected course */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">{course?.title}</h3>
                          <p className="text-xs text-slate-500">বর্তমান ক্লাস তালিকা (বিষয় ➔ অধ্যায় ➔ ক্লাস)</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-50 text-[#ed347d]">
                          {course?.totalLectures || 0} টি ক্লাস
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                        {(() => {
                          const sections = course?.sections || [];
                          const modules = course?.modules || [];
                          const regularSections = sections.filter((s) => !s.isArchive && s.type !== 'archive' && !s.parentArchiveId);
                          const archiveSections = sections.filter((s) => (s.isArchive || s.type === 'archive') && !s.parentArchiveId);
                          const assignedModIds = new Set<string>();

                          // If course has configured sections
                          if (sections.length > 0) {
                            return (
                              <>
                                {/* 1. Regular Live Syllabus Subjects */}
                                {regularSections.map((sec, secIdx) => {
                                  const secModules = modules.filter((m) => m.parentSectionId === sec.id || (!m.parentSectionId && m.parentSectionTitle === sec.title));
                                  secModules.forEach((m) => assignedModIds.add(m.id));
                                  const totalLecs = secModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
                                  const isSecOpen = expandedPreviewSections[sec.id] ?? (secModules.some((m) => m.id === targetModuleForLec) || secIdx === 0);

                                  return (
                                    <div key={sec.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                                      {/* Subject Header */}
                                      <button
                                        type="button"
                                        onClick={() => setExpandedPreviewSections((prev) => ({ ...prev, [sec.id]: !isSecOpen }))}
                                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/90 transition-colors cursor-pointer select-none bg-white border-b border-slate-100"
                                      >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <div className="w-7 h-7 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
                                            <Folder className="w-4 h-4 text-[#ed347d]" />
                                          </div>
                                          <div>
                                            <span className="text-xs font-black text-slate-800 block truncate">
                                              {sec.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                              {secModules.length} টি অধ্যায় • {totalLecs} টি ক্লাস
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#ed347d]">
                                            {secModules.length} অধ্যায়
                                          </span>
                                          {isSecOpen ? (
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                          )}
                                        </div>
                                      </button>

                                      {/* Chapters inside Subject */}
                                      {isSecOpen && (
                                        <div className="p-3 space-y-2">
                                          {secModules.map((mod) => {
                                            const isModOpen = expandedLectureChapters[mod.id] ?? (targetModuleForLec === mod.id);
                                            return (
                                              <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-3xs">
                                                <button
                                                  type="button"
                                                  onClick={() => setExpandedLectureChapters((prev) => ({ ...prev, [mod.id]: !isModOpen }))}
                                                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer select-none"
                                                >
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                    <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-700 truncate">
                                                      {mod.title}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600">
                                                      {mod.lectures.length} ক্লাস
                                                    </span>
                                                    {isModOpen ? (
                                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : (
                                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                  </div>
                                                </button>

                                                {/* Classes inside Chapter */}
                                                {isModOpen && (
                                                  <div className="p-2 pt-1 space-y-1.5 border-t border-slate-100 bg-slate-50/50">
                                                    {mod.lectures.map((lec) => (
                                                      <div key={lec.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:border-pink-200 transition-colors">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                          <Video className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                                          <span className="font-semibold text-slate-700 truncate text-[11px]">{lec.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-slate-400">
                                                          <span>{lec.duration}</span>
                                                          {lec.isFreePreview && (
                                                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 font-bold">ফ্রি</span>
                                                          )}
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              if (confirm(`"${lec.title}" ক্লাসটি কি মুছে ফেলতে চান?`)) {
                                                                deleteLecture(course.id, mod.id, lec.id);
                                                                showToast('🗑️ ক্লাসটি মুছে ফেলা হয়েছে');
                                                              }
                                                            }}
                                                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                                            title="ক্লাস মুছে ফেলুন"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                    {mod.lectures.length === 0 && (
                                                      <p className="text-[10px] text-slate-400 italic py-1 text-center">এই অধ্যায়ে এখনো ক্লাস নেই</p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                          {secModules.length === 0 && (
                                            <p className="text-[11px] text-slate-400 italic py-2 text-center">এই বিষয়ে এখনো কোনো অধ্যায় যোগ করা হয়নি</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* 2. Archive Sections */}
                                {archiveSections.map((arc) => {
                                  const arcSubs = sections.filter((s) => s.parentArchiveId === arc.id);
                                  const directArcMods = modules.filter(
                                    (m) => (m.parentSectionId === arc.id || m.parentArchiveId === arc.id) && !arcSubs.some((s) => s.id === m.parentSectionId)
                                  );
                                   arcSubs.forEach((sub) => {
                                     modules
                                       .filter((m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title))
                                       .forEach((m) => assignedModIds.add(m.id));
                                   });
                                   directArcMods.forEach((m) => assignedModIds.add(m.id));

                                   const allArcMods = [
                                     ...arcSubs.flatMap((sub) => modules.filter((m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title))),
                                     ...directArcMods,
                                   ];
                                  const totalArcLecs = allArcMods.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
                                  const isArcOpen = expandedPreviewSections[arc.id] ?? false;

                                  return (
                                    <div key={arc.id} className="bg-amber-50/50 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-2xs">
                                      {/* Archive Section Header */}
                                      <button
                                        type="button"
                                        onClick={() => setExpandedPreviewSections((prev) => ({ ...prev, [arc.id]: !isArcOpen }))}
                                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-100/60 transition-colors cursor-pointer select-none bg-gradient-to-r from-amber-100/40 to-white border-b border-amber-200/80"
                                      >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                                            <Archive className="w-4 h-4 text-amber-700" />
                                          </div>
                                          <div>
                                            <span className="text-xs font-black text-amber-950 block truncate">
                                              {arc.title}
                                            </span>
                                            <span className="text-[10px] text-amber-800/80 font-medium">
                                              আর্কাইভ ব্যাচ • {allArcMods.length} অধ্যায় • {totalArcLecs} ক্লাস
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                                            আর্কাইভ
                                          </span>
                                          {isArcOpen ? (
                                            <ChevronDown className="w-4 h-4 text-amber-800" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-amber-800" />
                                          )}
                                        </div>
                                      </button>

                                      {/* Inside Archive */}
                                      {isArcOpen && (
                                        <div className="p-3 space-y-2.5">
                                          {/* Child Subjects */}
                                          {arcSubs.map((sub) => {
                                            const subMods = modules.filter((m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title));
                                            const isSubOpen = expandedPreviewSections[sub.id] ?? false;
                                            const subLecs = subMods.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);

                                            return (
                                              <div key={sub.id} className="bg-white rounded-xl border border-amber-200 overflow-hidden">
                                                <button
                                                  type="button"
                                                  onClick={() => setExpandedPreviewSections((prev) => ({ ...prev, [sub.id]: !isSubOpen }))}
                                                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-amber-50/60 transition-colors cursor-pointer select-none"
                                                >
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="text-xs">📚</span>
                                                    <span className="text-xs font-bold text-slate-800 truncate">
                                                      {sub.title}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800">
                                                      {subMods.length} অধ্যায় • {subLecs} ক্লাস
                                                    </span>
                                                    {isSubOpen ? (
                                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : (
                                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                  </div>
                                                </button>

                                                {/* Chapters under archive subject */}
                                                {isSubOpen && (
                                                  <div className="p-2 space-y-1.5 border-t border-amber-100 bg-amber-50/30">
                                                    {subMods.map((mod) => {
                                                      const isModOpen = expandedLectureChapters[mod.id] ?? (targetModuleForLec === mod.id);
                                                      return (
                                                        <div key={mod.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                                          <button
                                                            type="button"
                                                            onClick={() => setExpandedLectureChapters((prev) => ({ ...prev, [mod.id]: !isModOpen }))}
                                                            className="w-full p-2 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer select-none"
                                                          >
                                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                              <BookOpen className="w-3 h-3 text-amber-700 shrink-0" />
                                                              <span className="text-[11px] font-bold text-slate-700 truncate">{mod.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                              <span className="text-[9px] text-slate-500 font-semibold">{mod.lectures.length} ক্লাস</span>
                                                              {isModOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                                                            </div>
                                                          </button>

                                                          {isModOpen && (
                                                            <div className="p-2 pt-0 space-y-1 border-t border-slate-100 bg-slate-50/50">
                                                              {mod.lectures.map((lec) => (
                                                                <div key={lec.id} className="p-1.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                                                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                                                    <Video className="w-3 h-3 text-amber-600 shrink-0" />
                                                                    <span className="font-medium text-slate-700 truncate">{lec.title}</span>
                                                                  </div>
                                                                  <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                                                                    <span>{lec.duration}</span>
                                                                    <button
                                                                      type="button"
                                                                      onClick={() => {
                                                                        if (confirm(`"${lec.title}" ক্লাসটি কি মুছে ফেলতে চান?`)) {
                                                                          deleteLecture(course.id, mod.id, lec.id);
                                                                          showToast('🗑️ ক্লাসটি মুছে ফেলা হয়েছে');
                                                                        }
                                                                      }}
                                                                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                                      title="ক্লাস মুছে ফেলুন"
                                                                    >
                                                                      <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                  </div>
                                                                </div>
                                                              ))}
                                                              {mod.lectures.length === 0 && (
                                                                <p className="text-[10px] text-slate-400 italic py-1 text-center">কোনো ক্লাস নেই</p>
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}

                                          {/* Direct Archive Chapters */}
                                          {directArcMods.map((mod) => {
                                            const isModOpen = expandedLectureChapters[mod.id] ?? (targetModuleForLec === mod.id);
                                            return (
                                              <div
                                                key={mod.id}
                                                className={`bg-white rounded-xl border ${targetModuleForLec === mod.id ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-amber-200'} overflow-hidden`}
                                              >
                                                <div className="w-full p-2.5 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setExpandedLectureChapters((prev) => ({
                                                        ...prev,
                                                        [mod.id]: !isModOpen,
                                                      }))
                                                    }
                                                    className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer select-none text-left"
                                                  >
                                                    <Archive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-700 truncate">
                                                      {mod.title}
                                                    </span>
                                                  </button>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectModuleForLec(mod.id);
                                                      }}
                                                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                                                        targetModuleForLec === mod.id
                                                          ? 'bg-amber-600 text-white shadow-2xs'
                                                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                                      }`}
                                                      title="এই অধ্যায়টি ভিডিও ক্লাসের জন্য নির্বাচন করুন"
                                                    >
                                                      {targetModuleForLec === mod.id ? '✓ নির্বাচিত' : 'টার্গেট'}
                                                    </button>
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800">
                                                      {mod.lectures.length} ক্লাস
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setExpandedLectureChapters((prev) => ({
                                                          ...prev,
                                                          [mod.id]: !isModOpen,
                                                        }))
                                                      }
                                                      className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                      {isModOpen ? (
                                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                      ) : (
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                      )}
                                                    </button>
                                                  </div>
                                                </div>

                                                {isModOpen && (
                                                  <div className="p-2 pt-1 space-y-1 border-t border-slate-100 bg-slate-50/50">
                                                    {mod.lectures.map((lec) => (
                                                      <div key={lec.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                          <Video className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                                          <span className="font-semibold text-slate-700 truncate text-[11px]">{lec.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                                                          <span>{lec.duration}</span>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              if (confirm(`"${lec.title}" ক্লাসটি কি মুছে ফেলতে চান?`)) {
                                                                deleteLecture(course.id, mod.id, lec.id);
                                                                showToast('🗑️ ক্লাসটি মুছে ফেলা হয়েছে');
                                                             }
                                                            }}
                                                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                            title="ক্লাস মুছে ফেলুন"
                                                          >
                                                            <Trash2 className="w-3 h-3" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                    {mod.lectures.length === 0 && (
                                                      <p className="text-[10px] text-slate-400 italic py-1 text-center">কোনো ক্লাস নেই</p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* 3. Unassigned / Remaining Modules */}
                                {(() => {
                                  const remainingMods = modules.filter((m) => !assignedModIds.has(m.id));
                                  if (remainingMods.length === 0) return null;
                                  const isUnassignedOpen = expandedPreviewSections['unassigned'] ?? false;
                                  const totalUnassignedLecs = remainingMods.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);

                                  return (
                                    <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedPreviewSections((prev) => ({ ...prev, unassigned: !isUnassignedOpen }))}
                                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors cursor-pointer select-none bg-white border-b border-slate-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Folder className="w-4 h-4 text-slate-500" />
                                          <span className="text-xs font-bold text-slate-700">অন্যান্য সরাসরি অধ্যায়সমূহ</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {remainingMods.length} অধ্যায় • {totalUnassignedLecs} ক্লাস
                                          </span>
                                          {isUnassignedOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                        </div>
                                      </button>

                                      {isUnassignedOpen && (
                                        <div className="p-3 space-y-2">
                                          {remainingMods.map((mod) => {
                                            const isModOpen = expandedLectureChapters[mod.id] ?? false;
                                            return (
                                              <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <button
                                                  type="button"
                                                  onClick={() => setExpandedLectureChapters((prev) => ({ ...prev, [mod.id]: !isModOpen }))}
                                                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer select-none"
                                                >
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-700 truncate">{mod.title}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">{mod.lectures.length} ক্লাস</span>
                                                    {isModOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                                  </div>
                                                </button>

                                                {isModOpen && (
                                                  <div className="p-2 pt-1 space-y-1 border-t border-slate-100 bg-slate-50/50">
                                                    {mod.lectures.map((lec) => (
                                                      <div key={lec.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                          <Video className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                                          <span className="font-semibold text-slate-700 truncate text-[11px]">{lec.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                                                          <span>{lec.duration}</span>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              if (confirm(`"${lec.title}" ক্লাসটি কি মুছে ফেলতে চান?`)) {
                                                                deleteLecture(course.id, mod.id, lec.id);
                                                                showToast('🗑️ ক্লাসটি মুছে ফেলা হয়েছে');
                                                              }
                                                            }}
                                                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                            title="ক্লাস মুছে ফেলুন"
                                                          >
                                                            <Trash2 className="w-3 h-3" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                    {mod.lectures.length === 0 && (
                                                      <p className="text-[10px] text-slate-400 italic py-1 text-center">কোনো ক্লাস নেই</p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </>
                            );
                          }

                          // Fallback if no sections configured
                          return modules.map((mod, idx) => {
                            const isExpanded = expandedLectureChapters[mod.id] ?? (targetModuleForLec === mod.id || idx === 0);
                            return (
                              <div key={mod.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setExpandedLectureChapters(prev => ({ ...prev, [mod.id]: !isExpanded }))}
                                  className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors cursor-pointer select-none"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <BookOpen className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                    <span className="text-xs font-bold text-slate-800 truncate">{mod.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                                      {mod.lectures.length} টি ক্লাস
                                    </span>
                                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="p-3 pt-1 space-y-1.5 border-t border-slate-200/60 bg-white/70">
                                    {mod.lectures.map((lec) => (
                                      <div key={lec.id} className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <Video className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                          <span className="font-semibold text-slate-700 truncate">{lec.title}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">{lec.duration}</span>
                                      </div>
                                    ))}
                                    {mod.lectures.length === 0 && (
                                      <p className="text-[11px] text-slate-400 italic py-1.5 text-center">এই অধ্যায়ে এখনো ক্লাস নেই</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                        {modules.length === 0 && (
                          <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
                            এই কোর্সে কোনো অধ্যায় তৈরি করা নেই। আগে 'Sections / Chapters' থেকে অধ্যায় যোগ করুন।
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* View 3: PDF / NOTES / SHEETS */}
              {activeSubMenu === 'content_sheets' && (() => {
                const course = courses.find((c) => c.id === selectedCourseForSheet) || teacherCourses[0] || courses[0];
                const modules = course?.modules || [];
                const { regularSubjects: sheetRegSubjects, archiveSubjects: sheetArcSubjects, hasArchive: sheetHasArchive } = getCategorizedCourseData(course);
                const activeSheetSubjectList = sheetCategoryFilter === 'archive' ? sheetArcSubjects : sheetRegSubjects;

                const currentSheetSubjectId = activeSheetSubjectList.some((s) => s.id === sheetSubjectFilter)
                  ? sheetSubjectFilter
                  : (activeSheetSubjectList[0]?.id || '');

                const currentSheetSubject = activeSheetSubjectList.find((s) => s.id === currentSheetSubjectId);
                const availableSheetModules = currentSheetSubject?.modules || [];

                const currentModule = (targetModuleForSheet && modules.find((m) => m.id === targetModuleForSheet)) || availableSheetModules[0] || modules[0];
                const currentLectures = currentModule?.lectures || [];

                const handleSheetCategoryChange = (cat: 'regular' | 'archive') => {
                  setSheetCategoryFilter(cat);
                  const nextList = cat === 'archive' ? sheetArcSubjects : sheetRegSubjects;
                  const nextSubj = nextList[0];
                  if (nextSubj) {
                    setSheetSubjectFilter(nextSubj.id);
                    const firstM = nextSubj.modules[0]?.id || '';
                    setTargetModuleForSheet(firstM);
                    const modObj = nextSubj.modules[0];
                    setTargetLectureForSheet(modObj?.lectures?.[0]?.id || '');
                  } else {
                    setSheetSubjectFilter('');
                    setTargetModuleForSheet('');
                    setTargetLectureForSheet('');
                  }
                };

                const handleSheetSubjectChange = (subjectId: string) => {
                  setSheetSubjectFilter(subjectId);
                  const subj = activeSheetSubjectList.find((s) => s.id === subjectId);
                  if (subj && subj.modules.length > 0) {
                    const firstM = subj.modules[0].id;
                    setTargetModuleForSheet(firstM);
                    setTargetLectureForSheet(subj.modules[0].lectures?.[0]?.id || '');
                  } else {
                    setTargetModuleForSheet('');
                    setTargetLectureForSheet('');
                  }
                };

                const handleSelectModuleForSheet = (modId: string) => {
                  const inReg = sheetRegSubjects.find((s) => s.modules.some((m) => m.id === modId));
                  if (inReg) {
                    setSheetCategoryFilter('regular');
                    setSheetSubjectFilter(inReg.id);
                    setTargetModuleForSheet(modId);
                    const m = inReg.modules.find((mod) => mod.id === modId);
                    setTargetLectureForSheet(m?.lectures?.[0]?.id || '');
                    return;
                  }
                  const inArc = sheetArcSubjects.find((s) => s.modules.some((m) => m.id === modId));
                  if (inArc) {
                    setSheetCategoryFilter('archive');
                    setSheetSubjectFilter(inArc.id);
                    setTargetModuleForSheet(modId);
                    const m = inArc.modules.find((mod) => mod.id === modId);
                    setTargetLectureForSheet(m?.lectures?.[0]?.id || '');
                    return;
                  }
                  setTargetModuleForSheet(modId);
                  const m = modules.find((mod) => mod.id === modId);
                  setTargetLectureForSheet(m?.lectures?.[0]?.id || '');
                };

                const renderSheetCard = (note: any, cId: string, modTitle?: string) => {
                  const isLecture = note.type === 'lecture_sheet';
                  const isPractice = note.type === 'practice_sheet';
                  const isHandnote = note.type === 'handnote';

                  return (
                    <div
                      key={note.id}
                      className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-xs hover:border-indigo-200 hover:shadow-2xs transition-all"
                    >
                      <div className="flex items-start gap-2 overflow-hidden flex-1 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          isLecture ? 'bg-pink-50 text-[#ed347d]' : isPractice ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-black shrink-0 ${
                                isLecture
                                  ? 'bg-pink-50 text-[#ed347d] border border-pink-200'
                                  : isPractice
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {isLecture ? '📖 লেকচার শিট' : isPractice ? '📝 প্র্যাকটিস শিট' : '✍️ হ্যান্ডনোট'}
                            </span>
                            {(note.lectureTitle || currentLectures.find(l => l.notes?.some(n => n.id === note.id))?.title) && (
                              <span className="text-[9px] text-slate-500 font-bold truncate max-w-[130px]" title={note.lectureTitle || currentLectures.find(l => l.notes?.some(n => n.id === note.id))?.title}>
                                🏷️ {note.lectureTitle || currentLectures.find(l => l.notes?.some(n => n.id === note.id))?.title}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-800 truncate text-[11px] block mt-0.5" title={note.title}>
                            {note.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>{note.pages} পৃষ্ঠা</span>
                            <span>•</span>
                            <span>{note.size || '3.5 MB'}</span>
                            {note.pdfUrl && note.pdfUrl !== '#' && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-bold">অনলাইন ড্রাইভ লিংক</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {note.pdfUrl && note.pdfUrl !== '#' && (
                          <a
                            href={note.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="লিংক ওপেন করুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteResourceSheet(cId, note.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="শিট মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Sheet Form */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">লেকচার শিট ও PDF</span>
                        <h3 className="text-sm font-black text-slate-900">ক্লাসভিত্তিক লেকচার বা প্র্যাকটিস শিট যুক্ত করুন</h3>
                      </div>

                      <form onSubmit={handleAddSheet} className="space-y-3.5">
                        {/* 1. Course Selection */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">টার্গেট কোর্স নির্বাচন করুন *</label>
                          <select
                            value={selectedCourseForSheet}
                            onChange={(e) => handleSelectCourse(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          >
                            {teacherCourses.length === 0 ? (
                              <option value="">কোনো কোর্স তৈরি করা নেই (প্রথমে কোর্স তৈরি করুন)</option>
                            ) : (
                              teacherCourses.map((c) => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))
                            )}
                          </select>
                        </div>

                        {/* Cascading 4-Step Filter for Chapter & Class */}
                        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              🎯 টার্গেট অধ্যায় ও ক্লাস ফিল্টার (৪টি ধাপ)
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              ধাপ ১ ➔ ২ ➔ ৩ ➔ ৪
                            </span>
                          </div>

                          {/* Step 1: Category Filter (Regular vs Archive) */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] inline-flex items-center justify-center font-bold shrink-0">১</span>
                              ক্যাটাগরি / ধরন (রেগুলার নাকি আর্কাইভ) *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleSheetCategoryChange('regular')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  sheetCategoryFilter === 'regular'
                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span>📂 রেগুলার সিলেবাস</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100/80 text-indigo-700">
                                  {sheetRegSubjects.length} বিষয়
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSheetCategoryChange('archive')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  sheetCategoryFilter === 'archive'
                                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span>🗄️ আর্কাইভ ক্লাস</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100/80 text-amber-800">
                                  {sheetArcSubjects.length} বিষয়
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Step 2: Subject Filter */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] inline-flex items-center justify-center font-bold shrink-0">২</span>
                                বিষয় (Subject) নির্বাচন করুন *
                              </label>
                              {activeSheetSubjectList.length > 0 && (
                                <span className="text-[10px] text-slate-500 font-bold">
                                  {activeSheetSubjectList.length} টি বিষয় উপলব্ধ
                                </span>
                              )}
                            </div>
                            <select
                              value={currentSheetSubjectId}
                              onChange={(e) => handleSheetSubjectChange(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ed347d] bg-white shadow-2xs"
                            >
                              {activeSheetSubjectList.length === 0 ? (
                                <option value="">কোনো বিষয় তৈরি করা নেই</option>
                              ) : (
                                activeSheetSubjectList.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    📚 {s.title} ({s.modules.length} টি অধ্যায়)
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          {/* Step 3: Chapter Filter */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] inline-flex items-center justify-center font-bold shrink-0">৩</span>
                                টার্গেট অধ্যায় (Chapter) নির্বাচন করুন *
                              </label>
                              {availableSheetModules.length > 0 && (
                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                                  {availableSheetModules.length} টি অধ্যায়
                                </span>
                              )}
                            </div>
                            <select
                              value={targetModuleForSheet}
                              onChange={(e) => {
                                setTargetModuleForSheet(e.target.value);
                                setTargetLectureForSheet('');
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ed347d] bg-white shadow-2xs"
                            >
                              <option value="">-- অধ্যায় নির্বাচন করুন (ঐচ্ছিক) --</option>
                              {availableSheetModules.map((m) => (
                                <option key={m.id} value={m.id}>
                                  📖 {m.title} ({m.lectures?.length || 0} টি ক্লাস)
                                </option>
                              ))}
                            </select>
                            {availableSheetModules.length === 0 && (
                              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                এই বিষয়ের অধীনে এখনো কোনো অধ্যায় যোগ করা হয়নি।
                              </p>
                            )}
                          </div>

                          {/* Step 4: Class / Lecture Selection */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] inline-flex items-center justify-center font-bold shrink-0">৪</span>
                                টার্গেট ক্লাস / লেকচার নির্বাচন করুন *
                              </label>
                              {currentLectures.length > 0 && (
                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                                  {currentLectures.length} টি ক্লাস উপলব্ধ
                                </span>
                              )}
                            </div>
                            <select
                              value={targetLectureForSheet}
                              onChange={(e) => setTargetLectureForSheet(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#ed347d] bg-white shadow-2xs"
                            >
                              <option value="">-- সার্বজনীন / প্রথম ক্লাস --</option>
                              {currentLectures.map((lec, lIdx) => (
                                <option key={lec.id} value={lec.id}>
                                  ক্লাস {lIdx + 1}: {lec.title}
                                </option>
                              ))}
                            </select>
                            {currentLectures.length === 0 && (
                              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                এই অধ্যায়ে এখনো কোনো ভিডিও ক্লাস যোগ করা হয়নি। শিটটি অধ্যায়ের সাধারণ রিসোর্স হিসেবে সংরক্ষিত থাকবে।
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 4. Sheet Type Pills (Lecture Sheet vs Practice Sheet vs Handnote) */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            শিটের ধরন নির্বাচন করুন *
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setSheetType('lecture_sheet')}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                sheetType === 'lecture_sheet'
                                  ? 'bg-pink-50 border-[#ed347d] text-[#ed347d] font-black shadow-xs ring-2 ring-pink-100'
                                  : 'bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50'
                              }`}
                            >
                              <FileText className="w-4 h-4 mx-auto mb-1 text-[#ed347d]" />
                              <span className="text-xs block">📖 লেকচার শিট</span>
                              <span className="text-[9px] text-slate-400 block font-normal">ক্লাস নোট</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSheetType('practice_sheet')}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                sheetType === 'practice_sheet'
                                  ? 'bg-amber-50 border-amber-500 text-amber-900 font-black shadow-xs ring-2 ring-amber-100'
                                  : 'bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50'
                              }`}
                            >
                              <BookOpen className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                              <span className="text-xs block">📝 প্র্যাকটিস শিট</span>
                              <span className="text-[9px] text-slate-400 block font-normal">অনুশীলনী</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSheetType('handnote')}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                sheetType === 'handnote'
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-black shadow-xs ring-2 ring-indigo-100'
                                  : 'bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50'
                              }`}
                            >
                              <Award className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                              <span className="text-xs block">✍️ হ্যান্ডনোট</span>
                              <span className="text-[9px] text-slate-400 block font-normal">টিচার সামারি</span>
                            </button>
                          </div>
                        </div>

                        {/* 5. Sheet Title */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">শিট / হ্যান্ডনোটের শিরোনাম *</label>
                          <input
                            type="text"
                            required
                            value={sheetTitle}
                            onChange={(e) => setSheetTitle(e.target.value)}
                            placeholder={
                              sheetType === 'practice_sheet'
                                ? 'যেমন: ক্লাস ০১ - ভেক্টর ম্যাথ প্র্যাকটিস ও প্রশ্নব্যাংক'
                                : 'যেমন: ক্লাস ০১ - ভেক্টর বেসিক থিওরি ও লেকচার শিট'
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] font-bold"
                          />
                        </div>

                        {/* 6. Upload Method: Drive/URL vs Device File Upload */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              শিট আপলোড মাধ্যম *
                            </label>
                            <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                              <button
                                type="button"
                                onClick={() => setSheetUploadMethod('link')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                  sheetUploadMethod === 'link'
                                    ? 'bg-white text-[#ed347d] shadow-2xs font-black'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                🌐 ড্রাইভ / অনলাইন লিঙ্ক
                              </button>
                              <button
                                type="button"
                                onClick={() => setSheetUploadMethod('file')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                  sheetUploadMethod === 'file'
                                    ? 'bg-white text-[#ed347d] shadow-2xs font-black'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                📁 ফাইল আপলোড
                              </button>
                            </div>
                          </div>

                          {sheetUploadMethod === 'link' ? (
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                গুগল ড্রাইভ বা সরাসরি PDF লিংক (URL) *
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={sheetLink}
                                  onChange={(e) => setSheetLink(e.target.value)}
                                  placeholder="https://drive.google.com/file/d/... বা সরাসরি PDF লিংক"
                                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#ed347d] bg-white"
                                />
                                {sheetLink.trim() && (
                                  <a
                                    href={sheetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-[#ed347d] text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                                    title="নতুন ট্যাবে লিংক ওপেন করে যাচাই করুন"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    টেস্ট
                                  </a>
                                )}
                              </div>
                              <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-[10px] text-amber-900 leading-relaxed space-y-0.5">
                                <p className="font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  গুগল ড্রাইভ লিঙ্ক ব্যবহারের টিপস:
                                </p>
                                <p className="text-amber-800">
                                  গুগল ড্রাইভে ফাইলটির <strong>Share ➔ General access</strong> অপশন &quot;<strong>Anyone with the link (Viewer)</strong>&quot; রাখুন, যাতে শিক্ষার্থীরা কোনো লগইন ঝামেলা ছাড়াই এক ক্লিকে শিট পড়তে ও ডাউনলোড করতে পারে।
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="relative border-2 border-dashed border-pink-200 hover:border-[#ed347d] bg-pink-50/20 hover:bg-pink-50/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all">
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setSheetFileName(file.name);
                                      const mb = (file.size / (1024 * 1024)).toFixed(1);
                                      setSheetSize(`${mb} MB`);
                                      const objectUrl = URL.createObjectURL(file);
                                      setSheetLink(objectUrl);
                                      if (!sheetTitle) {
                                        const autoName = file.name.replace(/\.pdf$/i, '');
                                        setSheetTitle(autoName);
                                      }
                                    }
                                  }}
                                />
                                <UploadCloud className="w-8 h-8 text-[#ed347d] mb-1.5" />
                                <span className="text-xs font-bold text-slate-700">
                                  {sheetFileName ? `নির্বাচিত ফাইল: ${sheetFileName}` : 'ডিভাইস থেকে PDF ফাইল ড্রপ করুন বা ব্রাউজ করুন'}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                  {sheetFileName ? `সাইজ: ${sheetSize} (ফাইলটি প্রস্তুত আছে)` : 'সর্বোচ্চ ৫০ মেগাবাইট (PDF format)'}
                                </span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* 7. Pages and Size Inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">মোট পৃষ্ঠা সংখ্যা</label>
                            <input
                              type="number"
                              min={1}
                              value={sheetPages}
                              onChange={(e) => setSheetPages(Number(e.target.value))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">ফাইলের সাইজ</label>
                            <input
                              type="text"
                              value={sheetSize}
                              onChange={(e) => setSheetSize(e.target.value)}
                              placeholder="3.5 MB"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md cursor-pointer transition-colors"
                        >
                          + {sheetType === 'practice_sheet' ? 'প্র্যাকটিস শিট যুক্ত করুন' : 'লেকচার শিট যুক্ত করুন'}
                        </button>
                      </form>
                    </div>

                    {/* Preview / Sheets summary */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">{course?.title}</h3>
                          <p className="text-xs text-slate-500">বর্তমান শিট তালিকা (বিষয় ➔ অধ্যায় ➔ শিট)</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {course?.totalSheets || 0} টি শিট
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                        {(() => {
                          const sections = course?.sections || [];
                          const modules = course?.modules || [];
                          const regularSections = sections.filter((s) => !s.isArchive && s.type !== 'archive' && !s.parentArchiveId);
                          const archiveSections = sections.filter((s) => (s.isArchive || s.type === 'archive') && !s.parentArchiveId);
                          const assignedModIds = new Set<string>();

                          // If course has configured sections
                          if (sections.length > 0) {
                            return (
                              <>
                                {/* 1. Regular Live Syllabus Subjects */}
                                {regularSections.map((sec, secIdx) => {
                                  const secModules = modules.filter((m) => m.parentSectionId === sec.id || (!m.parentSectionId && m.parentSectionTitle === sec.title));
                                  secModules.forEach((m) => assignedModIds.add(m.id));
                                  const totalSheets = secModules.reduce(
                                    (sum, m) => sum + m.lectures.flatMap((l) => l.notes || []).length,
                                    0
                                  );
                                  const isSecOpen =
                                    expandedPreviewSheetSections[sec.id] ??
                                    (secModules.some((m) => m.id === targetModuleForSheet) || secIdx === 0);

                                  return (
                                    <div key={sec.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                                      {/* Subject Header */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedPreviewSheetSections((prev) => ({ ...prev, [sec.id]: !isSecOpen }))
                                        }
                                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/90 transition-colors cursor-pointer select-none bg-white border-b border-slate-100"
                                      >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                            <Folder className="w-4 h-4 text-indigo-600" />
                                          </div>
                                          <div>
                                            <span className="text-xs font-black text-slate-800 block truncate">
                                              {sec.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                              {secModules.length} টি অধ্যায় • {totalSheets} টি শিট
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                            {secModules.length} অধ্যায়
                                          </span>
                                          {isSecOpen ? (
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                          )}
                                        </div>
                                      </button>

                                      {/* Chapters inside Subject */}
                                      {isSecOpen && (
                                        <div className="p-3 space-y-2">
                                          {secModules.map((mod) => {
                                            const notes = mod.lectures.flatMap((l) => l.notes || []);
                                            const isModOpen =
                                              expandedSheetChapters[mod.id] ?? (targetModuleForSheet === mod.id);

                                            return (
                                              <div key={mod.id} className={`bg-white rounded-xl border ${targetModuleForSheet === mod.id ? 'border-indigo-600 ring-1 ring-indigo-600/30' : 'border-slate-200'} overflow-hidden shadow-3xs`}>
                                                <div className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setExpandedSheetChapters((prev) => ({ ...prev, [mod.id]: !isModOpen }))
                                                    }
                                                    className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer select-none text-left"
                                                  >
                                                    <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-700 truncate">
                                                      {mod.title}
                                                    </span>
                                                  </button>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectModuleForSheet(mod.id);
                                                      }}
                                                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold cursor-pointer transition-colors ${
                                                        targetModuleForSheet === mod.id
                                                          ? 'bg-indigo-600 text-white shadow-2xs'
                                                          : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                                                      }`}
                                                      title="এই অধ্যায়টি শিট ফর্মের জন্য নির্বাচন করুন"
                                                    >
                                                      {targetModuleForSheet === mod.id ? '✓ নির্বাচিত' : 'টার্গেট'}
                                                    </button>
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600">
                                                      {notes.length} শিট
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setExpandedSheetChapters((prev) => ({ ...prev, [mod.id]: !isModOpen }))
                                                      }
                                                      className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                      {isModOpen ? (
                                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                      ) : (
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                      )}
                                                    </button>
                                                  </div>
                                                </div>

                                                {/* Sheets inside Chapter */}
                                                {isModOpen && (
                                                  <div className="p-2 pt-1 space-y-1.5 border-t border-slate-100 bg-slate-50/50">
                                                    {notes.map((note) => renderSheetCard(note, course.id, mod.title))}
                                                    {notes.length === 0 && (
                                                      <p className="text-[10px] text-slate-400 italic py-1 text-center">
                                                        এই অধ্যায়ে এখনো শিট সংযুক্ত করা হয়নি
                                                      </p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                          {secModules.length === 0 && (
                                            <p className="text-[11px] text-slate-400 italic py-2 text-center">
                                              এই বিষয়ে এখনো কোনো অধ্যায় যোগ করা হয়নি
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* 2. Archive Sections */}
                                {archiveSections.map((arc) => {
                                  const arcSubs = sections.filter((s) => s.parentArchiveId === arc.id);
                                  const directArcMods = modules.filter(
                                    (m) =>
                                      (m.parentSectionId === arc.id || m.parentArchiveId === arc.id) &&
                                      !arcSubs.some((s) => s.id === m.parentSectionId)
                                  );
                                  arcSubs.forEach((sub) => {
                                    modules
                                      .filter((m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title))
                                      .forEach((m) => assignedModIds.add(m.id));
                                  });
                                  directArcMods.forEach((m) => assignedModIds.add(m.id));

                                  const allArcMods = [
                                    ...arcSubs.flatMap((sub) => modules.filter((m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title))),
                                    ...directArcMods,
                                  ];
                                  const totalArcSheets = allArcMods.reduce(
                                    (sum, m) => sum + m.lectures.flatMap((l) => l.notes || []).length,
                                    0
                                  );
                                  const isArcOpen = expandedPreviewSheetSections[arc.id] ?? false;

                                  return (
                                    <div
                                      key={arc.id}
                                      className="bg-amber-50/50 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-2xs"
                                    >
                                      {/* Archive Section Header */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedPreviewSheetSections((prev) => ({ ...prev, [arc.id]: !isArcOpen }))
                                        }
                                        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-100/60 transition-colors cursor-pointer select-none bg-gradient-to-r from-amber-100/40 to-white border-b border-amber-200/80"
                                      >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                                            <Archive className="w-4 h-4 text-amber-700" />
                                          </div>
                                          <div>
                                            <span className="text-xs font-black text-amber-950 block truncate">
                                              {arc.title}
                                            </span>
                                            <span className="text-[10px] text-amber-800/80 font-medium">
                                              আর্কাইভ ব্যাচ • {allArcMods.length} অধ্যায় • {totalArcSheets} শিট
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                                            আর্কাইভ
                                          </span>
                                          {isArcOpen ? (
                                            <ChevronDown className="w-4 h-4 text-amber-800" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-amber-800" />
                                          )}
                                        </div>
                                      </button>

                                      {/* Inside Archive */}
                                      {isArcOpen && (
                                        <div className="p-3 space-y-2.5">
                                          {/* Child Subjects */}
                                          {arcSubs.map((sub) => {
                                            const subMods = modules.filter((m) => m.parentSectionId === sub.id || (!m.parentSectionId && m.parentSectionTitle === sub.title));
                                            const isSubOpen = expandedPreviewSheetSections[sub.id] ?? false;
                                            const subSheets = subMods.reduce(
                                              (sum, m) => sum + m.lectures.flatMap((l) => l.notes || []).length,
                                              0
                                            );

                                            return (
                                              <div
                                                key={sub.id}
                                                className="bg-white rounded-xl border border-amber-200 overflow-hidden"
                                              >
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setExpandedPreviewSheetSections((prev) => ({
                                                      ...prev,
                                                      [sub.id]: !isSubOpen,
                                                    }))
                                                  }
                                                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-amber-50/60 transition-colors cursor-pointer select-none"
                                                >
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="text-xs">📚</span>
                                                    <span className="text-xs font-bold text-slate-800 truncate">
                                                      {sub.title}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800">
                                                      {subMods.length} অধ্যায় • {subSheets} শিট
                                                    </span>
                                                    {isSubOpen ? (
                                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : (
                                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                  </div>
                                                </button>

                                                {/* Chapters under archive subject */}
                                                {isSubOpen && (
                                                  <div className="p-2 space-y-1.5 border-t border-amber-100 bg-amber-50/30">
                                                    {subMods.map((mod) => {
                                                      const notes = mod.lectures.flatMap((l) => l.notes || []);
                                                      const isModOpen =
                                                        expandedSheetChapters[mod.id] ??
                                                        (targetModuleForSheet === mod.id);

                                                      return (
                                                        <div
                                                          key={mod.id}
                                                          className={`bg-white rounded-lg border ${targetModuleForSheet === mod.id ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-200'} overflow-hidden`}
                                                        >
                                                          <div className="w-full p-2 flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
                                                            <button
                                                              type="button"
                                                              onClick={() =>
                                                                setExpandedSheetChapters((prev) => ({
                                                                  ...prev,
                                                                  [mod.id]: !isModOpen,
                                                                }))
                                                              }
                                                              className="flex items-center gap-1.5 overflow-hidden flex-1 cursor-pointer select-none text-left"
                                                            >
                                                              <BookOpen className="w-3 h-3 text-amber-700 shrink-0" />
                                                              <span className="text-[11px] font-bold text-slate-700 truncate">
                                                                {mod.title}
                                                              </span>
                                                            </button>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                              <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  handleSelectModuleForSheet(mod.id);
                                                                }}
                                                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                                                                  targetModuleForSheet === mod.id
                                                                    ? 'bg-amber-600 text-white shadow-2xs'
                                                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                                                }`}
                                                                title="এই অধ্যায়টি শিট ফর্মের জন্য নির্বাচন করুন"
                                                              >
                                                                {targetModuleForSheet === mod.id ? '✓ নির্বাচিত' : 'টার্গেট'}
                                                              </button>
                                                              <span className="text-[9px] text-slate-500 font-semibold">
                                                                {notes.length} শিট
                                                              </span>
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  setExpandedSheetChapters((prev) => ({
                                                                    ...prev,
                                                                    [mod.id]: !isModOpen,
                                                                  }))
                                                                }
                                                                className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                              >
                                                                {isModOpen ? (
                                                                  <ChevronDown className="w-3 h-3 text-slate-400" />
                                                                ) : (
                                                                  <ChevronRight className="w-3 h-3 text-slate-400" />
                                                                )}
                                                              </button>
                                                            </div>
                                                          </div>

                                                          {isModOpen && (
                                                            <div className="p-2 pt-1 space-y-1.5 border-t border-slate-100 bg-slate-50/50">
                                                              {notes.map((note) => renderSheetCard(note, course.id, mod.title))}
                                                              {notes.length === 0 && (
                                                                <p className="text-[10px] text-slate-400 italic py-1 text-center">
                                                                  কোনো শিট নেই
                                                                </p>
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}

                                          {/* Direct Archive Chapters */}
                                          {directArcMods.map((mod) => {
                                            const notes = mod.lectures.flatMap((l) => l.notes || []);
                                            const isModOpen =
                                              expandedSheetChapters[mod.id] ?? (targetModuleForSheet === mod.id);

                                            return (
                                              <div
                                                key={mod.id}
                                                className={`bg-white rounded-xl border ${targetModuleForSheet === mod.id ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-amber-200'} overflow-hidden`}
                                              >
                                                <div className="w-full p-2.5 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setExpandedSheetChapters((prev) => ({
                                                        ...prev,
                                                        [mod.id]: !isModOpen,
                                                      }))
                                                    }
                                                    className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer select-none text-left"
                                                  >
                                                    <Archive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-700 truncate">
                                                      {mod.title}
                                                    </span>
                                                  </button>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectModuleForSheet(mod.id);
                                                      }}
                                                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                                                        targetModuleForSheet === mod.id
                                                          ? 'bg-amber-600 text-white shadow-2xs'
                                                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                                      }`}
                                                      title="এই অধ্যায়টি শিট ফর্মের জন্য নির্বাচন করুন"
                                                    >
                                                      {targetModuleForSheet === mod.id ? '✓ নির্বাচিত' : 'টার্গেট'}
                                                    </button>
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800">
                                                      {notes.length} শিট
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setExpandedSheetChapters((prev) => ({
                                                          ...prev,
                                                          [mod.id]: !isModOpen,
                                                        }))
                                                      }
                                                      className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                      {isModOpen ? (
                                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                      ) : (
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                      )}
                                                    </button>
                                                  </div>
                                                </div>

                                                {isModOpen && (
                                                  <div className="p-2 pt-1 space-y-1 border-t border-slate-100 bg-slate-50/50">
                                                    {notes.map((note) => renderSheetCard(note, course.id, mod.title))}
                                                    {notes.length === 0 && (
                                                      <p className="text-[10px] text-slate-400 italic py-1 text-center">
                                                        কোনো শিট নেই
                                                      </p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* 3. Unassigned / Remaining Modules */}
                                {(() => {
                                  const remainingMods = modules.filter((m) => !assignedModIds.has(m.id));
                                  if (remainingMods.length === 0) return null;
                                  const isUnassignedOpen = expandedPreviewSheetSections['unassigned'] ?? false;
                                  const totalUnassignedSheets = remainingMods.reduce(
                                    (sum, m) => sum + m.lectures.flatMap((l) => l.notes || []).length,
                                    0
                                  );

                                  return (
                                    <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedPreviewSheetSections((prev) => ({
                                            ...prev,
                                            unassigned: !isUnassignedOpen,
                                          }))
                                        }
                                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors cursor-pointer select-none bg-white border-b border-slate-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Folder className="w-4 h-4 text-slate-500" />
                                          <span className="text-xs font-bold text-slate-700">
                                            অন্যান্য সরাসরি অধ্যায়সমূহ
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {remainingMods.length} অধ্যায় • {totalUnassignedSheets} শিট
                                          </span>
                                          {isUnassignedOpen ? (
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                          ) : (
                                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                          )}
                                        </div>
                                      </button>

                                      {isUnassignedOpen && (
                                        <div className="p-3 space-y-2">
                                          {remainingMods.map((mod) => {
                                            const notes = mod.lectures.flatMap((l) => l.notes || []);
                                            const isModOpen = expandedSheetChapters[mod.id] ?? false;
                                            return (
                                              <div
                                                key={mod.id}
                                                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                                              >
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setExpandedSheetChapters((prev) => ({ ...prev, [mod.id]: !isModOpen }))
                                                  }
                                                  className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer select-none"
                                                >
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="text-[11px] font-bold text-slate-700 truncate">
                                                      {mod.title}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                                                      {notes.length} শিট
                                                    </span>
                                                    {isModOpen ? (
                                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : (
                                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                  </div>
                                                </button>

                                                {isModOpen && (
                                                  <div className="p-2 pt-1 space-y-1.5 border-t border-slate-100 bg-slate-50/50">
                                                    {notes.map((note) => renderSheetCard(note, course.id, mod.title))}
                                                    {notes.length === 0 && (
                                                      <p className="text-[10px] text-slate-400 italic py-1 text-center">
                                                        কোনো শিট নেই
                                                      </p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </>
                            );
                          }

                          // Fallback if no sections configured
                          return modules.map((mod, idx) => {
                            const notes = mod.lectures.flatMap((l) => l.notes || []);
                            const isExpanded =
                              expandedSheetChapters[mod.id] ?? (targetModuleForSheet === mod.id || idx === 0);
                            return (
                              <div
                                key={mod.id}
                                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedSheetChapters((prev) => ({ ...prev, [mod.id]: !isExpanded }))
                                  }
                                  className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors cursor-pointer select-none"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span className="text-xs font-bold text-slate-800 truncate">{mod.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                                      {notes.length} টি শিট
                                    </span>
                                    {isExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="p-3 pt-1 space-y-1.5 border-t border-slate-200/60 bg-white/70">
                                    {notes.map((note) => renderSheetCard(note, course.id, mod.title))}
                                    {notes.length === 0 && (
                                      <p className="text-[11px] text-slate-400 italic py-1.5 text-center">
                                        এই অধ্যায়ে এখনো শিট সংযুক্ত করা হয়নি
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                        {modules.length === 0 && (
                          <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
                            এই কোর্সে কোনো অধ্যায় তৈরি করা নেই। আগে 'Sections / Chapters' থেকে অধ্যায় যোগ করুন।
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. EXAMS MODULE */}
          {/* ========================================================================= */}
          {activeMenu === 'exams' && (() => {
            const allDisplayedExams = teacherExams.length > 0 ? teacherExams : exams;

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Exam Submenu Quick Navigation Tabs */}
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
                  {[
                    { id: 'exams_all', label: 'সকল পরীক্ষা', icon: Award, count: allDisplayedExams.length },
                    { id: 'exams_create', label: '+ নতুন পরীক্ষা তৈরি', icon: PlusCircle },
                    { 
                      id: 'exams_evaluation', 
                      label: '📝 CQ খাতা মূল্যায়ন', 
                      icon: FileCheck, 
                      count: detailedSubmissions.filter((s) => s.status === 'pending_evaluation' || (s.cqImages && Object.keys(s.cqImages).length > 0 && s.status !== 'evaluated')).length 
                    },
                    { id: 'exams_results', label: 'ফলাফল ও র‍্যাংকিং', icon: BarChart3, count: detailedSubmissions.length },
                    { id: 'exams_qbank', label: 'প্রশ্ন ব্যাংক', icon: BookMarked, count: questionBanks.length },
                    { id: 'exams_mcq', label: 'MCQ প্রশ্নমালা', icon: ListChecks },
                    { id: 'exams_written', label: 'সৃজনশীল / লিখিত', icon: FileCheck },
                    { id: 'exams_settings', label: 'এক্সাম সেটিংস', icon: Sliders },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isTabActive = activeSubMenu === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSubMenu(tab.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isTabActive
                            ? 'bg-[#ed347d] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            isTabActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ========================================================================= */}
                {/* 4.1 SUBMENU: CREATE EXAM (MCQ + CQ COMBINED / STANDALONE) */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_create' && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-base font-black text-slate-900">অনলাইন মডেল টেস্ট ও এক্সাম ক্রিয়েটর</h2>
                        <p className="text-xs text-slate-500">MCQ এবং CQ সৃজনশীল লিখিত পরীক্ষার পূর্ণাঙ্গ প্রশ্নপত্র তৈরি করুন</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-50 text-[#ed347d] border border-pink-200 self-start sm:self-auto">
                        {examType === 'combined' ? '🎯 সমন্বিত পরীক্ষা (১০০ মার্কস)' : examType === 'written' ? '✍️ সৃজনশীল লিখিত' : '📝 MCQ পরীক্ষা'}
                      </span>
                    </div>

                    {/* Exam Type Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">পরীক্ষার ধরন নির্বাচন করুন *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setExamType('combined');
                            setExamTotalMarks(100);
                            setExamDuration(130);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            examType === 'combined'
                              ? 'border-[#ed347d] bg-[#fff2f7] shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Flame className={`w-4 h-4 ${examType === 'combined' ? 'text-[#ed347d]' : 'text-slate-500'}`} />
                            <span className="text-xs font-black text-slate-800">MCQ + CQ সমন্বিত পরীক্ষা</span>
                          </div>
                          <p className="text-[11px] text-slate-500">১ম ধাপে MCQ (৩০ মিনিট) এবং ২য় ধাপে সৃজনশীল CQ (১০০ মিনিট), মোট ১০০ মার্কস</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExamType('mcq');
                            setExamTotalMarks(25);
                            setExamDuration(25);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            examType === 'mcq'
                              ? 'border-[#ed347d] bg-[#fff2f7] shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <ListChecks className={`w-4 h-4 ${examType === 'mcq' ? 'text-[#ed347d]' : 'text-slate-500'}`} />
                            <span className="text-xs font-black text-slate-800">শুধুমাত্র MCQ পরীক্ষা</span>
                          </div>
                          <p className="text-[11px] text-slate-500">সাপ্তাহিক ও অধ্যায়ভিত্তিক বহুনির্বাচনী প্রশ্নমালা ও স্বয়ংক্রিয় মূল্যায়ন</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExamType('written');
                            setExamTotalMarks(70);
                            setExamDuration(100);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            examType === 'written'
                              ? 'border-[#ed347d] bg-[#fff2f7] shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <FileCheck className={`w-4 h-4 ${examType === 'written' ? 'text-[#ed347d]' : 'text-slate-500'}`} />
                            <span className="text-xs font-black text-slate-800">শুধুমাত্র সৃজনশীল / CQ পরীক্ষা</span>
                          </div>
                          <p className="text-[11px] text-slate-500">উদ্দীপক ও ক, খ, গ, ঘ সাব-প্রশ্নের পূর্ণাঙ্গ লিখিত মূল্যায়ন</p>
                        </button>
                      </div>
                    </div>

                    {/* Basic Info & Scheduling */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">পরীক্ষার নাম *</label>
                        <input
                          type="text"
                          value={examTitle}
                          onChange={(e) => setExamTitle(e.target.value)}
                          placeholder="উদা: পদার্থবিজ্ঞান ১ম পত্র পূর্ণাঙ্গ মডেল টেস্ট (MCQ + CQ ১০০ মার্কস)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">টার্গেট কোর্স *</label>
                        <select
                          value={examCourseId}
                          onChange={(e) => setExamCourseId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                        >
                          {teacherCourses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Schedule (শিডিউল) Options */}
                    <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#ed347d]" />
                        শিডিউল ও লাইভ টাইমিং সেটিংস
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            পরীক্ষা শুরুর তারিখ ও সময় (ঐচ্ছিক)
                          </label>
                          <input
                            type="datetime-local"
                            value={examStartTime}
                            onChange={(e) => setExamStartTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            পরীক্ষা সমাপ্তির তারিখ ও সময় (ঐচ্ছিক)
                          </label>
                          <input
                            type="datetime-local"
                            value={examEndTime}
                            onChange={(e) => setExamEndTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        * শুরুর সময় ফাঁকা রাখলে পরীক্ষাটি সাবমিটের সাথে সাথেই লাইভ হয়ে যাবে। ভবিষ্যৎ সময় দিলে শিডিউল কাউন্টডাউন শো করবে।
                      </p>
                    </div>

                    {/* Duration & Marks Configuration */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {examType === 'combined' ? (
                        <>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">MCQ সময় (মিনিট)</label>
                            <input
                              type="number"
                              value={examMcqDuration}
                              onChange={(e) => setExamMcqDuration(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">CQ সময় (মিনিট)</label>
                            <input
                              type="number"
                              value={examCqDuration}
                              onChange={(e) => setExamCqDuration(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">MCQ মার্কস</label>
                            <input
                              type="number"
                              value={examMcqMarks}
                              onChange={(e) => setExamMcqMarks(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">CQ মার্কস</label>
                            <input
                              type="number"
                              value={examCqMarks}
                              onChange={(e) => setExamCqMarks(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">সময় (মিনিট)</label>
                            <input
                              type="number"
                              value={examDuration}
                              onChange={(e) => setExamDuration(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">পূর্ণমান</label>
                            <input
                              type="number"
                              value={examTotalMarks}
                              onChange={(e) => setExamTotalMarks(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">কাট মার্কস (Cut Marks)</label>
                        <input
                          type="number"
                          value={examCutMarks}
                          onChange={(e) => setExamCutMarks(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">ভুল উত্তরের নেগেটিভ মার্ক</label>
                        <select
                          value={examNegativeMark}
                          onChange={(e) => setExamNegativeMark(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        >
                          <option value={0.25}>- ০.২৫ (স্ট্যান্ডার্ড)</option>
                          <option value={0.5}>- ০.৫০ (ভার্সিটি/মেডিকেল)</option>
                          <option value={0}>০.০০ (কোনো নেগেটিভ নেই)</option>
                        </select>
                      </div>
                    </div>

                    {/* SECTION: MCQ BUILDER (When combined or mcq) */}
                    {(examType === 'combined' || examType === 'mcq') && (
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <ListChecks className="w-4 h-4 text-[#ed347d]" />
                            MCQ প্রশ্ন যোগ করুন ({builtQuestions.length} টি প্রস্তুত)
                          </span>
                        </div>

                        <input
                          type="text"
                          placeholder="প্রশ্নের মূল টেক্সট লিখুন..."
                          value={qText}
                          onChange={(e) => setQText(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          {qOptions.map((opt, idx) => (
                            <input
                              key={idx}
                              type="text"
                              placeholder={`অপশন ${idx + 1} (${['ক', 'খ', 'গ', 'ঘ'][idx]})`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...qOptions];
                                updated[idx] = e.target.value;
                                setQOptions(updated);
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={qCorrect}
                            onChange={(e) => setQCorrect(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                          >
                            <option value={0}>সঠিক উত্তর: অপশন ১ (ক)</option>
                            <option value={1}>সঠিক উত্তর: অপশন ২ (খ)</option>
                            <option value={2}>সঠিক উত্তর: অপশন ৩ (গ)</option>
                            <option value={3}>সঠিক উত্তর: অপশন ৪ (ঘ)</option>
                          </select>

                          <input
                            type="text"
                            placeholder="ব্যাখ্যা / শর্টকাট (ঐচ্ছিক)"
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddQuestionToDraft}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          + খসড়ায় MCQ যোগ করুন
                        </button>

                        {/* List of draft MCQs */}
                        {builtQuestions.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            {builtQuestions.map((q, idx) => (
                              <div key={q.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs gap-3">
                                <div className="truncate">
                                  <span className="font-bold text-[#ed347d] mr-2">Q{idx + 1}.</span>
                                  <span className="text-slate-800 font-medium">{q.text}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestionFromDraft(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-1 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION: CQ CREATIVE QUESTIONS BUILDER (When combined or written) */}
                    {(examType === 'combined' || examType === 'written') && (
                      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-amber-700" />
                            সৃজনশীল প্রশ্ন (CQ) যোগ করুন ({builtCreativeQuestions.length} টি প্রস্তুত)
                          </span>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-900 block mb-1">উদ্দীপক / Scenario *</label>
                          <textarea
                            rows={3}
                            value={cqStem}
                            onChange={(e) => setCqStem(e.target.value)}
                            placeholder="সৃজনশীল প্রশ্নের উদ্দীপক লিখুন..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">(ক) জ্ঞানমূলক প্রশ্ন (১ মার্ক) *</label>
                            <input
                              type="text"
                              value={cqSubKa}
                              onChange={(e) => setCqSubKa(e.target.value)}
                              placeholder="প্রশ্ন লিখুন..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            />
                            <input
                              type="text"
                              value={cqAnsKa}
                              onChange={(e) => setCqAnsKa(e.target.value)}
                              placeholder="আদর্শ উত্তর (ঐচ্ছিক)"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">(খ) অনুধাবনমূলক প্রশ্ন (২ মার্ক) *</label>
                            <input
                              type="text"
                              value={cqSubKha}
                              onChange={(e) => setCqSubKha(e.target.value)}
                              placeholder="প্রশ্ন লিখুন..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            />
                            <input
                              type="text"
                              value={cqAnsKha}
                              onChange={(e) => setCqAnsKha(e.target.value)}
                              placeholder="আদর্শ উত্তর (ঐচ্ছিক)"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">(গ) প্রয়োগমূলক প্রশ্ন (৩ মার্ক) *</label>
                            <input
                              type="text"
                              value={cqSubGa}
                              onChange={(e) => setCqSubGa(e.target.value)}
                              placeholder="প্রশ্ন লিখুন..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            />
                            <input
                              type="text"
                              value={cqAnsGa}
                              onChange={(e) => setCqAnsGa(e.target.value)}
                              placeholder="আদর্শ সমাধান (ঐচ্ছিক)"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">(ঘ) উচ্চতর দক্ষতামূলক প্রশ্ন (৪ মার্ক) *</label>
                            <input
                              type="text"
                              value={cqSubGha}
                              onChange={(e) => setCqSubGha(e.target.value)}
                              placeholder="প্রশ্ন লিখুন..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                            />
                            <input
                              type="text"
                              value={cqAnsGha}
                              onChange={(e) => setCqAnsGha(e.target.value)}
                              placeholder="আদর্শ সমাধান (ঐচ্ছিক)"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddCreativeQuestionToDraft}
                          className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          + খসড়ায় সৃজনশীল প্রশ্ন (CQ) যোগ করুন
                        </button>

                        {/* List of draft CQs */}
                        {builtCreativeQuestions.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-amber-200">
                            {builtCreativeQuestions.map((cq, idx) => (
                              <div key={cq.id} className="p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs gap-3">
                                <div className="truncate">
                                  <span className="font-bold text-amber-700 mr-2">CQ {idx + 1}.</span>
                                  <span className="text-slate-800 font-medium truncate">{cq.stem}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCreativeQuestionFromDraft(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-1 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Result Publication Mode Selection */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#ed347d]" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          ফলাফল প্রকাশের নিয়ম (Result Publication Mode)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label 
                          onClick={() => setExamResultPublishType('instant')}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            examResultPublishType === 'instant'
                              ? 'border-[#ed347d] bg-pink-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="resultPublishMode"
                            checked={examResultPublishType === 'instant'}
                            onChange={() => setExamResultPublishType('instant')}
                            className="mt-0.5 accent-[#ed347d]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800 block flex items-center gap-1.5">
                              ⚡ তাত্ক্ষণিক ফলাফল প্রকাশ (Instant)
                            </span>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              পরীক্ষা শেষ হওয়া মাত্রই শিক্ষার্থীরা তাদের প্রাপ্ত নম্বর, সঠিক/ভুল এবং লিডারবোর্ড র‍্যাংক দেখতে পাবে। (MCQ এর জন্য আদর্শ)
                            </p>
                          </div>
                        </label>

                        <label 
                          onClick={() => setExamResultPublishType('later')}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            examResultPublishType === 'later'
                              ? 'border-[#ed347d] bg-pink-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="resultPublishMode"
                            checked={examResultPublishType === 'later'}
                            onChange={() => setExamResultPublishType('later')}
                            className="mt-0.5 accent-[#ed347d]"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800 block flex items-center gap-1.5">
                              ⏳ পরে প্রকাশ (শিক্ষকের খাতা মূল্যায়ন)
                            </span>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              শিক্ষার্থীর উত্তরের স্ক্রিপ্ট ও খাতা শিক্ষক ম্যানুয়ালি দেখে নম্বর ও ফিডব্যাক প্রদান করার পর ফলাফল দৃশ্যমান হবে। (CQ/লিখিত পরীক্ষার জন্য আদর্শ)
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Final Action Bar */}
                    <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="font-black text-[#ed347d] block">
                          খসড়া প্রস্তুতি: {builtQuestions.length} টি MCQ • {builtCreativeQuestions.length} টি CQ
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {examStartTime ? `শিডিউল অনুযায়ী ${new Date(examStartTime).toLocaleString('bn-BD')} এ লাইভ হবে` : 'পাবলিশ করার সাথে সাথে শিক্ষার্থীদের কাছে লাইভ হবে'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveExam}
                        className="px-6 py-2.5 rounded-xl text-xs font-black text-white ph-btn-pink shadow-md hover:scale-[1.02] transition-transform"
                      >
                        🚀 পরীক্ষাটি সফলভাবে পাবলিশ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 4.2 SUBMENU: QUESTION BANK MANAGER */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_qbank' && (
                  <div className="space-y-6">
                    {/* Add / Edit Question Bank Form */}
                    <form onSubmit={handleSaveQuestionBank} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-base font-black text-slate-900">
                            {editingQbId ? 'প্রশ্নব্যাংক তথ্য আপডেট করুন' : 'নতুন প্রশ্নব্যাংক ড্রাইভ/ফাইল লিংক যুক্ত করুন'}
                          </h3>
                          <p className="text-xs text-slate-500">কোর্সের শিক্ষার্থীদের জন্য বিগত বছরের সলভিং প্রশ্নব্যাংক আপলোড করুন</p>
                        </div>
                        {editingQbId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQbId(null);
                              setQbTitle('');
                              setQbChapter('');
                              setQbPdfUrl('');
                            }}
                            className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800"
                          >
                            বাতিল করুন
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700 block mb-1">প্রশ্নব্যাংক শিরোনাম *</label>
                          <input
                            type="text"
                            value={qbTitle}
                            onChange={(e) => setQbTitle(e.target.value)}
                            placeholder="উদা: ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট বিগত ২০ বছরের প্রশ্নব্যাংক"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">টার্গেট কোর্স *</label>
                          <select
                            value={qbCourseId}
                            onChange={(e) => setQbCourseId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          >
                            {teacherCourses.map((c) => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">বিষয় *</label>
                          <select
                            value={qbSubject}
                            onChange={(e) => setQbSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          >
                            <option value="Physics">পদার্থবিজ্ঞান (Physics)</option>
                            <option value="Higher Math">উচ্চতর গণিত (Higher Math)</option>
                            <option value="Chemistry">রসায়ন (Chemistry)</option>
                            <option value="Biology">জীববিজ্ঞান (Biology)</option>
                            <option value="English">ইংরেজি (English)</option>
                            <option value="GK">সাধারণ জ্ঞান (GK)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">অধ্যায় / টপিক</label>
                          <input
                            type="text"
                            value={qbChapter}
                            onChange={(e) => setQbChapter(e.target.value)}
                            placeholder="ভেক্টর, ক্যালকুলাস ইত্যাদি"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">সাল / সেশন</label>
                          <input
                            type="text"
                            value={qbYear}
                            onChange={(e) => setQbYear(e.target.value)}
                            placeholder="২০০৪-২০২৪"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">ক্যাটাগরি</label>
                          <select
                            value={qbType}
                            onChange={(e) => setQbType(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          >
                            <option value="varsity">ভার্সিটি 'ক' ইউনিট</option>
                            <option value="engineering">ইঞ্জিনিয়ারিং ও বুয়েট</option>
                            <option value="medical">মেডিকেল ও ডেন্টাল</option>
                            <option value="board">বোর্ড স্ট্যান্ডার্ড</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">পৃষ্ঠা সংখ্যা</label>
                          <input
                            type="number"
                            value={qbPages}
                            onChange={(e) => setQbPages(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">ফাইল সাইজ</label>
                          <input
                            type="text"
                            value={qbFileSize}
                            onChange={(e) => setQbFileSize(e.target.value)}
                            placeholder="14.5 MB"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">গুগল ড্রাইভ বা ফাইল লিংক *</label>
                          <input
                            type="url"
                            value={qbPdfUrl}
                            onChange={(e) => setQbPdfUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md"
                        >
                          {editingQbId ? '💾 পরিবর্তন সেভ করুন' : '+ প্রশ্নব্যাংক আপলোড ও সেভ করুন'}
                        </button>
                      </div>
                    </form>

                    {/* Question Bank Cards Grid */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">সংরক্ষিত প্রশ্নব্যাংক তালিকা ({questionBanks.length})</h4>
                          <p className="text-xs text-slate-500">শিক্ষার্থীরা এই প্রশ্নব্যাংকগুলো ক্লাসরুম থেকে পড়তে ও ডাউনলোড করতে পারবে</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {['all', 'varsity', 'engineering', 'medical', 'board'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setQbFilterType(type)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                                qbFilterType === type
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {type === 'all' ? 'সকল' : type === 'varsity' ? 'ভার্সিটি' : type === 'engineering' ? 'ইঞ্জিনিয়ারিং' : type === 'medical' ? 'মেডিকেল' : 'বোর্ড'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {questionBanks
                          .filter((qb) => qbFilterType === 'all' || qb.type === qbFilterType)
                          .map((qb) => (
                            <div key={qb.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-pink-300 shadow-2xs flex flex-col justify-between gap-3 group">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-50 text-[#ed347d] border border-pink-200">
                                    {qb.subject}
                                  </span>
                                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                    📅 {qb.year || '২০২৪'}
                                  </span>
                                </div>

                                <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-[#ed347d] transition-colors">
                                  {qb.title}
                                </h5>

                                <p className="text-[11px] text-slate-500">
                                  অধ্যায়: {qb.chapter} • {qb.pages} পৃষ্ঠা • {qb.fileSize}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                                <a
                                  href={qb.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  ড্রাইভ ফাইল
                                </a>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditQuestionBank(qb)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    title="এডিট"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteQuestionBank(qb.id)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                                    title="মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 4.3 SUBMENU: MCQ QUESTIONS DEDICATED VIEW */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_mcq' && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">MCQ প্রশ্ন সম্ভার ও ব্যাংক</h3>
                        <p className="text-xs text-slate-500">সকল পরীক্ষার MCQ প্রশ্নাবলী এবং সঠিক উত্তর ও সমাধান তালিকা</p>
                      </div>
                      <button
                        onClick={() => {
                          setExamType('mcq');
                          setActiveSubMenu('exams_create');
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white ph-btn-pink flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        নতুন MCQ পরীক্ষা
                      </button>
                    </div>

                    <div className="space-y-4">
                      {allDisplayedExams.flatMap((ex) => (ex.questions || []).map((q) => ({ ...q, examTitle: ex.title }))).length > 0 ? (
                        <div className="space-y-3">
                          {allDisplayedExams.flatMap((ex) => (ex.questions || []).map((q) => ({ ...q, examTitle: ex.title }))).map((q, qIdx) => (
                            <div key={q.id || qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#ed347d]">প্রশ্ন {qIdx + 1} ({q.examTitle})</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px]">
                                  সঠিক অপশন: {['ক', 'খ', 'গ', 'ঘ'][q.correctOption]}
                                </span>
                              </div>
                              <p className="font-bold text-slate-800">{q.text}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                                {q.options.map((opt: string, optI: number) => (
                                  <div
                                    key={optI}
                                    className={`p-2 rounded-lg border ${
                                      optI === q.correctOption ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    ({['ক', 'খ', 'গ', 'ঘ'][optI]}) {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                          এখনো কোনো MCQ প্রশ্ন তৈরি করা হয়নি।
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 4.4 SUBMENU: WRITTEN QUESTIONS DEDICATED VIEW */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_written' && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">সৃজনশীল ও লিখিত প্রশ্ন সম্ভার</h3>
                        <p className="text-xs text-slate-500">উদ্দীপক ও ক, খ, গ, ঘ সাব-প্রশ্নের পূর্ণাঙ্গ তালিকা ও আদর্শ মডেল সমাধান</p>
                      </div>
                      <button
                        onClick={() => {
                          setExamType('written');
                          setActiveSubMenu('exams_create');
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white ph-btn-pink flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        নতুন সৃজনশীল পরীক্ষা
                      </button>
                    </div>

                    <div className="space-y-4">
                      {allDisplayedExams.flatMap((ex) => (ex.creativeQuestions || []).map((cq) => ({ ...cq, examTitle: ex.title }))).length > 0 ? (
                        <div className="space-y-4">
                          {allDisplayedExams.flatMap((ex) => (ex.creativeQuestions || []).map((cq) => ({ ...cq, examTitle: ex.title }))).map((cq, idx) => (
                            <div key={cq.id || idx} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800">
                                  {cq.title} <span className="text-slate-400">({cq.examTitle})</span>
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  সৃজনশীল পূর্ণমান ১০
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                                <strong>উদ্দীপক:</strong> {cq.stem}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {cq.subQuestions.map((sq: any) => (
                                  <div key={sq.part} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                    <div className="flex items-center justify-between font-bold text-slate-800">
                                      <span>({sq.part}) {sq.text}</span>
                                      <span className="text-[#ed347d] text-[10px]">{sq.marks} মার্কস</span>
                                    </div>
                                    <p className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded">
                                      আদর্শ উত্তর: {sq.sampleAnswer}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                          এখনো কোনো সৃজনশীল (CQ) প্রশ্ন তৈরি করা হয়নি।
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 4.5 SUBMENU: EXAM RESULTS & RANKING */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_results' && (() => {
                  const isAll = !resultsFilterExamId || resultsFilterExamId === 'all';
                  const targetExamId = isAll ? 'all' : resultsFilterExamId;
                  const selectedExamObj = isAll ? null : allDisplayedExams.find((e) => e.id === targetExamId);
                  const examSubs = isAll ? detailedSubmissions : detailedSubmissions.filter((s) => s.examId === targetExamId);

                  const avgScore = examSubs.length > 0 ? (examSubs.reduce((s, i) => s + i.score, 0) / examSubs.length).toFixed(1) : 0;
                  const highestScore = examSubs.length > 0 ? Math.max(...examSubs.map((i) => i.score)) : 0;
                  const passedCount = examSubs.filter((i) => i.isPassed).length;
                  const passRate = examSubs.length > 0 ? Math.round((passedCount / examSubs.length) * 100) : 0;

                  return (
                    <div className="space-y-5">
                      {/* Filter Bar & Summary */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-slate-900">পরীক্ষার ফলাফল ও মেধা র‍্যাংকিং</h3>
                          <p className="text-xs text-slate-500">পরীক্ষার্থীদের প্রাপ্ত নম্বর, সঠিক/ভুল এবং মেধা অবস্থান</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-600">পরীক্ষা ফিল্টার:</label>
                          <select
                            value={targetExamId}
                            onChange={(e) => setResultsFilterExamId(e.target.value)}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#ed347d]"
                          >
                            <option value="all">🌐 সকল পরীক্ষা ({detailedSubmissions.length} টি জমা)</option>
                            {allDisplayedExams.map((ex) => {
                              const count = detailedSubmissions.filter(s => s.examId === ex.id).length;
                              return (
                                <option key={ex.id} value={ex.id}>{ex.title} ({count} টি)</option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Batch Result Publish Action Banner if any evaluated unreleased scripts exist */}
                      {detailedSubmissions.some((s) => s.status === 'evaluated') && (
                        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 p-5 sm:p-6 rounded-3xl text-white shadow-xl shadow-pink-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/20">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                ফলাফল প্রকাশের জন্য প্রস্তুত
                              </span>
                              <span className="text-xs font-bold text-pink-100 bg-black/20 px-2.5 py-0.5 rounded-full">
                                {detailedSubmissions.filter((s) => s.status === 'evaluated').length} টি মূল্যায়িত খাতা অপেক্ষমাণ
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-black tracking-tight">
                              📢 মূল্যায়িত সকল পরীক্ষার ফলাফল ও মেধা তালিকা একসাথে প্রকাশ করুন
                            </h3>
                            <p className="text-xs text-pink-100/90 max-w-xl leading-relaxed">
                              সকল খাতা মূল্যায়নের পর একসাথে ফলাফল প্রকাশ করলে শিক্ষার্থীরা একযোগে নিজ নিজ ড্যাশবোর্ডে প্রাপ্ত নম্বর, খাতার মার্কিং ও মেধা অবস্থান দেখতে পারবে।
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              publishBatchResults(targetExamId === 'all' ? undefined : targetExamId);
                            }}
                            className="px-6 py-3.5 rounded-2xl bg-white text-purple-900 hover:bg-pink-50 font-black text-xs sm:text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
                          >
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span>একসাথে সকল ফলাফল প্রকাশ করুন ({detailedSubmissions.filter((s) => s.status === 'evaluated').length})</span>
                          </button>
                        </div>
                      )}

                      {/* Stats Overview Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-400 block mb-0.5">মোট অংশগ্রহণকারী</span>
                          <div className="text-2xl font-black text-slate-800">{examSubs.length} জন</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-400 block mb-0.5">সর্বোচ্চ স্কোর</span>
                          <div className="text-2xl font-black text-emerald-600">{highestScore}</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-400 block mb-0.5">গড় স্কোর</span>
                          <div className="text-2xl font-black text-blue-600">{avgScore}</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-400 block mb-0.5">পাসের হার</span>
                          <div className="text-2xl font-black text-[#ed347d]">{passRate}%</div>
                        </div>
                      </div>

                      {/* Submissions Table */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900">
                            পরীক্ষার্থীদের ফলাফল তালিকা ({examSubs.length})
                          </h4>
                          {selectedExamObj ? (
                            <span className="text-xs text-slate-500">
                              পূর্ণমান: {selectedExamObj.totalMarks} • পাস মার্কস: {selectedExamObj.passMarks || 40}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              সকল পরীক্ষার সম্মিলিত ফলাফল তালিকা
                            </span>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-bold">
                              <tr>
                                <th className="p-3">মেধা স্থান</th>
                                <th className="p-3">শিক্ষার্থী</th>
                                <th className="p-3">কলেজ / মোবাইল</th>
                                <th className="p-3">MCQ স্কোর</th>
                                <th className="p-3">CQ স্কোর</th>
                                <th className="p-3">মোট স্কোর</th>
                                <th className="p-3">স্ট্যাটাস</th>
                                <th className="p-3">জমার সময়</th>
                                <th className="p-3 text-center">খাতা মূল্যায়ন</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {examSubs.map((sub, idx) => (
                                <tr key={sub.id || idx} className="hover:bg-slate-50">
                                  <td className="p-3 font-black text-[#ed347d]">#{sub.rank || idx + 1}</td>
                                  <td className="p-3 font-bold text-slate-900">{sub.studentName}</td>
                                  <td className="p-3 text-slate-500">{sub.studentCollege}</td>
                                  <td className="p-3 font-mono">{sub.mcqScore !== undefined ? sub.mcqScore : '-'}</td>
                                  <td className="p-3 font-mono">{sub.cqScore !== undefined ? sub.cqScore : '-'}</td>
                                  <td className="p-3 font-black text-slate-800">{sub.score} / {sub.totalMarks}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                      sub.status === 'pending_evaluation'
                                        ? 'bg-amber-100 text-amber-800'
                                        : sub.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {sub.status === 'pending_evaluation'
                                        ? '⏳ মূল্যায়ন বাকি'
                                        : sub.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-400">{sub.submittedAt}</td>
                                  <td className="p-3 text-center">
                                    {sub.examType === 'combined' || sub.examType === 'written' || (sub.cqImages && Object.keys(sub.cqImages).length > 0) ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEvaluatingSubmission(sub);
                                          setEvalPartMarks(sub.partMarks || {});
                                          setEvalTeacherFeedback(sub.teacherFeedback || '');
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                          sub.status === 'evaluated'
                                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                            : 'bg-[#ed347d] text-white hover:bg-[#d02568]'
                                        }`}
                                      >
                                        <FileCheck className="w-3.5 h-3.5" />
                                        {sub.status === 'evaluated' ? '✏️ পুনরায় মূল্যায়ন' : '📝 খাতা মূল্যায়ন করুন'}
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 text-[11px]">- (শুধু MCQ)</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ========================================================================= */}
                {/* 4.5.2 SUBMENU: CQ SCRIPT EVALUATION (খাতা মূল্যায়ন) */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_evaluation' && (() => {
                  const cqSubs = detailedSubmissions.filter(
                    (s) => s.examType === 'combined' || s.examType === 'written' || (s.cqImages && Object.keys(s.cqImages).length > 0)
                  );
                  const pendingSubs = cqSubs.filter((s) => s.status === 'pending_evaluation' || s.status !== 'evaluated');
                  const evaluatedSubs = cqSubs.filter((s) => s.status === 'evaluated');

                  const displayedSubs = evaluationTab === 'pending' 
                    ? pendingSubs 
                    : evaluationTab === 'evaluated' 
                    ? evaluatedSubs 
                    : cqSubs;

                  return (
                    <div className="space-y-6">
                      {/* Top Header Card */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                        <div className="space-y-1">
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-[#ed347d]" />
                            <span>লিখিত (CQ) খাতা মূল্যায়ন স্টুডিও</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-[#ed347d] text-xs font-black">
                              {pendingSubs.length} টি মূল্যায়ন বাকি
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            শিক্ষার্থীদের আপলোডকৃত লিখিত খাতার ছবি ও উত্তরপত্র দেখুন, প্রতিটি অংশে নম্বর দিন এবং সরাসরি ফলাফল প্রকাশ করুন।
                          </p>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                          {[
                            { id: 'all', label: `সকল (${cqSubs.length})` },
                            { id: 'pending', label: `মূল্যায়ন বাকি (${pendingSubs.length})` },
                            { id: 'evaluated', label: `মূল্যায়িত (${evaluatedSubs.length})` },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setEvaluationTab(t.id as any)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                evaluationTab === t.id
                                  ? 'bg-white text-[#ed347d] shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Batch Publish Banner */}
                      {evaluatedSubs.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 p-5 sm:p-6 rounded-3xl text-white shadow-xl shadow-pink-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/20">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                ফলাফল প্রকাশের জন্য প্রস্তুত
                              </span>
                              <span className="text-xs font-bold text-pink-100 bg-black/20 px-2.5 py-0.5 rounded-full">
                                {evaluatedSubs.length} জন শিক্ষার্থীর খাতা মূল্যায়িত (অপ্রকাশিত)
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-black tracking-tight">
                              📢 একসাথে সকল পরীক্ষার্থীর চূড়ান্ত ফলাফল ও মেধা তালিকা প্রকাশ করুন
                            </h3>
                            <p className="text-xs text-pink-100/90 max-w-xl leading-relaxed">
                              আপনি খাতাগুলো একটি একটি করে মূল্যায়ন করেছেন। এখন এই বাটনে ক্লিক করলেই সকল শিক্ষার্থীর CQ মার্কস, পূর্ণাঙ্গ স্কোর ও সঠিক মেধা তালিকা সবার জন্য একযোগে উন্মুক্ত হয়ে যাবে।
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              publishBatchResults();
                            }}
                            className="px-6 py-3.5 rounded-2xl bg-white text-purple-900 hover:bg-pink-50 font-black text-xs sm:text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center gap-2"
                          >
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span>একসাথে সকল ফলাফল প্রকাশ করুন ({evaluatedSubs.length})</span>
                          </button>
                        </div>
                      )}

                      {/* Stats Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-700">⏳ মূল্যায়ন বাকি খাতা</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                          </div>
                          <div className="text-2xl font-black text-amber-800 mt-1">{pendingSubs.length} টি</div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs">
                          <span className="text-xs font-bold text-purple-700 block">✅ মূল্যায়িত খাতা</span>
                          <div className="text-2xl font-black text-purple-800 mt-1">{evaluatedSubs.length} টি</div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                          <span className="text-xs font-bold text-slate-500 block">📝 সর্বমোট জমাকৃত CQ খাতা</span>
                          <div className="text-2xl font-black text-slate-800 mt-1">{cqSubs.length} টি</div>
                        </div>
                      </div>

                      {/* Script Cards List */}
                      {displayedSubs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {displayedSubs.map((sub) => {
                            const pageCount = Object.values(sub.cqImages || {}).reduce(
                              (sum, pMap) => sum + Object.values(pMap).reduce((pSum, arr) => pSum + (arr?.length || 0), 0),
                              0
                            );

                            return (
                              <div
                                key={sub.id}
                                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-[#ed347d]/40 transition-all space-y-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                                      {sub.studentName.charAt(0)}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                                        {sub.studentName}
                                      </h4>
                                      <span className="text-xs text-slate-500 block">
                                        {sub.studentCollege || 'কলেজ তথ্য নেই'} • {sub.studentPhone || 'ফোন নম্বর নেই'}
                                      </span>
                                    </div>
                                  </div>

                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                                    sub.status === 'evaluated'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {sub.status === 'evaluated' ? '✓ মূল্যায়িত' : '⏳ মূল্যায়ন বাকি'}
                                  </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">পরীক্ষার নাম:</span>
                                    <span className="font-bold text-slate-800 text-right truncate max-w-[220px]">
                                      {sub.examTitle}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">জমার সময়:</span>
                                    <span className="text-slate-600 font-medium">{sub.submittedAt}</span>
                                  </div>
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                    <span className="text-slate-500 font-medium">MCQ স্কোর:</span>
                                    <span className="font-mono font-bold text-slate-800">
                                      {sub.mcqScore ?? 0} নম্বর
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">CQ খাতার পৃষ্ঠা:</span>
                                    <span className="font-bold text-blue-600">
                                      {pageCount > 0 ? `📸 ${pageCount} পৃষ্ঠা ছবি আপলোড` : 'টেক্সট উত্তর'}
                                    </span>
                                  </div>
                                  {sub.status === 'evaluated' && (
                                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                                      <span>প্রদত্ত CQ নম্বর:</span>
                                      <span>{sub.cqScore ?? 0} নম্বর</span>
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEvaluatingSubmission(sub);
                                    setEvalPartMarks(sub.partMarks || {});
                                    setEvalTeacherFeedback(sub.teacherFeedback || '');
                                  }}
                                  className={`w-full py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                                    sub.status === 'evaluated'
                                      ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                                      : 'bg-gradient-to-r from-[#ed347d] to-[#fa507e] text-white hover:shadow-pink-500/20 shadow-md'
                                  }`}
                                >
                                  <FileCheck className="w-4 h-4" />
                                  <span>{sub.status === 'evaluated' ? '✏️ খাতা পুনরায় মূল্যায়ন বা নম্বর পরিবর্তন' : '📝 খাতা দেখুন ও নম্বর দিন'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                            <FileCheck className="w-7 h-7" />
                          </div>
                          <h4 className="text-sm font-black text-slate-800">কোনো লিখিত খাতা জমা পাওয়া যায়নি</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            শিক্ষার্থীরা লিখিত (CQ) পরীক্ষায় উত্তরপত্রের ছবি আপলোড করে জমা দিলে এখানে তালিকাভুক্ত হবে।
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ========================================================================= */}
                {/* 4.6 SUBMENU: EXAM SETTINGS */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_settings' && (() => {
                  const targetExamId = settingsExamId || allDisplayedExams[0]?.id || '';
                  const selectedExamObj = allDisplayedExams.find((e) => e.id === targetExamId);

                  return (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-5">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-base font-black text-slate-900">পরীক্ষার সেটিংস ও প্যারামিটার কনফিগারেশন</h3>
                        <p className="text-xs text-slate-500">শিডিউল, সময়সীমা, কাট মার্কস এবং নেগেটিভ মার্কিং নিয়ন্ত্রণ করুন</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">কনফিগার করার জন্য পরীক্ষা নির্বাচন করুন</label>
                          <select
                            value={targetExamId}
                            onChange={(e) => {
                              const found = allDisplayedExams.find((ex) => ex.id === e.target.value);
                              setSettingsExamId(e.target.value);
                              if (found) {
                                setSettingsStartTime(found.startTime || '');
                                setSettingsEndTime(found.endTime || '');
                                setSettingsDuration(found.durationMinutes || 30);
                                setSettingsTotalMarks(found.totalMarks || 100);
                                setSettingsPassMarks(found.passMarks || 40);
                                setSettingsCutMarks(found.cutMarks || 65);
                                setSettingsNegMark(found.negativeMarkPerWrong || 0.25);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#ed347d]"
                          >
                            {allDisplayedExams.map((ex) => (
                              <option key={ex.id} value={ex.id}>{ex.title} ({ex.courseTitle})</option>
                            ))}
                          </select>
                        </div>

                        <form onSubmit={handleSaveExamSettings} className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">শিডিউল শুরুর সময়</label>
                              <input
                                type="datetime-local"
                                value={settingsStartTime}
                                onChange={(e) => setSettingsStartTime(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">শিডিউল শেষের সময়</label>
                              <input
                                type="datetime-local"
                                value={settingsEndTime}
                                onChange={(e) => setSettingsEndTime(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">সময়সীমা (মিনিট)</label>
                              <input
                                type="number"
                                value={settingsDuration}
                                onChange={(e) => setSettingsDuration(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">পূর্ণমান</label>
                              <input
                                type="number"
                                value={settingsTotalMarks}
                                onChange={(e) => setSettingsTotalMarks(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">পাস মার্কস</label>
                              <input
                                type="number"
                                value={settingsPassMarks}
                                onChange={(e) => setSettingsPassMarks(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">কাট মার্কস (Cut Marks)</label>
                              <input
                                type="number"
                                value={settingsCutMarks}
                                onChange={(e) => setSettingsCutMarks(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">নেগেটিভ মার্কিং</label>
                            <select
                              value={settingsNegMark}
                              onChange={(e) => setSettingsNegMark(Number(e.target.value))}
                              className="w-full sm:w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            >
                              <option value={0.25}>- ০.২৫ (স্ট্যান্ডার্ড)</option>
                              <option value={0.5}>- ০.৫০ (ভার্সিটি ও মেডিকেল)</option>
                              <option value={0}>০.০০ (কোনো নেগেটিভ নেই)</option>
                            </select>
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white ph-btn-pink shadow-md"
                            >
                              💾 সেটিংস পরিবর্তন সংরক্ষণ করুন
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  );
                })()}

                {/* ========================================================================= */}
                {/* 4.7 SUBMENU: ALL EXAMS LIST */}
                {/* ========================================================================= */}
                {activeSubMenu === 'exams_all' && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">সকল পরীক্ষার তালিকা ({allDisplayedExams.length})</h3>
                        <p className="text-xs text-slate-500">আপনার কোর্সে যুক্ত সকল লাইভ ও শিডিউল করা পরীক্ষার বিবরণ</p>
                      </div>
                      <button
                        onClick={() => setActiveSubMenu('exams_create')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white ph-btn-pink flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        + নতুন পরীক্ষা তৈরি
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-bold">
                          <tr>
                            <th className="p-3">পরীক্ষার শিরোনাম</th>
                            <th className="p-3">কোর্স</th>
                            <th className="p-3">ধরন</th>
                            <th className="p-3">সময়সীমা</th>
                            <th className="p-3">পূর্ণমান</th>
                            <th className="p-3">স্ট্যাটাস</th>
                            <th className="p-3">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allDisplayedExams.map((ex) => {
                            const isCombined = ex.examType === 'combined';
                            const isWritten = ex.examType === 'written';
                            const startMs = ex.startTime ? new Date(ex.startTime).getTime() : 0;
                            const isUpcoming = Boolean(startMs && !isNaN(startMs) && Date.now() < startMs);

                            return (
                              <tr key={ex.id} className="hover:bg-slate-50">
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{ex.title}</div>
                                  {ex.startTime && (
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Clock className="w-3 h-3" />
                                      {new Date(ex.startTime).toLocaleString('bn-BD')}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-slate-600 truncate max-w-[180px]">{ex.courseTitle}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                    isCombined
                                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                                      : isWritten
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}>
                                    {isCombined ? 'MCQ + CQ' : isWritten ? 'সৃজনশীল CQ' : 'MCQ'}
                                  </span>
                                </td>
                                <td className="p-3">{ex.durationMinutes} মিনিট</td>
                                <td className="p-3 font-mono font-bold">{ex.totalMarks}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isUpcoming
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {isUpcoming ? 'শিডিউল' : 'লাইভ'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/exam/${ex.id}`}
                                      target="_blank"
                                      className="text-xs font-bold text-[#ed347d] hover:underline"
                                    >
                                      প্রিভিউ →
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResultsFilterExamId(ex.id);
                                        setActiveSubMenu('exams_results');
                                      }}
                                      className="p-1 rounded text-slate-500 hover:text-slate-800"
                                      title="ফলাফল দেখুন"
                                    >
                                      <BarChart3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSettingsExamId(ex.id);
                                        setSettingsStartTime(ex.startTime || '');
                                        setSettingsEndTime(ex.endTime || '');
                                        setSettingsDuration(ex.durationMinutes || 30);
                                        setSettingsTotalMarks(ex.totalMarks || 100);
                                        setSettingsPassMarks(ex.passMarks || 40);
                                        setSettingsCutMarks(ex.cutMarks || 65);
                                        setSettingsNegMark(ex.negativeMarkPerWrong || 0.25);
                                        setActiveSubMenu('exams_settings');
                                      }}
                                      className="p-1 rounded text-slate-500 hover:text-slate-800"
                                      title="সেটিংস"
                                    >
                                      <Sliders className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteExam(ex.id)}
                                      className="p-1 rounded text-rose-500 hover:text-rose-700"
                                      title="মুছুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* 5. STUDENTS MODULE */}
          {/* ========================================================================= */}
          {activeMenu === 'students' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">এনরোলকৃত শিক্ষার্থীদের তালিকা</h3>
                  <p className="text-xs text-slate-500">আপনার কোর্সে যুক্ত হওয়া মোট শিক্ষার্থী সংখ্যা: {teacherEnrollments.length} জন</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="শিক্ষার্থীর নাম, মোবাইল বা কোর্স খুঁজুন..."
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">শিক্ষার্থী</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">কোর্সের নাম</th>
                      <th className="p-3">এনরোলমেন্ট তারিখ</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeacherEnrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{enr.studentName}</td>
                        <td className="p-3 font-mono text-slate-500">{enr.senderPhone || '017XXXXXXXX'}</td>
                        <td className="p-3 text-slate-600">{enr.courseTitle}</td>
                        <td className="p-3 text-slate-400">{enr.enrollmentDate || enr.createdAt}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            enr.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {enr.status === 'approved' ? 'ভর্তি নিশ্চিত' : 'যাচাইাধীন'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {enr.status === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => approveEnrollment(enr.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                            >
                              অনুমোদন করুন
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-600">
                              ✓ অনুমোদিত
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTeacherEnrollments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          {studentSearch ? `"${studentSearch}" সংক্রান্ত কোনো শিক্ষার্থী মেলেনি।` : 'এখনো কোনো শিক্ষার্থী ভর্তি হয়নি। নতুন কোর্স পাবলিশ করে লিংক শেয়ার করুন।'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. LIVE CLASS MODULE (FULL FUNCTION REALTIME STUDIO) */}
          {/* ========================================================================= */}
          {activeMenu === 'live_class' && (() => {
            const ongoingLiveClasses = liveClasses.filter((lc) => lc.status === 'live');
            const upcomingClasses = liveClasses.filter((lc) => lc.status === 'upcoming');
            const completedClasses = liveClasses.filter((lc) => lc.status === 'completed');

            return (
              <div className="space-y-6 animate-fade-in">
                
                {/* Top Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-600">🔴 এই মুহূর্তে লাইভ</span>
                      {ongoingLiveClasses.length > 0 && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>
                    <div className="text-2xl font-black text-rose-600 mt-1">{ongoingLiveClasses.length} টি</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
                    <span className="text-xs font-bold text-blue-700 block">⏳ আসন্ন ক্লাস</span>
                    <div className="text-2xl font-black text-blue-800 mt-1">{upcomingClasses.length} টি</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
                    <span className="text-xs font-bold text-emerald-700 block">⏹️ সমাপ্ত ও রেকর্ডেড</span>
                    <div className="text-2xl font-black text-emerald-800 mt-1">{completedClasses.length} টি</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 block">📹 সর্বমোট লাইভ সেশন</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{liveClasses.length} টি</div>
                  </div>
                </div>

                {/* Submenu Quick Navigation Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'live_schedule', label: '➕ নতুন ক্লাস শিডিউল' },
                      { id: 'live_now', label: `🔴 Live Now স্টুডিও (${ongoingLiveClasses.length})` },
                      { id: 'live_upcoming', label: `📅 আসন্ন ও আর্কাইভ (${upcomingClasses.length + completedClasses.length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSubMenu(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeSubMenu === tab.id
                            ? 'bg-[#ed347d] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {ongoingLiveClasses.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black flex items-center gap-1.5 animate-pulse">
                      <Radio className="w-3.5 h-3.5" />
                      লাইভ ব্রডকাস্ট সক্রিয়
                    </span>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SUBMENU 1: SCHEDULE CLASS */}
                {/* ------------------------------------------------------------- */}
                {activeSubMenu === 'live_schedule' && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 max-w-3xl">
                    <div className="space-y-1 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                          লাইভ স্টুডিও
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          নতুন লাইভ ক্লাস শিডিউল করুন
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        কোর্স নির্বাচন করুন, মিটিং লিঙ্ক দিন এবং তারিখ ও সময় নির্ধারণ করে শিক্ষার্থীদের তাৎক্ষণিক নোটিফাই করুন।
                      </p>
                    </div>

                    <form onSubmit={handleScheduleLive} className="space-y-5">
                      {/* Target Course */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          কোর্স নির্বাচন করুন *
                        </label>
                        <select
                          value={liveCourseId || (teacherCourses[0]?.id || '')}
                          onChange={(e) => setLiveCourseId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#ed347d] bg-white"
                        >
                          {teacherCourses.map((c) => (
                            <option key={c.id} value={c.id}>
                              📚 {c.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Class Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          লাইভ ক্লাসের শিরোনাম ও বিষয় *
                        </label>
                        <input
                          type="text"
                          required
                          value={newLiveTitle}
                          onChange={(e) => setNewLiveTitle(e.target.value)}
                          placeholder="যেমন: ভেক্টর নদী-নৌকা ও বৃষ্টি সংক্রান্ত বিশেষ ডাউট সলভিং"
                          className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          ক্লাসের বিস্তারিত বিবরণ ও টপিক (ঐচ্ছিক)
                        </label>
                        <textarea
                          rows={2}
                          value={newLiveDescription}
                          onChange={(e) => setNewLiveDescription(e.target.value)}
                          placeholder="ক্লাসে কী কী বিষয়ে আলোচনা হবে বা প্রস্তুতি নিয়ে আসতে হবে..."
                          className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] resize-none"
                        />
                      </div>

                      {/* Platform & Meeting Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            লাইভ প্ল্যাটফর্ম
                          </label>
                          <select
                            value={newLivePlatform}
                            onChange={(e: any) => setNewLivePlatform(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#ed347d] bg-white"
                          >
                            <option value="google_meet">🟢 Google Meet</option>
                            <option value="zoom">🔵 Zoom Meeting</option>
                            <option value="youtube_live">🔴 YouTube Live Stream</option>
                            <option value="facebook_live">🔷 Facebook Group Live</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            মিটিং বা স্ট্রিম লিঙ্ক *
                          </label>
                          <input
                            type="text"
                            required
                            value={newLiveLink}
                            onChange={(e) => setNewLiveLink(e.target.value)}
                            placeholder="https://meet.google.com/... অথবা Zoom Link"
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>
                      </div>

                      {/* Zoom Specific ID & Password */}
                      {newLivePlatform === 'zoom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">
                              Zoom মিটিং আইডি (Meeting ID)
                            </label>
                            <input
                              type="text"
                              value={newLiveMeetingId}
                              onChange={(e) => setNewLiveMeetingId(e.target.value)}
                              placeholder="উদা: 843 9281 0021"
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 block">
                              মিটিং পাসকোড (Passcode)
                            </label>
                            <input
                              type="text"
                              value={newLivePassword}
                              onChange={(e) => setNewLivePassword(e.target.value)}
                              placeholder="উদা: 123456"
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Date, Time & Duration */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            তারিখ (Date)
                          </label>
                          <input
                            type="text"
                            value={newLiveDate}
                            onChange={(e) => setNewLiveDate(e.target.value)}
                            placeholder="আজকে / আগামীকাল / তারিখ"
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            সময় (Time)
                          </label>
                          <input
                            type="text"
                            value={newLiveTime}
                            onChange={(e) => setNewLiveTime(e.target.value)}
                            placeholder="যেমন: রাত ৮:৩০"
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            ব্যাপ্তি (মিনিট)
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="240"
                            value={newLiveDuration}
                            onChange={(e) => setNewLiveDuration(Number(e.target.value) || 90)}
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Attached Resource / Practice Sheet */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            সংযুক্ত লেকচার শিটের নাম (ঐচ্ছিক)
                          </label>
                          <input
                            type="text"
                            value={newLiveSheetTitle}
                            onChange={(e) => setNewLiveSheetTitle(e.target.value)}
                            placeholder="উদা: ভেক্টর স্পেশাল হ্যান্ডনোট"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            শিটের PDF লিঙ্ক / ড্রাইভ লিঙ্ক
                          </label>
                          <input
                            type="text"
                            value={newLiveSheetUrl}
                            onChange={(e) => setNewLiveSheetUrl(e.target.value)}
                            placeholder="https://example.com/sheet.pdf"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white ph-btn-pink shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Radio className="w-4 h-4" />
                        <span>🔴 লাইভ ক্লাস শিডিউল করুন ও নোটিফিকেশন পাঠান</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUBMENU 2: LIVE NOW STUDIO */}
                {/* ------------------------------------------------------------- */}
                {activeSubMenu === 'live_now' && (
                  <div className="space-y-6">
                    {ongoingLiveClasses.length > 0 ? (
                      <div className="space-y-4">
                        {ongoingLiveClasses.map((lc) => (
                          <div
                            key={lc.id}
                            className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-red-500/20 space-y-6 border border-white/20"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                  <Radio className="w-6 h-6 text-white animate-ping" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-0.5 rounded-full bg-white text-rose-700 text-xs font-black uppercase tracking-wider">
                                      🔴 লাইভ ক্লাস সম্প্রচার চলছে
                                    </span>
                                    <span className="text-xs font-bold text-rose-100 bg-black/20 px-2.5 py-0.5 rounded-full">
                                      {lc.courseTitle}
                                    </span>
                                  </div>
                                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">{lc.title}</h3>
                                  <p className="text-xs text-rose-100">
                                    শিক্ষক: <strong>{lc.instructorName}</strong> • শুরু: {lc.time} ({lc.date}) • আনুমানিক ব্যাপ্তি: {lc.durationMinutes} মিনিট
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                                <a
                                  href={lc.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-6 py-3 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>হোস্ট হিসেবে ক্লাসে ঢুকুন</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => setEndingLiveClassId(lc.id)}
                                  className="px-5 py-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-black text-xs transition-all border border-white/20 cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>⏹️ ক্লাস সমাপ্ত করুন</span>
                                </button>
                              </div>
                            </div>

                            {/* Meeting Credentials if available */}
                            {(lc.meetingId || lc.meetingPassword || lc.attachedSheetTitle) && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/20 text-xs">
                                {lc.meetingId && (
                                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
                                    <span className="text-rose-200 block text-[10px]">মিটিং আইডি:</span>
                                    <span className="font-mono font-bold text-white">{lc.meetingId}</span>
                                  </div>
                                )}
                                {lc.meetingPassword && (
                                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
                                    <span className="text-rose-200 block text-[10px]">পাসকোড:</span>
                                    <span className="font-mono font-bold text-white">{lc.meetingPassword}</span>
                                  </div>
                                )}
                                {lc.attachedSheetTitle && (
                                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
                                    <span className="text-rose-200 block text-[10px]">সংযুক্ত লেকচার শিট:</span>
                                    <span className="font-bold text-white truncate block">{lc.attachedSheetTitle}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center border border-rose-100">
                          <Radio className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-slate-800">
                            বর্তমানে কোনো লাইভ ক্লাস সম্প্রচারিত হচ্ছে না
                          </h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            আপনি নিচের যেকোনো আসন্ন ক্লাসকে মাত্র এক ক্লিকে সরাসরি লাইভ শুরু করতে পারেন অথবা নতুন ক্লাস শিডিউল করতে পারেন।
                          </p>
                        </div>

                        {upcomingClasses.length > 0 && (
                          <div className="pt-4 max-w-xl mx-auto space-y-3 text-left">
                            <span className="text-xs font-black text-slate-700 block">
                              আসন্ন ক্লাস থেকে এখনই লাইভ শুরু করুন:
                            </span>
                            {upcomingClasses.slice(0, 3).map((uc) => (
                              <div
                                key={uc.id}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                              >
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">{uc.courseTitle} • {uc.time}</span>
                                  <h5 className="text-xs font-black text-slate-800">{uc.title}</h5>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => startLiveClass(uc.id)}
                                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:scale-105 transition-transform shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                  <Radio className="w-3.5 h-3.5" />
                                  <span>Go Live 🔴</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SUBMENU 3: UPCOMING & ARCHIVED CLASSES */}
                {/* ------------------------------------------------------------- */}
                {activeSubMenu === 'live_upcoming' && (
                  <div className="space-y-6">
                    {/* Tab switch between Upcoming and Completed */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                      <button
                        type="button"
                        onClick={() => setLiveUpcomingTab('upcoming')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          liveUpcomingTab === 'upcoming'
                            ? 'bg-white text-[#ed347d] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ⏳ আসন্ন ক্লাস সমূহ ({upcomingClasses.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLiveUpcomingTab('completed')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          liveUpcomingTab === 'completed'
                            ? 'bg-white text-[#ed347d] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📼 সমাপ্ত ও রেকর্ডেড ক্লাস ({completedClasses.length})
                      </button>
                    </div>

                    {liveUpcomingTab === 'upcoming' ? (
                      /* Upcoming Classes Grid */
                      upcomingClasses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {upcomingClasses.map((lc) => (
                            <div
                              key={lc.id}
                              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-pink-300 transition-all space-y-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100">
                                      {lc.platform === 'google_meet' ? 'Google Meet' : lc.platform === 'zoom' ? 'Zoom Live' : 'Live Stream'}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500">
                                      {lc.courseTitle}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900 leading-snug">{lc.title}</h4>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => deleteLiveClass(lc.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="ক্লাস বাতিল ও ডিলিট করুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {lc.description && (
                                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  {lc.description}
                                </p>
                              )}

                              <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">তারিখ ও সময়:</span>
                                  <span className="font-bold text-slate-800">{lc.date} • {lc.time}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">ক্লাসের ব্যাপ্তি:</span>
                                  <span className="font-bold text-slate-800">{lc.durationMinutes} মিনিট</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => startLiveClass(lc.id)}
                                  className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                  <Radio className="w-3.5 h-3.5" />
                                  <span>Go Live 🔴</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => showToast(`🔔 "${lc.title}" ক্লাসের ১৫ মিনিটের রিমাইন্ডার সকল শিক্ষার্থীর কাছে পাঠানো হয়েছে!`)}
                                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="শিক্ষার্থীদের পুশ নোটিফিকেশন পাঠান"
                                >
                                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                                  <span>রিমাইন্ডার</span>
                                </button>

                                <a
                                  href={lc.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                  title="মিটিং লিঙ্ক খুলুন"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                          <h4 className="text-sm font-black text-slate-800">কোনো আসন্ন লাইভ ক্লাস নেই</h4>
                          <p className="text-xs text-slate-500">
                            উপরের &ldquo;নতুন ক্লাস শিডিউল&rdquo; বাটনে ক্লিক করে ক্লাস তৈরি করুন।
                          </p>
                        </div>
                      )
                    ) : (
                      /* Completed / Recorded Classes */
                      completedClasses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {completedClasses.map((lc) => (
                            <div
                              key={lc.id}
                              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                      ✓ সম্পন্ন হয়েছে
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500">{lc.courseTitle}</span>
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900">{lc.title}</h4>
                                  <p className="text-xs text-slate-400">অনুষ্ঠিত: {lc.date} • {lc.time}</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => deleteLiveClass(lc.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                                <span className="font-bold text-slate-700 block">ক্লাসের রেকর্ডিং ও নোট:</span>
                                {lc.recordingUrl ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                                      <Video className="w-3.5 h-3.5" /> রেকর্ডিং লিঙ্ক যুক্ত আছে
                                    </span>
                                    <a
                                      href={lc.recordingUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#ed347d] font-bold hover:underline"
                                    >
                                      প্লে করুন ➔
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between text-slate-400">
                                    <span>কোনো ভিডিও রেকর্ডিং যুক্ত করা হয়নি</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const url = prompt('এই ক্লাসের YouTube / Drive রেকর্ডিং ভিডিও লিঙ্ক দিন:');
                                        if (url) updateLiveClass(lc.id, { recordingUrl: url });
                                      }}
                                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                                    >
                                      + লিঙ্ক দিন
                                    </button>
                                  </div>
                                )}

                                {lc.recordingNotesPdf && (
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-blue-600" /> ক্লাস হ্যান্ডনোট PDF
                                    </span>
                                    <a
                                      href={lc.recordingNotesPdf}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 font-bold hover:underline"
                                    >
                                      ডাউনলোড
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                          <h4 className="text-sm font-black text-slate-800">এখনো কোনো ক্লাস সমাপ্ত হয়নি</h4>
                          <p className="text-xs text-slate-500">
                            লাইভ ক্লাস সম্পন্ন করার পর তা স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে।
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODAL: END LIVE CLASS & SAVE RECORDING */}
                {/* ------------------------------------------------------------- */}
                {endingLiveClassId && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-200">
                      <div className="space-y-1">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                          ক্লাস সমাপ্তকরণ
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          লাইভ ক্লাস সমাপ্ত করুন ও রেকর্ডিং সংরক্ষণ করুন
                        </h3>
                        <p className="text-xs text-slate-500">
                          ক্লাসের ভিডিও রেকর্ডিং এবং হ্যান্ডনোটের লিঙ্ক দিলে শিক্ষার্থীরা পরবর্তীতে ক্লাসরুমে তা দেখতে পারবে।
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            ভিডিও রেকর্ডিং লিঙ্ক (YouTube Unlisted / Google Drive)
                          </label>
                          <input
                            type="text"
                            value={endingRecordingUrl}
                            onChange={(e) => setEndingRecordingUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... (ঐচ্ছিক)"
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            ক্লাস নোট / হ্যান্ডনোট PDF লিঙ্ক
                          </label>
                          <input
                            type="text"
                            value={endingNotesPdf}
                            onChange={(e) => setEndingNotesPdf(e.target.value)}
                            placeholder="https://example.com/class_notes.pdf (ঐচ্ছিক)"
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEndingLiveClassId(null)}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                          বাতিল
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            endLiveClass(endingLiveClassId, endingRecordingUrl, endingNotesPdf);
                            setEndingLiveClassId(null);
                            setEndingRecordingUrl('');
                            setEndingNotesPdf('');
                          }}
                          className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-black shadow-md cursor-pointer"
                        >
                          সংরক্ষণ ও সমাপ্ত ঘোষণা করুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* 8. NOTIFICATIONS MODULE (DEDICATED SUBMENU PAGES) */}
          {/* ========================================================================= */}
          {activeMenu === 'notifications' && (() => {
            const currentNotifSub = ['notif_send', 'notif_course', 'notif_exam', 'notif_student'].includes(activeSubMenu)
              ? activeSubMenu
              : 'notif_send';

            const categoryBadges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
              live: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'লাইভ ক্লাস', icon: Radio },
              exam: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'পরীক্ষা', icon: Award },
              sheet: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'লেকচার শিট', icon: FileText },
              urgent: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'জরুরি নোটিশ', icon: AlertTriangle },
              course: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'কোর্স ঘোষণা', icon: BookOpen },
              general: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'সাধারণ', icon: Bell },
            };

            const renderNoticeCard = (n: any) => {
              const catInfo = categoryBadges[n.category] || categoryBadges.general;
              const CatIcon = catInfo.icon || Bell;

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    n.isPinned
                      ? 'bg-amber-50/40 border-amber-300/80 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:shadow-xs'
                  } space-y-2.5`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {n.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                          <Pin className="w-2.5 h-2.5 fill-amber-700" />
                          <span>পিন করা</span>
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${catInfo.bg} ${catInfo.text}`}>
                        <CatIcon className="w-3 h-3" />
                        <span>{catInfo.label}</span>
                      </span>

                      {n.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-black animate-pulse">
                          🔴 URGENT
                        </span>
                      )}

                      {n.targetAudience === 'course' ? (
                        <span className="text-slate-600 font-bold bg-slate-200/60 px-2 py-0.5 rounded text-[10px]">
                          📚 {n.targetCourseTitle || 'কোর্স স্পেশাল'}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium bg-slate-200/60 px-2 py-0.5 rounded text-[10px]">
                          🌐 সকল শিক্ষার্থী
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{n.createdAt}</span>

                      <button
                        type="button"
                        onClick={() => togglePinNotification(n.id)}
                        title={n.isPinned ? 'আনপিন করুন' : 'শীর্ষে পিন করুন'}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          n.isPinned
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                        }`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('আপনি কি নিশ্চিত যে এই নোটিফিকেশনটি মুছে ফেলতে চান?')) {
                            deleteNotification(n.id);
                          }
                        }}
                        title="মুছে ফেলুন"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                      {n.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>প্রেরক: <strong className="text-slate-700">{n.senderName}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Eye className="w-3 h-3" />
                        <span>{n.viewCount || 1} ভিউ</span>
                      </span>
                    </div>

                    {n.actionLabel && n.actionUrl && (
                      <Link
                        href={n.actionUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#ed347d] font-bold text-[11px] transition-colors border border-pink-200/60"
                      >
                        <span>{n.actionLabel}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. Top Submenu Navigation Tabs */}
                <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs">
                  {[
                    { id: 'notif_send', label: '১. Send Notification (নোটিশ পাঠান)', icon: Send },
                    { id: 'notif_course', label: '২. Course Announcement (কোর্স নোটিশ)', icon: BookOpen },
                    { id: 'notif_exam', label: '৩. Exam Notification (পরীক্ষা নোটিশ)', icon: Award },
                    { id: 'notif_student', label: '৪. Urgent Student Alerts (জরুরি বার্তা)', icon: AlertTriangle },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveSubMenu(sub.id)}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentNotifSub === sub.id
                          ? 'bg-gradient-to-r from-[#ed347d] via-[#f43f5e] to-[#fb7185] text-white shadow-xs shadow-pink-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <sub.icon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>

                {/* =================================================================== */}
                {/* SUBMENU 1: SEND NOTIFICATION STUDIO */}
                {/* =================================================================== */}
                {currentNotifSub === 'notif_send' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl relative overflow-hidden">
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30 mb-2">
                            <Send className="w-3 h-3 text-pink-400" />
                            <span>১. নোটিফিকেশন স্টুডিও</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                            নতুন নোটিশ কম্পোজার ও স্টুডেন্ট প্রিভিউ
                          </h2>
                          <p className="text-xs text-slate-300 mt-1 max-w-xl">
                            সকল শিক্ষার্থী অথবা নির্দিষ্ট কোর্সের জন্য একটি নতুন নোটিফিকেশন তৈরি করুন এবং সাথে সাথে ডানপাশে লাইভ স্টুডেন্ট ভিউ দেখুন।
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                            <span className="text-lg font-black text-white">{notifications.length}</span>
                            <p className="text-[10px] text-slate-300">মোট নোটিশ</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Templates Bar */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-[#ed347d]" />
                          <span>কুইক নোটিশ টেমপ্লেট (One-Click)</span>
                        </span>
                        <span className="text-[11px] text-slate-400">ক্লিক করলে ফর্মে অটো-ফিল হবে</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => applyNotifTemplate({
                            category: 'live',
                            priority: 'urgent',
                            title: 'আজ রাত ৮:৩০টায় লাইভ প্রবলেম সলভিং ক্লাস',
                            body: 'সবাই যথাসময়ে ক্লাসে উপস্থিত থাকবেন। ক্লাসের পূর্বে লেকচার শিট সংগ্রহ করে রাখুন।',
                            actionLabel: 'লাইভ ক্লাসরুমে যান',
                            actionUrl: '/demo-video',
                          })}
                          className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 text-left transition-all cursor-pointer"
                        >
                          <div className="font-bold text-blue-700 flex items-center gap-1 mb-0.5">
                            <Radio className="w-3 h-3 text-blue-600" />
                            <span>লাইভ ক্লাস নোটিশ</span>
                          </div>
                          <p className="text-[10px] text-blue-900/70 truncate">আজ রাত ৮:৩০টায় লাইভ ক্লাস...</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNotifTemplate({
                            category: 'exam',
                            priority: 'high',
                            title: 'আগামীকাল রাত ৯টায় বিশেষ মেগা মডেল টেস্ট',
                            body: 'পূর্ণাঙ্গ সিলেবাসের ওপর ১০০ নম্বরের মডেল টেস্ট অনুষ্ঠিত হবে। লিডারবোর্ডে জাতীয় মেধা যাচাইয়ের সুযোগ।',
                            actionLabel: 'পরীক্ষা দিন',
                            actionUrl: '/exams',
                          })}
                          className="p-2.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/60 text-left transition-all cursor-pointer"
                        >
                          <div className="font-bold text-purple-700 flex items-center gap-1 mb-0.5">
                            <Award className="w-3 h-3 text-purple-600" />
                            <span>মডেল টেস্ট সতর্কতা</span>
                          </div>
                          <p className="text-[10px] text-purple-900/70 truncate">আগামীকাল রাত ৯টায় মেগা...</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNotifTemplate({
                            category: 'sheet',
                            priority: 'normal',
                            title: 'নতুন এক্সক্লুসিভ লেকচার শিট PDF আপলোড সম্পন্ন',
                            body: 'আজকের ক্লাসের হ্যান্ডনোট এবং বোর্ড ও বিশ্ববিদ্যালয় পরীক্ষার শর্টকাট ট্রিকস শিট প্রস্তুত। এখনই ডাউনলোড করুন।',
                            actionLabel: 'PDF ডাউনলোড করুন',
                            actionUrl: '/courses/course_campus6',
                          })}
                          className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60 text-left transition-all cursor-pointer"
                        >
                          <div className="font-bold text-emerald-700 flex items-center gap-1 mb-0.5">
                            <FileText className="w-3 h-3 text-emerald-600" />
                            <span>লেকচার শিট PDF</span>
                          </div>
                          <p className="text-[10px] text-emerald-900/70 truncate">নতুন হ্যান্ডনোট আপলোড...</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyNotifTemplate({
                            category: 'urgent',
                            priority: 'urgent',
                            title: 'জরুরি নোটিশ: ক্লাসের সময়সূচি পরিবর্তন',
                            body: 'অনিবার্য কারণবশত আজকের লাইভ ক্লাসটি রাত ৯:০০টায় শুরু হবে। সাময়িক অসুবিধার জন্য আন্তরিক দুঃখিত।',
                            actionLabel: 'আপডেটেড রুটিন দেখুন',
                            actionUrl: '/courses',
                          })}
                          className="p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60 text-left transition-all cursor-pointer"
                        >
                          <div className="font-bold text-rose-700 flex items-center gap-1 mb-0.5">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>রুটিন পরিবর্তন</span>
                          </div>
                          <p className="text-[10px] text-rose-900/70 truncate">জরুরি সময়সূচি পরিবর্তন...</p>
                        </button>
                      </div>
                    </div>

                    {/* Main Form & Live Preview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Compose Form (6 cols) */}
                      <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Send className="w-4 h-4 text-[#ed347d]" />
                          <span>নোটিফিকেশন তথ্য লিখুন</span>
                        </h3>

                        <form onSubmit={handleSendNotification} className="space-y-3.5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">টার্গেটেড অডিয়েন্স (কারা পাবে?)</label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <button
                                type="button"
                                onClick={() => setNotifTargetAudience('all')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  notifTargetAudience === 'all'
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                🌐 সকল শিক্ষার্থী
                              </button>
                              <button
                                type="button"
                                onClick={() => setNotifTargetAudience('course')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  notifTargetAudience === 'course'
                                    ? 'bg-[#ed347d] text-white border-[#ed347d] shadow-xs shadow-pink-500/20'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                📚 নির্দিষ্ট কোর্স
                              </button>
                            </div>

                            {notifTargetAudience === 'course' && (
                              <select
                                value={notifTargetCourseId}
                                onChange={(e) => setNotifTargetCourseId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/30 text-xs font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                              >
                                {courses.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.title} ({c.batch || 'Batch'})
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">ক্যাটাগরি</label>
                              <select
                                value={notifCategory}
                                onChange={(e) => setNotifCategory(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                              >
                                <option value="live">🔵 লাইভ ক্লাস (Live Class)</option>
                                <option value="exam">🟣 পরীক্ষা (Exam / Result)</option>
                                <option value="sheet">🟢 লেকচার শিট (PDF Sheet)</option>
                                <option value="course">🟡 কোর্স ঘোষণা (Course)</option>
                                <option value="urgent">🔴 জরুরি সতর্কতা (Urgent)</option>
                                <option value="general">⚪ সাধারণ বার্তা (General)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">জরুরিতা (Priority)</label>
                              <select
                                value={notifPriority}
                                onChange={(e) => setNotifPriority(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                              >
                                <option value="normal">সাধারণ (Normal)</option>
                                <option value="high">গুরুত্বপূর্ণ (High)</option>
                                <option value="urgent">🔴 সর্বোচ্চ জরুরি (Urgent Flash)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              শিরোনাম <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={notifTitle}
                              onChange={(e) => setNotifTitle(e.target.value)}
                              placeholder="যেমন: আজকের ফিজিক্স ক্লাস সময়সূচি পরিবর্তন"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-pink-500/20 focus:border-[#ed347d] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              বিস্তারিত বার্তা <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                              rows={3}
                              required
                              value={notifBody}
                              onChange={(e) => setNotifBody(e.target.value)}
                              placeholder="বিস্তারিত নোটিশ বা নির্দেশনা এখানে লিখুন..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-pink-500/20 focus:border-[#ed347d] focus:outline-none"
                            />
                          </div>

                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-2">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                              <span>অ্যাকশন বাটন ও লিংক (ঐচ্ছিক)</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={notifActionLabel}
                                onChange={(e) => setNotifActionLabel(e.target.value)}
                                placeholder="বাটন নাম (যেমন: ক্লাসে যান)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                              />
                              <input
                                type="text"
                                value={notifActionUrl}
                                onChange={(e) => setNotifActionUrl(e.target.value)}
                                placeholder="লিংক (উদা: /demo-video)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={notifIsPinned}
                              onChange={(e) => setNotifIsPinned(e.target.checked)}
                              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
                            />
                            <span className="flex items-center gap-1">
                              <Pin className="w-3 h-3 text-amber-500" />
                              <span>এই নোটিশটি শীর্ষে পিন করে রাখুন</span>
                            </span>
                          </label>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ed347d] via-[#f43f5e] to-[#fb7185] hover:opacity-95 shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            <Send className="w-4 h-4" />
                            <span>নোটিশ পাবলিশ ও শিক্ষার্থীদের কাছে পাঠান</span>
                          </button>
                        </form>
                      </div>

                      {/* Right: Live Preview & Recent Sent (6 cols) */}
                      <div className="lg:col-span-6 space-y-4">
                        {/* Live Reactive Preview */}
                        <div className="bg-gradient-to-b from-slate-100 to-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                            <span className="font-black text-slate-800 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-[#ed347d]" />
                              <span>লাইভ শিক্ষার্থী ভিউ প্রিভিউ (Student View)</span>
                            </span>
                            <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-md">
                              রিয়েলটাইম প্রিভিউ
                            </span>
                          </div>

                          {/* Student Card Mockup */}
                          <div className="bg-white p-4 rounded-2xl border border-pink-200/80 shadow-md space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {notifIsPinned && (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black">
                                    📌 পিন করা
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${categoryBadges[notifCategory]?.bg} ${categoryBadges[notifCategory]?.text}`}>
                                  {categoryBadges[notifCategory]?.label || 'নোটিশ'}
                                </span>
                                {notifPriority === 'urgent' && (
                                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black animate-pulse">
                                    🔴 URGENT
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">এইমাত্র</span>
                            </div>

                            <h4 className="text-sm font-black text-slate-900 leading-snug">
                              {notifTitle.trim() || 'নোটিফিকেশনের শিরোনাম এখানে প্রদর্শিত হবে...'}
                            </h4>

                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                              {notifBody.trim() || 'বাম পাশের ফর্মে নোটিশের বিস্তারিত বার্তা লিখলে এখানে লাইভ প্রিভিউ দেখতে পাবেন।'}
                            </p>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-500">
                                প্রেরক: <strong className="text-slate-800">{currentUser.name || 'শিক্ষক'}</strong>
                              </span>
                              {notifActionLabel && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-pink-50 text-[#ed347d] font-bold text-xs border border-pink-200">
                                  <span>{notifActionLabel}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recent Sent 3 notices */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                            <span className="font-black text-slate-800">সম্প্রতি পাঠানো নোটিশসমূহ</span>
                            <button
                              type="button"
                              onClick={() => setActiveSubMenu('notif_course')}
                              className="text-[11px] text-[#ed347d] font-bold hover:underline"
                            >
                              সকল নোটিশ দেখুন ➔
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {notifications.slice(0, 3).map((n) => renderNoticeCard(n))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================================== */}
                {/* SUBMENU 2: COURSE ANNOUNCEMENT (কোর্স ঘোষণা ও ব্যাচ নোটিশ) */}
                {/* =================================================================== */}
                {currentNotifSub === 'notif_course' && (() => {
                  const courseNotifs = notifications.filter((n) => {
                    const isCourseType = n.category === 'course' || n.targetAudience === 'course';
                    if (courseNotifSelectedCourse === 'all') return isCourseType;
                    return isCourseType && n.targetCourseId === courseNotifSelectedCourse;
                  });

                  return (
                    <div className="space-y-6 animate-fade-in">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>২. কোর্স ঘোষণা হাব</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white">
                              কোর্স ও ব্যাচ-ভিত্তিক ঘোষণা সেন্টার
                            </h2>
                            <p className="text-xs text-amber-100 mt-1 max-w-xl">
                              নির্দিষ্ট কোর্সের শিক্ষার্থীদের জন্য নতুন রুটিন, সিলেবাস আপডেট বা চ্যাপ্টারভিত্তিক ঘোষণা পরিচালনা করুন।
                            </p>
                          </div>
                          <div className="bg-white/10 px-4 py-2 rounded-2xl text-center backdrop-blur-md">
                            <span className="text-xl font-black text-white">{courseNotifs.length}</span>
                            <p className="text-[10px] text-amber-100">কোর্স নোটিশ</p>
                          </div>
                        </div>
                      </div>

                      {/* Course Filter Tabs */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
                        <button
                          type="button"
                          onClick={() => setCourseNotifSelectedCourse('all')}
                          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                            courseNotifSelectedCourse === 'all'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          সকল কোর্স ({notifications.filter(n => n.category === 'course' || n.targetAudience === 'course').length})
                        </button>
                        {courses.map((c) => {
                          const count = notifications.filter(n => n.targetCourseId === c.id).length;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setCourseNotifSelectedCourse(c.id)}
                              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                                courseNotifSelectedCourse === c.id
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <span>{c.title}</span>
                              {count > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                  courseNotifSelectedCourse === c.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* 2-Column: Quick Post & Course Notice Feed */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Quick Post Box */}
                        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Send className="w-3.5 h-3.5 text-amber-600" />
                            <span>কোর্সে দ্রুত নোটিশ দিন</span>
                          </h3>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!notifTitle.trim() || !notifBody.trim()) {
                                showToast('⚠️ শিরোনাম ও বার্তা পূরণ করুন');
                                return;
                              }
                              const targetC = courses.find(c => c.id === notifTargetCourseId);
                              sendNotification({
                                title: notifTitle.trim(),
                                message: notifBody.trim(),
                                category: 'course',
                                priority: notifPriority,
                                targetAudience: 'course',
                                targetCourseId: notifTargetCourseId,
                                targetCourseTitle: targetC?.title || 'কোর্স',
                                senderName: currentUser.name || 'কোর্স ইন্সট্রাক্টর',
                                senderRole: 'অদম্য মেন্টর',
                                senderAvatar: currentUser.avatar,
                                actionLabel: notifActionLabel.trim() || 'কোর্স পেজে যান',
                                actionUrl: notifActionUrl.trim() || `/courses/${notifTargetCourseId}`,
                                isPinned: notifIsPinned,
                              });
                              setNotifTitle('');
                              setNotifBody('');
                              setNotifActionLabel('');
                              setNotifActionUrl('');
                            }}
                            className="space-y-3 text-xs"
                          >
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">কোর্স নির্বাচন করুন</label>
                              <select
                                value={notifTargetCourseId}
                                onChange={(e) => setNotifTargetCourseId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-800"
                              >
                                {courses.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.title} ({c.batch || 'Batch'})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">ঘোষণার শিরোনাম *</label>
                              <input
                                type="text"
                                required
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                placeholder="যেমন: নতুন সপ্তাহের রিভিশন রুটিন প্রকাশিত"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">বিস্তারিত বার্তা *</label>
                              <textarea
                                rows={3}
                                required
                                value={notifBody}
                                onChange={(e) => setNotifBody(e.target.value)}
                                placeholder="কোর্সের শিক্ষার্থীদের জন্য প্রয়োজনীয় নোটিশ..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>কোর্স নোটিশ পোস্ট করুন</span>
                            </button>
                          </form>
                        </div>

                        {/* Course Notices Feed */}
                        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                            <span>কোর্স নোটিশ টাইমলাইন ({courseNotifs.length})</span>
                            <span className="text-[10px] text-slate-400 font-normal">শুধুমাত্র কোর্স ও ব্যাচ সংক্রান্ত</span>
                          </h3>

                          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                            {courseNotifs.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-600">এই কোর্সে কোনো নোটিশ নেই</p>
                              </div>
                            ) : (
                              courseNotifs.map((n) => renderNoticeCard(n))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* =================================================================== */}
                {/* SUBMENU 3: EXAM NOTIFICATION (পরীক্ষার নোটিশ ও রেজাল্ট অ্যালার্ট) */}
                {/* =================================================================== */}
                {currentNotifSub === 'notif_exam' && (() => {
                  const examNotifs = notifications.filter((n) => n.category === 'exam');

                  return (
                    <div className="space-y-6 animate-fade-in">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold mb-2">
                              <Award className="w-3.5 h-3.5 text-purple-300" />
                              <span>৩. পরীক্ষা নোটিশ সেন্টার</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white">
                              মডেল টেস্ট, রেজাল্ট ও মেধা যাচাই অ্যালার্ট
                            </h2>
                            <p className="text-xs text-purple-200 mt-1 max-w-xl">
                              আসন্ন পরীক্ষা শিডিউল, ফলাফল প্রকাশনা এবং খাতা মূল্যায়নের নোটিশ এক ক্লিকে পরীক্ষা ডাটাবেস থেকে তৈরি করুন।
                            </p>
                          </div>
                          <div className="bg-white/10 px-4 py-2 rounded-2xl text-center backdrop-blur-md">
                            <span className="text-xl font-black text-white">{examNotifs.length}</span>
                            <p className="text-[10px] text-purple-200">পরীক্ষার নোটিশ</p>
                          </div>
                        </div>
                      </div>

                      {/* 2-Column: Quick Exam Notice Generator & Exam Feed */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Exam Generator Form */}
                        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Award className="w-3.5 h-3.5 text-purple-600" />
                            <span>পরীক্ষা নির্বাচন ও নোটিশ তৈরি</span>
                          </h3>

                          {/* Quick Pre-fill from existing exams */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">বিদ্যমান পরীক্ষা থেকে সিলেক্ট করুন</label>
                            <select
                              value={examNotifSelectedExam}
                              onChange={(e) => {
                                const examId = e.target.value;
                                setExamNotifSelectedExam(examId);
                                const found = exams.find(x => x.id === examId);
                                if (found) {
                                  setNotifTitle(`${found.title} এর রেজাল্ট ও মেধা তালিকা প্রকাশিত`);
                                  setNotifBody(`মোট নম্বর: ${found.totalMarks}। পদার্থবিজ্ঞান মেগা এক্সামের পূর্ণাঙ্গ ফলাফল ও সল্যুশন শিট প্রস্তুত। এখনই লিডারবোর্ডে আপনার অবস্থান ও নম্বর দেখে নিন।`);
                                  setNotifActionLabel('ফলাফল ও সল্যুশন দেখুন');
                                  setNotifActionUrl('/exams');
                                }
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/40 text-xs font-bold text-purple-900"
                            >
                              <option value="">-- পরীক্ষা বেছে নিন (অটোফিল হবে) --</option>
                              {exams.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                  {ex.title} (পূর্ণমান: {ex.totalMarks})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 3 Quick Exam Action Buttons */}
                          <div className="grid grid-cols-3 gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setNotifTitle('আজ রাত ৯টায় বিশেষ মেগা মডেল টেস্ট শুরু');
                                setNotifBody('যথাসময়ে ওএমআর প্যানেলে উপস্থিত হয়ে পরীক্ষা শুরু করুন। নেগেটিভ মার্কিং ০.২৫। শুভকামনা!');
                                setNotifActionLabel('পরীক্ষা দিন');
                                setNotifActionUrl('/exams');
                              }}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] text-center border border-purple-200 cursor-pointer"
                            >
                              ⏰ পরীক্ষার সময়
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNotifTitle('মেগা মডেল টেস্টের ফলাফল ও সম্মিলিত মেধা তালিকা প্রকাশিত');
                                setNotifBody('সম্মিলিত মেধা তালিকা এবং আপনার অর্জিত স্কোর ও ভুল উত্তরের বিশ্লেষণ এখনই দেখুন।');
                                setNotifActionLabel('ফলাফল দেখুন');
                                setNotifActionUrl('/exams');
                              }}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] text-center border border-purple-200 cursor-pointer"
                            >
                              🏆 রেজাল্ট আউট
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNotifTitle('সিকিউ লিখিত খাতার নম্বর ও শিক্ষকের মূল্যায়ন নোট যুক্ত হয়েছে');
                                setNotifBody('আপনার সৃজনশীল লিখিত পরীক্ষার প্রতিটি অংশের নম্বর এবং শিক্ষকের পার্সোনাল ফিডব্যাক প্রস্তুত।');
                                setNotifActionLabel('খাতা দেখুন');
                                setNotifActionUrl('/exams');
                              }}
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] text-center border border-purple-200 cursor-pointer"
                            >
                              📝 খাতা মূল্যায়ন
                            </button>
                          </div>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!notifTitle.trim() || !notifBody.trim()) {
                                showToast('⚠️ শিরোনাম ও বার্তা পূরণ করুন');
                                return;
                              }
                              sendNotification({
                                title: notifTitle.trim(),
                                message: notifBody.trim(),
                                category: 'exam',
                                priority: notifPriority,
                                targetAudience: 'all',
                                senderName: 'এডমিশন এক্সাম সেল',
                                senderRole: 'অদম্য এক্সাম কন্ট্রোলার',
                                senderAvatar: currentUser.avatar,
                                actionLabel: notifActionLabel.trim() || 'পরীক্ষা ও ফলাফল',
                                actionUrl: notifActionUrl.trim() || '/exams',
                                isPinned: notifIsPinned,
                              });
                              setNotifTitle('');
                              setNotifBody('');
                              setNotifActionLabel('');
                              setNotifActionUrl('');
                            }}
                            className="space-y-3 text-xs pt-1"
                          >
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">শিরোনাম *</label>
                              <input
                                type="text"
                                required
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্রের রেজাল্ট প্রকাশিত"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">বিস্তারিত বার্তা *</label>
                              <textarea
                                rows={3}
                                required
                                value={notifBody}
                                onChange={(e) => setNotifBody(e.target.value)}
                                placeholder="পরীক্ষা সংক্রান্ত বিস্তারিত তথ্য..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={notifActionLabel}
                                onChange={(e) => setNotifActionLabel(e.target.value)}
                                placeholder="বাটন টেক্সট (যেমন: রেজাল্ট দেখুন)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                              <input
                                type="text"
                                value={notifActionUrl}
                                onChange={(e) => setNotifActionUrl(e.target.value)}
                                placeholder="URL (যেমন: /exams)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>পরীক্ষার নোটিশ পাবলিশ করুন</span>
                            </button>
                          </form>
                        </div>

                        {/* Exam Notices Feed */}
                        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                            <span>পরীক্ষার নোটিশসমূহ ({examNotifs.length})</span>
                            <span className="text-[10px] text-purple-600 font-bold">মডেল টেস্ট ও ফলাফল</span>
                          </h3>

                          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                            {examNotifs.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-600">কোনো পরীক্ষার নোটিশ নেই</p>
                              </div>
                            ) : (
                              examNotifs.map((n) => renderNoticeCard(n))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* =================================================================== */}
                {/* SUBMENU 4: URGENT STUDENT ALERTS (জরুরি শিক্ষার্থী বার্তা ও ফ্ল্যাশ) */}
                {/* =================================================================== */}
                {currentNotifSub === 'notif_student' && (() => {
                  const urgentNotifs = notifications.filter((n) => n.priority === 'urgent' || n.category === 'urgent');

                  return (
                    <div className="space-y-6 animate-fade-in">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-rose-700 via-red-800 to-rose-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
                              <span>৪. জরুরি ফ্ল্যাশ ও ডিরেক্ট এলার্ট</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white">
                              জরুরি শিক্ষার্থী বার্তা ও ব্রডকাস্ট সেন্টার
                            </h2>
                            <p className="text-xs text-rose-100 mt-1 max-w-xl">
                              ক্লাস বাতিল, জরুরি সময়সূচি পরিবর্তন, তাৎক্ষণিক মিটিং লিঙ্ক বা গুরুত্বপূর্ণ সতর্কবার্তা শিক্ষার্থীদের ডিভাইসে ফ্ল্যাশ নোটিফিকেশন আকারে পাঠান।
                            </p>
                          </div>
                          <div className="bg-white/10 px-4 py-2 rounded-2xl text-center backdrop-blur-md">
                            <span className="text-xl font-black text-white">{urgentNotifs.length}</span>
                            <p className="text-[10px] text-rose-100">সক্রিয় জরুরি এলার্ট</p>
                          </div>
                        </div>
                      </div>

                      {/* 2-Column: Emergency Broadcast Box & Urgent Feed */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Emergency Form */}
                        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-red-200 shadow-xs space-y-3.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h3 className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>জরুরি ফ্ল্যাশ সম্প্রচার (Broadcast)</span>
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black text-[10px]">
                              URGENT PRIORITY
                            </span>
                          </div>

                          {/* Quick Emergency Presets */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setNotifTitle('🚨 জরুরি: আজকের লাইভ ক্লাসের নতুন লিংক');
                                setNotifBody('পূর্ববর্তী লিংকে কারিগরি সমস্যার কারণে নতুন গুগল মিট লিংক প্রদান করা হলো। অনুগ্রহ করে দ্রুত জয়েন করুন।');
                                setNotifActionLabel('নতুন লিংকে জয়েন করুন');
                                setNotifActionUrl('/demo-video');
                              }}
                              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 text-left cursor-pointer"
                            >
                              🔗 নতুন মিটিং লিংক
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setNotifTitle('⚠️ জরুরি রুটিন আপডেট: আজকের ক্লাস স্থগিত');
                                setNotifBody('অনিবার্য কারণে আজকের লাইভ ক্লাসটি সাময়িক স্থগিত করা হয়েছে। পরিবর্তিত সময় শীঘ্রই জানানো হবে।');
                                setNotifActionLabel('আপডেটেড রুটিন দেখুন');
                                setNotifActionUrl('/courses');
                              }}
                              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 text-left cursor-pointer"
                            >
                              ⏸️ ক্লাস স্থগিত নোটিশ
                            </button>
                          </div>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!notifTitle.trim() || !notifBody.trim()) {
                                showToast('⚠️ শিরোনাম ও বার্তা পূরণ করুন');
                                return;
                              }
                              sendNotification({
                                title: notifTitle.trim(),
                                message: notifBody.trim(),
                                category: 'urgent',
                                priority: 'urgent',
                                targetAudience: 'all',
                                senderName: currentUser.name || 'শিক্ষক কর্তৃপক্ষ',
                                senderRole: 'জরুরি একাডেমিক সেল',
                                senderAvatar: currentUser.avatar,
                                actionLabel: notifActionLabel.trim() || undefined,
                                actionUrl: notifActionUrl.trim() || undefined,
                                isPinned: true, // Auto pin urgent alerts
                              });
                              setNotifTitle('');
                              setNotifBody('');
                              setNotifActionLabel('');
                              setNotifActionUrl('');
                            }}
                            className="space-y-3 text-xs"
                          >
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">জরুরি শিরোনাম *</label>
                              <input
                                type="text"
                                required
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                placeholder="যেমন: বিদ্যুৎ বিভ্রাটের কারণে ক্লাস রাত ৯টায়"
                                className="w-full px-3 py-2 rounded-xl border border-red-200 text-xs focus:ring-2 focus:ring-red-500/20"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">বিস্তারিত সতর্কতা বার্তা *</label>
                              <textarea
                                rows={3}
                                required
                                value={notifBody}
                                onChange={(e) => setNotifBody(e.target.value)}
                                placeholder="শিক্ষার্থীদের উদ্দেশ্যে স্পষ্ট নির্দেশনা..."
                                className="w-full px-3 py-2 rounded-xl border border-red-200 text-xs focus:ring-2 focus:ring-red-500/20"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={notifActionLabel}
                                onChange={(e) => setNotifActionLabel(e.target.value)}
                                placeholder="বাটন নাম (ঐচ্ছিক)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                              <input
                                type="text"
                                value={notifActionUrl}
                                onChange={(e) => setNotifActionUrl(e.target.value)}
                                placeholder="লিংক (ঐচ্ছিক)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </div>

                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-medium">
                              💡 এই নোটিশটি স্বয়ংক্রিয়ভাবে শিক্ষার্থীদের স্ক্রিনে লাল পালসিং ব্যাজ সহ সবার শীর্ষে পিন করা থাকবে।
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>জরুরি ফ্ল্যাশ অ্যালার্ট সম্প্রচার করুন</span>
                            </button>
                          </form>
                        </div>

                        {/* Urgent Feed */}
                        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                            <span>সক্রিয় জরুরি নোটিশসমূহ ({urgentNotifs.length})</span>
                            <span className="text-[10px] text-red-600 font-bold animate-pulse">🔴 লাইভ ফ্ল্যাশ</span>
                          </h3>

                          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                            {urgentNotifs.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                                <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-600">বর্তমানে কোনো জরুরি নোটিশ নেই</p>
                              </div>
                            ) : (
                              urgentNotifs.map((n) => renderNoticeCard(n))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })()}

                    {/* ========================================================================= */}
          {/* 9. MESSAGES & ACADEMIC DOUBT SOLVER MODULE */}
          {/* ========================================================================= */}
          {activeMenu === 'messages' && (() => {
            const currentMsgSub = ['msg_doubts', 'msg_direct', 'msg_support', 'msg_batch'].includes(activeSubMenu)
              ? activeSubMenu
              : 'msg_doubts';

            const doubtThreads = conversations.filter((c) => c.type === 'doubt');
            const directThreads = conversations.filter((c) => c.type === 'direct');
            const supportThreads = conversations.filter((c) => c.type === 'support');
            const batchThreads = conversations.filter((c) => c.type === 'batch_group');

            const pendingDoubts = doubtThreads.filter((d) => d.status === 'pending');
            const solvedDoubts = doubtThreads.filter((d) => d.status === 'solved');

            const filteredDoubts = doubtThreads.filter((d) => {
              if (doubtFilterStatus === 'pending' && d.status !== 'pending') return false;
              if (doubtFilterStatus === 'solved' && d.status !== 'solved') return false;
              if (doubtFilterCourse !== 'all' && d.courseId !== doubtFilterCourse) return false;
              return true;
            });

            const selectedDoubt = doubtThreads.find((d) => d.id === activeDoubtId) || filteredDoubts[0] || doubtThreads[0];

            const filteredDirect = directThreads.filter((d) => {
              if (!directSearchQuery.trim()) return true;
              const q = directSearchQuery.toLowerCase();
              return (d.studentName?.toLowerCase().includes(q) || d.studentCollege?.toLowerCase().includes(q));
            });

            const selectedDirect = directThreads.find((d) => d.id === activeDirectThreadId) || filteredDirect[0] || directThreads[0];
            const selectedSupport = supportThreads.find((s) => s.id === activeSupportThreadId) || supportThreads[0];
            const selectedBatch = batchThreads.find((b) => b.id === activeBatchThreadId) || batchThreads[0];

            return (
              <div className="space-y-6 animate-fade-in">
                {/* 1. Header Banner & Metrics */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" />
                          Academic Doubts & Direct Messages
                        </span>
                        {pendingDoubts.length > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                            🔴 {pendingDoubts.length}টি প্রশ্ন সমাধান বাকি
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        ৮. Messages & Doubt Solver Hub
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        শিক্ষার্থীদের একাডেমিক প্রশ্ন দ্রুত সমাধান করুন, ১-অন-১ চ্যাট পরিচালনা করুন এবং সাপোর্ট টিমের সাথে কানেক্টেড থাকুন।
                      </p>
                    </div>

                    {/* Quick Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                        <span className="text-[10px] text-slate-300 block font-medium">মোট ডাউট</span>
                        <span className="text-base font-black text-white">{doubtThreads.length}</span>
                      </div>
                      <div className="bg-rose-500/20 backdrop-blur-md rounded-2xl p-3 border border-rose-500/30 text-center">
                        <span className="text-[10px] text-rose-200 block font-medium">পেন্ডিং প্রশ্ন</span>
                        <span className="text-base font-black text-rose-400">{pendingDoubts.length}</span>
                      </div>
                      <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/30 text-center">
                        <span className="text-[10px] text-emerald-200 block font-medium">সমাধানকৃত</span>
                        <span className="text-base font-black text-emerald-400">{solvedDoubts.length}</span>
                      </div>
                      <div className="bg-blue-500/20 backdrop-blur-md rounded-2xl p-3 border border-blue-500/30 text-center">
                        <span className="text-[10px] text-blue-200 block font-medium">ডিরেক্ট চ্যাট</span>
                        <span className="text-base font-black text-blue-400">{directThreads.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Top Submenu Switcher Tabs */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'msg_doubts', label: '১. Student Doubts (প্রশ্ন সমাধান)', icon: HelpCircle, badge: pendingDoubts.length > 0 ? `${pendingDoubts.length}` : undefined, badgeColor: 'bg-rose-500' },
                    { id: 'msg_direct', label: '২. Direct Chat (ইনবক্স)', icon: MessageSquare, badge: directThreads.filter(d => (d.unreadCountTeacher || 0) > 0).length > 0 ? `${directThreads.filter(d => (d.unreadCountTeacher || 0) > 0).length}` : undefined, badgeColor: 'bg-blue-600' },
                    { id: 'msg_support', label: '৩. Support Desk (সাপোর্ট ডেস্ক)', icon: ShieldCheck, badge: supportThreads.length > 0 ? `${supportThreads.length}` : undefined, badgeColor: 'bg-amber-500' },
                    { id: 'msg_batch', label: '৪. Batch Group (গ্রুপ ডিসকাশন)', icon: Users },
                  ].map((sub) => {
                    const SubIcon = sub.icon;
                    const isActive = currentMsgSub === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setActiveSubMenu(sub.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#ed347d] text-white shadow-md shadow-pink-500/25'
                            : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full text-white ${sub.badgeColor || 'bg-slate-700'}`}>
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 3. SUBMENU 1: msg_doubts (Academic Doubts & Q&A) */}
                {currentMsgSub === 'msg_doubts' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5" /> স্ট্যাটাস:
                        </span>
                        {[
                          { id: 'all', label: `সকল প্রশ্ন (${doubtThreads.length})` },
                          { id: 'pending', label: `🔴 অমীমাংসিত (${pendingDoubts.length})` },
                          { id: 'solved', label: `🟢 সমাধানকৃত (${solvedDoubts.length})` },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setDoubtFilterStatus(st.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              doubtFilterStatus === st.id
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>

                      {/* Course Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">কোর্স:</span>
                        <select
                          value={doubtFilterCourse}
                          onChange={(e) => setDoubtFilterCourse(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none"
                        >
                          <option value="all">সকল কোর্স</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Main Layout: Left List + Right Doubt Solver Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Questions List (5 cols) */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            শিক্ষার্থীদের প্রশ্ন তালিকা ({filteredDoubts.length})
                          </h4>
                          <span className="text-[11px] text-slate-400 font-medium">ক্লিক করে উত্তর দিন</span>
                        </div>

                        {filteredDoubts.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-600">কোনো প্রশ্ন পাওয়া যায়নি</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                            {filteredDoubts.map((d) => {
                              const isSelected = selectedDoubt?.id === d.id;
                              return (
                                <div
                                  key={d.id}
                                  onClick={() => {
                                    setActiveDoubtId(d.id);
                                    markThreadAsRead(d.id, 'teacher');
                                  }}
                                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-white border-[#ed347d] shadow-md ring-2 ring-pink-500/10'
                                      : 'bg-white border-slate-200/90 hover:border-pink-200 hover:shadow-xs'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={d.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                        alt={d.studentName}
                                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                      />
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{d.studentName}</h5>
                                          {(d.unreadCountTeacher || 0) > 0 && (
                                            <span className="w-2 h-2 rounded-full bg-[#ed347d] animate-ping" />
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 block truncate max-w-[170px]">
                                          {d.studentCollege || 'শিক্ষার্থী'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                      d.status === 'solved'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                                    }`}>
                                      {d.status === 'solved' ? '✓ সমাধান' : '● অমীমাংসিত'}
                                    </span>
                                  </div>

                                  {/* Subject & Chapter tag */}
                                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                                      {d.subject || 'পদার্থবিজ্ঞান'}
                                    </span>
                                    {d.chapter && (
                                      <span className="text-[10px] font-medium text-slate-500 truncate max-w-[180px]">
                                        • {d.chapter}
                                      </span>
                                    )}
                                  </div>

                                  {/* Question snippet */}
                                  <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                                    {d.lastMessageText}
                                  </p>

                                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {d.lastMessageTime}
                                    </span>
                                    {d.doubtImageUrl && (
                                      <span className="text-[#ed347d] font-bold flex items-center gap-1">
                                        📷 ছবি সংযুক্ত
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Active Doubt Resolution Panel (7 cols) */}
                      <div className="lg:col-span-7">
                        {selectedDoubt ? (
                          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 sticky top-24">
                            {/* Header info */}
                            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                              <div className="flex items-center gap-3">
                                <img
                                  src={selectedDoubt.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                  alt={selectedDoubt.studentName}
                                  className="w-11 h-11 rounded-full object-cover border-2 border-pink-200 shadow-xs"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-black text-slate-900">{selectedDoubt.studentName}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                      {selectedDoubt.studentRoll || '#STD-2026'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">
                                    {selectedDoubt.studentCollege} • <span className="text-indigo-600 font-bold">{selectedDoubt.courseTitle || 'Campus 6.0'}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Solved Toggle Button */}
                              <button
                                type="button"
                                onClick={() => toggleDoubtStatus(selectedDoubt.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                                  selectedDoubt.status === 'solved'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                                }`}
                              >
                                {selectedDoubt.status === 'solved' ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>সমাধান হয়েছে</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>অমীমাংসিত (ক্লিক করে সমাধান করুন)</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Academic context tags */}
                            <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <span className="font-bold text-slate-700">বিষয়:</span>
                              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-indigo-700 text-xs">
                                {selectedDoubt.subject}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="font-bold text-slate-700">অধ্যায়:</span>
                              <span className="text-slate-600 font-medium">{selectedDoubt.chapter}</span>
                              {selectedDoubt.topic && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-[#ed347d] font-bold">টপিক: {selectedDoubt.topic}</span>
                                </>
                              )}
                            </div>

                            {/* Student Question Card */}
                            <div className="space-y-3">
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/70 via-rose-50/40 to-slate-50 border border-pink-100/90 text-xs text-slate-800 leading-relaxed space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-pink-700 font-bold mb-1">
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5 text-[#ed347d]" /> শিক্ষার্থীর মূল প্রশ্ন:
                                  </span>
                                  <span className="text-slate-400 font-normal">{selectedDoubt.lastMessageTime}</span>
                                </div>
                                <p className="font-medium text-slate-900 text-[13px] leading-relaxed">
                                  {selectedDoubt.lastMessageText}
                                </p>
                              </div>

                              {/* If image attachment exists */}
                              {selectedDoubt.doubtImageUrl && (
                                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={selectedDoubt.doubtImageUrl}
                                      alt="Problem Diagram"
                                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs cursor-pointer hover:opacity-90"
                                      onClick={() => setSelectedZoomImage(selectedDoubt.doubtImageUrl!)}
                                    />
                                    <div>
                                      <h6 className="text-xs font-bold text-slate-800">প্রশ্ন বা ডায়াগ্রামের ছবি</h6>
                                      <p className="text-[10px] text-slate-500">শিক্ষার্থী খাতার ম্যাথ বা ডায়াগ্রাম আপলোড করেছে</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedZoomImage(selectedDoubt.doubtImageUrl!)}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-pink-200 hover:text-[#ed347d] transition-all shadow-2xs cursor-pointer"
                                  >
                                    🔍 বড় করে দেখুন
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Message History within doubt */}
                            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                              <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                সমাধান ও আলোচনা হিস্টোরি ({selectedDoubt.messages.length})
                              </h5>
                              {selectedDoubt.messages.map((m) => {
                                const isTeacher = m.senderRole === 'teacher';
                                return (
                                  <div
                                    key={m.id}
                                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                      isTeacher
                                        ? 'bg-pink-500/10 border border-pink-200/80 ml-4'
                                        : 'bg-slate-100 border border-slate-200/60 mr-4'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between text-[10px] mb-1 font-bold">
                                      <span className={isTeacher ? 'text-[#ed347d]' : 'text-slate-700'}>
                                        {m.senderName} {isTeacher && ' (আপনি)'}
                                      </span>
                                      <span className="text-slate-400 font-normal">{m.createdAt}</span>
                                    </div>
                                    <p className="text-slate-800">{m.text}</p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* One-Click Quick Solution Templates */}
                            <div className="space-y-1.5 pt-1 border-t border-slate-100">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                ⚡ কুইক ফর্মুলা ও রেডিমেড ব্যাখ্যা (ক্লিক করে উত্তর বক্সে যোগ করুন):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: 'প্রাসের গতি বেগ', text: 'প্রাসের সর্বোচ্চ বিন্দুতে উলম্ব বেগ vy = 0 কিন্তু অনুভূমিক বেগ vx = v0 cosθ অপরিবর্তিত থাকে এবং ত্বরণ g সর্বদা নিচের দিকে খাড়াভাবে কাজ করে।' },
                                  { label: "King's Property ইন্টিগ্রেশন", text: "এখানে definite integral-এর King's Property: ∫[a,b] f(x)dx = ∫[a,b] f(a+b-x)dx ব্যবহার করা হয়েছে। দুটো সমীকরণ যোগ করলে সমাধান অতি সহজে চলে আসে।" },
                                  { label: 'লেকচার শিট রেফারেন্স', text: 'এই টাইপের গাণিতিক সমস্যাটি লেকচার শিটের টাইপ ৩-এ খুব সুন্দরভাবে ব্যাখ্যা করা আছে। শিটটি রিভিশন দাও।' },
                                  { label: 'শাবাশ ও অনুপ্রেরণা', text: 'চমৎকার প্রশ্ন! তোমার চিন্তা ও পদ্ধতি একদম সঠিক। এভাবেই প্রতিটি ম্যাথ গভীর মনোযোগ দিয়ে চর্চা কর।' },
                                ].map((tpl, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setDoubtReplyText(prev => prev ? `${prev} ${tpl.text}` : tpl.text)}
                                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-700 text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
                                  >
                                    + {tpl.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Reply Input Form */}
                            <div className="space-y-2 pt-2">
                              <textarea
                                value={doubtReplyText}
                                onChange={(e) => setDoubtReplyText(e.target.value)}
                                rows={3}
                                placeholder="শিক্ষার্থীকে অ্যাকাডেমিক সমাধান বা ব্যাখ্যা প্রদান করুন..."
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#ed347d] focus:ring-2 focus:ring-pink-500/10 resize-none"
                              />
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] text-slate-400">
                                  উত্তর পাঠানোর পর শিক্ষার্থী তাৎক্ষণিকভাবে স্টুডেন্ট পোর্টালে দেখতে পাবে।
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!doubtReplyText.trim()) return;
                                    sendChatMessage(selectedDoubt.id, doubtReplyText, undefined, 'teacher');
                                    setDoubtReplyText('');
                                    if (selectedDoubt.status === 'pending') {
                                      toggleDoubtStatus(selectedDoubt.id);
                                    }
                                  }}
                                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#ed347d] hover:bg-[#d82a6e] shadow-md shadow-pink-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>উত্তর পাঠান ও সমাধান করুন</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <h4 className="text-sm font-bold text-slate-700">কোনো প্রশ্ন নির্বাচন করা হয়নি</h4>
                            <p className="text-xs text-slate-400 mt-1">বামপাশের তালিকা থেকে যেকোনো প্রশ্নে ক্লিক করুন</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SUBMENU 2: msg_direct (Direct Student Chat 1-on-1) */}
                {currentMsgSub === 'msg_direct' && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] animate-fade-in">
                    {/* Left: Chat List (4 cols) */}
                    <div className="md:col-span-4 border-r border-slate-200 p-4 space-y-3 bg-slate-50/50">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          শিক্ষার্থী ইনবক্স ({filteredDirect.length})
                        </h4>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={directSearchQuery}
                            onChange={(e) => setDirectSearchQuery(e.target.value)}
                            placeholder="শিক্ষার্থী খুঁজুন..."
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-0.5">
                        {filteredDirect.map((m) => {
                          const isSelected = selectedDirect?.id === m.id;
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                setActiveDirectThreadId(m.id);
                                markThreadAsRead(m.id, 'teacher');
                              }}
                              className={`p-3 rounded-2xl cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-white shadow-sm border border-pink-300 ring-1 ring-pink-400/20'
                                  : 'hover:bg-white/80 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="relative shrink-0">
                                  <img
                                    src={m.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                    alt={m.studentName}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                  />
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between text-xs mb-0.5">
                                    <span className="font-bold text-slate-900 truncate">{m.studentName}</span>
                                    <span className="text-[10px] text-slate-400 shrink-0">{m.lastMessageTime}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate">{m.lastMessageText}</p>
                                </div>
                                {(m.unreadCountTeacher || 0) > 0 && (
                                  <span className="w-4 h-4 rounded-full bg-[#ed347d] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                                    {m.unreadCountTeacher}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Active Chat Conversation (8 cols) */}
                    <div className="md:col-span-8 p-6 flex flex-col justify-between bg-white">
                      {selectedDirect ? (
                        <>
                          {/* Chat Header */}
                          <div className="border-b border-slate-100 pb-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={selectedDirect.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                alt={selectedDirect.studentName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
                              />
                              <div>
                                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                  {selectedDirect.studentName}
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                                </h4>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {selectedDirect.studentCollege} • {selectedDirect.studentRoll || '#STD-2026'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600">
                              {selectedDirect.courseTitle || 'Campus 6.0'}
                            </span>
                          </div>

                          {/* Chat Message Stream */}
                          <div className="flex-1 overflow-y-auto py-5 space-y-3.5 max-h-[380px] pr-1">
                            {selectedDirect.messages.map((m) => {
                              const isTeacher = m.senderRole === 'teacher';
                              return (
                                <div
                                  key={m.id}
                                  className={`flex items-end gap-2 ${isTeacher ? 'justify-end' : 'justify-start'}`}
                                >
                                  {!isTeacher && (
                                    <img
                                      src={selectedDirect.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                      alt=""
                                      className="w-6 h-6 rounded-full object-cover mb-1 shrink-0"
                                    />
                                  )}
                                  <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                      isTeacher
                                        ? 'bg-[#ed347d] text-white rounded-br-xs shadow-xs'
                                        : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/70'
                                    }`}
                                  >
                                    <p>{m.text}</p>
                                    <span className={`text-[9px] block mt-1 text-right ${
                                      isTeacher ? 'text-pink-100' : 'text-slate-400'
                                    }`}>
                                      {m.createdAt} {isTeacher && '✓✓'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick replies */}
                          <div className="py-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                            {[
                              'ওয়ালাইকুম আসসালাম! কেমন চলছে প্রস্তুতি?',
                              'ইনশাআল্লাহ ভালো পরীক্ষা হবে, কনফিডেন্ট থাকো!',
                              'আজ রাত ৮:৩০ এর লাইভ ক্লাসে বিস্তারিত আলোচনা হবে।',
                            ].map((qr, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setDirectReplyText(qr)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-[#ed347d] text-slate-600 transition-colors cursor-pointer"
                              >
                                {qr}
                              </button>
                            ))}
                          </div>

                          {/* Message Input Form */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!directReplyText.trim()) return;
                              sendChatMessage(selectedDirect.id, directReplyText, undefined, 'teacher');
                              setDirectReplyText('');
                            }}
                            className="pt-2 flex gap-2"
                          >
                            <input
                              type="text"
                              value={directReplyText}
                              onChange={(e) => setDirectReplyText(e.target.value)}
                              placeholder="শিক্ষার্থীকে সরাসরি বার্তা পাঠান..."
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
                        </>
                      ) : (
                        <div className="text-center py-20">
                          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">কোনো শিক্ষার্থী নির্বাচন করা হয়নি</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. SUBMENU 3: msg_support (Platform Support Desk) */}
                {currentMsgSub === 'msg_support' && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-base font-black text-slate-900">৩. Support & Admin Desk</h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          অদম্য সুপার অ্যাডমিন ও টেকনিক্যাল টিমের সাথে অফিসিয়াল সহায়তার জন্য টিকেট চ্যানেল।
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          টিকিট সক্রিয়: {supportThreads.length}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Ticket list */}
                      <div className="md:col-span-5 space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">সাপোর্ট টিকেট তালিকা</h4>
                        {supportThreads.map((st) => {
                          const isSelected = selectedSupport?.id === st.id;
                          return (
                            <div
                              key={st.id}
                              onClick={() => setActiveSupportThreadId(st.id)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs mb-1 font-bold">
                                <span className="text-indigo-700">{st.ticketNumber || '#TKT-4892'}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{st.lastMessageTime}</span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 mb-1">{st.studentName}</h5>
                              <p className="text-xs text-slate-500 line-clamp-2">{st.lastMessageText}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Ticket Thread */}
                      <div className="md:col-span-7 bg-slate-50/60 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between min-h-[380px]">
                        {selectedSupport ? (
                          <>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                                <div>
                                  <h4 className="text-xs font-black text-slate-900">
                                    টিকেট: {selectedSupport.ticketNumber || '#TKT-4892'}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 font-bold">
                                    শিক্ষার্থী: {selectedSupport.studentName} ({selectedSupport.studentCollege})
                                  </span>
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                  উন্মুক্ত টিকেট
                                </span>
                              </div>

                              <div className="space-y-3">
                                {selectedSupport.messages.map((m) => (
                                  <div
                                    key={m.id}
                                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-2xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                      <span className={m.senderRole === 'admin' ? 'text-indigo-700 font-black' : 'text-slate-800'}>
                                        {m.senderName}
                                      </span>
                                      <span>{m.createdAt}</span>
                                    </div>
                                    <p>{m.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!supportReplyText.trim()) return;
                                sendChatMessage(selectedSupport.id, supportReplyText, undefined, 'teacher');
                                setSupportReplyText('');
                              }}
                              className="pt-4 flex gap-2"
                            >
                              <input
                                type="text"
                                value={supportReplyText}
                                onChange={(e) => setSupportReplyText(e.target.value)}
                                placeholder="সাপোর্ট টিমে মেসেজ বা সমাধান নোট লিখুন..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>রিপ্লাই</span>
                              </button>
                            </form>
                          </>
                        ) : (
                          <div className="text-center py-20 text-slate-400 text-xs">
                            কোনো টিকেট পাওয়া যায়নি
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SUBMENU 4: msg_batch (Batchmate Group Discussion Hub) */}
                {currentMsgSub === 'msg_batch' && (() => {
                  const activeBatchCourse = courses.find((c) => c.id === selectedBatchCourseId) || courses[0];
                  const currentCourseBatch = conversations.find(
                    (c) => c.type === 'batch_group' && c.courseId === (activeBatchCourse?.id || 'course_campus6')
                  ) || (activeBatchCourse ? getOrCreateBatchGroup(activeBatchCourse.id, activeBatchCourse.title) : selectedBatch);

                  return (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fade-in">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-5 h-5 text-[#ed347d]" />
                            <h3 className="text-base font-black text-slate-900">৪. কোর্স-ভিত্তিক Batchmate Discussion Forum</h3>
                          </div>
                          <p className="text-xs text-slate-500">
                            প্রতিটি কোর্সের জন্য স্বয়ংক্রিয়ভাবে আলাদা ব্যাচমেট ফোরাম তৈরি হয়। যেকোনো কোর্স সিলেক্ট করে সরাসরি আলোচনা করুন।
                          </p>
                        </div>

                        {activeBatchCourse && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#ed347d] border border-pink-200">
                              {activeBatchCourse.title}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              {activeBatchCourse.enrolledCount || 120}+ শিক্ষার্থী
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Course Filter Selector Pills */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#ed347d]" />
                          <span>কোর্স নির্বাচন করুন (Course Selector):</span>
                        </label>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {courses.map((c) => {
                            const isSelected = (activeBatchCourse?.id || selectedBatchCourseId) === c.id;
                            const groupThread = conversations.find((t) => t.type === 'batch_group' && t.courseId === c.id);
                            const msgCount = groupThread?.messages.length || 1;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedBatchCourseId(c.id)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                                  isSelected
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-pink-50 hover:border-pink-200 hover:text-[#ed347d]'
                                }`}
                              >
                                <span>{c.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {msgCount}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Batchmate Discussion Feed */}
                      <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-4 min-h-[340px] max-h-[480px] overflow-y-auto">
                        {(!currentCourseBatch || currentCourseBatch.messages.length === 0) ? (
                          <div className="text-center py-14 space-y-2">
                            <Users className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="text-xs font-bold text-slate-500">এই কোর্সের ব্যাচমেট ফোরামে এখনও কোনো বার্তা পাঠানো হয়নি।</p>
                            <p className="text-[11px] text-slate-400">নিচে প্রথম গাইডলাইন বা নির্দেশনা পোস্ট করুন।</p>
                          </div>
                        ) : (
                          currentCourseBatch.messages.map((m) => {
                            const isTeacher = m.senderRole === 'teacher';
                            return (
                              <div
                                key={m.id}
                                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                                  isTeacher
                                    ? 'bg-gradient-to-r from-pink-50 via-rose-50/30 to-white border-pink-200'
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
                                    <span className={isTeacher ? 'text-[#ed347d] font-black' : 'text-slate-800'}>
                                      {m.senderName} {isTeacher && '★ কোর্স মেন্টর'}
                                    </span>
                                  </div>
                                  <span className="text-slate-400 font-normal">{m.createdAt}</span>
                                </div>
                                <p className="text-slate-700 text-[12px] leading-relaxed">{m.text}</p>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Post to Batch Group */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!batchPostText.trim() || !currentCourseBatch) return;
                          sendChatMessage(currentCourseBatch.id, batchPostText, undefined, 'teacher');
                          setBatchPostText('');
                        }}
                        className="flex gap-2.5"
                      >
                        <input
                          type="text"
                          value={batchPostText}
                          onChange={(e) => setBatchPostText(e.target.value)}
                          placeholder={`"${activeBatchCourse?.title || 'এই কোর্স'}" ব্যাচের সকল শিক্ষার্থীদের উদ্দেশ্যে পোস্ট করুন...`}
                          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                        />
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-2xl text-xs font-black text-white bg-[#ed347d] hover:bg-[#d82a6e] shadow-md shadow-pink-500/20 flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>গ্রুপে পোস্ট করুন</span>
                        </button>
                      </form>
                    </div>
                  );
                })()}

                {/* 7. Image Zoom Modal */}
                {selectedZoomImage && (
                  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-100">
                        <h4 className="text-xs font-black text-slate-800">প্রশ্ন বা ডায়াগ্রাম প্রিভিউ</h4>
                        <button
                          type="button"
                          onClick={() => setSelectedZoomImage(null)}
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-3 overflow-auto flex items-center justify-center max-h-[70vh]">
                        <img
                          src={selectedZoomImage}
                          alt="Zoomed Diagram"
                          className="max-h-[65vh] w-auto rounded-xl object-contain shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}


          {/* ========================================================================= */}
          {/* 10. PROFILE & SETTINGS MODULE */}
          {/* ========================================================================= */}
          {activeMenu === 'settings' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-pink-300 shadow-md"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900">{currentUser.name}</h3>
                  <span className="text-xs text-slate-500 font-bold">{teacherSubject} • {currentUser.college}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">শিক্ষকের নাম</label>
                  <input
                    type="text"
                    value={currentUser.name}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">প্রোফাইল ছবি ইউআরএল (Photo URL)</label>
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">শিক্ষক পরিচিতি ও বায়ো (Bio)</label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">নতুন পাসওয়ার্ড নির্ধারণ (ঐচ্ছিক)</label>
                    <input
                      type="password"
                      value={profileNewPassword}
                      onChange={(e) => setProfileNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৪ অক্ষর"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                    <input
                      type="password"
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={handleSaveProfile}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white ph-btn-pink active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin-slow" />
                      <span>ডাটাবেজে সংরক্ষিত হচ্ছে...</span>
                    </>
                  ) : (
                    <span>💾 প্রোফাইল ও পাসওয়ার্ড সেটিংস সেভ করুন</span>
                  )}
                </button>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* 11. CQ SCRIPT EVALUATION MODAL */}
      {/* ========================================================================= */}
      {evaluatingSubmission && (() => {
        const evalExam = exams.find((e) => e.id === evaluatingSubmission.examId);
        const cqList = evalExam?.creativeQuestions && evalExam.creativeQuestions.length > 0 
          ? evalExam.creativeQuestions 
          : [];
        
        const calculatedCqScore = Object.values(evalPartMarks).reduce((acc, partMap) => {
          return acc + Object.values(partMap).reduce((subAcc, mark) => subAcc + (Number(mark) || 0), 0);
        }, 0);

        const totalEarnedScore = (evaluatingSubmission.mcqScore || 0) + calculatedCqScore;

        const handleSaveEvaluation = (publishImmediately: boolean = false) => {
          evaluateSubmission(
            evaluatingSubmission.id,
            calculatedCqScore,
            evalTeacherFeedback,
            evalPartMarks,
            publishImmediately
          );
          if (publishImmediately) {
            showToast('📢 এই শিক্ষার্থীর একক ফলাফল তাৎক্ষণিকভাবে উন্মুক্ত করা হয়েছে!');
          } else {
            showToast('✅ খাতা সফলভাবে মূল্যায়ন ও সংরক্ষণ করা হয়েছে! সকল খাতা দেখা শেষ হলে একসাথে ফলাফল প্রকাশ করতে পারবেন।');
          }
          setEvaluatingSubmission(null);
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto border border-slate-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#ed347d] flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      লিখিত/সৃজনশীল খাতা মূল্যায়ন
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        evaluatingSubmission.status === 'evaluated'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {evaluatingSubmission.status === 'evaluated' ? '✓ ইতিমধ্যে মূল্যায়িত' : '⏳ মূল্যায়ন অপেক্ষমাণ'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      শিক্ষার্থী: <span className="font-bold text-slate-800">{evaluatingSubmission.studentName}</span> • {evaluatingSubmission.studentCollege || 'কলেজ তথ্য নেই'} • {evaluatingSubmission.examTitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEvaluatingSubmission(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                
                {/* Score Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">MCQ প্রাপ্ত নম্বর</span>
                    <span className="text-xl font-black text-slate-800">
                      {evaluatingSubmission.mcqScore ?? 0}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold block">
                      পূর্ণমান: {evaluatingSubmission.mcqTotal ?? 30}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-pink-200 shadow-xs text-center">
                    <span className="text-[11px] font-bold text-[#ed347d] block uppercase">CQ প্রাপ্ত নম্বর</span>
                    <span className="text-xl font-black text-[#ed347d]">
                      {calculatedCqScore}
                    </span>
                    <span className="text-[11px] text-pink-400 font-bold block">
                      পূর্ণমান: {evaluatingSubmission.cqTotal ?? 70}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                    <span className="text-[11px] font-bold text-emerald-600 block uppercase">সর্বমোট স্কোর</span>
                    <span className="text-xl font-black text-emerald-700">
                      {totalEarnedScore} / {evaluatingSubmission.totalMarks}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold block">
                      {totalEarnedScore >= (evaluatingSubmission.totalMarks * 0.4) ? '🎉 উত্তীর্ণ (Pass)' : '⚠️ অনুত্তীর্ণ (Fail)'}
                    </span>
                  </div>
                </div>

                {/* Creative Questions & Uploaded Script Photos */}
                {cqList.length > 0 ? (
                  <div className="space-y-6">
                    {cqList.map((cq, cqIdx) => {
                      const cqPartMarks = evalPartMarks[cq.id] || {};
                      const subTotalCQ = Object.values(cqPartMarks).reduce((a, b) => a + (Number(b) || 0), 0);

                      return (
                        <div key={cq.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-black">
                              সৃজনশীল প্রশ্ন {cqIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              এই প্রশ্নে প্রাপ্ত নম্বর: <span className="font-black text-[#ed347d]">{subTotalCQ}</span> / {cq.totalMarks || 10}
                            </span>
                          </div>

                          {/* Stem */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed">
                            <span className="font-bold text-slate-900 block mb-1">উদ্দীপক:</span>
                            {cq.stem}
                          </div>

                          {/* Sub questions */}
                          <div className="space-y-4 pt-1">
                            {cq.subQuestions.map((subQ) => {
                              const uploadedImages = evaluatingSubmission.cqImages?.[cq.id]?.[subQ.part] || [];
                              const currentMark = evalPartMarks[cq.id]?.[subQ.part] ?? '';

                              return (
                                <div key={subQ.part} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-pink-100 text-[#ed347d] font-black text-xs flex items-center justify-center shrink-0">
                                          {subQ.part}
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">{subQ.text}</span>
                                      </div>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                      <label className="text-[11px] font-bold text-slate-600">
                                        নম্বর (পূর্ণমান {subQ.marks}):
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max={subQ.marks}
                                        step="0.5"
                                        value={currentMark}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value);
                                          const safeVal = isNaN(val) ? 0 : Math.min(subQ.marks, Math.max(0, val));
                                          setEvalPartMarks(prev => ({
                                            ...prev,
                                            [cq.id]: {
                                              ...(prev[cq.id] || {}),
                                              [subQ.part]: safeVal
                                            }
                                          }));
                                        }}
                                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-black text-center text-[#ed347d] focus:border-[#ed347d] focus:outline-none bg-white"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>

                                  {/* Uploaded Handwritten Script Images */}
                                  <div className="pt-2 border-t border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-500 block mb-2">
                                      শিক্ষার্থীর খাতার ছবি ({uploadedImages.length} টি পৃষ্ঠা আপলোড করা হয়েছে):
                                    </span>
                                    
                                    {uploadedImages.length > 0 ? (
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {uploadedImages.map((imgUrl, imgIdx) => (
                                          <div
                                            key={imgIdx}
                                            onClick={() => setEvalLightboxImage(imgUrl)}
                                            className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 cursor-pointer aspect-3/4 hover:border-[#ed347d] transition-all shadow-xs"
                                          >
                                            <img
                                              src={imgUrl}
                                              alt={`Script Part ${subQ.part} Page ${imgIdx + 1}`}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <span className="px-2 py-1 rounded-lg bg-white/90 text-[10px] font-black text-slate-800 flex items-center gap-1 shadow-sm">
                                                <Eye className="w-3 h-3 text-[#ed347d]" /> বড় করে দেখুন
                                              </span>
                                            </div>
                                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                                              পৃষ্ঠা {imgIdx + 1}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        শিক্ষার্থী এই অংশের জন্য কোনো খাতার ছবি আপলোড করেনি।
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback if no structured CQ list: direct marks input and images display */
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        সৃজনশীল/লিখিত খাতা মূল্যায়ন
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">
                          মোট CQ নম্বর দিন (পূর্ণমান {evaluatingSubmission.cqTotal || 70}):
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={evaluatingSubmission.cqTotal || 70}
                          value={calculatedCqScore || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEvalPartMarks({
                              general: { total: Math.min(evaluatingSubmission.cqTotal || 70, Math.max(0, val)) }
                            });
                          }}
                          className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-black text-center text-[#ed347d] focus:border-[#ed347d] focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Display any uploaded script images */}
                    {evaluatingSubmission.cqImages && Object.keys(evaluatingSubmission.cqImages).length > 0 ? (
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700 block">আপলোডকৃত খাতার ছবিসমূহ:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {Object.entries(evaluatingSubmission.cqImages).map(([cqKey, partsMap]) => 
                            Object.entries(partsMap).map(([partKey, imgList]) =>
                              imgList.map((imgUrl, imgIdx) => (
                                <div
                                  key={`${cqKey}_${partKey}_${imgIdx}`}
                                  onClick={() => setEvalLightboxImage(imgUrl)}
                                  className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 cursor-pointer aspect-3/4 hover:border-[#ed347d] transition-all"
                                >
                                  <img
                                    src={imgUrl}
                                    alt="Script Preview"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-2 py-1 rounded-lg bg-white/90 text-[10px] font-black text-slate-800 flex items-center gap-1 shadow-sm">
                                      <Eye className="w-3 h-3 text-[#ed347d]" /> বড় করে দেখুন
                                    </span>
                                  </div>
                                </div>
                              ))
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                        কোনো উত্তরপত্রের ছবি পাওয়া যায়নি।
                      </div>
                    )}
                  </div>
                )}

                {/* Overall Teacher Feedback */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#ed347d]" />
                    <label className="text-xs font-black text-slate-800">
                      শিক্ষার্থীর জন্য শিক্ষক মূল্যায়ন মন্তব্য ও পরামর্শ (Feedback Notes)
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={evalTeacherFeedback}
                    onChange={(e) => setEvalTeacherFeedback(e.target.value)}
                    placeholder="উদাহরণ: গ নং প্রশ্নের ব্যাখ্যা যথাযথ হয়েছে, তবে ঘ নং এ সূত্রের প্রয়োগ ও এককে ভুল ছিল। পরবর্তী পরীক্ষায় সতর্ক থাকুন..."
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#ed347d] focus:outline-none resize-none"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                <div className="text-xs">
                  <span className="font-bold text-slate-500">মোট ধার্যকৃত নম্বর: </span>
                  <span className="font-black text-[#ed347d] text-sm">{totalEarnedScore}</span>
                  <span className="text-slate-400"> / {evaluatingSubmission.totalMarks}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setEvaluatingSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    বাতিল
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveEvaluation(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                    title="শুধুমাত্র এই শিক্ষার্থীর ফলাফল এখনই প্রকাশিত হবে"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    একক প্রকাশ
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveEvaluation(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
                    title="মূল্যায়ন সংরক্ষিত থাকবে, সকল খাতা দেখা শেষ হলে একসাথে ফলাফল প্রকাশ করতে পারবেন"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    💾 মূল্যায়ন সম্পন্ন ও সংরক্ষণ করুন
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 12. TEACHER SCRIPT LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {evalLightboxImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setEvalLightboxImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#ed347d]" />
                শিক্ষার্থীর আপলোডকৃত খাতার সম্পূর্ণ পৃষ্ঠা (Zoom Preview)
              </span>
              <button
                type="button"
                onClick={() => setEvalLightboxImage(null)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center max-h-[82vh]">
              <img 
                src={evalLightboxImage} 
                alt="Student Script Preview" 
                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. COURSE JSON UPLOAD & AUTO-SYNC MODAL */}
      {/* ========================================================================= */}
      <CourseJsonUploadModal 
        isOpen={showCourseUploadModal} 
        onClose={() => setShowCourseUploadModal(false)}
        onEditCourse={(course) => startEditingCourse(course)}
      />

    </div>
  );
}
