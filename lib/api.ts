import {
  AdminOverview,
  AdminStudent,
  ApiError,
  AssignTutorRequest,
  AuthResponse,
  CreateEnrollmentRequest,
  CreateProgressReportRequest,
  CreateStudentRequest,
  CreateTutorProfileRequest,
  Enrollment,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  LoginRequest,
  Payment,
  PendingTutor,
  ProgressReport,
  RegisterRequest,
  RegisterResponse,
  Session,
  Student,
  Subject,
  TutorProfile,
  TutorStudent,
  TutorWithProfile,
  UpdateSessionRequest,
  UpdateTutorProfileRequest,
  VerifyRequest,
  VerifyResponse,
  VettingRequest,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-tutor-9rjd.onrender.com'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
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

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...')
      const refreshToken = this.getRefreshToken()
      
      if (refreshToken) {
        try {
          const refreshResponse = await this.refresh(refreshToken)
          console.log('Token refresh successful')
          
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
          // Clear tokens and redirect to login
          this.clearTokens()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
          throw new Error('Session expired. Please log in again.')
        }
      } else {
        // No refresh token available, clear tokens and redirect
        this.clearTokens()
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          window.location.href = '/login'
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

  // Subject endpoints
  async getSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('/subjects')
  }

  // Enrollment endpoints
  async getEnrollments(status?: string): Promise<Enrollment[]> {
    const params = status ? `?status=${status}` : ''
    return this.request<Enrollment[]>(`/enrollments${params}`)
  }

  async createEnrollment(data: CreateEnrollmentRequest): Promise<Enrollment> {
    return this.request<Enrollment>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
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

  async getUnmatchedEnrollments(): Promise<Enrollment[]> {
    return this.request<Enrollment[]>('/admin/enrollments/unmatched')
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
    return this.request<InitiatePaymentResponse>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient(API_URL)
