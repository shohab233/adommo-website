export type UserRole = 'student' | 'teacher' | 'admin';

export interface TeacherKycData {
  applicationId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  submittedAt: string;
  reviewedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;

  // Step 1: Legal & Personal Identity
  fullName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  idType: 'nid' | 'passport' | 'birth_cert';
  idNumber: string;
  presentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  payoutMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
  payoutAccountNumber: string;
  payoutBankName?: string;
  payoutBranchName?: string;
  payoutRoutingNumber?: string;

  // Step 2: Verification Documents & Certificates
  idFrontImage: string;
  idBackImage: string;
  academicCertificateImage: string;
  selfieWithIdImage: string;
  experienceCertificateImage?: string;
  demoVideoLink?: string;
  institutionName: string;
  degreeName: string;
  departmentName: string;
  passingYear: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  college?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  enrolledCourseIds: string[];
  kycStatus?: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  kycData?: TeacherKycData;
}

export interface ResourceNote {
  id: string;
  title: string;
  type: 'lecture_sheet' | 'practice_sheet' | 'handnote';
  size: string;
  pages: number;
  pdfUrl: string;
  downloadCount: number;
  lectureId?: string;
  lectureTitle?: string;
  uploadMethod?: 'link' | 'file';
  fileType?: string;
  fileSize?: string;
  url?: string;
}

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isFreePreview: boolean;
  date?: string;
  notes: ResourceNote[];
}

export interface CourseSection {
  id: string;
  title: string;
  type: 'subject' | 'module' | 'archive' | 'custom';
  isArchive?: boolean;
  order: number;
  parentArchiveId?: string; // If this subject belongs to an archive section
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lectures: Lecture[];
  parentSectionId?: string; // Can be a subject's id or direct archive/section id
  parentSectionTitle?: string;
  parentSectionType?: 'subject' | 'module' | 'archive' | 'custom';
  parentArchiveId?: string; // If this module belongs under an archive section
  isArchive?: boolean;
  unitType?: 'chapter' | 'topic' | 'lesson' | 'project';
}

export interface Question {
  id: string;
  text: string;
  subject?: string;
  equation?: string;
  options: string[];
  correctOption: number; // 0-indexed
  explanation: string;
}

export interface CreativeSubQuestion {
  part: 'ক' | 'খ' | 'গ' | 'ঘ';
  text: string;
  marks: number;
  sampleAnswer?: string;
}

export interface CreativeQuestion {
  id: string;
  title?: string;
  stem: string; // উদ্দীপক / দৃশ্যকল্প
  image?: string;
  subQuestions: CreativeSubQuestion[];
  totalMarks?: number; // usually 10
}

export interface Exam {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  examType?: 'mcq' | 'written' | 'combined'; // default: 'mcq'
  durationMinutes: number; // total duration
  mcqDurationMinutes?: number; // duration for MCQ part
  cqDurationMinutes?: number; // duration for CQ part
  totalMarks: number;
  mcqMarks?: number;
  cqMarks?: number;
  passMarks: number;
  cutMarks?: number;
  negativeMarkPerWrong: number;
  questionsCount: number;
  status: 'live' | 'upcoming' | 'completed' | 'scheduled';
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  questions: Question[];
  creativeQuestions?: CreativeQuestion[];
  resultPublishType?: 'instant' | 'later'; // 'instant': immediately show results, 'later': manual teacher evaluation
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: 'HSC' | 'Medical' | 'Agri Admission' | 'Engineering' | 'Free Tests';
  level: string;
  batch: string;
  coverImage: string;
  badge?: string;
  tagline: string;
  description: string;
  instructor: {
    name: string;
    designation: string;
    institution: string;
    avatar: string;
  };
  regularPrice: number;
  offerPrice: number;
  discountPercentage: number;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  totalLectures: number;
  totalExams: number;
  totalSheets: number;
  modules: CourseModule[];
  sections?: CourseSection[];
  features: string[];
  faq: { question: string; answer: string }[];
  trailerVideoUrl?: string;
  demoVideoUrl?: string;
  mentors?: { name: string; role: string; institution: string; avatar: string }[];
  relatedVideos?: { title: string; duration: string; tag: string; url?: string }[];
  routinePdfUrl?: string;
  routineTitle?: string;
  admissionDeadline?: string;
  discountEnd?: string;
  countdownDays?: number;
  countdownHours?: number;
  comboCourseIds?: string[];
  couponCode?: string;
  couponDiscount?: number;
  discountExpires?: string;
  isDraft?: boolean;
  isPublished?: boolean;
  isArchived?: boolean;
  instructorId?: string;
  teacherEmail?: string;
  teacherPhone?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Manual TrxID';
  trxId: string;
  senderPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  createdAt: string;
  enrollmentDate?: string; // YYYY-MM-DD for accurate daily filtering
}

