'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Course, Enrollment, UserRole, DetailedExamSubmission, TeacherKycData } from '@/types';
import AdommoLogo from '@/components/AdommoLogo';
import {
  LayoutDashboard,
  Crown,
  Fingerprint,
  Cpu,
  Terminal,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  DollarSign,
  Building2,
  Ticket,
  Settings,
  ShieldCheck,
  LogOut,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Download,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  KeyRound,
  Lock,
  Mail,
  Phone,
  UserCheck,
  UserX,
  ExternalLink,
  FileText,
  Check,
  X,
  Sliders,
  Layers,
  Send,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Menu,
  Award,
  Zap,
  HelpCircle,
  Globe,
  Radio,
  FileCheck,
  Tag,
  ArrowLeft,
  Percent,
  CheckSquare,
  Square,
  Shield,
  Server,
  Database,
  Smartphone,
  Copy,
  MessageSquare,
  Inbox,
  BadgeCheck,
  Flame,
  Activity,
  Receipt,
  WalletCards,
  Coins
} from 'lucide-react';

// ==========================================
// NAVIGATION TYPES
// ==========================================
type MainMenu = 
  | 'dashboard'
  | 'users'
  | 'teachers'
  | 'courses'
  | 'enrollments'
  | 'payments'
  | 'revenue'
  | 'payouts'
  | 'coupons'
  | 'settings'
  | 'roles';

type SubMenu =
  | 'users_all'
  | 'users_students'
  | 'users_teachers'
  | 'users_admins'
  | 'users_new'
  | 'users_suspended'
  | 'teachers_all'
  | 'teachers_add'
  | 'teachers_applications'
  | 'teachers_verification'
  | 'courses_all'
  | 'courses_pending'
  | 'courses_published'
  | 'courses_draft'
  | 'courses_reported'
  | 'courses_categories'
  | 'enrollments_all'
  | 'enrollments_active'
  | 'enrollments_completed'
  | 'enrollments_cancelled'
  | 'payments_transactions'
  | 'payments_orders'
  | 'payments_successful'
  | 'payments_failed'
  | 'payments_refunds'
  | 'payments_settings'
  | 'revenue_total'
  | 'revenue_teachers'
  | 'revenue_platform'
  | 'revenue_payouts'
  | 'payouts_pending'
  | 'payouts_paid'
  | 'payouts_history'
  | 'coupons_all'
  | 'coupons_create'
  | 'coupons_rules'
  | 'settings_general'
  | 'settings_website'
  | 'settings_payment'
  | 'settings_email'
  | 'settings_notifications'
  | 'settings_security'
  | 'settings_system'
  | 'default';

// ==========================================
// TYPES FOR ADMIN
// ==========================================
interface CustomTeacher {
  id: string;
  name: string;
  institution: string;
  designation: string;
  avatar: string;
  subject: string;
  phone?: string;
  email?: string;
  coursesTaught: string[];
  courseIds: string[];
  totalStudents: number;
  isVerified: boolean;
  commissionPercent: number;
}

interface TeacherApplication {
  id: string;
  name: string;
  institution: string;
  subject: string;
  phone: string;
  email: string;
  experience: string;
  demoUrl: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PayoutRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  amount: number;
  method: string;
  accountNumber: string;
  trxId: string;
  paidAt: string;
  note?: string;
  status: 'paid';
}

interface CouponItem {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  usageCount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
  applicableCourse: string;
}

