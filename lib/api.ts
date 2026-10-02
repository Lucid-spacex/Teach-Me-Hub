import {
  AdminOverview,
  AdminStudent,
  ApiError,
  AssignTutorRequest,
  Assignment,
  AssignmentType,
  AuthResponse,
  Complaint,
  ComplaintAboutType,
  CreateEnrollmentRequest,
  CreateProgressReportRequest,
  CreateSingleEnrollmentRequest,
  CreateStudentRequest,
  CreateTutorProfileRequest,
  Enrollment,
  ExchangeRate,
  Grade,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  LoginRequest,
  Message,
  MessageThread,
  Notification,
  Payment,
  PendingTutor,
  PricingTier,
  ProgressReport,
  QuizAttempt,
  QuizQuestion,
  RegisterRequest,
  RegisterResponse,
  Session,
  Student,
  StudentActivity,
  StudentAttendance,
  StudentLoginRequest,
  StudentProfile,
  Subject,
  TutorProfile,
  TutorStudent,
  TutorWithProfile,
  UpdateSessionRequest,
  UpdateTutorProfileRequest,
  User,
  VerifyRequest,
  VerifyResponse,
  VettingRequest,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-tutor-9rjd.onrender.com/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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

    // Handle 429 Rate Limit - show specific retry time
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset')
      let errorMessage = 'Too many attempts. Please try again later.'
      
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000)
        const now = new Date()
        const diffMs = resetDate.getTime() - now.getTime()
        const diffMins = Math.ceil(diffMs / 60000)
        
        if (diffMins <= 1) {
          errorMessage = 'Too many attempts. Please try again in 1 minute.'
        } else if (diffMins < 60) {
          errorMessage = `Too many attempts. Please try again in ${diffMins} minutes.`
        } else {
          const hours = Math.floor(diffMins / 60)
          const mins = diffMins % 60
          errorMessage = `Too many attempts. Please try again in ${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} minute${mins > 1 ? 's' : ''}` : ''}.`
        }
      }
      
      console.error('Rate limit exceeded:', errorMessage)
      throw new Error(errorMessage)
    }

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...')
      const refreshToken = this.getRefreshToken()
      
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
          throw new Error('Session expired. Please log in again.')
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
        throw new Error('Session expired. Please log in again.')
      }
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('API Error:', errorData)
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
    document.cookie = `accessToken=${token}; path=/; max-age=3600; SameSite=Strict`
  }

  private setRefreshToken(token: string): void {
    if (typeof document === 'undefined') return
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

  async markNotificationRead(notificationId: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })
  }

  // Subject endpoints
  async getSubjects(): Promise<Subject[]> {
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
  async getPendingTutors(): Promise<PendingTutor[]> {
    return this.request<PendingTutor[]>('/admin/tutors/pending')
  }

  async getTutors(status?: string): Promise<TutorWithProfile[]> {
    const params = status ? `?status=${status}` : ''
    return this.request<TutorWithProfile[]>(`/admin/tutors${params}`)
  }

  async getAdminStudents(parentId?: string): Promise<AdminStudent[]> {
    const params = parentId ? `?parentId=${parentId}` : ''
    return this.request<AdminStudent[]>(`/admin/students${params}`)
  }

  async updateTutorVetting(id: string, data: VettingRequest): Promise<TutorProfile> {
    return this.request<TutorProfile>(`/admin/tutors/${id}/vetting`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
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
    // Frontend expects: { id, participants/otherParticipant, lastMessage, lastMessageAt, unreadCount }
    return data.map(item => ({
      id: item.threadId,
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

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications')
  }

  // Admin pricing endpoints
  async getPricingTiers(): Promise<PricingTier[]> {
    return this.request<PricingTier[]>('/admin/pricing-tiers')
  }

  async updatePricingTier(tierId: string, data: {
    priceNGN?: number
    priceUSD?: number
  }): Promise<PricingTier> {
    return this.request<PricingTier>(`/admin/pricing-tiers/${tierId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getExchangeRate(): Promise<ExchangeRate> {
    return this.request<ExchangeRate>('/admin/exchange-rate/current')
  }

  async getEnrollmentPricing(enrollmentId: string): Promise<{ priceNGN: number; priceUSD: number }> {
    return this.request<{ priceNGN: number; priceUSD: number }>(`/admin/enrollments/${enrollmentId}/pricing`)
  }

  async updateEnrollmentPricing(enrollmentId: string, data: {
    priceNGN?: number
    priceUSD?: number
  }): Promise<{ priceNGN: number; priceUSD: number }> {
    return this.request<{ priceNGN: number; priceUSD: number }>(`/admin/enrollments/${enrollmentId}/pricing`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Admin user management
  async getSuspendedUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users/suspended')
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
    zoomLink?: string
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
}

export const api = new ApiClient(API_URL)
