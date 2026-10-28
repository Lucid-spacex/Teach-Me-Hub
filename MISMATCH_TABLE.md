# API Mismatch Table

## Comparison of lib/api.ts, lib/types.ts vs ENDPOINT.md

### Summary
This table documents all mismatches between the frontend API layer (lib/api.ts, lib/types.ts) and the documented backend API (ENDPOINT.md).

---

## 1. Authentication Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /auth/register | `/auth/register` | `/auth/register` | ✅ Match | Body matches RegisterRequest type |
| POST /auth/verify | `/auth/verify` | `/auth/verify` | ✅ Match | Response is VerifyResponse (no tokens) |
| POST /auth/login | `/auth/login` | `/auth/login` | ✅ Match | Returns tokens and user |
| POST /auth/student-login | `/auth/student-login` | `/auth/student-login` | ✅ Match | Body matches StudentLoginRequest |
| POST /auth/refresh | `/auth/refresh` | `/auth/refresh` | ✅ Match | Direct fetch to avoid recursion |
| POST /auth/logout | `/auth/logout` | `/auth/logout` | ✅ Match | Direct fetch |
| POST /auth/resend-otp | `/auth/resend-otp` | `/auth/resend-otp` | ✅ Match | |
| POST /auth/forgot-password | `/auth/forgot-password` | `/auth/forgot-password` | ✅ Match | |
| POST /auth/reset-password | `/auth/reset-password` | `/auth/reset-password` | ✅ Match | |
| GET /auth/me | `/auth/me` | `/auth/me` | ✅ Match | User type matches |
| PATCH /auth/me | `/auth/me` | `/auth/me` | ✅ Match | |
| PATCH /auth/change-password | `/auth/change-password` | `/auth/change-password` | ✅ Match | PARENT, TUTOR, ADMIN only |
| PATCH /auth/change-pin | `/auth/change-pin` | `/auth/change-pin` | ✅ Match | STUDENT only |
| PATCH /auth/me/timezone | `/auth/me/timezone` | `/auth/me/timezone` | ✅ Match | |
| PATCH /auth/me/profile-picture | `/auth/me/profile-picture` | `/auth/me/profile-picture` | ✅ Match | multipart/form-data |
| DELETE /auth/me/profile-picture | `/auth/me/profile-picture` | `/auth/me/profile-picture` | ✅ Match | |

---

## 2. Student Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /students | `/students` | `/students` | ✅ Match | PARENT auth |
| GET /students | `/students` | `/students` | ✅ Match | PARENT auth |
| GET /students/:id | `/students/:id` | Not implemented | ❌ Missing | Need to add |
| PATCH /students/:id | `/students/:id` | Not implemented | ❌ Missing | Need to add |
| DELETE /students/:id | `/students/:id` | Not implemented | ❌ Missing | Need to add |
| GET /students/:id/activity | `/students/:id/activity` | `/students/:id/activity` | ✅ Match | |
| POST /students/:id/regenerate-pin | `/students/:id/regenerate-pin` | `/students/:id/regenerate-pin` | ✅ Match | |
| GET /students/:id/attendance | `/students/:id/attendance` | `/students/:id/attendance` | ✅ Match | |

---

## 3. Student Self-Service Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /student/me | `/student/me` | `/student/me` | ✅ Match | |
| GET /student/me/schedule | `/student/me/schedule` | `/student/me/schedule` | ✅ Match | |
| GET /student/me/next-class | `/student/me/next-class` | `/student/me/next-class` | ⚠️ Mismatch | Frontend expects `{ session, countdown }`, doc says `{ session, timezone }` |
| GET /student/me/assignments | `/student/me/assignments` | `/student/me/assignments` | ✅ Match | |
| GET /student/me/grades | `/student/me/grades` | `/student/me/grades` | ✅ Match | Returns APPROVED only |
| GET /student/me/progress-reports | `/student/me/progress-reports` | `/student/me/progress-reports` | ✅ Match | |
| GET /student/me/performance | `/student/me/performance` | `/student/me/performance` | ✅ Match | |
| GET /student/me/notifications | `/student/me/notifications` | Aliases to `/notifications` | ✅ Match | |
| GET /student/me/attendance | `/student/me/attendance` | Aliases to `/attendance` | ⚠️ Note | No dedicated endpoint implemented |
| GET /student/me/tutors | `/student/me/tutors` | Not implemented | ❌ Missing | Need to add |
| GET /student/me/enrollments | `/student/me/enrollments` | `/student/me/enrollments` | ✅ Match | |
| GET /student/me/enrollments/:enrollmentId/sessions | `/student/me/enrollments/:enrollmentId/sessions` | `/student/me/enrollments/:enrollmentId/sessions` | ✅ Match | |

