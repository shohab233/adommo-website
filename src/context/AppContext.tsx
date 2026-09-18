'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Course, Enrollment, Exam, ExamSubmission, LeaderboardEntry, ResourceNote, Lecture, User, UserRole, QuestionBankItem, DetailedExamSubmission, LiveClass, NotificationItem, ChatMessage, ConversationThread, TeacherKycData, CouponItem } from '@/types';
import { healCourse } from '@/lib/courseSubjectNormalizer';

interface AppContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User;
  courses: Course[];
  exams: Exam[];
  enrollments: Enrollment[];
  leaderboard: LeaderboardEntry[];
  examSubmissions: Record<string, ExamSubmission>;
  questionBanks: QuestionBankItem[];
  detailedSubmissions: DetailedExamSubmission[];
  liveClasses: LiveClass[];
  isEnrolled: (courseId: string) => boolean;
  enrollInCourse: (courseId: string, paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Manual TrxID', trxId: string, senderPhone: string) => { success: boolean; message: string };
  approveEnrollment: (enrollmentId: string) => void;
  rejectEnrollment: (enrollmentId: string) => void;
  refundEnrollment: (enrollmentId: string) => void;
  deleteEnrollment: (enrollmentId: string) => void;
  addCourse: (course: Partial<Course>) => void;
  updateCourse: (courseId: string, updatedData: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addLectureToCourse: (courseId: string, moduleId: string, lecture: Omit<Lecture, 'id'>) => void;
  updateLecture: (courseId: string, moduleId: string, lectureId: string, updatedData: Partial<Lecture>) => void;
  deleteLecture: (courseId: string, moduleId: string, lectureId: string) => void;
  addResourceSheet: (courseId: string, moduleId: string, lectureId: string, note: Omit<ResourceNote, 'id' | 'downloadCount'>) => void;
  deleteResourceSheet: (courseId: string, sheetId: string) => void;
  resetToDefaultData: () => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (examId: string, updatedData: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  submitExam: (examId: string, answers: Record<string, number>) => ExamSubmission;
  submitDetailedExam: (submissionData: Omit<DetailedExamSubmission, 'id' | 'submittedAt' | 'rank'>) => DetailedExamSubmission;
  evaluateSubmission: (
    submissionId: string, 
    cqMarksAwarded: number, 
    feedbackNotes?: string, 
    detailedPartMarks?: Record<string, Record<string, number>>,
    publishImmediately?: boolean
  ) => void;
  publishBatchResults: (examId?: string) => number;
  scheduleLiveClass: (classData: Omit<LiveClass, 'id' | 'createdAt'>) => LiveClass;
  updateLiveClass: (id: string, updatedData: Partial<LiveClass>) => void;
  deleteLiveClass: (id: string) => void;
  startLiveClass: (id: string) => void;
  endLiveClass: (id: string, recordingUrl?: string, recordingNotesPdf?: string) => void;
  addQuestionBank: (item: Omit<QuestionBankItem, 'id' | 'downloadCount' | 'createdAt'>) => void;
  updateQuestionBank: (id: string, updatedData: Partial<QuestionBankItem>) => void;
  deleteQuestionBank: (id: string) => void;
  coupons: CouponItem[];
  addCoupon: (coupon: Omit<CouponItem, 'id' | 'createdAt' | 'usedCount'>) => void;
  deleteCoupon: (id: string) => void;
  verifyCoupon: (code: string, course: Course) => { valid: boolean; discountAmount: number; message: string; coupon?: CouponItem };
  loginUser: (user: Partial<User>) => void;
  loginWithApi: (credentials: { identifier: string; password: string; role?: UserRole }) => Promise<{ success: boolean; message: string; user?: User }>;
  registerUser: (userData: Omit<User, 'id' | 'enrolledCourseIds'>) => void;
  registerWithApi: (userData: { name: string; phone: string; email?: string; password: string; role?: UserRole; college?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  logoutUser: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  notifications: NotificationItem[];
  unreadNotifCount: number;
  isNotificationForUser: (notif: NotificationItem) => boolean;
  sendNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'readBy' | 'viewCount'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  togglePinNotification: (id: string) => void;
  conversations: ConversationThread[];
  unreadTeacherMsgCount: number;
  unreadStudentMsgCount: number;
  sendChatMessage: (threadId: string, text: string, imageUrl?: string, senderRole?: 'teacher' | 'student' | 'admin', markSolved?: boolean) => void;
  createDoubtThread: (data: { courseId: string; courseTitle: string; subject: string; chapter: string; topic?: string; question: string; imageUrl?: string }) => string;
  markThreadAsRead: (threadId: string, role: 'teacher' | 'student') => void;
  toggleDoubtStatus: (threadId: string) => void;
  getOrCreateBatchGroup: (courseId: string, courseTitle?: string) => ConversationThread;
  getOrCreateDirectThread: (teacherId: string, teacherName: string, teacherAvatar?: string, courseId?: string, courseTitle?: string) => string;
  createSupportTicket: (category: string, message: string, userPhone?: string) => string;
  teacherKycList: TeacherKycData[];
  submitTeacherKyc: (kycData: Omit<TeacherKycData, 'applicationId' | 'submittedAt' | 'status'>) => string;
  approveTeacherKyc: (applicationId: string, adminNotes?: string) => void;
  rejectTeacherKyc: (applicationId: string, reason: string) => void;
  loadFullCourse: (courseId: string) => Promise<Course | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const emptyUser: User = {
  id: '',
  name: '',
  phone: '',
  email: '',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  college: '',
  enrolledCourseIds: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // One-time synchronous purge to guarantee 100% clean slate across all browsers
  if (typeof window !== 'undefined' && !localStorage.getItem('adommo_fresh_clean_slate_v1')) {
    try {
      localStorage.removeItem('adommo_notifications');
      localStorage.removeItem('adommo_conversations');
      localStorage.removeItem('adommo_detailed_subs');
      localStorage.removeItem('adommo_live_classes');
      localStorage.removeItem('adommo_exams');
      localStorage.removeItem('adommo_courses');
      localStorage.removeItem('adommo_enrollments');
      localStorage.removeItem('adommo_user');
      localStorage.removeItem('adommo_role');
      localStorage.removeItem('adommo_coupons');
      localStorage.removeItem('adommo_teacher_kyc_list');
      localStorage.removeItem('adommo_qbanks');
      localStorage.setItem('adommo_fresh_clean_slate_v1', 'true');
    } catch {}
  }

  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<User>(emptyUser);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<Record<string, ExamSubmission>>({});
  const [questionBanks, setQuestionBanks] = useState<QuestionBankItem[]>([]);
  const [detailedSubmissions, setDetailedSubmissions] = useState<DetailedExamSubmission[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCoursesLoaded, setIsCoursesLoaded] = useState(false);
  const [teacherKycList, setTeacherKycList] = useState<TeacherKycData[]>([]);

  const saveTeacherKycList = (list: TeacherKycData[]) => {
    setTeacherKycList(list);
    try {
      localStorage.setItem('adommo_teacher_kyc_list', JSON.stringify(list));
    } catch {}
  };

  // Load from local storage if present
  useEffect(() => {
    try {
      // One-time cleanup to ensure fresh clean slate across browser sessions
      if (typeof window !== 'undefined' && !localStorage.getItem('adommo_fresh_clean_slate_v1')) {
        localStorage.removeItem('adommo_notifications');
        localStorage.removeItem('adommo_conversations');
        localStorage.removeItem('adommo_detailed_subs');
        localStorage.removeItem('adommo_live_classes');
        localStorage.removeItem('adommo_exams');
        localStorage.removeItem('adommo_courses');
        localStorage.removeItem('adommo_enrollments');
        localStorage.removeItem('adommo_user');
        localStorage.removeItem('adommo_role');
        localStorage.removeItem('adommo_coupons');
        localStorage.removeItem('adommo_teacher_kyc_list');
        localStorage.removeItem('adommo_qbanks');
        localStorage.setItem('adommo_fresh_clean_slate_v1', 'true');
      }

      const savedRole = localStorage.getItem('adommo_role') as UserRole;
      if (savedRole) setCurrentRole(savedRole);

      const savedEnrollments = localStorage.getItem('adommo_enrollments');
      if (savedEnrollments) setEnrollments(JSON.parse(savedEnrollments));

      const savedUser = localStorage.getItem('adommo_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedCourses = localStorage.getItem('adommo_courses');
      if (savedCourses !== null) {
        try {
          const parsed: Course[] = JSON.parse(savedCourses);
          if (Array.isArray(parsed)) {
            setCourses(parsed.map((c: any) => healCourse(c)));
          }
        } catch (e) {
          console.error('Failed to parse courses from storage', e);
        }
      }

      const savedExams = localStorage.getItem('adommo_exams');
      if (savedExams) {
        try {
          const parsed = JSON.parse(savedExams);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setExams(parsed);
          }
        } catch (e) {
          console.error('Failed to parse exams from storage', e);
        }
      }

      const savedQB = localStorage.getItem('adommo_qbanks');
      if (savedQB) {
        try {
          const parsed = JSON.parse(savedQB);
          if (Array.isArray(parsed)) {
            setQuestionBanks(parsed);
          }
        } catch (e) {
          console.error('Failed to parse question banks from storage', e);
        }
      }

      const savedSubs = localStorage.getItem('adommo_detailed_subs');
      if (savedSubs) {
        try {
          const parsed = JSON.parse(savedSubs);
          if (Array.isArray(parsed)) {
            setDetailedSubmissions(parsed);
          }
        } catch (e) {
          console.error('Failed to parse detailed submissions from storage', e);
        }
      }

      const savedLive = localStorage.getItem('adommo_live_classes');
      if (savedLive) {
        try {
          const parsed = JSON.parse(savedLive);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLiveClasses(parsed);
          }
        } catch (e) {
          console.error('Failed to parse live classes from storage', e);
        }
      }

      const savedNotifs = localStorage.getItem('adommo_notifications');
      if (savedNotifs) {
        try {
          const parsed = JSON.parse(savedNotifs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
          }
        } catch (e) {
          console.error('Failed to parse notifications from storage', e);
        }
      }

      const savedConvs = localStorage.getItem('adommo_conversations');
      if (savedConvs) {
        try {
          const parsed = JSON.parse(savedConvs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed);
          }
        } catch (e) {
          console.error('Failed to parse conversations from storage', e);
        }
      }

      const savedCoupons = localStorage.getItem('adommo_coupons');
      if (savedCoupons) {
        try {
          const parsed = JSON.parse(savedCoupons);
          if (Array.isArray(parsed)) setCoupons(parsed);
        } catch {}
      }

      const savedKyc = localStorage.getItem('adommo_teacher_kyc_list');
      if (savedKyc) {
        try {
          const parsed = JSON.parse(savedKyc);
          if (Array.isArray(parsed)) setTeacherKycList(parsed);
        } catch {}
      }
    } catch (e) {
      console.error('Failed to load from storage', e);
    } finally {
      setIsCoursesLoaded(true);
    }

    // Hydrate live authenticated session from HttpOnly cookie
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.role) {
            setCurrentRole(data.user.role);
          }
          try {
            localStorage.setItem('adommo_user', JSON.stringify(data.user));
            if (data.user.role) localStorage.setItem('adommo_role', data.user.role);
          } catch {}
        } else {
          setCurrentUser(emptyUser);
          try {
            localStorage.removeItem('adommo_user');
          } catch {}
        }
      })
      .catch((err) => console.log('Session check completed', err));

    // Hydrate real courses from DB: First fast lightweight catalog (<90KB) for instant mobile loading
    fetch('/api/courses?summary=true')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.courses)) {
          const healedSummaries = data.courses.map((c: any) => healCourse(c));
          setCourses((prevCourses) => {
            return healedSummaries.map((newC: any) => {
              const existing = prevCourses.find((p) => p.id === newC.id);
              if (existing && existing.modules && existing.modules.length > 0 && (!newC.modules || newC.modules.length === 0)) {
                return {
                  ...newC,
                  modules: existing.modules,
                  sections: existing.sections || newC.sections,
                };
              }
              return newC;
            });
          });
          try {
            localStorage.setItem('adommo_courses', JSON.stringify(healedSummaries));
          } catch {}
        }
      })
      .catch((err) => console.log('Course summary sync completed', err));

    // Non-blocking full curriculum hydration in background
    const fullCoursesTimer = setTimeout(() => {
      fetch('/api/courses?full=true')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && Array.isArray(data.courses)) {
            setCourses(data.courses.map((c: any) => healCourse(c)));
          }
        })
        .catch(() => {});
    }, 1500);

    // Hydrate real teacher KYC list from DB
    fetch('/api/teacher/kyc')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const rawList = data?.kycList || data?.list;
        if (Array.isArray(rawList)) {
          saveTeacherKycList(rawList);
        }
      })
      .catch((err) => console.log('KYC sync completed', err));

    // Hydrate real enrollments from DB
    fetch('/api/enrollments')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.enrollments)) {
          setEnrollments(data.enrollments);
        }
      })
      .catch((err) => console.log('Enrollments sync completed', err));

    // Hydrate real exams from DB
    fetch('/api/exams')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.exams)) {
          setExams(data.exams);
        }
      })
      .catch((err) => console.log('Exams sync completed', err));

    // Hydrate live classes from DB
    fetch('/api/live-classes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.liveClasses) && data.liveClasses.length > 0) {
          setLiveClasses(data.liveClasses);
        }
      })
      .catch((err) => console.log('Live classes sync completed', err));

    // Hydrate notifications from DB
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      })
      .catch((err) => console.log('Notifications sync completed', err));

    // Hydrate question banks from DB
    fetch('/api/question-banks')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.questionBanks) && data.questionBanks.length > 0) {
          setQuestionBanks(data.questionBanks);
        }
      })
      .catch((err) => console.log('Question banks sync completed', err));

    // Hydrate coupons from DB
    fetch('/api/admin/coupons')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
          try {
            localStorage.setItem('adommo_coupons', JSON.stringify(data.coupons));
          } catch {}
        }
      })
      .catch((err) => console.log('Coupons sync completed', err));

    // Hydrate submissions from DB
    fetch('/api/exams/submit')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          if (Array.isArray(data.submissions) && data.submissions.length > 0) {
            setDetailedSubmissions(data.submissions);
          }
          if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
            setLeaderboard(data.leaderboard);
          }
        }
      })
      .catch((err) => console.log('Submissions sync completed', err));

    // Hydrate real conversations from DB and poll every 3 seconds for real-time two-way chat
    const syncConversations = () => {
      fetch('/api/messages')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && Array.isArray(data.conversations)) {
            setConversations((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(data.conversations)) {
                return data.conversations;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };

    const syncEnrollments = () => {
      fetch('/api/enrollments')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && Array.isArray(data.enrollments)) {
            setEnrollments((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(data.enrollments)) {
                try {
                  localStorage.setItem('adommo_enrollments', JSON.stringify(data.enrollments));
                } catch {}
                return data.enrollments;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };

    const syncCourses = () => {
      fetch('/api/courses')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && Array.isArray(data.courses)) {
            setCourses((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(data.courses)) {
                try {
                  localStorage.setItem('adommo_courses', JSON.stringify(data.courses));
                } catch {}
                return data.courses;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };

    syncConversations();
    syncEnrollments();
    syncCourses();
    const livePollTimer = setInterval(() => {
      syncConversations();
      syncEnrollments();
      syncCourses();
    }, 3000);

    return () => {
      clearInterval(livePollTimer);
    };
  }, []);

  // Sync state across open tabs and windows in real time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'adommo_detailed_subs') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setDetailedSubmissions(parsed);
        } else if (e.key === 'adommo_courses') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCourses(parsed);
        } else if (e.key === 'adommo_exams') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setExams(parsed);
        } else if (e.key === 'adommo_enrollments') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setEnrollments(parsed);
        } else if (e.key === 'adommo_qbanks') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setQuestionBanks(parsed);
        } else if (e.key === 'adommo_live_classes') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setLiveClasses(parsed);
        } else if (e.key === 'adommo_notifications') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } else if (e.key === 'adommo_conversations') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setConversations(parsed);
        }
      } catch (err) {
        console.error('Failed to sync storage change', err);
      }
    };

    const handleLocalSubsUpdate = () => {
      try {
        const saved = localStorage.getItem('adommo_detailed_subs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setDetailedSubmissions(parsed);
        }
      } catch {}
    };

    const handleLocalLiveUpdate = () => {
      try {
        const saved = localStorage.getItem('adommo_live_classes');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setLiveClasses(parsed);
        }
      } catch {}
    };

    const handleLocalNotifsUpdate = () => {
      try {
        const saved = localStorage.getItem('adommo_notifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setNotifications(parsed);
        }
      } catch {}
    };

    const handleLocalConvsUpdate = () => {
      try {
        const saved = localStorage.getItem('adommo_conversations');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setConversations(parsed);
        }
      } catch {}
    };

    const handleLocalEnrollmentsUpdate = () => {
      try {
        const saved = localStorage.getItem('adommo_enrollments');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setEnrollments(parsed);
        }
        const savedU = localStorage.getItem('adommo_user');
        if (savedU) {
          const parsedU = JSON.parse(savedU);
          if (parsedU && (parsedU.id === currentUser.id || parsedU.phone === currentUser.phone)) {
            setCurrentUser(parsedU);
          }
        }
      } catch {}
    };

    const handleLocalCoursesUpdate = () => {
      try {
        const saved = localStorage.getItem('adommo_courses');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setCourses(parsed);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adommo_subs_updated', handleLocalSubsUpdate);
    window.addEventListener('adommo_live_updated', handleLocalLiveUpdate);
    window.addEventListener('adommo_notifications_updated', handleLocalNotifsUpdate);
    window.addEventListener('adommo_conversations_updated', handleLocalConvsUpdate);
    window.addEventListener('adommo_enrollments_updated', handleLocalEnrollmentsUpdate);
    window.addEventListener('adommo_courses_updated', handleLocalCoursesUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adommo_subs_updated', handleLocalSubsUpdate);
      window.removeEventListener('adommo_live_updated', handleLocalLiveUpdate);
      window.removeEventListener('adommo_notifications_updated', handleLocalNotifsUpdate);
      window.removeEventListener('adommo_conversations_updated', handleLocalConvsUpdate);
      window.removeEventListener('adommo_enrollments_updated', handleLocalEnrollmentsUpdate);
      window.removeEventListener('adommo_courses_updated', handleLocalCoursesUpdate);
    };
  }, [currentUser.id, currentUser.phone]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser((prev) => {
      const next = { ...prev, role };
      try {
        localStorage.setItem('adommo_user', JSON.stringify(next));
      } catch {}
      return next;
    });
    try {
      localStorage.setItem('adommo_role', role);
    } catch {
      // ignore
    }
    showToast(`রোল পরিবর্তন করা হয়েছে: ${role === 'student' ? '🎓 স্টুডেন্ট পোর্টাল' : role === 'teacher' ? '👨‍🏫 টিচার স্টুডিও' : '👑 সুপার অ্যাডমিন কন্ট্রোল'}`);
  };

  const loginUser = (user: Partial<User>) => {
    const updated: User = {
      ...currentUser,
      ...user,
      id: user.id || currentUser.id,
      name: user.name || currentUser.name,
      phone: user.phone || currentUser.phone,
      email: user.email || currentUser.email,
      role: user.role || currentUser.role,
      enrolledCourseIds: Array.isArray(user.enrolledCourseIds)
        ? user.enrolledCourseIds
        : (user.id && user.id === currentUser.id ? currentUser.enrolledCourseIds : []),
    };
    setCurrentUser(updated);
    if (user.role) {
      setCurrentRole(user.role);
      try {
        localStorage.setItem('adommo_role', user.role);
      } catch {}
    }
    try {
      localStorage.setItem('adommo_user', JSON.stringify(updated));
    } catch {}
    showToast(`স্বাগতম, ${updated.name}! আপনি সফলভাবে লগইন করেছেন।`);
  };

  const loginWithApi = async (credentials: { identifier: string; password: string; role?: UserRole }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        if (data.user.role) {
          setCurrentRole(data.user.role);
          try {
            localStorage.setItem('adommo_role', data.user.role);
          } catch {}
        }
        try {
          localStorage.setItem('adommo_user', JSON.stringify(data.user));
        } catch {}
        showToast(`স্বাগতম, ${data.user.name}! আপনি সফলভাবে প্রবেশ করেছেন।`);
        return { success: true, message: data.message || 'লগইন সফল হয়েছে', user: data.user };
      } else {
        const errorMsg = data.error || data.message || 'মোবাইল/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়';
        showToast(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      console.error('API login failed', err);
      showToast('সার্ভারের সাথে সংযোগে ত্রুটি দেখা দিয়েছে');
      return { success: false, message: 'সার্ভার সমস্যা' };
    }
  };

  const registerUser = (userData: Omit<User, 'id' | 'enrolledCourseIds'>) => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      enrolledCourseIds: [],
    };
    setCurrentUser(newUser);
    if (newUser.role) {
      setCurrentRole(newUser.role);
      try {
        localStorage.setItem('adommo_role', newUser.role);
      } catch {}
    }
    try {
      localStorage.setItem('adommo_user', JSON.stringify(newUser));
    } catch {}
    showToast(`🎉 রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম ${newUser.name} অদম্য এডটেকে।`);
  };

  const registerWithApi = async (userData: { name: string; phone: string; email?: string; password: string; role?: UserRole; college?: string }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        if (data.user.role) {
          setCurrentRole(data.user.role);
          try {
            localStorage.setItem('adommo_role', data.user.role);
          } catch {}
        }
        try {
          localStorage.setItem('adommo_user', JSON.stringify(data.user));
        } catch {}
        showToast(`🎉 রেজিস্ট্রেশন সফল! স্বাগতম ${data.user.name} অদম্য এডটেকে।`);
        return { success: true, message: data.message || 'রেজিস্ট্রেশন সফল হয়েছে', user: data.user };
      } else {
        const errorMsg = data.error || data.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে';
        showToast(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      console.error('API register failed', err);
      showToast('সার্ভারের সাথে সংযোগে ত্রুটি দেখা দিয়েছে');
      return { success: false, message: 'সার্ভার সমস্যা' };
    }
  };

  const logoutUser = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(emptyUser);
    setCurrentRole('student');
    try {
      localStorage.removeItem('adommo_user');
      localStorage.removeItem('adommo_role');
      localStorage.removeItem('adommo_token');
    } catch {}
    showToast('সফলভাবে লগআউট করা হয়েছে।');
  };

  const isEnrolled = (courseId: string): boolean => {
    if (!currentUser || !currentUser.id || currentUser.id === 'usr_guest') {
      return false;
    }
    if (Array.isArray(currentUser.enrolledCourseIds) && currentUser.enrolledCourseIds.includes(courseId)) {
      return true;
    }
    const userPhoneClean = (currentUser.phone || '').replace(/\D/g, '');
    return enrollments.some((e) => {
      if (e.courseId !== courseId || e.status !== 'approved') return false;
      if (currentUser.id && e.studentId === currentUser.id) return true;
      if (userPhoneClean) {
        const p1 = (e.studentPhone || '').replace(/\D/g, '');
        const p2 = (e.senderPhone || '').replace(/\D/g, '');
        if (p1 && p1 === userPhoneClean) return true;
        if (p2 && p2 === userPhoneClean) return true;
      }
      return false;
    });
  };

  const enrollInCourse = (
    courseId: string,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Manual TrxID',
    trxId: string,
    senderPhone: string
  ) => {
    // 1. Mandatory Student Authentication Check
    if (!currentUser || !currentUser.id || currentUser.id === 'usr_guest') {
      showToast('⚠️ কোর্সে ভর্তি হতে অনুগ্রহ করে আগে আপনার শিক্ষার্থী একাউন্টে লগইন করুন!');
      return { 
        success: false, 
        message: 'লগইন করা আবশ্যক। কোর্সে ভর্তি হওয়ার আগে অনুগ্রহ করে লগইন করুন।' 
      };
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) return { success: false, message: 'কোর্স পাওয়া যায়নি!' };

    // If free test/course, instant approval
    if (course.offerPrice === 0) {
      const updatedIds = [...currentUser.enrolledCourseIds, courseId];
      const updatedUser = { ...currentUser, enrolledCourseIds: updatedIds };
      setCurrentUser(updatedUser);
      localStorage.setItem('adommo_user', JSON.stringify(updatedUser));
      showToast('🎉 ফ্রি কোর্সে সফলভাবে এনরোল করা হয়েছে!');
      return { success: true, message: 'সফলভাবে ক্লাসরুম আনলক করা হয়েছে!' };
    }

    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentPhone: currentUser.phone,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.offerPrice,
      paymentMethod,
      trxId: trxId || `TX${Math.floor(100000 + Math.random() * 900000)}`,
      senderPhone: senderPhone || currentUser.phone,
      status: 'pending',
      createdAt: 'এইমাত্র',
      enrollmentDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newEnrollment, ...enrollments];
    setEnrollments(updated);
    try {
      localStorage.setItem('adommo_enrollments', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist enrollment to live database
    fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnrollment),
    }).catch((err) => console.log('Enrollment sync completed', err));

    showToast('✅ আপনার পেমেন্ট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে! ভেরিফিকেশন সম্পন্ন হলে ক্লাসরুম স্বয়ংক্রিয়ভাবে খুলে যাবে।');
    return {
      success: true,
      message: 'পেমেন্ট ভেরিফিকেশন সফলভাবে সাবমিট হয়েছে। কিছুক্ষণের মধ্যে এক্সেস পাবেন।',
    };
  };

  const approveEnrollment = (enrollmentId: string) => {
    let approvedCourseId = '';
    let studentIdToUnlock = '';
    let studentPhoneToUnlock = '';
    let foundTrx = '';

    const cleanId = String(enrollmentId).trim();
    const updated = enrollments.map((e) => {
      if (e.id === cleanId || (e.trxId && e.trxId.trim() === cleanId)) {
        approvedCourseId = e.courseId;
        studentIdToUnlock = e.studentId || '';
        studentPhoneToUnlock = (e.studentPhone || e.senderPhone || '').replace(/\D/g, '');
        foundTrx = e.trxId;
        return { ...e, status: 'approved' as const };
      }
      return e;
    });
    setEnrollments(updated);

    try {
      localStorage.setItem('adommo_enrollments', JSON.stringify(updated));
    } catch {}

    // 1. If currently logged in user is this student, unlock immediately in currentUser
    if (approvedCourseId) {
      const curPhoneClean = (currentUser.phone || '').replace(/\D/g, '');
      const isCurrentStudent =
        (studentIdToUnlock && currentUser.id === studentIdToUnlock) ||
        (studentPhoneToUnlock && curPhoneClean && studentPhoneToUnlock === curPhoneClean);

      if (isCurrentStudent) {
        setCurrentUser((prev) => {
          const nextEnrolled = Array.from(new Set([...(prev.enrolledCourseIds || []), approvedCourseId]));
          const nextU = { ...prev, enrolledCourseIds: nextEnrolled };
          try {
            localStorage.setItem('adommo_user', JSON.stringify(nextU));
          } catch {}
          return nextU;
        });
      }

      // 2. Also update student's record in localStorage if saved user matches
      try {
        const savedUserStr = localStorage.getItem('adommo_user');
        if (savedUserStr) {
          const savedU = JSON.parse(savedUserStr);
          const savedPhoneClean = (savedU.phone || '').replace(/\D/g, '');
          if (
            (studentIdToUnlock && savedU.id === studentIdToUnlock) ||
            (studentPhoneToUnlock && savedPhoneClean && studentPhoneToUnlock === savedPhoneClean)
          ) {
            const nextEnrolled = Array.from(new Set([...(savedU.enrolledCourseIds || []), approvedCourseId]));
            savedU.enrolledCourseIds = nextEnrolled;
            localStorage.setItem('adommo_user', JSON.stringify(savedU));
          }
        }
      } catch {}

      // 3. Notify other open tabs and components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('adommo_enrollments_updated'));
      }
    }

    // Live API Call to Admin Enrollments endpoint
    fetch('/api/admin/enrollments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId: cleanId, action: 'approve' }),
    })
      .then(() => {
        fetch('/api/enrollments')
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.success && Array.isArray(data.enrollments)) {
              setEnrollments(data.enrollments);
              try {
                localStorage.setItem('adommo_enrollments', JSON.stringify(data.enrollments));
              } catch {}
            }
          })
          .catch(() => {});
      })
      .catch((err) => console.log('Admin enrollment approve completed', err));

    showToast(`✅ ট্রানজাকশন #${foundTrx || cleanId} সফলভাবে অ্যাপ্রুভ করা হয়েছে! স্টুডেন্ট এখন ক্লাসরুম এক্সেস করতে পারবে।`);
  };

  const rejectEnrollment = (enrollmentId: string) => {
    const updated = enrollments.map((e) =>
      e.id === enrollmentId ? { ...e, status: 'rejected' as const } : e
    );
    setEnrollments(updated);
    try {
      localStorage.setItem('adommo_enrollments', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Live API Call to Admin Enrollments endpoint
    fetch('/api/admin/enrollments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, action: 'reject' }),
    }).catch((err) => console.log('Admin enrollment reject completed', err));

    showToast('⚠️ এনরোলমেন্ট রিকোয়েস্ট রিজেক্ট করা হয়েছে।');
  };

  const refundEnrollment = (enrollmentId: string) => {
    const target = enrollments.find((e) => e.id === enrollmentId);
    const updated = enrollments.map((e) =>
      e.id === enrollmentId ? { ...e, status: 'refunded' as const } : e
    );
    setEnrollments(updated);
    try {
      localStorage.setItem('adommo_enrollments', JSON.stringify(updated));
    } catch {}

    // If current user is enrolled in this course, revoke access
    if (target && currentUser && Array.isArray(currentUser.enrolledCourseIds) && currentUser.enrolledCourseIds.includes(target.courseId)) {
      const remaining = currentUser.enrolledCourseIds.filter((cid) => cid !== target.courseId);
      const updatedUser = { ...currentUser, enrolledCourseIds: remaining };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('adommo_user', JSON.stringify(updatedUser));
      } catch {}
    }

    fetch('/api/admin/enrollments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, action: 'refund' }),
    }).catch((err) => console.log('Admin enrollment refund completed', err));

    showToast(`💸 ${target ? target.studentName : 'শিক্ষার্থী'}-কে ৳ ${target ? target.amount : ''} টাকা রিফান্ড প্রদান সম্পন্ন হয়েছে!`);
  };

  const deleteEnrollment = (enrollmentId: string) => {
    const updated = enrollments.filter((e) => e.id !== enrollmentId);
    setEnrollments(updated);
    try {
      localStorage.setItem('adommo_enrollments', JSON.stringify(updated));
    } catch {}

    fetch(`/api/admin/enrollments?id=${enrollmentId}`, {
      method: 'DELETE',
    }).catch((err) => console.log('Admin enrollment delete error:', err));

    showToast('এনরোলমেন্ট মুছে ফেলা হয়েছে।');
  };

  const loadFullCourse = useCallback(async (courseId: string): Promise<Course | null> => {
    try {
      const res = await fetch(`/api/courses?id=${encodeURIComponent(courseId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.course) {
          const healed = healCourse(data.course);
          setCourses((prev) => {
            const index = prev.findIndex((c) => c.id === courseId);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = healed;
              return copy;
            }
            return [...prev, healed];
          });
          return healed;
        }
      }
    } catch (err) {
      console.error('Failed to load full course', err);
    }
    return null;
  }, []);

  const addCourse = (newCourseData: Partial<Course>) => {
    const regPrice = Number(newCourseData.regularPrice) || 2500;
    const offPrice = Number(newCourseData.offerPrice) || 1200;
    const calcDiscount = regPrice > offPrice ? Math.round(((regPrice - offPrice) / regPrice) * 100) : 0;

    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: newCourseData.title || 'নতুন ফিজিক্স স্পেশাল কোর্স',
      slug: `course-${Date.now()}`,
      category: newCourseData.category || 'Engineering',
      level: newCourseData.level || 'এইচএসসি ও ভর্তি প্রস্তুতি',
      batch: newCourseData.batch || 'নতুন ব্যাচ ২০২৬',
      coverImage: newCourseData.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      badge: newCourseData.badge || 'ভর্তি চলছে',
      tagline: newCourseData.tagline || 'সহজ ও কার্যকরী উপায়ে বিষয় আয়ত্ত করুন।',
      description: newCourseData.description || 'সম্পূর্ণ কোর্স সিলেবাস কভারেজ ও গাণিতিক প্রস্তুতি।',
      instructorId: currentUser.id || newCourseData.instructorId || '',
      teacherEmail: currentUser.email || newCourseData.teacherEmail || '',
      teacherPhone: currentUser.phone || newCourseData.teacherPhone || '',
      instructor: {
        name: currentUser.name || 'কোর্স ইনস্ট্রাক্টর',
        designation: 'লিড ইনস্ট্রাক্টর',
        institution: currentUser.college || 'মেন্টর ও শিক্ষক, অদম্য এডটেক',
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      regularPrice: regPrice,
      offerPrice: offPrice,
      discountPercentage: newCourseData.discountPercentage || calcDiscount,
      enrolledCount: 0,
      rating: 5.0,
      reviewCount: 0,
      totalLectures: Number(newCourseData.totalLectures) || 0,
      totalExams: Number(newCourseData.totalExams) || 0,
      totalSheets: Number(newCourseData.totalSheets) || 0,
      sections: newCourseData.sections || [],
      modules: newCourseData.modules || [],
      features: newCourseData.features || [],
      faq: newCourseData.faq || [],
      ...newCourseData,
    };

    const updatedCourses = [newCourse, ...courses];
    setCourses(updatedCourses);
    try {
      localStorage.setItem('adommo_courses', JSON.stringify(updatedCourses));
    } catch {
      // ignore
    }

    // Persist new course to DB
    fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse),
    }).catch((err) => console.log('Course persist completed', err));

    // Automatically create a dedicated Batchmate Discussion Group for this course
    const newBatchGroup: ConversationThread = {
      id: `thread_batch_${newCourse.id}`,
      type: 'batch_group',
      studentName: `${newCourse.title} - অফিশিয়াল ব্যাচমেট ফোরাম`,
      courseId: newCourse.id,
      courseTitle: newCourse.title,
      status: 'open',
      priority: 'normal',
      lastMessageText: `স্বাগতম! "${newCourse.title}" কোর্সের অফিশিয়াল ব্যাচমেট ফোরাম তৈরি হয়েছে।`,
      lastMessageTime: 'এখনই',
      unreadCountTeacher: 0,
      unreadCountStudent: 0,
      messages: [
        {
          id: `msg_bg_${Date.now()}`,
          senderId: 'teacher_main',
          senderName: `${newCourse.instructor?.name || currentUser.name || 'কোর্স মেন্টর'} (ইনস্ট্রাক্টর)`,
          senderRole: 'teacher',
          senderAvatar: newCourse.instructor?.avatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          text: `স্বাগতম প্রিয় শিক্ষার্থীরা! "${newCourse.title}" কোর্সে ভর্তিকৃত সকল সহপাঠীদের পারস্পরিক পড়াশোনার আলোচনা, ডাউট শেয়ারিং ও পরীক্ষার প্রস্তুতি আলোচনার জন্য এই অফিশিয়াল গ্রুপ তৈরি হলো।`,
          createdAt: 'এখনই',
          isRead: true,
        }
      ]
    };

    saveConversations([newBatchGroup, ...conversations]);
    showToast('🎉 নতুন কোর্স ও অফিশিয়াল ব্যাচমেট গ্রুপ সফলভাবে তৈরি হয়েছে!');
  };

  const updateCourse = (courseId: string, updatedData: Partial<Course>) => {
    setCourses((prevCourses) => {
      const updated = prevCourses.map((course) => {
        if (course.id !== courseId) return course;
        const regPrice = updatedData.regularPrice !== undefined ? Number(updatedData.regularPrice) : course.regularPrice;
        const offPrice = updatedData.offerPrice !== undefined ? Number(updatedData.offerPrice) : course.offerPrice;
        const calcDiscount = regPrice > offPrice ? Math.round(((regPrice - offPrice) / regPrice) * 100) : 0;

        const effectiveModules = updatedData.modules !== undefined ? updatedData.modules : (course.modules || []);
        const calcLectures = effectiveModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
        const calcSheets = effectiveModules.reduce(
          (sum, m) => sum + (m.lectures?.reduce((lSum, l) => lSum + (l.notes?.length || 0), 0) || 0),
          0
        );

        return {
          ...course,
          ...updatedData,
          regularPrice: regPrice,
          offerPrice: offPrice,
          discountPercentage: updatedData.discountPercentage !== undefined ? updatedData.discountPercentage : calcDiscount,
          totalLectures: updatedData.totalLectures !== undefined ? updatedData.totalLectures : calcLectures,
          totalSheets: updatedData.totalSheets !== undefined ? updatedData.totalSheets : calcSheets,
        };
      });
      try {
        localStorage.setItem('adommo_courses', JSON.stringify(updated));
      } catch {}

      // Persist updated course to DB
      fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: courseId, ...updatedData }),
      }).catch((err) => console.log('Course update sync completed', err));

      return updated;
    });
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prevCourses) => {
      const updated = prevCourses.filter((c) => c.id !== courseId);
      try {
        localStorage.setItem('adommo_courses', JSON.stringify(updated));
      } catch {}

      // Delete course from DB
      fetch(`/api/courses?id=${courseId}`, {
        method: 'DELETE',
      }).catch((err) => console.log('Course delete sync completed', err));

      return updated;
    });

    // Remove from enrollments
    setEnrollments((prev) => {
      const updated = prev.filter((e) => e.courseId !== courseId);
      try {
        localStorage.setItem('adommo_enrollments', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Remove from exams
    setExams((prev) => {
      const updated = prev.filter((ex) => ex.courseId !== courseId);
      try {
        localStorage.setItem('adommo_exams', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Remove from currentUser enrolled courses
    setCurrentUser((prev) => {
      if (!prev.enrolledCourseIds.includes(courseId)) return prev;
      const updatedUser = {
        ...prev,
        enrolledCourseIds: prev.enrolledCourseIds.filter((id) => id !== courseId),
      };
      try {
        localStorage.setItem('adommo_user', JSON.stringify(updatedUser));
      } catch {}
      return updatedUser;
    });

    showToast('🗑️ কোর্সটি সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const updateLecture = (courseId: string, moduleId: string, lectureId: string, updatedData: Partial<Lecture>) => {
    setCourses((prevCourses) => {
      let targetModules: any = null;
      const updated = prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedModules = (course.modules || []).map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            lectures: (mod.lectures || []).map((lec) =>
              lec.id === lectureId ? { ...lec, ...updatedData } : lec
            ),
          };
        });

        targetModules = updatedModules;
        return {
          ...course,
          modules: updatedModules,
        };
      });
      try {
        localStorage.setItem('adommo_courses', JSON.stringify(updated));
      } catch {}

      if (targetModules) {
        fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: courseId, modules: targetModules }),
        }).catch((err) => console.log('Lecture update sync error', err));
      }

      return updated;
    });
    showToast('✏️ ক্লাসের তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  const deleteLecture = (courseId: string, moduleId: string, lectureId: string) => {
    setCourses((prevCourses) => {
      let targetModules: any = null;
      let targetTotalLecs = 0;
      const updated = prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedModules = (course.modules || []).map((mod) => {
          if (mod.id !== moduleId) return mod;
          return {
            ...mod,
            lectures: (mod.lectures || []).filter((lec) => lec.id !== lectureId),
          };
        });

        const totalLecs = updatedModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);
        targetModules = updatedModules;
        targetTotalLecs = totalLecs;

        return {
          ...course,
          totalLectures: totalLecs,
          modules: updatedModules,
        };
      });
      try {
        localStorage.setItem('adommo_courses', JSON.stringify(updated));
      } catch {}

      if (targetModules) {
        fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: courseId, modules: targetModules, totalLectures: targetTotalLecs }),
        }).catch((err) => console.log('Lecture delete sync error', err));
      }

      return updated;
    });
    showToast('🗑️ ক্লাসটি সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const resetToDefaultData = () => {
    try {
      localStorage.removeItem('adommo_courses');
      localStorage.removeItem('adommo_enrollments');
      localStorage.removeItem('adommo_exams');
      localStorage.removeItem('adommo_teacher_kyc_list');
      localStorage.removeItem('adommo_conversations');
      localStorage.removeItem('adommo_notifications');
      localStorage.removeItem('adommo_live_classes');
      localStorage.removeItem('adommo_detailed_subs');
    } catch {}
    setCourses([]);
    setExams([]);
    setEnrollments([]);
    setTeacherKycList([]);
    setConversations([]);
    setNotifications([]);
    setLiveClasses([]);
    setDetailedSubmissions([]);
    showToast('🔄 ডাটাবেস সম্পূর্ণ ক্লিন ও নতুন অবস্থায় রিসেট করা হয়েছে!');
  };

  const addLectureToCourse = (courseId: string, moduleId: string, lecture: Omit<Lecture, 'id'>) => {
    setCourses((prevCourses) => {
      let targetCourse: Course | undefined;
      const updated = prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        let moduleFound = false;
        const updatedModules = (course.modules || []).map((mod) => {
          if (mod.id === moduleId) {
            moduleFound = true;
            return {
              ...mod,
              lectures: [...(mod.lectures || []), { ...lecture, id: `lec_${Date.now()}` }],
            };
          }
          return mod;
        });

        // If module does not exist, create it
        if (!moduleFound) {
          updatedModules.push({
            id: moduleId || `mod_${Date.now()}`,
            title: 'নতুন মডিউল / অধ্যায়',
            order: updatedModules.length + 1,
            lectures: [{ ...lecture, id: `lec_${Date.now()}` }],
          });
        }

        const totalLecs = updatedModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0);

        targetCourse = {
          ...course,
          totalLectures: totalLecs,
          modules: updatedModules,
        };
        return targetCourse;
      });

      try {
        localStorage.setItem('adommo_courses', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_courses_updated'));
      } catch {}

      if (targetCourse) {
        fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetCourse),
        }).catch((err) => console.log('Course lecture sync error:', err));
      }

      return updated;
    });
    showToast('✅ ক্লাসরুমে নতুন লেকচার ভিডিও সফলভাবে যুক্ত করা হয়েছে!');
  };

  const addResourceSheet = (courseId: string, moduleId: string, lectureId: string, note: Omit<ResourceNote, 'id' | 'downloadCount'>) => {
    setCourses((prevCourses) => {
      let targetCourse: Course | undefined;
      const updated = prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedModules = course.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;

          let foundLec = false;
          let updatedLectures = mod.lectures.map((lec) => {
            if (lec.id === lectureId) {
              foundLec = true;
              return {
                ...lec,
                notes: [...(lec.notes || []), { ...note, id: `sheet_${Date.now()}`, downloadCount: 0 }],
              };
            }
            return lec;
          });

          // If target lectureId wasn't found or was empty
          if (!foundLec) {
            if (updatedLectures.length > 0) {
              updatedLectures[0] = {
                ...updatedLectures[0],
                notes: [...(updatedLectures[0].notes || []), { ...note, id: `sheet_${Date.now()}`, downloadCount: 0 }],
              };
            } else {
              // If the module has 0 lectures yet, create a default lecture container for resources
              updatedLectures = [
                {
                  id: `lec_res_${Date.now()}`,
                  title: `${mod.title} - সাধারণ রিসোর্স ও শিট`,
                  duration: '00:00',
                  videoUrl: '',
                  isFreePreview: true,
                  notes: [{ ...note, id: `sheet_${Date.now()}`, downloadCount: 0 }],
                },
              ];
            }
          }

          return { ...mod, lectures: updatedLectures };
        });

        const calcSheets = updatedModules.reduce(
          (sum, m) => sum + (m.lectures?.reduce((lSum, l) => lSum + (l.notes?.length || 0), 0) || 0),
          0
        );

        targetCourse = {
          ...course,
          totalSheets: calcSheets,
          modules: updatedModules,
        };
        return targetCourse;
      });

      try {
        localStorage.setItem('adommo_courses', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_courses_updated'));
      } catch {}

      if (targetCourse) {
        fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetCourse),
        }).catch((err) => console.log('Course sheet sync error:', err));
      }

      return updated;
    });
    showToast('📄 পিডিএফ লেকচার/প্র্যাকটিস শিট সফলভাবে যুক্ত হয়েছে!');
  };

  const deleteResourceSheet = (courseId: string, sheetId: string) => {
    setCourses((prevCourses) => {
      let targetCourse: Course | undefined;
      const updated = prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedModules = course.modules.map((mod) => {
          const updatedLectures = mod.lectures.map((lec) => {
            const filteredNotes = (lec.notes || []).filter((n) => n.id !== sheetId);
            return { ...lec, notes: filteredNotes };
          });
          return { ...mod, lectures: updatedLectures };
        });

        const calcSheets = updatedModules.reduce(
          (sum, m) => sum + (m.lectures?.reduce((lSum, l) => lSum + (l.notes?.length || 0), 0) || 0),
          0
        );

        targetCourse = {
          ...course,
          totalSheets: calcSheets,
          modules: updatedModules,
        };
        return targetCourse;
      });

      try {
        localStorage.setItem('adommo_courses', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_courses_updated'));
      } catch {}

      if (targetCourse) {
        fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetCourse),
        }).catch((err) => console.log('Course sheet delete sync error:', err));
      }

      return updated;
    });
    showToast('🗑️ শিট সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const addExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      ...examData,
    };
    setExams((prev) => {
      const updated = [newExam, ...prev];
      try {
        localStorage.setItem('adommo_exams', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Persist new exam to DB
    fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExam),
    }).catch((err) => console.log('Exam persist completed', err));

    showToast('📝 পরীক্ষা সফলভাবে তৈরি হয়েছে!');
  };

  const updateExam = (examId: string, updatedData: Partial<Exam>) => {
    setExams((prev) => {
      const updated = prev.map((ex) => (ex.id === examId ? { ...ex, ...updatedData } : ex));
      try {
        localStorage.setItem('adommo_exams', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Persist updated exam to DB
    fetch('/api/exams', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: examId, ...updatedData }),
    }).catch((err) => console.log('Exam update completed', err));

    showToast('⚙️ পরীক্ষার সেটিংস সফলভাবে আপডেট হয়েছে!');
  };

  const deleteExam = (examId: string) => {
    setExams((prev) => {
      const updated = prev.filter((ex) => ex.id !== examId);
      try {
        localStorage.setItem('adommo_exams', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Delete exam from DB
    fetch(`/api/exams?id=${examId}`, {
      method: 'DELETE',
    }).catch((err) => console.log('Exam delete completed', err));

    showToast('🗑️ পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const addQuestionBank = (itemData: Omit<QuestionBankItem, 'id' | 'downloadCount' | 'createdAt'>) => {
    const newItem: QuestionBankItem = {
      id: `qb_${Date.now()}`,
      ...itemData,
      downloadCount: 0,
      createdAt: 'এইমাত্র',
    };
    setQuestionBanks((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('adommo_qbanks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch('/api/question-banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch((err) => console.log('Question bank persist error:', err));
    showToast('📚 নতুন প্রশ্নব্যাংক সফলভাবে যুক্ত হয়েছে!');
  };

  const updateQuestionBank = (id: string, updatedData: Partial<QuestionBankItem>) => {
    setQuestionBanks((prev) => {
      const updated = prev.map((qb) => (qb.id === id ? { ...qb, ...updatedData } : qb));
      try {
        localStorage.setItem('adommo_qbanks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch('/api/question-banks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updatedData }),
    }).catch((err) => console.log('Question bank update error:', err));
    showToast('📝 প্রশ্নব্যাংক সফলভাবে আপডেট হয়েছে!');
  };

  const deleteQuestionBank = (id: string) => {
    setQuestionBanks((prev) => {
      const updated = prev.filter((qb) => qb.id !== id);
      try {
        localStorage.setItem('adommo_qbanks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch(`/api/question-banks?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.log('Question bank delete error:', err));
    showToast('🗑️ প্রশ্নব্যাংক সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const addCoupon = (couponData: Omit<CouponItem, 'id' | 'createdAt' | 'usedCount'>) => {
    const newCoupon: CouponItem = {
      id: `cpn_${Date.now()}`,
      ...couponData,
      code: couponData.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
      isActive: couponData.isActive !== undefined ? couponData.isActive : true,
    };
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev.filter((c) => c.code !== newCoupon.code)];
      try {
        localStorage.setItem('adommo_coupons', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon),
    }).catch((err) => console.log('Coupon persist error:', err));
    showToast(`✅ কুপন কোড "${newCoupon.code}" সফলভাবে তৈরি হয়েছে!`);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem('adommo_coupons', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch(`/api/admin/coupons?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.log('Coupon delete error:', err));
    showToast('🗑️ কুপন সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const verifyCoupon = (
    codeRaw: string, 
    course: Course
  ): { valid: boolean; discountAmount: number; message: string; coupon?: CouponItem } => {
    const code = (codeRaw || '').trim().toUpperCase();
    if (!code) {
      return { valid: false, discountAmount: 0, message: 'অনুগ্রহ করে কুপন কোড লিখুন।' };
    }

    // 1. Check Course-specific Teacher Coupon
    if (course.couponCode && course.couponCode.trim().toUpperCase() === code) {
      const discount = Math.min(course.couponDiscount || 200, course.offerPrice);
      return {
        valid: true,
        discountAmount: discount,
        message: `🎉 কোর্স কুপন "${code}" প্রযোজ্য হয়েছে! ৳${discount} ছাড় পেয়েছেন।`,
      };
    }

    // 2. Check Admin / Global DB Coupons
    const found = coupons.find((c) => (c.code || '').trim().toUpperCase() === code);
    if (!found) {
      return { valid: false, discountAmount: 0, message: '⚠️ কুপন কোডটি সঠিক নয়।' };
    }

    if (!found.isActive) {
      return { valid: false, discountAmount: 0, message: '⚠️ এই কুপনটি বর্তমানে নিষ্ক্রিয় রয়েছে।' };
    }

    if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: '⚠️ এই কুপনটির মেয়াদ উত্তীর্ণ হয়ে গেছে।' };
    }

    if (found.applicableCourse && found.applicableCourse !== 'all' && found.applicableCourse !== course.id) {
      return { valid: false, discountAmount: 0, message: '⚠️ এই কুপনটি শুধুমাত্র নির্দিষ্ট অন্য একটি কোর্সের জন্য প্রযোজ্য।' };
    }

    if (found.usageLimit && (found.usedCount || 0) >= found.usageLimit) {
      return { valid: false, discountAmount: 0, message: '⚠️ এই কুপনটির ব্যবহারের সীমা শেষ হয়ে গেছে।' };
    }

    let discountAmount = 0;
    if (found.discountType === 'percentage') {
      discountAmount = Math.round(course.offerPrice * (found.discountValue / 100));
    } else {
      discountAmount = found.discountValue;
    }
    discountAmount = Math.min(discountAmount, course.offerPrice);

    return {
      valid: true,
      discountAmount,
      message: `🎉 কুপন "${found.code}" সফলভাবে যুক্ত হয়েছে! ৳${discountAmount} ছাড় পেয়েছেন।`,
      coupon: found,
    };
  };

  const submitDetailedExam = (submissionData: Omit<DetailedExamSubmission, 'id' | 'submittedAt' | 'rank'>): DetailedExamSubmission => {
    const targetExam = exams.find((e) => e.id === submissionData.examId);
    const isSubjective = targetExam?.examType === 'written' || targetExam?.examType === 'combined' || (targetExam?.creativeQuestions && targetExam.creativeQuestions.length > 0);
    const isPendingLater = targetExam?.resultPublishType === 'later' || isSubjective;
    const status = isPendingLater ? 'pending_evaluation' : 'published';

    // Real rank calculated from published scores of this exam
    const existingSameExam = detailedSubmissions.filter((s) => s.examId === submissionData.examId && s.status === 'published');
    const higherScores = existingSameExam.filter((s) => s.score > submissionData.score).length;
    const calculatedRank = higherScores + 1;

    const newSubmission: DetailedExamSubmission = {
      id: `sub_${Date.now()}`,
      ...submissionData,
      status,
      submittedAt: 'এইমাত্র',
      rank: calculatedRank,
    };

    setDetailedSubmissions((prev) => {
      const updated = [newSubmission, ...prev.filter((s) => s.id !== newSubmission.id)];
      try {
        localStorage.setItem('adommo_detailed_subs', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage quota limit reached, trimming older entries', err);
        try {
          const trimmed = updated.slice(0, 15);
          localStorage.setItem('adommo_detailed_subs', JSON.stringify(trimmed));
        } catch {}
      }
      try {
        window.dispatchEvent(new Event('adommo_subs_updated'));
      } catch {}
      return updated;
    });

    setExamSubmissions((prev) => ({
      ...prev,
      [newSubmission.examId]: {
        examId: newSubmission.examId,
        studentId: newSubmission.studentId,
        score: newSubmission.score,
        correctAnswers: newSubmission.correctAnswers || 0,
        wrongAnswers: newSubmission.wrongAnswers || 0,
        unanswered: 0,
        selectedAnswers: {},
        submittedAt: 'এইমাত্র',
        rank: calculatedRank,
      },
    }));

    if (status === 'published') {
      const newRankEntry: LeaderboardEntry = {
        rank: calculatedRank,
        studentName: newSubmission.studentName,
        college: newSubmission.studentCollege || 'শিক্ষার্থী',
        score: newSubmission.score,
        totalMarks: newSubmission.totalMarks,
        accuracy: Math.round(((newSubmission.correctAnswers || 1) / Math.max(1, (newSubmission.correctAnswers || 1) + (newSubmission.wrongAnswers || 0))) * 100),
        timeTakenMinutes: '14:20',
        submittedAt: 'এইমাত্র',
      };
      setLeaderboard((prev) => [newRankEntry, ...prev]);
    }

    return newSubmission;
  };

  const evaluateSubmission = (
    submissionId: string, 
    cqMarksAwarded: number, 
    feedbackNotes?: string,
    detailedPartMarks?: Record<string, Record<string, number>>,
    publishImmediately: boolean = false
  ) => {
    setDetailedSubmissions((prev) => {
      const updated = prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        const newTotalScore = (sub.mcqScore || 0) + cqMarksAwarded;
        return {
          ...sub,
          cqScore: cqMarksAwarded,
          score: newTotalScore,
          isPassed: newTotalScore >= (sub.totalMarks * 0.4),
          status: publishImmediately ? ('published' as const) : ('evaluated' as const),
          teacherFeedback: feedbackNotes,
          partMarks: detailedPartMarks,
          evaluatedAt: 'এইমাত্র'
        };
      });
      try {
        localStorage.setItem('adommo_detailed_subs', JSON.stringify(updated));
      } catch (err) {
        try {
          const trimmed = updated.slice(0, 15);
          localStorage.setItem('adommo_detailed_subs', JSON.stringify(trimmed));
        } catch {}
      }
      try {
        window.dispatchEvent(new Event('adommo_subs_updated'));
      } catch {}
      return updated;
    });

    fetch('/api/exams/submit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        cqMarksAwarded,
        teacherFeedback: feedbackNotes,
        partMarks: detailedPartMarks,
        publishImmediately,
      }),
    }).catch((err) => console.log('Evaluation sync error:', err));

    if (publishImmediately) {
      showToast('✅ খাতা মূল্যায়ন সম্পন্ন ও এই শিক্ষার্থীর ফলাফল প্রকাশিত হয়েছে!');
    } else {
      showToast('💾 খাতার মূল্যায়ন সংরক্ষিত হয়েছে! সকল খাতা দেখা শেষে একসাথে ফলাফল প্রকাশ করতে পারবেন।');
    }
  };

  const publishBatchResults = (examId?: string): number => {
    let countPublished = 0;
    fetch('/api/exams/submit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'publish_batch',
        examId,
      }),
    }).catch((err) => console.log('Batch publish sync error:', err));
    setDetailedSubmissions((prev) => {
      const isAll = !examId || examId === 'all';
      const targets = prev.filter((s) => {
        if (!isAll && s.examId !== examId) return false;
        return s.status === 'evaluated' || s.status === 'pending_evaluation';
      });

      if (targets.length === 0) return prev;
      countPublished = targets.length;

      // Mark targets as published
      const updatedWithPublished = prev.map((s) => {
        if (!isAll && s.examId !== examId) return s;
        if (s.status === 'evaluated' || s.status === 'pending_evaluation') {
          return {
            ...s,
            status: 'published' as const,
          };
        }
        return s;
      });

      // Calculate ranks for each exam
      const finalRanksUpdated = updatedWithPublished.map((s) => {
        if (s.status !== 'published') return s;
        const examSubs = updatedWithPublished
          .filter((sub) => sub.examId === s.examId && sub.status === 'published')
          .sort((a, b) => b.score - a.score);
        const rankIndex = examSubs.findIndex((sub) => sub.id === s.id);
        return {
          ...s,
          rank: rankIndex >= 0 ? rankIndex + 1 : 1,
        };
      });

      try {
        localStorage.setItem('adommo_detailed_subs', JSON.stringify(finalRanksUpdated));
      } catch (err) {
        try {
          const trimmed = finalRanksUpdated.slice(0, 15);
          localStorage.setItem('adommo_detailed_subs', JSON.stringify(trimmed));
        } catch {}
      }
      try {
        window.dispatchEvent(new Event('adommo_subs_updated'));
      } catch {}

      // Update leaderboard entries
      const topPublished = finalRanksUpdated
        .filter((s) => s.status === 'published')
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((s) => ({
          rank: s.rank || 1,
          studentName: s.studentName,
          college: s.studentCollege || 'শিক্ষার্থী',
          score: s.score,
          totalMarks: s.totalMarks,
          accuracy: Math.round(((s.correctAnswers || 1) / Math.max(1, (s.correctAnswers || 1) + (s.wrongAnswers || 0))) * 100),
          timeTakenMinutes: '14:20',
          submittedAt: 'এইমাত্র',
        }));
      setLeaderboard(topPublished);

      return finalRanksUpdated;
    });

    if (countPublished > 0) {
      showToast(`📢 ${countPublished} জন শিক্ষার্থীর চূড়ান্ত ফলাফল ও মেধা তালিকা একসাথে প্রকাশ করা হয়েছে!`);
    } else {
      showToast('কোনো অপ্রকাশিত মূল্যায়িত খাতা পাওয়া যায়নি।');
    }

    return countPublished;
  };

  const scheduleLiveClass = (classData: Omit<LiveClass, 'id' | 'createdAt'>): LiveClass => {
    const newClass: LiveClass = {
      ...classData,
      id: `live_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLiveClasses((prev) => {
      const updated = [newClass, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('adommo_live_classes', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_live_updated'));
      }
      return updated;
    });
    fetch('/api/live-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass),
    }).catch((err) => console.log('Live class persist error:', err));
    showToast(`🔴 লাইভ ক্লাস শিডিউল করা হয়েছে: "${newClass.title}"`);
    return newClass;
  };

  const updateLiveClass = (id: string, updatedData: Partial<LiveClass>) => {
    setLiveClasses((prev) => {
      const updated = prev.map((lc) => (lc.id === id ? { ...lc, ...updatedData } : lc));
      if (typeof window !== 'undefined') {
        localStorage.setItem('adommo_live_classes', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_live_updated'));
      }
      return updated;
    });
    fetch('/api/live-classes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updatedData }),
    }).catch((err) => console.log('Live class update error:', err));
    showToast('লাইভ ক্লাসের তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  const deleteLiveClass = (id: string) => {
    setLiveClasses((prev) => {
      const updated = prev.filter((lc) => lc.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('adommo_live_classes', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_live_updated'));
      }
      return updated;
    });
    fetch(`/api/live-classes?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.log('Live class delete error:', err));
    showToast('লাইভ ক্লাসটি তালিকা থেকে মুছে ফেলা হয়েছে।');
  };

  const startLiveClass = (id: string) => {
    setLiveClasses((prev) => {
      const updated = prev.map((lc) => (lc.id === id ? { ...lc, status: 'live' as const } : lc));
      if (typeof window !== 'undefined') {
        localStorage.setItem('adommo_live_classes', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_live_updated'));
      }
      return updated;
    });
    fetch('/api/live-classes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'live' }),
    }).catch((err) => console.log('Live class start error:', err));
    showToast('🔴 লাইভ ক্লাস শুরু হয়েছে! সকল শিক্ষার্থীকে লাইভ অ্যালার্ট পাঠানো হয়েছে।');
  };

  const endLiveClass = (id: string, recordingUrl?: string, recordingNotesPdf?: string) => {
    setLiveClasses((prev) => {
      const updated = prev.map((lc) => (lc.id === id ? { 
        ...lc, 
        status: 'completed' as const,
        recordingUrl: recordingUrl || lc.recordingUrl,
        recordingNotesPdf: recordingNotesPdf || lc.recordingNotesPdf
      } : lc));
      if (typeof window !== 'undefined') {
        localStorage.setItem('adommo_live_classes', JSON.stringify(updated));
        window.dispatchEvent(new Event('adommo_live_updated'));
      }
      return updated;
    });
    fetch('/api/live-classes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: 'completed',
        recordingUrl,
        recordingNotesPdf,
      }),
    }).catch((err) => console.log('Live class end error:', err));
    showToast('⏹️ লাইভ ক্লাস সফলভাবে সমাপ্ত হয়েছে এবং আর্কাইভে সংরক্ষিত হয়েছে!');
  };

  const submitExam = (examId: string, answers: Record<string, number>): ExamSubmission => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) throw new Error('Exam not found');

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    exam.questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected === undefined || selected === null) {
        unanswered++;
      } else if (selected === q.correctOption) {
        correct++;
      } else {
        wrong++;
      }
    });

    const rawScore = correct * (exam.totalMarks / (exam.questions.length || 1)) - wrong * exam.negativeMarkPerWrong;
    const finalScore = Math.max(0, Number(rawScore.toFixed(2)));

    const submission: ExamSubmission = {
      examId,
      studentId: currentUser.id,
      score: finalScore,
      correctAnswers: correct,
      wrongAnswers: wrong,
      unanswered,
      selectedAnswers: answers,
      submittedAt: 'এইমাত্র',
      rank: Math.floor(Math.random() * 5) + 1,
    };

    setExamSubmissions((prev) => ({ ...prev, [examId]: submission }));

    // Persist exam submission and rank to live database
    fetch('/api/exams/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        college: currentUser.college,
        answers,
      }),
    }).catch((err) => console.log('Exam submit sync completed', err));

    // Add to leaderboard
    const newRankEntry: LeaderboardEntry = {
      rank: 1,
      studentName: currentUser.name,
      college: currentUser.college || 'ঢাকা কলেজ',
      score: finalScore,
      totalMarks: exam.totalMarks,
      accuracy: Math.round((correct / (correct + wrong || 1)) * 100),
      timeTakenMinutes: '09:40',
      submittedAt: 'এইমাত্র',
    };
    setLeaderboard([newRankEntry, ...leaderboard]);

    return submission;
  };

  // ==================== NOTIFICATIONS LOGIC ====================
  const isNotificationForUser = (n: NotificationItem): boolean => {
    // 1. Specific Target User ID check
    if (n.targetUserId) {
      return currentUser && currentUser.id === n.targetUserId;
    }
    if (n.targetUserIds && n.targetUserIds.length > 0) {
      return currentUser && n.targetUserIds.includes(currentUser.id);
    }

    // 2. Specific Target Role check
    if (n.targetRole) {
      if (n.targetRole === 'all') return true;
      if (n.targetRole === 'admin') {
        return currentRole === 'admin' || currentUser?.role === 'admin';
      }
      if (n.targetRole === 'teacher') {
        return currentRole === 'teacher' || currentUser?.role === 'teacher';
      }
      if (n.targetRole === 'student') {
        return currentRole === 'student' || (!currentUser || currentUser.role === 'student');
      }
    }

    // 3. Fallback heuristic for legacy KYC notifications lacking explicit targetRole
    if (
      n.title?.includes('KYC') || 
      n.title?.includes('শিক্ষক ভেরিফিকেশন') || 
      n.message?.includes('শিক্ষক হিসেবে KYC') ||
      n.message?.includes('শিক্ষক KYC আবেদন') ||
      n.actionUrl === '/admin'
    ) {
      if (n.title?.includes('নতুন শিক্ষক KYC') || n.actionUrl === '/admin') {
        return currentRole === 'admin' || currentUser?.role === 'admin';
      }
      return currentRole === 'teacher' || currentUser?.role === 'teacher';
    }

    // 4. Course specific audience check
    if (n.targetAudience === 'course' && n.targetCourseId) {
      if (currentRole === 'admin' || currentUser?.role === 'admin') return true;
      if (currentRole === 'teacher' || currentUser?.role === 'teacher') return true;
      return enrollments.some((e) => e.courseId === n.targetCourseId && e.status === 'approved');
    }

    // 5. Default public notice: visible to all
    return true;
  };

  const unreadNotifCount = (!currentUser || !currentUser.id || currentUser.id === 'usr_guest')
    ? 0
    : notifications.filter((n) => isNotificationForUser(n) && !n.readBy?.includes(currentUser.id)).length;

  const saveNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem('adommo_notifications', JSON.stringify(newNotifs));
      window.dispatchEvent(new Event('adommo_notifications_updated'));
    } catch (e) {
      console.error('Failed to persist notifications', e);
    }
  };

  const sendNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'readBy' | 'viewCount'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif_${Date.now()}`,
      createdAt: 'এইমাত্র',
      readBy: [],
      viewCount: 1,
    };
    const updated = [newNotif, ...notifications];
    // Keep pinned at the top
    updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    saveNotifications(updated);
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif),
    }).catch((err) => console.log('Notification persist error:', err));
    showToast(`📢 নতুন নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!`);
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => {
      if (n.id === id) {
        const readBy = new Set(n.readBy || []);
        readBy.add(currentUser.id);
        return { ...n, readBy: Array.from(readBy) };
      }
      return n;
    });
    saveNotifications(updated);
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'mark_read', userId: currentUser.id }),
    }).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => {
      if (isNotificationForUser(n)) {
        const readBy = new Set(n.readBy || []);
        readBy.add(currentUser.id);
        return { ...n, readBy: Array.from(readBy) };
      }
      return n;
    });
    saveNotifications(updated);
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read', userId: currentUser.id }),
    }).catch(() => {});
    showToast('✓ সকল নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে');
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    fetch(`/api/notifications?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.log('Notification delete error:', err));
    showToast('🗑️ নোটিফিকেশন মুছে ফেলা হয়েছে');
  };

  const togglePinNotification = (id: string) => {
    const updated = notifications.map((n) => 
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    saveNotifications(updated);
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'toggle_pin' }),
    }).catch(() => {});
    showToast('📌 নোটিফিকেশন পিন স্ট্যাটাস পরিবর্তন হয়েছে');
  };

  const saveConversations = (newConvs: ConversationThread[]) => {
    setConversations(newConvs);
    try {
      localStorage.setItem('adommo_conversations', JSON.stringify(newConvs));
      window.dispatchEvent(new Event('adommo_conversations_updated'));
    } catch {}
  };

  const unreadTeacherMsgCount = currentRole === 'teacher'
    ? conversations.reduce((acc, c) => acc + (c.unreadCountTeacher || 0), 0)
    : 0;
  const unreadStudentMsgCount = (!currentUser || !currentUser.id || currentUser.id === 'usr_guest')
    ? 0
    : conversations.reduce((acc, c) => acc + (c.unreadCountStudent || 0), 0);

  const sendChatMessage = (
    threadId: string,
    text: string,
    imageUrl?: string,
    senderRole: 'teacher' | 'student' | 'admin' = 'teacher',
    markSolved?: boolean
  ) => {
    if (!text.trim() && !imageUrl) return;

    const realSenderName = currentUser?.name?.trim() || (senderRole === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী');
    const realSenderId = currentUser?.id || (senderRole === 'teacher' ? 'teacher_main' : 'student_main');
    const realAvatar = currentUser?.avatar || (senderRole === 'teacher' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' 
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: realSenderId,
      senderName: realSenderName,
      senderRole,
      senderAvatar: realAvatar,
      text: text.trim(),
      imageUrl,
      createdAt: 'এখনই',
      isRead: false,
    };

    let threadExists = false;
    let targetThreadMeta: any = undefined;

    const updated = conversations.map((c) => {
      if (c.id === threadId) {
        threadExists = true;
        targetThreadMeta = c;
        const nextStatus = markSolved ? 'solved' : c.status;
        return {
          ...c,
          status: nextStatus,
          lastMessageText: text.trim() || 'ছবি সংযুক্ত করা হয়েছে',
          lastMessageTime: 'এখনই',
          unreadCountTeacher: senderRole === 'student' ? (c.unreadCountTeacher || 0) + 1 : (senderRole === 'teacher' ? 0 : c.unreadCountTeacher),
          unreadCountStudent: (senderRole === 'teacher' || senderRole === 'admin') ? (c.unreadCountStudent || 0) + 1 : (senderRole === 'student' ? 0 : c.unreadCountStudent),
          messages: [...(c.messages || []), newMsg],
        };
      }
      return c;
    });

    if (!threadExists) {
      if (threadId.startsWith('thread_batch_')) {
        const courseId = threadId.replace('thread_batch_', '');
        const courseObj = courses.find(c => c.id === courseId);
        const title = courseObj?.title || 'অফিশিয়াল ব্যাচমেট ফোরাম';
        const newGroup: ConversationThread = {
          id: threadId,
          type: 'batch_group',
          studentName: `${title} - অফিশিয়াল ব্যাচমেট ফোরাম`,
          courseId,
          courseTitle: title,
          status: 'open',
          priority: 'normal',
          lastMessageText: text.trim() || 'বার্তা পাঠানো হয়েছে',
          lastMessageTime: 'এখনই',
          unreadCountTeacher: senderRole === 'student' ? 1 : 0,
          unreadCountStudent: senderRole === 'teacher' ? 1 : 0,
          messages: [newMsg],
        };
        targetThreadMeta = newGroup;
        updated.unshift(newGroup);
      }
    }

    saveConversations(updated);

    // Persist chat message to live DB
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_message',
        threadId,
        message: newMsg,
        markSolved,
        threadMeta: targetThreadMeta ? {
          studentId: targetThreadMeta.studentId,
          studentName: targetThreadMeta.studentName,
          studentCollege: targetThreadMeta.studentCollege,
          studentAvatar: targetThreadMeta.studentAvatar,
          courseId: targetThreadMeta.courseId,
          courseTitle: targetThreadMeta.courseTitle,
          teacherId: targetThreadMeta.teacherId,
          teacherName: targetThreadMeta.teacherName,
          teacherAvatar: targetThreadMeta.teacherAvatar,
          ticketNumber: targetThreadMeta.ticketNumber,
        } : undefined
      }),
    }).catch((err) => console.log('Message sync completed', err));

    if (markSolved) {
      showToast('✅ সমাধান ও উত্তর সফলভাবে পাঠানো হয়েছে!');
    } else {
      showToast('💬 বার্তা পাঠানো হয়েছে');
    }
  };

  const createDoubtThread = (data: {
    courseId: string;
    courseTitle: string;
    subject: string;
    chapter: string;
    topic?: string;
    question: string;
    imageUrl?: string;
  }): string => {
    const threadId = `thread_doubt_${Date.now()}`;
    const newThread: ConversationThread = {
      id: threadId,
      type: 'doubt',
      studentId: currentUser.id,
      studentName: currentUser.name || 'শিক্ষার্থী',
      studentCollege: currentUser.college || 'অনবোর্ডেড শিক্ষার্থী',
      studentAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      studentRoll: '#STD-' + Math.floor(1000 + Math.random() * 9000),
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      subject: data.subject,
      chapter: data.chapter,
      topic: data.topic || 'সাধারণ প্রশ্ন ও ডাউট',
      status: 'pending',
      priority: 'high',
      lastMessageText: data.question,
      lastMessageTime: 'এখনই',
      unreadCountTeacher: 1,
      unreadCountStudent: 0,
      doubtImageUrl: data.imageUrl,
      messages: [
        {
          id: `msg_d_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name || 'শিক্ষার্থী',
          senderRole: 'student',
          senderAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          text: data.question,
          imageUrl: data.imageUrl,
          createdAt: 'এখনই',
          isRead: false,
        }
      ]
    };

    const updated = [newThread, ...conversations];
    saveConversations(updated);

    // Persist new doubt thread to live DB
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_thread',
        newThread,
      }),
    }).catch((err) => console.log('Thread sync completed', err));

    showToast('✅ আপনার পড়ার প্রশ্নটি টিচারের কাছে সফলভাবে পাঠানো হয়েছে!');
    return threadId;
  };

  const markThreadAsRead = (threadId: string, role: 'teacher' | 'student') => {
    const updated = conversations.map((c) => {
      if (c.id === threadId) {
        return {
          ...c,
          unreadCountTeacher: role === 'teacher' ? 0 : c.unreadCountTeacher,
          unreadCountStudent: role === 'student' ? 0 : c.unreadCountStudent,
          messages: c.messages.map((m) => ({ ...m, isRead: true })),
        };
      }
      return c;
    });
    saveConversations(updated);

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', threadId, role }),
    }).catch(() => {});
  };

  const toggleDoubtStatus = (threadId: string) => {
    const updated = conversations.map((c) => {
      if (c.id === threadId) {
        const nextStatus: 'pending' | 'solved' = c.status === 'solved' ? 'pending' : 'solved';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    saveConversations(updated);

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_status', threadId }),
    }).catch(() => {});

    showToast('🔄 ডাউট স্ট্যাটাস আপডেট করা হয়েছে');
  };

  const getOrCreateBatchGroup = (courseId: string, courseTitle?: string): ConversationThread => {
    const existing = conversations.find(c => c.type === 'batch_group' && c.courseId === courseId);
    if (existing) return existing;

    const courseObj = courses.find(c => c.id === courseId);
    const title = courseTitle || (courseObj ? courseObj.title : 'অফিশিয়াল ব্যাচমেট ফোরাম');
    const newGroup: ConversationThread = {
      id: `thread_batch_${courseId}`,
      type: 'batch_group',
      studentName: `${title} - অফিশিয়াল ব্যাচমেট ফোরাম`,
      courseId: courseId,
      courseTitle: title,
      status: 'open',
      priority: 'normal',
      lastMessageText: `স্বাগতম! ${title}-এর ব্যাচমেটদের আলোচনার অফিশিয়াল ফোরাম।`,
      lastMessageTime: 'এখনই',
      unreadCountTeacher: 0,
      unreadCountStudent: 0,
      messages: [
        {
          id: `msg_bg_auto_${courseId}`,
          senderId: 'teacher_main',
          senderName: `${courseObj?.instructor?.name || 'মেন্টর'} (ইনস্ট্রাক্টর)`,
          senderRole: 'teacher',
          senderAvatar: courseObj?.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          text: `স্বাগতম প্রিয় শিক্ষার্থীরা! "${title}" কোর্সের সকল ব্যাচমেটদের পারস্পরিক পড়াশোনা ও সহযোগিতার জন্য এই গ্রুপ তৈরি করা হয়েছে।`,
          createdAt: 'এখনই',
          isRead: true,
        }
      ]
    };
    return newGroup;
  };

  const getOrCreateDirectThread = (
    teacherId: string,
    teacherName: string,
    teacherAvatar?: string,
    courseId?: string,
    courseTitle?: string
  ): string => {
    const studentId = currentUser?.id || 'usr_guest';
    const threadId = `thread_direct_${studentId}_${teacherId}`;
    const existing = conversations.find(c => c.id === threadId || (c.type === 'direct' && c.studentId === studentId && c.teacherId === teacherId));
    if (existing) return existing.id;

    const newThread: ConversationThread = {
      id: threadId,
      type: 'direct',
      studentId,
      studentName: currentUser?.name || 'শিক্ষার্থী',
      studentCollege: currentUser?.college || 'অনবোর্ডেড শিক্ষার্থী',
      studentAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      studentRoll: '#STD-' + Math.floor(1000 + Math.random() * 9000),
      teacherId,
      teacherName,
      teacherAvatar: teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      courseId,
      courseTitle,
      status: 'open',
      priority: 'normal',
      lastMessageText: 'চ্যাট শুরু করা হয়েছে',
      lastMessageTime: 'এখনই',
      unreadCountTeacher: 0,
      unreadCountStudent: 0,
      messages: [
        {
          id: `msg_dir_init_${Date.now()}`,
          senderId: teacherId,
          senderName: teacherName,
          senderRole: 'teacher',
          senderAvatar: teacherAvatar,
          text: `আসসালামু আলাইকুম! আমি ${teacherName}। আপনার কোর্স বা অ্যাকাডেমিক পড়াশোনা সংক্রান্ত যেকোনো জিজ্ঞাসা থাকলে নির্দ্বিধায় এখানে লিখতে পারেন।`,
          createdAt: 'এখনই',
          isRead: true,
        }
      ]
    };

    const updated = [newThread, ...conversations];
    saveConversations(updated);

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_thread', newThread }),
    }).catch(() => {});

    return threadId;
  };

  const createSupportTicket = (category: string, message: string, userPhone?: string): string => {
    const ticketId = `thread_support_${Date.now()}`;
    const ticketNum = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSupportThread: ConversationThread = {
      id: ticketId,
      type: 'support',
      studentId: currentUser?.id || 'usr_guest',
      studentName: currentUser?.name || 'শিক্ষার্থী',
      studentCollege: currentUser?.college || 'অনবোর্ডেড শিক্ষার্থী',
      studentAvatar: currentUser?.avatar,
      ticketNumber: ticketNum,
      subject: category,
      status: 'open',
      priority: 'high',
      lastMessageText: message,
      lastMessageTime: 'এখনই',
      unreadCountTeacher: 1,
      unreadCountStudent: 0,
      messages: [
        {
          id: `msg_sup_${Date.now()}`,
          senderId: currentUser?.id || 'usr_guest',
          senderName: currentUser?.name || 'শিক্ষার্থী',
          senderRole: 'student',
          senderAvatar: currentUser?.avatar,
          text: `[বিষয়: ${category}] ${message}${userPhone ? `\nযোগাযোগ ফোন: ${userPhone}` : ''}`,
          createdAt: 'এখনই',
          isRead: false,
        }
      ]
    };

    const updated = [newSupportThread, ...conversations];
    saveConversations(updated);

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_thread', newThread: newSupportThread }),
    }).catch(() => {});

    showToast('🎫 আপনার সাপোর্ট টিকেট সফলভাবে তৈরি হয়েছে!');
    return ticketId;
  };

  const submitTeacherKyc = (data: Omit<TeacherKycData, 'applicationId' | 'submittedAt' | 'status'>): string => {
    const applicationId = `KYC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newKyc: TeacherKycData = {
      ...data,
      applicationId,
      submittedAt: 'এইমাত্র',
      status: 'pending',
    };

    const updatedList = [newKyc, ...teacherKycList.filter(k => k.teacherId !== data.teacherId && k.applicationId !== applicationId)];
    saveTeacherKycList(updatedList);

    // Update current user
    const updatedUser: User = {
      ...currentUser,
      kycStatus: 'pending',
      kycData: newKyc,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('adommo_user', JSON.stringify(updatedUser));
    } catch {}

    // Persist to Live Database via API
    fetch('/api/teacher/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKyc),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData && resData.kyc) {
          saveTeacherKycList([
            resData.kyc,
            ...teacherKycList.filter((k) => k.applicationId !== resData.kyc.applicationId),
          ]);
        }
      })
      .catch((err) => console.log('Teacher KYC sync completed', err));

    // Send notification to Admin and Teacher
    sendNotification({
      title: 'নতুন শিক্ষক KYC ভেরিফিকেশন আবেদন',
      message: `${data.fullName} (${data.institutionName}) শিক্ষক হিসেবে KYC যাচাইয়ের জন্য আবেদন জমা দিয়েছেন। আবেদন আইডি: #${applicationId}`,
      category: 'general',
      priority: 'high',
      targetAudience: 'role',
      targetRole: 'admin',
      senderName: 'সিস্টেম ভেরিফিকেশন',
      actionLabel: 'KYC যাচাই করুন',
      actionUrl: '/admin',
    });

    sendNotification({
      title: 'KYC আবেদন সফলভাবে জমা হয়েছে',
      message: `আপনার শিক্ষক KYC আবেদন #${applicationId} সুপার অ্যাডমিনের নিকট সফলভাবে জমা হয়েছে। যাচাই শেষে অনুমোদিত হলে ড্যাশবোর্ড সক্রিয় হবে।`,
      category: 'general',
      priority: 'normal',
      targetAudience: 'user',
      targetRole: 'teacher',
      targetUserId: currentUser.id,
      senderName: 'অদম্য ভেরিফিকেশন উইং',
    });

    showToast(`✅ KYC আবেদন #${applicationId} সফলভাবে জমা হয়েছে! অ্যাডমিন পর্যালোচনায় রয়েছে।`);
    return applicationId;
  };

  const approveTeacherKyc = (applicationId: string, adminNotes?: string) => {
    const target = teacherKycList.find(k => k.applicationId === applicationId);
    if (!target) return;

    const updatedList = teacherKycList.map(k => {
      if (k.applicationId === applicationId) {
        return {
          ...k,
          status: 'approved' as const,
          reviewedAt: 'এইমাত্র',
          adminNotes: adminNotes || 'সকল ডকুমেন্টস ও শিক্ষাগত সনদ নির্ভুল। শিক্ষক আইডি অনুমোদিত।',
        };
      }
      return k;
    });
    saveTeacherKycList(updatedList);

    // If current logged-in user matches this teacher, update their kycStatus
    if (currentUser.id === target.teacherId || currentUser.email === target.teacherEmail || currentUser.phone === target.teacherPhone) {
      const updatedUser: User = {
        ...currentUser,
        kycStatus: 'approved',
        kycData: { ...target, status: 'approved', adminNotes },
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('adommo_user', JSON.stringify(updatedUser));
      } catch {}
    }

    // Live API Call to Admin KYC endpoint
    fetch('/api/admin/kyc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId,
        action: 'approve',
        adminNotes: adminNotes || 'সকল ডকুমেন্টস ও শিক্ষাগত সনদ নির্ভুল। শিক্ষক আইডি অনুমোদিত।',
      }),
    }).catch((err) => console.log('Admin KYC approve completed', err));

    sendNotification({
      title: '🎉 শিক্ষক KYC ভেরিফিকেশন অনুমোদিত!',
      message: `অভিনন্দন ${target.fullName}! আপনার শিক্ষক ভেরিফিকেশন আবেদন #${applicationId} সুপার অ্যাডমিন কর্তৃক সফলভাবে অনুমোদিত হয়েছে। এখন আপনি শিক্ষক পোর্টালে সম্পূর্ণ এক্সেস পাবেন।`,
      category: 'general',
      priority: 'high',
      targetAudience: 'user',
      targetRole: 'teacher',
      targetUserId: target.teacherId,
      senderName: 'সুপার অ্যাডমিন',
      actionLabel: 'শিক্ষক স্টুডিওতে যান',
      actionUrl: '/teacher',
    });

    showToast(`🎉 শিক্ষক ${target.fullName}-এর KYC আবেদন #${applicationId} অনুমোদিত হয়েছে!`);
  };

  const rejectTeacherKyc = (applicationId: string, reason: string) => {
    const target = teacherKycList.find(k => k.applicationId === applicationId);
    if (!target) return;

    const updatedList = teacherKycList.map(k => {
      if (k.applicationId === applicationId) {
        return {
          ...k,
          status: 'rejected' as const,
          reviewedAt: 'এইমাত্র',
          rejectionReason: reason || 'প্রদত্ত তথ্যে অসামঞ্জস্য রয়েছে। সঠিক তথ্য দিয়ে পুনরায় আবেদন করুন।',
        };
      }
      return k;
    });
    saveTeacherKycList(updatedList);

    if (currentUser.id === target.teacherId || currentUser.email === target.teacherEmail || currentUser.phone === target.teacherPhone) {
      const updatedUser: User = {
        ...currentUser,
        kycStatus: 'rejected',
        kycData: { ...target, status: 'rejected', rejectionReason: reason },
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('adommo_user', JSON.stringify(updatedUser));
      } catch {}
    }

    // Live API Call to Admin KYC endpoint
    fetch('/api/admin/kyc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId,
        action: 'reject',
        rejectionReason: reason || 'প্রদত্ত তথ্যে অসামঞ্জস্য রয়েছে। সঠিক তথ্য দিয়ে পুনরায় আবেদন করুন।',
      }),
    }).catch((err) => console.log('Admin KYC reject completed', err));

    sendNotification({
      title: '⚠️ শিক্ষক KYC আবেদন বাতিল / সংশোধন প্রয়োজন',
      message: `প্রিয় ${target.fullName}, আপনার KYC আবেদন #${applicationId} গৃহীত হয়নি। কারণ: "${reason}"। অনুগ্রহ করে সঠিক তথ্য ও ডকুমেন্ট দিয়ে পুনরায় আবেদন করুন।`,
      category: 'urgent',
      priority: 'high',
      targetAudience: 'user',
      targetRole: 'teacher',
      targetUserId: target.teacherId,
      senderName: 'ভেরিফিকেশন টিম',
      actionLabel: 'পুনরায় আবেদন করুন',
      actionUrl: '/teacher',
    });

    showToast(`⚠️ শিক্ষক ${target.fullName}-এর KYC আবেদন প্রত্যাখ্যাত হয়েছে।`);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        currentUser,
        courses,
        exams,
        enrollments,
        leaderboard,
        examSubmissions,
        questionBanks,
        detailedSubmissions,
        isEnrolled,
        enrollInCourse,
        approveEnrollment,
        rejectEnrollment,
        refundEnrollment,
        deleteEnrollment,
        addCourse,
        updateCourse,
        deleteCourse,
        addLectureToCourse,
        updateLecture,
        deleteLecture,
        addResourceSheet,
        deleteResourceSheet,
        resetToDefaultData,
        addExam,
        updateExam,
        deleteExam,
        submitExam,
        submitDetailedExam,
        evaluateSubmission,
        publishBatchResults,
        liveClasses,
        scheduleLiveClass,
        updateLiveClass,
        deleteLiveClass,
        startLiveClass,
        endLiveClass,
        addQuestionBank,
        updateQuestionBank,
        deleteQuestionBank,
        coupons,
        addCoupon,
        deleteCoupon,
        verifyCoupon,
        loginUser,
        loginWithApi,
        registerUser,
        registerWithApi,
        logoutUser,
        toastMessage,
        showToast,
        notifications,
        unreadNotifCount,
        isNotificationForUser,
        sendNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        togglePinNotification,
        conversations,
        unreadTeacherMsgCount,
        unreadStudentMsgCount,
        sendChatMessage,
        createDoubtThread,
        markThreadAsRead,
        toggleDoubtStatus,
        getOrCreateBatchGroup,
        getOrCreateDirectThread,
        createSupportTicket,
        teacherKycList,
        submitTeacherKyc,
        approveTeacherKyc,
        rejectTeacherKyc,
        loadFullCourse,
      }}
    >
      {children}
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce bg-slate-900/95 text-white px-5 py-4 rounded-xl border border-blue-500/40 shadow-2xl shadow-blue-500/20 backdrop-blur-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
          <p className="text-sm font-medium leading-snug">{toastMessage}</p>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
