# Design Progress

This is the route-by-route checklist for the presentation-only redesign. Shared semantic tokens, typography, and responsive shells are applied globally; a route remains unchecked until its surface has been reviewed. No APIs, auth flows, storage, route behavior, or visible copy are to be changed.

## Foundation

- [x] Add light/dark semantic palette, role accents, font variables, type scale, radius, and surface tokens.
- [x] Add responsive dashboard content gutters and overflow containment.
- [x] Refresh buttons, cards, badges, fields, tables, dialogs, notifications, and loading states.
- [x] Add page/dialog motion with reduced-motion handling.
- [x] Run typecheck/build and inspect changed surfaces at mobile, iPad portrait/landscape, and desktop.

## Public and authentication routes

- [x] `app/page.tsx`
- [x] `app/tutors/page.tsx`
- [x] `app/(auth)/login/page.tsx`
- [x] `app/(auth)/register/page.tsx`
- [x] `app/(auth)/register/tutor/page.tsx`
- [x] `app/(auth)/verify/page.tsx`
- [x] `app/admin-login/page.tsx`
- [x] `app/admin/login/page.tsx`
- [x] `app/tutor/login/page.tsx`
- [x] `app/tutor/register/page.tsx`
- [x] `app/student-login/page.tsx`
- [x] `app/forgot-password/page.tsx`
- [x] `app/reset-password/page.tsx`
- [x] `app/payment/callback/page.tsx`

## Admin routes

- [x] `app/admin/page.tsx`
- [x] `app/admin/all-tutors/page.tsx`
- [x] `app/admin/change-requests/page.tsx`
- [x] `app/admin/change-requests/[id]/page.tsx`
- [x] `app/admin/class-schedule/page.tsx`
- [x] `app/admin/complaints/page.tsx`
- [x] `app/admin/enrollments/page.tsx`
- [x] `app/admin/grades/page.tsx`
- [x] `app/admin/grades/[id]/page.tsx`
- [x] `app/admin/messages/page.tsx`
- [x] `app/admin/notifications/page.tsx`
- [x] `app/admin/outstanding-payments/page.tsx`
- [x] `app/admin/parents/page.tsx`
- [x] `app/admin/payment-summary/page.tsx`
- [x] `app/admin/sessions/page.tsx`
- [x] `app/admin/settings/page.tsx`
- [x] `app/admin/students/page.tsx`
- [x] `app/admin/students/[id]/page.tsx`
- [x] `app/admin/students/[id]/performance/page.tsx`
- [x] `app/admin/subjects/page.tsx`
- [x] `app/admin/suspended/page.tsx`
- [x] `app/admin/transactions/page.tsx`
- [x] `app/admin/tutors/page.tsx`
- [x] `app/admin/tutors/[id]/page.tsx`
- [x] `app/admin/tutors/pending/page.tsx`

## Parent routes

- [x] `app/parent/page.tsx`
- [x] `app/parent/assignments/page.tsx`
- [x] `app/parent/complaints/page.tsx`
- [x] `app/parent/enrollments/page.tsx`
- [x] `app/parent/grades/page.tsx`
- [x] `app/parent/messages/page.tsx`
- [x] `app/parent/notifications/page.tsx`
- [x] `app/parent/payments/page.tsx`
- [x] `app/parent/pricing/page.tsx`
- [x] `app/parent/sessions/page.tsx`
- [x] `app/parent/settings/page.tsx`
- [x] `app/parent/students/page.tsx`
- [x] `app/parent/students/[id]/page.tsx`
- [x] `app/parent/students/[id]/performance/page.tsx`

## Student routes

- [x] `app/student/page.tsx`
- [x] `app/student/assignments/page.tsx`
- [x] `app/student/attendance/page.tsx`
- [x] `app/student/grades/page.tsx`
- [x] `app/student/messages/page.tsx`
- [x] `app/student/my-tutors/page.tsx`
- [x] `app/student/notifications/page.tsx`
- [x] `app/student/performance/page.tsx`
- [x] `app/student/profile/page.tsx`
- [x] `app/student/progress-reports/page.tsx`
- [x] `app/student/schedule/page.tsx`
- [x] `app/student/settings/page.tsx`
- [x] `app/grades/page.tsx`

## Tutor routes

- [x] `app/tutor/page.tsx`
- [x] `app/tutor/application/page.tsx`
- [x] `app/tutor/assignments/page.tsx`
- [x] `app/tutor/assignments/[id]/page.tsx`
- [x] `app/tutor/complaints/page.tsx`
- [x] `app/tutor/messages/page.tsx`
- [x] `app/tutor/notifications/page.tsx`
- [x] `app/tutor/pending/page.tsx`
- [x] `app/tutor/progress-reports/page.tsx`
- [x] `app/tutor/rejected/page.tsx`
- [x] `app/tutor/sessions/page.tsx`
- [x] `app/tutor/settings/page.tsx`
- [x] `app/tutor/students/page.tsx`
- [x] `app/tutor/students/[id]/page.tsx`
- [x] `app/tutor/students/[id]/performance/page.tsx`
- [x] `app/tutor/upcoming-classes/page.tsx`

