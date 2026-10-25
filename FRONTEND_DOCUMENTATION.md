# Teach-Me-Hub Frontend Documentation

## Overview

Teach-Me-Hub is a comprehensive tutoring platform frontend built with Next.js 16, TypeScript, and Tailwind CSS. It provides role-based dashboards for Parents, Students, Tutors, and Administrators with full payment integration via Paystack.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 7.0
- **Styling:** Tailwind CSS 4.3
- **UI Components:** Radix UI primitives
- **State Management:** React hooks + Server Components
- **Authentication:** JWT-based with httpOnly cookies
- **Payment Integration:** Paystack (inline popup + hosted checkout)
- **API Communication:** Custom fetch wrapper with token refresh
- **Theme System:** Custom theme provider with light/dark/system modes
- **Form Handling:** React Hook Form with Zod validation

## Project Structure

```
teach-me-hub/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication routes group
│   │   ├── login/                # Parent/Tutor login
│   │   ├── register/             # User registration
│   │   └── verify/               # Email verification with OTP
│   ├── student-login/            # Student-specific login page
│   ├── payment/                  # Payment processing
│   │   └── callback/            # Paystack payment callback handler
│   ├── parent/                   # Parent dashboard routes
│   │   ├── page.tsx             # Parent dashboard home
│   │   ├── students/            # Student management
│   │   │   ├── page.tsx         # Student list
│   │   │   ├── [id]/            # Individual student details
│   │   │   └── [id]/performance/ # Student performance
│   │   ├── enrollments/         # Enrollment management
│   │   ├── payments/            # Payment history
│   │   ├── sessions/            # Session schedule
│   │   ├── assignments/         # Student assignments
│   │   ├── grades/              # Student grades
│   │   ├── messages/            # Messaging system
│   │   ├── complaints/          # Complaint management
│   │   ├── pricing/             # View subject pricing
│   │   ├── notifications/       # Notification center
│   │   └── settings/            # Account settings
│   ├── student/                 # Student dashboard routes
│   │   ├── page.tsx             # Student dashboard home
│   │   ├── schedule/            # Class schedule
│   │   ├── assignments/         # Assignment management
│   │   ├── grades/              # Grade viewing
│   │   ├── attendance/          # Attendance records
│   │   ├── progress-reports/    # Progress reports
│   │   ├── messages/            # Messaging (info page - not functional)
│   │   ├── my-tutors/           # View assigned tutors
│   │   ├── performance/         # Performance overview
│   │   ├── notifications/       # Notifications
│   │   ├── profile/             # Student profile
│   │   └── settings/            # Account settings
│   ├── tutor/                   # Tutor dashboard routes
│   │   ├── page.tsx             # Tutor dashboard home
│   │   ├── application/        # Tutor application wizard
│   │   ├── students/            # Assigned students
│   │   ├── sessions/            # Session management
│   │   ├── assignments/         # Assignment management
│   │   ├── grades/              # Grade management
│   │   ├── complaints/         # Complaint viewing
│   │   ├── progress-reports/    # Progress report submission
│   │   ├── notifications/       # Notifications
│   │   └── settings/            # Account settings
│   ├── admin/                   # Admin dashboard routes
│   │   ├── page.tsx             # Admin dashboard home
│   │   ├── students/            # All students management
│   │   ├── students/[id]/       # Individual student details
│   │   ├── students/[id]/performance/ # Student performance
│   │   ├── tutors/              # Tutor management
│   │   ├── tutors/[id]/         # Individual tutor details
│   │   ├── tutors/pending/      # Pending tutor approvals
│   │   ├── all-tutors/          # All tutors list
│   │   ├── enrollments/         # Enrollment matching
│   │   ├── parents/             # Parent directory
│   │   ├── subjects/            # Subject & pricing management
│   │   ├── sessions/            # Session management
│   │   ├── transactions/        # Payment transactions
│   │   ├── complaints/          # Complaint management
│   │   ├── messages/            # Admin messaging
│   │   ├── suspended/           # Suspended users
│   │   └── settings/            # Admin settings
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx       # Login form with role selection
│   │   ├── RegisterForm.tsx    # Registration form
│   │   ├── StudentLoginForm.tsx # Student login (code + PIN)
│   │   ├── TutorRegisterForm.tsx # Tutor-specific registration
│   │   └── VerifyForm.tsx       # OTP verification form
│   ├── parent/                  # Parent-specific components
│   │   ├── AddStudentModal.tsx  # Add new student modal
│   │   ├── EnrollStudentModal.tsx # Multi-step enrollment wizard
│   │   ├── EnrollmentList.tsx   # Enrollment display with payment status
│   │   ├── StudentList.tsx      # Student cards with actions
│   │   ├── SessionList.tsx      # Session schedule display
│   │   └── ProgressReports.tsx  # Progress reports viewing
│   ├── tutor/                   # Tutor-specific components
│   │   ├── StudentList.tsx      # Assigned students list
│   │   ├── SessionList.tsx      # Session management
│   │   ├── LogSessionModal.tsx  # Session logging modal
│   │   ├── ProgressReportModal.tsx # Progress report creation
│   │   ├── TutorProfileModal.tsx # Profile completion
│   │   └── QuizQuestionsModal.tsx # Quiz question management
│   ├── admin/                   # Admin-specific components
│   │   ├── DashboardStats.tsx   # Platform statistics
│   │   ├── PendingTutorsList.tsx # Tutor approval queue
│   │   ├── AllTutorsList.tsx    # All tutors management
│   │   ├── AllStudentsList.tsx  # All students management
│   │   ├── UnmatchedEnrollmentsList.tsx # Enrollment matching
│   │   └── FailedPaymentsList.tsx # Failed payments management
│   ├── student/                 # Student-specific components
│   │   └── QuizTakingModal.tsx  # Quiz taking interface
│   ├── shared/                  # Shared/reusable components
│   │   ├── BrandHeader.tsx      # Platform header with navigation
│   │   ├── DashboardNav.tsx      # Dashboard navigation
│   │   ├── Navbar.tsx           # Main navigation bar
│   │   ├── Sidebar.tsx          # Sidebar navigation
│   │   ├── Modal.tsx            # Generic modal component
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   ├── EmptyState.tsx       # Empty state display
│   │   ├── ErrorBoundary.tsx    # Error boundary component
│   │   ├── ErrorBoundaryWrapper.tsx # Error boundary wrapper
│   │   ├── DataTable.tsx        # Data table component
│   │   ├── StatCard.tsx         # Statistics card
│   │   ├── StatusBadge.tsx      # Status badges
│   │   ├── SegmentedControl.tsx # Tab control
│   │   ├── SkeletonLoader.tsx   # Skeleton loading states
│   │   ├── UUIDInput.tsx        # UUID input field
│   │   ├── Avatar.tsx           # User avatar with initials
│   │   ├── ProfilePictureUpload.tsx # Profile picture upload component
│   │   ├── ThemeToggle.tsx      # Theme toggle button
│   │   ├── AppearanceSettings.tsx # Theme settings panel
│   │   └── AuthProvider.tsx     # Authentication provider with user sync
│   └── ui/                      # Radix UI components
│       ├── button.tsx           # Button component
│       ├── card.tsx             # Card component
│       ├── input.tsx            # Input component
│       ├── label.tsx            # Label component
│       ├── select.tsx           # Select component
│       ├── textarea.tsx         # Textarea component
│       ├── checkbox.tsx         # Checkbox component
│       ├── dialog.tsx           # Dialog component
│       ├── table.tsx            # Table component
│       ├── badge.tsx            # Badge component
│       ├── link.tsx             # Link component
│       ├── toast.tsx            # Toast notification
│       ├── toaster.tsx          # Toast container
│       └── password-input.tsx   # Password input with visibility toggle
├── lib/                         # Utility libraries
│   ├── api.ts                   # Centralized API client
│   ├── auth.ts                  # Authentication utilities
│   ├── types.ts                 # TypeScript type definitions
│   ├── paystack.ts              # Paystack integration
│   ├── use-auth.ts              # Custom auth hook
│   ├── theme-provider.tsx       # Theme management
│   └── utils.ts                 # General utilities
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── next.config.js               # Next.js configuration
```