export default function SuperAdminPage() {
  const { 
    courses,
    updateCourse,
    deleteCourse,
    enrollments, 
    approveEnrollment, 
    rejectEnrollment, 
    deleteEnrollment, 
    exams,
    detailedSubmissions,
    leaderboard,
    questionBanks,
    showToast,
    currentRole,
    setRole,
    currentUser,
    loginUser,
    logoutUser,
    resetToDefaultData,
    teacherKycList,
    approveTeacherKyc,
    rejectTeacherKyc,
  } = useApp();

  // ==========================================
  // SUPER ADMIN PASSKEY GATE (PASSKEY: 2006)
  // ==========================================
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [passkeyError, setPasskeyError] = useState<string>('');
  const [showPasskey, setShowPasskey] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);

  // Live Database Registered Users & Teacher KYC Applications
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [liveKycList, setLiveKycList] = useState<TeacherKycData[]>(() => teacherKycList || []);

  // Function to refresh registered users from live database
  const refreshDbUsers = () => {
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.users)) {
          setDbUsers(data.users);
        }
      })
      .catch((err) => console.log('Admin users fetch error:', err));
  };

  // Function to refresh KYC applications from live database
  const refreshKycList = () => {
    fetch('/api/admin/kyc')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const raw = data?.kycList || data?.list;
        if (Array.isArray(raw)) {
          setLiveKycList(raw);
        }
      })
      .catch((err) => console.log('Admin KYC fetch error:', err));
  };

  // Function to refresh Payouts from live database
  const refreshPayouts = () => {
    fetch('/api/admin/payouts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.payouts)) {
          setPayoutRecords(data.payouts);
        }
      })
      .catch((err) => console.log('Admin payouts fetch error:', err));
  };

  // Function to refresh Coupons from live database
  const refreshCoupons = () => {
    fetch('/api/admin/coupons')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        }
      })
      .catch((err) => console.log('Admin coupons fetch error:', err));
  };

  // Function to refresh Settings from live database
  const refreshSettings = () => {
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.settings) {
          setSystemSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((err) => console.log('Admin settings fetch error:', err));
  };

  const effectiveKycList = liveKycList.length > 0 ? liveKycList : teacherKycList;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('adommo_admin_authenticated');
      if (auth === 'true') {
        setIsAdminAuthenticated(true);
        refreshDbUsers();
        refreshKycList();
        refreshPayouts();
        refreshCoupons();
        refreshSettings();
      }
      setIsCheckingAuth(false);
    }
  }, []);

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyInput.trim()) {
      setPasskeyError('অনুগ্রহ করে আপনার অ্যাক্সেস কোডটি লিখুন');
      return;
    }

    if (passkeyInput.trim() === '2006') {
      setAdminLoading(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('adommo_admin_authenticated', 'true');
      }
      setPasskeyError('');
      showToast('👑 সুপার অ্যাডমিন অ্যাক্সেস অনুমোদিত!');
      refreshDbUsers();
      refreshKycList();
      refreshPayouts();
      refreshCoupons();
      refreshSettings();
      setTimeout(() => {
        setIsAdminAuthenticated(true);
        setAdminLoading(false);
      }, 250);
    } else {
      setPasskeyError('⚠️ ভুল অ্যাক্সেস কোড! সঠিক সুপার অ্যাডমিন কোড দিয়ে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleAdminLock = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adommo_admin_authenticated');
    }
    setIsAdminAuthenticated(false);
    setPasskeyInput('');
    showToast('🔒 সুপার অ্যাডমিন প্যানেল লক করা হয়েছে।');
  };

  // Navigation States
  const [activeMenu, setActiveMenu] = useState<MainMenu>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenu>('default');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) {
      refreshKycList();
      refreshDbUsers();
    }
  }, [isAdminAuthenticated, activeMenu, activeSubMenu]);

  // Teacher KYC Management States
  const [selectedKycApp, setSelectedKycApp] = useState<TeacherKycData | null>(null);
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminApprovalNote, setAdminApprovalNote] = useState('');
  const [adminRejectionReason, setAdminRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [adminZoomDoc, setAdminZoomDoc] = useState<{ title: string; url: string } | null>(null);

  // Accordion Dropdown States
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    users: false,
    teachers: false,
    courses: false,
    enrollments: false,
    payments: false,
    revenue: false,
    payouts: false,
    coupons: false,
    settings: false,
  });

  const toggleDropdown = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMainMenuClick = (main: MainMenu, defaultSub: SubMenu) => {
    if (activeMenu === main) {
      setExpandedMenus(prev => ({ ...prev, [main]: !prev[main] }));
    } else {
      setActiveMenu(main);
      setActiveSubMenu(defaultSub);
      setExpandedMenus(prev => ({ ...prev, [main]: true }));
    }
  };

  const navigateTo = (main: MainMenu, sub: SubMenu) => {
    setActiveMenu(main);
    setActiveSubMenu(sub);
    setMobileSidebarOpen(false);
    if (sub !== 'default') {
      setExpandedMenus(prev => ({ ...prev, [main]: true }));
    }
  };

  // =========================================================================
  // PERSISTED REAL DATA
  // =========================================================================

  // 1. Custom Added Teachers
  const [customTeachers, setCustomTeachers] = useState<CustomTeacher[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_custom_teachers');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_custom_teachers', JSON.stringify(customTeachers));
    }
  }, [customTeachers]);

  // 2. Real Teachers Aggregation (Strictly Real Teachers from Database & KYC)
  const realTeachers = useMemo<CustomTeacher[]>(() => {
    const teacherMap = new Map<string, CustomTeacher>();

    // 1. Teachers from Live Database Users
    dbUsers
      .filter((u) => u.role === 'teacher')
      .forEach((tu) => {
        const isVerified = tu.kycStatus === 'approved' ||
          effectiveKycList.some(k => (k.teacherId === tu.id || (tu.email && k.teacherEmail === tu.email) || (tu.name && k.fullName === tu.name)) && k.status === 'approved');

        teacherMap.set(tu.id, {
          id: tu.id,
          name: tu.name || 'নিবন্ধিত শিক্ষক',
          institution: tu.college || 'রেজিস্টার্ড ফ্যাকাল্টি',
          designation: tu.designation || 'নিবন্ধিত শিক্ষক',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          subject: tu.subject || 'একাডেমিক ইন্সট্রাক্টর',
          coursesTaught: [],
          courseIds: [],
          totalStudents: 0,
          isVerified: isVerified,
          commissionPercent: tu.commissionPercent || 80,
          email: tu.email || '',
          phone: tu.phone || '',
        });
      });

    // 2. Approved Teachers from live KYC List who might not be in dbUsers yet
    effectiveKycList
      .filter((kyc) => kyc.status === 'approved')
      .forEach((kyc) => {
        const teacherId = kyc.teacherId || `teacher_${kyc.applicationId}`;
        const teacherName = kyc.fullName || kyc.teacherName;
        const exists = Array.from(teacherMap.values()).some(t => t.id === teacherId || (teacherName && t.name === teacherName));
        if (teacherName && !exists) {
          teacherMap.set(teacherId, {
            id: teacherId,
            name: teacherName,
            institution: kyc.institutionName || 'অনবোর্ডেড ফ্যাকাল্টি',
            designation: kyc.degreeName || 'শিক্ষক ও প্রশিক্ষক',
            avatar: kyc.selfieWithIdImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            subject: kyc.departmentName || 'বিষয়ভিত্তিক ফ্যাকাল্টি',
            coursesTaught: [],
            courseIds: [],
            totalStudents: 0,
            isVerified: true,
            commissionPercent: 80,
            email: kyc.teacherEmail || '',
            phone: kyc.teacherPhone || '',
          });
        }
      });

    // 3. Custom Teachers directly created by Super Admin
    customTeachers.forEach((ct) => {
      const exists = Array.from(teacherMap.values()).some(t => t.id === ct.id || (ct.name && t.name === ct.name));
      if (ct.name && !exists) {
        teacherMap.set(ct.id, {
          ...ct,
          isVerified: true,
        });
      }
    });

    // 4. Map courses taught to these teachers
    courses.forEach((c) => {
      if (c.instructor && c.instructor.name) {
        const teacher = Array.from(teacherMap.values()).find(t => 
          (t.name && t.name.toLowerCase() === c.instructor.name.toLowerCase()) || ((c.instructor as any).id && t.id === (c.instructor as any).id)
        );
        if (teacher) {
          if (!teacher.coursesTaught.includes(c.title)) teacher.coursesTaught.push(c.title);
          if (!teacher.courseIds.includes(c.id)) teacher.courseIds.push(c.id);
          teacher.totalStudents += (c.enrolledCount || 0);
        }
      }
    });

    return Array.from(teacherMap.values());
  }, [courses, customTeachers, effectiveKycList, dbUsers]);

  // 3. User Status Overrides
  const [userStatusOverrides, setUserStatusOverrides] = useState<Record<string, 'active' | 'suspended'>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_user_status_overrides');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_user_status_overrides', JSON.stringify(userStatusOverrides));
    }
  }, [userStatusOverrides]);

  // 4. Real Users (Guaranteed Unique IDs)
  // 4. Real Users (Strictly from Live Database)
  const allRealUsers = useMemo(() => {
    return dbUsers.map((du) => ({
      id: du.id,
      name: du.name || (du.role === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী'),
      phone: du.phone || '—',
      email: du.email || '—',
      college: du.college || (du.role === 'teacher' ? 'ফ্যাকাল্টি' : 'শিক্ষাপ্রতিষ্ঠান'),
      role: (du.role || 'student') as UserRole,
      status: du.status || 'active',
      kycStatus: du.kycStatus,
      joinedAt: du.createdAt ? new Date(du.createdAt).toLocaleDateString('bn-BD') : 'নিবন্ধিত সদস্য',
      courses: courses.filter(c => du.enrolledCourseIds?.includes(c.id)).map(c => c.title),
    }));
  }, [dbUsers, courses]);

  const realStudents = useMemo(() => allRealUsers.filter(u => u.role === 'student'), [allRealUsers]);

  // 5. Teacher Applications
  const [teacherApplications, setTeacherApplications] = useState<TeacherApplication[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_teacher_applications');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_teacher_applications', JSON.stringify(teacherApplications));
    }
  }, [teacherApplications]);

  // 6. Teacher Verification Map
  const [teacherVerifications, setTeacherVerifications] = useState<Record<string, { nid: boolean; degree: boolean; demo: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_teacher_verifications');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {};
  });

  const toggleTeacherDocVerification = (teacherId: string, doc: 'nid' | 'degree' | 'demo') => {
    setTeacherVerifications(prev => {
      const curr = prev[teacherId] || { nid: true, degree: true, demo: true };
      const updated = {
        ...prev,
        [teacherId]: {
          ...curr,
          [doc]: !curr[doc]
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('adommo_teacher_verifications', JSON.stringify(updated));
      }
      return updated;
    });
    showToast('শিক্ষকের ভেরিফিকেশন স্ট্যাটাস হালনাগাদ করা হয়েছে!');
  };

  // 7. REAL REVENUE CALCULATIONS
  const approvedEnrollments = useMemo(() => enrollments.filter(e => e.status === 'approved'), [enrollments]);
  const pendingEnrollments = useMemo(() => enrollments.filter(e => e.status === 'pending'), [enrollments]);
  const rejectedEnrollments = useMemo(() => enrollments.filter(e => e.status === 'rejected'), [enrollments]);

  const approvedCashCollected = useMemo(() => {
    return approvedEnrollments.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [approvedEnrollments]);

  const totalCatalogEnrollmentValue = useMemo(() => {
    return courses.reduce((sum, c) => sum + ((c.enrolledCount || 0) * (c.offerPrice || c.regularPrice || 0)), 0);
  }, [courses]);

  const realTotalRevenue = approvedCashCollected > 0 ? approvedCashCollected : totalCatalogEnrollmentValue;
  const realTeacherEarnings = Math.round(realTotalRevenue * 0.8);
  const realPlatformMargin = Math.round(realTotalRevenue * 0.2);

  // 8. Teacher Payout Records
  const [payoutRecords, setPayoutRecords] = useState<PayoutRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_payout_records');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_payout_records', JSON.stringify(payoutRecords));
    }
  }, [payoutRecords]);

  // Teacher-wise Financial Earnings Ledger
  const teacherEarningsTable = useMemo(() => {
    return realTeachers.map(t => {
      const teacherEnrolls = approvedEnrollments.filter(e => t.courseIds.includes(e.courseId));
      const enrollCash = teacherEnrolls.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
      const catalogSales = courses
        .filter(c => t.courseIds.includes(c.id))
        .reduce((sum, c) => sum + ((c.enrolledCount || 0) * (c.offerPrice || c.regularPrice || 0)), 0);

      const totalTeacherSales = enrollCash > 0 ? enrollCash : catalogSales;
      const earned80 = Math.round(totalTeacherSales * (t.commissionPercent / 100));
      const platform20 = Math.round(totalTeacherSales * ((100 - t.commissionPercent) / 100));

      const totalPaidOut = payoutRecords
        .filter(p => p.teacherId === t.id)
        .reduce((sum, p) => sum + p.amount, 0);

      const dueBalance = Math.max(0, earned80 - totalPaidOut);

      return {
        ...t,
        totalSales: totalTeacherSales,
        teacherEarned: earned80,
        platformFee: platform20,
        paidOut: totalPaidOut,
        dueBalance: dueBalance,
      };
    });
  }, [realTeachers, approvedEnrollments, courses, payoutRecords]);

  const totalPaidOutSum = useMemo(() => payoutRecords.reduce((sum, p) => sum + p.amount, 0), [payoutRecords]);
  const totalDueSum = useMemo(() => teacherEarningsTable.reduce((sum, t) => sum + t.dueBalance, 0), [teacherEarningsTable]);

  // 9. Categories
  const realCategories = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach(c => {
      const cat = c.category || 'General';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({
      id: `cat_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      count,
    }));
  }, [courses]);

  // 10. Real Coupons
  const [coupons, setCoupons] = useState<CouponItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_coupons');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_coupons', JSON.stringify(coupons));
    }
  }, [coupons]);

  // 11. Real System Settings
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Adommo EdTech (অদম্য এডটেক)',
    liveNotice: 'ভর্তি চলছে! Campus 6.0 ও প্রত্যাবর্তন ৫.০ স্পেশাল ব্যাচ। যেকোনো সহযোগিতায় আমাদের হটলাইনে কল করুন: 01819-876543',
    supportHotline: '01819-876543',
    supportEmail: 'support@adommo.com',
    address: 'অদম্য এডটেক, ফার্মগেট, ঢাকা - ১২১৫',
    bkashMerchant: '01819-876543',
    nagadMerchant: '01911-223344',
    rocketMerchant: '01712-345678',
    maintenanceMode: false,
    autoEnrollmentApprove: false,
    minPayoutAmount: 5000,
    smsGatewayApiKey: 'gw_live_adommo_8736152',
    smsSenderId: 'ADOMMO',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpSender: 'admission@adommo.com',
    adminPin: '1234',
    twoFactorAuth: true,
    enableExamSms: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_system_settings');
      if (saved) {
        try { setSystemSettings(JSON.parse(saved)); } catch {}
      }
    }
  }, []);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_system_settings', JSON.stringify(systemSettings));
    }
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(systemSettings),
    }).catch(err => console.log('Settings sync error:', err));
    showToast('সকল সিস্টেম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // 12. Reported Courses / Feedback
  const [reportedCourses, setReportedCourses] = useState<Array<{ id: string; courseId: string; courseTitle: string; studentName: string; reason: string; date: string; status: 'pending' | 'resolved' }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_reported_courses');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  const handleResolveReport = (reportId: string) => {
    const updated = reportedCourses.map(r => r.id === reportId ? { ...r, status: 'resolved' as const } : r);
    setReportedCourses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_reported_courses', JSON.stringify(updated));
    }
    showToast('রিপোর্টটি সফলভাবে সমাধান (Resolved) হিসেবে চিহ্নিত হয়েছে!');
  };

  // 13. Modals State
  const [newTeacherModal, setNewTeacherModal] = useState(false);
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    institution: '',
    designation: '',
    subject: '',
    phone: '',
    email: '',
    password: '',
    commissionPercent: 80,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  });

  const [newCouponModal, setNewCouponModal] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    usageLimit: 100,
    expiresAt: '২০২৬-১২-৩১',
    applicableCourse: 'সকল কোর্স',
  });

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedTeacherForPayout, setSelectedTeacherForPayout] = useState<any | null>(null);
  const [payoutForm, setPayoutForm] = useState({
    amount: 0,
    method: 'City Bank Ltd. (BEFTN / NPSB)',
    accountNumber: '',
    trxId: '',
    note: 'ফ্যাকাল্টি রেগুলার রেভিনিউ শেয়ার সেটলমেন্ট',
  });

  const [selectedReceiptEnrollment, setSelectedReceiptEnrollment] = useState<Enrollment | null>(null);

  const openDisbursePayoutModal = (teacher: any) => {
    setSelectedTeacherForPayout(teacher);
    setPayoutForm({
      amount: teacher.dueBalance > 0 ? teacher.dueBalance : 10000,
      method: 'City Bank Ltd. (BEFTN / NPSB)',
      accountNumber: '1102938475 (সিটি ব্যাংক বনানী শাখা)',
      trxId: `TXN-BANK-${Date.now().toString().slice(-6)}`,
      note: `${teacher.name} - রেভিনিউ শেয়ার পেআউট`,
    });
    setPayoutModalOpen(true);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForPayout) return;

    if (payoutForm.amount <= 0) {
      showToast('সঠিক উইথড্রল টাকার অঙ্ক প্রদান করুন!');
      return;
    }

    const newRecord: PayoutRecord = {
      id: `pay_${Date.now()}`,
      teacherId: selectedTeacherForPayout.id,
      teacherName: selectedTeacherForPayout.name,
      amount: Number(payoutForm.amount),
      method: payoutForm.method,
      accountNumber: payoutForm.accountNumber || 'সিটি ব্যাংক একাউন্ট',
      trxId: payoutForm.trxId || `TXN-${Date.now().toString().slice(-6)}`,
      paidAt: 'আজকে সম্পন্ন',
      note: payoutForm.note,
      status: 'paid',
    };

    const updatedRecords = [newRecord, ...payoutRecords];
    setPayoutRecords(updatedRecords);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adommo_payout_records', JSON.stringify(updatedRecords));
    }
    fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(err => console.log('Payout sync error:', err));

    setPayoutModalOpen(false);
    setSelectedTeacherForPayout(null);
    showToast(`৳ ${payoutForm.amount.toLocaleString('en-BD')} টাকা সফলভাবে ${selectedTeacherForPayout.name} কে পরিশোধ করা হয়েছে!`);
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.name.trim()) {
      showToast('শিক্ষকের পূর্ণ নাম পূরণ করুন!');
      return;
    }
    if (!newTeacherForm.phone.trim() && !newTeacherForm.email.trim()) {
      showToast('শিক্ষকের মোবাইল নম্বর অথবা ইমেইল এড্রেস দিন!');
      return;
    }
    if (!newTeacherForm.password.trim() || newTeacherForm.password.trim().length < 4) {
      showToast('লগইনের জন্য কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড নির্ধারণ করুন!');
      return;
    }

    try {
      setIsSubmittingTeacher(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeacherForm.name.trim(),
          phone: newTeacherForm.phone.trim(),
          email: newTeacherForm.email.trim(),
          password: newTeacherForm.password.trim(),
          institution: newTeacherForm.institution.trim() || 'অনবোর্ডেড ফ্যাকাল্টি',
          designation: newTeacherForm.designation.trim() || 'ফ্যাকাল্টি মেম্বার',
          subject: newTeacherForm.subject.trim() || 'বিজ্ঞান',
          commissionPercent: Number(newTeacherForm.commissionPercent) || 80,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'শিক্ষক যুক্ত করতে সমস্যা হয়েছে!');
        setIsSubmittingTeacher(false);
        return;
      }

      const newTeacher: CustomTeacher = {
        id: data.user.id,
        name: newTeacherForm.name.trim(),
        institution: newTeacherForm.institution.trim() || 'অনবোর্ডেড ফ্যাকাল্টি',
        designation: newTeacherForm.designation.trim() || 'ফ্যাকাল্টি মেম্বার',
        subject: newTeacherForm.subject.trim() || 'বিজ্ঞান',
        phone: newTeacherForm.phone.trim() || '—',
        email: newTeacherForm.email.trim() || `${newTeacherForm.name.replace(/\s+/g, '').toLowerCase()}@faculty.adommo.com`,
        avatar: newTeacherForm.avatar,
        coursesTaught: [],
        courseIds: [],
        totalStudents: 0,
        isVerified: true,
        commissionPercent: Number(newTeacherForm.commissionPercent) || 80,
      };

      setCustomTeachers(prev => [...prev.filter(t => t.id !== newTeacher.id), newTeacher]);
      refreshDbUsers();
      refreshKycList();

      setNewTeacherModal(false);
      setNewTeacherForm({
        name: '',
        institution: '',
        designation: '',
        subject: '',
        phone: '',
        email: '',
        password: '',
        commissionPercent: 80,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
      showToast(`🎉 শিক্ষক ${newTeacher.name} সফলভাবে ডাটাবেজে যুক্ত ও অনুমোদিত হয়েছেন!`);
    } catch (err: any) {
      showToast('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে!');
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  const handleApproveApplication = (app: TeacherApplication) => {
    const newTeacher: CustomTeacher = {
      id: `teacher_${Date.now()}`,
      name: app.name,
      institution: app.institution,
      designation: 'অনবোর্ডেড লেকচারার',
      subject: app.subject,
      phone: app.phone,
      email: app.email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      coursesTaught: ['আসন্ন স্পেশাল ব্যাচ'],
      courseIds: [],
      totalStudents: 0,
      isVerified: true,
      commissionPercent: 80,
    };

    setCustomTeachers(prev => [...prev, newTeacher]);
    const updatedApps = teacherApplications.map(a => a.id === app.id ? { ...a, status: 'approved' as const } : a);
    setTeacherApplications(updatedApps);
    showToast(`${app.name} এর আবেদন অনুমোদন করা হয়েছে!`);
  };

  const handleRejectApplication = (appId: string) => {
    const updatedApps = teacherApplications.map(a => a.id === appId ? { ...a, status: 'rejected' as const } : a);
    setTeacherApplications(updatedApps);
    showToast('শিক্ষক আবেদনটি বাতিল করা হয়েছে।');
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponForm.code) {
      showToast('কুপন কোড প্রদান করুন!');
      return;
    }

    const newCoupon: CouponItem = {
      id: `coup_${Date.now()}`,
      code: newCouponForm.code.toUpperCase().trim(),
      discountType: newCouponForm.discountType,
      discountValue: Number(newCouponForm.discountValue) || 10,
      usageCount: 0,
      usageLimit: Number(newCouponForm.usageLimit) || 100,
      expiresAt: newCouponForm.expiresAt,
      isActive: true,
      applicableCourse: newCouponForm.applicableCourse,
    };

    setCoupons(prev => [newCoupon, ...prev]);
    fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon),
    }).catch(err => console.log('Coupon sync error:', err));
    setNewCouponModal(false);
    setNewCouponForm({
      code: '',
      discountType: 'percent',
      discountValue: 10,
      usageLimit: 100,
      expiresAt: '২০২৬-১২-৩১',
      applicableCourse: 'সকল কোর্স',
    });
    showToast(`কুপন কোড ${newCoupon.code} সফলভাবে তৈরি হয়েছে!`);
  };

  const handleToggleCoupon = (couponId: string) => {
    const target = coupons.find(c => c.id === couponId);
    if (!target) return;
    const newStatus = !target.isActive;
    setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isActive: newStatus } : c));
    fetch('/api/admin/coupons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: couponId, isActive: newStatus }),
    })
      .then(() => refreshCoupons())
      .catch(err => console.log('Coupon toggle error:', err));
    showToast('কুপন স্ট্যাটাস পরিবর্তিত হয়েছে!');
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    fetch(`/api/admin/coupons?id=${couponId}`, {
      method: 'DELETE',
    })
      .then(() => refreshCoupons())
      .catch(err => console.log('Coupon delete error:', err));
    showToast('কুপন মুছে ফেলা হয়েছে!');
  };

  // Roles Permissions Matrix
  const [rolePermissions, setRolePermissions] = useState({
    super_admin: { courses: true, payments: true, payouts: true, users: true, settings: true },
    academic_lead: { courses: true, payments: false, payouts: false, users: true, settings: false },
    finance_manager: { courses: false, payments: true, payouts: true, users: false, settings: false },
    support_staff: { courses: false, payments: false, payouts: false, users: true, settings: false },
  });

  const toggleRolePermission = (roleKey: keyof typeof rolePermissions, permKey: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permKey]: !(prev[roleKey] as any)[permKey]
      }
    }));
    showToast('রোল পারমিশন সফলভাবে হালনাগাদ করা হয়েছে!');
  };

  // Filtering
  const filteredUsers = useMemo(() => {
    let list = allRealUsers;
    if (activeSubMenu === 'users_students') list = list.filter(u => u.role === 'student');
    else if (activeSubMenu === 'users_teachers') list = list.filter(u => u.role === 'teacher');
    else if (activeSubMenu === 'users_admins') list = list.filter(u => u.role === 'admin');
    else if (activeSubMenu === 'users_new') list = list.filter(u => u.status === 'new');
    else if (activeSubMenu === 'users_suspended') list = list.filter(u => u.status === 'suspended');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => 
        u.name?.toLowerCase().includes(q) || 
        u.phone?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q) ||
        u.college?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allRealUsers, activeSubMenu, searchQuery]);

  const filteredEnrollments = useMemo(() => {
    let list = enrollments;
    if (activeSubMenu === 'enrollments_active') list = list.filter(e => e.status === 'approved');
    else if (activeSubMenu === 'enrollments_completed') list = list.filter(e => e.status === 'approved');
    else if (activeSubMenu === 'enrollments_cancelled') list = list.filter(e => e.status === 'rejected');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.studentName?.toLowerCase().includes(q) || 
        e.trxId?.toLowerCase().includes(q) || 
        e.courseTitle?.toLowerCase().includes(q) ||
        e.studentPhone?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enrollments, activeSubMenu, searchQuery]);

  const filteredCourses = useMemo(() => {
    let list = courses;
    if (activeSubMenu === 'courses_published') list = list.filter(c => !c.isDraft);
    else if (activeSubMenu === 'courses_draft') list = list.filter(c => c.isDraft);
    else if (activeSubMenu === 'courses_pending') list = list.filter(c => c.isDraft);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.title?.toLowerCase().includes(q) || 
        c.category?.toLowerCase().includes(q) ||
        c.instructor?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [courses, activeSubMenu, searchQuery]);

  const filteredPayments = useMemo(() => {
    let list = enrollments;
    if (activeSubMenu === 'payments_successful') list = list.filter(e => e.status === 'approved');
    else if (activeSubMenu === 'payments_failed') list = list.filter(e => e.status === 'rejected');
    else if (activeSubMenu === 'payments_orders') list = list;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.studentName?.toLowerCase().includes(q) || 
        e.trxId?.toLowerCase().includes(q) || 
        e.paymentMethod?.toLowerCase().includes(q) ||
        e.senderPhone?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enrollments, activeSubMenu, searchQuery]);

  const filteredPayoutTeachers = useMemo(() => {
    let list = teacherEarningsTable;
    if (activeSubMenu === 'payouts_pending') list = list.filter(t => t.dueBalance > 0);
    else if (activeSubMenu === 'payouts_paid') list = list.filter(t => t.paidOut > 0);
    return list;
  }, [teacherEarningsTable, activeSubMenu]);

  // =========================================================================
  // SUPER ADMIN SECURITY LOCK GATE (PASSKEY: 2006)
  // =========================================================================
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fffbfd] text-slate-800 font-sans z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ed347d] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">নিরাপত্তা স্তর যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden z-50">
        
        {/* Ambient Glow Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-pink-300/30 to-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-[490px] relative z-10 space-y-4 animate-fade-in">
          
          {/* Top bar with back to home */}
          <div className="flex items-center justify-between px-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>হোমপেজে ফিরে যান</span>
            </Link>

            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>১০০% নিরাপদ অ্যাক্সেস</span>
            </span>
          </div>

          {/* Centered Premium Glass Card matching Website Theme */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-500/10 p-8 sm:p-10 space-y-6">
            
            {/* Logo & Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <AdommoLogo />
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#fff0f5] text-[#ed347d] border border-pink-200 shadow-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>সুপার অ্যাডমিন সিকিউরিটি পোর্টাল</span>
                </span>
                <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight pt-1">
                  অ্যাডমিন অ্যাক্সেস
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  অদম্য এডটেকের সেন্ট্রাল অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে আপনার অনুমোদিত ৪-সংখ্যার অ্যাক্সেস কোড দিন
                </p>
              </div>
            </div>

            {/* Access Code Form */}
            <form onSubmit={handlePasskeySubmit} className="space-y-4 pt-1">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  সুপার অ্যাডমিন অ্যাক্সেস কোড (Access Code) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      if (passkeyError) setPasskeyError('');
                    }}
                    placeholder="••••"
                    required
                    maxLength={10}
                    autoFocus
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-base font-mono tracking-widest text-center focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-900 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passkeyError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passkeyError}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={adminLoading}
                className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white ph-btn-pink shadow-xl shadow-pink-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
              >
                <Lock className="w-4 h-4" />
                <span>{adminLoading ? 'অ্যাক্সেস যাচাই হচ্ছে...' : 'অ্যাডমিন প্যানেলে প্রবেশ করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                🔐 এনক্রিপ্টেড সেশন • শুধুমাত্র অনুমোদিত সুপার অ্যাডমিনের জন্য সংরক্ষিত
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#fcfdff] text-slate-800 font-sans antialiased selection:bg-[#ed347d]/20 selection:text-[#ed347d] overflow-hidden z-30">
      
      {/* Ambient background glow layers */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[30rem] h-[30rem] bg-purple-400/5 rounded-full blur-3xl pointer-events-none -z-10" />
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER - PERMANENTLY FIXED AT TOP (NEVER SCROLLS AWAY) */}
      {/* ========================================================================= */}
      <header className="shrink-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] z-40 transition-all">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95 lg:hidden cursor-pointer transition-all"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="transition-transform group-hover:scale-[1.02] duration-200">
              <AdommoLogo badge="Super Admin" />
            </div>
          </Link>
        </div>

        {/* Global Search Bar with Hotkey Badge */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#ed347d] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষার্থী, TrxID, কোর্স বা শিক্ষক খুঁজুন..."
              className="w-full pl-10 pr-12 py-2 rounded-2xl text-xs bg-slate-100/70 border border-transparent focus:border-[#ed347d]/40 focus:bg-white focus:ring-4 focus:ring-pink-500/5 focus:outline-none transition-all placeholder:text-slate-400 font-medium shadow-2xs"
            />
            {searchQuery ? (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white border border-slate-200/80 text-[10px] font-mono text-slate-400 shadow-2xs">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              navigateTo('enrollments', 'enrollments_all');
              showToast(`${pendingEnrollments.length} টি পেন্ডিং এনরোলমেন্ট রয়েছে`);
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/70 transition-all cursor-pointer active:scale-95"
            title="পেন্ডিং নোটিফিকেশন"
          >
            <Bell className="w-4 h-4" />
            {(pendingEnrollments.length > 0 || teacherApplications.filter(a => a.status === 'pending').length > 0) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#ed347d] ring-2 ring-white animate-ping" />
            )}
            {(pendingEnrollments.length > 0 || teacherApplications.filter(a => a.status === 'pending').length > 0) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#ed347d] ring-2 ring-white" />
            )}
          </button>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs hover:border-slate-300"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>মূল সাইট</span>
          </Link>

          {/* Super Admin Profile Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#fa507e] via-[#ed347d] to-[#7928ca] text-white flex items-center justify-center font-black text-xs shadow-sm shadow-pink-500/20 ring-2 ring-pink-100">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-black text-slate-900 block leading-tight">Super Admin</span>
              <span className="text-[10px] text-emerald-600 font-bold block leading-tight">রুট অ্যাক্সেস</span>
            </div>
          </div>

          {/* Super Admin Lock Button */}
          <button
            type="button"
            onClick={handleAdminLock}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-all cursor-pointer"
            title="সুপার অ্যাডমিন প্যানেল লক করুন"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY: TWO INDEPENDENT SCROLLABLE PANES (SIDEBAR & MAIN CANVAS) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* PANE 1: SIDEBAR (MENU BAR) - HAS ITS OWN INDEPENDENT SCROLLBAR */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 bg-white/95 backdrop-blur-2xl border-r border-slate-200/70 p-4 flex flex-col justify-between overflow-y-auto sidebar-scrollbar shrink-0 h-full transition-all duration-200 ease-in-out shadow-xl lg:shadow-none
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>মেনু তালিকা</span>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-mono font-bold text-slate-500">v2.0</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => navigateTo('dashboard', 'default')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'dashboard'
                  ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-xl ${activeMenu === 'dashboard' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </div>
                <span>Dashboard</span>
              </div>
              {activeMenu === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>

            {/* 2. Users */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'users'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('users', 'users_all')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'users' ? 'bg-[#ed347d] text-white' : 'bg-sky-50 text-sky-600 group-hover:bg-sky-100'}`}>
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                    {allRealUsers.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('users', e)}
                    className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.users ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {expandedMenus.users && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'users_all', label: `All Users (${allRealUsers.length})` },
                    { id: 'users_students', label: `Students (${realStudents.length})` },
                    { id: 'users_teachers', label: `Teachers (${realTeachers.length})` },
                    { id: 'users_admins', label: 'Admins (১)' },
                    { id: 'users_new', label: 'New Users' },
                    { id: 'users_suspended', label: 'Suspended Users' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigateTo('users', sub.id as SubMenu)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'users' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Teachers */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'teachers'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('teachers', 'teachers_all')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'teachers' ? 'bg-[#ed347d] text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span>Teachers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                    {realTeachers.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('teachers', e)}
                    className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.teachers ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {expandedMenus.teachers && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'teachers_all', label: `All Teachers (${realTeachers.length})` },
                    { id: 'teachers_add', label: '+ Add Teacher' },
                    { id: 'teachers_applications', label: `Applications (${effectiveKycList.filter(a => a.status === 'pending').length})` },
                    { id: 'teachers_verification', label: `Teacher KYC & Verification (${effectiveKycList.filter(k => k.status === 'pending').length})` },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        if (sub.id === 'teachers_add') {
                          setNewTeacherModal(true);
                        } else {
                          navigateTo('teachers', sub.id as SubMenu);
                        }
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'teachers' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Courses */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'courses'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('courses', 'courses_all')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'courses' ? 'bg-[#ed347d] text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'}`}>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span>Courses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                    {courses.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('courses', e)}
                    className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.courses ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {expandedMenus.courses && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'courses_all', label: `All Courses (${courses.length})` },
                    { id: 'courses_pending', label: `Pending Approval (${courses.filter(c => c.isDraft).length})` },
                    { id: 'courses_published', label: `Published (${courses.filter(c => !c.isDraft).length})` },
                    { id: 'courses_draft', label: `Draft (${courses.filter(c => c.isDraft).length})` },
                    { id: 'courses_reported', label: `Reported (${reportedCourses.filter(r => r.status === 'pending').length})` },
                    { id: 'courses_categories', label: `Categories (${realCategories.length})` },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigateTo('courses', sub.id as SubMenu)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'courses' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Enrollments */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'enrollments'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('enrollments', 'enrollments_all')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'enrollments' ? 'bg-[#ed347d] text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Enrollments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingEnrollments.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-[#ed347d] animate-pulse">
                      {pendingEnrollments.length}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('enrollments', e)}
                    className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.enrollments ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {expandedMenus.enrollments && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'enrollments_all', label: `All Enrollments (${enrollments.length})` },
                    { id: 'enrollments_active', label: `Active (${approvedEnrollments.length})` },
                    { id: 'enrollments_completed', label: 'Completed' },
                    { id: 'enrollments_cancelled', label: `Cancelled (${rejectedEnrollments.length})` },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigateTo('enrollments', sub.id as SubMenu)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'enrollments' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Payments */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'payments'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('payments', 'payments_transactions')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'payments' ? 'bg-[#ed347d] text-white' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'}`}>
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span>Payments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                    {enrollments.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('payments', e)}
                    className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.payments ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {expandedMenus.payments && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'payments_transactions', label: 'Transactions' },
                    { id: 'payments_orders', label: 'Orders' },
                    { id: 'payments_successful', label: `Successful (${approvedEnrollments.length})` },
                    { id: 'payments_failed', label: `Failed (${rejectedEnrollments.length})` },
                    { id: 'payments_refunds', label: 'Refunds' },
                    { id: 'payments_settings', label: 'Payment Settings' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigateTo('payments', sub.id as SubMenu)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'payments' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Revenue */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'revenue'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('revenue', 'revenue_total')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'revenue' ? 'bg-[#ed347d] text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span>Revenue</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleDropdown('revenue', e)}
                  className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.revenue ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                </button>
              </div>

              {expandedMenus.revenue && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'revenue_total', label: 'Total Revenue' },
                    { id: 'revenue_teachers', label: 'Teacher Earnings' },
                    { id: 'revenue_platform', label: 'Platform Revenue' },
                    { id: 'revenue_payouts', label: 'Payouts Summary' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigateTo('revenue', sub.id as SubMenu)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'revenue' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Teacher Payouts */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'payouts'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('payouts', 'payouts_pending')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'payouts' ? 'bg-[#ed347d] text-white' : 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100'}`}>
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Teacher Payouts</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleDropdown('payouts', e)}
                  className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.payouts ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                </button>
              </div>

              {expandedMenus.payouts && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'payouts_pending', label: `Pending Payouts (${teacherEarningsTable.filter(t => t.dueBalance > 0).length})` },
                    { id: 'payouts_paid', label: `Paid (${payoutRecords.length})` },
                    { id: 'payouts_history', label: 'Payout History' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigateTo('payouts', sub.id as SubMenu)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'payouts' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 9. Coupons */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'coupons'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('coupons', 'coupons_all')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'coupons' ? 'bg-[#ed347d] text-white' : 'bg-orange-50 text-orange-600 group-hover:bg-orange-100'}`}>
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                  <span>Coupons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600">
                    {coupons.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('coupons', e)}
                    className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.coupons ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              {expandedMenus.coupons && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'coupons_all', label: `All Coupons (${coupons.length})` },
                    { id: 'coupons_create', label: '+ Create Coupon' },
                    { id: 'coupons_rules', label: 'Discount Rules' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        if (sub.id === 'coupons_create') {
                          setNewCouponModal(true);
                        } else {
                          navigateTo('coupons', sub.id as SubMenu);
                        }
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'coupons' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 10. Settings */}
            <div className="space-y-0.5">
              <div className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'settings'
                  ? 'bg-[#fff0f5] text-[#ed347d] border border-pink-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}>
                <div 
                  onClick={() => handleMainMenuClick('settings', 'settings_general')}
                  className="flex items-center gap-3 flex-1 py-0.5"
                >
                  <div className={`p-1.5 rounded-xl ${activeMenu === 'settings' ? 'bg-[#ed347d] text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'}`}>
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <span>Settings</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleDropdown('settings', e)}
                  className="p-1 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedMenus.settings ? 'rotate-180 text-[#ed347d]' : 'text-slate-400'}`} />
                </button>
              </div>

              {expandedMenus.settings && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-pink-200 ml-4 animate-in fade-in duration-150">
                  {[
                    { id: 'settings_general', label: 'General' },
                    { id: 'settings_website', label: 'Website' },
                    { id: 'settings_payment', label: 'Payment' },
                    { id: 'settings_email', label: 'Email' },
                    { id: 'settings_notifications', label: 'Notifications' },
                    { id: 'settings_security', label: 'Security' },
                    { id: 'settings_system', label: 'System Settings' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => navigateTo('settings', sub.id as SubMenu)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                        activeMenu === 'settings' && activeSubMenu === sub.id
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#ed347d] hover:bg-pink-50/50'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 11. Roles & Permissions */}
            <button
              type="button"
              onClick={() => navigateTo('roles', 'default')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer group ${
                activeMenu === 'roles'
                  ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-xl ${activeMenu === 'roles' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'}`}>
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <span>Roles & Permissions</span>
              </div>
            </button>
          </div>

          {/* Sidebar Bottom: Logout */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/"
              onClick={() => showToast('অ্যাডমিন পোর্টাল থেকে প্রস্থান করা হয়েছে')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer group"
            >
              <div className="p-1.5 rounded-xl bg-rose-100/60 text-rose-600 group-hover:bg-rose-200/60">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span>Logout (প্রস্থান)</span>
            </Link>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* PANE 2: MAIN WORKSPACE CANVAS - HAS ITS OWN INDEPENDENT SCROLLBAR */}
        <main className="flex-1 h-full overflow-y-auto canvas-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          
          {/* Breadcrumb & Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-[22px] border border-slate-200/70 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500">
              <span className="text-slate-400 font-medium">Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <button 
                type="button" 
                onClick={() => navigateTo(activeMenu, 'default')}
                className="text-[#ed347d] font-black capitalize hover:underline cursor-pointer"
              >
                {activeMenu}
              </button>
              {activeSubMenu !== 'default' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-800 font-bold capitalize">{activeSubMenu.replace(/_/g, ' ')}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setNewTeacherModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-black transition-all flex items-center gap-2 shadow-xs cursor-pointer border-t border-white/20"
              >
                <Plus className="w-3.5 h-3.5 text-[#ed347d]" />
                <span>+ শিক্ষক যোগ</span>
              </button>

              <button
                type="button"
                onClick={() => setNewCouponModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fa507e] to-[#ec376d] hover:opacity-95 active:scale-95 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-pink-500/20 cursor-pointer border-t border-white/30"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>+ কুপন তৈরি</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. DASHBOARD VIEW */}
          {/* ========================================================================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Luxury Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                
                {/* Metric 1: Real Total Revenue */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-[26px] border border-slate-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-6px_rgba(237,52,125,0.08)] hover:border-pink-200/80 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">মোট রাজস্ব (Gross)</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs border border-emerald-100 group-hover:scale-110 transition-transform">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                      ৳ {realTotalRevenue.toLocaleString('en-BD')}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-extrabold mt-1.5 bg-emerald-50/70 px-2.5 py-0.5 rounded-full w-fit border border-emerald-100">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{approvedEnrollments.length} টি অ্যাপ্রুভড পেমেন্ট</span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Total Students */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-[26px] border border-slate-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-6px_rgba(56,189,248,0.08)] hover:border-sky-200/80 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">মোট শিক্ষার্থী</span>
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shadow-2xs border border-sky-100 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {realStudents.length} <span className="text-base font-bold text-slate-500">জন</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-sky-600 font-extrabold mt-1.5 bg-sky-50/70 px-2.5 py-0.5 rounded-full w-fit border border-sky-100">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{enrollments.length} জন শিক্ষার্থী নিবন্ধিত</span>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Teachers */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-[26px] border border-slate-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-6px_rgba(168,85,247,0.08)] hover:border-purple-200/80 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">শিক্ষক ও মেন্টর</span>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-2xs border border-purple-100 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {realTeachers.length} <span className="text-base font-bold text-slate-500">জন</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-600 font-extrabold mt-1.5 bg-purple-50/70 px-2.5 py-0.5 rounded-full w-fit border border-purple-100">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>১০০% ভেরিফাইড ফ্যাকাল্টি</span>
                    </div>
                  </div>
                </div>

                {/* Metric 4: Pending Enrollments */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-[26px] border border-slate-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-6px_rgba(237,52,125,0.12)] hover:border-pink-300 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">পেন্ডিং অনুমোদন</span>
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#ed347d] flex items-center justify-center font-bold shadow-2xs border border-pink-100 group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-[#ed347d] tracking-tight">
                      {pendingEnrollments.length} <span className="text-base font-bold text-pink-400">টি</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#ed347d] font-extrabold mt-1.5 bg-pink-50/70 px-2.5 py-0.5 rounded-full w-fit border border-pink-100">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>যাচাই ও কোর্স এক্সেস</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Real Enrollments Approvals Table with Elevated Styling */}
              <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#ed347d]" />
                      <span>রিয়েল-টাইম শিক্ষার্থী এনরোলমেন্ট ও পেমেন্ট TrxID</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">শিক্ষার্থীদের পেমেন্ট যাচাই করে তাৎক্ষণিক কোর্স এক্সেস নিশ্চিত করুন</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('enrollments', 'enrollments_all')}
                    className="text-xs font-black text-[#ed347d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>সকল এনরোলমেন্ট দেখুন ({enrollments.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                      <tr>
                        <th className="p-3.5">শিক্ষার্থী</th>
                        <th className="p-3.5">কোর্স</th>
                        <th className="p-3.5">পদ্ধতি ও প্রেরক নম্বর</th>
                        <th className="p-3.5">TrxID</th>
                        <th className="p-3.5">টাকা</th>
                        <th className="p-3.5">স্ট্যাটাস</th>
                        <th className="p-3.5 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {enrollments.slice(0, 5).map((enr, idx) => (
                        <tr key={`${enr.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{enr.studentName}</div>
                            <div className="text-[11px] text-slate-400">{enr.studentPhone}</div>
                          </td>
                          <td className="p-3.5 max-w-[200px] truncate text-slate-700 font-medium">
                            {enr.courseTitle}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-extrabold text-slate-700 text-[11px]">
                              {enr.paymentMethod}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">{enr.senderPhone}</span>
                          </td>
                          <td className="p-3.5 font-mono font-black text-[#ed347d]">
                            {enr.trxId}
                          </td>
                          <td className="p-3.5 font-black text-slate-900 font-mono text-sm">
                            ৳ {enr.amount}
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                              enr.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                : enr.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                                : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${enr.status === 'approved' ? 'bg-emerald-500' : enr.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
                              {enr.status === 'approved' ? 'অনুমোদিত' : enr.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {enr.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    approveEnrollment(enr.id);
                                    showToast(`${enr.studentName} এর এনরোলমেন্ট অনুমোদিত হয়েছে!`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>অনুমোদন</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    rejectEnrollment(enr.id);
                                    showToast(`${enr.studentName} এর আবেদন বাতিল করা হয়েছে!`);
                                  }}
                                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                  title="বাতিল করুন"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedReceiptEnrollment(enr)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-[#ed347d] text-slate-700 text-[11px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>রশিদ</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="p-6 rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">সক্রিয় কোর্সসমূহ</span>
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{courses.length} টি</div>
                  <p className="text-xs text-slate-500 font-medium">সকল বিশ্ববিদ্যালয়ের জন্য কাস্টম এডমিশন ব্যাচ</p>
                </div>

                <div className="p-6 rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">অনলাইন পরীক্ষা ও মক টেস্ট</span>
                    <Sparkles className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{exams.length} টি</div>
                  <p className="text-xs text-slate-500 font-medium">লাইভ ও আর্কাইভড ওএমআর পরীক্ষা</p>
                </div>

                <div className="p-6 rounded-[26px] bg-white/90 backdrop-blur-md border border-slate-200/70 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">প্রশ্নব্যাংক রিসোর্স</span>
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{questionBanks.length} টি</div>
                  <p className="text-xs text-slate-500 font-medium">বিগত ২০ বছরের চ্যাপ্টারওয়াইজ প্রশ্ন সমাধান</p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. USERS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeMenu === 'users' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-600" />
                    <span>ব্যবহারকারী তালিকা ও রোল ম্যানেজমেন্ট (Real Users)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">শিক্ষার্থী, শিক্ষক ও অ্যাডমিনদের ডিরেক্টরি এবং একাউন্ট স্ট্যাটাস নিয়ন্ত্রণ</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 text-xs font-black border border-sky-200/60 self-start sm:self-auto">
                  মোট {filteredUsers.length} জন তালিকাভুক্ত
                </span>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'users_all', label: `All Users (${allRealUsers.length})` },
                  { id: 'users_students', label: `Students (${realStudents.length})` },
                  { id: 'users_teachers', label: `Teachers (${realTeachers.length})` },
                  { id: 'users_admins', label: 'Admins (১)' },
                  { id: 'users_new', label: 'New Users' },
                  { id: 'users_suspended', label: 'Suspended Users' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                    <tr>
                      <th className="p-3.5">নাম ও পরিচয়</th>
                      <th className="p-3.5">ফোন নম্বর</th>
                      <th className="p-3.5">ইমেইল</th>
                      <th className="p-3.5">কলেজ / শিক্ষাপ্রতিষ্ঠান</th>
                      <th className="p-3.5">রোল</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u, idx) => (
                      <tr key={`${u.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 text-[9px] font-black">
                                Super
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{u.joinedAt}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">{u.phone}</td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{u.email}</td>
                        <td className="p-3.5 text-slate-600 font-medium">{u.college}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'teacher'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : u.status === 'suspended' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                            {u.status === 'active' ? 'সক্রিয়' : u.status === 'suspended' ? 'স্থগিত' : 'নতুন'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const newStatus = u.status === 'active' ? 'suspended' : 'active';
                                setUserStatusOverrides(prev => ({
                                  ...prev,
                                  [u.id]: newStatus
                                }));
                                fetch('/api/admin/users', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: u.id, status: newStatus }),
                                })
                                  .then(() => refreshDbUsers())
                                  .catch(err => console.log('User status update error:', err));
                                showToast(`ব্যবহারকারী ${u.name} এর অ্যাকাউন্ট ${newStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে!`);
                              }}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-black cursor-pointer transition-all active:scale-95 ${
                                u.status === 'active'
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/80'
                              }`}
                            >
                              {u.status === 'active' ? 'স্থগিত' : 'সক্রিয়'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== 'undefined' && window.confirm(`আপনি কি নিশ্চিত যে ${u.name}-এর অ্যাকাউন্ট মুছে ফেলতে চান?`)) {
                                  fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' })
                                    .then(() => {
                                      refreshDbUsers();
                                      showToast(`ব্যবহারকারী ${u.name}-এর অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে!`);
                                    })
                                    .catch(err => console.log('User delete error:', err));
                                }
                              }}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                              title="ইউজার মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. TEACHERS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeMenu === 'teachers' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    <span>শিক্ষক ও ফ্যাকাল্টি প্যানেল (Real Teachers & Faculty)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">কোর্স ইন্সট্রাক্টর, নতুন শিক্ষক আবেদন ও একাডেমিক ভেরিফিকেশন</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewTeacherModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#fa507e] to-[#ec376d] shadow-md shadow-pink-500/20 active:scale-95 flex items-center gap-2 cursor-pointer self-start sm:self-auto border-t border-white/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ শিক্ষক যোগ</span>
                </button>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'teachers_all', label: `All Teachers (${realTeachers.length})` },
                  { id: 'teachers_add', label: '+ Add Teacher' },
                  { id: 'teachers_applications', label: `Applications (${effectiveKycList.filter(a => a.status === 'pending').length})` },
                  { id: 'teachers_verification', label: `KYC & Verification (${effectiveKycList.filter(k => k.status === 'pending').length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'teachers_add') {
                        setNewTeacherModal(true);
                      } else {
                        setActiveSubMenu(tab.id as SubMenu);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subview: Teacher Applications */}
              {activeSubMenu === 'teachers_applications' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">শিক্ষক হওয়ার নতুন আবেদনসমূহ (Live KYC Applications)</h4>
                      <p className="text-xs text-slate-500 font-medium">আবেদনকারী শিক্ষকদের প্রোফাইল, অভিজ্ঞতা ও পরিচয়পত্র যাচাই করে অনুমোদন দিন</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                        পেন্ডিং: {effectiveKycList.filter(k => k.status === 'pending').length}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                        অনুমোদিত: {effectiveKycList.filter(k => k.status === 'approved').length}
                      </span>
                    </div>
                  </div>

                  {effectiveKycList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      বর্তমানে কোনো শিক্ষক আবেদন বা KYC রেকর্ড পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {effectiveKycList.map((kyc) => (
                        <div key={kyc.applicationId} className="p-5 rounded-2xl border border-slate-200/80 bg-white space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-pink-50 text-[#ed347d] font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden border border-pink-100">
                                {kyc.selfieWithIdImage ? (
                                  <img src={kyc.selfieWithIdImage} alt={kyc.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  (kyc.fullName || kyc.teacherName || 'T').slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">{kyc.fullName || kyc.teacherName}</h4>
                                <span className="text-xs text-[#ed347d] font-bold block">{kyc.institutionName || 'অনবোর্ডেড ফ্যাকাল্টি'}</span>
                                <span className="text-[11px] text-slate-500 font-medium block">
                                  {kyc.degreeName || 'শিক্ষক'} • {kyc.departmentName || 'বিষয়ভিত্তিক'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                kyc.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : kyc.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {kyc.status === 'approved' ? '✓ অনুমোদিত' : kyc.status === 'rejected' ? '✕ বাতিলকৃত' : '⏳ পেন্ডিং'}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-slate-400">
                                #{kyc.applicationId}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">মোবাইল:</span>
                              <span className="font-mono font-bold text-slate-700">{kyc.teacherPhone || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">ইমেইল:</span>
                              <span className="font-mono font-bold text-slate-700">{kyc.teacherEmail || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">আইডি টাইপ:</span>
                              <span className="font-bold text-slate-700 uppercase">{kyc.idType || 'NID'} ({kyc.idNumber || '—'})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium">পেআউট পদ্ধতি:</span>
                              <span className="font-bold text-slate-700">{kyc.payoutMethod || 'bKash'} ({kyc.payoutAccountNumber || '—'})</span>
                            </div>
                            {kyc.demoVideoLink && (
                              <div className="pt-1 border-t border-slate-200/60">
                                <a
                                  href={kyc.demoVideoLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-[#ed347d] hover:underline font-bold inline-flex items-center gap-1"
                                >
                                  <span>ভিডিও ডেমো ক্লাস লিঙ্ক</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-400">
                              আবেদন: {kyc.submittedAt || 'সম্প্রতি'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedKycApp(kyc)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>নথিপত্র নিরীক্ষা</span>
                              </button>
                              {kyc.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      approveTeacherKyc(
                                        kyc.applicationId,
                                        'সুপার অ্যাডমিন কর্তৃক সরাসরি যাচাইপূর্বক অনুমোদিত।'
                                      );
                                      setTimeout(() => refreshKycList(), 300);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs cursor-pointer shadow-xs transition-all"
                                  >
                                    অনুমোদন দিন
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedKycApp(kyc);
                                      setIsRejectModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 cursor-pointer transition-colors"
                                  >
                                    বাতিল
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subview: Teacher Verification & KYC Approval Hub */}
              {activeSubMenu === 'teachers_verification' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#ed347d] flex items-center justify-center shrink-0">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-500">মোট KYC আবেদন</div>
                        <div className="text-2xl font-black text-slate-900">{effectiveKycList.length}</div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 relative">
                        <Clock className="w-6 h-6 animate-spin-slow" />
                        {effectiveKycList.filter(k => k.status === 'pending').length > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white animate-ping" />
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-amber-700">অপেক্ষমাণ ভেরিফিকেশন</div>
                        <div className="text-2xl font-black text-amber-900">
                          {effectiveKycList.filter(k => k.status === 'pending').length}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-emerald-700">অনুমোদিত ফ্যাকাল্টি</div>
                        <div className="text-2xl font-black text-emerald-900">
                          {effectiveKycList.filter(k => k.status === 'approved').length}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-xs flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-rose-700">বাতিল / সংশোধনে প্রেরিত</div>
                        <div className="text-2xl font-black text-rose-900">
                          {effectiveKycList.filter(k => k.status === 'rejected').length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Header & Filter Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">শিক্ষক KYC ও জাতীয় পরিচয়পত্র নিরীক্ষা হাব</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-[#ed347d] text-[11px] font-black">
                          Super Admin Portal
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        নতুন নিবন্ধিত শিক্ষকদের NID, সার্টিফিকেট ও সেলফি যাচাই করে শিক্ষক পোর্টালে ফুল অ্যাক্সেস অনুমোদন বা বাতিল করুন।
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setKycFilter(filter)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            kycFilter === filter
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {filter === 'all' && `সবগুলো (${effectiveKycList.length})`}
                          {filter === 'pending' && `পেন্ডিং (${effectiveKycList.filter(k => k.status === 'pending').length})`}
                          {filter === 'approved' && `অনুমোদিত (${effectiveKycList.filter(k => k.status === 'approved').length})`}
                          {filter === 'rejected' && `বাতিল (${effectiveKycList.filter(k => k.status === 'rejected').length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* KYC Applications Table */}
                  <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-black text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                        <tr>
                          <th className="p-3.5">আবেদন নং ও তারিখ</th>
                          <th className="p-3.5">শিক্ষকের বিবরণ</th>
                          <th className="p-3.5">পরিচয়পত্র নং ও ধরন</th>
                          <th className="p-3.5">সংযুক্ত প্রমাণকসমূহ</th>
                          <th className="p-3.5">পেআউট বিবরণ</th>
                          <th className="p-3.5 text-center">স্ট্যাটাস</th>
                          <th className="p-3.5 text-right">কার্যক্রম</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {effectiveKycList
                          .filter((kyc) => kycFilter === 'all' || kyc.status === kycFilter)
                          .map((kyc) => (
                            <tr key={kyc.applicationId} className="hover:bg-slate-50/70 transition-colors">
                              {/* Application ID & Date */}
                              <td className="p-3.5">
                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-[11px] block w-fit">
                                  #{kyc.applicationId}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {kyc.submittedAt}
                                </span>
                              </td>

                              {/* Teacher info */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#ed347d] font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                    {kyc.selfieWithIdImage ? (
                                      <img src={kyc.selfieWithIdImage} alt={kyc.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                      kyc.fullName.slice(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900">{kyc.fullName}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">{kyc.teacherEmail} • {kyc.teacherPhone}</div>
                                    <div className="text-[10px] text-slate-400">{kyc.degreeName} ({kyc.institutionName})</div>
                                  </div>
                                </div>
                              </td>

                              {/* ID info */}
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-black text-[10px] uppercase">
                                  {kyc.idType}
                                </span>
                                <div className="font-mono font-bold text-slate-800 text-[11px] mt-1">
                                  {kyc.idNumber}
                                </div>
                                <div className="text-[10px] text-slate-400">জন্ম: {kyc.dateOfBirth}</div>
                              </td>

                              {/* Document quick views */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  {kyc.idFrontImage && (
                                    <button
                                      type="button"
                                      onClick={() => setAdminZoomDoc({ title: 'NID সামনের অংশ', url: kyc.idFrontImage })}
                                      className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-[#ed347d] transition-colors relative group"
                                      title="NID ফ্রন্ট প্রিভিউ"
                                    >
                                      <img src={kyc.idFrontImage} alt="NID Front" className="w-full h-full object-cover" />
                                      <span className="absolute inset-0 bg-black/40 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        NID
                                      </span>
                                    </button>
                                  )}
                                  {kyc.idBackImage && (
                                    <button
                                      type="button"
                                      onClick={() => setAdminZoomDoc({ title: 'NID পিছনের অংশ', url: kyc.idBackImage })}
                                      className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-[#ed347d] transition-colors relative group"
                                      title="NID ব্যাক প্রিভিউ"
                                    >
                                      <img src={kyc.idBackImage} alt="NID Back" className="w-full h-full object-cover" />
                                      <span className="absolute inset-0 bg-black/40 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        Back
                                      </span>
                                    </button>
                                  )}
                                  {kyc.academicCertificateImage && (
                                    <button
                                      type="button"
                                      onClick={() => setAdminZoomDoc({ title: 'ডিগ্রি সার্টিফিকেট', url: kyc.academicCertificateImage })}
                                      className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-[#ed347d] transition-colors relative group"
                                      title="সনদপত্র প্রিভিউ"
                                    >
                                      <img src={kyc.academicCertificateImage} alt="Certificate" className="w-full h-full object-cover" />
                                      <span className="absolute inset-0 bg-black/40 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        সনদ
                                      </span>
                                    </button>
                                  )}
                                  {kyc.selfieWithIdImage && (
                                    <button
                                      type="button"
                                      onClick={() => setAdminZoomDoc({ title: 'আইডি কার্ডসহ সেলফি', url: kyc.selfieWithIdImage })}
                                      className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-[#ed347d] transition-colors relative group"
                                      title="সেলফি প্রিভিউ"
                                    >
                                      <img src={kyc.selfieWithIdImage} alt="Selfie" className="w-full h-full object-cover" />
                                      <span className="absolute inset-0 bg-black/40 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        সেলফি
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Payout info */}
                              <td className="p-3.5">
                                <div className="font-bold text-slate-800 capitalize text-[11px]">{kyc.payoutMethod}</div>
                                <div className="font-mono text-[10px] text-slate-500">{kyc.payoutAccountNumber}</div>
                                {kyc.payoutBankName && <div className="text-[10px] text-slate-400">{kyc.payoutBankName}</div>}
                              </td>

                              {/* Status badge */}
                              <td className="p-3.5 text-center">
                                {kyc.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                                    <Clock className="w-3 h-3 animate-spin-slow" />
                                    পেন্ডিং রিভিউ
                                  </span>
                                )}
                                {kyc.status === 'approved' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                    <CheckCircle2 className="w-3 h-3" />
                                    অনুমোদিত
                                  </span>
                                )}
                                {kyc.status === 'rejected' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                                    <XCircle className="w-3 h-3" />
                                    বাতিলকৃত
                                  </span>
                                )}
                              </td>

                              {/* Action buttons */}
                              <td className="p-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedKycApp(kyc)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-[#ed347d] text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>যাচাই করুন</span>
                                </button>
                              </td>
                            </tr>
                          ))}

                        {effectiveKycList.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                              কোনো শিক্ষকের KYC আবেদন খুঁজে পাওয়া যায়নি।
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Inspection & Verification Modal */}
                  {selectedKycApp && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                      <div className="bg-white rounded-[28px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ed347d] flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900">
                                  শিক্ষক KYC আবেদন নিরীক্ষা: {selectedKycApp.fullName}
                                </h3>
                                <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700">
                                  #{selectedKycApp.applicationId}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">
                                জমা দেওয়ার সময়: {selectedKycApp.submittedAt}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedKycApp(null)}
                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="p-6 space-y-6">
                          {/* Current Status banner */}
                          <div className={`p-4 rounded-2xl flex items-center justify-between ${
                            selectedKycApp.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : selectedKycApp.status === 'rejected'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <div className="flex items-center gap-3">
                              {selectedKycApp.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                              {selectedKycApp.status === 'rejected' && <XCircle className="w-5 h-5 text-rose-600" />}
                              {selectedKycApp.status === 'pending' && <Clock className="w-5 h-5 text-amber-600" />}
                              <div>
                                <div className="font-black text-xs">
                                  বর্তমান স্ট্যাটাস: {selectedKycApp.status === 'approved' ? 'অনুমোদিত ও অ্যাক্টিভ' : selectedKycApp.status === 'rejected' ? 'বাতিলকৃত' : 'পর্যালোচনাধীন (Pending Approval)'}
                                </div>
                                {selectedKycApp.adminNotes && (
                                  <div className="text-[11px] font-medium mt-0.5">অ্যাডমিন নোট: {selectedKycApp.adminNotes}</div>
                                )}
                                {selectedKycApp.rejectionReason && (
                                  <div className="text-[11px] font-medium mt-0.5">বাতিলের কারণ: {selectedKycApp.rejectionReason}</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Data Sections Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal & Legal details */}
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[#ed347d]">
                                <Users className="w-4 h-4" />
                                <span>ব্যক্তিগত ও আইনি তথ্য</span>
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">পূর্ণ নাম:</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.fullName}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">ইমেইল ও ফোন:</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.teacherEmail} • {selectedKycApp.teacherPhone}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">পিতার নাম:</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.fatherName}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">মাতার নাম:</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.motherName}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">জন্ম তারিখ ও লিঙ্গ:</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.dateOfBirth} • {selectedKycApp.gender === 'male' ? 'পুরুষ' : selectedKycApp.gender === 'female' ? 'নারী' : 'অন্যান্য'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">পরিচয়পত্র নং ({selectedKycApp.idType.toUpperCase()}):</span>
                                  <span className="font-mono font-black text-[#ed347d] text-sm">{selectedKycApp.idNumber}</span>
                                </div>
                                <div className="py-1">
                                  <span className="text-slate-500 font-medium block">বর্তমান ঠিকানা:</span>
                                  <span className="font-semibold text-slate-800">{selectedKycApp.presentAddress}</span>
                                </div>
                                <div className="py-1">
                                  <span className="text-slate-500 font-medium block">স্থায়ী ঠিকানা:</span>
                                  <span className="font-semibold text-slate-800">{selectedKycApp.permanentAddress}</span>
                                </div>
                              </div>
                            </div>

                            {/* Academic, Contact & Payout Details */}
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[#ed347d]">
                                <GraduationCap className="w-4 h-4" />
                                <span>একাডেমিক ও পেআউট তথ্য</span>
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">ডিগ্রি ও বিভাগ:</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.degreeName} ({selectedKycApp.departmentName})</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">প্রতিষ্ঠান ও পাসের বছর:</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.institutionName} ({selectedKycApp.passingYear})</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">জরুরি যোগাযোগ ({selectedKycApp.emergencyContactRelation}):</span>
                                  <span className="font-bold text-slate-900">{selectedKycApp.emergencyContactName} ({selectedKycApp.emergencyContactPhone})</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">পেআউট মাধ্যম:</span>
                                  <span className="font-black text-slate-900 uppercase bg-pink-100 text-[#ed347d] px-2 py-0.5 rounded">
                                    {selectedKycApp.payoutMethod}
                                  </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500 font-medium">অ্যাকাউন্ট নম্বর:</span>
                                  <span className="font-mono font-black text-slate-900">{selectedKycApp.payoutAccountNumber}</span>
                                </div>
                                {selectedKycApp.payoutBankName && (
                                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                                    <span className="text-slate-500 font-medium">ব্যাংক ও শাখা:</span>
                                    <span className="font-bold text-slate-900">{selectedKycApp.payoutBankName} ({selectedKycApp.payoutBranchName})</span>
                                  </div>
                                )}
                                {selectedKycApp.demoVideoLink && (
                                  <div className="py-2">
                                    <span className="text-slate-500 font-medium block">ডেমো ক্লাস ভিডিও লিঙ্ক:</span>
                                    <a
                                      href={selectedKycApp.demoVideoLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs text-[#ed347d] hover:underline font-bold mt-1"
                                    >
                                      <span>{selectedKycApp.demoVideoLink}</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Documents Preview Section */}
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-[#ed347d]">
                              <FileCheck className="w-4 h-4" />
                              <span>আপলোডকৃত আইনি প্রমাণক ও নথিপত্র (ক্লিক করে বড় আকারে যাচাই করুন)</span>
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {/* NID Front */}
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-700">NID সামনের অংশ</div>
                                <div
                                  onClick={() => selectedKycApp.idFrontImage && setAdminZoomDoc({ title: 'NID সামনের অংশ', url: selectedKycApp.idFrontImage })}
                                  className="h-32 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#ed347d] transition-all group relative"
                                >
                                  {selectedKycApp.idFrontImage ? (
                                    <>
                                      <img src={selectedKycApp.idFrontImage} alt="NID Front" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                        <Eye className="w-4 h-4" /> বড় করুন
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-medium">যুক্ত করা হয়নি</span>
                                  )}
                                </div>
                              </div>

                              {/* NID Back */}
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-700">NID পিছনের অংশ</div>
                                <div
                                  onClick={() => selectedKycApp.idBackImage && setAdminZoomDoc({ title: 'NID পিছনের অংশ', url: selectedKycApp.idBackImage })}
                                  className="h-32 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#ed347d] transition-all group relative"
                                >
                                  {selectedKycApp.idBackImage ? (
                                    <>
                                      <img src={selectedKycApp.idBackImage} alt="NID Back" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                        <Eye className="w-4 h-4" /> বড় করুন
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-medium">যুক্ত করা হয়নি</span>
                                  )}
                                </div>
                              </div>

                              {/* Certificate */}
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-700">ডিগ্রি সার্টিফিকেট</div>
                                <div
                                  onClick={() => selectedKycApp.academicCertificateImage && setAdminZoomDoc({ title: 'ডিগ্রি সার্টিফিকেট', url: selectedKycApp.academicCertificateImage })}
                                  className="h-32 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#ed347d] transition-all group relative"
                                >
                                  {selectedKycApp.academicCertificateImage ? (
                                    <>
                                      <img src={selectedKycApp.academicCertificateImage} alt="Certificate" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                        <Eye className="w-4 h-4" /> বড় করুন
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-medium">যুক্ত করা হয়নি</span>
                                  )}
                                </div>
                              </div>

                              {/* Selfie with ID */}
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-700">আইডিসহ সেলফি</div>
                                <div
                                  onClick={() => selectedKycApp.selfieWithIdImage && setAdminZoomDoc({ title: 'আইডি কার্ডসহ সেলফি', url: selectedKycApp.selfieWithIdImage })}
                                  className="h-32 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#ed347d] transition-all group relative"
                                >
                                  {selectedKycApp.selfieWithIdImage ? (
                                    <>
                                      <img src={selectedKycApp.selfieWithIdImage} alt="Selfie with ID" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                        <Eye className="w-4 h-4" /> বড় করুন
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-medium">যুক্ত করা হয়নি</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Approval / Rejection Note box */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <label className="text-xs font-bold text-slate-700 block">
                              অ্যাডমিন পর্যবেক্ষণ / বিশেষ নোট (শিক্ষকের ড্যাশবোর্ডে দৃশ্যমান হবে):
                            </label>
                            <input
                              type="text"
                              value={adminApprovalNote}
                              onChange={(e) => setAdminApprovalNote(e.target.value)}
                              placeholder="যেমন: সকল নথি শতভাগ নির্ভুলভাবে যাচাই করা হয়েছে। প্ল্যাটফর্মে স্বাগতম।"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-[#ed347d]"
                            />
                          </div>

                          {/* Action Buttons in Modal */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedKycApp(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                              >
                                বন্ধ করুন
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Reject Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsRejectModalOpen(true);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>আবেদন বাতিল / সংশোধন চান</span>
                              </button>

                              {/* Approve Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  approveTeacherKyc(
                                    selectedKycApp.applicationId,
                                    adminApprovalNote || 'সকল নথিপত্র ও জাতীয় পরিচয়পত্র শতভাগ যাচাইপূর্বক সুপার অ্যাডমিন কর্তৃক অনুমোদিত।'
                                  );
                                  setSelectedKycApp(null);
                                  setAdminApprovalNote('');
                                  setTimeout(() => refreshKycList(), 300);
                                }}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:shadow-emerald-500/20 active:scale-95"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>অনুমোদন করুন ও শিক্ষক প্যানেল আনলক করুন</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reject Reason Dialog */}
                  {isRejectModalOpen && selectedKycApp && (
                    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100 animate-in zoom-in-95">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">আবেদন বাতিলের কারণ উল্লেখ করুন</h4>
                            <p className="text-xs text-slate-500">শিক্ষক এই কারণ দেখে নথি সংশোধন করে আবার আবেদন করতে পারবেন।</p>
                          </div>
                        </div>

                        <div>
                          <textarea
                            rows={3}
                            value={adminRejectionReason}
                            onChange={(e) => setAdminRejectionReason(e.target.value)}
                            placeholder="যেমন: NID পিছনের পাতার ছবি অস্পষ্ট ছিল, অনুগ্রহ করে পুনরায় পরিষ্কার স্ক্যান কপি আপলোড করুন।"
                            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 font-medium"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsRejectModalOpen(false);
                              setAdminRejectionReason('');
                            }}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              rejectTeacherKyc(
                                selectedKycApp.applicationId,
                                adminRejectionReason || 'জাতীয় পরিচয়পত্র অথবা সার্টিফিকেট সংক্রান্ত তথ্য অপর্যাপ্ত বা অস্পষ্ট।'
                              );
                              setIsRejectModalOpen(false);
                              setSelectedKycApp(null);
                              setAdminRejectionReason('');
                              setTimeout(() => refreshKycList(), 300);
                            }}
                            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
                          >
                            বাতিলকরণ নিশ্চিত করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Zoom Lightbox */}
                  {adminZoomDoc && (
                    <div
                      onClick={() => setAdminZoomDoc(null)}
                      className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
                    >
                      <div className="text-white text-sm font-bold mb-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                        {adminZoomDoc.title} • (বন্ধ করতে বাইরে ক্লিক করুন)
                      </div>
                      <img
                        src={adminZoomDoc.url}
                        alt={adminZoomDoc.title}
                        className="max-w-[90vw] max-h-[80vh] rounded-2xl object-contain border border-white/20 shadow-2xl"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Subview: All Teachers Grid */}
              {(activeSubMenu === 'teachers_all' || activeSubMenu === 'default') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {realTeachers.map((t, idx) => (
                    <div key={`${t.id}_${idx}`} className="p-5 rounded-[26px] border border-slate-200/80 bg-white hover:border-[#ed347d]/40 transition-all shadow-xs hover:shadow-[0_8px_30px_-6px_rgba(237,52,125,0.08)] space-y-3 group">
                      <div className="flex items-center gap-3">
                        <img src={t.avatar} alt={t.name} className="w-13 h-13 rounded-2xl object-cover border-2 border-pink-200/80 shadow-2xs group-hover:scale-105 transition-transform shrink-0" />
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{t.name}</h4>
                          <span className="text-[11px] text-slate-500 font-bold block truncate max-w-[170px]">{t.institution}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold mt-0.5">
                            <BadgeCheck className="w-3 h-3 text-emerald-500" />
                            <span>ভেরিফাইড মেন্টর</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">প্রধান বিষয়:</span>
                          <strong className="text-slate-800">{t.subject}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">কোর্স সংখ্যা:</span>
                          <strong className="text-slate-800">{t.coursesTaught.length} টি</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">মোট শিক্ষার্থী:</span>
                          <strong className="text-slate-900">{t.totalStudents} জন</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">কমিশন রেট:</span>
                          <strong className="text-[#ed347d]">{t.commissionPercent}%</strong>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 font-medium block truncate bg-slate-50 p-2 rounded-xl">
                          কোর্স: {t.coursesTaught.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. COURSES MANAGEMENT */}
          {/* ========================================================================= */}
          {activeMenu === 'courses' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>কোর্স ও ক্যাটাগরি তালিকা (Real Courses)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">প্ল্যাটফর্মের সকল সক্রিয় কোর্স ও ক্যাটাগরি কনফিগারেশন</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-black border border-purple-200/60 self-start sm:self-auto">
                  মোট {courses.length} টি কোর্স
                </span>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'courses_all', label: `All Courses (${courses.length})` },
                  { id: 'courses_pending', label: `Pending Approval (${courses.filter(c => c.isDraft).length})` },
                  { id: 'courses_published', label: `Published (${courses.filter(c => !c.isDraft).length})` },
                  { id: 'courses_draft', label: `Draft (${courses.filter(c => c.isDraft).length})` },
                  { id: 'courses_reported', label: `Reported (${reportedCourses.filter(r => r.status === 'pending').length})` },
                  { id: 'courses_categories', label: `Categories (${realCategories.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subview: Reported Courses */}
              {activeSubMenu === 'courses_reported' ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-black text-slate-900">শিক্ষার্থীদের কোর্স সংক্রান্ত রিপোর্ট ও কমপ্লেইন</h4>
                    <p className="text-xs text-slate-500 font-medium">কোর্সের কন্টেন্ট বা লেকচার সংক্রান্ত সমস্যা পর্যবেক্ষণ ও সমাধান</p>
                  </div>

                  {reportedCourses.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      কোনো কোর্স নিয়ে অভিযোগ নেই। সকল কোর্স সক্রিয় ও ত্রুটিহীন।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reportedCourses.map((rep, idx) => (
                        <div key={`${rep.id}_${idx}`} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-xs">{rep.courseTitle}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                                rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {rep.status === 'resolved' ? '✓ Resolved' : '⚠️ Pending Dispute'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{rep.reason}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">রিপোর্টার: {rep.studentName} • {rep.date}</span>
                          </div>

                          {rep.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleResolveReport(rep.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer shrink-0"
                            >
                              সমস্যার সমাধান নিশ্চিত করুন
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeSubMenu === 'courses_categories' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realCategories.map((cat, idx) => (
                    <div key={`${cat.id}_${idx}`} className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{cat.name}</span>
                        <span className="px-2.5 py-0.5 rounded-xl bg-purple-100 text-purple-700 text-[10px] font-black">
                          {cat.count} টি কোর্স
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">অদম্য একাডেমিক সিলেবাস ও বিভাগ</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                      <tr>
                        <th className="p-3.5">কোর্সের নাম</th>
                        <th className="p-3.5">ক্যাটাগরি</th>
                        <th className="p-3.5">ইন্সট্রাক্টর</th>
                        <th className="p-3.5">অফার প্রাইস</th>
                        <th className="p-3.5">শিক্ষার্থী সংখ্যা</th>
                        <th className="p-3.5">স্ট্যাটাস</th>
                        <th className="p-3.5 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCourses.map((c, idx) => (
                        <tr key={`${c.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 max-w-[240px] truncate">{c.title}</div>
                            <div className="text-[10px] text-slate-400">{c.batch || 'রেগুলার ব্যাচ'}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                              {c.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">{c.instructor?.name || 'অনবোর্ডেড ফ্যাকাল্টি'}</td>
                          <td className="p-3.5 font-black text-slate-900 font-mono">৳ {c.offerPrice || c.regularPrice}</td>
                          <td className="p-3.5 font-bold text-slate-700">{c.enrolledCount || 0} জন</td>
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                updateCourse(c.id, { isDraft: !c.isDraft });
                                showToast(`কোর্সটি ${c.isDraft ? 'পাবলিশ' : 'ড্রাফট'} করা হয়েছে!`);
                              }}
                              className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all active:scale-95 ${
                                c.isDraft
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              {c.isDraft ? '⏳ ড্রাফট' : '✓ পাবলিশড'}
                            </button>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Link
                                href={`/classroom/${c.id}`}
                                className="px-2.5 py-1.5 rounded-xl bg-pink-50 text-[#ed347d] hover:bg-[#ed347d] hover:text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 shadow-2xs"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>ক্লাসরুম</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof window !== 'undefined' && window.confirm(`আপনি কি নিশ্চিত যে "${c.title}" কোর্সটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
                                    deleteCourse(c.id);
                                    showToast(`"${c.title}" কোর্সটি সফলভাবে মুছে ফেলা হয়েছে!`);
                                  }
                                }}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                                title="কোর্স মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. ENROLLMENTS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeMenu === 'enrollments' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span>শিক্ষার্থী এনরোলমেন্ট ও পেমেন্ট ভেরিফিকেশন (Real Enrollments)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">শিক্ষার্থীদের কোর্স এনরোলমেন্ট রিকোয়েস্ট পর্যালোচনা ও তাৎক্ষণিক এক্সেস প্রদান</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-black border border-blue-200/60 self-start sm:self-auto">
                  মোট {filteredEnrollments.length} টি এনরোলমেন্ট
                </span>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'enrollments_all', label: `All Enrollments (${enrollments.length})` },
                  { id: 'enrollments_active', label: `Active (${approvedEnrollments.length})` },
                  { id: 'enrollments_completed', label: 'Completed' },
                  { id: 'enrollments_cancelled', label: `Cancelled (${rejectedEnrollments.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Enrollments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                    <tr>
                      <th className="p-3.5">শিক্ষার্থীর নাম</th>
                      <th className="p-3.5">মোবাইল</th>
                      <th className="p-3.5">কোর্স</th>
                      <th className="p-3.5">পদ্ধতি ও TrxID</th>
                      <th className="p-3.5">টাকা</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnrollments.map((enr, idx) => (
                      <tr key={`${enr.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{enr.studentName}</div>
                          <div className="text-[10px] text-slate-400">{enr.createdAt}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">{enr.studentPhone}</td>
                        <td className="p-3.5 max-w-[200px] truncate text-slate-600">{enr.courseTitle}</td>
                        <td className="p-3.5">
                          <span className="font-black text-pink-600">{enr.paymentMethod}</span>
                          <span className="font-mono font-bold text-[#ed347d] block">{enr.trxId}</span>
                        </td>
                        <td className="p-3.5 font-black text-slate-900 font-mono text-sm">৳ {enr.amount}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            enr.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : enr.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${enr.status === 'approved' ? 'bg-emerald-500' : enr.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                            {enr.status === 'approved' ? 'অনুমোদিত' : enr.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {enr.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    approveEnrollment(enr.id);
                                    showToast(`${enr.studentName} এর এনরোলমেন্ট অনুমোদিত হয়েছে!`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>অনুমোদন</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectEnrollment(enr.id)}
                                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                  title="বাতিল করুন"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedReceiptEnrollment(enr)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-[#ed347d] text-slate-700 text-[11px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>রশিদ দেখুন</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== 'undefined' && window.confirm(`এনরোলমেন্ট #${enr.id} মুছে ফেলতে চান?`)) {
                                  deleteEnrollment(enr.id);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. PAYMENTS MODULE */}
          {/* ========================================================================= */}
          {activeMenu === 'payments' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-pink-500" />
                    <span>পেমেন্ট গেটওয়ে ট্রানজেকশন লেজার (Real Transactions)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">বিকাশ, নগদ, রকেট পেমেন্ট ভেরিফিকেশন ও ট্র্যাকিং</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-pink-50 text-pink-700 text-xs font-black border border-pink-200/60 self-start sm:self-auto">
                  মোট {filteredPayments.length} টি ট্রানজেকশন
                </span>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'payments_transactions', label: 'Transactions' },
                  { id: 'payments_orders', label: 'Orders' },
                  { id: 'payments_successful', label: `Successful (${approvedEnrollments.length})` },
                  { id: 'payments_failed', label: `Failed (${rejectedEnrollments.length})` },
                  { id: 'payments_refunds', label: 'Refunds' },
                  { id: 'payments_settings', label: 'Payment Settings' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subview: Payment Settings */}
              {activeSubMenu === 'payments_settings' ? (
                <div className="max-w-2xl space-y-5 bg-slate-50/60 p-6 rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 pb-3">
                    <h4 className="text-sm font-black text-slate-900">অফিসিয়াল মার্চেন্ট গেটওয়ে সেটিংস</h4>
                    <p className="text-xs text-slate-500">বিকাশ, নগদ ও রকেট পেমেন্ট গ্রহণের জন্য মার্চেন্ট একাউন্ট নম্বরসমূহ</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">bKash Merchant Account Number</label>
                      <input
                        type="text"
                        value={systemSettings.bkashMerchant}
                        onChange={(e) => setSystemSettings({ ...systemSettings, bkashMerchant: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nagad Merchant Account Number</label>
                      <input
                        type="text"
                        value={systemSettings.nagadMerchant}
                        onChange={(e) => setSystemSettings({ ...systemSettings, nagadMerchant: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Rocket Biller / Merchant Number</label>
                      <input
                        type="text"
                        value={systemSettings.rocketMerchant}
                        onChange={(e) => setSystemSettings({ ...systemSettings, rocketMerchant: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 shadow-2xs"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white font-black text-xs shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer border-t border-white/30"
                  >
                    গেটওয়ে সেটিংস সংরক্ষণ করুন
                  </button>
                </div>
              ) : activeSubMenu === 'payments_refunds' ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-black text-slate-900">রিফান্ড ও পেমেন্ট ফেরত লগ</h4>
                    <p className="text-xs text-slate-500">বাতিলকৃত বা ভুলবশত প্রদত্ত ট্রানজেকশনের রিফান্ড ডিসপ্যাচ</p>
                  </div>

                  {rejectedEnrollments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      বর্তমানে কোনো রিফান্ড রিকোয়েস্ট নেই।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rejectedEnrollments.map((enr, idx) => (
                        <div key={`${enr.id}_${idx}`} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div>
                            <span className="font-bold text-slate-900 text-xs">{enr.studentName} ({enr.studentPhone})</span>
                            <div className="text-xs text-slate-500 mt-0.5">টাকা: ৳ {enr.amount} • গেটওয়ে: {enr.paymentMethod} • TrxID: {enr.trxId}</div>
                            <span className="text-[10px] text-rose-600 font-bold block mt-1">স্ট্যাটাস: বাতিলকৃত এনরোলমেন্ট (রিফান্ড যোগ্য)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => showToast(`${enr.studentName} কে ৳ ${enr.amount} টাকা রিফান্ড প্রসেস সম্পন্ন হয়েছে!`)}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
                          >
                            রিফান্ড ইস্যু করুন
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                      <tr>
                        <th className="p-3.5">অর্ডার আইডি</th>
                        <th className="p-3.5">TrxID</th>
                        <th className="p-3.5">প্রেরক শিক্ষার্থী</th>
                        <th className="p-3.5">কোর্স</th>
                        <th className="p-3.5">গেটওয়ে</th>
                        <th className="p-3.5">টাকা</th>
                        <th className="p-3.5">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPayments.map((enr, idx) => (
                        <tr key={`${enr.id}_${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-700">ORD-{enr.id}</td>
                          <td className="p-3.5 font-mono font-black text-[#ed347d]">{enr.trxId}</td>
                          <td className="p-3.5 font-bold text-slate-900">{enr.studentName}</td>
                          <td className="p-3.5 text-slate-600 max-w-[200px] truncate">{enr.courseTitle}</td>
                          <td className="p-3.5 font-black text-pink-600">{enr.paymentMethod}</td>
                          <td className="p-3.5 font-black text-slate-900 font-mono text-sm">৳ {enr.amount}</td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                              enr.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${enr.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {enr.status === 'approved' ? 'সফল পেমেন্ট' : 'অপেক্ষমাণ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. REVENUE & FINANCIALS */}
          {/* ========================================================================= */}
          {activeMenu === 'revenue' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span>রাজস্ব ও আর্থিক হিসাব (Real Revenue & Financials)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">প্ল্যাটফর্মের গ্রস সেলস, শিক্ষক প্রাপ্য ও নিট লাভ পর্যবেক্ষণ</p>
                </div>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'revenue_total', label: 'Total Revenue' },
                  { id: 'revenue_teachers', label: 'Teacher Earnings' },
                  { id: 'revenue_platform', label: 'Platform Revenue' },
                  { id: 'revenue_payouts', label: 'Payouts Summary' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id || (activeSubMenu === 'default' && tab.id === 'revenue_total')
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Financial Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-[26px] bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-2">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">মোট প্ল্যাটফর্ম বিক্রয়</span>
                  <div className="text-3xl font-black text-slate-900 font-mono">
                    ৳ {realTotalRevenue.toLocaleString('en-BD')}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold block">
                    {approvedEnrollments.length} টি অনুমোদিত ভর্তির মোট সংগৃহীত ফি
                  </span>
                </div>

                <div className="p-6 rounded-[26px] bg-emerald-50/60 border border-emerald-200/80 shadow-2xs space-y-2">
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">শিক্ষকদের মোট অংশ (৮০%)</span>
                  <div className="text-3xl font-black text-emerald-700 font-mono">
                    ৳ {realTeacherEarnings.toLocaleString('en-BD')}
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                    <div>পরিশোধিত: ৳ {totalPaidOutSum.toLocaleString('en-BD')}</div>
                    <div className="font-bold text-[#ed347d]">বকেয়া পাওনা: ৳ {totalDueSum.toLocaleString('en-BD')}</div>
                  </div>
                </div>

                <div className="p-6 rounded-[26px] bg-pink-50/60 border border-pink-200 shadow-2xs space-y-2">
                  <span className="text-[11px] font-black text-[#ed347d] uppercase tracking-wider">প্ল্যাটফর্ম নেট মার্জিন (২০%)</span>
                  <div className="text-3xl font-black text-[#ed347d] font-mono">
                    ৳ {realPlatformMargin.toLocaleString('en-BD')}
                  </div>
                  <span className="text-[11px] text-pink-600 font-bold block">
                    সার্ভার, স্ট্রিম ও অপারেশনাল নিট লাভ
                  </span>
                </div>
              </div>

              {/* Teacher-wise Revenue Table */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">শিক্ষক ভিত্তিক কোর্স সেলস ও রাজস্ব উপার্জন টেবিল (Real Ledger)</h3>
                    <p className="text-xs text-slate-500">প্রতিজন ফ্যাকাল্টির নিজস্ব কোর্সের মোট বিক্রয় ও ৮০% পাওনা হিসাব</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('payouts', 'payouts_pending')}
                    className="text-xs font-bold text-[#ed347d] hover:underline cursor-pointer"
                  >
                    পেআউট উইন্ডোতে যান →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                      <tr>
                        <th className="p-3.5">শিক্ষক</th>
                        <th className="p-3.5">কোর্সসমূহ</th>
                        <th className="p-3.5">মোট কোর্স সেলস</th>
                        <th className="p-3.5">শিক্ষক প্রাপ্য (৮০%)</th>
                        <th className="p-3.5">পরিশোধিত পেআউট</th>
                        <th className="p-3.5">অবশিষ্ট বকেয়া</th>
                        <th className="p-3.5 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teacherEarningsTable.map((t, idx) => (
                        <tr key={`${t.id}_${idx}`} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold text-slate-900">{t.name}</td>
                          <td className="p-3.5 text-slate-600 truncate max-w-[200px] font-medium">{t.coursesTaught.join(', ')}</td>
                          <td className="p-3.5 font-black text-slate-800 font-mono">৳ {t.totalSales.toLocaleString('en-BD')}</td>
                          <td className="p-3.5 font-black text-emerald-600 font-mono">৳ {t.teacherEarned.toLocaleString('en-BD')}</td>
                          <td className="p-3.5 font-bold text-slate-600 font-mono">৳ {t.paidOut.toLocaleString('en-BD')}</td>
                          <td className="p-3.5 font-black text-[#ed347d] font-mono">৳ {t.dueBalance.toLocaleString('en-BD')}</td>
                          <td className="p-3.5 text-center">
                            {t.dueBalance > 0 ? (
                              <button
                                type="button"
                                onClick={() => openDisbursePayoutModal(t)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[11px] shadow-xs cursor-pointer"
                              >
                                পেআউট করুন
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-bold">পরিশোধিত</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. TEACHER PAYOUTS */}
          {/* ========================================================================= */}
          {activeMenu === 'payouts' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                    <span>শিক্ষক পেআউট বিতরণ ও নিষ্পত্তি (Real Teacher Payouts)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">শিক্ষকদের বকেয়া রেভিনিউ ব্যাংকিং বা মোবাইল ওয়ালেটে নিষ্পত্তি করুন</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                    পরিশোধিত: ৳ {totalPaidOutSum.toLocaleString('en-BD')}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-pink-50 text-[#ed347d] text-xs font-black border border-pink-200">
                    বকেয়া: ৳ {totalDueSum.toLocaleString('en-BD')}
                  </span>
                </div>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'payouts_pending', label: `Pending Payouts (${teacherEarningsTable.filter(t => t.dueBalance > 0).length})` },
                  { id: 'payouts_paid', label: `Paid (${payoutRecords.length})` },
                  { id: 'payouts_history', label: 'Payout History' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subview: Payout History / Paid Records */}
              {activeSubMenu === 'payouts_history' || activeSubMenu === 'payouts_paid' ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-black text-slate-900">পরিশোধিত পেআউট হিস্ট্রি ও ট্রানজেকশন ভাউচার</h4>
                    <p className="text-xs text-slate-500">ব্যাংক ট্রান্সফার ও বিকাশ মার্চেন্ট নিষ্পত্তির স্থায়ী রেজিস্টার</p>
                  </div>

                  {payoutRecords.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      এখনো কোনো পেআউট ট্রানজেকশন সম্পন্ন হয়নি। শিক্ষকদের বকেয়া ব্যালেন্স থেকে "পেআউট সম্পন্ন করুন" বাটনে ক্লিক করে প্রথম ডিসবার্সমেন্ট সম্পন্ন করুন।
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                          <tr>
                            <th className="p-3.5">ভাউচার আইডি</th>
                            <th className="p-3.5">শিক্ষক</th>
                            <th className="p-3.5">পরিশোধের মাধ্যম</th>
                            <th className="p-3.5">অ্যাকাউন্ট / TrxID</th>
                            <th className="p-3.5">টাকার অঙ্ক</th>
                            <th className="p-3.5">তারিখ</th>
                            <th className="p-3.5">নোট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payoutRecords.map((p, idx) => (
                            <tr key={`${p.id}_${idx}`} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5 font-mono font-bold text-slate-700">{p.id}</td>
                              <td className="p-3.5 font-black text-slate-900">{p.teacherName}</td>
                              <td className="p-3.5 text-cyan-700 font-extrabold">{p.method}</td>
                              <td className="p-3.5 font-mono text-[#ed347d] font-bold">{p.trxId}</td>
                              <td className="p-3.5 font-black text-emerald-600 text-sm font-mono">৳ {p.amount.toLocaleString('en-BD')}</td>
                              <td className="p-3.5 text-slate-500">{p.paidAt}</td>
                              <td className="p-3.5 text-slate-500 italic max-w-[180px] truncate">{p.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                      <tr>
                        <th className="p-3.5">শিক্ষক</th>
                        <th className="p-3.5">প্রতিষ্ঠান</th>
                        <th className="p-3.5">মোট অর্জিত রেভিনিউ</th>
                        <th className="p-3.5">পরিশোধিত অর্থ</th>
                        <th className="p-3.5">উইথড্রলযোগ্য বকেয়া</th>
                        <th className="p-3.5 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPayoutTeachers.map((t, idx) => (
                        <tr key={`${t.id}_${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                            <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-2xl object-cover border border-slate-200 shadow-2xs" />
                            <span>{t.name}</span>
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">{t.institution}</td>
                          <td className="p-3.5 font-black text-slate-800 font-mono">৳ {t.teacherEarned.toLocaleString('en-BD')}</td>
                          <td className="p-3.5 font-bold text-slate-500 font-mono">৳ {t.paidOut.toLocaleString('en-BD')}</td>
                          <td className="p-3.5 font-black text-[#ed347d] text-sm font-mono">৳ {t.dueBalance.toLocaleString('en-BD')}</td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => openDisbursePayoutModal(t)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>পেআউট সম্পন্ন করুন</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. COUPONS */}
          {/* ========================================================================= */}
          {activeMenu === 'coupons' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-orange-500" />
                    <span>কুপন ও প্রমোশনাল ডিসকাউন্ট (Real Coupons)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">ক্যাম্পেইন ডিসকাউন্ট ও প্রোমো কোড পরিচালনা</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCouponModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#fa507e] to-[#ec376d] shadow-md shadow-pink-500/20 active:scale-95 flex items-center gap-2 cursor-pointer self-start sm:self-auto border-t border-white/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ নতুন কুপন তৈরি</span>
                </button>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'coupons_all', label: `All Coupons (${coupons.length})` },
                  { id: 'coupons_create', label: '+ Create Coupon' },
                  { id: 'coupons_rules', label: 'Discount Rules' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'coupons_create') {
                        setNewCouponModal(true);
                      } else {
                        setActiveSubMenu(tab.id as SubMenu);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subview: Discount Rules */}
              {activeSubMenu === 'coupons_rules' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-[24px] border border-slate-200/80 bg-white shadow-2xs space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-[#ed347d] text-[10px] font-black">Rule 1</span>
                    <h4 className="text-sm font-black text-slate-900">ফার্স্ট-টাইম শিক্ষার্থী স্পেশাল ডিসকাউন্ট</h4>
                    <p className="text-xs text-slate-600">যেসব শিক্ষার্থী প্ল্যাটফর্মে নতুন রেজিস্ট্রেশন করবে, প্রথম কোর্সে স্বয়ংক্রিয়ভাবে ১০% ছাড় প্রযোজ্য হবে।</p>
                  </div>
                  <div className="p-6 rounded-[24px] border border-slate-200/80 bg-white shadow-2xs space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black">Rule 2</span>
                    <h4 className="text-sm font-black text-slate-900">মাল্টি-কোর্স বান্ডেল এনরোলমেন্ট</h4>
                    <p className="text-xs text-slate-600">একসাথে পদার্থবিজ্ঞান ও গণিত ২টি কোর্স কার্টে যুক্ত করলে অতিরিক্ত ৫০০ টাকা ফ্ল্যাট ডিসকাউন্ট পাওয়া যাবে।</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {coupons.map((c, idx) => (
                    <div key={`${c.id}_${idx}`} className="p-5 rounded-[24px] border border-slate-200/80 bg-white hover:border-pink-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-pink-100 text-[#ed347d] font-mono font-black text-xs">
                          {c.code}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(c.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-all active:scale-95 ${
                              c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900">
                          {c.discountType === 'percent' ? `${c.discountValue}% ছাড়` : `৳ ${c.discountValue} ছাড়`}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{c.applicableCourse}</div>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between font-medium">
                        <span>ব্যবহৃত: {c.usageCount} বার</span>
                        <span>মেয়াদ: {c.expiresAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. SYSTEM SETTINGS */}
          {/* ========================================================================= */}
          {activeMenu === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 max-w-3xl shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-700" />
                    <span>সিস্টেম ও ওয়েবসাইট সেটিংস (Settings)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">লাইভ নোটিশ ব্যানার, মার্চেন্ট নম্বর ও সাপোর্ট তথ্য পরিচালনা</p>
                </div>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'settings_general', label: 'General' },
                  { id: 'settings_website', label: 'Website' },
                  { id: 'settings_payment', label: 'Payment' },
                  { id: 'settings_email', label: 'Email' },
                  { id: 'settings_notifications', label: 'Notifications' },
                  { id: 'settings_security', label: 'Security' },
                  { id: 'settings_system', label: 'System Settings' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subview: Website Settings */}
              {activeSubMenu === 'settings_website' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ওয়েবসাইটের শীর্ষ লাইভ নোটিশ ব্যানার (Live Ticker)</label>
                    <textarea
                      rows={2}
                      value={systemSettings.liveNotice}
                      onChange={(e) => setSystemSettings({ ...systemSettings, liveNotice: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 shadow-2xs"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">ওয়েবসাইট মেইনটেনেন্স মোড (Maintenance Mode)</span>
                      <span className="text-[11px] text-slate-500 font-medium">অন থাকলে সাধারণ ভিজিটররা সাইট সাময়িক বন্ধ বার্তা দেখতে পাবে</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                      className="w-5 h-5 accent-[#ed347d] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Subview: Payment Settings */}
              {activeSubMenu === 'settings_payment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">বিকাশ মার্চেন্ট নম্বর</label>
                      <input
                        type="text"
                        value={systemSettings.bkashMerchant}
                        onChange={(e) => setSystemSettings({ ...systemSettings, bkashMerchant: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">নগদ মার্চেন্ট নম্বর</label>
                      <input
                        type="text"
                        value={systemSettings.nagadMerchant}
                        onChange={(e) => setSystemSettings({ ...systemSettings, nagadMerchant: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">রকেট মার্চেন্ট নম্বর</label>
                      <input
                        type="text"
                        value={systemSettings.rocketMerchant}
                        onChange={(e) => setSystemSettings({ ...systemSettings, rocketMerchant: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সর্বনিম্ন শিক্ষক উইথড্রল সীমা (৳)</label>
                    <input
                      type="number"
                      value={systemSettings.minPayoutAmount}
                      onChange={(e) => setSystemSettings({ ...systemSettings, minPayoutAmount: Number(e.target.value) })}
                      className="w-full max-w-xs p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Subview: Email Settings */}
              {activeSubMenu === 'settings_email' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={systemSettings.smtpHost}
                        onChange={(e) => setSystemSettings({ ...systemSettings, smtpHost: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={systemSettings.smtpPort}
                        onChange={(e) => setSystemSettings({ ...systemSettings, smtpPort: Number(e.target.value) })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">অটোমেটেড রসিদ প্রেরক ইমেইল</label>
                    <input
                      type="email"
                      value={systemSettings.smtpSender}
                      onChange={(e) => setSystemSettings({ ...systemSettings, smtpSender: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Subview: Notifications Settings */}
              {activeSubMenu === 'settings_notifications' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">SMS Gateway API Token</label>
                    <input
                      type="password"
                      value={systemSettings.smsGatewayApiKey}
                      onChange={(e) => setSystemSettings({ ...systemSettings, smsGatewayApiKey: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">মাস্কিং প্রেরক আইডি (Sender ID)</label>
                    <input
                      type="text"
                      value={systemSettings.smsSenderId}
                      onChange={(e) => setSystemSettings({ ...systemSettings, smsSenderId: e.target.value })}
                      className="w-full max-w-xs p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">পরীক্ষার সময়সূচী অ্যালার্ট এসএমএস</span>
                      <span className="text-[11px] text-slate-500 font-medium">লাইভ ওএমআর পরীক্ষার ৩০ মিনিট পূর্বে শিক্ষার্থীদের অটো এসএমএস প্রেরণ</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.enableExamSms}
                      onChange={(e) => setSystemSettings({ ...systemSettings, enableExamSms: e.target.checked })}
                      className="w-5 h-5 accent-[#ed347d] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Subview: Security Settings */}
              {activeSubMenu === 'settings_security' && (
                <div className="space-y-4">
                  <div className="max-w-xs">
                    <label className="text-xs font-bold text-slate-700 block mb-1">সুপার অ্যাডমিন সিকিউরিটি পিন (PIN)</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={systemSettings.adminPin}
                      onChange={(e) => setSystemSettings({ ...systemSettings, adminPin: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">টু-ফ্যাক্টর অথেনটিকেশন (2FA)</span>
                      <span className="text-[11px] text-slate-500 font-medium">অ্যাডমিন প্যানেলে লগইনের জন্য ওটিপি যাচাইকরণ আবশ্যক</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.twoFactorAuth}
                      onChange={(e) => setSystemSettings({ ...systemSettings, twoFactorAuth: e.target.checked })}
                      className="w-5 h-5 accent-[#ed347d] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Subview: General Settings */}
              {(activeSubMenu === 'settings_general' || activeSubMenu === 'default') && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">প্ল্যাটফর্মের নাম</label>
                    <input
                      type="text"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">অফিসিয়াল সাপোর্ট হটলাইন</label>
                      <input
                        type="text"
                        value={systemSettings.supportHotline}
                        onChange={(e) => setSystemSettings({ ...systemSettings, supportHotline: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">অফিসিয়াল সাপোর্ট ইমেইল</label>
                      <input
                        type="email"
                        value={systemSettings.supportEmail}
                        onChange={(e) => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">হেডকোয়ার্টার ঠিকানা</label>
                    <input
                      type="text"
                      value={systemSettings.address}
                      onChange={(e) => setSystemSettings({ ...systemSettings, address: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Subview: System Settings / Reset */}
              {activeSubMenu === 'settings_system' && (
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-slate-900 block">ডাটাবেজ ক্যাশ ও ফ্যাক্টরি রিসেট</span>
                    <p className="text-xs text-slate-500 font-medium">সিস্টেমের সমস্ত মক ও লোকালস্টোরেজ ডাটা ডিফল্ট ফ্যাক্টরি অবস্থায় ফিরিয়ে নিন</p>
                    <button
                      type="button"
                      onClick={() => {
                        resetToDefaultData();
                        showToast('সিস্টেম ফ্যাক্টরি ডিফল্ট ডাটাতে রিসেট করা হয়েছে!');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs cursor-pointer shadow-xs mt-1"
                    >
                      ফ্যাক্টরি ডাটা রিসেট করুন
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white font-black text-xs shadow-md shadow-pink-500/20 active:scale-95 hover:opacity-95 transition-all cursor-pointer border-t border-white/30"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 11. ROLES & PERMISSIONS MATRIX */}
          {/* ========================================================================= */}
          {activeMenu === 'roles' && (
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-600" />
                  <span>রোল ও পারমিশন কন্ট্রোল ম্যাট্রিক্স (Roles & Permissions)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">অ্যাডমিনিস্ট্রেশন টিমের বিভিন্ন পদের জন্য মডিউল এক্সেস সীমাবদ্ধতা নির্ধারণ</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-black text-[11px] uppercase tracking-wider rounded-xl">
                    <tr>
                      <th className="p-3.5">রোল (পদবী)</th>
                      <th className="p-3.5 text-center">কোর্স ও ক্লাস পরিচালনা</th>
                      <th className="p-3.5 text-center">পেমেন্ট অনুমোদন</th>
                      <th className="p-3.5 text-center">পেআউট বিতরণ</th>
                      <th className="p-3.5 text-center">শিক্ষার্থী ডাটা ও রোল</th>
                      <th className="p-3.5 text-center">সিস্টেম কনফিগারেশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: 'super_admin' as const, title: 'Super Administrator', desc: 'সকল মডিউলে পূর্ণ রুট এক্সেস' },
                      { key: 'academic_lead' as const, title: 'Academic Lead (ফ্যাকাল্টি হেড)', desc: 'কোর্স, কন্টেন্ট ও এক্সাম কন্ট্রোল' },
                      { key: 'finance_manager' as const, title: 'Finance Officer (হিসাবরক্ষক)', desc: 'পেমেন্ট ও শিক্ষক পেআউট সেটলমেন্ট' },
                      { key: 'support_staff' as const, title: 'Support Representative', desc: 'শিক্ষার্থী অনুসন্ধান ও ট্র্যাকিং' },
                    ].map(r => (
                      <tr key={r.key} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-black text-slate-900">{r.title}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{r.desc}</div>
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions[r.key].courses}
                            onChange={() => toggleRolePermission(r.key, 'courses')}
                            className="w-4 h-4 accent-[#ed347d] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions[r.key].payments}
                            onChange={() => toggleRolePermission(r.key, 'payments')}
                            className="w-4 h-4 accent-[#ed347d] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions[r.key].payouts}
                            onChange={() => toggleRolePermission(r.key, 'payouts')}
                            className="w-4 h-4 accent-[#ed347d] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions[r.key].users}
                            onChange={() => toggleRolePermission(r.key, 'users')}
                            className="w-4 h-4 accent-[#ed347d] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions[r.key].settings}
                            onChange={() => toggleRolePermission(r.key, 'settings')}
                            className="w-4 h-4 accent-[#ed347d] cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD TEACHER */}
      {/* ========================================================================= */}
      {newTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#ed347d]" />
                <span>নতুন শিক্ষক যুক্ত করুন</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setNewTeacherModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-700 block mb-1">শিক্ষকের পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: ড. মো: রফিকুল ইসলাম"
                  value={newTeacherForm.name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 shadow-2xs font-medium"
                />
              </div>

              <div>
                <label className="font-black text-slate-700 block mb-1">বিশ্ববিদ্যালয় / প্রতিষ্ঠান *</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: বুয়েট (BUET) | পদার্থবিজ্ঞান বিভাগ"
                  value={newTeacherForm.institution}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, institution: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 shadow-2xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 block mb-1">পদবী</label>
                  <input
                    type="text"
                    placeholder="উদা: সিনিয়র লেকচারার"
                    value={newTeacherForm.designation}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, designation: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-700 block mb-1">প্রধান বিষয়</label>
                  <input
                    type="text"
                    placeholder="উদা: উচ্চতর গণিত"
                    value={newTeacherForm.subject}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, subject: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: 01712-345678"
                    value={newTeacherForm.phone}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-700 block mb-1">ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    placeholder="teacher@example.com"
                    value={newTeacherForm.email}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 block mb-1">শিক্ষক লগইন পাসওয়ার্ড *</label>
                  <div className="relative">
                    <input
                      type={showTeacherPassword ? 'text' : 'password'}
                      required
                      placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                      value={newTeacherForm.password}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, password: e.target.value })}
                      className="w-full p-3 pr-10 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">শিক্ষক এই পাসওয়ার্ড ও মোবাইল দিয়ে লগইন করবেন।</span>
                </div>
                <div>
                  <label className="font-black text-slate-700 block mb-1">রেভিনিউ শেয়ার (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newTeacherForm.commissionPercent}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, commissionPercent: Number(e.target.value) })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewTeacherModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTeacher}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white font-black shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer border-t border-white/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingTeacher ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin-slow" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>যুক্ত করুন ও আনলক করুন</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE COUPON */}
      {/* ========================================================================= */}
      {newCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#ed347d]" />
                <span>নতুন কুপন কোড তৈরি</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setNewCouponModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-700 block mb-1">কুপন কোড (বড় হাতের অক্ষরে) *</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: SPECIAL20"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 font-mono uppercase shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 block mb-1">ছাড়ের ধরন</label>
                  <select
                    value={newCouponForm.discountType}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discountType: e.target.value as any })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-bold"
                  >
                    <option value="percent">শতাংশ (%) ছাড়</option>
                    <option value="fixed">ফিক্সড টাকা (৳) ছাড়</option>
                  </select>
                </div>
                <div>
                  <label className="font-black text-slate-700 block mb-1">ছাড়ের পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCouponForm.discountValue}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discountValue: Number(e.target.value) })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 block mb-1">সর্বোচ্চ ব্যবহার সীমা</label>
                  <input
                    type="number"
                    value={newCouponForm.usageLimit}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, usageLimit: Number(e.target.value) })}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-black text-slate-700 block mb-1">মেয়াদ উত্তীর্ণের তারিখ</label>
                  <input
                    type="date"
                    value={newCouponForm.expiresAt}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, expiresAt: e.target.value })}
                    className="w-full p-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewCouponModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white font-black shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer border-t border-white/30"
                >
                  কুপন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DISBURSE PAYOUT */}
      {/* ========================================================================= */}
      {payoutModalOpen && selectedTeacherForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>শিক্ষক পেআউট নিষ্পত্তি (Disburse)</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setPayoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-1 text-xs">
              <div className="font-black text-slate-900 text-sm">{selectedTeacherForPayout.name}</div>
              <div className="text-slate-500 font-medium">{selectedTeacherForPayout.institution}</div>
              <div className="text-emerald-700 font-black pt-1 font-mono">
                বর্তমান বকেয়া উইথড্রল পাওনা: ৳ {selectedTeacherForPayout.dueBalance.toLocaleString('en-BD')}
              </div>
            </div>

            <form onSubmit={handleConfirmPayout} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-700 block mb-1">পরিশোধের পরিমাণ (৳) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  max={selectedTeacherForPayout.dueBalance > 0 ? selectedTeacherForPayout.dueBalance : 1000000}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 font-black font-mono focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-500/5 shadow-2xs"
                />
              </div>

              <div>
                <label className="font-black text-slate-700 block mb-1">পেমেন্ট মেথড</label>
                <select
                  value={payoutForm.method}
                  onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs font-bold"
                >
                  <option value="City Bank Ltd. (BEFTN / NPSB)">City Bank Ltd. (BEFTN / NPSB)</option>
                  <option value="bKash Merchant Disburse (01819-876543)">bKash Merchant Disburse</option>
                  <option value="Nagad Corporate Payout">Nagad Corporate Payout</option>
                  <option value="Dutch-Bangla Bank Ltd. (Rocket)">Dutch-Bangla Bank Ltd. (Rocket)</option>
                </select>
              </div>

              <div>
                <label className="font-black text-slate-700 block mb-1">ব্যাংক একাউন্ট বা মোবাইল ওয়ালেট নম্বর</label>
                <input
                  type="text"
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="font-black text-slate-700 block mb-1">ব্যাংক রেফারেন্স / TrxID *</label>
                <input
                  type="text"
                  required
                  value={payoutForm.trxId}
                  onChange={(e) => setPayoutForm({ ...payoutForm, trxId: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer border-t border-white/30"
                >
                  নিশ্চিত করুন ও ডিসবার্স করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INVOICE / RECEIPT VIEWER */}
      {/* ========================================================================= */}
      {selectedReceiptEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AdommoLogo />
                <span className="text-xs font-black text-slate-700">ভর্তি ও পেমেন্ট মানি রিসিট</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedReceiptEnrollment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200/80 p-5 rounded-2xl bg-slate-50/60 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-bold">রসিদ নম্বর:</span>
                <span className="font-mono font-black text-slate-900">RCP-{selectedReceiptEnrollment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">শিক্ষার্থী:</span>
                <span className="font-bold text-slate-900">{selectedReceiptEnrollment.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">মোবাইল:</span>
                <span className="font-mono text-slate-800">{selectedReceiptEnrollment.studentPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">কোর্স:</span>
                <span className="font-bold text-[#ed347d] text-right max-w-[200px]">{selectedReceiptEnrollment.courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">পেমেন্ট মেথড:</span>
                <span className="font-bold text-slate-800">{selectedReceiptEnrollment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">ট্রানজেকশন আইডি (TrxID):</span>
                <span className="font-mono font-black text-[#ed347d]">{selectedReceiptEnrollment.trxId}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/80 pt-2.5 text-sm font-black">
                <span className="text-slate-900">পরিশোধিত অর্থ:</span>
                <span className="text-emerald-600 font-mono">৳ {selectedReceiptEnrollment.amount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast('রসিদ পিডিএফ ডাউনলোড শুরু হয়েছে');
                  setSelectedReceiptEnrollment(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF ডাউনলোড</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
