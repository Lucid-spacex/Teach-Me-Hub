// User types
export type UserRole = 'PARENT' | 'TUTOR' | 'ADMIN'
export type UserStatus = 'UNVERIFIED' | 'ACTIVE' | 'PENDING_VETTING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
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
  createdAt: string
}

// Student types
export interface Student {
  id: string
  parentId: string
  fullName: string
  dateOfBirth: string
  gradeLevel: string
  school: string | null
  notes: string | null
  createdAt: string
}

export interface CreateStudentRequest {
  fullName: string
  dateOfBirth: string
  gradeLevel: string
  school?: string
  notes?: string
}

// Enrollment types
export type EnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
export type Frequency = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY'

export interface Enrollment {
  id: string
  studentId: string
  subjectId: string
  tutorId: string | null
  frequency: Frequency
  status: EnrollmentStatus
  startDate: string
  endDate: string | null
  createdAt: string
  student?: Student
  subject?: Subject
}

export interface CreateEnrollmentRequest {
  studentId: string
  subjectId: string
  frequency: Frequency
  startDate: string
  endDate?: string
}

// Session types
export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED'

export interface Session {
  id: string
  enrollmentId: string
  scheduledAt: string
  durationMinutes: number
  zoomLink: string | null
  status: SessionStatus
  tutorNotes: string | null
  homeworkAssigned: string | null
  createdAt: string
}

export interface UpdateSessionRequest {
  status?: SessionStatus
  tutorNotes?: string
  homeworkAssigned?: string
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
  tutorProfile: TutorProfile | null
}

export interface AdminStudent {
  id: string
  parentId: string
  parentName: string
  fullName: string
  dateOfBirth: string
  gradeLevel: string
  school: string | null
  notes: string | null
  createdAt: string
}

export interface VettingRequest {
  vettingStatus: 'APPROVED' | 'REJECTED'
}

export interface AssignTutorRequest {
  tutorId: string
}

export interface AdminOverview {
  activeStudents: number
  activeTutors: number
  revenueThisMonth: number
  totalEnrollments: number
  pendingVetting: number
}

// Payment types (unverified - use with caution)
export interface Payment {
  id: string
  enrollmentId: string
  amount: number
  status: string
  createdAt: string
}

export interface InitiatePaymentRequest {
  enrollmentId: string
  amount: number
  currency?: string
}

export interface InitiatePaymentResponse {
  success: boolean
  reference: string
  authorizationUrl: string
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