export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  college: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenMinutes: string;
  submittedAt: string;
}

export interface ExamSubmission {
  examId: string;
  studentId: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  selectedAnswers: Record<string, number>;
  submittedAt: string;
  rank?: number;
}

export interface DetailedExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentCollege?: string;
  examType: 'mcq' | 'written' | 'combined';
  score: number;
  totalMarks: number;
  mcqScore?: number;
  mcqTotal?: number;
  cqScore?: number;
  cqTotal?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  unanswered?: number;
  selectedAnswers?: Record<string, number>;
  writtenAnswers?: Record<string, any>;
  cqImages?: Record<string, Record<string, string[]>>; // cqId -> part -> array of imageUrls
  isPassed: boolean;
  submittedAt: string;
  rank?: number;
  status?: 'published' | 'pending_evaluation' | 'evaluated';
  teacherFeedback?: string;
  partMarks?: Record<string, Record<string, number>>;
  evaluatedAt?: string;
}

export interface QuestionBankItem {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  subject: string;
  chapter?: string;
  year?: string;
  type?: 'board' | 'admission' | 'varsity' | 'medical' | 'engineering' | 'all';
  pages?: number;
  fileSize?: string;
  pdfUrl: string;
  downloadCount?: number;
  createdAt: string;
}

export interface LiveClass {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description?: string;
  instructorName: string;
  platform: 'google_meet' | 'zoom' | 'youtube_live' | 'facebook_live';
  meetingLink: string;
  meetingId?: string;
  meetingPassword?: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  attachedSheetTitle?: string;
  attachedSheetUrl?: string;
  recordingUrl?: string;
  recordingNotesPdf?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'course' | 'exam' | 'live' | 'sheet' | 'urgent' | 'general';
  priority: 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'course' | 'batch' | 'role' | 'user';
  targetRole?: 'student' | 'teacher' | 'admin' | 'all';
  targetUserId?: string;
  targetUserIds?: string[];
  targetCourseId?: string;
  targetCourseTitle?: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  createdAt: string;
  actionLabel?: string;
  actionUrl?: string;
  isPinned?: boolean;
  readBy?: string[]; // user IDs who have read this notification
  viewCount?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'admin';
  senderAvatar?: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface ConversationThread {
  id: string;
  type: 'doubt' | 'direct' | 'support' | 'batch_group';
  studentId?: string;
  studentName: string;
  studentCollege?: string;
  studentAvatar?: string;
  studentRoll?: string;
  courseId?: string;
  courseTitle?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  status: 'pending' | 'solved' | 'open' | 'closed';
  priority?: 'normal' | 'high' | 'urgent';
  lastMessageText: string;
  lastMessageTime: string;
  unreadCountTeacher: number;
  unreadCountStudent: number;
  messages: ChatMessage[];
  doubtImageUrl?: string;
  ticketNumber?: string;
  teacherId?: string;
  teacherName?: string;
  teacherAvatar?: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'percent' | 'percentage' | 'fixed';
  discountValue: number;
  usageCount?: number;
  usageLimit?: number;
  usedCount?: number;
  expiresAt?: string;
  isActive: boolean;
  applicableCourse?: string;
  createdAt?: string;
}

export interface PayoutRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherPhone?: string;
  amount: number;
  method: string; // 'bKash' | 'Nagad' | 'Bank Transfer'
  accountNumber: string;
  bankDetails?: {
    bankName?: string;
    branchName?: string;
    accountName?: string;
    routingNumber?: string;
  };
  trxId?: string;
  requestedAt?: string;
  paidAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  note?: string;
  status: 'pending' | 'paid' | 'rejected';
  createdAt?: string;
}