## Core Features

### 1. Authentication System

#### User Roles
- **Parent:** Can register, add students, create enrollments, make payments
- **Tutor:** Can register, complete profile, view assigned students, log sessions
- **Student:** Login with student code + PIN, view schedule, assignments, grades
- **Admin:** Platform management, tutor approval, enrollment matching

#### Authentication Flow
1. **Registration:** Users register with email, password, and role selection
2. **Email Verification:** OTP sent to email for verification
3. **Login:** JWT tokens stored in httpOnly cookies
4. **Token Refresh:** Automatic token refresh on 401 errors
5. **Student Login:** Separate login using student code + 6-digit PIN

#### Key Components
- `LoginForm.tsx` - Handles parent/tutor login with role selection
- `RegisterForm.tsx` - Multi-step registration with role-based fields
- `StudentLoginForm.tsx` - Student-specific authentication
- `VerifyForm.tsx` - OTP verification with countdown timer

### 2. Parent Dashboard

#### Student Management
- Add new students with detailed information
- View student profiles with activity statistics
- Regenerate student PINs
- Copy student codes for easy sharing

#### Enrollment System
- **Multi-step enrollment wizard:**
  - Step 1: Select student and subjects (1-4 subjects)
  - Step 2: Choose session frequency (Twice/Thrice/Five times weekly)
  - Step 3: Select available days
  - Step 4: Set preferred time slots and billing frequency
  - Payment: Initiate Paystack payment

- **Enrollment Features:**
  - Real-time pricing calculation based on grade bands
  - Multi-subject enrollment support
  - Group enrollment with single payment
  - Currency selection (NGN/USD)

#### Payment Integration
- **Paystack Integration:**
  - Inline popup mode (when public key configured)
  - Fallback to hosted checkout
  - Payment callback handling with verification
  - Payment history and status tracking

