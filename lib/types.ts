export type Role = "PARENT" | "TUTOR" | "ADMIN";

export type UserStatus =
  | "UNVERIFIED"
  | "ACTIVE"
  | "PENDING_VETTING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface Student {
  id: string;
  parentId: string;
  fullName: string;
  dateOfBirth: string;
  gradeLevel: string;
  school?: string | null;
  notes?: string | null;
  createdAt: string;
}

export type EnrollmentFrequency = "WEEKLY" | "BI_WEEKLY" | "MONTHLY";
export type EnrollmentStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface Enrollment {
  id: string;
  studentId: string;
  subjectId: string;
  tutorId: string | null;
  frequency: EnrollmentFrequency;
  status: EnrollmentStatus;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export type SessionStatus = "SCHEDULED" | "COMPLETED" | "MISSED" | "CANCELLED";

export interface TutoringSession {
  id: string;
  enrollmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  zoomLink: string | null;
  status: SessionStatus;
  tutorNotes: string | null;
  homeworkAssigned: string | null;
  createdAt: string;
}

export interface ProgressReport {
  id: string;
  enrollmentId: string;
  period: string;
  summary: string;
  strengths: string;
  areasToImprove: string;
  createdBy: string;
  createdAt: string;
}

export type VettingStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TutorProfile {
  id: string;
  userId: string;
  subjects: string[];
  bio: string;
  credentialsUrl: string | null;
  vettingStatus: VettingStatus;
  hourlyRate: number;
  availability: Record<string, unknown>;
  createdAt: string;
}

export interface TutorStudent {
  student: Student;
  enrollment: Enrollment;
}

export interface PendingTutor {
  user: User;
  tutorProfile: TutorProfile;
}

export interface AdminOverview {
  activeStudents: number;
  activeTutors: number;
  revenueThisMonth: number;
  totalEnrollments: number;
  pendingVetting: number;
}