## Shared and route-level components

### Shared
- [x] `components/shared/Avatar.tsx`
- [x] `components/shared/AppearanceSettings.tsx`
- [x] `components/shared/AuthGuard.tsx`
- [x] `components/shared/AuthProvider.tsx`
- [x] `components/shared/BrandHeader.tsx`
- [x] `components/shared/DashboardNav.tsx`
- [x] `components/shared/DataTable.tsx`
- [x] `components/shared/EmptyState.tsx`
- [x] `components/shared/ErrorBoundary.tsx`
- [x] `components/shared/ErrorBoundaryWrapper.tsx`
- [x] `components/shared/LoadingSpinner.tsx`
- [x] `components/shared/Modal.tsx`
- [x] `components/shared/Navbar.tsx`
- [x] `components/shared/NewBadge.tsx`
- [x] `components/shared/NotificationBell.tsx`
- [x] `components/shared/NotificationProvider.tsx`
- [x] `components/shared/PageTransition.tsx`
- [x] `components/shared/ProfilePictureUpload.tsx`
- [x] `components/shared/SegmentedControl.tsx`
- [x] `components/shared/Sidebar.tsx`
- [x] `components/shared/SkeletonLoader.tsx`
- [x] `components/shared/StatCard.tsx`
- [x] `components/shared/StatusBadge.tsx`
- [x] `components/shared/ThemeToggle.tsx`
- [x] `components/shared/UUIDInput.tsx`

### Admin, auth, home, parent, student, and tutor components
- [x] `components/admin/AdminDashboardCharts.tsx`
- [x] `components/admin/AllStudentsList.tsx`
- [x] `components/admin/AllTutorsList.tsx`
- [x] `components/admin/DashboardStats.tsx`
- [x] `components/admin/FailedPaymentsList.tsx`
- [x] `components/admin/PendingTutorsList.tsx`
- [x] `components/admin/UnmatchedEnrollmentsList.tsx`
- [x] `components/auth/LoginForm.tsx`
- [x] `components/auth/RegisterForm.tsx`
- [x] `components/auth/StudentLoginForm.tsx`
- [x] `components/auth/TutorRegisterForm.tsx`
- [x] `components/auth/VerifyForm.tsx`
- [x] `components/home/HomeSections.tsx`
- [x] `components/home/Homepage.tsx`
- [x] `app/tutors/TutorsContent.tsx`
- [x] `components/parent/AddStudentModal.tsx`
- [x] `components/parent/ChangeRequestModal.tsx`
- [x] `components/parent/EnrollStudentModal.tsx`
- [x] `components/parent/EnrollmentList.tsx`
- [x] `components/parent/ProgressReports.tsx`
- [x] `components/parent/SessionList.tsx`
- [x] `components/parent/StudentList.tsx`
- [x] `components/student/QuizTakingModal.tsx`
- [x] `components/tutor/CreateSessionModal.tsx`
- [x] `components/tutor/GradeCompileWizard.tsx`
- [x] `components/tutor/LogSessionModal.tsx`
- [x] `components/tutor/ProgressReportModal.tsx`
- [x] `components/tutor/QuizQuestionsModal.tsx`
- [x] `components/tutor/ScoredItemsTab.tsx`
- [x] `components/tutor/SessionList.tsx`
- [x] `components/tutor/StudentList.tsx`
- [x] `components/tutor/TutorLayoutClient.tsx`
- [x] `components/tutor/TutorProfileModal.tsx`
- [x] `components/tutor/TutorStatusScreen.tsx`

### UI primitives
- [x] `components/ui/badge.tsx`
- [x] `components/ui/button.tsx`
- [x] `components/ui/card.tsx`
- [x] `components/ui/checkbox.tsx`
- [x] `components/ui/dialog.tsx`
- [x] `components/ui/input.tsx`
- [x] `components/ui/label.tsx`
- [x] `components/ui/link.tsx`
- [x] `components/ui/password-input.tsx`
- [x] `components/ui/select.tsx`
- [x] `components/ui/table.tsx`
- [x] `components/ui/textarea.tsx`
- [x] `components/ui/toast.tsx`
- [x] `components/ui/toaster.tsx`

## Validation

- [x] TypeScript check
- [x] Production build
- [x] Browser check at 375x812, 768x1024, 1024x768, and 1388x655
- [x] Confirm no horizontal overflow on public/auth pages and dashboard shells
- [x] Confirm dialogs, navigation drawer, keyboard focus, and reduced-motion behavior
- [x] Record intentionally deferred presentation items in `DESIGN_NOTES.md`