---

## 4. Tutor Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /tutor-profile | `/tutor-profile` | `/tutor-profile` | ✅ Match | |
| PATCH /tutor-profile | `/tutor-profile` | `/tutor-profile` | ✅ Match | |
| PATCH /tutor-profile/availability-status | `/tutor-profile/availability-status` | `/tutor-profile/availability-status` | ✅ Match | |
| GET /tutor-profile | `/tutor-profile` | `/tutor-profile` | ✅ Match | |
| GET /students (TUTOR) | `/students` | `/students` | ⚠️ Ambiguous | Clashes with parent route, doc says "without /tutor prefix" but this is problematic. Use adapter. |
| GET /students/:studentId (TUTOR) | `/students/:studentId` | Not implemented | ❌ Missing | Need to add with /tutor prefix |
| GET /students/:studentId/performance (TUTOR) | `/students/:studentId/performance` | `/students/:studentId/performance` | ⚠️ Ambiguous | Clashes with parent route. Use adapter. |
| GET /sessions (TUTOR) | `/sessions` | `/sessions` | ✅ Match | |
| POST /sessions (TUTOR) | `/sessions` | `/sessions` | ✅ Match | |
| PATCH /sessions/:id/reschedule (TUTOR) | `/sessions/:id/reschedule` | `/sessions/:id/reschedule` | ✅ Match | |
| DELETE /sessions/:id (TUTOR) | `/sessions/:id` | `/sessions/:id` | ✅ Match | |
| GET /students/:studentId/scored-items (TUTOR) | `/students/:studentId/scored-items` | `/tutor/students/:studentId/scored-items` | ⚠️ Prefix | Frontend uses /tutor prefix per instructions |
| POST /scored-items (TUTOR) | `/scored-items` | `/tutor/students/:studentId/scored-items` | ⚠️ Prefix | Frontend uses /tutor prefix per instructions |
| PATCH /scored-items/:id (TUTOR) | `/scored-items/:id` | `/tutor/scored-items/:id` | ⚠️ Prefix | Frontend uses /tutor prefix per instructions |
| DELETE /scored-items/:id (TUTOR) | `/scored-items/:id` | `/tutor/scored-items/:id` | ⚠️ Prefix | Frontend uses /tutor prefix per instructions |
| GET /tutor/upcoming-classes | `/tutor/upcoming-classes` | `/tutor/upcoming-classes` | ✅ Match | |

---

## 5. Tutor Application Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /tutor-application | `/tutor-application` | `/tutor-application` | ✅ Match | |
| PATCH /tutor-application | `/tutor-application` | `/tutor-application` | ✅ Match | |
| POST /tutor-application/documents | `/tutor-application/documents` | `/tutor-application/documents` | ✅ Match | |
| GET /tutor-application/documents/:id | `/tutor-application/documents/:id` | Not implemented | ❌ Missing | Need to add |
| DELETE /tutor-application/documents/:id | `/tutor-application/documents/:id` | `/tutor-application/documents/:id` | ✅ Match | |
| POST /tutor-application/submit | `/tutor-application/submit` | `/tutor-application/submit` | ✅ Match | |

---

