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
│   │   │   └── [id]/            # Individual student details
│   │   ├── enrollments/         # Enrollment management
│   │   ├── payments/            # Payment history
│   │   ├── sessions/            # Session schedule
│   │   ├── assignments/         # Student assignments
│   │   ├── grades/              # Student grades
│   │   ├── messages/            # Messaging system
│   │   ├── complaints/          # Complaint management
│   │   ├── notifications/       # Notification center
│   │   └── settings/            # Account settings
│   ├── student/                 # Student dashboard routes
│   │   ├── page.tsx             # Student dashboard home
│   │   ├── schedule/            # Class schedule
│   │   ├── assignments/         # Assignment management
│   │   ├── grades/              # Grade viewing
│   │   ├── attendance/          # Attendance records
│   │   ├── progress-reports/    # Progress reports
│   │   ├── messages/            # Messaging
│   │   ├── notifications/       # Notifications
│   │   ├── profile/             # Student profile
│   │   └── settings/            # Account settings
│   ├── tutor/                   # Tutor dashboard routes
│   │   ├── page.tsx             # Tutor dashboard home
│   │   ├── students/            # Assigned students
│   │   ├── sessions/            # Session management
│   │   └── progress-reports/    # Progress report submission
│   ├── admin/                   # Admin dashboard routes
│   │   ├── page.tsx             # Admin dashboard home
│   │   ├── students/            # All students management
│   │   ├── tutors/              # Tutor management
│   │   ├── all-tutors/          # All tutors list
│   │   └── enrollments/         # Enrollment matching
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx       # Login form with role selection
│   │   ├── RegisterForm.tsx    # Registration form
│   │   ├── StudentLoginForm.tsx # Student login (code + PIN)
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
│   │   └── TutorProfileModal.tsx # Profile completion
│   ├── admin/                   # Admin-specific components
│   │   ├── DashboardStats.tsx   # Platform statistics
│   │   ├── PendingTutorsList.tsx # Tutor approval queue
│   │   ├── AllTutorsList.tsx    # All tutors management
│   │   ├── AllStudentsList.tsx  # All students management
│   │   ├── UnmatchedEnrollmentsList.tsx # Enrollment matching
│   │   └── FailedPaymentsList.tsx # Failed payments management
│   ├── shared/                  # Shared/reusable components
│   │   ├── BrandHeader.tsx      # Platform header with navigation
│   │   ├── DashboardNav.tsx      # Dashboard navigation
│   │   ├── Navbar.tsx           # Main navigation bar
│   │   ├── Sidebar.tsx          # Sidebar navigation
│   │   ├── Modal.tsx            # Generic modal component
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   ├── EmptyState.tsx       # Empty state display
│   │   ├── ErrorBoundary.tsx    # Error boundary component
│   │   ├── DataTable.tsx        # Data table component
│   │   ├── StatCard.tsx         # Statistics card
│   │   ├── StatusBadge.tsx      # Status badges
│   │   ├── SegmentedControl.tsx # Tab control
│   │   ├── SkeletonLoader.tsx   # Skeleton loading states
│   │   └── UUIDInput.tsx        # UUID input field
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
│       └── toaster.tsx          # Toast container
├── lib/                         # Utility libraries
│   ├── api.ts                   # Centralized API client
│   ├── auth.ts                  # Authentication utilities
│   ├── types.ts                 # TypeScript type definitions
│   ├── paystack.ts              # Paystack integration
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
- Access Zoom meeting links
- View session history and homework
- Track attendance records

#### Academic Tracking
- View student assignments and due dates
- Monitor grades and progress reports
- Track attendance statistics
- View student activity summaries

### 3. Student Dashboard

#### Student Portal
- Login using student code + 6-digit PIN
- Personalized dashboard with upcoming classes
- Session schedule with Zoom integration
- Assignment management

#### Academic Features
- View class schedule with countdown timers
- Access assignment details and submit work
- View grades and feedback
- Track attendance records
- Read progress reports

#### Communication
- Message tutors directly
- Receive notifications
- View academic announcements

### 4. Tutor Dashboard

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

## Security Features

### Authentication
- JWT tokens with expiration
- httpOnly cookies for token storage
- Automatic token refresh
- Secure route protection

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

## Credits

- Built with Next.js and TypeScript
- UI components from Radix UI
- Icons from Lucide React
- Styling with Tailwind CSS
- Payment processing by Paystack