- **Payment Flow:**
  1. Initiate payment with enrollment group ID
  2. Redirect to Paystack (inline or hosted)
  3. Callback URL: `/payment/callback?reference=...`
  4. Verify payment status with backend
  5. Activate enrollments on success

#### Session Management
- View upcoming sessions with countdown timers
- Access Google Meet meeting links
- View session history and homework
- Track attendance records

#### Academic Tracking
- View student assignments and due dates
- Monitor grades and progress reports
- Track attendance statistics
- View student activity summaries

#### Pricing Information
- **Public pricing page:** View all available subjects and their pricing
- **Grade band breakdown:**
  - Preschool to Grade 1
  - Grade 2 to Grade 4
  - Grade 5 to Grade 8
  - Grade 9 to Grade 12
- **Currency display:** Both NGN and USD prices shown
- **Subject categories:** Core, Enrichment, Test Preparation
- **Active/inactive status:** Shows which subjects are currently available
- **Yearly pricing:** Base prices before billing frequency application

#### Complaint System
- **File complaints:** Submit issues regarding tutors, students, or general platform matters
- **Complaint categories:**
  - TUTOR - Tutor-related concerns
  - STUDENT - Student-related issues
  - GENERAL - Billing/platform issues
- **Complaint tracking:**
  - View all filed complaints
  - Status indicators (Open, Resolved)
  - Admin reply display
  - Resolution timestamps
- **Modal interface:** Clean modal for filing new complaints
- **Admin communication:** Admin can reply to complaints with resolution details

### 3. Student Dashboard

#### Student Portal
- Login using student code + 6-digit PIN
- Personalized dashboard with upcoming classes
- Session schedule with Google Meet integration
- Assignment management

#### Academic Features
- View class schedule with countdown timers
- Access assignment details and submit work
- View grades and feedback
- Track attendance records
- Read progress reports

#### Performance Overview
- **Academic metrics dashboard:**
  - Average grade percentage with trend
  - Attendance rate with attendance/missed counts
  - Assignment completion rate
  - Quiz average percentage
- **Subject-wise grades:** Breakdown by subject with visual progress bars
- **Recent grades:** Latest graded assignments with dates
- **Assignment status breakdown:**
  - Total assignments
  - Completed, pending, overdue, late submissions
- **Period filtering:** Week, month, quarter, year, all time

#### My Tutors
- View all assigned tutors in card format
- Tutor profiles with avatars and bios
- Subject expertise display
- Upcoming session information
- Google Meet meeting links for scheduled sessions
- Direct messaging to tutors (starts conversation)
- Session history by tutor

#### Communication
- **Messaging Restrictions:** As of October 12, 2026, students cannot send messages directly. Tutors can only message admin, not students or parents. Parents can only message admin, not tutors.
- View communication guidelines
- Access assigned tutors to view their information
- Parents can message admin for support on student's behalf

### 4. Tutor Dashboard

#### Tutor Application Wizard
- **Multi-step application process:**
  - Step 1: About You (personal information, birthday, location)
  - Step 2: Teaching Experience (qualifications, subjects, grade levels, experience)
  - Step 3: Profile (bio, why teach, how heard about platform)
  - Step 4: Documents (upload CV, certificates - max 5 files, 5MB each)
  - Step 5: Review & Submit
- **Auto-save functionality:** Changes are saved automatically as you progress
- **Document validation:** PDF, DOC, DOCX, JPG, PNG accepted
- **Status tracking:** PENDING, SUBMITTED, APPROVED, REJECTED
- **Profile picture upload:** Separate from application documents

#### Profile Management
- Complete tutor profile with bio
- Specify subjects and expertise
- Set availability preferences
- Upload credentials (for admin approval)

#### Student Management
- View assigned students
- Access student profiles
- View enrollment details
- Track student progress

#### Session Management
- View scheduled sessions
- Log completed sessions
- Add homework assignments
- Track attendance

#### Progress Reporting
- Create detailed progress reports
- Provide feedback on student performance
- Set goals and recommendations
- Track report history

#### Quiz Management
- **Create Quiz Questions:**
  - Add multiple-choice questions to assignments
  - Set question text and 4 options
  - Mark correct answer
  - Assign points per question
  - View existing questions
- **Quiz Taking (Student):**
  - Timed quiz interface (30 seconds per question)
  - Immediate feedback on answers
  - Progress tracking
  - Automatic submission on timeout
  - Points calculation and display

### 5. Admin Dashboard

#### Platform Overview
- Real-time platform statistics
- User activity metrics
- Payment tracking
- System health monitoring

#### Tutor Management
- Approve/reject tutor applications
- View tutor profiles and credentials
- Manage tutor status
- Access all tutors list

#### Student Management
- View all registered students
- Access student details
- Monitor student activity
- Manage student accounts

#### Enrollment Matching
- View unmatched enrollments
- Assign tutors to enrollments
- Manage tutor-student matching
- Track enrollment status

#### Payment Management
- View failed payments
- Monitor payment issues
- Track transaction status
- Resolve payment disputes

