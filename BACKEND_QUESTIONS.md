# Backend Questions & Issues

Prompts to send to the backend team/agent for all known issues and undocumented behavior discovered during frontend integration. Ordered by severity.

---

## 1. Payment verification stuck at PENDING (critical)

```
Payment verification is stuck at PENDING after Paystack checkout.

A parent completed payment on Paystack hosted checkout
(https://checkout.paystack.com/...) and was redirected back to the
frontend. GET /payments/verify/:reference keeps returning PENDING
indefinitely — the payment never reaches SUCCESS and enrollments are
never activated.

Please check:

1. Does GET /payments/verify/:reference call Paystack's
   transaction/verify API server-side on demand, or does it only read
   the local DB status? If DB-only, the payment can only update via
   the webhook — making webhook delivery the suspect.

2. Is the Paystack webhook configured and reachable? Endpoint is
   POST /payments/webhook and/or POST /webhooks/paystack with
   x-paystack-signature HMAC-SHA512 verification. Confirm in the
   Paystack dashboard that the webhook URL points to the deployed
   backend, the endpoint is publicly reachable (not blocked by auth
   or rate limiting), and the signature secret matches
   PAYSTACK_SECRET_KEY. Check server logs for incoming charge.success
   events — are they arriving at all?

3. What does GET /payments/verify/:reference actually return for a
   real reference? Share the raw JSON — the status field value, its
   casing (SUCCESS vs success), and whether it's nested (e.g.
   { data: { status } } or { payment: { status } }). This response
   shape is not documented in ENDPOINT.md.

4. Does POST /payments/initiate set callback_url correctly on the
   Paystack transaction, and does it return the Paystack reference
   (not an internal DB id)? The frontend redirects to
   /payment/callback?reference=<returned reference> and calls verify
   with that value.

5. Check the payment record in the DB for that reference — what is
   stored in status, providerReference, and was a webhook event ever
   received/processed for it?

If the webhook isn't firing, the fix is likely making verify call
Paystack's verify API on demand rather than relying solely on webhook
updates.
```

**Frontend workaround in place:** callback page polls max ~30s, tolerates
nested/alternate response shapes, normalizes Paystack-style statuses, then
shows a "Payment Processing" screen linking to /parent/payments.

---

## 2. Missing `GET /admin/badge-counts` endpoint

```
GET /admin/badge-counts is called by the frontend but is NOT
documented in ENDPOINT.md and appears to not exist on the backend.

The frontend needs a single endpoint returning admin badge counts for
the sidebar. Required fields (all numbers):

- unreadNewParents
- unreadNewTutors
- pendingTutorApplications
- openComplaints
- unreadMessages
- unmatchedPaidEnrollments
- failedPayments
- pendingGrades
- pendingChangeRequests
- unscheduledWithin24h

Questions:
1. Does this endpoint exist under a different path? If so, what is it?
2. If it doesn't exist, please implement it (ADMIN auth) or tell me
   which existing endpoints I should aggregate client-side instead.
3. What is the exact response shape — flat object, { byCategory: {} },
   or nested?

Until this is resolved the admin sidebar falls back to generic
notification unread counts only, so admin-specific badges
(pending tutor applications, open complaints, unmatched enrollments,
failed payments, pending grades/change requests, unscheduled classes)
are not displayed.
```

---

## 3. Performance endpoints return `undefined` instead of `null`

```
The performance endpoints return undefined for missing metrics,
which crashed the frontend (TypeError on .toFixed of undefined).

Affected endpoints (all roles):
- GET /admin/students/:id/performance
- GET /tutor/students/:id/performance
- GET /students/:id/performance (student's own)

Example: for a student with no grades, the response contains
averageGrade.percentage as undefined rather than null or 0.

Please ensure every metric field is always present with a consistent
empty value — either null or 0 — never undefined/omitted. Specifically:

- averageGrade.percentage, averageGrade.trend
- attendance.rate, attendance.trend
- assignments.completionRate
- quizzes.averagePercentage
- gradesBySubject[].averagePercentage
- recentGrades[].percentage
- trend fields

Also confirm the exact response shape for each endpoint — which
fields are guaranteed vs optional — so it can be documented in
ENDPOINT.md.
```

**Frontend workaround in place:** all `.toFixed()` calls guarded with
`!= null` and render `N/A` for missing values.

---

## 4. Undocumented/incorrect response shapes

```
Several endpoints have response shapes that differ from or are missing
in ENDPOINT.md. Please confirm the actual shapes so they can be
documented:

1. POST /payments/initiate
   Documented response: { authorizationUrl, reference, amount,
   currency }
   Frontend also relies on: success (boolean), accessCode (string),
   message (string). Are these actually returned? Is accessCode the
   Paystack access_code needed for inline popup checkout?

2. GET /payments/verify/:reference
   Response documented only as "Payment verification status". What is
   the exact JSON? Does it return a Payment object, a
   { status, ... } wrapper, or Paystack's raw verify response?

3. POST /payments/initiate body
   Documented body only shows enrollmentId. The frontend also sends
   enrollmentGroupId for group payments (multiple subjects enrolled
   together, response of POST /enrollments returns
   { enrollmentGroupId, enrollments[] }). Is enrollmentGroupId a
   supported field?

4. GET /admin/tutors?status=PENDING_VETTING
   Please document the row shape — specifically applicationStatus
   (DRAFT | SUBMITTED | NONE), submittedAt, fullName, email — and
   confirm PATCH /admin/tutors/:id/vetting accepts
   { vettingStatus, rejectionReason }.

5. GET /messages/admin-contact
   What field holds the admin's user id in the response? The frontend
   needs a documented field name to validate before sending messages.

6. GET /notifications/unread-count
   byCategory is documented — please confirm all 11 categories
   (ASSIGNMENTS, GRADES, SESSIONS, MESSAGES, USERS, ENROLLMENT,
   PAYMENTS, PRICING, COMPLAINTS, QUIZZES, SCHEDULE) are always
   present even when 0, and share a sample response.

7. Notification item shape
   Document whether the field is read or isRead, and body or
   message — the frontend currently tolerates both.

8. GET /payments (parent list)
   Is the response a plain array or paginated
   { data, total, page, limit }? Frontend handles both but needs the
   documented shape. Same question for GET /admin/payments.
```

---

## 5. Field-level error format

```
Please document the error response format for validation failures.

The frontend displays field-level errors under matching inputs for
complaints (POST /complaints) and messaging (POST /messages), reading
a `details` array from error responses. Please confirm:

1. The exact shape of `details` — is it
   [{ field, message }] or [{ path, message }] or something else?
2. Is this format consistent across ALL endpoints, or does it vary?
3. Sample error response for a validation failure on POST /complaints
   with a missing/too-long subject field.
```

---

## Tracking

| # | Issue | Status | Backend response |
|---|-------|--------|------------------|
| 1 | Payment verify stuck at PENDING | ⬜ Sent | |
| 2 | `/admin/badge-counts` missing | ⬜ Sent | |
| 3 | Performance `undefined` metrics | ⬜ Sent | |
| 4 | Undocumented response shapes | ⬜ Sent | |
| 5 | Field-error `details` format | ⬜ Sent | |