## 6. Admin Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /admin/tutors/pending | `/admin/tutors/pending` | `/admin/tutors?status=PENDING_VETTING&applicationStatus=SUBMITTED` | ⚠️ Equivalent | Frontend uses query params instead |
| GET /admin/tutors | `/admin/tutors` | `/admin/tutors` | ✅ Match | |
| GET /admin/tutors/:id | `/admin/tutors/:id` | `/admin/tutors/:id` | ✅ Match | |
| GET /admin/tutors/:id/students | `/admin/tutors/:id/students` | `/admin/tutors/:id/students` | ✅ Match | |
| GET /admin/tutors/:id/sessions | `/admin/tutors/:id/sessions` | `/admin/tutors/:id/sessions` | ✅ Match | |
| GET /admin/tutors/:id/grades | `/admin/tutors/:id/grades` | Not implemented | ❌ Missing | Need to add |
| GET /admin/tutors/:id/progress-reports | `/admin/tutors/:id/progress-reports` | Not implemented | ❌ Missing | Need to add |
| PATCH /admin/tutors/:id/vetting | `/admin/tutors/:id/vetting` | `/admin/tutors/:id/vetting` | ✅ Match | |
| GET /admin/enrollments/unmatched | `/admin/enrollments/unmatched` | `/admin/enrollments/unmatched` | ✅ Match | |
| GET /admin/enrollments/:id/pricing | `/admin/enrollments/:id/pricing` | `/admin/enrollments/:id/pricing` | ✅ Match | |
| PATCH /admin/enrollments/:id/pricing | `/admin/enrollments/:id/pricing` | `/admin/enrollments/:id/pricing` | ✅ Match | |
| PATCH /admin/enrollments/:id/assign-tutor | `/admin/enrollments/:id/assign-tutor` | `/admin/enrollments/:id/assign-tutor` | ✅ Match | |
| GET /admin/enrollments/:id/suggested-tutors | `/admin/enrollments/:id/suggested-tutors` | `/admin/enrollments/:id/suggested-tutors` | ✅ Match | |
| GET /admin/subjects | `/admin/subjects` | `/admin/subjects` | ✅ Match | |
| POST /admin/subjects | `/admin/subjects` | `/admin/subjects` | ✅ Match | |
| PATCH /admin/subjects/:id | `/admin/subjects/:id` | `/admin/subjects/:id` | ✅ Match | |
| PUT /admin/subjects/:id/prices/:gradeBandTier | Not in doc | `/admin/subjects/:id` (PATCH) | ⚠️ Different | Frontend uses PATCH /admin/subjects/:id for pricing updates |
| DELETE /admin/subjects/:id | `/admin/subjects/:id` | `/admin/subjects/:id` | ✅ Match | |
| GET /admin/exchange-rate/current | `/admin/exchange-rate/current` | `/admin/exchange-rate/current` | ✅ Match | |
| GET /admin/payments | `/admin/payments` | `/admin/payments` | ✅ Match | |
| GET /admin/payments/summary | `/admin/payments/summary` | `/admin/payments/summary` | ✅ Match | |
| GET /admin/payments/failed | `/admin/payments/failed` | `/admin/payments/failed` | ✅ Match | |
| GET /admin/payments/:id | `/admin/payments/:id` | `/admin/payments/:id` | ✅ Match | |
| PATCH /admin/payments/:id/note | `/admin/payments/:id/note` | `/admin/payments/:id/note` | ✅ Match | |
| POST /admin/payments/:id/reverify | `/admin/payments/:id/reverify` | `/admin/payments/:id/reverify` | ✅ Match | |
| GET /admin/reports/overview | `/admin/reports/overview` | `/admin/reports/overview` | ✅ Match | |
| GET /admin/students | `/admin/students` | `/admin/students` | ✅ Match | |
| GET /admin/students/:id | `/admin/students/:id` | `/admin/students/:id` | ✅ Match | |
| GET /admin/students/:id/enrollments | `/admin/students/:id/enrollments` | Not implemented | ❌ Missing | Need to add |
| GET /admin/students/:id/grades | `/admin/students/:id/grades` | Not implemented | ❌ Missing | Need to add |
| GET /admin/students/:id/attendance | `/admin/students/:id/attendance` | Not implemented | ❌ Missing | Need to add |
| GET /admin/students/:id/sessions | `/admin/students/:id/sessions` | Not implemented | ❌ Missing | Need to add |
| GET /admin/students/:id/assignments | `/admin/students/:id/assignments` | Not implemented | ❌ Missing | Need to add |
| GET /admin/students/:id/progress-reports | `/admin/students/:id/progress-reports` | Not implemented | ❌ Missing | Need to add |
| GET /admin/students/:id/performance | `/admin/students/:id/performance` | `/admin/students/:id/performance` | ✅ Match | |
| PATCH /admin/students/:id/regenerate-pin | `/admin/students/:id/regenerate-pin` | `/admin/students/:id/regenerate-pin` | ⚠️ Method | Frontend uses PATCH, doc uses PATCH (but body method differs) |
| GET /admin/parents | `/admin/parents` | `/admin/parents` | ✅ Match | |
| GET /admin/parents/:id | `/admin/parents/:id` | `/admin/parents/:id` | ✅ Match | |
| GET /admin/users/suspended | `/admin/users/suspended` | `/admin/users/suspended` | ✅ Match | |
| PATCH /admin/users/:id/suspend | `/admin/users/:id/suspend` | `/admin/users/:id/suspend` | ✅ Match | |
| PATCH /admin/users/:id/reactivate | `/admin/users/:id/reactivate` | `/admin/users/:id/reactivate` | ✅ Match | |
| GET /admin/diagnostics/email | `/admin/diagnostics/email` | Not implemented | ❌ Missing | Need to add |
| GET /admin/sessions | `/admin/sessions` | `/admin/sessions` | ✅ Match | |
| POST /admin/sessions | `/admin/sessions` | `/admin/sessions` | ✅ Match | |
| PATCH /admin/sessions/:id/reschedule | `/admin/sessions/:id/reschedule` | `/admin/sessions/:id/reschedule` | ✅ Match | |
| GET /admin/grades/pending | `/admin/grades/pending` | `/admin/grades/pending` | ✅ Match | |
| PATCH /admin/grades/:id/approve | `/admin/grades/:id/approve` | `/admin/grades/:id/approve` | ✅ Match | |
| PATCH /admin/grades/:id/reject | `/admin/grades/:id/reject` | `/admin/grades/:id/reject` | ✅ Match | |
| PATCH /admin/complaints/:id/resolve | `/admin/complaints/:id/resolve` | `/admin/complaints/:id/resolve` | ✅ Match | |

