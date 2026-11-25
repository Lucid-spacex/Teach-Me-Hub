<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Recent Fixes

## 1. Grades Endpoint Fixed
**Issue:** Frontend was calling `/tutor/grades` but backend expects `/grades`
**Fix:** Updated all API calls and routes to use `/grades` instead of `/tutor/grades`
**Files Changed:**
- lib/api.ts - All grade compilation endpoints now use `/grades`
- components/shared/NotificationBell.tsx - Updated notification link
- components/shared/Sidebar.tsx - Updated sidebar link
- components/shared/DashboardNav.tsx - Updated nav link
- app/tutor/grades/page.tsx - Moved to app/grades/page.tsx
- app/tutor/students/[id]/page.tsx - Updated navigation link

## 1.5. Grade Preview Endpoint Fixed
**Issue:** Frontend was calling `POST /grades/preview` with data, but backend expects `GET /grades/:id/preview`
**Fix:** Changed to call GET with grade ID instead of POST with full data
**Files Changed:**
- lib/api.ts - Changed previewCompiledGrade to take gradeId and use GET
- components/tutor/GradeCompileWizard.tsx - Now passes draftGrade.id to preview

## 2. Notifications API Response Fixed
**Issue:** Backend returns `{ data: [], total: 7 }` but frontend expected `{ notifications: [], total: 7 }`
**Fix:** Updated getNotifications to map `data` to `notifications`
**File Changed:** lib/api.ts line 684-699

## 3. Notifications Property Names Fixed
**Issue:** Backend uses `isRead` and `body` but frontend expected `read` and `message`
**Fix:** Updated to handle both property names
**File Changed:** app/admin/notifications/page.tsx

## 4. Refresh Token Error Handling Improved
**Issue:** When refresh token is invalid/expired, tokens weren't being cleared properly
**Fix:** Added token clearing in refresh() method when refresh fails
**File Changed:** lib/api.ts line 420-448

## 5. Admin Payment Summary & Revenue Types Fixed
**Issue:** Frontend types didn't match backend API response structure
**Fix:** Updated type definitions to match backend spec:
- AdminPaymentSummary: Added `successCount` field to byCurrency objects
- AdminPaymentListItem: Added `transactionReference` field
- OutstandingEnrollment: Added `parent` field with id, fullName, email
- FailedPayment: Added `failureReason` and `failedAt` fields
- PaymentDetail: Added `transactionReference` and `updatedAt` fields
- Removed unused `EnhancedBadgeCounts` type, using `AdminBadgeCounts` instead
**Files Changed:**
- lib/types.ts - Updated all payment-related type definitions
- lib/api.ts - Updated getAdminBadgeCounts to return AdminBadgeCounts, added includeUnpaid parameter to getOutstandingPayments
- app/admin/payment-summary/page.tsx - Fixed dailySeries access path (summary.series.dailySeries)
- app/admin/transactions/page.tsx - Added handleReverify function, fixed field name references for transactionReference, failureReason, failedAt, and parent

## 6. Tutor Students List & Admin Tutor Students Display Fixed
**Issue:** Tutor students list and admin tutor detail student tab showing "No students assigned" despite API returning `{ data: [...] }`
**Fix:** 
- Updated `api.getAdminTutorStudents(tutorId)` to unwrap paginated `{ data: [...] }` responses and normalize entries using `normalizeTutorStudentItem`.
- Updated `app/admin/tutors/[id]/page.tsx` to safely handle student arrays and unwrap `detail.data`.
**Files Changed:**
- lib/api.ts - Updated `getAdminTutorStudents` and `getAdminTutorSessions`
- app/admin/tutors/[id]/page.tsx - Updated `loadTutorData` and student item rendering

## 7. Admin Tutor Detail Page Display Fixed
**Issue:** Tutor profile showing "-" for First Name, Last Name, Middle Name, Phone; "[object Object]" for Subjects; wrong birthday format; 0 for Max and Current Students
**Fix:** Updated admin tutor detail page to properly handle new API response structure:
- First Name, Last Name, Middle Name, Phone: Reads from `user` / `rawData` instead of `application`
- Birthday: Reads `birthDay`/`birthMonth` with fallback to `birthday`
- Subjects: Extracts `s.name` from subject objects to prevent `[object Object]`
- About You & Bio: Properly joins array to string with newlines
- Current Students: Reads from `metrics.studentsCount` or `profile.currentStudentCount`
- Max Students: Shows "Not set" when null or 0
- Overview tab metrics: Maps `sessionsCompleted` and `studentsCount`
**Files Changed:**
- app/admin/tutors/[id]/page.tsx - Fixed field mappings and tab metrics for tutor profile display