#### Subject & Pricing Management
- Create and manage subjects
- Set pricing by grade band (NGN/USD)
- Organize subjects by category (Core, Enrichment, Test Prep)
- Update pricing in real-time
- Delete inactive subjects

#### Parent Directory
- View all registered parents
- Search and filter by status
- Access detailed parent profiles
- View children and enrollments
- Update enrollment pricing
- Manage parent accounts

#### Transaction Management
- View all payment transactions
- Filter by status, currency, provider
- Access payment details
- Add admin notes to payments
- Reverify pending payments with provider
- View revenue summaries and success rates

#### Complaint Management
- View and resolve user complaints
- Categorize complaints (Tutor, Student, General)
- Provide resolution replies
- Track complaint status (Open, Resolved)

#### Suspended Users
- View all suspended accounts
- Reactivate suspended users
- Monitor account status changes

#### Admin Messaging
- View message threads with parents and tutors
- Send messages to users
- Search and filter conversations
- Monitor unread messages
- Start new conversations
- Note: Tutors can only message admin, not students or parents. Parents can only message admin, not tutors.

## API Integration

### API Client (`lib/api.ts`)

The API client provides a centralized interface for backend communication with automatic token refresh and error handling.

#### Key Features
- **Automatic Token Refresh:** Handles 401 errors by refreshing tokens
- **Rate Limit Handling:** Shows user-friendly retry messages
- **Error Handling:** Consistent error messages across all endpoints
- **Request Logging:** Detailed console logging for debugging

#### Authentication Endpoints
```typescript
register(data: RegisterRequest): Promise<RegisterResponse>
verify(data: VerifyRequest): Promise<VerifyResponse>
resendOtp(email: string): Promise<{ message: string }>
login(data: LoginRequest): Promise<AuthResponse>
studentLogin(data: StudentLoginRequest): Promise<AuthResponse>
refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>
logout(): Promise<{ message: string }>
```

#### Student Endpoints
```typescript
getStudents(): Promise<Student[]>
createStudent(data: CreateStudentRequest): Promise<Student>
regenerateStudentPin(studentId: string): Promise<{ message: string }>
getStudentActivity(studentId: string): Promise<StudentActivity>
getStudentAttendance(studentId: string): Promise<StudentAttendance[]>
```

#### Subject & Enrollment Endpoints
```typescript
getSubjects(): Promise<Subject[]>
getEnrollments(status?: string): Promise<Enrollment[]>
createEnrollment(data: CreateEnrollmentRequest): Promise<{ enrollments: Enrollment[]; enrollmentGroupId: string }>
createSingleEnrollment(data: CreateSingleEnrollmentRequest): Promise<Enrollment>
```

#### Session & Assignment Endpoints
```typescript
getSessions(enrollmentId?: string, status?: string): Promise<Session[]>
updateSession(id: string, data: UpdateSessionRequest): Promise<Session>
getAssignments(enrollmentId?: string): Promise<Assignment[]>
createAssignment(data: AssignmentData): Promise<Assignment>
updateAssignmentStatus(assignmentId: string, status: string): Promise<Assignment>
```

#### Payment Endpoints
```typescript
initiatePayment(data: InitiatePaymentRequest): Promise<InitiatePaymentResponse>
getPayments(): Promise<Payment[]>
verifyPayment(reference: string): Promise<Payment>
```

#### Complaint Endpoints
```typescript
getComplaints(): Promise<Complaint[]>
fileComplaint(data: FileComplaintRequest): Promise<Complaint>
resolveComplaint(complaintId: string, reply: string): Promise<Complaint>
```

#### Quiz Endpoints
```typescript
getQuizQuestions(assignmentId: string): Promise<QuizQuestion[]>
createQuizQuestion(assignmentId: string, data: CreateQuizQuestionRequest): Promise<QuizQuestion>
startQuiz(assignmentId: string): Promise<QuizAttempt>
submitQuizAnswer(attemptId: string, data: SubmitAnswerRequest): Promise<{ isCorrect: boolean; pointsEarned: number }>
completeQuiz(attemptId: string): Promise<QuizAttempt>
```

#### Tutor Application Endpoints
```typescript
getTutorApplication(): Promise<TutorApplication>
updateTutorApplication(data: Partial<TutorApplication>): Promise<TutorApplication>
submitTutorApplication(): Promise<TutorApplication>
uploadTutorDocument(file: File): Promise<TutorDocument>
getTutorDocuments(): Promise<TutorDocument[]>
deleteTutorDocument(docId: string): Promise<{ message: string }>
getPublicSubjects(): Promise<Subject[]>
```

#### Profile Picture Endpoints
```typescript
uploadProfilePicture(file: File): Promise<{ profilePictureUrl: string }>
deleteProfilePicture(): Promise<{ message: string }>
```

