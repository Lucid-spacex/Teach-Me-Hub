import {
  AdminActionLog,
  AdminOverview,
  AdminStudent,
  AdminStudentDetail,
  ApiError,
  AssignTutorRequest,
  Assignment,
  AssignmentType,
  AuthResponse,
  ChangeRequestStatus,
  ClassScheduleItem,
  ClassScheduleResponse,
  ClassScheduleStatus,
  Complaint,
  ComplaintAboutType,
  CompiledGrade,
  CreateChangeRequestRequest,
  CreateEnrollmentRequest,
  CreateGradeRequest,
  CreateProgressReportRequest,
  CreateSingleEnrollmentRequest,
  CreateStudentRequest,
  CreateTutorProfileRequest,
  Enrollment,
  EnrollmentChangeRequest,
  ExchangeRate,
  Grade,
  GradeBandTier,
  GradeComponentType,
  GradePreviewRequest,
  GradePreviewResponse,
  GradeStatus,
  HighestQualification,
  HowHeardSource,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  LoginRequest,
  Message,
  MessageThread,
  Notification,
  NotificationCategory,
  ParentDetailProfile,
  ParentDirectoryEntry,
  Payment,
  PaymentDetail,
  PaymentNote,
  PaymentSummary,
  PeriodFilter,
  PerformanceOverview,
  PricingQuote,
  PricingTier,
  ProgressReport,
  QuizAttempt,
  QuizQuestion,
  RegisterRequest,
  RegisterResponse,
  RegenerateStudentPasswordResponse,
  ScoredItem,
  ScoredItemType,
  Session,
  SessionRecording,
  Student,
  StudentActivity,
  StudentAttendance,
  StudentLoginRequest,
  StudentProfile,
  SubmitGradeRequest,
  Subject,
  SubjectPrice,
  SuggestedTutor,
  TutorApplication,
  TutorAvailabilityStatus,
  TutorDocument,
  TutorLevel,
  TutorProfile,
  TutorStudent,
  TutorWithProfile,
  UnreadCountResponse,
  UpdateSessionRequest,
  UpdateTutorProfileRequest,
  UpcomingClass,
  User,
  VerifyRequest,
  VerifyResponse,
  VettingRequest,
  StreamTicketResponse,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-tutor-9rjd.onrender.com/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    // Health endpoint is special - remove /api prefix
    const isHealthEndpoint = endpoint === '/health'
    const url = isHealthEndpoint
      ? `${this.baseUrl.replace('/api', '')}/health`
      : `${this.baseUrl}${endpoint}`

    // Get token from cookies (client-side)
    const token = this.getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log('API Request:', { url, method: options.method || 'GET', hasToken: !!token })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log('API Response status:', response.status, response.statusText)

    // Handle 429 Rate Limit - retry with exponential backoff
    if (response.status === 429) {
      const maxRetries = 3
      const baseDelay = 1000 // 1 second

      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount) // 1s, 2s, 4s
        console.log(`Rate limit hit. Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`)

        await new Promise(resolve => setTimeout(resolve, delay))

        // Retry the request
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      // Max retries reached, show error with countdown
      const resetTime = response.headers.get('RateLimit-Reset') || response.headers.get('X-RateLimit-Reset')
      let errorMessage = 'Too many attempts. Please try again later.'

      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000)
        const now = new Date()
        const diffMs = resetDate.getTime() - now.getTime()
        const diffSecs = Math.ceil(diffMs / 1000)

        if (diffSecs <= 60) {
          errorMessage = `Too many attempts. Please try again in ${diffSecs} second${diffSecs !== 1 ? 's' : ''}.`
        } else if (diffSecs < 3600) {
          const diffMins = Math.ceil(diffSecs / 60)
          errorMessage = `Too many attempts. Please try again in ${diffMins} minute${diffMins !== 1 ? 's' : ''}.`
        } else {
          const hours = Math.floor(diffSecs / 3600)
          const mins = Math.ceil((diffSecs % 3600) / 60)
          errorMessage = `Too many attempts. Please try again in ${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} minute${mins !== 1 ? 's' : ''}` : ''}.`
        }
      }

      console.error('Rate limit exceeded after retries:', errorMessage)
      throw new Error(errorMessage)
    }

    // Handle 401 Unauthorized - try to refresh token only if we have a token
    if (response.status === 401) {
      const token = this.getToken()
      const refreshToken = this.getRefreshToken()

      // If we don't have a token, this is likely a login/auth request that failed
      // Just throw the error instead of trying to refresh
      if (!token && !refreshToken) {
        const errorData: ApiError = await response.json().catch(() => ({ error: 'Invalid credentials' }))
        console.error('API Error (no token available):', errorData)
        throw new Error(errorData.error || errorData.message || 'Invalid credentials')
      }

      console.log('Token expired, attempting refresh...')

      if (refreshToken) {
        try {
          const refreshResponse = await this.refresh(refreshToken)
          console.log('Token refresh successful')

          // Reconcile user with GET /auth/me after token refresh
          try {
            const freshUser = await this.getMe()
            if (freshUser && typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(freshUser))
              localStorage.setItem('userRole', freshUser.role)
              document.cookie = `userRole=${freshUser.role}; path=/; max-age=3600; SameSite=Strict`
              window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: freshUser }))
            }
          } catch (syncErr) {
            console.warn('Failed to reconcile user with /auth/me after refresh:', syncErr)
          }
          
          // Retry the original request with new token
          const newToken = this.getToken()
          const retryHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
          }

          if (newToken) {
            retryHeaders['Authorization'] = `Bearer ${newToken}`
          }

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          })

          if (!retryResponse.ok) {
            const errorData: ApiError = await retryResponse.json().catch(() => ({ error: 'Unknown error' }))
            console.error('API Error after retry:', errorData)
            throw new Error(errorData.error || errorData.message || 'Request failed')
          }

          const result = await retryResponse.json()
          console.log('API Response data (after retry):', result)
          return result
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Clear tokens and redirect to appropriate login page based on user role
          this.clearTokens()
          if (typeof window !== 'undefined') {
            const userRole = localStorage.getItem('userRole')
            localStorage.removeItem('user')
            localStorage.removeItem('userRole')
            // Redirect to appropriate login page based on role
            if (userRole === 'STUDENT') {
              window.location.href = '/student-login'
            } else {
              window.location.href = '/login'
            }
          }
          throw new Error('You were signed out.')
        }
      } else {
        // No refresh token available, clear tokens and redirect to appropriate login page
        this.clearTokens()
        if (typeof window !== 'undefined') {
          const userRole = localStorage.getItem('userRole')
          localStorage.removeItem('user')
          localStorage.removeItem('userRole')
          // Redirect to appropriate login page based on role
          if (userRole === 'STUDENT') {
            window.location.href = '/student-login'
          } else {
            window.location.href = '/login'
          }
        }
        throw new Error('You were signed out.')
      }
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('API Error:', errorData)

      // Handle TUTOR_NOT_APPROVED and APPLICATION_REJECTED codes
      if (errorData.error === 'TUTOR_NOT_APPROVED' || errorData.error === 'APPLICATION_REJECTED') {
        if (typeof window !== 'undefined') {
          const userRole = localStorage.getItem('userRole')
          if (userRole === 'TUTOR') {
            window.location.href = '/tutor/application'
          }
        }
      }

      throw new Error(errorData.error || errorData.message || 'Request failed')
    }

    const result = await response.json()
    console.log('API Response data:', result)
    return result
  }

  private getToken(): string | null {
    if (typeof document === 'undefined') return null
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1] || null
  }

  private getRefreshToken(): string | null {
    if (typeof document === 'undefined') return null
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1] || null
  }

  private setToken(token: string): void {
    if (typeof document === 'undefined') return
    // Access token: 1 day (86400 seconds)
    document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Strict`
  }

  private setRefreshToken(token: string): void {
    if (typeof document === 'undefined') return
    // Refresh token: 7 days (604800 seconds)
    document.cookie = `refreshToken=${token}; path=/; max-age=604800; SameSite=Strict`
  }

  private clearTokens(): void {
    if (typeof document === 'undefined') return
    document.cookie = 'accessToken=; path=/; max-age=0'
    document.cookie = 'refreshToken=; path=/; max-age=0'
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verify(data: VerifyRequest): Promise<VerifyResponse> {
    return this.request<VerifyResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    // Validate response structure
    if (!response.user || !response.user.id || !response.user.role) {
      throw new Error('Invalid response from server: missing user data')
    }

    // Store tokens
    this.setToken(response.accessToken)
    this.setRefreshToken(response.refreshToken)

    // Store user data in localStorage for easy access
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRole', response.user.role)
    }

    return response
  }

  async studentLogin(data: StudentLoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/student-login', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    // Validate response structure
    if (!response.user || !response.user.id || !response.user.role) {
      throw new Error('Invalid response from server: missing user data')
    }

    // Store tokens
    this.setToken(response.accessToken)
    this.setRefreshToken(response.refreshToken)

    // Store user data in localStorage for easy access
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRole', response.user.role)
    }

    return response
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const url = `${this.baseUrl}/auth/refresh`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Refresh token error:', errorData)
      throw new Error(errorData.error || errorData.message || 'Token refresh failed')
    }

    const result = await response.json()
    this.setToken(result.accessToken)
    this.setRefreshToken(result.refreshToken)
    
    return result
  }

  async logout(): Promise<{ message: string }> {
    const token = this.getToken()

    // Only call the API if we have a token (use direct fetch to avoid refresh logic)
    if (token) {
      try {
        const url = `${this.baseUrl}/auth/logout`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const result = await response.json()
          return result
        }
      } catch (err) {
        // If logout API fails, still clear local tokens
        console.error('Logout API call failed:', err)
      }
    }
    
    // Always clear local tokens
    this.clearTokens()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
    
    return { message: 'Logged out' }
  }

  // Student endpoints
  async getStudents(): Promise<Student[]> {
    return this.request<Student[]>('/students')
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    return this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async regenerateStudentPin(studentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/students/${studentId}/regenerate-pin`, {
      method: 'POST',
    })
  }

  async getStudentActivity(studentId: string): Promise<StudentActivity> {
    return this.request<StudentActivity>(`/students/${studentId}/activity`)
  }

  async getStudentAttendance(studentId: string): Promise<StudentAttendance[]> {
    return this.request<StudentAttendance[]>(`/students/${studentId}/attendance`)
  }

  // Student-specific endpoints
  async getStudentProfile(): Promise<StudentProfile> {
    return this.request<StudentProfile>('/student/me')
  }

  async getStudentDetail(studentId: string): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>(`/admin/students/${studentId}`)
  }

  async getStudentSchedule(): Promise<Session[]> {
    return this.request<Session[]>('/student/me/schedule')
  }

  async getStudentEnrollments(): Promise<Enrollment[]> {
    return this.request<Enrollment[]>('/student/me/enrollments')
  }

  async getStudentEnrollmentSessions(enrollmentId: string): Promise<Session[]> {
    return this.request<Session[]>(`/student/me/enrollments/${enrollmentId}/sessions`)
  }

  async getStudentNextClass(): Promise<{ session: Session; countdown: string } | null> {
    return this.request<{ session: Session; countdown: string } | null>('/student/me/next-class')
  }

  async getStudentAssignments(): Promise<Assignment[]> {
    return this.request<Assignment[]>('/student/me/assignments')
  }

  async submitAssignment(assignmentId: string, data: {
    textAnswer?: string
    attachment?: File
  }): Promise<{ message: string }> {
    const formData = new FormData()
    if (data.textAnswer) formData.append('textAnswer', data.textAnswer)
    if (data.attachment) formData.append('attachment', data.attachment)

    const token = this.getToken()
    const url = `${this.baseUrl}/assignments/${assignmentId}/submit`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || errorData.message || 'Failed to submit assignment')
    }

    return response.json()
  }

  async getAssignmentSubmission(assignmentId: string): Promise<any> {
    return this.request<any>(`/assignments/${assignmentId}/submission`)
  }

  async getStudentGrades(): Promise<Grade[]> {
    return this.request<Grade[]>('/student/me/grades')
  }

  async getStudentProgressReports(): Promise<ProgressReport[]> {
    return this.request<ProgressReport[]>('/student/me/progress-reports')
  }

  async getStudentAttendanceSummary(): Promise<{ attendanceRate: number; sessions: StudentAttendance[] }> {
    return this.request<{ attendanceRate: number; sessions: StudentAttendance[] }>('/student/me/attendance')
  }

  async getStudentNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/student/me/notifications')
  }

  async getStudentNotificationsFiltered(filters?: {
    category?: NotificationCategory
    unreadOnly?: boolean
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; total: number }> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.unreadOnly !== undefined) params.append('unreadOnly', filters.unreadOnly.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    const query = params.toString()
    return this.request<{ notifications: Notification[]; total: number }>(
      `/student/me/notifications${query ? `?${query}` : ''}`
    )
  }

  async getStudentUnreadCount(): Promise<UnreadCountResponse> {
    return this.request<UnreadCountResponse>('/student/me/notifications/unread-count')
  }

  async markNotificationRead(notificationId: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsRead(category?: NotificationCategory): Promise<{ message: string }> {
    const params = category ? `?category=${category}` : ''
    return this.request<{ message: string }>(`/notifications/read-all${params}`, {
      method: 'PATCH',
    })
  }

  async markNotificationsReadByEntity(entityType: string, entityId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/read-by-entity`, {
      method: 'PATCH',
      body: JSON.stringify({ entityType, entityId }),
    })
  }

  async getStreamTicket(): Promise<StreamTicketResponse> {
    return this.request<StreamTicketResponse>('/notifications/stream-ticket', {
      method: 'POST',
    })
  }

  // Generic notification endpoints (role-agnostic)
  async getNotifications(filters?: {
    category?: NotificationCategory
    unreadOnly?: boolean
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; total: number }> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.unreadOnly !== undefined) params.append('unreadOnly', filters.unreadOnly.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    const query = params.toString()
    return this.request<{ notifications: Notification[]; total: number }>(
      `/notifications${query ? `?${query}` : ''}`
    )
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return this.request<UnreadCountResponse>('/notifications/unread-count')
  }

  async getAdminUnreadCount(): Promise<UnreadCountResponse> {
    return this.request<UnreadCountResponse>('/admin/notifications/unread-count')
  }

  async getTutorUnreadCount(): Promise<UnreadCountResponse> {
    return this.request<UnreadCountResponse>('/tutor/notifications/unread-count')
  }

  async getParentUnreadCount(): Promise<UnreadCountResponse> {
    return this.request<UnreadCountResponse>('/parent/notifications/unread-count')
  }

  // Subject endpoints (legacy, for backward compatibility)
  async getSubjectsLegacy(): Promise<Subject[]> {
    return this.request<Subject[]>('/subjects')
  }

  // Enrollment endpoints
  async getEnrollments(status?: string): Promise<Enrollment[]> {
    const params = status ? `?status=${status}` : ''
    return this.request<Enrollment[]>(`/enrollments${params}`)
  }

  async createEnrollment(data: CreateEnrollmentRequest): Promise<{ enrollments: Enrollment[]; enrollmentGroupId: string }> {
    return this.request<{ enrollments: Enrollment[]; enrollmentGroupId: string }>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Legacy single-subject enrollment for backward compatibility
  async createSingleEnrollment(data: CreateSingleEnrollmentRequest): Promise<Enrollment> {
    const requestPayload = {
      studentId: data.studentId,
      subjectId: data.subjectId,
      sessionFrequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate,
    }

    return this.request<Enrollment>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    })
  }

  // Session endpoints
  async getSessions(enrollmentId?: string, status?: string): Promise<Session[]> {
    const params = new URLSearchParams()
    if (enrollmentId) params.append('enrollmentId', enrollmentId)
    if (status) params.append('status', status)
    const queryString = params.toString()
    return this.request<Session[]>(`/sessions${queryString ? `?${queryString}` : ''}`)
  }

  async updateSession(id: string, data: UpdateSessionRequest): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Progress Report endpoints
  async getProgressReports(enrollmentId?: string): Promise<ProgressReport[]> {
    const params = enrollmentId ? `?enrollmentId=${enrollmentId}` : ''
    return this.request<ProgressReport[]>(`/progress-reports${params}`)
  }

  async createProgressReport(data: CreateProgressReportRequest): Promise<ProgressReport> {
    return this.request<ProgressReport>('/progress-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Tutor Profile endpoints
  async createTutorProfile(data: CreateTutorProfileRequest): Promise<TutorProfile> {
    return this.request<TutorProfile>('/tutor-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTutorProfile(data: UpdateTutorProfileRequest): Promise<TutorProfile> {
    return this.request<TutorProfile>('/tutor-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async updateTutorAvailabilityStatus(data: {
    availabilityStatus: TutorAvailabilityStatus
    maxStudents: number
    statusNote?: string
  }): Promise<TutorProfile> {
    return this.request<TutorProfile>('/tutor-profile/availability-status', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Tutor-specific endpoints
  async getTutorStudents(): Promise<TutorStudent[]> {
    return this.request<TutorStudent[]>('/tutor/students')
  }

  async getTutorSessions(): Promise<Session[]> {
    return this.request<Session[]>('/tutor/sessions')
  }

  async createTutorSession(data: {
    enrollmentId: string
    scheduledAt: string
    durationMinutes: number
  }): Promise<Session> {
    try {
      return await this.request<Session>('/tutor/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        return await this.request<Session>('/sessions', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      }
      throw err
    }
  }

  async rescheduleTutorSession(sessionId: string, data: {
    scheduledAt: string
    durationMinutes?: number
  }): Promise<Session> {
    try {
      return await this.request<Session>(`/tutor/sessions/${sessionId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        return await this.request<Session>(`/sessions/${sessionId}/reschedule`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      }
      throw err
    }
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/tutor/sessions/${sessionId}`, {
        method: 'DELETE',
      })
    } catch (err: any) {
      if (err?.message?.includes('404')) {
        return await this.request<{ message: string }>(`/sessions/${sessionId}`, {
          method: 'DELETE',
        })
      }
      throw err
    }
  }

  // Admin endpoints
  async getPendingTutors(): Promise<TutorWithProfile[]> {
    const response = await this.request<{ data: TutorWithProfile[]; page: number; limit: number; total: number }>('/admin/tutors?status=PENDING_VETTING&applicationStatus=SUBMITTED')
    return response.data || []
  }

  async getTutors(status?: string): Promise<TutorWithProfile[]> {
    const params = status ? `?status=${status}` : ''
    const response = await this.request<{ data: TutorWithProfile[]; page: number; limit: number; total: number }>(`/admin/tutors${params}`)
    return response.data || []
  }

  async getTutorDetail(tutorId: string): Promise<any> {
    return this.request<any>(`/admin/tutors/${tutorId}`)
  }

  // Tutor Application endpoints
  async getTutorApplication(): Promise<TutorApplication> {
    return this.request<TutorApplication>('/tutor-application')
  }

  async updateTutorApplication(data: Partial<TutorApplication>): Promise<TutorApplication> {
    return this.request<TutorApplication>('/tutor-application', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async submitTutorApplication(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/tutor-application/submit', {
      method: 'POST',
    })
  }

  async uploadTutorDocument(file: File): Promise<TutorDocument> {
    const formData = new FormData()
    formData.append('document', file)

    const token = this.getToken()
    const url = `${this.baseUrl}/tutor-application/documents`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || errorData.message || 'Failed to upload document')
    }

    return response.json()
  }

  async getTutorDocuments(): Promise<TutorDocument[]> {
    return this.request<TutorDocument[]>('/tutor-application/documents')
  }

  async deleteTutorDocument(documentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tutor-application/documents/${documentId}`, {
      method: 'DELETE',
    })
  }

  async getAdminStudents(parentId?: string): Promise<AdminStudent[]> {
    const params = parentId ? `?parentId=${parentId}` : ''
    const response = await this.request<{ data: AdminStudent[]; page: number; limit: number; total: number }>(`/admin/students${params}`)
    return response.data || []
  }

  async updateTutorVetting(id: string, data: { vettingStatus: 'APPROVED' | 'REJECTED'; reason?: string }): Promise<TutorProfile> {
    return this.request<TutorProfile>(`/admin/tutors/${id}/vetting`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getAdminTutorStudents(tutorId: string): Promise<TutorStudent[]> {
    return this.request<TutorStudent[]>(`/admin/tutors/${tutorId}/students`)
  }

  async getAdminTutorSessions(tutorId: string): Promise<Session[]> {
    return this.request<Session[]>(`/admin/tutors/${tutorId}/sessions`)
  }

  async getUnmatchedEnrollments(includeUnpaid?: boolean): Promise<Enrollment[]> {
    const params = includeUnpaid ? '?includeUnpaid=true' : ''
    return this.request<Enrollment[]>(`/admin/enrollments/unmatched${params}`)
  }

  async assignTutor(enrollmentId: string, data: AssignTutorRequest): Promise<Enrollment> {
    return this.request<Enrollment>(`/admin/enrollments/${enrollmentId}/assign-tutor`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getFailedPayments(): Promise<Payment[]> {
    return this.request<Payment[]>('/admin/payments/failed')
  }

  async getAdminOverview(): Promise<AdminOverview> {
    return this.request<AdminOverview>('/admin/reports/overview')
  }

  async getPaymentsSummary(): Promise<PaymentSummary> {
    return this.request<PaymentSummary>('/admin/payments/summary')
  }

  // Payment endpoints (unverified)
  async initiatePayment(data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    console.log('Initiating payment with data:', data)
    const response = await this.request<InitiatePaymentResponse>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    console.log('Payment initiation response:', response)
    return response
  }

  async getPayments(): Promise<Payment[]> {
    return this.request<Payment[]>('/payments')
  }

  async verifyPayment(reference: string): Promise<Payment> {
    return this.request<Payment>(`/payments/verify/${reference}`)
  }

  // Assignment endpoints
  async getAssignments(enrollmentId?: string): Promise<Assignment[]> {
    const params = enrollmentId ? `?enrollmentId=${enrollmentId}` : ''
    return this.request<Assignment[]>(`/assignments${params}`)
  }

  async createAssignment(data: {
    enrollmentId: string
    title: string
    description: string
    type: AssignmentType
    dueDate: string
    attachment?: File
  }): Promise<Assignment> {
    if (data.attachment) {
      // Use multipart/form-data for file upload
      const formData = new FormData()
      formData.append('enrollmentId', data.enrollmentId)
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('type', data.type)
      formData.append('dueDate', data.dueDate)
      formData.append('attachment', data.attachment)

      const token = this.getToken()
      const url = `${this.baseUrl}/assignments`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || 'Failed to create assignment')
      }

      return response.json()
    }

    return this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify({
        enrollmentId: data.enrollmentId,
        title: data.title,
        description: data.description,
        type: data.type,
        dueDate: data.dueDate,
      }),
    })
  }

  async updateAssignmentStatus(assignmentId: string, status: string): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async updateAssignment(assignmentId: string, data: {
    title?: string
    description?: string
    type?: AssignmentType
    dueDate?: string
    attachment?: File
  }): Promise<Assignment> {
    if (data.attachment) {
      // Use multipart/form-data for file upload
      const formData = new FormData()
      if (data.title) formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      if (data.type) formData.append('type', data.type)
      if (data.dueDate) formData.append('dueDate', data.dueDate)
      formData.append('attachment', data.attachment)

      const token = this.getToken()
      const url = `${this.baseUrl}/assignments/${assignmentId}`

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || 'Failed to update assignment')
      }

      return response.json()
    }

    return this.request<Assignment>(`/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        type: data.type,
        dueDate: data.dueDate,
      }),
    })
  }

  async deleteAssignment(assignmentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    })
  }

  // Grade endpoints
  async getGrades(enrollmentId?: string): Promise<Grade[]> {
    const params = enrollmentId ? `?enrollmentId=${enrollmentId}` : ''
    return this.request<Grade[]>(`/grades${params}`)
  }

  async submitGrade(data: {
    enrollmentId: string
    assignmentId: string
    score: number
    maxScore: number
    feedback?: string
    feedbackAttachment?: File
  }): Promise<Grade> {
    if (data.feedbackAttachment) {
      // Use multipart/form-data for file upload
      const formData = new FormData()
      formData.append('enrollmentId', data.enrollmentId)
      formData.append('assignmentId', data.assignmentId)
      formData.append('score', data.score.toString())
      formData.append('maxScore', data.maxScore.toString())
      if (data.feedback) formData.append('feedback', data.feedback)
      formData.append('feedbackAttachment', data.feedbackAttachment)

      const token = this.getToken()
      const url = `${this.baseUrl}/grades`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || 'Failed to submit grade')
      }

      return response.json()
    }

    return this.request<Grade>('/grades', {
      method: 'POST',
      body: JSON.stringify({
        enrollmentId: data.enrollmentId,
        assignmentId: data.assignmentId,
        score: data.score,
        maxScore: data.maxScore,
        feedback: data.feedback,
      }),
    })
  }

  async updateGrade(gradeId: string, data: {
    score?: number
    maxScore?: number
    feedback?: string
  }): Promise<Grade> {
    return this.request<Grade>(`/grades/${gradeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteGrade(gradeId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/grades/${gradeId}`, {
      method: 'DELETE',
    })
  }

  // Quiz endpoints
  async getQuizQuestions(assignmentId: string): Promise<QuizQuestion[]> {
    return this.request<QuizQuestion[]>(`/quiz/assignments/${assignmentId}/questions`)
  }

  async createQuizQuestion(assignmentId: string, data: {
    questionText: string
    options: string[]
    correctIndex: number
    points: number
    order: number
  }): Promise<QuizQuestion> {
    return this.request<QuizQuestion>(`/quiz/assignments/${assignmentId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async startQuiz(assignmentId: string): Promise<QuizAttempt> {
    return this.request<QuizAttempt>(`/quiz/assignments/${assignmentId}/quiz/start`, {
      method: 'POST',
    })
  }

  async submitQuizAnswer(attemptId: string, data: {
    questionId: string
    selectedOption: number
  }): Promise<{ isCorrect: boolean; pointsEarned: number }> {
    return this.request<{ isCorrect: boolean; pointsEarned: number }>(`/quiz/quiz-attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async completeQuiz(attemptId: string): Promise<QuizAttempt> {
    return this.request<QuizAttempt>(`/quiz/quiz-attempts/${attemptId}/complete`, {
      method: 'PATCH',
    })
  }

  // Message endpoints
  async getMessageThreads(): Promise<MessageThread[]> {
    const data = await this.request<any[]>('/messages/threads')
    // Transform API response to match frontend expectations
    // API returns: { threadId, otherParticipant, lastMessage, unreadCount }
    // Frontend expects: { id, threadId, participants/otherParticipant, lastMessage, lastMessageAt, unreadCount }
    console.log('getMessageThreads raw data:', data)
    return data.map(item => ({
      id: item.threadId,
      threadId: item.threadId,
      otherParticipant: item.otherParticipant,
      participants: item.otherParticipant ? [item.otherParticipant] : item.participants,
      lastMessage: item.lastMessage,
      lastMessageAt: item.lastMessage?.createdAt || new Date().toISOString(),
      unreadCount: item.unreadCount || 0,
    }))
  }

  async getMessages(threadId: string): Promise<Message[]> {
    const list = await this.request<any[]>(`/messages/threads/${threadId}`)
    return (Array.isArray(list) ? list : []).map(m => ({
      id: m.id,
      threadId: m.threadId || threadId,
      senderId: m.senderId,
      content: m.content || m.body || '',
      body: m.body || m.content || '',
      createdAt: m.createdAt,
      read: m.read ?? false,
    }))
  }

  async getThreadMessages(threadId: string): Promise<Message[]> {
    return this.getMessages(threadId)
  }

  async sendMessage(
    recipientOrPayload: string | { recipientId: string; body: string; threadId?: string },
    bodyText?: string
  ): Promise<Message> {
    let payload: { recipientId: string; body: string; threadId?: string }
    if (typeof recipientOrPayload === 'object') {
      payload = {
        recipientId: recipientOrPayload.recipientId,
        body: recipientOrPayload.body,
        ...(recipientOrPayload.threadId ? { threadId: recipientOrPayload.threadId } : {}),
      }
    } else {
      payload = {
        recipientId: recipientOrPayload,
        body: bodyText || '',
      }
    }

    console.log('sendMessage payload:', payload)

    const requestBody = {
      recipientId: payload.recipientId,
      body: payload.body,
    }

    console.log('sendMessage request body:', requestBody)

    const res = await this.request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    return {
      id: res.id,
      threadId: res.threadId,
      senderId: res.senderId,
      content: res.content || res.body || payload.body,
      body: res.body || res.content || payload.body,
      createdAt: res.createdAt || new Date().toISOString(),
      read: res.read ?? false,
    }
  }

  async startMessageThread(
    data: { recipientId: string; body: string } | string[],
    initialMessage?: string
  ): Promise<Message> {
    if (Array.isArray(data)) {
      const recipientId = data[0]
      // Require explicit message - no auto-sending defaults
      if (!initialMessage || initialMessage.trim() === '') {
        throw new Error('Message body is required to start a conversation')
      }
      return this.sendMessage({
        recipientId,
        body: initialMessage,
      })
    }
    return this.sendMessage(data)
  }

  // Complaint endpoints
  async getComplaints(): Promise<Complaint[]> {
    return this.request<Complaint[]>('/complaints')
  }

  async fileComplaint(data: {
    aboutType: ComplaintAboutType
    aboutId?: string
    description: string
  }): Promise<Complaint> {
    return this.request<Complaint>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resolveComplaint(complaintId: string, reply: string): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${complaintId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ reply }),
    })
  }



  // Admin pricing endpoints
  async getPricingTiers(): Promise<PricingTier[]> {
    return this.request<PricingTier[]>('/admin/pricing-tiers')
  }

  async updatePricingTier(tierId: string, data: {
    yearlyPriceNGN?: number
    yearlyPriceUSD?: number
  }): Promise<PricingTier> {
    return this.request<PricingTier>(`/admin/pricing-tiers/${tierId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getExchangeRate(): Promise<ExchangeRate> {
    return this.request<ExchangeRate>('/admin/exchange-rate/current')
  }

  async getEnrollmentPricing(enrollmentId: string): Promise<{ yearlyPriceNGN: number; yearlyPriceUSD: number }> {
    return this.request<{ yearlyPriceNGN: number; yearlyPriceUSD: number }>(`/admin/enrollments/${enrollmentId}/pricing`)
  }

  // Scored Items endpoints
  async getScoredItems(studentId: string, filters?: {
    type?: ScoredItemType
    notInGrade?: boolean
    enrollmentId?: string
  }): Promise<ScoredItem[]> {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.notInGrade !== undefined) params.append('notInGrade', filters.notInGrade.toString())
    if (filters?.enrollmentId) params.append('enrollmentId', filters.enrollmentId)
    const query = params.toString()
    return this.request<ScoredItem[]>(`/tutor/students/${studentId}/scored-items${query ? `?${query}` : ''}`)
  }

  async createScoredItem(studentId: string, data: {
    enrollmentId: string
    type: ScoredItemType
    title: string
    maxScore: number
    score?: number
    comment?: string
  }): Promise<ScoredItem> {
    return this.request<ScoredItem>(`/tutor/students/${studentId}/scored-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateScoredItem(itemId: string, data: {
    score?: number
    comment?: string
  }): Promise<ScoredItem> {
    return this.request<ScoredItem>(`/tutor/scored-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteScoredItem(itemId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tutor/scored-items/${itemId}`, {
      method: 'DELETE',
    })
  }

  // Grade Compilation endpoints
  async previewCompiledGrade(data: GradePreviewRequest): Promise<GradePreviewResponse> {
    return this.request<GradePreviewResponse>('/tutor/grades/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createCompiledGrade(data: CreateGradeRequest): Promise<CompiledGrade> {
    return this.request<CompiledGrade>('/tutor/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async submitCompiledGrade(gradeId: string): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/tutor/grades/${gradeId}/submit`, {
      method: 'POST',
    })
  }

  async withdrawCompiledGrade(gradeId: string): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/tutor/grades/${gradeId}/withdraw`, {
      method: 'POST',
    })
  }

  async updateCompiledGradeDraft(gradeId: string, data: Partial<CreateGradeRequest>): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/tutor/grades/${gradeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCompiledGrade(gradeId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tutor/grades/${gradeId}`, {
      method: 'DELETE',
    })
  }

  async getTutorCompiledGrades(filters?: {
    status?: GradeStatus
    studentId?: string
    enrollmentId?: string
  }): Promise<CompiledGrade[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.studentId) params.append('studentId', filters.studentId)
    if (filters?.enrollmentId) params.append('enrollmentId', filters.enrollmentId)
    const query = params.toString()
    return this.request<CompiledGrade[]>(`/tutor/grades${query ? `?${query}` : ''}`)
  }

  async getCompiledGradeDetail(gradeId: string): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/tutor/grades/${gradeId}`)
  }

  // Admin Grade endpoints
  async getAdminCompiledGrades(filters?: {
    status?: GradeStatus
    tutorId?: string
    studentId?: string
    subject?: string
  }): Promise<{ data: CompiledGrade[]; page: number; limit: number; total: number }> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.tutorId) params.append('tutorId', filters.tutorId)
    if (filters?.studentId) params.append('studentId', filters.studentId)
    if (filters?.subject) params.append('subject', filters.subject)
    const query = params.toString()
    return this.request<{ data: CompiledGrade[]; page: number; limit: number; total: number }>(
      `/admin/grades${query ? `?${query}` : ''}`
    )
  }

  async approveCompiledGrade(gradeId: string): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/admin/grades/${gradeId}/approve`, {
      method: 'POST',
    })
  }

  async rejectCompiledGrade(gradeId: string, reason: string): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/admin/grades/${gradeId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async bulkApproveCompiledGrades(gradeIds: string[]): Promise<{ results: Array<{ gradeId: string; success: boolean; error?: string }> }> {
    return this.request<{ results: Array<{ gradeId: string; success: boolean; error?: string }> }>('/admin/grades/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ gradeIds }),
    })
  }

  // Parent Grade endpoints
  async getParentCompiledGrades(studentId?: string): Promise<CompiledGrade[]> {
    const params = studentId ? `?studentId=${studentId}` : ''
    return this.request<CompiledGrade[]>(`/parent/grades${params}`)
  }

  async getParentCompiledGradeDetail(gradeId: string): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/parent/grades/${gradeId}`)
  }

  // Student Grade endpoints
  async getStudentCompiledGrades(): Promise<CompiledGrade[]> {
    return this.request<CompiledGrade[]>('/student/grades')
  }

  async getStudentCompiledGradeDetail(gradeId: string): Promise<CompiledGrade> {
    return this.request<CompiledGrade>(`/student/grades/${gradeId}`)
  }

  // Class Schedule endpoints
  async getTutorUpcomingClasses(): Promise<UpcomingClass[]> {
    return this.request<UpcomingClass[]>('/tutor/upcoming-classes')
  }

  async getAdminClassSchedule(filters?: {
    tutorId?: string
    status?: ClassScheduleStatus
    fromDate?: string
    toDate?: string
  }): Promise<ClassScheduleResponse> {
    const params = new URLSearchParams()
    if (filters?.tutorId) params.append('tutorId', filters.tutorId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.fromDate) params.append('fromDate', filters.fromDate)
    if (filters?.toDate) params.append('toDate', filters.toDate)
    const query = params.toString()
    return this.request<ClassScheduleResponse>(`/admin/class-schedule${query ? `?${query}` : ''}`)
  }

  // Enrollment Change Request endpoints
  async getParentChangeRequests(filters?: {
    status?: ChangeRequestStatus
    enrollmentId?: string
  }): Promise<EnrollmentChangeRequest[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.enrollmentId) params.append('enrollmentId', filters.enrollmentId)
    const query = params.toString()
    return this.request<EnrollmentChangeRequest[]>(`/parent/change-requests${query ? `?${query}` : ''}`)
  }

  async createChangeRequest(data: CreateChangeRequestRequest): Promise<EnrollmentChangeRequest> {
    return this.request<EnrollmentChangeRequest>('/parent/change-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async cancelChangeRequest(requestId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/parent/change-requests/${requestId}/cancel`, {
      method: 'POST',
    })
  }

  async getAdminChangeRequests(filters?: {
    status?: ChangeRequestStatus
  }): Promise<{ data: EnrollmentChangeRequest[]; page: number; limit: number; total: number }> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    const query = params.toString()
    return this.request<{ data: EnrollmentChangeRequest[]; page: number; limit: number; total: number }>(
      `/admin/change-requests${query ? `?${query}` : ''}`
    )
  }

  async getAdminChangeRequestDetail(requestId: string): Promise<EnrollmentChangeRequest> {
    return this.request<EnrollmentChangeRequest>(`/admin/change-requests/${requestId}`)
  }

  async approveChangeRequest(requestId: string): Promise<EnrollmentChangeRequest> {
    return this.request<EnrollmentChangeRequest>(`/admin/change-requests/${requestId}/approve`, {
      method: 'POST',
    })
  }

  async rejectChangeRequest(requestId: string, reason: string): Promise<EnrollmentChangeRequest> {
    return this.request<EnrollmentChangeRequest>(`/admin/change-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Session Recording endpoint
  async getSessionRecording(sessionId: string): Promise<SessionRecording> {
    return this.request<SessionRecording>(`/sessions/${sessionId}/recording`)
  }

  // Extended notification endpoints for admin and tutor
  async getAdminNotifications(filters?: {
    category?: NotificationCategory
    unreadOnly?: boolean
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; total: number }> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.unreadOnly !== undefined) params.append('unreadOnly', filters.unreadOnly.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    const query = params.toString()
    return this.request<{ notifications: Notification[]; total: number }>(
      `/admin/notifications${query ? `?${query}` : ''}`
    )
  }

  async getTutorNotifications(filters?: {
    category?: NotificationCategory
    unreadOnly?: boolean
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; total: number }> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.unreadOnly !== undefined) params.append('unreadOnly', filters.unreadOnly.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    const query = params.toString()
    return this.request<{ notifications: Notification[]; total: number }>(
      `/tutor/notifications${query ? `?${query}` : ''}`
    )
  }

  async getParentNotifications(filters?: {
    category?: NotificationCategory
    unreadOnly?: boolean
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; total: number }> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.unreadOnly !== undefined) params.append('unreadOnly', filters.unreadOnly.toString())
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    const query = params.toString()
    return this.request<{ notifications: Notification[]; total: number }>(
      `/parent/notifications${query ? `?${query}` : ''}`
    )
  }

  async updateEnrollmentPricing(enrollmentId: string, data: {
    yearlyPriceNGN?: number
    yearlyPriceUSD?: number
  }): Promise<{ yearlyPriceNGN: number; yearlyPriceUSD: number }> {
    return this.request<{ yearlyPriceNGN: number; yearlyPriceUSD: number }>(`/admin/enrollments/${enrollmentId}/pricing`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Admin user management
  async getSuspendedUsers(): Promise<User[]> {
    const response = await this.request<{ data: User[]; page: number; limit: number; total: number }>('/admin/users/suspended')
    return response.data || []
  }

  async reactivateUser(userId: string): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/reactivate`, {
      method: 'PATCH',
    })
  }

  async adminRegenerateStudentPin(studentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/students/${studentId}/regenerate-pin`, {
      method: 'PATCH',
    })
  }

  // Admin session management
  async createAdminSession(data: {
    participantEnrollmentIds: string[]
    scheduledAt: string
    durationMinutes: number
    meetLink?: string
    sharedSessionConfirmed?: boolean
  }): Promise<Session> {
    return this.request<Session>('/admin/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async rescheduleSession(sessionId: string, data: {
    scheduledAt: string
  }): Promise<Session> {
    return this.request<Session>(`/admin/sessions/${sessionId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // User profile endpoints
  async getMe(): Promise<User> {
    return this.request<User>('/auth/me')
  }

  async updateTimezone(timezone: string): Promise<User> {
    return this.request<User>('/auth/me/timezone', {
      method: 'PATCH',
      body: JSON.stringify({ timezone }),
    })
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Profile picture endpoints
  async uploadProfilePicture(file: File): Promise<{ profilePictureUrl: string }> {
    const formData = new FormData()
    formData.append('profilePicture', file)

    const token = this.getToken()
    const url = `${this.baseUrl}/auth/me/profile-picture`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || errorData.message || 'Failed to upload profile picture')
    }

    return response.json()
  }

  async deleteProfilePicture(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/me/profile-picture', {
      method: 'DELETE',
    })
  }

  // Admin contact endpoint
  async getAdminContact(): Promise<{ recipientId: string }> {
    const response = await this.request<{ recipientId: string }>('/messages/admin-contact')
    console.log('getAdminContact response:', response)

    // If the endpoint doesn't return a recipientId, try to get users and find admin
    if (!response.recipientId) {
      console.log('No recipientId from admin-contact, trying to get users...')
      try {
        const users = await this.getUsers()
        const adminUser = users.find((u: any) => u.role === 'ADMIN')
        if (adminUser) {
          console.log('Found admin user:', adminUser.id)
          return { recipientId: adminUser.id }
        }
      } catch (err) {
        console.error('Failed to get users:', err)
      }
    }

    return response
  }

  async getUsers(): Promise<any[]> {
    return this.request<any[]>('/users')
  }

  // Subject endpoints with per-grade pricing
  async getPublicSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('/subjects/public')
  }

  async getSubjects(gradeBandTier?: GradeBandTier, category?: string): Promise<Subject[]> {
    const params = new URLSearchParams()
    if (gradeBandTier) params.append('gradeBandTier', gradeBandTier)
    if (category) params.append('category', category)
    const queryString = params.toString()
    return this.request<Subject[]>(`/subjects${queryString ? `?${queryString}` : ''}`)
  }

  async getAdminSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('/admin/subjects')
  }

  async createSubject(data: {
    name: string
    category: 'CORE' | 'ENRICHMENT' | 'TEST_PREP'
    prices: Array<{
      gradeBandTier: GradeBandTier
      yearlyPriceNGN: number
      yearlyPriceUSD: number
    }>
  }): Promise<Subject> {
    return this.request<Subject>('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSubjectPricing(subjectId: string, data: {
    gradeBandTier: GradeBandTier
    yearlyPriceNGN: number
    yearlyPriceUSD: number
  }): Promise<Subject> {
    return this.request<Subject>(`/admin/subjects/${subjectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async updateSubject(id: string, data: {
    name?: string
    category?: string
    isActive?: boolean
  }): Promise<Subject> {
    return this.request<Subject>(`/admin/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteSubject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/subjects/${id}`, {
      method: 'DELETE',
    })
  }

  async getPricingQuote(studentId: string, subjectIds: string[]): Promise<PricingQuote> {
    const params = new URLSearchParams()
    params.append('studentId', studentId)
    subjectIds.forEach(id => params.append('subjectIds', id))
    return this.request<PricingQuote>(`/pricing/quote?${params.toString()}`)
  }

  async getSuggestedTutors(enrollmentId: string): Promise<SuggestedTutor[]> {
    return this.request<SuggestedTutor[]>(`/admin/enrollments/${enrollmentId}/suggested-tutors`)
  }

  async assignTutorWithForce(enrollmentId: string, data: {
    tutorId: string
    force?: boolean
  }): Promise<Enrollment> {
    return this.request<Enrollment>(`/admin/enrollments/${enrollmentId}/assign-tutor`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Parent directory endpoints
  async getParentDirectory(params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ data: ParentDirectoryEntry[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return this.request<{ data: ParentDirectoryEntry[]; total: number; page: number; limit: number }>(
      `/admin/parents${queryString ? `?${queryString}` : ''}`
    )
  }

  async getParentDetail(parentId: string): Promise<ParentDetailProfile> {
    return this.request<ParentDetailProfile>(`/admin/parents/${parentId}`)
  }

  // Transaction endpoints
  async getTransactions(params?: {
    status?: string
    currency?: string
    provider?: string
    parentId?: string
    from?: string
    to?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ payments: PaymentDetail[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.currency) queryParams.append('currency', params.currency)
    if (params?.provider) queryParams.append('provider', params.provider)
    if (params?.parentId) queryParams.append('parentId', params.parentId)
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return this.request<{ payments: PaymentDetail[]; total: number; page: number; limit: number }>(
      `/admin/payments${queryString ? `?${queryString}` : ''}`
    )
  }

  async getTransactionDetail(paymentId: string): Promise<PaymentDetail> {
    return this.request<PaymentDetail>(`/admin/payments/${paymentId}`)
  }

  async getTransactionSummary(params?: {
    from?: string
    to?: string
  }): Promise<PaymentSummary> {
    const queryParams = new URLSearchParams()
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    const queryString = queryParams.toString()
    return this.request<PaymentSummary>(`/admin/reports/payments/summary${queryString ? `?${queryString}` : ''}`)
  }

  // Student password regeneration
  async regenerateStudentPassword(studentId: string): Promise<RegenerateStudentPasswordResponse> {
    return this.request<RegenerateStudentPasswordResponse>(`/students/${studentId}/regenerate-password`, {
      method: 'POST',
    })
  }

  async adminRegenerateStudentPassword(studentId: string): Promise<RegenerateStudentPasswordResponse> {
    return this.request<RegenerateStudentPasswordResponse>(`/admin/students/${studentId}/regenerate-password`, {
      method: 'PATCH',
    })
  }

  // Performance Overview endpoints
  async getStudentPerformance(period?: PeriodFilter): Promise<PerformanceOverview> {
    const params = period ? `?period=${period}` : ''
    return this.request<PerformanceOverview>(`/student/me/performance${params}`)
  }

  async getParentStudentPerformance(studentId: string, period?: PeriodFilter): Promise<PerformanceOverview> {
    const params = period ? `?period=${period}` : ''
    return this.request<PerformanceOverview>(`/students/${studentId}/performance${params}`)
  }

  async getTutorStudentPerformance(studentId: string, period?: PeriodFilter): Promise<PerformanceOverview> {
    const params = period ? `?period=${period}` : ''
    return this.request<PerformanceOverview>(`/tutor/students/${studentId}/performance${params}`)
  }

  async getAdminStudentPerformance(studentId: string, period?: PeriodFilter, includePending?: boolean): Promise<PerformanceOverview> {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append('period', period)
    if (includePending) queryParams.append('includePending', 'true')
    const queryString = queryParams.toString()
    return this.request<PerformanceOverview>(`/admin/students/${studentId}/performance${queryString ? `?${queryString}` : ''}`)
  }

  // Admin payment action endpoints
  async addPaymentNote(paymentId: string, note: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/payments/${paymentId}/note`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    })
  }

  async reverifyPayment(paymentId: string): Promise<PaymentDetail> {
    return this.request<PaymentDetail>(`/admin/payments/${paymentId}/reverify`, {
      method: 'POST',
    })
  }

  // Admin suspend endpoints
  async suspendTutor(tutorId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/tutors/${tutorId}/suspend`, {
      method: 'PATCH',
    })
  }

  async suspendStudent(studentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/students/${studentId}/suspend`, {
      method: 'PATCH',
    })
  }

  async suspendParent(parentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/parents/${parentId}/suspend`, {
      method: 'PATCH',
    })
  }

  // Admin sessions endpoints
  async getAdminSessions(params?: {
    status?: string
    tutorId?: string
    studentId?: string
    page?: number
    limit?: number
  }): Promise<{ data: Session[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.tutorId) queryParams.append('tutorId', params.tutorId)
    if (params?.studentId) queryParams.append('studentId', params.studentId)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return this.request<{ data: Session[]; total: number; page: number; limit: number }>(
      `/admin/sessions${queryString ? `?${queryString}` : ''}`
    )
  }

  async getAdminSession(sessionId: string): Promise<Session> {
    return this.request<Session>(`/admin/sessions/${sessionId}`)
  }

  async updateAdminSession(sessionId: string, data: {
    scheduledAt?: string
    durationMinutes?: number
    meetLink?: string
    status?: string
    notes?: string
    homework?: string
  }): Promise<Session> {
    return this.request<Session>(`/admin/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Admin enrollments endpoints
  async getAdminEnrollments(params?: {
    status?: string
    tutorId?: string
    studentId?: string
    page?: number
    limit?: number
  }): Promise<{ data: Enrollment[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.tutorId) queryParams.append('tutorId', params.tutorId)
    if (params?.studentId) queryParams.append('studentId', params.studentId)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return this.request<{ data: Enrollment[]; total: number; page: number; limit: number }>(
      `/admin/enrollments${queryString ? `?${queryString}` : ''}`
    )
  }

  async getAdminEnrollment(enrollmentId: string): Promise<Enrollment> {
    return this.request<Enrollment>(`/admin/enrollments/${enrollmentId}`)
  }

  // Tutor profile endpoints
  async getTutorProfile(): Promise<TutorProfile> {
    return this.request<TutorProfile>('/tutor/me')
  }

  async updateTutorProfileInfo(data: {
    bio?: string
    hourlyRate?: number
  }): Promise<TutorProfile> {
    return this.request<TutorProfile>('/tutor/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getTutorStudentDetail(studentId: string): Promise<any> {
    return this.request<any>(`/tutor/me/students/${studentId}`)
  }

  async getTutorStudentAssignments(studentId: string): Promise<Assignment[]> {
    return this.request<Assignment[]>(`/tutor/me/students/${studentId}/assignments`)
  }

  async getTutorStudentGrades(studentId: string): Promise<Grade[]> {
    return this.request<Grade[]>(`/tutor/me/students/${studentId}/grades`)
  }

  async getTutorStudentAttendance(studentId: string): Promise<StudentAttendance[]> {
    return this.request<StudentAttendance[]>(`/tutor/me/students/${studentId}/attendance`)
  }

  // Parent/Me endpoints
  async getParentProfile(): Promise<ParentDetailProfile> {
    return this.request<ParentDetailProfile>('/me')
  }

  async updateParentProfile(data: {
    fullName?: string
    phone?: string
    timezone?: string
  }): Promise<ParentDetailProfile> {
    return this.request<ParentDetailProfile>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient(API_URL)
