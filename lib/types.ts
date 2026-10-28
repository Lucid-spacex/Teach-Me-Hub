// User types
export type UserRole = 'PARENT' | 'TUTOR' | 'ADMIN' | 'STUDENT'
export type UserStatus = 'UNVERIFIED' | 'ACTIVE' | 'PENDING' | 'PENDING_VETTING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

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

// Auth types - Updated to match backend spec
export interface RegisterRequest {
  fullName?: string
  firstName: string
  lastName: string
  middleName?: string
  fullName?: string
  email: string
  phone: string
  password: string
  role: UserRole
  address?: string
}

export interface TutorRegistrationRequest extends RegisterRequest {
  role: 'TUTOR'
  firstName: string
  lastName: string
  middleName?: string
  confirmPassword: string
  // Note: firstName, lastName, middleName, confirmPassword are now in base RegisterRequest
  // Step 2: About you
  address?: string
  birthday?: string
  country?: string
  city?: string
  highestQualification?: string
  // Step 3: Teaching
  subjects?: string[]
  testPreparation?: string[]
  levels?: string[]
  yearsOfExperience?: number
  whyTeach?: string
  howHeard?: string
  // Step 4: Profile
  bio?: string
  interests?: string
  profilePicture?: File
  // Step 5: Documents
  documents?: File[]
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
  emailSent?: boolean
}

export interface VerifyResponse {
  message: string
  user: User
}

// Subject types
export type GradeBandTier = 'PRESCHOOL_TO_G1' | 'G2_TO_G4' | 'G5_TO_G8' | 'G9_TO_G12'

export interface Subject {
  id: string
  name: string
  gradeBand?: string // Deprecated, kept for migration compatibility
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  prices?: SubjectPrice[]
  subjectPrices?: Array<{
    id: string
    subjectId: string
    gradeBandTier: GradeBandTier
    yearlyPriceNGN: string
    yearlyPriceUSD: string
    isActive: boolean
    updatedAt: string
    updatedBy: string
  }>
}

export interface SubjectPrice {
  id: string
  subjectId: string
  gradeBandTier: GradeBandTier
  yearlyPriceNGN: number
  yearlyPriceUSD: number
  effectiveFrom: string
  updatedAt: string
  subject?: Subject
}