---

## 7. Enrollment Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /enrollments | `/enrollments` | `/enrollments` | ✅ Match | |
| GET /enrollments | `/enrollments` | `/enrollments` | ✅ Match | |
| GET /enrollments/group/:groupId | `/enrollments/group/:groupId` | Not implemented | ❌ Missing | Need to add |
| GET /enrollments/:id | `/enrollments/:id` | Not implemented | ❌ Missing | Need to add |

---

## 8. Enrollment Change Request Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /enrollments/:id/change-requests | `/enrollments/:id/change-requests` | `/enrollments/:id/change-requests` | ✅ Match | |
| GET /enrollments/:id/change-requests | `/enrollments/:id/change-requests` | `/enrollments/:id/change-requests` | ✅ Match | |
| PATCH /change-requests/:id/cancel | `/change-requests/:id/cancel` | `/change-requests/:id/cancel` | ✅ Match | |
| GET /admin/change-requests | `/admin/change-requests` | `/admin/change-requests` | ✅ Match | |
| GET /admin/change-requests/:id | `/admin/change-requests/:id` | `/admin/change-requests/:id` | ✅ Match | |
| PATCH /admin/change-requests/:id/approve | `/admin/change-requests/:id/approve` | `/admin/change-requests/:id/approve` | ✅ Match | |
| PATCH /admin/change-requests/:id/reject | `/admin/change-requests/:id/reject` | `/admin/change-requests/:id/reject` | ✅ Match | |

---

## 9. Session Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /sessions | `/sessions` | `/sessions` | ✅ Match | |
| PATCH /sessions/:id | `/sessions/:id` | `/sessions/:id` | ✅ Match | |
| GET /sessions/:id/recording | `/sessions/:id/recording` | `/sessions/:id/recording` | ✅ Match | |

---

## 10. Class Reminders Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /tutor/upcoming-classes | `/tutor/upcoming-classes` | `/tutor/upcoming-classes` | ✅ Match | |
| GET /admin/class-schedule | `/admin/class-schedule` | `/admin/class-schedule` | ✅ Match | |

---

