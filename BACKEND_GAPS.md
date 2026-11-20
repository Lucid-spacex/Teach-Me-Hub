# Backend Gaps and Ambiguities

This document lists known ambiguities in ENDPOINT.md and how they are handled via adapters in lib/api.ts.

## 1. Tutor Route Prefix

**Ambiguity:** ENDPOINT.md lists tutor routes under different sections (Tutor, Tutor Profile) with inconsistent prefixes.

**Adapter:** TUTOR_ROUTE_PREFIX constant in lib/api.ts (line 93)

**Implementation:**
- All tutor-specific routes use `/tutor/` prefix
- Endpoints affected:
  - `/tutor/students` (instead of `/students` for tutors)
  - `/tutor/sessions` (instead of `/sessions` for tutors)
  - `/tutor/students/:studentId/scored-items`
  - `/tutor/students/:studentId/performance`
  - `/tutor/grades` (grade compilation)
  - `/tutor/upcoming-classes`
  - `/tutor/scored-items` (CRUD)
- Profile routes use `/tutor-profile` prefix (documented separately)

**Status:** ✅ Resolved with constant

## 2. Scored Item Types

**Ambiguity:** ENDPOINT.md lists two different enums for scored item types:
- Section "Scored Items": 'QUIZ', 'ASSIGNMENT', 'EXAM', 'PROJECT', 'PARTICIPATION', 'ATTENDANCE'
- Instructions: UI should use QUIZ, ASSIGNMENT, TEST, PARTICIPATION

**Adapter:** SCORED_ITEM_TYPES constant in lib/api.ts (line 96)

**Implementation:**
- UI types: QUIZ, ASSIGNMENT, TEST, PARTICIPATION
- Backend mapping: TEST → EXAM in API calls (lib/api.ts line 1456)
- Code snippet:
  ```typescript
  const backendData = {
    ...data,
    type: data.type === 'TEST' ? 'EXAM' : data.type,
  }
  ```

**Status:** ✅ Resolved with constant and mapping

## 3. Grade Compile Wizard

**Ambiguity:** ENDPOINT.md documents POST /grades with components array but doesn't specify exact field structure for the wizard UI.

**Adapter:** GradeComponentType enum in lib/types.ts (line 1086)

**Implementation:**
- UI wizard builds: `components[{type, weight, scoredItemId?, attendanceRate?}]`
- Weight validation: Client-side validation (must total exactly 100)
- Attendance: Read-only field, computed by server, not sent if server computes
- Component types: QUIZ, ASSIGNMENT, EXAM, PARTICIPATION, ATTENDANCE
- Preview endpoint: POST /grades/:id/preview (or POST /tutor/grades/preview)

**Status:** ✅ Resolved with enum and client-side validation

## 4. Admin Grade Review

**Ambiguity:** ENDPOINT.md documents GET /admin/grades/pending for queue and GET /grades/:id for detail, but doesn't specify exact query params for filtering.

**Adapter:** getAdminCompiledGrades in lib/api.ts (line 1538)

**Implementation:**
- Queue: GET /admin/grades with status=PENDING_APPROVAL filter
- Detail: GET /grades/:id (generic endpoint)
- Approve: PATCH /admin/grades/:id/approve
- Reject: PATCH /admin/grades/:id/reject with required reason
- Bulk approve: POST /admin/grades/bulk-approve

**Status:** ✅ Resolved with filter implementation

## 5. Admin Session Create or Reschedule

**Ambiguity:** ENDPOINT.md mentions googleMeetLink and googleEventId in body but notes "server creates the Meet event."

**Adapter:** createAdminSession and rescheduleSession in lib/api.ts (lines 1703, 1716)

**Implementation:**
- Never send googleMeetLink or googleEventId in request body
- Display googleMeetLink from response
- Fields sent: participantEnrollmentIds, scheduledAt, durationMinutes, sharedSessionConfirmed

**Status:** ✅ Resolved by omitting server-generated fields

## 6. Complaint Resolve

**Ambiguity:** ENDPOINT.md documents PATCH /admin/complaints/:id/resolve but doesn't specify if it's the same as PATCH /complaints/:id.

**Adapter:** resolveComplaint in lib/api.ts (line 1412)

**Implementation:**
- Uses /admin/complaints/:id/resolve path
- Body: { resolution }
- Required field: resolution (min 1 char)

**Status:** ✅ Resolved with explicit path

## 7. Change Requests

**Ambiguity:** ENDPOINT.md states "Only schedule fields are allowed" but doesn't list all forbidden fields explicitly.

**Adapter:** CreateChangeRequestRequest type in lib/types.ts (line 1205)

**Implementation:**
- Allowed fields: startDate, endDate, availableDays, preferredStartHour, preferredEndHour
- Forbidden fields: billingFrequency, sessionFrequency, subject (never offered in UI)
- Endpoint: POST /enrollments/:id/change-requests

