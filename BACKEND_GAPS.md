# Backend API Gaps and Ambiguities

This file documents endpoints, response shapes, and enum values that are ambiguous or missing from ENDPOINT.md. All ambiguous routes are handled through adapter functions in lib/api.ts so future backend changes touch one place.

---

## 1. Tutor Route Prefix Ambiguity

### Issue
ENDPOINT.md lists the following routes under "Tutor" without a `/tutor` prefix:
- GET /students (tutor's own students)
- GET /students/:studentId (tutor's student detail)
- GET /students/:studentId/performance (tutor's student performance)
- GET /sessions (tutor's own sessions)
- POST /sessions (tutor creates session)
- PATCH /sessions/:id/reschedule (tutor reschedules session)
- DELETE /sessions/:id (tutor deletes session)
- GET /students/:studentId/scored-items (tutor's student scored items)
- POST /scored-items (tutor creates scored item)
- PATCH /scored-items/:id (tutor updates scored item)
- DELETE /scored-items/:id (tutor deletes scored item)

These clash with parent and shared routes:
- GET /students (PARENT - parent's own students)
- GET /students/:id (PARENT - parent's student detail)
- GET /students/:id/performance (PARENT - parent's student performance)
- GET /sessions (shared, role-based)
- POST /sessions (shared, role-based)
- PATCH /sessions/:id (shared, role-based)
- DELETE /sessions/:id (shared, role-based)

### Solution
Use `/tutor/...` prefix for all tutor-specific routes in lib/api.ts:
- `/tutor/students` - tutor's own students (or use shared /students with TUTOR auth)
- `/tutor/students/:studentId` - tutor's student detail
- `/tutor/students/:studentId/performance` - tutor's student performance
- `/tutor/students/:studentId/scored-items` - tutor's student scored items
- `/tutor/scored-items/:id` - scored item update/delete
- `/tutor/upcoming-classes` - upcoming classes (already in doc)

### Constant
```typescript
const TUTOR_ROUTE_PREFIX = '/tutor'
```

### Current Implementation
Frontend already uses `/tutor/...` prefix for scored items. Need to audit and fix other tutor routes.

---

## 2. Scored Item Type Enum Mismatch

### Issue
ENDPOINT.md lists two different enums for scored item types:

**In Scored Items section:**
```typescript
type: 'QUIZ' | 'ASSIGNMENT' | 'EXAM' | 'PROJECT' | 'PARTICIPATION' | 'ATTENDANCE'
```

**In Grade Components section:**
```typescript
type: 'QUIZ' | 'ASSIGNMENT' | 'EXAM' | 'PARTICIPATION' | 'ATTENDANCE'
```

**In types.ts (UI):**
```typescript
export type ScoredItemType = 'QUIZ' | 'ASSIGNMENT' | 'TEST' | 'PARTICIPATION'
```

### Solution
Use QUIZ, ASSIGNMENT, TEST, PARTICIPATION as the UI options. Keep the list in one constant in lib/api.ts. Map TEST to EXAM when calling the backend.

### Constant
```typescript
const SCORED_ITEM_TYPES: ScoredItemType[] = ['QUIZ', 'ASSIGNMENT', 'TEST', 'PARTICIPATION']
```

### Mapping
When sending to backend:
- UI 'TEST' → Backend 'EXAM'

### Current Implementation
Already implemented in lib/api.ts line 93-95.

---

## 3. Grade Compile Payload Structure

### Issue
ENDPOINT.md documents grade compile as:
```typescript
{
  enrollmentId: string
  periodStart: string
  periodEnd: string
  components: Array<{
    type: string
    weight: number
    scoredItemId?: string
    attendanceRate?: number
  }>
  tutorComment?: string
}
```

Requirements:
- Component weights must total exactly 100
- attendanceRate is optional (server can compute it from sessions)
- scoredItemId is optional (for manual components like TEST or PARTICIPATION)

### Solution
Build the wizard to this payload:
- One component per selected scored item (QUIZ, ASSIGNMENT)
- One component per manual type (TEST, PARTICIPATION)
- ATTENDANCE component with attendanceRate as read-only (show server-computed value, never send)
- Live validation: disable save/submit when weight total != 100

### Current Implementation
Frontend already implements this structure. Need to verify attendanceRate is never sent if read-only.

---

## 4. Admin Grade Review Endpoints

### Issue
ENDPOINT.md does not document:
- GET /admin/grades (list all grades)
- GET /admin/grades/:id (grade detail)

Only documents:
- GET /admin/grades/pending (pending grades queue)
- PATCH /admin/grades/:id/approve (approve grade)
- PATCH /admin/grades/:id/reject (reject grade)
- POST /admin/grades/bulk-approve (bulk approve)

### Solution
- Use GET /admin/grades/pending for the review queue
- Use GET /grades/:id for detail view (shared endpoint)
- If GET /grades/:id lacks component breakdown, show what is returned and flag

### Current Implementation
Frontend uses GET /admin/grades/pending for queue and GET /grades/:id for detail. Need to verify breakdown fields are present.

---

## 5. Admin Session Create/Reschedule

### Issue
ENDPOINT.md documents POST /admin/sessions with:
```typescript
{
  tutorId: string
  scheduledAt: string
  durationMinutes: number
  googleMeetLink?: string
  googleEventId?: string
  participantEnrollmentIds: string[]
  sharedSessionConfirmed?: boolean
}
```

And PATCH /admin/sessions/:id/reschedule with:
```typescript
{
  scheduledAt?: string
  googleMeetLink?: string
}
```

### Solution
- Never send googleMeetLink or googleEventId from the UI
- The server creates the Google Meet event and generates the link
- Only send scheduledAt, durationMinutes, and participantEnrollmentIds

### Current Implementation
Frontend already avoids sending googleMeetLink and googleEventId. Verified.

---

## 6. Complaint Resolve Endpoint

### Issue
ENDPOINT.md documents PATCH /admin/complaints/:id/resolve with:
```typescript
{
  resolution: string
}
```

### Solution
Use this exact endpoint and payload for resolving complaints.

### Current Implementation
Frontend already uses PATCH /admin/complaints/:id/resolve with { resolution }. Verified.

---

## 7. Enrollment Change Request Allowed Fields

### Issue
ENDPOINT.md states: "Only schedule fields are allowed (startDate, endDate, availableDays, preferredStartHour, preferredEndHour). Changes to sessionFrequency, billingFrequency, or subjects are rejected."

### Solution
- Change request form only offers: startDate, endDate, availableDays, preferredStartHour, preferredEndHour
- Never offer or send: sessionFrequency, billingFrequency, subjects

### Current Implementation
Frontend already restricts to schedule fields only. Verified.

---

## 8. Enrollment SessionFrequency Enum

### Issue
ENDPOINT.md documents sessionFrequency as:
```typescript
'WEEKLY' | 'TWICE_WEEKLY' | 'THRICE_WEEKLY' | 'FIVE_TIMES_WEEKLY'
```

### Solution
Match the enrollment wizard dropdown to this exact enum.

### Current Implementation
Frontend SessionFrequency type already matches. Verified.

---

## 9. Response Shape Gaps

### Issue
Some endpoints in ENDPOINT.md only document response as "Updated X" or "Created X" without field details:
- POST /tutor-profile (201)
- PATCH /tutor-profile (200)
- PATCH /tutor-profile/availability-status (200)
- POST /students (201)
- PATCH /students/:id (200)
- DELETE /students/:id (200)
- POST /enrollments (201)
- POST /enrollments/:id/change-requests (201)
- PATCH /enrollments/:id/change-requests (cancel) (200)
- PATCH /admin/change-requests/:id/approve (200)
- PATCH /admin/change-requests/:id/reject (200)
- POST /admin/grades/bulk-approve (200)
- POST /payments/initiate (200)
- POST /assignments (201)
- PATCH /assignments/:id (200)
- DELETE /assignments/:id (200)
- POST /grades (201)
- PATCH /grades/:id (200)
- DELETE /grades/:id (200)
- POST /grades/:id/submit (200)
- POST /grades/:id/withdraw (200)
- POST /progress-reports (201)
- PATCH /progress-reports/:id (200)
- POST /complaints (201)
- PATCH /complaints/:id (200)
- POST /messages (201)
- PATCH /admin/tutors/:id/vetting (200)
- PATCH /admin/enrollments/:id/assign-tutor (200)
- PATCH /admin/subjects/:id (200)
- DELETE /admin/subjects/:id (200)
- PATCH /admin/users/:id/suspend (200)
- PATCH /admin/users/:id/reactivate (200)
- POST /admin/sessions (201)
- PATCH /admin/sessions/:id/reschedule (200)
- PATCH /admin/grades/:id/approve (200)
- PATCH /admin/grades/:id/reject (200)
- POST /notifications/stream-ticket (200)
- PATCH /notifications/:id/read (200)
- PATCH /notifications/read-all (200)
- PATCH /notifications/read-by-entity (200)
- POST /tutor-application/documents (201)
- DELETE /tutor-application/documents/:id (200)
- POST /tutor-application/submit (200)
- PATCH /auth/me (200)
- PATCH /auth/change-password (200)
- PATCH /auth/change-pin (200)
- PATCH /auth/me/timezone (200)
- PATCH /auth/me/profile-picture (200)
- DELETE /auth/me/profile-picture (200)
- POST /students/:id/regenerate-pin (200)
- PATCH /admin/students/:id/regenerate-pin (200)
- POST /admin/payments/:id/reverify (200)
- PATCH /admin/payments/:id/note (200)
- POST /scored-items (201)
- PATCH /scored-items/:id (200)
- DELETE /scored-items/:id (200)

### Solution
- Read existing types in lib/types.ts for these responses
- Keep types tolerant (optional fields, no crashes on missing data)
- List these endpoints in this file so future backend changes are easy to track

### Current Implementation
Frontend types are already tolerant with optional fields. Need to verify all are listed here.

---

## 10. Notification Item Shape

### Issue
ENDPOINT.md does not document the notification item shape. Frontend expects:
```typescript
{
  id: string
  userId: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  read: boolean
  isRead?: boolean  // Some endpoints may use isRead instead
  body?: string     // Some endpoints may use body instead of message
  entityType?: string
  entityId?: string
  createdAt: string
}
```

### Solution
- Read notification responses tolerantly
- Support both `read` and `isRead` fields
- Support both `message` and `body` fields
- Flag in this file that the shape is undocumented

### Current Implementation
Frontend already reads tolerantly with both field variants. Verified in types.ts lines 724-726.

---

## 11. GET /student/me/next-class Response Shape

### Issue
ENDPOINT.md documents response as:
```typescript
{
  session: { sessionId, scheduledAt, durationMinutes, googleMeetLink, tutor, subject }
  timezone: string
}
```

Frontend expects:
```typescript
{
  session: Session
  countdown: string
}
```

### Solution
- Frontend needs to handle the documented response shape
- Compute countdown client-side from session.scheduledAt
- Use timezone from response or fall back to parent's timezone

### Current Implementation
Frontend expects countdown field - needs to be fixed to compute from scheduledAt.

---

## 12. Quiz Complete Endpoint Path

### Issue
ENDPOINT.md documents:
```
PATCH /quiz-attempts/:id/complete
```

Frontend uses:
```
PATCH /quiz/quiz-attempts/:id/complete
```

### Solution
Fix frontend to use `/quiz-attempts/:id/complete` (remove extra /quiz).

### Current Implementation
Frontend has incorrect path - needs to be fixed.

---

## 13. Missing Admin Tutor Endpoints

### Issue
ENDPOINT.md documents but frontend is missing:
- GET /admin/tutors/:id/grades (tutor's submitted grades)
- GET /admin/tutors/:id/progress-reports (tutor's progress reports)

### Solution
Add these endpoints to lib/api.ts.

### Current Implementation
Missing - need to add.

---

## 14. Missing Admin Student Endpoints

### Issue
ENDPOINT.md documents but frontend is missing:
- GET /admin/students/:id/enrollments (student's enrollments)
- GET /admin/students/:id/grades (student's grades)
- GET /admin/students/:id/attendance (student's attendance)
- GET /admin/students/:id/sessions (student's sessions)
- GET /admin/students/:id/assignments (student's assignments)
- GET /admin/students/:id/progress-reports (student's progress reports)

### Solution
Add these endpoints to lib/api.ts.

### Current Implementation
Missing - need to add.

---

## 15. Missing Shared Endpoints

### Issue
ENDPOINT.md documents but frontend is missing:
- GET /enrollments/group/:groupId (enrollment group detail)
- GET /enrollments/:id (enrollment detail)
- GET /payments/:id (payment detail)
- GET /assignments/:id (assignment detail)
- GET /complaints/:id (complaint detail)
- PATCH /complaints/:id (admin resolve complaint - already implemented)
- GET /subjects/:id (subject detail)
- GET /progress-reports/:id (progress report detail)
- PATCH /progress-reports/:id (update progress report)
- GET /attendance (attendance list)
- GET /attendance/:id (attendance detail)
- POST /attendance (mark attendance)
- PATCH /messages/:threadId/read (mark thread read)
- GET /messages/unread-count (message unread count)
- GET /tutor-application/documents/:id (document download)

### Solution
Add these endpoints to lib/api.ts.

### Current Implementation
Most missing - need to add.

---

## 16. Student Self-Service Endpoints

### Issue
ENDPOINT.md documents but frontend is missing:
- GET /student/me/tutors (student's assigned tutors)

### Solution
Add to lib/api.ts.

### Current Implementation
Missing - need to add.

---

## 17. Parent Student Management Endpoints

### Issue
ENDPOINT.md documents but frontend is missing:
- GET /students/:id (parent's student detail)
- PATCH /students/:id (update student)
- DELETE /students/:id (delete student)

### Solution
Add to lib/api.ts.

### Current Implementation
Missing - need to add.

---

## 18. Admin Diagnostics Endpoint

### Issue
ENDPOINT.md documents:
- GET /admin/diagnostics/email (email diagnostics)

### Solution
Add to lib/api.ts if needed for troubleshooting.

### Current Implementation
Missing - low priority.

---

## 19. SSE Notification Stream

### Issue
ENDPOINT.md documents:
- GET /notifications/stream?ticket=... (SSE stream with events: message, heartbeat)

### Solution
Already implemented client-side with EventSource. No backend endpoint needed in lib/api.ts.

### Current Implementation
Already implemented.

---

## Summary of Required Changes

### High Priority (Fix in lib/api.ts)
1. Fix GET /student/me/next-class response handling (compute countdown, handle timezone)
2. Fix PATCH /quiz-attempts/:id/complete path (remove /quiz prefix)
3. Add GET /students/:id (PARENT)
4. Add PATCH /students/:id (PARENT)
5. Add DELETE /students/:id (PARENT)
6. Add GET /student/me/tutors (STUDENT)
7. Add GET /students/:studentId (TUTOR with /tutor prefix)
8. Add GET /admin/tutors/:id/grades
9. Add GET /admin/tutors/:id/progress-reports
10. Add GET /admin/students/:id/enrollments
11. Add GET /admin/students/:id/grades
12. Add GET /admin/students/:id/attendance
13. Add GET /admin/students/:id/sessions
14. Add GET /admin/students/:id/assignments
15. Add GET /admin/students/:id/progress-reports
16. Add GET /enrollments/group/:groupId
17. Add GET /enrollments/:id
18. Add GET /payments/:id
19. Add GET /assignments/:id
20. Add GET /complaints/:id
21. Add GET /subjects/:id
22. Add GET /progress-reports/:id
23. Add PATCH /progress-reports/:id
24. Add GET /attendance
25. Add GET /attendance/:id
26. Add POST /attendance
27. Add PATCH /messages/:threadId/read
28. Add GET /messages/unread-count
29. Add GET /tutor-application/documents/:id

### Medium Priority
30. Add GET /admin/diagnostics/email

### Low Priority (Already Handled)
- SSE stream (client-side implementation)
- Response shape tolerance (already implemented)