## 8. Token Refresh Race Condition Fixed
**Issue:** Users were being prematurely logged out when the access token expired because concurrent 401 requests all invoked `/auth/refresh` simultaneously, invalidating the refresh token on the first attempt and failing subsequent ones.
**Fix:** Added a singleton `_refreshPromise` to `ApiClient` to deduplicate concurrent refresh calls so that only one `/auth/refresh` request executes at a time, and concurrent requests await that same result before retrying with the new token.
**Files Changed:**
- lib/api.ts - Added `_refreshPromise` and deduplicated refresh flow in 401 error handler

## 9. Sidebar Notification Navigation Fixed
**Issue:** Clicking "Notifications" in the Tutor or Admin sidebar navigated to `/notifications` (which does not exist), resulting in a broken route or no redirect.
**Fix:** Corrected href paths in `Sidebar.tsx` to `/tutor/notifications` and `/admin/notifications`.
**Files Changed:**
- components/shared/Sidebar.tsx - Updated `tutorNavItems` and `adminNavItems`

## 10. Admin Student Detail Assignments Crash Fixed
**Issue:** Viewing assignments in `/admin/students/[id]` resulted in `assignments.map is not a function` because the API returned an object or non-array for assignments.
**Fix:**
- Updated `api.getAdminStudentDetail` in `lib/api.ts` to unwrap and normalize `assignments`, `sessions`, `grades`, `progressReports`, `enrollments`, and `attendance` to guaranteed arrays.
- Updated `app/admin/students/[id]/page.tsx` with safe array fallbacks and `Array.isArray` guards before invoking `.map`.
**Files Changed:**
- lib/api.ts - Normalized `getAdminStudentDetail`
- app/admin/students/[id]/page.tsx - Added safe typed array fallbacks

## 11. Tutor Students Page Display & N/A Values Fixed
**Issue:** The `/tutor/students` table was displaying "N/A" for subject, session frequency, and enrollment details when receiving the nested `{ student, enrollment, subject }` API format.
**Fix:** Updated `normalizeTutorStudentItem` in `lib/api.ts` to parse fields from both the top-level item and nested `item.enrollment`, and updated `StudentList.tsx` and `app/tutor/students/[id]/page.tsx` to fallback gracefully across `gradeLevel`, `actualGrade`, `subject`, and `sessionFrequency`.
**Files Changed:**
- lib/api.ts - Updated `normalizeTutorStudentItem`
- components/tutor/StudentList.tsx - Enhanced cell display fallbacks

## 12. Tutor Students List Structure Update
**Issue:** API response changed to flat structure: `{ enrollmentId, student, subject, sessionFrequency, startDate }` instead of nested enrollment
**Fix:** Updated normalizeTutorStudentItem to handle new flat structure and provide defaults for required Student type fields
**Files Changed:**
- lib/api.ts - Simplified normalization to match new API response, added default values for required fields
- components/tutor/StudentList.tsx - Added gradeLevel fallback in grade column

## 13. Admin Contact Messaging Issue
**Issue:** Tutor messaging to admin fails with "Invalid recipient ID format" - backend expects valid UUID
**Fix:** Enhanced getAdminContact to handle various response formats and added UUID validation
**Status:** Backend /messages/admin-contact endpoint may need to be checked/implemented
**Files Changed:**
- lib/api.ts - Enhanced recipientId extraction with multiple field name support
- app/tutor/messages/page.tsx - Added UUID validation before sending message
- app/tutor/students/[id]/page.tsx - Enhanced student header badges and date parsing

## 12. Grade Review and Class Schedule Filter Dropdowns
**Issue:** Filters in `/admin/grades` and `/admin/class-schedule` required manual entry of raw UUIDs for Tutor ID, Student ID, and Subject ID.
**Fix:** Replaced manual text ID inputs with dynamic, searchable Select dropdowns populated from the API (`api.getApprovedTutorsForAssignment`, `api.getAdminStudents`, `api.getSubjects`). Removed redundant wrapper classes from `/admin/class-schedule`.
**Files Changed:**
- app/admin/grades/page.tsx - Added dynamic Tutor, Student, and Subject dropdowns
- app/admin/class-schedule/page.tsx - Added dynamic Tutor and Subject dropdowns and cleaned up layout wrapping