**Status:** ✅ Resolved with restricted type definition

## 8. SessionFrequency Enum

**Ambiguity:** Different parts of ENDPOINT.md list different values (e.g., BI_WEEKLY in legacy docs).

**Adapter:** SessionFrequency type in lib/types.ts (line 180)

**Implementation:**
- Values: WEEKLY, TWICE_WEEKLY, THRICE_WEEKLY, FIVE_TIMES_WEEKLY
- Legacy BI_WEEKLY removed from new enrollments
- Matches ENDPOINT.md enum reference (line 2396)

**Status:** ✅ Resolved with explicit enum

## 9. POST /auth/verify Response

**Ambiguity:** ENDPOINT.md explicitly states "Does NOT return tokens" but some frontend code might expect them.

**Adapter:** VerifyResponse type in lib/types.ts (line 89)

**Implementation:**
- Response: { message, user }
- No accessToken or refreshToken fields
- Redirect to login after verification (handled in VerifyForm component)

**Status:** ✅ Resolved with explicit type

## 10. Vague Response Documentation

**Ambiguity:** ENDPOINT.md often documents responses as "Updated X" or "Created X" without field details.

**Adapter:** Tolerant types in lib/types.ts

**Implementation:**
- Optional fields where backend may omit data
- No crashes on missing data
- Examples:
  - Notification: tolerant to both read/isRead and message/body (lines 714-716)
  - Session: both googleMeetLink and meetLink supported (line 237)
  - Grade: both comments and feedback supported (line 781)

**Endpoints with vague documentation:**
- PATCH /auth/me/timezone: "Timezone updated successfully"
- PATCH /auth/me/profile-picture: "Profile picture updated successfully"
- DELETE /auth/me/profile-picture: "Profile picture deleted successfully"
- POST /students: "emailSent: true" but no other fields guaranteed
- PATCH /students/:id: "Updated student"
- DELETE /students/:id: "Student deleted successfully"
- POST /students/:id/regenerate-pin: "PIN regenerated successfully"
- POST /tutor-profile: "Created tutor profile"
- PATCH /tutor-profile: "Updated tutor profile"
- PATCH /tutor-profile/availability-status: "Updated tutor profile"
- POST /enrollments: "Created enrollments"
- PATCH /enrollments/:id/change-requests: "Created change request"
- PATCH /admin/enrollments/:id/assign-tutor: "Assigned tutor"
- POST /admin/subjects: "Created subject"
- PATCH /admin/subjects/:id: "Updated subject"
- PUT /admin/subjects/:id/prices/:gradeBandTier: "Upserted subject price"
- DELETE /admin/subjects/:id: "Deleted subject"
- PATCH /admin/payments/:id/note: "Added admin note"
- POST /admin/payments/:id/reverify: "Payment verified"
- PATCH /admin/tutors/:id/vetting: "Updated tutor status"
- PATCH /admin/users/:id/suspend: "User suspended"
- PATCH /admin/users/:id/reactivate: "User reactivated"
- POST /admin/sessions: "Created session"
- PATCH /admin/sessions/:id/reschedule: "Rescheduled session"
- PATCH /admin/grades/:id/approve: "Approved grade"
- PATCH /admin/grades/:id/reject: "Rejected grade"
- PATCH /admin/complaints/:id/resolve: "Resolved complaint"
- POST /assignments: "Created assignment"
- PATCH /assignments/:id: "Updated assignment"
- DELETE /assignments/:id: "Deleted assignment"
- POST /assignments/:id/submit: "Submitted assignment"
- POST /quiz/assignments/:id/questions: "Created quiz question"
- POST /quiz/assignments/:id/quiz/start: "Started quiz attempt"
- POST /quiz-attempts/:id/answer: "Answer recorded"
- PATCH /quiz-attempts/:id/complete: "Completed quiz"
- PATCH /notifications/:id/read: "Notification marked as read"
- PATCH /notifications/read-all: "All notifications marked as read"
- PATCH /notifications/read-by-entity: "Notifications for entity marked as read"
- POST /notifications/stream-ticket: SSE ticket
- POST /messages: "Sent message"
- PATCH /messages/:threadId/read: "Thread marked as read"
- POST /complaints: "Created complaint"
- PATCH /complaints/:id: "Resolved complaint"
- POST /progress-reports: "Created progress report"
- PATCH /progress-reports/:id: "Updated progress report"
- POST /attendance: "Marked attendance"
- POST /grades: "Created DRAFT grade"
- PATCH /grades/:id: "Updated grade"
- DELETE /grades/:id: "Deleted grade"
- POST /grades/:id/submit: "Grade submitted for approval"
- POST /grades/:id/withdraw: "Grade withdrawn to DRAFT"
- POST /admin/grades/bulk-approve: "Bulk approval results"
- POST /tutor/scored-items: "Created scored item"
- PATCH /tutor/scored-items/:id: "Updated scored item"
- DELETE /tutor/scored-items/:id: "Deleted scored item"
- PATCH /change-requests/:id/cancel: "Cancelled change request"
- PATCH /admin/change-requests/:id/approve: "Approved change request"
- PATCH /admin/change-requests/:id/reject: "Rejected change request"

