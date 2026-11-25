# Design Progress

This is the route-by-route checklist for the presentation-only redesign. Shared semantic tokens, typography, and responsive shells are applied globally; a route remains unchecked until its surface has been reviewed. No APIs, auth flows, storage, route behavior, or visible copy are to be changed.

## Foundation

- [x] Add light/dark semantic palette, role accents, font variables, type scale, radius, and surface tokens.
- [x] Add responsive dashboard content gutters and overflow containment.
- [x] Refresh buttons, cards, badges, fields, tables, dialogs, notifications, and loading states.
- [x] Add page/dialog motion with reduced-motion handling.
- [ ] Run typecheck/build and inspect changed surfaces at mobile, iPad portrait/landscape, and desktop.

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

- [ ] `app/admin/page.tsx`
- [ ] `app/admin/all-tutors/page.tsx`
- [ ] `app/admin/change-requests/page.tsx`
- [ ] `app/admin/change-requests/[id]/page.tsx`
- [ ] `app/admin/class-schedule/page.tsx`
- [ ] `app/admin/complaints/page.tsx`
- [ ] `app/admin/enrollments/page.tsx`
- [ ] `app/admin/grades/page.tsx`
- [ ] `app/admin/grades/[id]/page.tsx`
- [ ] `app/admin/messages/page.tsx`
- [ ] `app/admin/notifications/page.tsx`
- [ ] `app/admin/outstanding-payments/page.tsx`
- [ ] `app/admin/parents/page.tsx`
- [ ] `app/admin/payment-summary/page.tsx`
- [ ] `app/admin/sessions/page.tsx`
- [ ] `app/admin/settings/page.tsx`
- [ ] `app/admin/students/page.tsx`
- [ ] `app/admin/students/[id]/page.tsx`
- [ ] `app/admin/students/[id]/performance/page.tsx`
- [ ] `app/admin/subjects/page.tsx`
- [ ] `app/admin/suspended/page.tsx`
- [ ] `app/admin/transactions/page.tsx`
- [ ] `app/admin/tutors/page.tsx`
- [ ] `app/admin/tutors/[id]/page.tsx`
- [ ] `app/admin/tutors/pending/page.tsx`

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
- [ ] `app/grades/page.tsx`

## Tutor routes

- [ ] `app/tutor/page.tsx`
- [ ] `app/tutor/application/page.tsx`
- [ ] `app/tutor/assignments/page.tsx`
- [ ] `app/tutor/assignments/[id]/page.tsx`
- [ ] `app/tutor/complaints/page.tsx`
- [ ] `app/tutor/messages/page.tsx`
- [ ] `app/tutor/notifications/page.tsx`
- [ ] `app/tutor/pending/page.tsx`
- [ ] `app/tutor/progress-reports/page.tsx`
- [ ] `app/tutor/rejected/page.tsx`
- [ ] `app/tutor/sessions/page.tsx`
- [ ] `app/tutor/settings/page.tsx`
- [ ] `app/tutor/students/page.tsx`
- [ ] `app/tutor/students/[id]/page.tsx`
- [ ] `app/tutor/students/[id]/performance/page.tsx`
- [ ] `app/tutor/upcoming-classes/page.tsx`

## Shared and route-level components