## 13. Student Login Redirect & Cookie Consistency
**Issue:** After logging in as a student, the user was not being redirected to `/student` dashboard and was bouncing back to `/student-login`.
**Fix:** 
- Updated `studentLogin()` in `lib/api.ts` to set the `userRole=STUDENT` cookie (previously only stored in `localStorage`), enabling Next.js middleware and `AuthGuard` to authorize the `/student` route.
- Also dispatched `auth:user-changed` window event so client navigation and header state sync immediately.
**Files Changed:**
- lib/api.ts - Updated `studentLogin` to set `userRole` cookie and trigger user event

## 14. Input Trimming Across Auth Forms
**Issue:** Trailing or leading whitespace in email, student code, PIN, name, and phone caused avoidable authentication, verification, and registration failures.
**Fix:** Added `.trim()` sanitation to form handlers prior to API calls across:
- `components/auth/StudentLoginForm.tsx` (parentEmail, studentCode)
- `components/auth/LoginForm.tsx` (email)
- `components/auth/RegisterForm.tsx` (firstName, lastName, middleName, email, phone)
- `components/auth/VerifyForm.tsx` (email, otp)
- `components/auth/TutorRegisterForm.tsx` (firstName, lastName, middleName, email, phone, address)
**Files Changed:**
- components/auth/StudentLoginForm.tsx
- components/auth/LoginForm.tsx
- components/auth/RegisterForm.tsx
- components/auth/VerifyForm.tsx
- components/auth/TutorRegisterForm.tsx

## 15. Payment Callback Redirection & SameSite Cookies
**Issue:** During payment in the parent section, after Paystack redirected the browser back to `/payment/callback`, the user was redirected to `/login` because session cookies set with `SameSite=Strict` were dropped on cross-site redirect navigation.
**Fix:**
- Updated cookie attributes in `lib/api.ts` (`setToken`, `setRefreshToken`) and `lib/auth.ts` (`setUser`) to `SameSite=Lax`.
- Added `/payment` and `/payment/callback` to `publicRoutes` in `middleware.ts` so the callback page can execute its payment verification and re-hydration without middleware bounce.
**Files Changed:**
- lib/api.ts - Set `SameSite=Lax` for access and refresh tokens
- lib/auth.ts - Set `SameSite=Lax` for user cookie
- middleware.ts - Added `/payment` routes to `publicRoutes`

## 16. Tutor Profile Endpoint Correction (404 Not Found)
**Issue:** Calling `api.getTutorProfile()` resulted in `GET /api/tutor/me 404 Not Found`.
**Fix:** Corrected the endpoint URL in `lib/api.ts` from `/tutor/me` to `/tutor-profile` (matching the backend API contract documented in ENDPOINT.md). Also updated `updateTutorProfileInfo()` to `PATCH /tutor-profile`.
**Files Changed:**
- lib/api.ts - Updated `getTutorProfile` and `updateTutorProfileInfo` endpoints

## 17. Messaging 400 Bad Request Fix & Recipient Normalization
**Issue:** Tutor and Parent messaging returned `POST /api/messages 400 Bad Request` when attempting to contact an admin.
**Fix:**
- Updated `getAdminContact()` in `lib/api.ts` to normalize recipient ID from multiple potential backend payload structures (`recipientId`, `adminId`, `id`, `userId`, `data.recipientId`, `data.id`).
- Added client-side payload validation and `.trim()` in `sendMessage()` to prevent empty bodies or undefined `recipientId` from producing 400 errors.
**Files Changed:**
- lib/api.ts - Normalized `getAdminContact` and validated `sendMessage`

## 18. Tutor Students List API Response Format Updated
**Issue:** Backend updated GET /tutor/students to return paginated response with flat structure
**Fix:** Updated getTutorStudents to return paginated response format { data, page, limit, total } and handle optional pagination params
**Backend Response Structure:**
- enrollmentId, student, subject, sessionFrequency, startDate, status at top level
- New fields: gradeBandTier, dateOfBirth, profilePictureUrl in student object
- Pagination: page, limit, total
**Files Changed:**
- lib/api.ts - Updated getTutorStudents to accept pagination params and return paginated response
- app/tutor/students/[id]/page.tsx - Updated to handle paginated response
- app/tutor/page.tsx - Updated to handle paginated response
- app/tutor/settings/page.tsx - Updated to handle paginated response
- app/grades/page.tsx - Updated variable naming for clarity