export interface PriceChangeLog {
  id: string
  enrollmentId: string
  oldPriceNGN: number | null
  oldPriceUSD: number | null
  newPriceNGN: number
  newPriceUSD: number
  changedBy: string
  note?: string
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
  profilePictureUrl?: string | null
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

export interface RegenerateStudentPasswordResponse {
  message: string
  // Password and studentCode are NEVER returned - only emailed to parent
}

// Enrollment types
export type EnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PAYMENT'
export type SessionFrequency = 'WEEKLY' | 'TWICE_WEEKLY' | 'THRICE_WEEKLY' | 'FIVE_TIMES_WEEKLY'
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
  googleMeetLink: string | null
  meetLink?: string | null // Compatibility alias for googleMeetLink
  status: SessionStatus
  recordingStatus?: RecordingStatus
  recordingUrl?: string | null
  recordingLink?: string | null // Compatibility alias for recordingUrl
  tutorNotes: string | null
  homeworkAssigned: string | null
  participants?: SessionParticipant[]
  createdBy?: 'TUTOR' | 'ADMIN'
  needsReschedule?: boolean
  createdAt: string
  // Extended fields from admin API
  enrollment?: {
    id: string
    student?: {
      id: string
      fullName: string
    }
    subject?: {
      id: string
      name: string
    }
  }
  tutor?: {
    id: string
    fullName: string
    email: string
  }
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
export type TutorAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE'

export interface TutorProfile {
  id: string
  userId: string
  subjects: string[]
  bio: string
  credentialsUrl: string | null
  vettingStatus: VettingStatus
  hourlyRate: number
  availability: Record<string, any>
  availabilityStatus?: TutorAvailabilityStatus
  maxStudents?: number
  statusNote?: string
  statusUpdatedAt?: string
  createdAt: string
  user?: User
  // Extended profile fields from registration
  firstName?: string
  lastName?: string
  middleName?: string
  address?: string
  birthday?: string
  country?: string
  city?: string
  highestQualification?: string
  testPreparation?: string[]
  levels?: string[]
  yearsOfExperience?: number
  whyTeach?: string
  howHeard?: string
  interests?: string
  profilePictureUrl?: string
  documents?: string[]
}

export interface TutorSubject {
  id: string
  tutorId: string
  subjectId: string
  subject?: Subject
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

// Tutor Application types
export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
export type HighestQualification = 'SSCE_WAEC' | 'OND_NCE' | 'HND' | 'BACHELORS' | 'BED_PGDE' | 'MASTERS' | 'PHD' | 'OTHER'
export type TutorLevel = 'PRESCHOOL_TO_G1' | 'G2_TO_G4' | 'G5_TO_G8' | 'G9_TO_G12' | 'EXAM_LEVELS'
export type HowHeardSource = 'TEACHMENEST_TUTOR_OR_STAFF' | 'PARENT_OR_FAMILY' | 'FRIEND_OR_FAMILY' | 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'WHATSAPP_GROUP' | 'GOOGLE_SEARCH' | 'JOB_BOARD' | 'OTHER'

export interface TutorApplication {
  id: string
  userId: string
  firstName: string
  lastName: string
  middleName?: string
  phone: string
  birthday: string // Day and month only
  country: string
  city: string
  highestQualification: HighestQualification
  subjects: string[]
  levels: TutorLevel[]
  yearsOfExperience: number
  whyTeach: string
  howHeard: HowHeardSource
  aboutYou: string
  applicationStatus: ApplicationStatus
  submittedAt?: string
  createdAt: string
  updatedAt: string
  missingFields?: string[]
}

export interface TutorDocument {
  id: string
  applicationId: string
  fileName: string
  fileUrl: string
  signedUrl: string
  createdAt: string
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
  user?: Partial<User>
  tutorProfile: TutorProfile
  profilePictureUrl?: string | null
>>>>>>> c5247f6 (Tutor messaging updates and grade compile wizard attachments)
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
  user?: { fullName?: string; email?: string }
  // Extended fields from registration
  firstName?: string
  lastName?: string
  middleName?: string
  address?: string
  birthday?: string
  country?: string
  city?: string
  highestQualification?: string
  testPreparation?: string[]
  levels?: string[]
  yearsOfExperience?: number
  whyTeach?: string
  howHeard?: string
  interests?: string
  documents?: string[]
  // Fields from tutorProfile for convenience
  subjects?: string[]
  availabilityStatus?: TutorAvailabilityStatus
  maxStudents?: number
  currentStudents?: number
  // For pending tutors
  user?: User
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

export interface AdminStudentDetail {
  student: Student
  parent: {
    id: string
    fullName: string
    email: string
    phone: string
    profilePictureUrl?: string | null
  }
  tutors: Array<{
    id: string
    fullName: string
    email: string
    phone: string
    profilePictureUrl?: string | null
    bio?: string
    subjects: string[]
    availabilityStatus?: TutorAvailabilityStatus
    hourlyRate?: number
  }>
  enrollments: Enrollment[]
  sessions: Session[]
  attendance: Array<{
    sessionId: string
    sessionDate: string
    attended: boolean
    status: string
  }>
  grades: Grade[]
  assignments: Assignment[]
  progressReports: Array<{
    id: string
    enrollmentId: string
    period: string
    summary: string
    strengths: string
    areasToImprove: string
    createdBy: string
    createdAt: string
  }>
  performance?: PerformanceOverview
}

export interface VettingRequest {
  vettingStatus: 'APPROVED' | 'REJECTED'
  status?: 'APPROVED' | 'REJECTED'
  reason?: string
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
  assignedTutors?: Array<{
    id: string
    fullName: string
    profilePictureUrl?: string | null
    subjectName: string
  }>
  // Parent details
  parent?: {
    id: string
    fullName: string
    email: string
    phone: string
    profilePictureUrl?: string | null
  }
  // Tutor details for each enrollment
  tutors?: Array<{
    id: string
    fullName: string
    email: string
    phone: string
    profilePictureUrl?: string | null
    bio?: string
    subjects: string[]
    availabilityStatus?: TutorAvailabilityStatus
    hourlyRate?: number
  }>
  // Sessions
  sessions?: Session[]
  // Grades
  grades?: Grade[]
  // Attendance
  attendance?: StudentAttendance[]
  // Reports
  progressReports?: ProgressReport[]
  // Performance
  performance?: PerformanceOverview
}

export interface AdminContact {
  recipientId: string
  fullName: string
  role: 'ADMIN'
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
  threadId: string
  participants?: Array<{
    id: string
    fullName: string
    role: UserRole
    profilePictureUrl?: string | null
  }>
  otherParticipant?: {
    id: string
    recipientId?: string
    fullName: string
    role: UserRole
    profilePictureUrl?: string | null
  }
  lastMessage?: {
    id: string
    body: string
    content?: string
    createdAt: string
    senderId?: string
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
  readAt?: string | null
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
export type NotificationType = 'MESSAGE' | 'SESSION' | 'ASSIGNMENT' | 'PAYMENT' | 'PRICING_DRIFT_ALERT' | 'TUTOR_ASSIGNED' | 'GENERAL' | 'GRADE_APPROVED' | 'GRADE_REJECTED' | 'SCHEDULE_CHANGE_APPROVED' | 'SCHEDULE_CHANGE_REJECTED' | 'COMPLAINT_RESOLVED' | 'ENROLLMENT_MATCHED' | 'RECORDING_AVAILABLE'
export type NotificationCategory = 'USERS' | 'SESSIONS' | 'MESSAGES' | 'COMPLAINTS' | 'ENROLLMENT' | 'PAYMENTS' | 'GRADES' | 'SCHEDULE' | 'ASSIGNMENTS' | 'PRICING' | 'QUIZZES'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  body?: string // Tolerant: some endpoints may use body instead of message
  read: boolean
  isRead?: boolean // Tolerant: some endpoints may use isRead instead of read
  entityType?: string
  entityId?: string
  createdAt: string
}

export interface UnreadCountResponse {
  total: number
  byCategory: Record<NotificationCategory, number>
}

export interface StreamTicketResponse {
  ticket: string
  expiresAt: string
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

// File upload types
export interface FileUploadResponse {
  url: string
  publicId: string
  originalName: string
  mimeType: string
  size: number
}

// Grade types
export interface Grade {
  id: string
  enrollmentId: string
  assignmentId: string
  score: number
  maxScore: number
  comments: string | null
  feedback?: string | null // Compatibility alias for comments
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
  correctOptionIndex: number
  points: number
  orderIndex: number
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
    selectedOptionIndex: number
    isCorrect: boolean
    pointsAwarded: number
    pointsEarned?: number // Compatibility alias
  }>
}

// Pricing types
export interface PricingTier {
  id: string
  gradeBandTier: string
  yearlyPriceNGN: number
  yearlyPriceUSD: number
  effectiveFrom: string
}

export interface ExchangeRate {
  id: string
  baseCurrency: string
  targetCurrency: string
  rate: number
  effectiveFrom: string
}

export interface PricingQuote {
  studentId: string
  gradeBandTier: GradeBandTier
  subjects: Array<{
    subjectId: string
    subjectName: string
    yearlyPriceNGN: number
    yearlyPriceUSD: number
  }>
  totalNGN: number
  totalUSD: number
}

// Parent Directory types
export interface ParentDirectoryEntry {
  id: string
  fullName: string
  email: string
  phone: string
  status: UserStatus
  timezone?: string | null
  childrenCount: number
  activeEnrollments: number
  pendingPayments: number
  totalPaidNGN: number
  totalPaidUSD: number
  complaintCount: number
  createdAt: string
}

export interface ParentDetailProfile {
  id?: string
  fullName?: string
  email?: string
  phone?: string | null
  status?: UserStatus
  timezone?: string | null
  profilePicture?: string | null
  createdAt?: string
  updatedAt?: string
  complaintCount?: number
  parent: Partial<Omit<ParentDirectoryEntry, 'id' | 'phone'>> & { id?: string; phone?: string | null; createdAt?: string }
  children: Array<{
    id: string
    parentId?: string
    userId?: string
    fullName: string
    actualGrade: ActualGrade
    gradeLevel?: string
    gradeBandTier?: string
    gender?: string | null
    school: string | null
    notes?: string | null
    studentStatus?: UserStatus
    createdAt?: string
    enrollments?: Array<Record<string, unknown>>
  }>
  enrollments: Array<{
    id: string
    studentName: string
    subjectName: string
    subjectCategory?: string
    subjectGradeBand?: string
    tutorName: string | null
    status: EnrollmentStatus
    sessionFrequency?: string
    availableDays?: string[]
    billingFrequency?: string
    yearlyPrice?: number
    effectivePriceNGN: number
    effectivePriceUSD: number
    priceSource: 'override' | 'subject_price' | 'error'
    startDate: string
    hasPendingPayment?: boolean
    payments?: Array<Record<string, unknown>>
  }>
  recentPayments: Array<{
    id: string
    reference: string
    studentName: string
    subjectName: string
    amount: number
    currency: string
    status: string
    createdAt: string
  }>
  // For backward compatibility
  id?: string
  fullName?: string
  email?: string
  phone?: string
  status?: UserStatus
  timezone?: string
  profilePicture?: string | null
  createdAt?: string
  updatedAt?: string
  complaintCount?: number
}

// Transaction types
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'EXPIRED'
export type PaymentProvider = 'PAYSTACK' | 'STRIPE'

export interface PaymentDetail {
  id: string
  reference: string
  enrollmentId?: string
  enrollmentGroupId?: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: PaymentProvider
  providerReference?: string
  initiatedAt: string
  paidAt?: string
  enrollment?: {
    id: string
    student: {
      id: string
      fullName: string
    }
    subject: {
      id: string
      name: string
    }
  }
  ngnEquivalent?: number
  adminNote?: string | null
}

export interface PaymentSummary {
  totalRevenueNGN: number
  totalRevenueUSD: number
  totalCount: number
  statusCounts: Record<PaymentStatus, number>
  successRate: number
  dailyRevenue: Array<{
    date: string
    revenueNGN: number
    revenueUSD: number
    count: number
  }>
}

export interface SuggestedTutor {
  id: string
  fullName: string
  email: string
  availabilityStatus: TutorAvailabilityStatus
  maxStudents: number
  currentStudents: number
  subjects: Array<{
    id: string
    name: string
  }>
  availability: Record<string, any>
}

// Performance Overview types
export type PeriodFilter = 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface PerformanceOverview {
  averageGrade: {
    percentage: number | null
    gradedCount: number
    trend: number | null // percentage change vs previous period
  }
  gradesBySubject: Array<{
    subjectName: string
    averagePercentage: number
    gradedCount: number
  }>
  gradeTimeline: Array<{
    period: string
    averagePercentage: number
    gradedCount: number
  }>
  attendance: {
    rate: number
    attended: number
    missed: number
    trend: number | null
    timeline: Array<{
      period: string
      rate: number
      attended: number
      missed: number
    }>
  }
  assignments: {
    total: number
    completed: number
    pending: number
    overdue: number
    submittedLate: number
    completionRate: number
  }
  quizzes: {
    attempts: number
    averagePercentage: number
  }
  recentGrades: Array<{
    id: string
    assignmentTitle: string
    subjectName: string
    score: number
    maxScore: number
    percentage: number
    feedback: string | null
    createdAt: string
  }>
  period: PeriodFilter
  studentId: string
}

// Admin payment action types
export interface PaymentNote {
  id: string
  paymentId: string
  note: string
  adminId: string
  createdAt: string
  updatedAt: string
}

export interface AdminActionLog {
  id: string
  adminId: string
  action: string
  targetType: string
  targetId: string
  details: Record<string, any>
  createdAt: string
}

// Scored Item types
// Note: ENDPOINT.md lists 'QUIZ', 'ASSIGNMENT', 'EXAM', 'PROJECT', 'PARTICIPATION', 'ATTENDANCE'
// Using QUIZ, ASSIGNMENT, TEST, PARTICIPATION for UI as per instructions
// TEST maps to EXAM in API calls
export type ScoredItemType = 'QUIZ' | 'ASSIGNMENT' | 'TEST' | 'PARTICIPATION'

export interface ScoredItem {
  id: string
  studentId: string
  enrollmentId: string
  type: ScoredItemType
  title: string
  autoScore?: number | null
  tutorScore?: number | null
  maxScore: number
  comment?: string | null
  gradedAt?: string | null
  createdAt: string
  attachedToGradeId?: string | null
  // For quiz attempts
  quizAttemptId?: string | null
  // For assignment submissions
  assignmentId?: string | null
  submissionId?: string | null
  // For test/participation
  isManual: boolean
}

// Grade Compilation types
export type GradeStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
export type GradeComponentType = 'QUIZ' | 'ASSIGNMENT' | 'EXAM' | 'PARTICIPATION' | 'ATTENDANCE'

export interface GradeComponent {
  type: GradeComponentType
  weight: number
  scoredItemId?: string
  attendanceRate?: number
  itemCount?: number
  componentPercentage?: number | null
  items?: ScoredItem[]
}

export interface CompiledGrade {
  id: string
  enrollmentId: string
  studentId: string
  tutorId: string
  period: string
  status: GradeStatus
  components: GradeComponent[]
  computedScore: number
  finalScore?: number | null
  overrideReason?: string | null
  tutorComment?: string | null
  attachments?: string[]
  attendanceRate: number
  frozenSnapshotItems: ScoredItem[]
  submittedAt?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  approvedBy?: string | null
  rejectedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface GradePreviewRequest {
  enrollmentId: string
  period: string
  components: GradeComponent[]
}

export interface GradePreviewResponse {
  components: GradeComponent[]
  computedScore: number
  attendanceRate: number
}

export interface CreateGradeRequest {
  enrollmentId: string
  periodStart: string
  periodEnd: string
  components: GradeComponent[]
  tutorComment?: string
}

export interface SubmitGradeRequest extends CreateGradeRequest {}

// Class Schedule types
export type ClassScheduleStatus = 'SCHEDULED' | 'UNSCHEDULED' | 'MISSED'

export interface ClassScheduleItem {
  studentId: string
  studentName: string
  studentCode?: string
  enrollmentId: string
  subjectName: string
  tutorId: string
  tutorName: string
  nextClassDate?: string | null
  nextClassTime?: string | null
  timezone?: string | null
  status: ClassScheduleStatus
  unscheduledWithin24h: boolean
}

export interface ClassScheduleResponse {
  data: ClassScheduleItem[]
  unscheduledWithin24hCount: number
  page: number
  limit: number
  total: number
}

// Enrollment Change Request types
export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface EnrollmentChangeRequest {
  id: string
  enrollmentId: string
  studentId: string
  studentName: string
  subjectName: string
  requestedBy: string // parent ID
  requestedByName: string
  status: ChangeRequestStatus
  requestedAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  rejectionReason?: string | null
  // Before values
  before: {
    startDate: string
    endDate?: string | null
    availableDays: string[]
    preferredStartHour: number
    preferredEndHour: number
  }
  // After values
  after: {
    startDate: string
    endDate?: string | null
    availableDays: string[]
    preferredStartHour: number
    preferredEndHour: number
  }
}

export interface CreateChangeRequestRequest {
  enrollmentId: string
  startDate?: string
  endDate?: string
  availableDays?: string[]
  preferredStartHour?: number
  preferredEndHour?: number
}

// Session Recording types
export interface SessionRecording {
  recordingUrl: string
  recordingStatus: RecordingStatus
}

// Tutor Upcoming Classes types
export interface UpcomingClass {
  enrollmentId: string
  studentId: string
  studentName: string
  subjectName: string
  nextScheduledDate?: string | null
  nextScheduledTime?: string | null
  timezone?: string | null
  status: ClassScheduleStatus
  within24h: boolean
  sessionData?: {
    id: string
    scheduledAt: string
    durationMinutes: number
    meetLink?: string | null
  } | null
}