#### Admin Endpoints
```typescript
getAdminSubjects(): Promise<Subject[]>
createSubject(data: CreateSubjectRequest): Promise<Subject>
updateSubject(subjectId: string, data: UpdateSubjectRequest): Promise<Subject>
deleteSubject(subjectId: string): Promise<{ message: string }>
updateSubjectPricing(subjectId: string, data: UpdatePricingRequest): Promise<SubjectPrice>
getParentDirectory(filters?: ParentDirectoryFilters): Promise<ParentDirectoryResponse>
getParentDetail(parentId: string): Promise<ParentDetailProfile>
updateEnrollmentPricing(enrollmentId: string, data: UpdatePricingRequest): Promise<Enrollment>
getTransactions(filters?: TransactionFilters): Promise<TransactionResponse>
getTransactionDetail(transactionId: string): Promise<PaymentDetail>
getTransactionSummary(): Promise<PaymentSummary>
addPaymentNote(transactionId: string, note: string): Promise<PaymentDetail>
reverifyPayment(transactionId: string): Promise<PaymentDetail>
getSuspendedUsers(): Promise<User[]>
reactivateUser(userId: string): Promise<{ message: string }>
```

#### Admin Endpoints
```typescript
getPendingTutors(): Promise<PendingTutor[]>
getTutors(status?: string): Promise<TutorWithProfile[]>
getAdminStudents(parentId?: string): Promise<AdminStudent[]>
updateTutorVetting(id: string, data: VettingRequest): Promise<TutorProfile>
getUnmatchedEnrollments(includeUnpaid?: boolean): Promise<Enrollment[]>
assignTutor(enrollmentId: string, data: AssignTutorRequest): Promise<Enrollment>
getFailedPayments(): Promise<Payment[]>
getAdminOverview(): Promise<AdminOverview>
```

### Payment Integration (`lib/paystack.ts`)

#### Paystack Checkout Options
```typescript
interface PaystackCheckoutOptions {
  accessCode?: string
  authorizationUrl?: string
  reference?: string
  onSuccess?: (reference: string) => void
  onCancel?: () => void
}
```

#### Integration Modes
1. **Inline Popup:** When `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is configured
2. **Hosted Checkout:** Fallback when public key is missing

#### Callback Handling
- Successful payments redirect to `/payment/callback?reference=...`
- Callback page verifies payment with backend
- Shows success/failure/error states
- Redirects to dashboard after completion

## Component Architecture

### Authentication & User Management

#### AuthProvider (`components/shared/AuthProvider.tsx`)
Global authentication provider that:
- Wraps the entire application
- Syncs user data with backend on mount
- Listens for auth:user-changed custom events
- Displays warning banners for SUSPENDED/REJECTED accounts
- Dismissible notification system for status warnings
- Automatic user state updates from localStorage

#### useAuth Hook (`lib/use-auth.ts`)
Custom hook for authentication management:
- Returns user object, loading state, error state
- Provides refreshUser() function for manual user sync
- Exposes isSuspended and isRejected flags
- Auto-refreshes user data on mount
- Caches user data in localStorage for fast initial render

### Shared Components

#### Modal Component
Reusable modal with header, body, and footer sections. Used for forms and confirmations.

#### Loading Spinner
Consistent loading indicator across the application.

#### Empty State
Placeholder component for empty data states with call-to-action.

#### Error Boundary
Catches React errors and displays user-friendly error messages.

#### Data Table
Sortable, filterable table component for data display.

#### Status Badge
Visual status indicators with color coding.

#### Stat Card
Card component for displaying statistics with icons.

#### Avatar
User avatar component that:
- Displays profile picture if available
- Falls back to initials with color-coded background
- Supports multiple sizes (sm, md, lg, xl)
- Consistent color mapping based on name

#### Profile Picture Upload
Profile picture management component with:
- Image preview before upload
- Client-side validation (file type, size)
- Automatic upload to server
- Remove/reupload functionality
- Loading states during upload

#### Theme Toggle
Theme switching button with:
- Light/dark mode toggle
- System preference support
- Icon updates based on current theme
- Smooth transitions

#### Appearance Settings
Theme settings panel with:
- Light mode option
- Dark mode option
- System preference option
- Visual preview of selected theme

#### Auth Provider
Authentication provider component that:
- Syncs user data with server on app load
- Listens for auth:user-changed events
- Displays warning banners for suspended/rejected accounts
- Dismissible notification system
- Automatic user state management

### Role-Specific Components

#### Parent Components
- **AddStudentModal:** Multi-step student creation form
- **EnrollStudentModal:** 4-step enrollment wizard with payment
- **EnrollmentList:** Displays enrollments with payment status
- **StudentList:** Card-based student display with actions

#### Tutor Components
- **StudentList:** Assigned students with session links
- **SessionList:** Session management with logging
- **LogSessionModal:** Session completion form
- **ProgressReportModal:** Progress report creation

#### Admin Components
- **DashboardStats:** Platform overview with metrics
- **PendingTutorsList:** Tutor approval queue
- **UnmatchedEnrollmentsList:** Enrollment matching interface
- **FailedPaymentsList:** Payment issue tracking

## Styling & Theming

### Color Scheme
- **Primary:** Brand gold (#D4A017)
- **Background:** Dark theme (#121212, #1a1a1a)
- **Text:** White/gray scale
- **Accent:** Gold for CTAs and highlights

### Tailwind Configuration
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4A017',
          goldLight: '#E8B923',
          dark: '#1a1a1a',
        },
        background: '#121212',
      },
    },
  },
}
```

