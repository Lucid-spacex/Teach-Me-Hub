// User types
export type UserRole = 'PARENT' | 'TUTOR' | 'ADMIN' | 'STUDENT'
export type UserStatus = 'UNVERIFIED' | 'ACTIVE' | 'PENDING_VETTING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  profilePictureUrl?: string | null
}

// Auth types
export interface RegisterRequest {
  fullName: string
  email: string
  phone: string
  password: string
  role: UserRole
}

export interface VerifyRequest {
  email: string
  otp: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface StudentLoginRequest {
  parentEmail: string
  studentCode: string
  studentPin: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse {
  message: string
  userId: string
}

export interface VerifyResponse {
  message: string
  user: User
}

// Subject types
export interface Subject {
  id: string
  name: string
  gradeBand: string
  category: string
  priceNGN?: number
  priceUSD?: number
  createdAt: string
}

// Student types
export interface Student {
  id: string
  parentId: string
  fullName: string
  dateOfBirth: string
  actualGrade: ActualGrade
  gender: Gender
  school: string | null
  notes: string | null
  email: string | null
  preferredStartDate: string | null
  studentCode?: string
  createdAt: string
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
export type ActualGrade = 'PRESCHOOL' | 'KINDERGARTEN' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4' | 'GRADE_5' | 'GRADE_6' | 'GRADE_7' | 'GRADE_8' | 'GRADE_9' | 'GRADE_10' | 'GRADE_11' | 'GRADE_12'

export interface CreateStudentRequest {
  fullName: string
  dateOfBirth: string
  actualGrade: ActualGrade
  gradeLevel: string
  gender: Gender
  school?: string
  notes?: string
  email?: string
  preferredStartDate?: string
}

// Enrollment types
export type EnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PAYMENT'
export type SessionFrequency = 'TWICE_WEEKLY' | 'THRICE_WEEKLY' | 'FIVE_TIMES_WEEKLY'
export type BillingFrequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface Enrollment {
  id: string
  studentId: string
  subjectId: string
  tutorId: string | null
  sessionFrequency: SessionFrequency
  status: EnrollmentStatus
  startDate: string
  endDate: string | null
  enrollmentGroupId?: string
  availableDays?: string[]
  preferredStartHour?: number
  preferredEndHour?: number
  billingFrequency?: BillingFrequency
  createdAt: string
  student?: Student
  subject?: Subject
}

export interface CreateEnrollmentRequest {
  studentId: string
  subjectIds: string[]
  sessionFrequency: SessionFrequency
  availableDays: string[]
  preferredStartHour: number
  preferredEndHour: number
  billingFrequency: BillingFrequency
  startDate: string
}

// Legacy single-subject enrollment request for backward compatibility
export interface CreateSingleEnrollmentRequest {
  studentId: string
  subjectId: string
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY'
  startDate: string
  endDate?: string
}

// Session types
export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'
export type RecordingStatus = 'NOT_AVAILABLE' | 'PROCESSING' | 'AVAILABLE'

export interface SessionParticipant {
  enrollmentId: string
  attended: boolean
}

export interface Session {
  id: string
  enrollmentId: string
  scheduledAt: string
  durationMinutes: number
  zoomLink: string | null
  status: SessionStatus
  recordingStatus?: RecordingStatus
  recordingLink?: string | null
  tutorNotes: string | null
  homeworkAssigned: string | null
  participants?: SessionParticipant[]
  createdBy?: 'TUTOR' | 'ADMIN'
  createdAt: string
}

export interface UpdateSessionRequest {
  status?: SessionStatus
  tutorNotes?: string
  homeworkAssigned?: string
  participants?: SessionParticipant[]
}

// Progress Report types
export interface ProgressReport {
  id: string
  enrollmentId: string
  period: string
  summary: string
  strengths: string
  areasToImprove: string
  createdBy: string
  createdAt: string
}

export interface CreateProgressReportRequest {
  enrollmentId: string
  period: string
  summary: string
  strengths: string
  areasToImprove: string
}

// Tutor Profile types
export type VettingStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface TutorProfile {
  id: string
  userId: string
  subjects: string[]
  bio: string
  credentialsUrl: string | null
  vettingStatus: VettingStatus
  hourlyRate: number
  availability: Record<string, any>
  createdAt: string
  user?: User
}

export interface Tutor {
  id: string
  userId: string
  fullName: string
  email: string
  subjects: string[]
  bio: string
  vettingStatus: VettingStatus
  hourlyRate: number
  availability: Record<string, any>
}

export interface CreateTutorProfileRequest {
  subjects: string[]
  bio: string
  credentialsUrl?: string
  hourlyRate: number
  availability: Record<string, any>
}

export interface UpdateTutorProfileRequest {
  availability: Record<string, any>
}

// Tutor-specific types
export interface TutorStudent {
  student: Student
  enrollment: Enrollment
}

// Admin types
export interface PendingTutor {
  user: User
  tutorProfile: TutorProfile
}

export interface TutorWithProfile {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  profilePictureUrl?: string | null
  tutorProfile: TutorProfile | null
}

export interface AdminStudent {
  id: string
  parentId: string
  parentName: string
  fullName: string
  dateOfBirth: string
  actualGrade: ActualGrade
  gender: Gender
  school: string | null
  notes: string | null
  email: string | null
  preferredStartDate: string | null
  createdAt: string
}

export interface VettingRequest {
  vettingStatus: 'APPROVED' | 'REJECTED'
}

export interface AssignTutorRequest {
  tutorId: string
}

export interface AdminOverview {
  totalUsers: number
  totalStudents: number
  totalTutors: number
  totalParents: number
  activeEnrollments: number
  pendingTutors: number
  totalRevenue: number
  failedPayments: number
}

// Payment types
export interface Payment {
  id: string
  enrollmentId?: string
  enrollmentGroupId?: string
  amount: number
  currency: string
  status: string
  createdAt: string
  subjects?: Array<{ id: string; name: string }>
  providerReference?: string
  reference?: string
  enrollment?: Enrollment
}

export interface InitiatePaymentRequest {
  enrollmentId?: string
  enrollmentGroupId?: string
  // amount is optional — the backend calculates it from the enrollment record.
  // Do NOT send 0; omit it entirely and let the backend resolve the price.
  amount?: number
  currency?: string
}

export interface InitiatePaymentResponse {
  success: boolean
  reference: string
  authorizationUrl: string
  accessCode?: string
  message: string
}

// Error types
export interface ApiError {
  error: string
  message?: string
  details?: Array<{
    field: string
    message: string
  }>
}

// Student specific types
export interface StudentProfile {
  id: string
  parentId: string
  fullName: string
  dateOfBirth: string
  actualGrade: ActualGrade
  gender: Gender
  school: string | null
  notes: string | null
  email: string | null
  preferredStartDate: string | null
  studentCode: string
  timezone?: string
  profilePictureUrl?: string | null
  createdAt: string
}

export interface StudentActivity {
  totalSessions: number
  attendanceRate: number
  totalAssignments: number
  averageGrade: number
  recentSessions?: Session[]
  assignments?: Assignment[]
  [key: string]: any
}

export interface StudentAttendance {
  sessionId: string
  sessionDate: string
  attended: boolean
  status: string
}

// Message types
export interface MessageThread {
  id: string
  participants?: Array<{
    id: string
    fullName: string
    role: UserRole
    profilePictureUrl?: string | null
  }>
  otherParticipant?: {
    id: string
    fullName: string
    role: UserRole
    profilePictureUrl?: string | null
  }
  lastMessage?: {
    id: string
    body: string
    content?: string
    createdAt: string
    senderId: string
    readAt: string | null
  }
  lastMessageAt: string
  unreadCount: number
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  body?: string
  createdAt: string
  read: boolean
}

// Complaint types
export type ComplaintAboutType = 'TUTOR' | 'STUDENT' | 'GENERAL'

export interface Complaint {
  id: string
  userId: string
  aboutType: ComplaintAboutType
  aboutId: string | null
  description: string
  status: 'OPEN' | 'RESOLVED'
  adminReply: string | null
  createdAt: string
  resolvedAt: string | null
}

// Notification types
export type NotificationType = 'MESSAGE' | 'SESSION' | 'ASSIGNMENT' | 'PAYMENT' | 'PRICING_DRIFT_ALERT' | 'TUTOR_ASSIGNED' | 'GENERAL'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

// Assignment types
export type AssignmentType = 'ASSIGNMENT' | 'CLASSWORK' | 'TEST'

export interface Assignment {
  id: string
  enrollmentId: string
  title: string
  description: string
  type: AssignmentType
  dueDate: string
  status: 'PENDING' | 'SUBMITTED' | 'GRADED'
  attachmentUrl?: string | null
  createdAt: string
}

// Submission types
export type SubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'REVIEWED'

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  textAnswer?: string
  attachmentUrl?: string | null
  status: SubmissionStatus
  tutorFeedback?: string
  tutorFeedbackAttachmentUrl?: string | null
  submittedAt?: string
  reviewedAt?: string
  createdAt: string
}

// Grade types
export interface Grade {
  id: string
  enrollmentId: string
  assignmentId: string
  score: number
  maxScore: number
  feedback: string | null
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  createdAt: string
  assignment?: Assignment
  gradedAt?: string
}

// Quiz types
export interface QuizQuestion {
  id: string
  assignmentId: string
  questionText: string
  options: string[]
  correctIndex: number
  points: number
  order: number
}

export interface QuizAttempt {
  id: string
  assignmentId: string
  studentId: string
  startedAt: string
  completedAt: string | null
  score: number | null
  answers: Array<{
    questionId: string
    selectedOption: number
    isCorrect: boolean
    pointsEarned: number
  }>
}

// Pricing types
export interface PricingTier {
  id: string
  gradeBandTier: string
  priceNGN: number
  priceUSD: number
  effectiveFrom: string
}

export interface ExchangeRate {
  id: string
  baseCurrency: string
  targetCurrency: string
  rate: number
  effectiveFrom: string
}


