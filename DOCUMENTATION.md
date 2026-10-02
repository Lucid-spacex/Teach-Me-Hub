# Teach-Me-Hub - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Authentication System](#authentication-system)
4. [Parent Portal](#parent-portal)
5. [Tutor Portal](#tutor-portal)
6. [Student Portal](#student-portal)
7. [API Integration](#api-integration)
8. [Project Structure](#project-structure)
9. [Development Setup](#development-setup)
10. [Key Components](#key-components){
    "error": "Validation failed",
    "details": [
        {
            "field": "password",
            "message": "Password must contain at least one uppercase letter"
        }
    ]
}

---

## Project Overview

Teach-Me-Hub is a comprehensive tutoring platform that connects parents, students, and tutors in a managed educational environment. The platform provides:

- **Parent Portal**: Manage children's education, enroll in subjects, track progress, and communicate with tutors
- **Tutor Portal**: Manage assigned students, conduct sessions, submit progress reports, and communicate with families
- **Student Portal**: View schedules, complete assignments, track grades, and communicate with tutors

The platform uses a role-based access control system with JWT authentication and integrates with a backend API for all data operations.

---

## Tech Stack

### Frontend Framework
- **Next.js 16.3** (App Router) - React framework with server-side rendering
- **React 19.2** - UI library
- **TypeScript 7.0** - Type-safe JavaScript

### Styling
- **Tailwind CSS 4.3** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### State Management
- **React Hooks** - useState, useEffect, useRef
- **Context API** - Auth provider
- **Custom Hooks** - useAuth for authentication

### Forms & Validation
- **React Hook Form 7.86** - Form management
- **Zod 4.4** - Schema validation

### Authentication
- **JWT Tokens** - Access and refresh tokens
- **HTTP-only Cookies** - Secure token storage
- **Email OTP** - Email verification system

---

## Authentication System

### User Roles
- **PARENT** - Manages children and enrollments
- **TUTOR** - Provides tutoring services
- **STUDENT** - Receives tutoring services
- **ADMIN** - Platform management (not covered in this documentation)

### Authentication Flow

#### 1. Registration
**Endpoint**: `POST /auth/register`

**Features**:
- Parent and Tutor registration
- Email, phone, password validation
- Role selection
- Auto-redirect to verification page

**Form Fields**:
- `fullName` - User's full name
- `email` - Email address
- `phone` - Phone number
- `password` - Password
- `role` - User role (PARENT/TUTOR)

#### 2. Email Verification
**Endpoint**: `POST /auth/verify`

**Features**:
- OTP-based email verification
- Auto-fill from email parsing
- Error handling for invalid/expired codes
- Redirect to login after successful verification

**Form Fields**:
- `email` - Email address
- `otp` - One-time password from email

#### 3. Login
**Endpoint**: `POST /auth/login`

**Features**:
- JWT token generation
- Automatic token refresh
- Role-based redirect
- Persistent session with cookies

**Form Fields**:
- `email` - Email address
- `password` - Password

#### 4. Student Login
**Endpoint**: `POST /auth/student-login`

**Features**:
- Student-specific authentication
- Uses parent email + student code + PIN
- Redirects to student dashboard

**Form Fields**:
- `parentEmail` - Parent's email address
- `studentCode` - Student's unique code
- `studentPin` - Student's PIN

#### 5. Token Management
- **Access Token**: Stored in HTTP-only cookie, 1-hour expiry
- **Refresh Token**: Stored in HTTP-only cookie, 7-day expiry
- **Auto-refresh**: Automatic token refresh on 401 errors
- **Logout**: Clears tokens and redirects to login

### Auth Utilities

**Location**: `lib/auth.ts`

**Functions**:
- `getUser()` - Get current user from localStorage
- `getUserRole()` - Get user role from localStorage
- `isLoggedIn()` - Check authentication status
- `logout()` - Clear authentication data

---

## Parent Portal

### Dashboard (`/parent`)

**Overview**:
The parent dashboard provides a comprehensive overview of all children's educational activities.

**Key Features**:
- Welcome banner with user name
- Quick stats (registered children, active enrollments, live sessions, progress reports)
- Quick action buttons (add child, enroll subject)
- Children list with detailed information
- Enrollment management
- Upcoming sessions overview
- Academic progress reports

**Quick Stats**:
1. **Registered Children** - Total student profiles
2. **Active Enrollments** - Currently active subject enrollments
3. **Live Tutoring Sessions** - Scheduled weekly classes
4. **Progress Reports** - Teacher evaluations and feedback

**Quick Actions**:
- **Add Child** - Register a new student profile
- **Enroll Subject** - Enroll existing children in new subjects
- **Refresh** - Reload dashboard data

### Student Management (`/parent/students`)

**Features**:
- View all registered children
- Add new student profiles
- Edit student information
- View student details (grades, assignments, sessions)
- Delete student profiles

**Student Profile Includes**:
- Full name and date of birth
- Grade level and gender
- School information
- Notes and preferences
- Email and preferred start date
- Student code and PIN for login

**Add Student Modal**:
- Full name
- Date of birth
- Grade level (Preschool to Grade 12)
- Gender selection
- School (optional)
- Notes (optional)
- Email (optional)
- Preferred start date (optional)

### Enrollment Management (`/parent/enrollments`)

**Features**:
- View all enrollments by status
- Create new enrollments
- Subject selection with pricing
- Session frequency selection
- Available days selection
- Time slot selection
- Payment initiation

**Enrollment Process**:
1. Select student from registered children
2. Choose subject(s) from available list
3. Select session frequency (twice/thrice/five times weekly)
4. Choose available days
5. Set preferred time range
6. Select billing frequency (weekly/monthly/yearly)
7. Initiate payment via Paystack

**Enrollment Statuses**:
- `ACTIVE` - Currently enrolled and receiving tutoring
- `PENDING_PAYMENT` - Awaiting payment completion
- `PAUSED` - Temporarily suspended
- `COMPLETED` - Enrollment finished
- `CANCELLED` - Cancelled by parent

### Sessions (`/parent/sessions`)

**Features**:
- View upcoming tutoring sessions
- View session history
- Access Zoom meeting links
- Check session status
- View tutor information

**Session Information**:
- Subject and tutor details
- Scheduled date and time
- Duration
- Zoom meeting link
- Session status (SCHEDULED/COMPLETED/MISSED/CANCELLED)
- Recording availability

### Grades & Progress (`/parent/grades`)

**Features**:
- View student grades across all subjects
- Access detailed progress reports
- Review tutor feedback
- Track academic performance
- View assignment scores

**Progress Reports Include**:
- Period summary
- Student strengths
- Areas for improvement
- Tutor recommendations
- Overall performance assessment

### Assignments (`/parent/assignments`)

**Features**:
- View all student assignments
- Track assignment status
- View due dates
- Monitor completion rates
- Access assignment details

**Assignment Types**:
- `ASSIGNMENT` - Regular homework
- `CLASSWORK` - In-class activities
- `TEST` - Assessments and quizzes

**Assignment Statuses**:
- `PENDING` - Not yet submitted
- `SUBMITTED` - Submitted awaiting grading
- `GRADED` - Completed with grade

### Payments (`/parent/payments`)

**Features**:
- View payment history
- Initiate new payments
- Check payment status
- View invoices
- Handle failed payments

**Payment Integration**:
- Paystack payment gateway
- Support for NGN and USD currencies
- Automatic payment verification
- Receipt generation

**Payment Statuses**:
- `SUCCESS` - Payment completed
- `PENDING` - Payment processing
- `FAILED` - Payment failed

### Messages (`/parent/messages`)

**Features**:
- Direct communication with tutors and admin
- Thread-based messaging
- Real-time message updates
- Unread message indicators
- Message search functionality

**Message Features**:
- Start new conversations
- Send text messages
- View message history
- Mark messages as read
- Search conversations

### Notifications (`/parent/notifications`)

**Features**:
- View system notifications
- Notification categories (sessions, assignments, payments)
- Mark notifications as read
- Notification history

**Notification Types**:
- `MESSAGE` - New messages
- `SESSION` - Session updates
- `ASSIGNMENT` - Assignment reminders
- `PAYMENT` - Payment notifications
- `GENERAL` - System announcements

### Settings (`/parent/settings`)

**Features**:
- Update profile information
- Change password
- Manage account settings
- Timezone preferences

---

## Tutor Portal

### Dashboard (`/tutor`)

**Overview**:
The tutor dashboard provides tools for managing students, sessions, and professional development.

**Key Features**:
- Profile status indicator
- Quick stats (assigned students, active enrollments, upcoming sessions)
- Student list with enrollment details
- Session management
- Progress report submission
- Profile creation and editing

**Quick Stats**:
1. **Assigned Students** - Total students under tutor's care
2. **Active Enrollments** - Currently active enrollments
3. **Upcoming Sessions** - Scheduled tutoring sessions
4. **Profile Status** - Profile completion status

**Profile Warning**:
- Displays warning if tutor profile is incomplete
- Blocks student assignments until profile is complete
- Quick action to complete profile

### Student Management (`/tutor/students`)

**Features**:
- View assigned students
- Access student profiles
- View enrollment details
- Check student grades
- Review assignment status
- Track student progress

**Student Information**:
- Student name and grade level
- Enrollment subject and frequency
- Session schedule
- Academic performance
- Assignment completion rate

**Student Detail View**:
- Full student profile
- Enrollment history
- Academic progress
- Assignment history
- Session attendance

### Sessions (`/tutor/sessions`)

**Features**:
- View scheduled sessions
- Create new sessions
- Reschedule sessions
- Log session outcomes
- Add tutor notes
- Assign homework
- Mark attendance

**Session Management**:
- Schedule individual sessions
- Set duration and timing
- Provide Zoom meeting links
- Record session outcomes
- Add homework assignments
- Track student attendance

**Session Logging**:
- Mark session as completed/missed
- Add detailed tutor notes
- Assign homework
- Provide session feedback
- Update student progress

### Progress Reports (`/tutor/progress-reports`)

**Features**:
- Submit progress reports for students
- Track report history
- Provide detailed feedback
- Set improvement goals

**Progress Report Components**:
- Period summary
- Student strengths
- Areas for improvement
- Tutor recommendations
- Action items for next period

### Assignments (`/tutor/assignments`)

**Features**:
- Create assignments for students
- Set due dates
- Define assignment types
- Track submission status
- Grade completed assignments

**Assignment Creation**:
- Select enrollment/student
- Set assignment title and description
- Choose assignment type (homework/classwork/test)
- Set due date
- Add detailed instructions

### Grades (`/tutor/grades`)

**Features**:
- Grade student assignments
- Provide feedback
- Track grade history
- View grade statistics

**Grading Process**:
- Select assignment to grade
- Enter score and maximum score
- Provide detailed feedback
- Submit for approval
- Update student records

### Messages (`/tutor/messages`)

**Features**:
- Communicate with parents and students
- Thread-based messaging
- Start new conversations
- Search conversations
- Unread message indicators

**Message Capabilities**:
- Send messages to assigned students
- Communicate with parents
- Receive admin communications
- Track conversation history

### Tutor Profile (`/tutor/profile`)

**Features**:
- Create comprehensive tutor profile
- Edit profile information
- Set availability schedule
- Update subjects and credentials
- Set hourly rates

**Profile Components**:
- Personal information
- Subjects and specializations
- Teaching experience and bio
- Credentials and certifications
- Availability schedule
- Hourly rates
- Vetting status

**Profile Requirements**:
- List of teachable subjects
- Professional bio
- Credentials URL
- Availability schedule
- Hourly rate
- Vetting approval

### Complaints (`/tutor/complaints`)

**Features**:
- File complaints about students
- Track complaint status
- View complaint history
- Receive admin responses

**Complaint Process**:
- Select complaint type (student/general)
- Provide detailed description
- Submit for admin review
- Track resolution status

### Notifications (`/tutor/notifications`)

**Features**:
- View system notifications
- Session reminders
- Assignment notifications
- New student assignments
- Profile updates

---

## Student Portal

### Dashboard (`/student`)

**Overview**:
The student dashboard provides a personalized learning environment with schedule visibility and assignment tracking.

**Key Features**:
- Next live class countdown
- Quick stats (attendance, assignments, grades)
- Weekly schedule overview
- Recent assignments
- Quick access to all features

**Next Class Card**:
- Shows upcoming live session
- Real-time countdown timer
- Subject and tutor information
- Direct Zoom meeting link
- Session duration and timing

**Quick Stats**:
1. **Attendance Rate** - Class attendance percentage
2. **Due Assignments** - Pending assignment count
3. **Submitted Work** - Completed assignments
4. **Performance** - Academic performance indicator

### Schedule (`/student/schedule`)

**Features**:
- View complete class schedule
- Filter by subject or status
- Access Zoom meeting links
- View session details
- Check session status

**Schedule Information**:
- Subject and tutor
- Date and time
- Duration
- Meeting link
- Session status
- Recording availability

### Assignments (`/student/assignments`)

**Features**:
- View all assignments
- Filter by status or subject
- Access assignment details
- Submit completed work
- View grades and feedback

**Assignment Types**:
- Regular homework assignments
- In-class activities
- Tests and quizzes

**Assignment Workflow**:
1. View assignment details
2. Complete work offline
3. Submit before deadline
4. Receive grade and feedback
5. Track performance

### Grades (`/student/grades`)

**Features**:
- View grade history
- Filter by subject
- Check assignment scores
- Review tutor feedback
- Track academic progress

**Grade Information**:
- Assignment title and type
- Score and maximum score
- Percentage achieved
- Tutor feedback
- Grade status

### Attendance (`/student/attendance`)

**Features**:
- View attendance history
- Check attendance rate
- View session details
- Track missed sessions

**Attendance Tracking**:
- Session-by-session attendance
- Overall attendance percentage
- Reason for missed sessions
- Attendance trends

### Progress Reports (`/student/progress-reports`)

**Features**:
- View tutor evaluations
- Read progress summaries
- Check strengths and areas for improvement
- Review tutor recommendations

**Report Components**:
- Period performance summary
- Academic strengths
- Areas needing improvement
- Tutor recommendations
- Goals for next period

### Messages (`/student/messages`)

**Features**:
- Communicate with assigned tutor
- View message history
- Send questions and concerns
- Receive tutor responses

**Messaging Features**:
- Direct tutor communication
- Thread-based conversations
- Real-time updates
- Message search

### Profile (`/student/profile`)

**Features**:
- View student profile
- Update personal information
- Check enrollment details
- View academic summary

**Profile Information**:
- Personal details
- Grade level
- Enrolled subjects
- Assigned tutor
- Academic summary

### Settings (`/student/settings`)

**Features**:
- Update profile information
- Change timezone
- Manage account settings

### My Tutors (`/student/my-tutors`)

**Features**:
- View assigned tutors
- Access tutor profiles
- View tutor qualifications
- Check tutor availability

### Notifications (`/student/notifications`)

**Features**:
- View system notifications
- Session reminders
- Assignment due dates
- Grade updates
- New messages

---

## API Integration

### API Client

**Location**: `lib/api.ts`

**Base URL**: `https://smart-tutor-9rjd.onrender.com/api`

### Authentication Endpoints

```typescript
// Registration
api.register(data: RegisterRequest): Promise<RegisterResponse>

// Email Verification
api.verify(data: VerifyRequest): Promise<VerifyResponse>

// Resend OTP
api.resendOtp(email: string): Promise<{ message: string }>

// Login
api.login(data: LoginRequest): Promise<AuthResponse>

// Student Login
api.studentLogin(data: StudentLoginRequest): Promise<AuthResponse>

// Token Refresh
api.refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>

// Logout
api.logout(): Promise<{ message: string }>
```

### Student Endpoints

```typescript
// Get Students
api.getStudents(): Promise<Student[]>

// Create Student
api.createStudent(data: CreateStudentRequest): Promise<Student>

// Get Student Activity
api.getStudentActivity(studentId: string): Promise<StudentActivity>

// Get Student Attendance
api.getStudentAttendance(studentId: string): Promise<StudentAttendance[]>

// Regenerate Student PIN
api.regenerateStudentPin(studentId: string): Promise<{ message: string }>

// Student Profile
api.getStudentProfile(): Promise<StudentProfile>

// Student Schedule
api.getStudentSchedule(): Promise<Session[]>

// Student Enrollments
api.getStudentEnrollments(): Promise<Enrollment[]>

// Student Sessions
api.getStudentEnrollmentSessions(enrollmentId: string): Promise<Session[]>

// Next Class
api.getStudentNextClass(): Promise<{ session: Session; countdown: string } | null>

// Student Assignments
api.getStudentAssignments(): Promise<Assignment[]>

// Student Grades
api.getStudentGrades(): Promise<Grade[]>

// Student Progress Reports
api.getStudentProgressReports(): Promise<ProgressReport[]>

// Student Attendance Summary
api.getStudentAttendanceSummary(): Promise<{ attendanceRate: number; sessions: StudentAttendance[] }>

// Student Notifications
api.getStudentNotifications(): Promise<Notification[]>
```

### Subject Endpoints

```typescript
// Get Subjects
api.getSubjects(): Promise<Subject[]>
```

### Enrollment Endpoints

```typescript
// Get Enrollments
api.getEnrollments(status?: string): Promise<Enrollment[]>

// Create Enrollment
api.createEnrollment(data: CreateEnrollmentRequest): Promise<{ enrollments: Enrollment[]; enrollmentGroupId: string }>

// Create Single Subject Enrollment
api.createSingleEnrollment(data: CreateSingleEnrollmentRequest): Promise<Enrollment>
```

### Session Endpoints

```typescript
// Get Sessions
api.getSessions(enrollmentId?: string, status?: string): Promise<Session[]>

// Update Session
api.updateSession(id: string, data: UpdateSessionRequest): Promise<Session>
```

### Tutor Endpoints

```typescript
// Get Tutor Students
api.getTutorStudents(): Promise<TutorStudent[]>

// Get Tutor Sessions
api.getTutorSessions(): Promise<Session[]>

// Create Tutor Session
api.createTutorSession(data: { enrollmentId: string; scheduledAt: string; durationMinutes: number }): Promise<Session>

// Reschedule Tutor Session
api.rescheduleTutorSession(sessionId: string, data: { scheduledAt: string }): Promise<Session>
```

### Progress Report Endpoints

```typescript
// Get Progress Reports
api.getProgressReports(enrollmentId?: string): Promise<ProgressReport[]>

// Create Progress Report
api.createProgressReport(data: CreateProgressReportRequest): Promise<ProgressReport>
```

### Tutor Profile Endpoints

```typescript
// Create Tutor Profile
api.createTutorProfile(data: CreateTutorProfileRequest): Promise<TutorProfile>

// Update Tutor Profile
api.updateTutorProfile(data: UpdateTutorProfileRequest): Promise<TutorProfile>
```

### Assignment Endpoints

```typescript
// Get Assignments
api.getAssignments(enrollmentId?: string): Promise<Assignment[]>

// Create Assignment
api.createAssignment(data: { enrollmentId: string; title: string; description: string; type: AssignmentType; dueDate: string }): Promise<Assignment>

// Update Assignment Status
api.updateAssignmentStatus(assignmentId: string, status: string): Promise<Assignment>
```

### Grade Endpoints

```typescript
// Get Grades
api.getGrades(enrollmentId?: string): Promise<Grade[]>

// Submit Grade
api.submitGrade(data: { enrollmentId: string; assignmentId: string; score: number; maxScore: number; feedback?: string }): Promise<Grade>
```

### Quiz Endpoints

```typescript
// Get Quiz Questions
api.getQuizQuestions(assignmentId: string): Promise<QuizQuestion[]>

// Create Quiz Question
api.createQuizQuestion(assignmentId: string, data: { questionText: string; options: string[]; correctIndex: number; points: number; order: number }): Promise<QuizQuestion>

// Start Quiz
api.startQuiz(assignmentId: string): Promise<QuizAttempt>

// Submit Quiz Answer
api.submitQuizAnswer(attemptId: string, data: { questionId: string; selectedOption: number }): Promise<{ isCorrect: boolean; pointsEarned: number }>

// Complete Quiz
api.completeQuiz(attemptId: string): Promise<QuizAttempt>
```

### Message Endpoints

```typescript
// Get Message Threads
api.getMessageThreads(): Promise<MessageThread[]>

// Get Messages
api.getMessages(threadId: string): Promise<Message[]>

// Send Message
api.sendMessage(recipientId: string, body: string): Promise<Message>

// Start Message Thread
api.startMessageThread(recipientIds: string[], initialMessage: string): Promise<Message>
```

### Complaint Endpoints

```typescript
// Get Complaints
api.getComplaints(): Promise<Complaint[]>

// File Complaint
api.fileComplaint(data: { aboutType: ComplaintAboutType; aboutId?: string; description: string }): Promise<Complaint>

// Resolve Complaint
api.resolveComplaint(complaintId: string, reply: string): Promise<Complaint>
```

### Notification Endpoints

```typescript
// Get Notifications
api.getNotifications(): Promise<Notification[]>

// Mark Notification as Read
api.markNotificationRead(notificationId: string): Promise<Notification>
```

### Payment Endpoints

```typescript
// Initiate Payment
api.initiatePayment(data: InitiatePaymentRequest): Promise<InitiatePaymentResponse>

// Get Payments
api.getPayments(): Promise<Payment[]>

// Verify Payment
api.verifyPayment(reference: string): Promise<Payment>
```

### User Profile Endpoints

```typescript
// Get Current User
api.getMe(): Promise<User>

// Update Timezone
api.updateTimezone(timezone: string): Promise<User>

// Change Password
api.changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }>
```

---

## Project Structure

```
Teach-Me-Hub/
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/
│   ├── parent/                    # Parent portal
│   │   ├── page.tsx              # Parent dashboard
│   │   ├── students/             # Student management
│   │   ├── enrollments/          # Enrollment management
│   │   ├── sessions/             # Session viewing
│   │   ├── grades/               # Grades and progress
│   │   ├── assignments/          # Assignment tracking
│   │   ├── payments/             # Payment management
│   │   ├── messages/             # Messaging system
│   │   ├── notifications/        # Notifications
│   │   └── settings/             # Account settings
│   ├── tutor/                     # Tutor portal
│   │   ├── page.tsx              # Tutor dashboard
│   │   ├── students/             # Student management
│   │   ├── sessions/             # Session management
│   │   ├── progress-reports/     # Progress reporting
│   │   ├── assignments/          # Assignment creation
│   │   ├── grades/               # Grading system
│   │   ├── messages/             # Messaging system
│   │   ├── notifications/        # Notifications
│   │   └── complaints/           # Complaint filing
│   ├── student/                   # Student portal
│   │   ├── page.tsx              # Student dashboard
│   │   ├── schedule/             # Class schedule
│   │   ├── assignments/          # Assignment completion
│   │   ├── grades/               # Grade viewing
│   │   ├── attendance/           # Attendance tracking
│   │   ├── progress-reports/     # Progress viewing
│   │   ├── messages/             # Messaging system
│   │   ├── profile/              # Student profile
│   │   ├── settings/             # Account settings
│   │   ├── my-tutors/            # Tutor information
│   │   └── notifications/        # Notifications
│   ├── student-login/            # Student-specific login
│   ├── payment/                  # Payment callback handling
│   └── layout.tsx                # Root layout
├── components/
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── StudentLoginForm.tsx
│   │   └── VerifyForm.tsx
│   ├── parent/                   # Parent-specific components
│   │   ├── StudentList.tsx
│   │   ├── EnrollmentList.tsx
│   │   ├── SessionList.tsx
│   │   ├── ProgressReports.tsx
│   │   ├── AddStudentModal.tsx
│   │   └── EnrollStudentModal.tsx
│   ├── tutor/                    # Tutor-specific components
│   │   ├── StudentList.tsx
│   │   ├── SessionList.tsx
│   │   ├── ProgressReportModal.tsx
│   │   ├── TutorProfileModal.tsx
│   │   ├── LogSessionModal.tsx
│   │   └── QuizQuestionsModal.tsx
│   ├── student/                  # Student-specific components
│   │   └── QuizTakingModal.tsx
│   ├── shared/                   # Shared components
│   │   ├── DashboardNav.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BrandHeader.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/                       # UI components (Radix UI)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── checkbox.tsx
│       ├── label.tsx
│       ├── toast.tsx
│       └── table.tsx
├── lib/
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth utilities
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Utility functions
│   ├── paystack.ts               # Paystack integration
│   └── use-auth.ts              # Auth hook
├── public/                       # Static assets
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
└── package.json                # Dependencies
```

---

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Lucid-spacex/Teach-Me-Hub.git
cd Teach-Me-Hub
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:
```
NEXT_PUBLIC_API_URL=https://smart-tutor-9rjd.onrender.com
```

4. **Run development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## Key Components

### Authentication Components

**LoginForm.tsx**
- Handles user login for parents and tutors
- Email and password validation
- JWT token management
- Role-based redirect

**RegisterForm.tsx**
- User registration for parents and tutors
- Form validation with Zod
- Email verification setup
- Role selection

**StudentLoginForm.tsx**
- Student-specific authentication
- Parent email + student code + PIN
- Auto-redirect to student dashboard

**VerifyForm.tsx**
- OTP email verification
- Auto-fill from email
- Error handling and retry

### Dashboard Components

**DashboardNav.tsx**
- Navigation component for all dashboards
- Role-based menu items
- Active state highlighting
- Mobile responsive

**StatCard.tsx**
- Reusable statistics display
- Icon and value display
- Hover effects
- Link functionality

**DataTable.tsx**
- Generic data table component
- Sorting and filtering
- Pagination support
- Responsive design

### Modal Components

**Modal.tsx**
- Reusable modal component
- Backdrop handling
- Animation support
- Accessibility features

**AddStudentModal.tsx**
- Student registration form
- Grade level selection
- Form validation
- Success handling

**EnrollStudentModal.tsx**
- Enrollment creation form
- Subject selection
- Schedule configuration
- Payment initiation

**TutorProfileModal.tsx**
- Tutor profile creation/editing
- Subject selection
- Availability scheduling
- Credentials upload

**ProgressReportModal.tsx**
- Progress report submission
- Student selection
- Period summary
- Strengths and improvements

### Loading States

**LoadingSpinner.tsx**
- Animated loading indicator
- Multiple size options
- Customizable colors
- Center positioning

**SkeletonLoader.tsx**
- Skeleton loading states
- Content placeholder
- Animation effects
- Responsive design

### UI Components

**Button.tsx**
- Multiple variants (default, outline, ghost, destructive)
- Size options (default, sm, lg)
- Loading state support
- Icon integration

**Card.tsx**
- Content containers
- Header and content sections
- Border and shadow options
- Hover effects

**Input.tsx**
- Text input fields
- Validation states
- Icon support
- Accessibility features

**Select.tsx**
- Dropdown selection
- Multiple option support
- Custom styling
- Keyboard navigation

**Toast.tsx**
- Notification system
- Multiple types (success, error, info)
- Auto-dismissal
- Position control

---

## Design System

### Color Palette

**Brand Colors**
- Primary Gold: `#D4A017`
- Gold Light: `#E5C558`
- Gold Dark: `#8B7355`

**Neutral Colors**
- Background: `#0A0A0A`
- Card: `#1A1A1A`
- Border: `#2A2A2A`
- Text: `#FFFFFF`
- Muted: `#A0A0A0`

### Typography

**Font Families**
- Headings: Serif font (elegant, academic feel)
- Body: Sans-serif (clean, readable)
- Code: Monospace (technical content)

**Font Sizes**
- Heading 1: 2.5rem (40px)
- Heading 2: 2rem (32px)
- Heading 3: 1.5rem (24px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- X-Small: 0.75rem (12px)

### Spacing

**Scale**
- Base: 0.25rem (4px)
- Small: 0.5rem (8px)
- Medium: 1rem (16px)
- Large: 1.5rem (24px)
- XL: 2rem (32px)
- 2XL: 3rem (48px)

### Border Radius

**Scale**
- Small: 0.25rem (4px)
- Medium: 0.5rem (8px)
- Large: 0.75rem (12px)
- XL: 1rem (16px)
- 2XL: 1.5rem (24px)

### Shadows

**Scale**
- Small: `0 1px 2px rgba(0,0,0,0.1)`
- Medium: `0 4px 6px rgba(0,0,0,0.1)`
- Large: `0 10px 15px rgba(0,0,0,0.1)`
- XL: `0 20px 25px rgba(0,0,0,0.1)`

---

## Performance Considerations

### Code Splitting
- Automatic route-based code splitting
- Dynamic imports for heavy components
- Lazy loading for modals

### Image Optimization
- Next.js Image component usage
- Responsive image loading
- WebP format support

### API Optimization
- Request caching
- Parallel data fetching
- Error boundary handling
- Rate limiting handling

### State Management
- Local state for component-specific data
- Context for global auth state
- Optimistic updates for better UX

---

## Security Features

### Authentication
- JWT token validation
- HTTP-only cookie storage
- Automatic token refresh
- Secure password handling

### Data Protection
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure API communication

### Role-Based Access
- Route protection based on user role
- Component-level access control
- API endpoint authorization
- Data filtering by user permissions

---

## Browser Support

### Target Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Support
- iOS Safari (iOS 12+)
- Chrome Mobile (Android 8+)
- Responsive design
- Touch-optimized interactions

---

## Future Enhancements

### Planned Features
- Real-time video integration
- File sharing capabilities
- Advanced analytics dashboard
- Mobile app development
- Enhanced parent-teacher communication
- Automated scheduling system
- Payment subscription management
- Multi-language support
- Accessibility improvements

### Technical Improvements
- Service worker implementation
- Offline functionality
- Advanced caching strategies
- Performance monitoring
- Error tracking integration
- Automated testing
- CI/CD pipeline setup

---

## Support and Maintenance

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Automatic retry mechanisms
- Fallback UI components

### Monitoring
- Console logging for debugging
- API response tracking
- Performance metrics
- User feedback collection

### Documentation
- Code comments for complex logic
- Component usage examples
- API documentation
- Deployment guides

---

## Conclusion

Teach-Me-Hub provides a comprehensive, user-friendly platform for managing tutoring relationships between parents, students, and tutors. The platform emphasizes:

- **User Experience**: Intuitive interfaces for all user roles
- **Functionality**: Complete feature set for tutoring management
- **Reliability**: Robust error handling and data management
- **Scalability**: Modular architecture for future growth
- **Security**: Industry-standard authentication and data protection

The platform continues to evolve with regular updates and feature enhancements based on user feedback and educational technology trends.