## 11. Payment Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /payments/initiate | `/payments/initiate` | `/payments/initiate` | ✅ Match | |
| GET /payments | `/payments` | `/payments` | ✅ Match | |
| GET /payments/:id | `/payments/:id` | Not implemented | ❌ Missing | Need to add |
| GET /payments/verify/:reference | `/payments/verify/:reference` | `/payments/verify/:reference` | ✅ Match | |
| POST /payments/webhook | `/payments/webhook` | Not implemented | ❌ N/A | Webhook - client-side not needed |
| POST /webhooks/paystack | `/webhooks/paystack` | Not implemented | ❌ N/A | Webhook - client-side not needed |

---

## 12. Grade Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /grades | `/grades` | `/grades` | ✅ Match | Compiled grade creation |
| GET /grades | `/grades` | `/grades` | ✅ Match | |
| GET /grades/:id | `/grades/:id` | `/grades/:id` | ✅ Match | |
| PATCH /grades/:id | `/grades/:id` | `/grades/:id` | ✅ Match | |
| DELETE /grades/:id | `/grades/:id` | `/grades/:id` | ✅ Match | |
| POST /grades/:id/submit | `/grades/:id/submit` | `/grades/:id/submit` | ✅ Match | |
| POST /grades/:id/withdraw | `/grades/:id/withdraw` | `/grades/:id/withdraw` | ✅ Match | |
| GET /grades/:id/preview | `/grades/:id/preview` | `/grades/:id/preview` | ✅ Match | |
| POST /admin/grades/bulk-approve | `/admin/grades/bulk-approve` | `/admin/grades/bulk-approve` | ✅ Match | |

---

## 13. Scored Items Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /tutor/students/:studentId/scored-items | `/tutor/students/:studentId/scored-items` | `/tutor/students/:studentId/scored-items` | ✅ Match | |
| POST /tutor/scored-items | `/tutor/scored-items` | `/tutor/students/:studentId/scored-items` | ⚠️ Path | Frontend creates under student path |
| PATCH /tutor/scored-items/:id | `/tutor/scored-items/:id` | `/tutor/scored-items/:id` | ✅ Match | |
| DELETE /tutor/scored-items/:id | `/tutor/scored-items/:id` | `/tutor/scored-items/:id` | ✅ Match | |

---

## 14. Assignment Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /assignments | `/assignments` | `/assignments` | ✅ Match | |
| GET /assignments | `/assignments` | `/assignments` | ✅ Match | |
| GET /assignments/:id | `/assignments/:id` | Not implemented | ❌ Missing | Need to add |
| PATCH /assignments/:id | `/assignments/:id` | `/assignments/:id` | ✅ Match | |
| DELETE /assignments/:id | `/assignments/:id` | `/assignments/:id` | ✅ Match | |
| POST /assignments/:id/submit | `/assignments/:id/submit` | `/assignments/:id/submit` | ✅ Match | |

---

## 15. Quiz Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /quiz/assignments/:id/questions | `/quiz/assignments/:id/questions` | `/quiz/assignments/:id/questions` | ✅ Match | |
| GET /quiz/assignments/:id/questions | `/quiz/assignments/:id/questions` | `/quiz/assignments/:id/questions` | ✅ Match | |
| POST /quiz/assignments/:id/quiz/start | `/quiz/assignments/:id/quiz/start` | `/quiz/assignments/:id/quiz/start` | ✅ Match | |
| POST /quiz-attempts/:id/answer | `/quiz-attempts/:id/answer` | `/quiz-attempts/:id/answer` | ✅ Match | |
| PATCH /quiz-attempts/:id/complete | `/quiz-attempts/:id/complete` | `/quiz/quiz-attempts/:id/complete` | ⚠️ Path | Frontend has extra /quiz, doc says /quiz-attempts/:id/complete |

---

## 16. Notification Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /notifications | `/notifications` | `/notifications` | ✅ Match | |
| GET /notifications/unread-count | `/notifications/unread-count` | `/notifications/unread-count` | ✅ Match | |
| PATCH /notifications/:id/read | `/notifications/:id/read` | `/notifications/:id/read` | ✅ Match | |
| PATCH /notifications/read-all | `/notifications/read-all` | `/notifications/read-all` | ✅ Match | |
| PATCH /notifications/read-by-entity | `/notifications/read-by-entity` | `/notifications/read-by-entity` | ✅ Match | |
| POST /notifications/stream-ticket | `/notifications/stream-ticket` | `/notifications/stream-ticket` | ✅ Match | |
| GET /notifications/stream | `/notifications/stream` | Not implemented | ❌ SSE | Client-side SSE implementation needed |