# Admin Dashboard API Endpoints

## Overview Data Sources

The admin dashboard uses these backend API endpoints:

### 1. Admin Overview Statistics
**Endpoint:** `GET /admin/reports/overview`
**Frontend Call:** `api.getAdminOverview()`
**Returns:**
- totalUsers: number
- totalParents: number
- totalStudents: number
- totalTutors: number
- pendingTutors: number
- activeEnrollments: number
- pendingPaymentEnrollments: number
- unmatchedEnrollments: number
- totalRevenueNGN: number
- revenueThisMonthNGN: number
- totalRevenue: number (Deprecated alias, use totalRevenueNGN)
- failedPayments: number
- pendingGrades: number
- openComplaints: number
- suspendedUsers: number

### 2. Payment Summary & Revenue Charts
**Endpoint:** `GET /admin/payments/summary`
**Frontend Call:** `api.getAdminPaymentSummary({ from, to, currency })`
**Query Parameters:**
- from: ISO date string (optional)
- to: ISO date string (optional)
- currency: string (optional, e.g., 'USD', 'NGN')

**Returns (AdminPaymentSummary):**
- byCurrency: Record of currency data (collectedTotal, pendingTotal, failedTotal, count, successCount, successRate, averagePayment)
- totalCollectedNGNEquivalent: number
- changePercent: number (vs previous period)
- series: { dailySeries?: Array<{ date, collected: { USD, NGN, ... } }>, monthlySeries?: Array<{ date, collected: { USD, NGN, ... } }> }
- bySubject: Array of revenue by subject { subjectName, collected, count }
- byStatus: Array of payment status counts { status, count }

### 3. Payment Transactions List
**Endpoint:** `GET /admin/payments`
**Frontend Call:** `api.getTransactions({ status, currency, provider, parentId, from, to, search, page, limit })`
**Returns:** Paginated list of payments with parent, student, and subject details

### 4. Failed Payments
**Endpoint:** `GET /admin/payments/failed`
**Frontend Call:** `api.getFailedPayments()`
**Returns:** List of failed payments with failureReason and failedAt timestamps

### 5. Outstanding Payments
**Endpoint:** GET /admin/enrollments/unmatched
**Frontend Call:** `api.getOutstandingPayments({ page, limit, sort, includeUnpaid })`
**Query Parameters:**
- page: number (optional, default 1)
- limit: number (optional, default 20)
- sort: string (optional, default 'daysWaiting:desc')
- includeUnpaid: boolean (optional, include PENDING_PAYMENT enrollments)
**Returns:** Enrollments awaiting payment with days waiting, includes parent, student, subject, and tutor info

### 6. Badge Counts
**Endpoint:** GET /admin/badge-counts
**Frontend Call:** `api.getAdminBadgeCounts()`
**Returns (AdminBadgeCounts):**
- pendingTutorApplications: number
- pendingGrades: number
- openComplaints: number
- unmatchedPaidEnrollments: number
- pendingChangeRequests: number
- unscheduledWithin24h: number
- failedPayments: number
- outstandingEnrollments: number
- unreadMessages: number
- attendanceUnmarkedSessions: number
- unreadNewParents: number
- unreadNewTutors: number
- pendingVettingTutors: number
- activeParents: number

## Payment Database Storage

Payments ARE saved to the database with:
- Receipt numbers (unique per payment)
- Transaction history (timeline events)
- Parent and student information linked
- NGN equivalent amounts and exchange rates
- Failure reasons for failed payments
- Admin notes and audit logs

## Why Charts Show "No Data Available"

If you're seeing "No revenue data available for this period", it means:
1. No payments have been made in the selected time range (7d/30d/90d)
2. The backend API is returning empty data
3. The payment summary endpoint may not be implemented yet in the backend

To verify, check the browser console when loading the admin page - it logs the payment summary data returned by the API.

## Backend Implementation Required

The backend MUST implement these endpoints:
- `/api/admin/reports/overview` - for basic stats
- `/api/admin/payments/summary` - for revenue charts
- `/api/admin/payments` - for transaction list
- `/api/admin/payments/failed` - for failed payments

These are documented in ENDPOINT.md and the frontend expects them to return the data structures defined in lib/types.ts.