### Design Patterns
- Dark theme with gold accents
- Card-based layouts
- Consistent spacing and typography
- Responsive design for mobile/desktop
- Accessible color contrasts

### Theme System

The application includes a comprehensive theme system built with a custom theme provider:

#### Theme Modes
- **Light Mode:** Clean, bright interface for daytime use
- **Dark Mode:** Dark interface for reduced eye strain (default)
- **System Mode:** Automatically follows system preference

#### Theme Provider (`lib/theme-provider.tsx`)
- Client-side theme detection and management
- localStorage persistence for theme preference
- System preference detection with matchMedia
- Automatic DOM class updates (light/dark)
- mounted state to prevent hydration mismatch

#### Theme Components
- **ThemeToggle:** Quick toggle button in header
- **AppearanceSettings:** Full theme panel in settings
- Automatic theme-aware component styling
- Smooth color transitions between themes

#### Implementation
```typescript
const { theme, setTheme, effectiveTheme, mounted } = useTheme()
// theme: 'light' | 'dark' | 'system'
// setTheme: Function to change theme
// effectiveTheme: The actual applied theme (resolves 'system')
// mounted: Boolean to prevent hydration issues
```

## Environment Configuration

### Required Environment Variables (`.env.local`)
```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://smart-tutor-9rjd.onrender.com/api

# Payment Configuration
NEXT_PUBLIC_PAYMENT_CURRENCY=NGN
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

### Optional Environment Variables
```env
# Development overrides
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## State Management

### Authentication State
- User data stored in `localStorage`
- JWT tokens in httpOnly cookies
- Automatic token refresh on API calls
- Role-based route protection

### Component State
- Local state for form handling
- React hooks for data fetching
- Server components for initial data load
- Client components for interactivity

## Data Flow

### Authentication Flow
1. User submits login form
2. API call to `/auth/login`
3. Tokens stored in cookies
4. User data stored in localStorage
5. Redirect to role-based dashboard

### Payment Flow
1. User initiates payment
2. Backend creates payment record
3. Paystack checkout opened
4. User completes payment
5. Redirect to callback URL
6. Frontend verifies payment
7. Activate enrollments

### Data Fetching Pattern
1. Server component fetches initial data
2. Client components handle updates
3. API client manages token refresh
4. Error boundaries catch failures
5. Loading states during fetches

## Performance Optimizations

### Code Splitting
- Route-based code splitting with Next.js App Router
- Dynamic imports for heavy components
- Lazy loading for modals

### Image Optimization
- Next.js Image component for optimized images
- Responsive image loading
- Blur placeholders during load

### API Optimization
- Request deduplication
- Automatic token refresh
- Rate limit handling
- Error retry logic
- localStorage caching for message data
- Polling intervals for real-time updates

### Image Optimization
- Next.js Image component for optimized images
- Responsive image loading
- Blur placeholders during load

### API Optimization
- Request deduplication
- Automatic token refresh
- Rate limit handling
- Error retry logic

## Security Features

### Authentication
- JWT tokens with expiration
- httpOnly cookies for token storage
- Automatic token refresh
- Secure route protection
- User status verification (SUSPENDED/REJECTED detection)
- Warning banners for restricted accounts

### Data Protection
- Role-based access control
- Input validation with Zod
- XSS protection with React
- CSRF protection
- File upload validation (type, size)
- Client-side image validation

### Data Protection
- Role-based access control
- Input validation with Zod
- XSS protection with React
- CSRF protection

### Payment Security
- Server-side payment initiation
- Secure callback handling
- Payment verification with backend
- No sensitive data in frontend

## Messaging System

### Overview
The platform includes a messaging system for communication between users:

### Role-Based Messaging Access

#### Parent Messaging
- **Admin only:** Can only message admin (as of October 12, 2026)
- **Thread-based:** Conversations organized in threads
- **Real-time updates:** Polling for new messages every 2 minutes
- **Caching:** localStorage caching to reduce API calls
- **Admin contact:** Special endpoint to contact administration
- **Message threading:** View conversation history with participants

#### Admin Messaging
- **Multi-user support:** Can message parents and tutors
- **Search & filter:** Find conversations by name
- **Unread filtering:** View only unread messages
- **New conversation:** Start new threads with any user
- **User directory:** Load parents and tutors for new messages
- **Read receipts:** Track message read status

#### Student Messaging
- **Restricted:** Students cannot send messages (as of October 12, 2026)
- **Information page:** Displays guidelines for communication
- **Parent coordination:** Directs students to use parents for communication
- **Tutor viewing:** Can view assigned tutors but not message them

#### Tutor Messaging
- **Admin only:** Can only message admin (as of October 12, 2026)
- **Thread-based:** Organized conversations
- **Profile linking:** Linked to tutor profiles and student enrollments

