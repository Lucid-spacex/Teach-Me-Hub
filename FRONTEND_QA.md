# Frontend QA Checklist

This document provides a comprehensive manual QA checklist for the Teach-Me-Hub frontend application.

## Setup Requirements

- Backend API running at `http://localhost:3001/api`
- Frontend `.env.local` configured with `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Test accounts for each role (Admin, Tutor, Parent, Student)

## Part 1: Parent & Student Grades

### Parent Grades Page (`/parent/grades`)
- [ ] Only APPROVED grades are displayed
- [ ] DRAFT, PENDING_APPROVAL, and REJECTED grades are hidden
- [ ] Grade breakdown shows components, weights, and percentages
- [ ] `overrideReason` field is never displayed to parents
- [ ] Tutor comments are shown when available
- [ ] Student filter works correctly
- [ ] Empty state displays helpful message

### Student Grades Page (`/student/grades`)
- [ ] Only APPROVED grades are displayed
- [ ] DRAFT, PENDING_APPROVAL, and REJECTED grades are hidden
- [ ] Grade breakdown shows components, weights, and percentages
- [ ] `overrideReason` field is never displayed to students
- [ ] Tutor comments are shown when available
- [ ] Empty state displays helpful message

## Part 2: Parent Enrollment Change Requests

### Enrollment Change Request Modal
- [ ] "Request Change" button opens modal
- [ ] Form pre-fills with current enrollment values
- [ ] All fields work (start date, end date, frequency, days, hours)
- [ ] Form is disabled when a request is PENDING
- [ ] "Change Pending Approval" banner appears when pending
- [ ] "Cancel Request" button works for pending requests
- [ ] Request history shows APPROVED and REJECTED requests
- [ ] Admin rejection reason is displayed for REJECTED requests
- [ ] Error messages display clearly for conflicts
- [ ] Only one pending request per enrollment is enforced

## Part 3: Parent Session Recordings

### Session Recordings
- [ ] Recording button appears for COMPLETED sessions
- [ ] Recording button does NOT appear for SCHEDULED sessions
- [ ] Clicking recording opens recording URL in new tab
- [ ] 403 error shows "Access Denied" toast
- [ ] 404 error shows "Recording Not Found" toast
- [ ] Loading state shows during recording fetch
- [ ] "Recording Not Available" toast when URL is null

## Part 4: Zoom to Google Meet Migration

### All Session Pages
- [ ] No references to "Zoom" in user-facing text
- [ ] All session links use `meetLink` field
- [ ] Link text says "Join" (not "Join Zoom")
- [ ] Link buttons show Video icon
- [ ] Pages checked:
  - [ ] `/parent/sessions`
  - [ ] `/parent/students/[id]`
  - [ ] `/student/schedule`
  - [ ] `/student/my-tutors`
  - [ ] `/tutor/students/[id]`
  - [ ] `/admin/sessions`

## Part 5: Tutor Status Screens

### Pending Tutor Status (`/tutor/pending`)
- [ ] Page displays for PENDING_VETTING tutors
- [ ] Status screen shows clear pending message
- [ ] Sidebar navigation is restricted (only Application link)
- [ ] Redirects to `/tutor` if status changes to APPROVED
- [ ] Redirects to `/tutor/rejected` if status changes to REJECTED

### Rejected Tutor Status (`/tutor/rejected`)
- [ ] Page displays for REJECTED tutors
- [ ] Status screen shows clear rejection message
- [ ] Sidebar navigation is restricted (only Application link)
- [ ] Redirects to `/tutor/pending` if status changes to PENDING_VETTING
- [ ] Redirects to `/tutor` if status changes to APPROVED

### Tutor Settings - Availability
- [ ] Availability status selector works (AVAILABLE, LIMITED, UNAVAILABLE)
- [ ] Max students field validates input
- [ ] Status note field accepts text
- [ ] UNAVAILABLE warning shows active student count
- [ ] UNAVAILABLE warning alerts admin if active students > 0
- [ ] PATCH request updates availability correctly

## Part 6: Sidebar Navigation & Badges

### Admin Sidebar
- [ ] All entries present and working
- [ ] Red badges display for categories with unread notifications
- [ ] Badges show count (or 99+ if > 99)
- [ ] Badge uses `byCategory` from NotificationProvider
- [ ] Categories checked: USERS, SESSIONS, MESSAGES, COMPLAINTS, ENROLLMENTS, PAYMENTS, GRADES, SCHEDULE

### Tutor Sidebar
- [ ] All entries present and working
- [ ] Red badges display for categories with unread notifications
- [ ] Badge uses `byCategory` from NotificationProvider
- [ ] Categories checked: USERS, SESSIONS, SCHEDULE, ASSIGNMENTS, GRADES, MESSAGES
- [ ] Pending/Rejected tutors see only Application link

### Parent Sidebar
- [ ] All entries present and working
- [ ] Red badges display for categories with unread notifications
- [ ] Badge uses `byCategory` from NotificationProvider
- [ ] Categories checked: ENROLLMENTS, SESSIONS, ASSIGNMENTS, GRADES, MESSAGES, COMPLAINTS, PAYMENTS

### Student Sidebar
- [ ] All entries present and working
- [ ] Red badges display for categories with unread notifications
- [ ] Badge uses `byCategory` from NotificationProvider
- [ ] Categories checked: SCHEDULE, ASSIGNMENTS, GRADES
- [ ] Notifications link present in sidebar

## Part 7: Student Notifications

### Student Notification Page (`/student/notifications`)
- [ ] Page loads and displays notifications
- [ ] Bell icon in mobile header links to notifications
- [ ] Unread count displays correctly
- [ ] Category filters work (Schedule, Assignments, Grades)
- [ ] Mark as read action works
- [ ] Mark all read action works
- [ ] Pagination works
- [ ] Empty state displays helpful message

## Part 8: Student Messaging Restrictions

### Student Messages Page (`/student/messages`)
- [ ] Page displays information about messaging policy
- [ ] Explains parents should contact tutors
- [ ] Explains parents can message Admin
- [ ] No message sending capability
- [ ] Links to My Tutors page

### Student My Tutors Page (`/student/my-tutors`)
- [ ] No "Message Tutor" button
- [ ] Only "View Sessions" button
- [ ] Session modal shows meet links (not messaging)

## Part 9: Quiz Taking

### Quiz Taking Modal
- [ ] 30-second timer per question
- [ ] Timer counts down correctly
- [ ] Timer turns red when ≤ 10 seconds
- [ ] Auto-submits if time runs out (with selected answer)
- [ ] Option selection works
- [ ] Submit answer button works
- [ ] Feedback shows correct/incorrect
- [ ] Never shows correct answers to students
- [ ] Completion message: "Quiz submitted. Your tutor will review it."
- [ ] Not presented as official grade
- [ ] Per-answer correctness shown if API returns it (but not as grade)

## Part 10: Student UI - No Prices

### Student Pages
- [ ] No price/cost/fee/payment information visible
- [ ] No links to pricing pages
- [ ] No payment-related UI elements
- [ ] Pages checked:
  - [ ] `/student`
  - [ ] `/student/schedule`
  - [ ] `/student/my-tutors`
  - [ ] `/student/assignments`
  - [ ] `/student/grades`
  - [ ] `/student/profile`
  - [ ] `/student/settings`

## Part 11: Parent Messaging

### Parent Messages Page (`/parent/messages`)
- [ ] Only Admin messaging capability
- [ ] "Message Admin" button creates new thread
- [ ] No option to message tutors directly
- [ ] Existing threads only show Admin
- [ ] Message sending works for Admin threads
- [ ] Thread list shows conversations

## Part 12: Parent Pricing & Complaints

### Parent Pricing Page (`/parent/pricing`)
- [ ] Page loads and displays subject prices
- [ ] Grade band pricing displayed correctly
- [ ] Responsive layout works

### Parent Complaints Page (`/parent/complaints`)
- [ ] Page loads and displays complaints
- [ ] Create complaint modal works
- [ ] Complaint list shows status
- [ ] Resolution details shown for resolved complaints

## Part 13: Loading, Empty, Error States

### All New Pages
- [ ] Loading spinner displays during data fetch
- [ ] Empty state displays when no data
- [ ] Error state displays with helpful message
- [ ] Retry button works in error state
- [ ] Skeleton loaders used where appropriate

## Part 14: Accessibility

### ARIA Labels
- [ ] Bell icon has `aria-label="View notifications"`
- [ ] Sign out button has `aria-label="Sign out"`
- [ ] Mobile menu button has `aria-label="Open navigation menu"`
- [ ] Close menu button has `aria-label="Close navigation menu"`
- [ ] Icons used decoratively have `aria-hidden="true"`

### Keyboard Navigation
- [ ] All buttons are keyboard accessible
- [ ] All inputs are keyboard accessible
- [ ] Tab order is logical
- [ ] Modals can be closed with Escape key
- [ ] Focus is managed in modals

## Part 15: Notification System

### Bell Icon & Dropdown
- [ ] Bell icon shows in header for all roles
- [ ] Red badge shows unread count (99+ cap)
- [ ] Dropdown shows latest notifications
- [ ] "View all" link goes to notifications page
- [ ] Sound toggle works in dropdown
- [ ] Sound preference stored in localStorage

### Notification Pages
- [ ] Admin notifications page works with filters
- [ ] Tutor notifications page works with filters
- [ ] Parent notifications page works with filters
- [ ] Student notifications page works with filters
- [ ] Category filters work per role
- [ ] Mark as read action works
- [ ] Mark all read action works
- [ ] Pagination works

### SSE & Sound
- [ ] SSE connection established on login
- [ ] SSE reconnection with backoff works
- [ ] Sound plays on live notification (if enabled)
- [ ] Sound throttled to max 1 per 3 seconds
- [ ] Toast displays for each live notification
- [ ] Toast click navigates to correct page
- [ ] Browser tab title shows unread count

## Part 16: Admin Features

### Grade Review Queue (`/admin/grades`)
- [ ] Page loads with pending grades
- [ ] Filters work (tutor, student, subject)
- [ ] Grade detail page shows full breakdown
- [ ] Component breakdown shown (weight, item count, percentage)
- [ ] Frozen snapshot items shown
- [ ] Computed vs final score shown
- [ ] Override reason shown
- [ ] Tutor comment shown
- [ ] Attachments shown
- [ ] Approve button works with confirmation
- [ ] Reject dialog requires reason (minimum length validation)
- [ ] Bulk-approve works with per-item results
- [ ] `studentCode` never shown in admin screens

### Class Schedule (`/admin/class-schedule`)
- [ ] Page shows all students with next class
- [ ] Tutor and status chips display correctly
- [ ] Filters work (tutor, status, date range)
- [ ] Pagination works
- [ ] Red badge shows for unscheduled within 24h

### Change Requests (`/admin/change-requests`)
- [ ] Page loads with change requests
- [ ] Status filter works
- [ ] Change request detail shows before/after comparison
- [ ] Approve with confirmation works
- [ ] Reject requires reason
- [ ] Admin inbox is shared across admins

## Part 17: Tutor Features

### Upcoming Classes (`/tutor/upcoming-classes`)
- [ ] Shows only tutor's own students
- [ ] Rows marked SCHEDULED or NEEDS_SESSION
- [ ] Shows day, time, and timezone
- [ ] "Create session" button works (prefilled)
- [ ] Reminder highlight for classes within 24 hours
- [ ] Session create works
- [ ] Session reschedule works
- [ ] Session delete works (only tutor-created, SCHEDULED)
- [ ] Backend error messages shown for unauthorized actions
- [ ] "Needs reschedule" badge shows when applicable
- [ ] Google Meet link shown (not Zoom)

### Scored Items (`/tutor/students/[id]`)
- [ ] Scored items tab exists
- [ ] Quiz attempts shown with auto and tutor-adjusted scores
- [ ] Assignment submissions shown
- [ ] Tests and participation items shown
- [ ] Filters work (type, "not yet in a grade")
- [ ] Score assignment submission action works
- [ ] TEST item action works
- [ ] PARTICIPATION item action works
- [ ] Adjust score with comment works
- [ ] Delete manual item works
- [ ] Items read-only for PENDING_APPROVAL or APPROVED grades

### Grade Compile Wizard
- [ ] Student, enrollment, period selection works
- [ ] Item selection interface works
- [ ] Weight setting per component works
- [ ] Live weight total validation (must equal 100)
- [ ] Save/submit button disabled when weight total != 100
- [ ] Server-computed attendance rate shown
- [ ] Preview endpoint called for computed score
- [ ] Final score override with required reason works
- [ ] Tutor comment field works
- [ ] Attachments field works
- [ ] Save draft action works
- [ ] Submit to admin action works
- [ ] Withdraw action works (when PENDING_APPROVAL)
- [ ] Edit action works (only DRAFT or REJECTED)
- [ ] Delete action works (only DRAFT or REJECTED)
- [ ] Status chips display correctly
- [ ] Admin reason banner for REJECTED grades
- [ ] APPROVED grades read-only

### Tutor Messages
- [ ] Tutor to Admin messaging only
- [ ] No tutor to student messaging
- [ ] No tutor to parent messaging
- [ ] Note about contacting admin through Messages

## Part 18: Cleanup & Documentation

### Documentation Updates
- [ ] FRONTEND_DOCUMENTATION.md updated with notification system
- [ ] FRONTEND_DOCUMENTATION.md updated with grading workflow
- [ ] FRONTEND_DOCUMENTATION.md updated with class schedule pages
- [ ] FRONTEND_DOCUMENTATION.md updated with change requests
- [ ] FRONTEND_DOCUMENTATION.md updated with Google Meet
- [ ] FRONTEND_DOCUMENTATION.md updated with new messaging rules
- [ ] README updated with new features

### Removed UI
- [ ] Zoom wording removed from all pages
- [ ] Student or tutor messaging removed
- [ ] Parent to tutor messaging removed
- [ ] Tutor complaints page removed
- [ ] "File complaint" button removed for tutors
- [ ] Admin pricing-tier screens removed (only subject price management)

## Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

## Performance

- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] No console errors
- [ ] No memory leaks

## Security

- [ ] No sensitive data in console logs
- [ ] No tokens in URLs
- [ ] Proper authentication checks
- [ ] Authorization enforced per role