---

## 17. Message Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /messages | `/messages` | `/messages` | ✅ Match | |
| POST /messages | `/messages` | `/messages` | ✅ Match | |
| GET /messages/:threadId | `/messages/:threadId` | `/messages/:threadId` | ✅ Match | |
| PATCH /messages/:threadId/read | `/messages/:threadId/read` | Not implemented | ❌ Missing | Need to add |
| GET /messages/admin-contact | `/messages/admin-contact` | `/messages/admin-contact` | ✅ Match | |
| GET /messages/unread-count | `/messages/unread-count` | Not implemented | ❌ Missing | Need to add |

---

## 18. Complaint Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /complaints | `/complaints` | `/complaints` | ✅ Match | |
| GET /complaints | `/complaints` | `/complaints` | ✅ Match | |
| GET /complaints/:id | `/complaints/:id` | Not implemented | ❌ Missing | Need to add |
| PATCH /complaints/:id | `/complaints/:id` | Not implemented | ❌ Missing | Need to add (admin only) |

---

## 19. Subject Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /subjects | `/subjects` | `/subjects` | ✅ Match | |
| GET /subjects/public | `/subjects/public` | `/subjects/public` | ✅ Match | |
| GET /subjects/:id | `/subjects/:id` | Not implemented | ❌ Missing | Need to add |

---

## 20. Pricing Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /pricing/quote | `/pricing/quote` | `/pricing/quote` | ✅ Match | |

---

## 21. Progress Report Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| POST /progress-reports | `/progress-reports` | `/progress-reports` | ✅ Match | |
| GET /progress-reports | `/progress-reports` | `/progress-reports` | ✅ Match | |
| GET /progress-reports/:id | `/progress-reports/:id` | Not implemented | ❌ Missing | Need to add |
| PATCH /progress-reports/:id | `/progress-reports/:id` | Not implemented | ❌ Missing | Need to add |

---

## 22. Attendance Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /attendance | `/attendance` | Not implemented | ❌ Missing | Need to add |
| GET /attendance/:id | `/attendance/:id` | Not implemented | ❌ Missing | Need to add |
| POST /attendance | `/attendance` | Not implemented | ❌ Missing | Need to add |

---

## 23. Performance Endpoints

| Endpoint | Documented Path | Frontend Path | Status | Notes |
|----------|----------------|---------------|--------|-------|
| GET /students/:id/performance (PARENT) | `/students/:id/performance` | `/students/:id/performance` | ✅ Match | |
| GET /student/me/performance (STUDENT) | `/student/me/performance` | `/student/me/performance` | ✅ Match | |
| GET /tutor/students/:studentId/performance (TUTOR) | `/tutor/students/:studentId/performance` | `/students/:studentId/performance` | ⚠️ Prefix | Frontend lacks /tutor prefix |
| GET /admin/students/:id/performance (ADMIN) | `/admin/students/:id/performance` | `/admin/students/:id/performance` | ✅ Match | |

---

## Type Mismatches

### Scored Item Types
- **ENDPOINT.md enum**: 'QUIZ', 'ASSIGNMENT', 'EXAM', 'PROJECT', 'PARTICIPATION', 'ATTENDANCE'
- **Frontend UI enum**: 'QUIZ', 'ASSIGNMENT', 'TEST', 'PARTICIPATION'
- **Status**: ⚠️ Different - TEST maps to EXAM, PROJECT missing, ATTENDANCE not in UI enum
- **Action**: Keep UI enum in constant, flag in BACKEND_GAPS.md

### Grade Component Types
- **ENDPOINT.md enum**: 'QUIZ', 'ASSIGNMENT', 'EXAM', 'PARTICIPATION', 'ATTENDANCE'
- **Frontend type**: 'QUIZ', 'ASSIGNMENT', 'EXAM', 'PARTICIPATION', 'ATTENDANCE'
- **Status**: ✅ Match

### SessionFrequency
- **ENDPOINT.md enum**: 'WEEKLY', 'TWICE_WEEKLY', 'THRICE_WEEKLY', 'FIVE_TIMES_WEEKLY'
- **Frontend type**: 'WEEKLY', 'TWICE_WEEKLY', 'THRICE_WEEKLY', 'FIVE_TIMES_WEEKLY'
- **Status**: ✅ Match

