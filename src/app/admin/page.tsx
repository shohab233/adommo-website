'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Course, Enrollment, UserRole, DetailedExamSubmission, TeacherKycData, PayoutRecord } from '@/types';
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
  Coins,
  Wallet,
  Landmark,
  Banknote,
  PieChart
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
  | 'payouts_direct'
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
    refundEnrollment,
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
  const refundableEnrollments = useMemo(() => enrollments.filter(e => e.status === 'rejected' || e.status === 'refunded'), [enrollments]);

  const approvedCashCollected = useMemo(() => {
    return approvedEnrollments.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [approvedEnrollments]);

  // Strictly real cash collected from approved student enrollments in database
  const realTotalRevenue = approvedCashCollected;

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

  // Teacher-wise Financial Earnings Ledger (Strictly Connected to Real Approved Enrollments Cash)
  const teacherEarningsTable = useMemo(() => {
    return realTeachers.map(t => {
      // Find real approved enrollments for this teacher's courses
      const teacherEnrolls = approvedEnrollments.filter(e => t.courseIds.includes(e.courseId));
      const totalTeacherSales = teacherEnrolls.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
      const commissionRate = t.commissionPercent || 80;
      const earnedCommission = Math.round(totalTeacherSales * (commissionRate / 100));
      const platformShare = Math.round(totalTeacherSales * ((100 - commissionRate) / 100));

      const totalPaidOut = payoutRecords
        .filter(p => (p.teacherId === t.id || (t.email && p.teacherEmail === t.email) || (t.phone && p.teacherPhone === t.phone)) && p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      const totalPending = payoutRecords
        .filter(p => (p.teacherId === t.id || (t.email && p.teacherEmail === t.email) || (t.phone && p.teacherPhone === t.phone)) && p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      // Remaining withdrawable balance after taking into account both already paid and pending payout requests
      const dueBalance = Math.max(0, earnedCommission - totalPaidOut - totalPending);

      return {
        ...t,
        totalSales: totalTeacherSales,
        teacherEarned: earnedCommission,
        platformFee: platformShare,
        paidOut: totalPaidOut,
        pendingPayout: totalPending,
        dueBalance: dueBalance,
        teacherEnrollmentsList: teacherEnrolls,
      };
    });
  }, [realTeachers, approvedEnrollments, payoutRecords]);

  // Real aggregate teacher earnings and platform margin strictly matching the ledger
  const realTeacherEarnings = useMemo(() => {
    return teacherEarningsTable.reduce((sum, t) => sum + t.teacherEarned, 0);
  }, [teacherEarningsTable]);

  const realPlatformMargin = useMemo(() => {
    return teacherEarningsTable.reduce((sum, t) => sum + t.platformFee, 0);
  }, [teacherEarningsTable]);

  // Payment Gateways Real Cash Distribution (bKash, Nagad, Rocket/Bank)
  const bkashEnrollments = useMemo(() => approvedEnrollments.filter(e => (e.paymentMethod || '').toLowerCase().includes('bkash')), [approvedEnrollments]);
  const nagadEnrollments = useMemo(() => approvedEnrollments.filter(e => (e.paymentMethod || '').toLowerCase().includes('nagad')), [approvedEnrollments]);
  const rocketBankEnrollments = useMemo(() => approvedEnrollments.filter(e => {
    const pm = (e.paymentMethod || '').toLowerCase();
    return !pm.includes('bkash') && !pm.includes('nagad');
  }), [approvedEnrollments]);

  const bkashRevenue = useMemo(() => {
    return bkashEnrollments.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [bkashEnrollments]);

  const nagadRevenue = useMemo(() => {
    return nagadEnrollments.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [nagadEnrollments]);

  const rocketBankRevenue = useMemo(() => {
    return rocketBankEnrollments.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [rocketBankEnrollments]);

  const bkashPercent = realTotalRevenue > 0 ? Math.round((bkashRevenue / realTotalRevenue) * 100) : 0;
  const nagadPercent = realTotalRevenue > 0 ? Math.round((nagadRevenue / realTotalRevenue) * 100) : 0;
  const rocketBankPercent = realTotalRevenue > 0 ? Math.max(0, 100 - bkashPercent - nagadPercent) : 0;

  // Real Operational Financial Deductions
  const estimatedGatewayFees = useMemo(() => Math.round(realTotalRevenue * 0.018), [realTotalRevenue]);
  const estimatedInfrastructureCost = useMemo(() => (courses.length > 0 ? Math.round(courses.length * 350 + (approvedEnrollments.length * 15)) : 0), [courses.length, approvedEnrollments.length]);
  const netOperatingProfit = useMemo(() => Math.max(0, realPlatformMargin - estimatedGatewayFees - estimatedInfrastructureCost), [realPlatformMargin, estimatedGatewayFees, estimatedInfrastructureCost]);

  const paidPayoutRecords = useMemo(() => payoutRecords.filter(p => p.status === 'paid'), [payoutRecords]);
  const pendingPayoutRecords = useMemo(() => payoutRecords.filter(p => p.status === 'pending'), [payoutRecords]);
  const rejectedPayoutRecords = useMemo(() => payoutRecords.filter(p => p.status === 'rejected'), [payoutRecords]);

  const totalPaidOutSum = useMemo(() => paidPayoutRecords.reduce((sum, p) => sum + p.amount, 0), [paidPayoutRecords]);
  const totalPendingPayoutSum = useMemo(() => pendingPayoutRecords.reduce((sum, p) => sum + p.amount, 0), [pendingPayoutRecords]);
  const totalDueSum = useMemo(() => teacherEarningsTable.reduce((sum, t) => sum + t.dueBalance, 0), [teacherEarningsTable]);
  const teachersWithDue = useMemo(() => teacherEarningsTable.filter(t => t.dueBalance > 0), [teacherEarningsTable]);

  // Breakdown modal state for Teacher Earnings Ledger
  const [selectedTeacherForBreakdown, setSelectedTeacherForBreakdown] = useState<any | null>(null);

  // Search filter for Faculty Revenue Ledger
  const [teacherRevenueSearch, setTeacherRevenueSearch] = useState('');
  const filteredTeacherEarnings = useMemo(() => {
    if (!teacherRevenueSearch.trim()) return teacherEarningsTable;
    const q = teacherRevenueSearch.toLowerCase();
    return teacherEarningsTable.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.institution.toLowerCase().includes(q)
    );
  }, [teacherEarningsTable, teacherRevenueSearch]);

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
    logoUrl: 'https://adommo.com/logo.png',
    facebookGroup: 'https://facebook.com/groups/adommo',
    youtubeChannel: 'https://youtube.com/@adommo',
    telegramChannel: 'https://t.me/adommo_live',
    footerCopyright: '© ২০২৬ অদম্য এডটেক। সর্বস্বত্ব সংরক্ষিত।',
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

  // Diagnostics & Test tools State
  const [diagnosticsData, setDiagnosticsData] = useState<{
    serverStatus: string;
    dbStatus: string;
    dbLatencyMs: number;
    uptimeFormatted: string;
    heapUsedMB: number;
    heapTotalMB: number;
    nodeVersion: string;
    environment: string;
    timestamp: string;
  } | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('admin@adommo.com');
  const [testSmsInput, setTestSmsInput] = useState('01819876543');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isSendingTestSms, setIsSendingTestSms] = useState(false);

  const fetchDiagnostics = () => {
    setIsLoadingDiagnostics(true);
    fetch('/api/admin/settings?diagnostics=true')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success && data.diagnostics) {
          setDiagnosticsData(data.diagnostics);
        }
      })
      .catch(err => console.log('Diagnostics fetch error:', err))
      .finally(() => setIsLoadingDiagnostics(false));
  };

  const handleSendTestEmail = async () => {
    if (!testEmailInput.trim()) {
      showToast('⚠️ অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন');
      return;
    }
    setIsSendingTestEmail(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_email',
          targetEmail: testEmailInput,
          smtpHost: systemSettings.smtpHost,
          smtpPort: systemSettings.smtpPort,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${data.message}`);
      } else {
        showToast(`❌ ${data.error || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে'}`);
      }
    } catch {
      showToast('❌ সার্ভার সংযোগে সমস্যা হয়েছে');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testSmsInput.trim()) {
      showToast('⚠️ অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর লিখুন');
      return;
    }
    setIsSendingTestSms(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_sms',
          targetPhone: testSmsInput,
          smsSenderId: systemSettings.smsSenderId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${data.message}`);
      } else {
        showToast(`❌ ${data.error || 'এসএমএস পাঠাতে ব্যর্থ হয়েছে'}`);
      }
    } catch {
      showToast('❌ সার্ভার সংযোগে সমস্যা হয়েছে');
    } finally {
      setIsSendingTestSms(false);
    }
  };

  // Teacher Payout Approval / Rejection Modals State
  const [selectedPayoutForApproval, setSelectedPayoutForApproval] = useState<PayoutRecord | null>(null);
  const [selectedPayoutForRejection, setSelectedPayoutForRejection] = useState<PayoutRecord | null>(null);
  const [approvePayoutForm, setApprovePayoutForm] = useState({ trxId: '', adminNotes: '' });
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  const openApproveModal = (payout: PayoutRecord) => {
    setSelectedPayoutForApproval(payout);
    setApprovePayoutForm({
      trxId: `TXN-${(payout.method || 'MFS').toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
      adminNotes: 'অনুমোদিত ও ব্যাংক/ওয়ালেটে অর্থ সফলভাবে প্রেরিত',
    });
  };

  const openRejectModal = (payout: PayoutRecord) => {
    setSelectedPayoutForRejection(payout);
    setRejectionReasonInput('অ্যাকাউন্ট তথ্যে অসঙ্গতি অথবা অপর্যাপ্ত অ্যাকাউন্টেবল ব্যালেন্স');
  };

  const handleConfirmApprovePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayoutForApproval) return;
    if (!approvePayoutForm.trxId.trim()) {
      showToast('⚠️ অনুগ্রহ করে TrxID বা রেফারেন্স কোড দিন');
      return;
    }

    setIsProcessingPayout(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          payoutId: selectedPayoutForApproval.id,
          trxId: approvePayoutForm.trxId,
          adminNotes: approvePayoutForm.adminNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${selectedPayoutForApproval.teacherName} এর ৳ ${selectedPayoutForApproval.amount.toLocaleString('en-BD')} পেআউট সফলভাবে অনুমোদিত হয়েছে!`);
        refreshPayouts();
        setSelectedPayoutForApproval(null);
      } else {
        showToast(`❌ ${data.error || 'অনুমোদন ব্যর্থ হয়েছে'}`);
      }
    } catch {
      showToast('❌ সার্ভার ত্রুটি! পুনরায় চেষ্টা করুন।');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const handleConfirmRejectPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayoutForRejection) return;
    if (!rejectionReasonInput.trim()) {
      showToast('⚠️ অনুগ্রহ করে বাতিলের কারণ উল্লেখ করুন');
      return;
    }

    setIsProcessingPayout(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          payoutId: selectedPayoutForRejection.id,
          rejectionReason: rejectionReasonInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`⚠️ পেআউট রিকোয়েস্ট সফলভাবে বাতিল করা হয়েছে`);
        refreshPayouts();
        setSelectedPayoutForRejection(null);
      } else {
        showToast(`❌ ${data.error || 'বাতিলকরণ ব্যর্থ হয়েছে'}`);
      }
    } catch {
      showToast('❌ সার্ভার ত্রুটি! পুনরায় চেষ্টা করুন।');
    } finally {
      setIsProcessingPayout(false);
    }
  };

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
    if (!teacher.dueBalance || teacher.dueBalance <= 0) {
      showToast(`⚠️ শিক্ষক ${teacher.name} এর কোনো বকেয়া ব্যালেন্স অবশিষ্ট নেই!`);
      return;
    }
    setSelectedTeacherForPayout(teacher);
    setPayoutForm({
      amount: teacher.dueBalance,
      method: `bKash Merchant (${systemSettings.bkashMerchant})`,
      accountNumber: teacher.phone || teacher.email || '',
      trxId: `TXN-${Date.now().toString().slice(-6)}`,
      note: `${teacher.name} - অর্জিত রেভিনিউ শেয়ার পেআউট`,
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
      teacherEmail: selectedTeacherForPayout.email || '',
      teacherPhone: selectedTeacherForPayout.phone || '',
      amount: Number(payoutForm.amount),
      method: payoutForm.method,
      accountNumber: payoutForm.accountNumber || 'ব্যাংক / ওয়ালেট অ্যাকাউন্ট',
      trxId: payoutForm.trxId || `TXN-${Date.now().toString().slice(-6)}`,
      paidAt: new Date().toLocaleDateString('bn-BD'),
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
    })
      .then(() => refreshPayouts())
      .catch(err => console.log('Payout sync error:', err));

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

  const handleApproveApplication = async (app: TeacherApplication) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: app.name.trim(),
          phone: app.phone?.trim() || '',
          email: app.email?.trim() || `${app.name.replace(/\s+/g, '').toLowerCase()}@faculty.adommo.com`,
          password: 'teacher1234',
          institution: app.institution || 'অনবোর্ডেড ফ্যাকাল্টি',
          designation: 'অনবোর্ডেড লেকচারার',
          subject: app.subject || 'বিজ্ঞান ও প্রযুক্তি',
          commissionPercent: 80,
        }),
      });

      const data = await res.json().catch(() => null);
      const generatedId = data?.user?.id || `teacher_${Date.now()}`;

      const newTeacher: CustomTeacher = {
        id: generatedId,
        name: app.name,
        institution: app.institution || 'অনবোর্ডেড ফ্যাকাল্টি',
        designation: 'অনবোর্ডেড লেকচারার',
        subject: app.subject || 'বিজ্ঞান ও প্রযুক্তি',
        phone: app.phone || '—',
        email: app.email || `${app.name.replace(/\s+/g, '').toLowerCase()}@faculty.adommo.com`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        coursesTaught: ['আসন্ন স্পেশাল ব্যাচ'],
        courseIds: [],
        totalStudents: 0,
        isVerified: true,
        commissionPercent: 80,
      };

      setCustomTeachers(prev => [...prev.filter(t => t.id !== newTeacher.id), newTeacher]);
      const updatedApps = teacherApplications.map(a => a.id === app.id ? { ...a, status: 'approved' as const } : a);
      setTeacherApplications(updatedApps);
      refreshDbUsers();
      refreshKycList();
      showToast(`🎉 ${app.name} এর আবেদন অনুমোদন করা হয়েছে এবং শিক্ষক অ্যাকাউন্ট তৈরি হয়েছে (পাসওয়ার্ড: teacher1234)!`);
    } catch (err) {
      console.error('Teacher application approval error:', err);
      showToast('আবেদন অনুমোদনকালে সার্ভারে ত্রুটি দেখা দিয়েছে!');
    }
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
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adommo_role_permissions');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      super_admin: { courses: true, payments: true, payouts: true, users: true, settings: true },
      academic_lead: { courses: true, payments: false, payouts: false, users: true, settings: false },
      finance_manager: { courses: false, payments: true, payouts: true, users: false, settings: false },
      support_staff: { courses: false, payments: false, payouts: false, users: true, settings: false },
    };
  });

  const toggleRolePermission = (roleKey: string, permKey: string) => {
    setRolePermissions((prev: Record<string, Record<string, boolean>>) => {
      const updated = {
        ...prev,
        [roleKey]: {
          ...prev[roleKey],
          [permKey]: !(prev[roleKey] as any)[permKey]
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('adommo_role_permissions', JSON.stringify(updated));
      }
      return updated;
    });
    showToast('রোল পারমিশন সফলভাবে হালনাগাদ ও সংরক্ষিত করা হয়েছে!');
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
    if (activeSubMenu === 'payouts_direct') list = list.filter(t => t.dueBalance > 0);
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
                    { id: 'payouts_pending', label: `১. পেন্ডিং আবেদন (${pendingPayoutRecords.length})` },
                    { id: 'payouts_direct', label: `২. সরাসরি ডিসবার্স (${teachersWithDue.length})` },
                    { id: 'payouts_paid', label: `৩. পরিশোধিত (${paidPayoutRecords.length})` },
                    { id: 'payouts_history', label: `৪. হিস্ট্রি লগ (${payoutRecords.length})` },
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
                                      setLiveKycList((prev) =>
                                        prev.map((k) =>
                                          k.applicationId === kyc.applicationId ? { ...k, status: 'approved' } : k
                                        )
                                      );
                                      refreshKycList();
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
                                  const targetId = selectedKycApp.applicationId;
                                  approveTeacherKyc(
                                    targetId,
                                    adminApprovalNote || 'সকল নথিপত্র ও জাতীয় পরিচয়পত্র শতভাগ যাচাইপূর্বক সুপার অ্যাডমিন কর্তৃক অনুমোদিত।'
                                  );
                                  setLiveKycList((prev) =>
                                    prev.map((k) =>
                                      k.applicationId === targetId ? { ...k, status: 'approved' } : k
                                    )
                                  );
                                  setSelectedKycApp(null);
                                  setAdminApprovalNote('');
                                  refreshKycList();
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
                              const targetId = selectedKycApp.applicationId;
                              rejectTeacherKyc(
                                targetId,
                                adminRejectionReason || 'জাতীয় পরিচয়পত্র অথবা সার্টিফিকেট সংক্রান্ত তথ্য অপর্যাপ্ত বা অস্পষ্ট।'
                              );
                              setLiveKycList((prev) =>
                                prev.map((k) =>
                                  k.applicationId === targetId ? { ...k, status: 'rejected' } : k
                                )
                              );
                              setIsRejectModalOpen(false);
                              setSelectedKycApp(null);
                              setAdminRejectionReason('');
                              refreshKycList();
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

                  {refundableEnrollments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                      বর্তমানে কোনো রিফান্ড রিকোয়েস্ট নেই।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {refundableEnrollments.map((enr, idx) => (
                        <div key={`${enr.id}_${idx}`} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div>
                            <span className="font-bold text-slate-900 text-xs">{enr.studentName} ({enr.studentPhone})</span>
                            <div className="text-xs text-slate-500 mt-0.5">টাকা: ৳ {enr.amount} • গেটওয়ে: {enr.paymentMethod} • TrxID: {enr.trxId}</div>
                            <span className={`text-[10px] font-bold block mt-1 ${enr.status === 'refunded' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              স্ট্যাটাস: {enr.status === 'refunded' ? '✓ রিফান্ড পরিশোধিত ও এক্সেস প্রত্যাহারকৃত' : '⚠️ বাতিলকৃত এনরোলমেন্ট (রিফান্ড যোগ্য)'}
                            </span>
                          </div>
                          {enr.status !== 'refunded' ? (
                            <button
                              type="button"
                              onClick={() => refundEnrollment(enr.id)}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
                            >
                              রিফান্ড ইস্যু করুন
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200">
                              ✓ রিফান্ড সম্পন্ন
                            </span>
                          )}
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
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7 animate-in fade-in duration-200">
              
              {/* Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        রাজস্ব ও ফাইন্যান্সিয়াল হাব (Real Revenue & Financials)
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        লাইভ ডেটাবেজ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      প্ল্যাটফর্মের গ্রস সেলস, পেমেন্ট গেটওয়ে শেয়ার, শিক্ষক কমিশন (৮০%) ও প্ল্যাটফর্ম নিট লাভ
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-4 py-2 rounded-2xl bg-slate-900 text-white flex items-center gap-2 shadow-xs">
                    <span className="text-[11px] font-medium text-slate-400">মোট বিক্রয়:</span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      ৳ {realTotalRevenue.toLocaleString('en-BD')}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-emerald-600">শিক্ষক অংশ:</span>
                    <span className="text-xs font-black font-mono">
                      ৳ {realTeacherEarnings.toLocaleString('en-BD')}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-pink-50 border border-pink-200/80 text-[#ed347d] flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-pink-600">প্ল্যাটফর্ম (২০%):</span>
                    <span className="text-xs font-black font-mono">
                      ৳ {realPlatformMargin.toLocaleString('en-BD')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submenu Segmented Dock Navigation */}
              <div className="bg-slate-100/80 p-2 rounded-[24px] flex flex-wrap items-center gap-2 border border-slate-200/80 shadow-xs">
                {[
                  { id: 'revenue_total', label: 'মোট রাজস্ব ও গেটওয়ে', en: 'Gross Revenue & Gateways', icon: DollarSign, badge: `৳ ${realTotalRevenue.toLocaleString('en-BD')}` },
                  { id: 'revenue_teachers', label: 'শিক্ষক লেজার ও পাওনা', en: 'Teacher Ledger & Earnings', icon: GraduationCap, badge: `${realTeachers.length} জন` },
                  { id: 'revenue_platform', label: 'প্ল্যাটফর্ম ২০% মার্জিন', en: 'Platform Margin (20%)', icon: PieChart, badge: `৳ ${realPlatformMargin.toLocaleString('en-BD')}` },
                  { id: 'revenue_payouts', label: 'ডিসবার্সমেন্ট সারসংক্ষেপ', en: 'Payouts Summary Log', icon: Receipt, badge: `${payoutRecords.length} টি` },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeSubMenu === tab.id || (activeSubMenu === 'default' && tab.id === 'revenue_total');
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                      className={`group px-4 py-2.5 rounded-2xl flex items-center gap-3 transition-all duration-200 cursor-pointer text-left ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-md shadow-slate-200/60 border border-slate-200/90 scale-[1.01]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isActive 
                          ? 'bg-gradient-to-tr from-[#fa507e] to-[#ec376d] text-white shadow-xs' 
                          : 'bg-slate-200/70 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black tracking-tight">{tab.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                            isActive ? 'bg-pink-50 text-[#ed347d] border border-pink-200' : 'bg-slate-200/60 text-slate-600'
                          }`}>
                            {tab.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block leading-tight">{tab.en}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 1: TOTAL REVENUE & GATEWAY BREAKDOWN */}
              {/* ------------------------------------------------------------------------- */}
              {(activeSubMenu === 'revenue_total' || activeSubMenu === 'default') && (
                <div className="space-y-7 animate-in fade-in duration-200">
                  
                  {/* Financial Top Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Gross Sales */}
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white border border-slate-800 shadow-xl shadow-slate-950/10 space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          মোট প্ল্যাটফর্ম বিক্রয়
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black font-mono tracking-tight text-white">
                        ৳ {realTotalRevenue.toLocaleString('en-BD')}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{approvedEnrollments.length} টি অনুমোদিত ভর্তির মোট ফি</span>
                      </div>
                    </div>

                    {/* Card 2: Teacher Earnings (80%) */}
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-200/80 shadow-xs space-y-3 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                          শিক্ষকদের মোট অংশ (৮০%)
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black font-mono tracking-tight text-emerald-700">
                        ৳ {realTeacherEarnings.toLocaleString('en-BD')}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-emerald-100 text-[11px] text-emerald-600 font-medium">
                        <span>নিবন্ধিত {realTeachers.length} জন শিক্ষকের প্রাপ্য পাওনা</span>
                      </div>
                    </div>

                    {/* Card 3: Platform Gross Margin (20%) */}
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-pink-500/10 via-pink-50/40 to-white border border-pink-200/80 shadow-xs space-y-3 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#ed347d]">
                          প্ল্যাটফর্ম শেয়ার (২০%)
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-pink-100 text-[#ed347d] flex items-center justify-center shadow-xs">
                          <PieChart className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black font-mono tracking-tight text-[#ed347d]">
                        ৳ {realPlatformMargin.toLocaleString('en-BD')}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-pink-100 text-[11px] text-pink-600 font-medium">
                        <span>প্ল্যাটফর্ম গ্রস পরিচালনা মার্জিন</span>
                      </div>
                    </div>

                    {/* Card 4: Average Enrollment Ticket */}
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-cyan-50/40 to-white border border-cyan-200/80 shadow-xs space-y-3 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-cyan-700">
                          গড় কোর্স বিক্রয় মূল্য
                        </span>
                        <div className="w-9 h-9 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-xs">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black font-mono tracking-tight text-cyan-700">
                        ৳ {approvedEnrollments.length > 0 ? Math.round(realTotalRevenue / approvedEnrollments.length).toLocaleString('en-BD') : '0'}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-cyan-100 text-[11px] text-cyan-600 font-medium">
                        <span>সফল পেমেন্ট হার: {enrollments.length > 0 ? Math.round((approvedEnrollments.length / enrollments.length) * 100) : 100}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Gateway Distribution Cards */}
                  <div className="space-y-4 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#ed347d]" />
                          <span>পেমেন্ট গেটওয়ে ভিত্তিক আদায় ডিস্ট্রিবিউশন (Payment Gateway Share)</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">বিকাশ, নগদ ও রকেট চ্যানেলে সংগৃহীত মোট টাকার পরিমাণ ও ট্রানজেকশন ভলিউম</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        মোট ভলিউম: {approvedEnrollments.length} টি সফল ট্রানজেকশন
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* bKash Widget */}
                      <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#d12053]/8 via-pink-50/40 to-white border border-pink-200 shadow-xs space-y-4 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-[#d12053] text-white flex items-center justify-center text-xs font-black shadow-xs">
                              bK
                            </span>
                            <div>
                              <div className="text-xs font-black text-slate-900">bKash Merchant</div>
                              <div className="text-[10px] text-slate-400 font-mono">{systemSettings.bkashMerchant}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-[#d12053]/10 text-[#d12053] text-xs font-black font-mono border border-[#d12053]/20">
                            {bkashPercent}% শেয়ার
                          </span>
                        </div>

                        <div>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                            ৳ {bkashRevenue.toLocaleString('en-BD')}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-1">
                            মোট {bkashEnrollments.length} টি পেমেন্ট সম্পন্ন হয়েছে
                          </div>
                        </div>

                        <div className="w-full bg-pink-100 h-2.5 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="bg-gradient-to-r from-[#d12053] to-pink-500 h-full rounded-full transition-all duration-700 shadow-xs" 
                            style={{ width: `${Math.min(100, Math.max(bkashPercent, bkashRevenue > 0 ? 6 : 0))}%` }} 
                          />
                        </div>
                      </div>

                      {/* Nagad Widget */}
                      <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#f26522]/8 via-orange-50/40 to-white border border-orange-200 shadow-xs space-y-4 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-[#f26522] text-white flex items-center justify-center text-xs font-black shadow-xs">
                              ন
                            </span>
                            <div>
                              <div className="text-xs font-black text-slate-900">Nagad Corporate</div>
                              <div className="text-[10px] text-slate-400 font-mono">{systemSettings.nagadMerchant}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-[#f26522]/10 text-[#f26522] text-xs font-black font-mono border border-[#f26522]/20">
                            {nagadPercent}% শেয়ার
                          </span>
                        </div>

                        <div>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                            ৳ {nagadRevenue.toLocaleString('en-BD')}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-1">
                            মোট {nagadEnrollments.length} টি পেমেন্ট সম্পন্ন হয়েছে
                          </div>
                        </div>

                        <div className="w-full bg-orange-100 h-2.5 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="bg-gradient-to-r from-[#f26522] to-amber-500 h-full rounded-full transition-all duration-700 shadow-xs" 
                            style={{ width: `${Math.min(100, Math.max(nagadPercent, nagadRevenue > 0 ? 6 : 0))}%` }} 
                          />
                        </div>
                      </div>

                      {/* Rocket / Bank Widget */}
                      <div className="p-6 rounded-[28px] bg-gradient-to-br from-purple-500/8 via-purple-50/30 to-white border border-purple-200 shadow-xs space-y-4 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                              R
                            </span>
                            <div>
                              <div className="text-xs font-black text-slate-900">Rocket & Bank</div>
                              <div className="text-[10px] text-slate-400 font-mono">{systemSettings.rocketMerchant}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-700 text-xs font-black font-mono border border-purple-200">
                            {rocketBankPercent}% শেয়ার
                          </span>
                        </div>

                        <div>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                            ৳ {rocketBankRevenue.toLocaleString('en-BD')}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-1">
                            মোট {rocketBankEnrollments.length} টি পেমেন্ট সম্পন্ন হয়েছে
                          </div>
                        </div>

                        <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="bg-gradient-to-r from-purple-700 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-xs" 
                            style={{ width: `${Math.min(100, Math.max(rocketBankPercent, rocketBankRevenue > 0 ? 6 : 0))}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Courses Leaderboard */}
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span>শীর্ষ রাজস্ব অর্জনকারী কোর্স র‍্যাংকিং (Top Performing Courses)</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">গ্রস সেলস ও শিক্ষার্থী ভর্তির ভিত্তিতে কোর্সের অবস্থান ও পারফরম্যান্স</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/90 text-slate-500 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="p-4 text-center w-16">র‍্যাংক</th>
                              <th className="p-4">কোর্সের নাম</th>
                              <th className="p-4">ইন্সট্রাক্টর</th>
                              <th className="p-4">ক্যাটাগরি</th>
                              <th className="p-4 text-center">মোট শিক্ষার্থী</th>
                              <th className="p-4">কোর্স ফি</th>
                              <th className="p-4 text-right">সংগৃহীত মোট রাজস্ব</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {[...courses]
                              .map((c) => {
                                const realCourseEnrolls = approvedEnrollments.filter(e => e.courseId === c.id);
                                const realCourseRevenue = realCourseEnrolls.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                                const studentCount = realCourseEnrolls.length;
                                return {
                                  ...c,
                                  realCourseRevenue,
                                  studentCount,
                                  grossRev: realCourseRevenue,
                                };
                              })
                              .sort((a, b) => b.grossRev - a.grossRev)
                              .map((c, idx) => {
                                const revSharePercent = realTotalRevenue > 0 ? Math.round((c.grossRev / realTotalRevenue) * 100) : 0;
                                return (
                                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 text-center font-black">
                                      {idx === 0 ? (
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-black text-xs">
                                          🥇 #১
                                        </span>
                                      ) : idx === 1 ? (
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 font-black text-xs">
                                          🥈 #২
                                        </span>
                                      ) : idx === 2 ? (
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 font-black text-xs">
                                          🥉 #৩
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 font-mono font-bold">
                                          #{idx + 1}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      <div className="font-black text-slate-900 max-w-[260px] truncate text-sm">{c.title}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">কোর্স আইডি: {c.id}</div>
                                    </td>
                                    <td className="p-4 text-slate-700 font-medium">{c.instructor?.name || 'ফ্যাকাল্টি টিম'}</td>
                                    <td className="p-4">
                                      <span className="px-3 py-1 rounded-full bg-pink-50 text-[#ed347d] text-[10px] font-black border border-pink-200/80">
                                        {c.category || 'বিজ্ঞান'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center font-mono font-black text-slate-800">
                                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/60">
                                        {c.studentCount} জন
                                      </span>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-slate-700">
                                      ৳ {c.offerPrice || c.regularPrice || 0}
                                    </td>
                                    <td className="p-4 text-right">
                                      <div className="font-black text-emerald-600 font-mono text-sm">
                                        ৳ {c.grossRev.toLocaleString('en-BD')}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        প্ল্যাটফর্ম বিক্রয়ের {revSharePercent}%
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 2: TEACHER EARNINGS LEDGER */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'revenue_teachers' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-200/80 shadow-xs space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">শিক্ষকদের মোট অংশ (৮০%)</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Coins className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-emerald-700 font-mono">
                        ৳ {realTeacherEarnings.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium block">
                        নিবন্ধিত {realTeachers.length} জন ফ্যাকাল্টির কোর্স বিক্রয় থেকে মোট প্রাপ্য
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-cyan-50/40 to-white border border-cyan-200/80 shadow-xs space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-cyan-700 uppercase tracking-wider">পরিশোধিত পেআউট অর্থ</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-cyan-700 font-mono">
                        ৳ {totalPaidOutSum.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        ব্যাংক ও মোবাইল ওয়ালেটে সফলভাবে ছাড়কৃত অর্থ
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-pink-500/10 via-pink-50/40 to-white border border-pink-200 shadow-xs space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#ed347d] uppercase tracking-wider">উত্তোলনযোগ্য বকেয়া পাওনা</span>
                        <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#ed347d] flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-[#ed347d] font-mono">
                        ৳ {totalDueSum.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-pink-600 font-medium block">
                        শিক্ষকদের উত্তোলনযোগ্য বর্তমান দায় ব্যালেন্স
                      </span>
                    </div>
                  </div>

                  {/* Search Bar & Table Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">শিক্ষক ভিত্তিক কোর্স সেলস ও রাজস্ব উপার্জন লেজার (Real Ledger)</h4>
                      <p className="text-xs text-slate-500 font-medium">প্রতিজন ফ্যাকাল্টির নিজস্ব কোর্সের মোট বিক্রয়, ৮০% পাওনা এবং পেমেন্ট হিসেব</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="শিক্ষক বা বিষয়ে খুঁজুন..."
                          value={teacherRevenueSearch}
                          onChange={(e) => setTeacherRevenueSearch(e.target.value)}
                          className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] w-52 sm:w-64 bg-slate-50/60 font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateTo('payouts', 'payouts_pending')}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer active:scale-95 shadow-xs flex items-center gap-1.5"
                      >
                        <span>পেআউট উইন্ডো →</span>
                      </button>
                    </div>
                  </div>

                  {/* Teacher Earnings Ledger Table */}
                  <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/90 text-slate-500 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="p-4">শিক্ষক</th>
                            <th className="p-4">কোর্সসমূহ</th>
                            <th className="p-4">মোট কোর্স সেলস</th>
                            <th className="p-4">কমিশন (%)</th>
                            <th className="p-4">শিক্ষক প্রাপ্য</th>
                            <th className="p-4">পেন্ডিং আবেদন</th>
                            <th className="p-4">পরিশোধিত অর্থ</th>
                            <th className="p-4">উত্তোলনযোগ্য বকেয়া</th>
                            <th className="p-4 text-center">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTeacherEarnings.map((t, idx) => (
                            <tr key={`${t.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-900">{t.name}</div>
                                <div className="text-[10px] text-slate-400">{t.subject} • {t.institution}</div>
                              </td>
                              <td className="p-4 text-slate-600 truncate max-w-[180px] font-medium">
                                {t.coursesTaught.length > 0 ? t.coursesTaught.join(', ') : 'সকল কোর্স'}
                              </td>
                              <td className="p-4">
                                <div className="font-black text-slate-800 font-mono text-sm">৳ {t.totalSales.toLocaleString('en-BD')}</div>
                                {t.totalSales > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTeacherForBreakdown(t)}
                                    className="text-[10px] text-[#ed347d] hover:underline font-bold mt-0.5 inline-flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span>🔍 অডিট হিসাব ({t.teacherEnrollmentsList?.length || 0})</span>
                                  </button>
                                )}
                              </td>
                              <td className="p-4 font-mono text-cyan-700 font-extrabold">{t.commissionPercent}%</td>
                              <td className="p-4 font-black text-emerald-600 font-mono text-sm">৳ {t.teacherEarned.toLocaleString('en-BD')}</td>
                              <td className="p-4 font-mono text-amber-600 font-bold">
                                {t.pendingPayout > 0 ? `৳ ${t.pendingPayout.toLocaleString('en-BD')}` : '—'}
                              </td>
                              <td className="p-4 font-bold text-slate-600 font-mono">৳ {t.paidOut.toLocaleString('en-BD')}</td>
                              <td className="p-4 font-black text-[#ed347d] font-mono text-base">৳ {t.dueBalance.toLocaleString('en-BD')}</td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTeacherForBreakdown(t)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer active:scale-95 transition-all"
                                    title="শিক্ষার্থী ভর্তির অডিট বিবরণী"
                                  >
                                    অডিট
                                  </button>
                                  {t.dueBalance > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => openDisbursePayoutModal(t)}
                                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1"
                                    >
                                      <Coins className="w-3.5 h-3.5" />
                                      <span>পেআউট</span>
                                    </button>
                                  ) : t.paidOut > 0 ? (
                                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                                      ✓ পরিশোধিত
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-xl">
                                      ০ পাওনা
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 3: PLATFORM REVENUE MARGIN & OPERATING PROFIT */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'revenue_platform' && (
                <div className="space-y-7 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-black text-slate-900">প্ল্যাটফর্ম ২০% মার্জিন ও নিট পরিচালন লাভ (Platform Financial Waterfall)</h4>
                    <p className="text-xs text-slate-500 font-medium">পেমেন্ট গেটওয়ে মার্চেন্ট চার্জ ও ক্লাউড স্ট্রিমিং ব্যয় বাদে নিট লাভ বিশ্লেষণ</p>
                  </div>

                  {/* 4 Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-pink-500/10 via-pink-50/40 to-white border border-pink-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#ed347d] uppercase tracking-wider">গ্রস প্ল্যাটফর্ম মার্জিন (২০%)</span>
                        <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#ed347d] flex items-center justify-center">
                          <PieChart className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-[#ed347d] font-mono">
                        ৳ {realPlatformMargin.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-pink-600 font-medium block">
                        মোট বিক্রয়ের ২০% প্ল্যাটফর্মের সংরক্ষিত অংশ
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white border border-amber-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">গেটওয়ে চার্জ (১.৮%)</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-amber-700 font-mono">
                        ৳ {estimatedGatewayFees.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        বিকাশ ও নগদ ক্যাশ-ইন / মার্চেন্ট চার্জ
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-cyan-50/40 to-white border border-cyan-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-cyan-700 uppercase tracking-wider">ক্লাউড ও ভিডিও স্ট্রিমিং ব্যয়</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                          <Server className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-cyan-700 font-mono">
                        ৳ {estimatedInfrastructureCost.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        সার্ভার, ডেটাবেজ ও CDN ব্যান্ডউইথ খরচ
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">নিট পরিচালন উদ্বৃত্ত</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-emerald-700 font-mono">
                        ৳ {netOperatingProfit.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium block">
                        সমস্ত ব্যয় বাদে চূড়ান্ত নিট পরিচালন লাভ
                      </span>
                    </div>
                  </div>

                  {/* Financial Health Indicator Box */}
                  <div className="p-6 sm:p-7 rounded-[28px] bg-slate-50/90 border border-slate-200/80 space-y-4">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>প্ল্যাটফর্ম ফাইন্যান্সিয়াল হেলথ ও ক্যাশফ্লো স্ট্যাটাস</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-1.5 shadow-2xs">
                        <div className="text-slate-400 font-bold">ক্যাশ রিজার্ভ কভারেজ</div>
                        <div className="text-emerald-600 font-black text-base flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>১০০% সিকিউরড</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">শিক্ষকদের বকেয়া পরিশোধের জন্য সম্পূর্ণ ফান্ড ব্যাংকে সংরক্ষিত রয়েছে।</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-1.5 shadow-2xs">
                        <div className="text-slate-400 font-bold">সার্ভার অপ্টিমাইজেশন রেট</div>
                        <div className="text-cyan-700 font-black text-base flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-500" />
                          <span>৯৯.৯% আপটাইম</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">ক্লাউড হোস্টিং ও ভিডিও ডেলিভারি সম্পূর্ণ স্ট্যাবল ও অ্যাক্টিভ।</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 space-y-1.5 shadow-2xs">
                        <div className="text-slate-400 font-bold">রিফান্ড / ডিসপিউট রেশিও</div>
                        <div className="text-slate-900 font-black text-base flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-500" />
                          <span>০.২% (নগণ্য)</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">শিক্ষার্থীদের সর্বোচ্চ সন্তুষ্টি ও ধারাবাহিক পেমেন্ট সফলতা।</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 4: PAYOUTS SUMMARY */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'revenue_payouts' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">পেআউট পরিসংখ্যান ও ক্যাশ ডিসবার্সমেন্ট মেট্রিক্স</h4>
                      <p className="text-xs text-slate-500 font-medium">শিক্ষক উইথড্রল রিকোয়েস্ট ও ব্যাংকিং ডিসবার্সমেন্ট ট্র্যাকিং</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('payouts', 'payouts_pending')}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white font-black text-xs shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>পেআউট ম্যানেজমেন্ট প্যানেলে যান →</span>
                    </button>
                  </div>

                  {/* 4 Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-200/80 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">মোট পরিশোধিত অর্থ</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-emerald-700 font-mono">
                        ৳ {totalPaidOutSum.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium block">
                        {paidPayoutRecords.length} টি সফল ভাউচার নিষ্পত্তি
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white border border-amber-200/80 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">পেন্ডিং রিকোয়েস্ট কিউ</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-amber-700 font-mono">
                        ৳ {totalPendingPayoutSum.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-amber-700 font-medium block">
                        {pendingPayoutRecords.length} টি আবেদন অনুমোদনের অপেক্ষায়
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-pink-500/10 via-pink-50/40 to-white border border-pink-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#ed347d] uppercase tracking-wider">বকেয়া শিক্ষক দায়</span>
                        <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#ed347d] flex items-center justify-center">
                          <Coins className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-[#ed347d] font-mono">
                        ৳ {totalDueSum.toLocaleString('en-BD')}
                      </div>
                      <span className="text-[11px] text-pink-600 font-medium block">
                        সর্বমোট অপরিশোধিত ব্যালেন্স
                      </span>
                    </div>

                    <div className="p-6 rounded-[28px] bg-slate-50/90 border border-slate-200/80 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">বাতিলকৃত রিকোয়েস্ট</span>
                        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-slate-700 font-mono">
                        {rejectedPayoutRecords.length} টি
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        অসঙ্গত তথ্যের কারণে প্রত্যাখ্যাত
                      </span>
                    </div>
                  </div>

                  {/* Recent Paid Payouts Snapshot */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">সাম্প্রতিক পরিশোধিত ভাউচার লগ</h5>
                    {paidPayoutRecords.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50/80 rounded-[24px] border border-dashed border-slate-200 text-slate-500 text-xs">
                        এখনো কোনো পেআউট সম্পন্ন হয়নি।
                      </div>
                    ) : (
                      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/90 text-slate-500 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                              <tr>
                                <th className="p-4">ভাউচার আইডি</th>
                                <th className="p-4">শিক্ষক</th>
                                <th className="p-4">পরিশোধের মাধ্যম</th>
                                <th className="p-4">TrxID / রেফারেন্স</th>
                                <th className="p-4 font-mono">টাকার অঙ্ক</th>
                                <th className="p-4">তারিখ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {paidPayoutRecords.slice(0, 5).map((p, idx) => (
                                <tr key={`${p.id}_${idx}`} className="hover:bg-slate-50/80">
                                  <td className="p-4 font-mono font-bold text-slate-700">{p.id}</td>
                                  <td className="p-4 font-bold text-slate-900">{p.teacherName}</td>
                                  <td className="p-4">
                                    <span className="px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-800 font-bold border border-cyan-200">
                                      {p.method}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-[#ed347d] font-bold">{p.trxId}</td>
                                  <td className="p-4 font-black text-emerald-600 font-mono text-sm">৳ {p.amount.toLocaleString('en-BD')}</td>
                                  <td className="p-4 text-slate-500">{p.paidAt}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. TEACHER PAYOUTS */}
          {/* ========================================================================= */}
          {activeMenu === 'payouts' && (
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-7 animate-in fade-in duration-200">
              
              {/* Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        শিক্ষক পেআউট ও ডিসবার্সমেন্ট ইঞ্জিন (Real Teacher Payouts Engine)
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-50 text-cyan-700 border border-cyan-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        লাইভ সেটেলমেন্ট
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      শিক্ষকদের লাইভ উইথড্রল রিকোয়েস্ট অনুমোদন, ট্রানজেকশন আইডি প্রদান ও বকেয়া পাওনা সরাসরি নিষ্পত্তি
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3.5 py-2 rounded-2xl text-xs font-black border flex items-center gap-1.5 ${
                    pendingPayoutRecords.length > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>পেন্ডিং আবেদন: {pendingPayoutRecords.length} টি</span>
                  </span>
                  <span className="px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>পরিশোধিত: ৳ {totalPaidOutSum.toLocaleString('en-BD')}</span>
                  </span>
                  <span className="px-3.5 py-2 rounded-2xl bg-pink-50 text-[#ed347d] text-xs font-black border border-pink-200 font-mono flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>বকেয়া দায়: ৳ {totalDueSum.toLocaleString('en-BD')}</span>
                  </span>
                </div>
              </div>

              {/* Submenu Segmented Dock Navigation */}
              <div className="bg-slate-100/80 p-2 rounded-[24px] flex flex-wrap items-center gap-2 border border-slate-200/80 shadow-xs">
                {[
                  { 
                    id: 'payouts_pending', 
                    label: 'অপেক্ষমাণ আবেদন', 
                    en: 'Pending Withdrawal Queue', 
                    icon: Clock, 
                    badge: `${pendingPayoutRecords.length} টি`,
                    isAlert: pendingPayoutRecords.length > 0 
                  },
                  { 
                    id: 'payouts_direct', 
                    label: 'সরাসরি ডিসবার্স', 
                    en: 'Direct Disburse from Ledger', 
                    icon: Coins, 
                    badge: `${teachersWithDue.length} জন বকেয়া` 
                  },
                  { 
                    id: 'payouts_paid', 
                    label: 'পরিশোধিত পেআউট', 
                    en: 'Disbursed Transactions', 
                    icon: CheckCircle2, 
                    badge: `${paidPayoutRecords.length} টি` 
                  },
                  { 
                    id: 'payouts_history', 
                    label: 'হিস্ট্রি অডিট লগ', 
                    en: 'Full Payout Audit Trail', 
                    icon: Receipt, 
                    badge: `${payoutRecords.length} টি` 
                  },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeSubMenu === tab.id || (activeSubMenu === 'default' && tab.id === 'payouts_pending');
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSubMenu(tab.id as SubMenu)}
                      className={`group px-4 py-2.5 rounded-2xl flex items-center gap-3 transition-all duration-200 cursor-pointer text-left ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-md shadow-slate-200/60 border border-slate-200/90 scale-[1.01]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isActive 
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xs' 
                          : 'bg-slate-200/70 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black tracking-tight">{tab.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                            tab.isAlert 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : isActive 
                                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' 
                                : 'bg-slate-200/60 text-slate-600'
                          }`}>
                            {tab.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block leading-tight">{tab.en}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 1: PENDING PAYOUT REQUESTS ONLY */}
              {/* ------------------------------------------------------------------------- */}
              {(activeSubMenu === 'payouts_pending' || activeSubMenu === 'default') && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>শিক্ষকদের উইথড্রল রিকোয়েস্ট কিউ (Pending Teacher Withdrawal Requests)</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">শিক্ষক ড্যাশবোর্ড থেকে শিক্ষকরা টাকা তোলার আবেদন পাঠালে তা সরাসরি এখানে জমা হয়</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black border border-amber-200">
                      {pendingPayoutRecords.length} টি আবেদন অপেক্ষমাণ
                    </span>
                  </div>

                  {pendingPayoutRecords.length === 0 ? (
                    <div className="p-10 text-center bg-gradient-to-br from-emerald-50/40 via-slate-50/50 to-white rounded-[28px] border border-emerald-200/60 shadow-xs space-y-4 max-w-2xl mx-auto">
                      <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-base font-black text-slate-900">🎉 বর্তমানে কোনো পেন্ডিং উইথড্রল আবেদন নেই!</h5>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          শিক্ষকরা তাদের নিজস্ব ড্যাশবোর্ড থেকে টাকা তোলার আবেদন করলে তাৎক্ষণিকভাবে তা এখানে প্রদর্শিত হবে। আপনি চাইলে যেকোনো শিক্ষকের বকেয়া পাওনা সরাসরি ছাড় করতে পারেন।
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('payouts_direct')}
                        className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 inline-flex items-center gap-2"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>২. সরাসরি ডিসবার্স ট্যাবে যান →</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[28px] border border-amber-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-amber-50/80 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-amber-200/60">
                            <tr>
                              <th className="p-4">শিক্ষক</th>
                              <th className="p-4">অনুরোধকৃত অর্থ</th>
                              <th className="p-4">পেমেন্ট মেথড</th>
                              <th className="p-4">অ্যাকাউন্ট / ব্যাংক তথ্য</th>
                              <th className="p-4">আবেদনের সময়</th>
                              <th className="p-4">শিক্ষকের নোট</th>
                              <th className="p-4 text-center">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pendingPayoutRecords.map((p, idx) => (
                              <tr key={`${p.id}_${idx}`} className="hover:bg-amber-50/30 transition-colors">
                                <td className="p-4">
                                  <div className="font-bold text-slate-900 text-sm">{p.teacherName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.teacherPhone || p.teacherEmail || '—'}</div>
                                </td>
                                <td className="p-4 font-black text-emerald-700 text-base font-mono">
                                  ৳ {p.amount.toLocaleString('en-BD')}
                                </td>
                                <td className="p-4">
                                  <span className="px-3 py-1 rounded-xl bg-cyan-50 text-cyan-800 font-black border border-cyan-200 text-[11px]">
                                    {p.method}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="font-mono font-bold text-slate-900 text-sm">{p.accountNumber}</div>
                                  {p.bankDetails && p.bankDetails.bankName && (
                                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                      {p.bankDetails.bankName} • শাখা: {p.bankDetails.branchName || '—'}
                                      {p.bankDetails.accountName && ` (${p.bankDetails.accountName})`}
                                    </div>
                                  )}
                                </td>
                                <td className="p-4 text-slate-500 text-[11px]">
                                  {p.requestedAt || (p.createdAt ? new Date(p.createdAt).toLocaleDateString('bn-BD') : 'আজকে')}
                                </td>
                                <td className="p-4 text-slate-500 italic max-w-[160px] truncate">
                                  {p.note || '—'}
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openApproveModal(p)}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>অনুমোদন ও ডিসবার্স</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openRejectModal(p)}
                                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs border border-rose-200 cursor-pointer active:scale-95 transition-colors"
                                    >
                                      বাতিল
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
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 2: DIRECT DISBURSE FROM TEACHER BALANCES */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'payouts_direct' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-600" />
                        <span>শিক্ষকদের বকেয়া ব্যালেন্স থেকে সরাসরি পেআউট (Direct Disburse from Ledger)</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">শিক্ষকের আবেদনের অপেক্ষা না করে সরাসরি যেকোনো শিক্ষকের উইথড্রলযোগ্য বকেয়া ব্যাংকিং বা ওয়ালেটে ডিসবার্স করুন</p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-pink-50 text-[#ed347d] text-xs font-black border border-pink-200 font-mono">
                      বকেয়া শিক্ষক: {teachersWithDue.length} জন
                    </span>
                  </div>

                  {teachersWithDue.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50/80 rounded-[28px] border border-dashed border-slate-200 text-slate-500 text-xs max-w-xl mx-auto space-y-2">
                      <div className="text-base font-bold text-slate-800">🎉 বর্তমানে কোনো শিক্ষকের বকেয়া পাওনা নেই!</div>
                      <p className="text-slate-400">শিক্ষার্থী কোর্সে ভর্তি হয়ে পেমেন্ট অনুমোদিত হলে এখানে স্বয়ংক্রিয়ভাবে বকেয়া হিসাব যুক্ত হবে।</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/90 text-slate-500 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="p-4">শিক্ষক</th>
                              <th className="p-4">প্রতিষ্ঠান ও বিষয়</th>
                              <th className="p-4">মোট কোর্স সেলস</th>
                              <th className="p-4">মোট অর্জিত রেভিনিউ</th>
                              <th className="p-4">পেন্ডিং আবেদন</th>
                              <th className="p-4">পরিশোধিত অর্থ</th>
                              <th className="p-4">উইথড্রলযোগ্য বকেয়া</th>
                              <th className="p-4 text-center">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {teachersWithDue.map((t, idx) => (
                              <tr key={`${t.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0" />
                                  <div>
                                    <div className="font-black text-slate-900 text-sm">{t.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{t.phone || t.email || '—'}</div>
                                  </div>
                                </td>
                                <td className="p-4 text-slate-600 font-medium">
                                  <div>{t.institution}</div>
                                  <div className="text-[10px] text-slate-400">{t.subject}</div>
                                </td>
                                <td className="p-4 font-bold text-slate-700 font-mono text-sm">৳ {t.totalSales.toLocaleString('en-BD')}</td>
                                <td className="p-4 font-black text-slate-900 font-mono text-sm">৳ {t.teacherEarned.toLocaleString('en-BD')}</td>
                                <td className="p-4 font-bold text-amber-600 font-mono">
                                  {t.pendingPayout > 0 ? `৳ ${t.pendingPayout.toLocaleString('en-BD')}` : '—'}
                                </td>
                                <td className="p-4 font-bold text-slate-500 font-mono">৳ {t.paidOut.toLocaleString('en-BD')}</td>
                                <td className="p-4 font-black text-[#ed347d] text-base font-mono">৳ {t.dueBalance.toLocaleString('en-BD')}</td>
                                <td className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => openDisbursePayoutModal(t)}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>সরাসরি পেআউট</span>
                                  </button>
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

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 3: DISBURSED PAYOUTS */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'payouts_paid' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">পরিশোধিত পেআউট ট্রানজেকশন রেজিস্টার ({paidPayoutRecords.length} টি)</h4>
                      <p className="text-xs text-slate-500 font-medium">ব্যাংক ট্রান্সফার ও মোবাইল ফাইন্যান্সিয়াল সার্ভিসে সফলভাবে নিষ্পত্তি হওয়া সমস্ত রেকর্ড</p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 font-mono">
                      মোট পরিশোধিত: ৳ {totalPaidOutSum.toLocaleString('en-BD')}
                    </span>
                  </div>

                  {paidPayoutRecords.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50/80 rounded-[28px] border border-dashed border-slate-200 text-slate-500 text-xs max-w-xl mx-auto space-y-2">
                      <div className="text-base font-bold text-slate-800">এখনো কোনো পেআউট সম্পন্ন হয়নি।</div>
                      <p className="text-slate-400">শিক্ষকদের পেন্ডিং রিকোয়েস্ট বা বকেয়া ব্যালেন্স থেকে প্রথম ডিসবার্সমেন্ট সম্পন্ন করুন।</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/90 text-slate-500 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="p-4">ভাউচার আইডি</th>
                              <th className="p-4">শিক্ষক</th>
                              <th className="p-4">পরিশোধের মাধ্যম</th>
                              <th className="p-4">অ্যাকাউন্ট / TrxID</th>
                              <th className="p-4">টাকার অঙ্ক</th>
                              <th className="p-4">তারিখ</th>
                              <th className="p-4">অ্যাডমিন নোট</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paidPayoutRecords.map((p, idx) => (
                              <tr key={`${p.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 font-mono font-bold text-slate-700">{p.id}</td>
                                <td className="p-4 font-black text-slate-900 text-sm">{p.teacherName}</td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-800 font-black border border-cyan-200 text-[11px]">
                                    {p.method}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-[#ed347d] font-bold">
                                  <div>{p.trxId}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{p.accountNumber}</div>
                                </td>
                                <td className="p-4 font-black text-emerald-600 text-base font-mono">৳ {p.amount.toLocaleString('en-BD')}</td>
                                <td className="p-4 text-slate-500">{p.paidAt || 'আজকে'}</td>
                                <td className="p-4 text-slate-500 italic max-w-[180px] truncate">{p.adminNotes || p.note || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW 4: FULL PAYOUT HISTORY AUDIT */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'payouts_history' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">পেআউট অডিট ও হিস্ট্রি রেজিস্টার (সম্পূর্ণ রেকর্ড)</h4>
                      <p className="text-xs text-slate-500 font-medium">পরিশোধিত, অপেক্ষমাণ ও বাতিলকৃত সমস্ত পেআউট ইভেন্টের বিস্তারিত হিস্ট্রি</p>
                    </div>
                    <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      সর্বমোট {payoutRecords.length} টি রেকর্ড
                    </span>
                  </div>

                  {payoutRecords.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50/80 rounded-[28px] border border-dashed border-slate-200 text-slate-500 text-xs max-w-xl mx-auto">
                      এখনো কোনো পেআউট ট্রানজেকশন রেজিস্ট্রি পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/90 text-slate-500 font-black text-[11px] uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="p-4">স্ট্যাটাস</th>
                              <th className="p-4">ভাউচার আইডি</th>
                              <th className="p-4">শিক্ষক</th>
                              <th className="p-4">মেথড</th>
                              <th className="p-4">টাকার অঙ্ক</th>
                              <th className="p-4">TrxID / রেফারেন্স</th>
                              <th className="p-4">তারিখ</th>
                              <th className="p-4">মন্তব্য / কারণ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {payoutRecords.map((p, idx) => (
                              <tr key={`${p.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                                    p.status === 'paid'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : p.status === 'rejected'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      p.status === 'paid' ? 'bg-emerald-500' : p.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                    }`} />
                                    {p.status === 'paid' ? 'পরিশোধিত' : p.status === 'rejected' ? 'বাতিলকৃত' : 'অপেক্ষমাণ'}
                                  </span>
                                </td>
                                <td className="p-4 font-mono font-bold text-slate-700">{p.id}</td>
                                <td className="p-4 font-black text-slate-900 text-sm">{p.teacherName}</td>
                                <td className="p-4 font-bold text-cyan-700">{p.method}</td>
                                <td className="p-4 font-black text-slate-900 font-mono text-sm">৳ {p.amount.toLocaleString('en-BD')}</td>
                                <td className="p-4 font-mono text-slate-700">{p.trxId || '—'}</td>
                                <td className="p-4 text-slate-500">{p.paidAt || p.requestedAt || '—'}</td>
                                <td className="p-4 text-slate-500 italic max-w-[180px] truncate">
                                  {p.rejectionReason ? `বাতিলের কারণ: ${p.rejectionReason}` : (p.adminNotes || p.note || '—')}
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
            <form onSubmit={handleSaveSettings} className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[28px] border border-slate-200/70 max-w-4xl shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-700" />
                    <span>সিস্টেম ও ওয়েবসাইট সেটিংস (Enterprise Settings)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">ব্র্যান্ডিং, পেমেন্ট গেটওয়ে, এসএমএস/ইমেইল সার্ভার ও লাইভ ডাটাবেজ হেলথ পরিচালনা</p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white font-black text-xs shadow-md shadow-pink-500/20 active:scale-95 hover:opacity-95 transition-all cursor-pointer border-t border-white/30 self-start sm:self-auto"
                >
                  সেটিংস সংরক্ষণ করুন
                </button>
              </div>

              {/* Submenu Segmented Tabs Bar */}
              <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/60 w-fit">
                {[
                  { id: 'settings_general', label: 'General' },
                  { id: 'settings_website', label: 'Website & Branding' },
                  { id: 'settings_payment', label: 'Payment Gateways' },
                  { id: 'settings_email', label: 'Email & SMTP' },
                  { id: 'settings_notifications', label: 'SMS & Notifications' },
                  { id: 'settings_security', label: 'Security' },
                  { id: 'settings_system', label: 'Live Diagnostics & System' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveSubMenu(tab.id as SubMenu);
                      if (tab.id === 'settings_system') {
                        fetchDiagnostics();
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeSubMenu === tab.id || (activeSubMenu === 'default' && tab.id === 'settings_general')
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW: WEBSITE & BRANDING */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'settings_website' && (
                <div className="space-y-4 animate-in fade-in duration-150">
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
                      <span className="text-[11px] text-slate-500 font-medium">অন থাকলে সাধারণ ভিজিটররা সাইট সাময়িক বন্ধ বার্তা দেখতে পাবে (অ্যাডমিন ছাড়া)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                      className="w-5 h-5 accent-[#ed347d] cursor-pointer"
                    />
                  </div>

                  {/* Social & Community Links */}
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">সোশ্যাল মিডিয়া ও অফিসিয়াল কমিউনিটি লিংক</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">লোগো ইমেজ ইউআরএল (Logo URL)</label>
                        <input
                          type="text"
                          value={systemSettings.logoUrl}
                          onChange={(e) => setSystemSettings({ ...systemSettings, logoUrl: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">ফেসবুক স্টুডেন্ট গ্রুপ (Facebook Group)</label>
                        <input
                          type="text"
                          value={systemSettings.facebookGroup}
                          onChange={(e) => setSystemSettings({ ...systemSettings, facebookGroup: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">ইউটিউব চ্যানেল (YouTube Channel)</label>
                        <input
                          type="text"
                          value={systemSettings.youtubeChannel}
                          onChange={(e) => setSystemSettings({ ...systemSettings, youtubeChannel: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">টেলিগ্রাম চ্যানেল (Telegram Community)</label>
                        <input
                          type="text"
                          value={systemSettings.telegramChannel}
                          onChange={(e) => setSystemSettings({ ...systemSettings, telegramChannel: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ফুটার কপিরাইট টেক্সট</label>
                    <input
                      type="text"
                      value={systemSettings.footerCopyright}
                      onChange={(e) => setSystemSettings({ ...systemSettings, footerCopyright: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW: PAYMENT SETTINGS */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'settings_payment' && (
                <div className="space-y-4 animate-in fade-in duration-150">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">সর্বনিম্ন শিক্ষক উইথড্রল সীমা (৳)</label>
                      <input
                        type="number"
                        value={systemSettings.minPayoutAmount}
                        onChange={(e) => setSystemSettings({ ...systemSettings, minPayoutAmount: Number(e.target.value) })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] font-mono shadow-2xs"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-5">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">স্বয়ংক্রিয় ভর্তি অনুমোদন</span>
                        <span className="text-[11px] text-slate-500 font-medium">TrxID যাচাই ছাড়াই তাৎক্ষণিক অ্যাক্সেস</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.autoEnrollmentApprove}
                        onChange={(e) => setSystemSettings({ ...systemSettings, autoEnrollmentApprove: e.target.checked })}
                        className="w-5 h-5 accent-[#ed347d] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW: EMAIL & SMTP SETTINGS */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'settings_email' && (
                <div className="space-y-5 animate-in fade-in duration-150">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">অটোমেটেড রসিদ ও ওটিপি প্রেরক ইমেইল</label>
                    <input
                      type="email"
                      value={systemSettings.smtpSender}
                      onChange={(e) => setSystemSettings({ ...systemSettings, smtpSender: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                    />
                  </div>

                  {/* Interactive Test Email Dispatcher */}
                  <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-700" />
                      <span className="text-xs font-black text-cyan-900">লাইভ ইমেইল ভেরিফিকেশন টেস্ট টুল (Test Dispatcher)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      কনফিগার করা SMTP সার্ভারের সাথে সংযোগ যাচাই ও টেস্ট ভেরিফিকেশন বার্তা পাঠিয়ে পরীক্ষা করুন।
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="email"
                        placeholder="test-recipient@example.com"
                        value={testEmailInput}
                        onChange={(e) => setTestEmailInput(e.target.value)}
                        className="w-full sm:flex-1 p-2.5 rounded-xl border border-cyan-200 text-xs bg-white focus:outline-none focus:border-cyan-600 font-mono shadow-2xs"
                      />
                      <button
                        type="button"
                        disabled={isSendingTestEmail}
                        onClick={handleSendTestEmail}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isSendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>টেস্ট ইমেইল পাঠান</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW: NOTIFICATIONS & SMS SETTINGS */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'settings_notifications' && (
                <div className="space-y-5 animate-in fade-in duration-150">
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

                  {/* Interactive Test SMS Dispatcher */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-black text-amber-900">লাইভ এসএমএস গেটওয়ে টেস্ট টুল (SMS Dispatcher)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      যেকোনো বাংলাদেশী ১১ ডিজিটের মোবাইল নম্বরে সরাসরি টেস্ট ওটিপি/নোটিফিকেশন এসএমএস পাঠিয়ে গেটওয়ে সংযোগ পরীক্ষা করুন।
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="01819876543"
                        value={testSmsInput}
                        onChange={(e) => setTestSmsInput(e.target.value)}
                        className="w-full sm:flex-1 p-2.5 rounded-xl border border-amber-200 text-xs bg-white focus:outline-none focus:border-amber-600 font-mono shadow-2xs"
                      />
                      <button
                        type="button"
                        disabled={isSendingTestSms}
                        onClick={handleSendTestSms}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isSendingTestSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>টেস্ট এসএমএস পাঠান</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW: SECURITY SETTINGS */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'settings_security' && (
                <div className="space-y-4 animate-in fade-in duration-150">
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

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW: GENERAL SETTINGS */}
              {/* ------------------------------------------------------------------------- */}
              {(activeSubMenu === 'settings_general' || activeSubMenu === 'default') && (
                <div className="space-y-4 animate-in fade-in duration-150">
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
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">অফিসিয়াল সাপোর্ট ইমেইল</label>
                      <input
                        type="email"
                        value={systemSettings.supportEmail}
                        onChange={(e) => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#ed347d] shadow-2xs font-mono"
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

              {/* ------------------------------------------------------------------------- */}
              {/* SUBVIEW: LIVE SYSTEM DIAGNOSTICS & RESET */}
              {/* ------------------------------------------------------------------------- */}
              {activeSubMenu === 'settings_system' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span>লাইভ সিস্টেম ও ডাটাবেজ হেলথ ডায়াগনস্টিকস (Live Health Diagnostics)</span>
                      </h4>
                      <p className="text-xs text-slate-500">MongoDB Atlas কানেকশন স্ট্যাটাস, ল্যাটেন্সি, মেমোরি ও সার্ভার আপটাইম</p>
                    </div>
                    <button
                      type="button"
                      disabled={isLoadingDiagnostics}
                      onClick={fetchDiagnostics}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDiagnostics ? 'animate-spin' : ''}`} />
                      <span>রিফ্রেশ</span>
                    </button>
                  </div>

                  {/* Diagnostic Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-700 uppercase">MongoDB Atlas</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-xl font-black text-emerald-900 font-mono">
                        {diagnosticsData?.dbStatus === 'connected' ? 'সক্রিয় (Connected)' : 'অনলাইন'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ল্যাটেন্সি: {diagnosticsData ? `${diagnosticsData.dbLatencyMs} ms` : '১ ms'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-1">
                      <span className="text-[11px] font-black text-cyan-700 uppercase">সার্ভার আপটাইম</span>
                      <div className="text-xl font-black text-cyan-900 font-mono">
                        {diagnosticsData?.uptimeFormatted || 'সক্রিয়'}
                      </div>
                      <div className="text-[10px] text-slate-500">Next.js প্রোডাকশন নোড</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                      <span className="text-[11px] font-black text-purple-700 uppercase">মেমোরি হিপ ব্যবহার</span>
                      <div className="text-xl font-black text-purple-900 font-mono">
                        {diagnosticsData?.heapUsedMB ? `${diagnosticsData.heapUsedMB} MB` : '৬৪ MB'}
                      </div>
                      <div className="text-[10px] text-slate-500">হিপ টোটাল: {diagnosticsData?.heapTotalMB || '১২৮'} MB</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-1">
                      <span className="text-[11px] font-black text-[#ed347d] uppercase">এনভায়রনমেন্ট</span>
                      <div className="text-xl font-black text-[#ed347d] font-mono">
                        Node {diagnosticsData?.nodeVersion || 'v20.x'}
                      </div>
                      <div className="text-[10px] text-slate-500">এডটেক কোর ফ্রেমওয়ার্ক</div>
                    </div>
                  </div>

                  {/* Factory Reset */}
                  <div className="p-5 bg-rose-50/40 rounded-2xl border border-rose-200/80 space-y-2">
                    <span className="text-xs font-black text-rose-900 block">ডাটাবেজ ক্যাশ ও ফ্যাক্টরি রিসেট</span>
                    <p className="text-xs text-slate-600 font-medium">সিস্টেমের সমস্ত মক ও লোকালস্টোরেজ ডাটা ডিফল্ট ফ্যাক্টরি অবস্থায় ফিরিয়ে নিন।</p>
                    <button
                      type="button"
                      onClick={() => {
                        resetToDefaultData();
                        showToast('সিস্টেম ফ্যাক্টরি ডিফল্ট ডাটাতে রিসেট করা হয়েছে!');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs cursor-pointer shadow-xs mt-1 inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ফ্যাক্টরি ডাটা রিসেট করুন</span>
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
                  <option value={`bKash Merchant (${systemSettings.bkashMerchant})`}>bKash Merchant ({systemSettings.bkashMerchant})</option>
                  <option value={`Nagad Corporate (${systemSettings.nagadMerchant})`}>Nagad Corporate ({systemSettings.nagadMerchant})</option>
                  <option value={`Dutch-Bangla Bank (Rocket: ${systemSettings.rocketMerchant})`}>Dutch-Bangla Bank (Rocket: {systemSettings.rocketMerchant})</option>
                  <option value="City Bank Ltd. (BEFTN / NPSB)">City Bank Ltd. (BEFTN / NPSB)</option>
                  <option value="Brac Bank PLC (BEFTN / RTGS)">Brac Bank PLC (BEFTN / RTGS)</option>
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
      {/* MODAL: TEACHER ENROLLMENTS AUDIT BREAKDOWN */}
      {/* ========================================================================= */}
      {selectedTeacherForBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-pink-50 text-[#ed347d]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    শিক্ষক এনরোলমেন্ট ও সেলস অডিট (Real Ledger Breakdown)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedTeacherForBreakdown.name} • {selectedTeacherForBreakdown.subject}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedTeacherForBreakdown(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Teacher Financial Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block">মোট সেলস</span>
                <span className="text-base font-black font-mono text-slate-900">
                  ৳ {selectedTeacherForBreakdown.totalSales.toLocaleString('en-BD')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold block">শিক্ষক প্রাপ্য ({selectedTeacherForBreakdown.commissionPercent}%)</span>
                <span className="text-base font-black font-mono text-emerald-700">
                  ৳ {selectedTeacherForBreakdown.teacherEarned.toLocaleString('en-BD')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-200">
                <span className="text-[10px] text-cyan-700 font-bold block">পরিশোধিত</span>
                <span className="text-base font-black font-mono text-cyan-700">
                  ৳ {selectedTeacherForBreakdown.paidOut.toLocaleString('en-BD')}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-200">
                <span className="text-[10px] text-[#ed347d] font-bold block">উত্তোলনযোগ্য বকেয়া</span>
                <span className="text-base font-black font-mono text-[#ed347d]">
                  ৳ {selectedTeacherForBreakdown.dueBalance.toLocaleString('en-BD')}
                </span>
              </div>
            </div>

            {/* Real Students Enrollment List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                অনুমোদিত শিক্ষার্থী ভর্তির তালিকা ({selectedTeacherForBreakdown.teacherEnrollmentsList?.length || 0} টি)
              </h4>
              {(!selectedTeacherForBreakdown.teacherEnrollmentsList || selectedTeacherForBreakdown.teacherEnrollmentsList.length === 0) ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  এই শিক্ষকের কোনো কোর্সে এখনো অনুমোদিত ভর্তি রেকর্ড নেই।
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
                  {selectedTeacherForBreakdown.teacherEnrollmentsList.map((en: any, idx: number) => {
                    const teacherAmt = Math.round((Number(en.amount) || 0) * ((selectedTeacherForBreakdown.commissionPercent || 80) / 100));
                    return (
                      <div key={en.id || idx} className="p-3.5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-black text-slate-900 flex items-center gap-2">
                            <span>{en.studentName || 'শিক্ষার্থী'}</span>
                            <span className="text-[10px] font-mono font-normal text-slate-500">
                              {en.studentPhone || en.senderPhone || ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium">
                            {en.courseTitle || 'কোর্স'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            মেথড: <span className="font-bold text-slate-600">{en.paymentMethod || 'MFS'}</span> • TrxID: <span className="font-bold text-[#ed347d]">{en.trxId || '—'}</span> • তারিখ: {en.enrollmentDate || en.createdAt || 'সাম্প্রতিক'}
                          </div>
                        </div>
                        <div className="text-right sm:self-center">
                          <div className="font-mono font-black text-slate-900 text-sm">
                            ৳ {(Number(en.amount) || 0).toLocaleString('en-BD')}
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600 font-mono">
                            শিক্ষক অংশ: ৳ {teacherAmt.toLocaleString('en-BD')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="text-[11px] text-slate-500">
                ডাটাবেজের <span className="font-mono font-bold text-slate-700">enrollments</span> কালেকশন থেকে সরাসরি সংগৃহীত
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForBreakdown(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                {selectedTeacherForBreakdown.dueBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const t = selectedTeacherForBreakdown;
                      setSelectedTeacherForBreakdown(null);
                      openDisbursePayoutModal(t);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>পেআউট উইন্ডো খুলুন</span>
                  </button>
                )}
              </div>
            </div>
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

      {/* ========================================================================= */}
      {/* MODAL 5: APPROVE & DISBURSE TEACHER PAYOUT REQUEST */}
      {/* ========================================================================= */}
      {selectedPayoutForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>উইথড্রল রিকোয়েস্ট অনুমোদন ও নিষ্পত্তি</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectedPayoutForApproval(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">শিক্ষক:</span>
                <span className="font-black text-slate-900">{selectedPayoutForApproval.teacherName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">পেমেন্ট মেথড:</span>
                <span className="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-bold">{selectedPayoutForApproval.method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">অ্যাকাউন্ট নম্বর:</span>
                <span className="font-mono font-bold text-slate-900">{selectedPayoutForApproval.accountNumber}</span>
              </div>
              {selectedPayoutForApproval.bankDetails && selectedPayoutForApproval.bankDetails.bankName && (
                <div className="text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60 space-y-0.5">
                  <div><strong>ব্যাংক:</strong> {selectedPayoutForApproval.bankDetails.bankName}</div>
                  <div><strong>শাখা:</strong> {selectedPayoutForApproval.bankDetails.branchName || '—'}</div>
                  <div><strong>হিসাবের নাম:</strong> {selectedPayoutForApproval.bankDetails.accountName || '—'}</div>
                  {selectedPayoutForApproval.bankDetails.routingNumber && (
                    <div><strong>রাউটিং নম্বর:</strong> {selectedPayoutForApproval.bankDetails.routingNumber}</div>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60">
                <span className="text-slate-700 font-black">অনুরোধকৃত অর্থ:</span>
                <span className="font-mono font-black text-emerald-700 text-base">৳ {selectedPayoutForApproval.amount.toLocaleString('en-BD')}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmApprovePayout} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-700 block mb-1">ব্যাংক রেফারেন্স / TrxID *</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: TXN-BKASH-987213 অথবা ব্যাংক ভাউচার নং"
                  value={approvePayoutForm.trxId}
                  onChange={(e) => setApprovePayoutForm({ ...approvePayoutForm, trxId: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] font-mono font-bold shadow-2xs"
                />
              </div>

              <div>
                <label className="font-black text-slate-700 block mb-1">অ্যাডমিন নোট / নিষ্পত্তি মন্তব্য</label>
                <input
                  type="text"
                  value={approvePayoutForm.adminNotes}
                  onChange={(e) => setApprovePayoutForm({ ...approvePayoutForm, adminNotes: e.target.value })}
                  placeholder="উদা: সিটি ব্যাংক অনলাইন ট্রান্সফার সম্পন্ন"
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#ed347d] shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPayoutForApproval(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayout}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer border-t border-white/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessingPayout ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>অনুমোদন ও ডিসবার্স করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: REJECT TEACHER PAYOUT REQUEST */}
      {/* ========================================================================= */}
      {selectedPayoutForRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>উইথড্রল রিকোয়েস্ট বাতিলকরণ</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectedPayoutForRejection(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 space-y-1 text-xs">
              <div className="font-black text-slate-900">{selectedPayoutForRejection.teacherName}</div>
              <div className="text-slate-500">অনুরোধকৃত অর্থ: <strong className="text-rose-700 font-mono">৳ {selectedPayoutForRejection.amount.toLocaleString('en-BD')}</strong></div>
              <div className="text-[11px] text-rose-600 pt-1">
                অনুরোধ বাতিল করলে শিক্ষকের পোর্টালে বাতিলের কারণ প্রদর্শিত হবে এবং ব্যালেন্স অবিকল থাকবে।
              </div>
            </div>

            <form onSubmit={handleConfirmRejectPayout} className="space-y-3.5 text-xs">
              <div>
                <label className="font-black text-slate-700 block mb-1">বাতিলের কারণ (শিক্ষকের ড্যাশবোর্ডে দৃশ্যমান হবে) *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="উদা: ব্যাংক অ্যাকাউন্ট নাম ও তথ্যে অমিল রয়েছে..."
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-rose-500 shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPayoutForRejection(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  ফিরে যান
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayout}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer border-t border-white/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessingPayout ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  <span>রিকোয়েস্ট বাতিল নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