**Status:** ✅ Resolved with tolerant types

## 11. Notification Item Shape

**Ambiguity:** ENDPOINT.md partially documents notification item shape but doesn't specify all field variations.

**Adapter:** Notification type in lib/types.ts (line 707)

**Implementation:**
- Tolerant to read vs isRead (lines 715-716)
- Tolerant to message vs body (line 714)
- All other fields optional or tolerant
- SSE events: message, heartbeat

**Status:** ✅ Resolved with tolerant type

## 12. Payment Callback Path

**Ambiguity:** ENDPOINT.md documents GET /payments/verify/:reference but doesn't specify if access token is required for the callback page.

**Adapter:** verifyPayment in lib/api.ts (line 1054)

**Implementation:**
- Access token sent via Authorization header (from cookies)
- Handles both pay-by-enrollmentId and group case
- Callback page must include access token in request

**Status:** ✅ Resolved with token handling

## Summary

All known ambiguities are documented and resolved via:
1. Constants for prefixes and type mappings (TUTOR_ROUTE_PREFIX, SCORED_ITEM_TYPES)
2. Explicit type definitions (SessionFrequency, CreateChangeRequestRequest)
3. Tolerant types for vague responses (Notification, Session, Grade)
4. Adapter functions for field mapping (TEST → EXAM)
5. Client-side validation where backend doesn't enforce (grade weights)

**Total ambiguities documented:** 12
**Total adapters implemented:** 12
**Status:** ✅ All resolved

## Tutor registration submits application data in one request

Per product spec, `/register/tutor` is a multi-step wizard that submits account + application fields together in a single `POST /auth/register` call: `birthDay`, `birthMonth` (numbers, split from a date picker), `country`, `city`, `highestQualification`, `subjects[]` (uuids), `levels[]`, `yearsOfExperience`, `whyTeach`, `howHeard`, `aboutYou[]` (1-3 strings, max 60 chars each).

ENDPOINT.md does not yet document these fields on `POST /auth/register` � backend must accept and persist them (creating the tutor application in SUBMITTED state). After `POST /auth/verify`, tutors see a pending-approval screen and cannot sign in until approved.

Profile picture and documents are NOT part of registration; if still required for vetting, a post-approval upload path is needed.

Related field mismatches observed (frontend tolerates both):
- GET /tutor-application returns `birthDay`/`birthMonth` but frontend type uses `birthday`; frontend now derives `birthday` from birthDay/birthMonth when absent.
- PATCH /tutor-application documents `aboutYou` as `string[]` (max 3 x 60 chars) but the UI collects a single text (up to 180 words); frontend sends a string.

## Assignment submission status endpoint undocumented

The frontend needs to know whether a student has submitted an assignment. ENDPOINT.md documents `POST /assignments/:id/submit` but no endpoint to READ a submission (no `GET /assignments/:id/submission`, and `GET /assignments/:id` schema is unspecified - it may or may not nest `submission`).

Observed: `GET /assignments/:id/submission` returns an error (likely 404) on the deployed backend. Frontend now tolerates both shapes: tries `/assignments/:id/submission`, falls back to extracting `submission`/`submissions[0]` from `GET /assignments/:id`, and treats a submission record OR `status === SUBMITTED/GRADED` as submitted.

Backend should clarify:
1. Is there a documented GET endpoint for an assignment submission (for student/parent/tutor)?
2. Does submitting update `assignment.status` to SUBMITTED, or does status only reflect grading?
3. For multi-student assignment creation, does `POST /assignments` accept `enrollmentIds[]`, or must the frontend create one assignment per enrollment (current approach)?

## Assignment submissions API (RESOLVED by backend)

Backend added the missing endpoints:
- GET /assignments/:id/submissions - array of submissions (student, textAnswer, attachments, feedback)
- GET /assignments/:id/submissions/:submissionId - full detail incl. gradedAt
- GET /assignments/:id/schema - assignment + enrollment (subject, student)
- POST /assignments accepts enrollmentId OR enrollmentIds[] (transactional, returns array)
- assignment.status now flips to SUBMITTED on student submit; duplicate submit returns 400

Frontend updated: api.getAssignmentSubmissions / getAssignmentSubmissionDetail / getAssignmentSchema, createAssignment supports enrollmentIds[], tutor+parent pages render all submissions, student page handles the already-submitted 400.