### Messaging Features

#### Message Threads
- Participant information display
- Last message preview
- Unread count badges
- Thread search functionality
- Timestamp tracking

#### Message Display
- Sent/received message styling
- Timestamp display
- Sender identification
- Message content rendering
- Scrollable message history

#### Performance Optimizations
- **Caching strategy:**
  - Threads cached for 2 minutes
  - Messages cached for 1 minute
  - Fallback to cache on API errors
- **Polling:** Auto-refresh every 2 minutes
- **Force refresh:** Manual refresh buttons available
- **Batch loading:** Load threads and messages in parallel where possible

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly interfaces
- Progressive enhancement

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

### Build for Production
```bash
# Create production build
npm run build

# Start production server
npm start
```

### Linting
```bash
npm run lint
```

## Deployment

### Vercel Deployment
- Connected to GitHub repository
- Automatic deployments on push
- Environment variables configured in Vercel
- Production URL: https://teach-me-hub.vercel.app

### Environment Variables in Production
- `NEXT_PUBLIC_API_URL`: Production backend URL
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Live Paystack key
- `NEXT_PUBLIC_PAYMENT_CURRENCY`: Production currency

## Troubleshooting

### Common Issues

#### Payment Not Redirecting
- Check `FRONTEND_URL` in backend `.env`
- Verify Paystack callback configuration
- Ensure payment verification endpoint is working

#### Token Refresh Failures
- Check cookie settings
- Verify backend refresh endpoint
- Clear localStorage and re-login

#### Student Login Issues
- Verify student code and PIN
- Check backend student authentication
- Ensure student account is active

#### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend server status
- Review CORS configuration

## Future Enhancements

### Planned Features
- Real-time notifications with WebSocket
- File upload for assignments
- Video recording integration
- Advanced analytics dashboard
- Mobile app (React Native)
- Multi-language support
- Advanced search and filtering
- Bulk operations for admin

### Technical Improvements
- Server-side rendering optimization
- Advanced caching strategies
- Performance monitoring
- A/B testing framework
- Advanced error tracking
- Automated testing pipeline

## Contributing

### Code Style
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Component-based architecture
- Consistent naming conventions
- Comment complex logic

### Testing
- Unit tests for utilities
- Integration tests for API
- E2E tests for critical flows
- Visual regression testing

### Documentation
- Update README for new features
- Document component props
- Comment complex functions
- Maintain API documentation

## Support

For issues or questions:
- GitHub Issues: https://github.com/Lucid-spacex/Teach-Me-Hub/issues
- Email: support@teachmehub.com
- Documentation: https://docs.teachmehub.com

## License

ISC License - See LICENSE file for details

## Recent Feature Additions

### Theme System (Late 2026)
- Implemented comprehensive theme provider with light/dark/system modes
- Added ThemeToggle component for quick theme switching
- Created AppearanceSettings panel in settings pages
- Theme persistence in localStorage
- System preference detection and automatic switching
- Prevents hydration mismatch with mounted state

### Tutor Application System (October 2026)
- Complete multi-step tutor application wizard
- 5-step process: About You, Teaching, Profile, Documents, Review
- Auto-save functionality with debounced updates
- Document upload system (max 5 files, 5MB each)
- Profile picture upload separate from documents
- Support for rejected tutors to view application status
- File validation (PDF, DOC, DOCX, JPG, PNG, GIF, WebP)
- Subject selection grouped by category
- Grade level selection with predefined options
- Years of experience tracking
- Bio and motivation sections with word counts

### Quiz System (October 2026)
- **Tutor-side:**
  - QuizQuestionsModal for creating quiz questions
  - Add multiple-choice questions to assignments
  - Set question text, 4 options, correct answer, points
  - View existing questions in enrollment
  - Mark correct answer with visual indicator
- **Student-side:**
  - QuizTakingModal for taking quizzes
  - Timed interface (30 seconds per question)
  - Immediate feedback on answer submission
  - Progress bar showing quiz completion
  - Points earned display per question
  - Auto-submit on timeout
  - Navigate between questions

### Enhanced Admin Features (October 2026)
- **Subjects & Pricing Management:**
  - Create/edit/delete subjects
  - Set pricing by grade band (4 bands)
  - NGN and USD pricing
  - Subject categories (Core, Enrichment, Test Prep)
  - Active/inactive status toggle
  - Real-time price updates
- **Parent Directory:**
  - Search and filter parents
  - View detailed parent profiles
  - Children list with enrollments
  - Update enrollment pricing per enrollment
  - Payment history tracking
  - Complaint count tracking
- **Transaction Management:**
  - View all payment transactions
  - Filter by status, currency, provider
  - Payment detail view with enrollment info
  - Add admin notes to payments
  - Reverify pending payments with provider
  - Revenue summary (NGN/USD)
  - Success rate calculation
  - Pagination support
- **Complaint Management:**
  - View all user complaints
  - Categorize by type (Tutor, Student, General)
  - Resolve with admin reply
  - Status tracking (Open, Resolved)