### Shared
- [x] `components/shared/Avatar.tsx`
- [ ] `components/shared/AppearanceSettings.tsx`
- [x] `components/shared/AuthGuard.tsx`
- [ ] `components/shared/AuthProvider.tsx`
- [x] `components/shared/BrandHeader.tsx`
- [x] `components/shared/DashboardNav.tsx`
- [x] `components/shared/DataTable.tsx`
- [x] `components/shared/EmptyState.tsx`
- [ ] `components/shared/ErrorBoundary.tsx`
- [ ] `components/shared/ErrorBoundaryWrapper.tsx`
- [x] `components/shared/LoadingSpinner.tsx`
- [x] `components/shared/Modal.tsx`
- [ ] `components/shared/Navbar.tsx`
- [x] `components/shared/NewBadge.tsx`
- [x] `components/shared/NotificationBell.tsx`
- [ ] `components/shared/NotificationProvider.tsx`
- [x] `components/shared/PageTransition.tsx`
- [ ] `components/shared/ProfilePictureUpload.tsx`
- [ ] `components/shared/SegmentedControl.tsx`
- [x] `components/shared/Sidebar.tsx`
- [x] `components/shared/SkeletonLoader.tsx`
- [x] `components/shared/StatCard.tsx`
- [x] `components/shared/StatusBadge.tsx`
- [x] `components/shared/ThemeToggle.tsx`
- [ ] `components/shared/UUIDInput.tsx`

### Admin, auth, home, parent, student, and tutor components
- [ ] `components/admin/AdminDashboardCharts.tsx`
- [ ] `components/admin/AllStudentsList.tsx`
- [ ] `components/admin/AllTutorsList.tsx`
- [ ] `components/admin/DashboardStats.tsx`
- [ ] `components/admin/FailedPaymentsList.tsx`
- [ ] `components/admin/PendingTutorsList.tsx`
- [ ] `components/admin/UnmatchedEnrollmentsList.tsx`
- [x] `components/auth/LoginForm.tsx`
- [x] `components/auth/RegisterForm.tsx`
- [x] `components/auth/StudentLoginForm.tsx`
- [x] `components/auth/TutorRegisterForm.tsx`
- [x] `components/auth/VerifyForm.tsx`
- [x] `components/home/HomeSections.tsx`
- [x] `components/home/Homepage.tsx`
- [x] `app/tutors/TutorsContent.tsx`
- [x] `components/parent/AddStudentModal.tsx`
- [ ] `components/parent/ChangeRequestModal.tsx`
- [x] `components/parent/EnrollStudentModal.tsx`
- [x] `components/parent/EnrollmentList.tsx`
- [x] `components/parent/ProgressReports.tsx`
- [x] `components/parent/SessionList.tsx`
- [x] `components/parent/StudentList.tsx`
- [ ] `components/student/QuizTakingModal.tsx`
- [ ] `components/tutor/CreateSessionModal.tsx`
- [ ] `components/tutor/GradeCompileWizard.tsx`
- [ ] `components/tutor/LogSessionModal.tsx`
- [ ] `components/tutor/ProgressReportModal.tsx`
- [ ] `components/tutor/QuizQuestionsModal.tsx`
- [ ] `components/tutor/ScoredItemsTab.tsx`
- [ ] `components/tutor/SessionList.tsx`
- [ ] `components/tutor/StudentList.tsx`
- [ ] `components/tutor/TutorLayoutClient.tsx`
- [ ] `components/tutor/TutorProfileModal.tsx`
- [ ] `components/tutor/TutorStatusScreen.tsx`

### UI primitives
- [x] `components/ui/badge.tsx`
- [x] `components/ui/button.tsx`
- [x] `components/ui/card.tsx`
- [x] `components/ui/checkbox.tsx`
- [x] `components/ui/dialog.tsx`
- [x] `components/ui/input.tsx`
- [ ] `components/ui/label.tsx`
- [ ] `components/ui/link.tsx`
- [ ] `components/ui/password-input.tsx`
- [x] `components/ui/select.tsx`
- [x] `components/ui/table.tsx`
- [x] `components/ui/textarea.tsx`
- [x] `components/ui/toast.tsx`
- [ ] `components/ui/toaster.tsx`

## Validation

- [x] TypeScript check
- [ ] Production build
- [ ] Browser check at 375x812, 768x1024, 1024x768, and 1388x655
- [ ] Confirm no horizontal overflow on public/auth pages and dashboard shells
- [ ] Confirm dialogs, navigation drawer, keyboard focus, and reduced-motion behavior
- [ ] Record any intentionally deferred presentation items in `DESIGN_NOTES.md`