### NotificationCategory
- **ENDPOINT.md enum**: 'ASSIGNMENTS', 'GRADES', 'SESSIONS', 'MESSAGES', 'USERS', 'ENROLLMENT', 'PAYMENTS', 'PRICING', 'COMPLAINTS', 'QUIZZES', 'SCHEDULE'
- **Frontend type**: 'USERS', 'SESSIONS', 'MESSAGES', 'COMPLAINTS', 'ENROLLMENT', 'PAYMENTS', 'GRADES', 'SCHEDULE', 'ASSIGNMENTS', 'PRICING', 'QUIZZES'
- **Status**: ✅ Match (order differs, values same)

---

## Missing Endpoints Summary

### High Priority (Core Functionality)
1. GET /students/:id (PARENT - student detail)
2. PATCH /students/:id (PARENT - update student)
3. DELETE /students/:id (PARENT - delete student)
4. GET /student/me/tutors (STUDENT - list tutors)
5. GET /students/:id (TUTOR - student detail with /tutor prefix)
6. GET /admin/tutors/:id/grades (ADMIN - tutor grades)
7. GET /admin/tutors/:id/progress-reports (ADMIN - tutor progress reports)
8. GET /admin/students/:id/enrollments (ADMIN - student enrollments)
9. GET /admin/students/:id/grades (ADMIN - student grades)
10. GET /admin/students/:id/attendance (ADMIN - student attendance)
11. GET /admin/students/:id/sessions (ADMIN - student sessions)
12. GET /admin/students/:id/assignments (ADMIN - student assignments)
13. GET /admin/students/:id/progress-reports (ADMIN - student progress reports)
14. GET /enrollments/group/:groupId (PARENT/TUTOR/ADMIN - group detail)
15. GET /enrollments/:id (PARENT/TUTOR - enrollment detail)
16. GET /payments/:id (PARENT/ADMIN - payment detail)
17. GET /assignments/:id (All roles - assignment detail)
18. GET /complaints/:id (PARENT/ADMIN - complaint detail)
19. PATCH /complaints/:id (ADMIN - resolve complaint)
20. GET /subjects/:id (All roles - subject detail)
21. GET /progress-reports/:id (All roles - progress report detail)
22. PATCH /progress-reports/:id (TUTOR - update progress report)
23. GET /attendance (All roles - attendance list)
24. GET /attendance/:id (All roles - attendance detail)
25. POST /attendance (TUTOR - mark attendance)
26. PATCH /messages/:threadId/read (All roles - mark thread read)
27. GET /messages/unread-count (All roles - message unread count)
28. GET /tutor-application/documents/:id (TUTOR/ADMIN - document download)

### Medium Priority (Nice to Have)
29. GET /admin/diagnostics/email (ADMIN - email diagnostics)
30. GET /notifications/stream (SSE - already implemented client-side)

---

## Path Prefix Ambiguities (to resolve in BACKEND_GAPS.md)

1. **Tutor student routes**: Doc lists `/students`, `/students/:studentId`, `/students/:studentId/performance` under Tutor without /tutor prefix. Frontend should use `/tutor/...` prefix for all tutor-specific student access.
2. **Tutor scored items**: Doc lists `/scored-items` for POST/PATCH/DELETE, but frontend uses `/tutor/scored-items/:id` and `/tutor/students/:studentId/scored-items`.
3. **Tutor performance**: Doc lists `/students/:studentId/performance` but frontend uses `/students/:studentId/performance` (no /tutor prefix).

---

## Response Shape Gaps (to document in BACKEND_GAPS.md)

1. **GET /student/me/next-class**: Frontend expects `{ session, countdown }`, doc says `{ session, timezone }`
2. **Grade endpoints**: Doc says "Updated X" or "Created X" without field details - frontend reads existing types
3. **Admin grade detail**: GET /admin/grades/:id doesn't exist in doc, only GET /grades/:id - need to verify breakdown fields
4. **Notification item shape**: Undocumented - frontend tolerant of `isRead`/`read` and `body`/`message` differences