- **Suspended Users:**
  - View all suspended accounts
  - Reactivate users
  - Filter by role
- **Enhanced Messaging:**
  - Thread-based conversation view
  - Search by participant name
  - Unread-only filter
  - Start new conversations
  - User directory for messaging
  - Polling for new messages

### Student Performance Dashboard (October 2026)
- Comprehensive performance overview page
- Key metrics with trend indicators:
  - Average grade percentage
  - Attendance rate
  - Assignment completion rate
  - Quiz average
- Subject-wise grade breakdown
- Recent grades list with dates
- Assignment status breakdown (total, completed, pending, overdue, late)
- Period filtering (week, month, quarter, year, all time)
- Visual progress bars and icons

### Student "My Tutors" Page (October 2026)
- Card-based tutor display
- Avatar with initials fallback
- Tutor bio and subject expertise
- Upcoming session information
- Google Meet meeting links for scheduled sessions
- Direct messaging to tutors
- Session history modal per tutor
- Filter by enrollment

### Parent Complaint System (October 2026)
- File complaints regarding tutors, students, or platform
- Modal interface for complaint submission
- Category selection (Tutor, Student, General)
- Description field for details
- View all filed complaints
- Status indicators (Open, Resolved)
- Admin reply display with timestamps
- Resolution notifications

### Parent Pricing Page (October 2026)
- Public pricing information for all subjects
- Grade band breakdown with color coding
- NGN and USD pricing display
- Subject category grouping
- Active/inactive status badges
- Explanatory banner about pricing structure

### Messaging System Updates (October 2026)
- **Parent Messaging:**
  - Full messaging with admin and tutors
  - Thread-based conversations
  - Caching strategy to reduce API calls
  - Admin contact endpoint
  - Auto-refresh every 2 minutes
- **Admin Messaging:**
  - Multi-user support (parents and tutors)
  - Search and filter conversations
  - Unread message filtering
  - Start new conversations with any user
  - User directory integration
- **Student Messaging:**
  - Restricted access (informational page only)
  - Communication guidelines displayed
  - Redirects to "My Tutors" page
  - Explains parent coordination requirement
- **Performance Optimizations:**
  - localStorage caching (2min threads, 1min messages)
  - Fallback to cache on API errors
  - Polling intervals for real-time updates
  - Force refresh buttons

### Profile Picture System (October 2026)
- ProfilePictureUpload component
- Client-side validation (type, size)
- Image preview before upload
- Automatic upload to server
- Remove/reupload functionality
- Avatar component with initials fallback
- Color-coded backgrounds based on name
- Multiple size variants (sm, md, lg, xl)
- Consistent avatar display across platform

### UI Component Enhancements (October 2026)
- **Password Input:**
  - Show/hide password toggle
  - Eye/EyeOff icons
  - Integrated with existing Input component
- **Error Boundary Wrapper:**
  - Simplified wrapper for easy integration
  - Catches React errors gracefully
- **Enhanced Status Badges:**
  - Additional status types
  - Better visual feedback
- **Improved Loading States:**
  - Consistent LoadingSpinner usage
  - Better loading messages

### API Enhancements (October 2026)
- **Profile Picture Endpoints:**
  - uploadProfilePicture(file)
  - deleteProfilePicture()
- **Quiz Endpoints:**
  - getQuizQuestions(assignmentId)
  - createQuizQuestion(assignmentId, data)
  - startQuiz(assignmentId)
  - submitQuizAnswer(attemptId, data)
  - completeQuiz(attemptId)
- **Tutor Application Endpoints:**
  - getTutorApplication()
  - updateTutorApplication(data)
  - submitTutorApplication()
  - uploadTutorDocument(file)
  - getTutorDocuments()
  - deleteTutorDocument(docId)
  - getPublicSubjects()
- **Complaint Endpoints:**
  - getComplaints()
  - fileComplaint(data)
  - resolveComplaint(complaintId, reply)
- **Admin Endpoints:**
  - getAdminSubjects()
  - createSubject(data)
  - updateSubject(subjectId, data)
  - deleteSubject(subjectId)
  - updateSubjectPricing(subjectId, data)
  - getParentDirectory(filters)
  - getParentDetail(parentId)
  - updateEnrollmentPricing(enrollmentId, data)
  - getTransactions(filters)
  - getTransactionDetail(transactionId)
  - getTransactionSummary()
  - addPaymentNote(transactionId, note)
  - reverifyPayment(transactionId)
  - getSuspendedUsers()
  - reactivateUser(userId)
- **Performance Endpoints:**
  - getStudentPerformance(period)

### Authentication Improvements (October 2026)
- AuthProvider with automatic user sync
- useAuth hook for authentication state
- Suspended/Rejected account detection
- Warning banners for restricted accounts
- Custom event system for user changes
- Fast initial render from localStorage
- Server reconciliation on mount

## Credits

- Built with Next.js and TypeScript
- UI components from Radix UI
- Icons from Lucide React
- Styling with Tailwind CSS
- Payment processing by Paystack
