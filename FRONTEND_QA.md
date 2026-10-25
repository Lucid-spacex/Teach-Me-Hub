# Frontend QA Checklist

This document provides a manual QA checklist for verifying the frontend implementation against the specification.

## Part 1: Parent & Student Grades

### Parent Grades Page (`/parent/grades`)
- [ ] Only APPROVED grades are displayed
- [ ] Draft, PENDING_APPROVAL, and REJECTED grades are not shown
- [ ] Grade breakdown shows components with weights and percentages
- [ ] `overrideReason` field is never displayed to parents
- [ ] Tutor comments are shown
- [ ] Approved date is displayed
- [ ] Empty state shows appropriate message when no approved grades exist

### Student Grades Page (`/student/grades`)
- [ ] Only APPROVED grades are displayed
- [ ] Draft, PENDING_APPROVAL, and REJECTED grades are not shown
- [ ] Grade breakdown shows components with weights and percentages
- [ ] `overrideReason` field is never displayed to students
- [ ] Tutor comments are shown
- [ ] Approved date is displayed
- [ ] Empty state shows appropriate message when no approved grades exist

## Part 2: Parent Enrollment Change Requests

### Change Request Form
- [ ] Form is accessible from enrollment cards
- [ ] Form shows current schedule values
- [ ] User can modify: start date, end date, session frequency, available days, preferred hours
- [ ] "Change pending approval" banner appears when a request is PENDING
- [ ] Form is disabled while a request is pending
- [ ] Cancel request action is available for pending requests
- [ ] Request history shows APPROVED and REJECTED requests
- [ ] Admin rejection reason is displayed for REJECTED requests
- [ ] Server errors are shown clearly for request conflicts
- [ ] Only one pending request per enrollment is enforced

## Part 3: Parent Session Recordings

### Recording Access
- [ ] Recording button appears for COMPLETED sessions
- [ ] Recording button calls GET /sessions/:id/recording
- [ ] 403 errors show "Access Denied" toast
- [ ] 404 errors show "Recording Not Found" toast
- [ ] Loading state shows while fetching recording
- [ ] Recording opens in new tab if URL is available
- [ ] Appropriate error message if recording URL is missing

## Part 4: Google Meet Integration

### Session Links
- [ ] All session links use `meetLink` field (not zoomLink)
- [ ] No Zoom branding or terminology in UI
- [ ] Join buttons open Google Meet links in new tab
- [ ] Meet links appear in session lists and detail views
- [ ] Meet links appear in student schedule
- [ ] Meet links appear in tutor upcoming classes
- [ ] Documentation references Google Meet, not Zoom

## Part 5: Tutor Status Management

### Pending Tutors
- [ ] Pending tutors are redirected to `/tutor/pending`
- [ ] Status screen shows "Application Under Review"
- [ ] Navigation is restricted to Application, Notifications, and Public Subjects
- [ ] "Navigation Restricted" notice is displayed
- [ ] Approved tutors cannot access pending page
- [ ] Rejected tutors are redirected to rejected page

### Rejected Tutors
- [ ] Rejected tutors are redirected to `/tutor/rejected`
- [ ] Status screen shows "Application Not Approved"
- [ ] Navigation is restricted to Application, Notifications, and Public Subjects
- [ ] "Navigation Restricted" notice is displayed
- [ ] "Reapply" button links to application wizard
- [ ] Approved tutors cannot access rejected page

### Availability Status
- [ ] Settings page shows availability status selector (AVAILABLE, LIMITED, UNAVAILABLE)
- [ ] Max students field is displayed
- [ ] Status note field is optional
- [ ] UNAVAILABLE warning appears when status is UNAVAILABLE
- [ ] Warning shows active student count if > 0
- [ ] Warning indicates admin will be notified
- [ ] Submitting UNAVAILABLE with active students shows admin alert toast

## Part 6: Sidebar Navigation & Badges

### Sidebar Badges
- [ ] Red badges use `byCategory` from NotificationProvider
- [ ] Badges show 99+ cap for counts over 99
- [ ] Badges only appear when count > 0
- [ ] Admin sidebar badges: USERS, Sessions, Messages, Complaints, Enrollments, PAYMENTS, GRADES, SCHEDULE
- [ ] Tutor sidebar badges: Students, Sessions, Upcoming Classes, Assignments, Grades, Messages
- [ ] Parent sidebar badges: Enrollments, Sessions, Grades, Messages, Complaints, Pricing
- [ ] Student sidebar badges: Schedule, Assignments, Grades

### Student Notifications
- [ ] Student sidebar includes "Notifications" entry
- [ ] Student notification page exists at `/student/notifications`
- [ ] Bell icon appears in mobile header
- [ ] Notification page shows filters (category, unread only)
- [ ] Category filters include: SCHEDULE, ASSIGNMENTS, GRADES
- [ ] Pagination works correctly
- [ ] Mark as read action works
- [ ] Mark all read action works
- [ ] Empty states display correctly

## Part 7: Messaging Restrictions

### Student Messaging
- [ ] Student messages page shows information-only content
- [ ] "Messaging Not Available" message is displayed
- [ ] Communication guidelines explain parent coordination
- [ ] No message sending functionality for students
- [ ] Student my-tutors page has no "message tutor" buttons
- [ ] Student schedule has no messaging actions

### Parent Messaging
- [ ] Parent messages page only shows admin conversations
- [ ] "Message Admin" button starts new admin conversation
- [ ] No option to message tutors directly
- [ ] Existing tutor message threads are not shown
- [ ] Parent can only send messages to admin

### Tutor Messaging
- [ ] Tutor messages page only shows admin conversations
- [ ] No option to message students or parents
- [ ] Tutor can only send messages to admin
- [ ] Tutor complaints page redirects to messages

## Part 8: Quiz Restrictions

### Quiz Taking
- [ ] Quiz modal shows 30-second timer per question
- [ ] Timer auto-submits when time runs out
- [ ] Timer shows visual warning when under 10 seconds
- [ ] Correct answers are shown after submission (isCorrect flag)
- [ ] "Quiz submitted" message appears after completion
- [ ] Quiz is never presented as official grade
- [ ] Quiz results are stored as scored items, not grades
- [ ] Per-answer correctness is shown if API returns it

## Part 9: Pricing Visibility

### Student Access
- [ ] Students never see pricing information
- [ ] No price/cost/fee/payment references in student UI
- [ ] No currency symbols (NGN, USD) in student UI
- [ ] Student sidebar has no pricing entry
- [ ] Student notifications have no pricing category

### Parent Pricing
- [ ] Parent pricing page exists at `/parent/pricing`
- [ ] Shows all subjects with grade band pricing
- [ ] Shows NGN and USD prices
- [ ] PAYMENTS category notifications link to pricing page
- [ ] Toast notifications for PAYMENTS include "View" button to pricing page

## Part 10: Complaints

### Parent Complaints
- [ ] Parent complaints page exists at `/parent/complaints`
- [ ] COMPLAINTS category notifications link to complaints page
- [ ] Toast notifications for COMPLAINTS include "View" button to complaints page
- [ ] Complaint resolution notifications work correctly

### Tutor Complaints
- [ ] Tutor complaints page redirects to messages
- [ ] Message: "Use the Messages page to contact the admin team"
- [ ] "Go to Messages" button navigates to `/tutor/messages`

## Part 11: Accessibility

### ARIA Labels
- [ ] Bell icon has aria-label with unread count
- [ ] Notification badges have appropriate labels
- [ ] Sound toggle has aria-label
- [ ] All interactive elements have keyboard support
- [ ] Dialogs are keyboard-operable (Esc to close)
- [ ] Focus management works correctly in modals

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] All buttons are keyboard accessible
- [ ] Form inputs have proper labels
- [ ] Skip links if applicable

## Part 12: Loading & Error States

### Loading States
- [ ] SkeletonLoader or LoadingSpinner used for async operations
- [ ] Loading states prevent double submissions
- [ ] Loading indicators are visible during API calls

### Empty States
- [ ] Empty states have appropriate messages
- [ ] Empty states have helpful icons
- [ ] Empty states guide users to next actions

### Error States
- [ ] Error messages are user-friendly
- [ ] Error states provide recovery options
- [ ] Network errors are handled gracefully
- [ ] 401 errors trigger token refresh
- [ ] 403 errors show permission denied messages
- [ ] 404 errors show not found messages

## Part 13: Sound Notifications

### Sound Behavior
- [ ] Sound plays only on live SSE notifications (not on page load)
- [ ] Sound is throttled to max once per 3 seconds
- [ ] Sound toggle in notification dropdown works
- [ ] Sound toggle in Settings works
- [ ] Sound preference persists in localStorage
- [ ] Sound defaults to off
- [ ] Web Audio API fallback works if audio file fails

## Part 14: Notification Navigation

### Toast Actions
- [ ] PAYMENTS notifications have "View" button linking to pricing page
- [ ] COMPLAINTS notifications have "View" button linking to complaints page
- [ ] Toast buttons navigate correctly
- [ ] Toast duration is appropriate (5 seconds)

## Part 15: Documentation Updates

### FRONTEND_DOCUMENTATION.md
- [ ] Notification system is documented
- [ ] Grading workflow is documented
- [ ] Class schedule pages are documented
- [ ] Change requests are documented
- [ ] Google Meet integration is documented
- [ ] New messaging rules are documented
- [ ] Removed Zoom references
- [ ] Updated tutor messaging restrictions
- [ ] Updated parent messaging restrictions

### FRONTEND_PROGRESS.md
- [ ] All completed items are ticked
- [ ] No unticked priority items remain
- [ ] Status is up to date

## Part 16: Vitest Tests

### Weight Total Validation
- [ ] Test exists for weight total = 100 validation
- [ ] Test passes with valid weights
- [ ] Test fails with invalid weights

### Reject Reason Requirement
- [ ] Test exists for reject reason minimum length validation
- [ ] Test passes with valid reason
- [ ] Test fails with empty/short reason

### Badge Mapping
- [ ] Test exists for notification badge mapping by category
- [ ] Test verifies correct category to badge mapping
- [ ] Test verifies 99+ cap

### Sound-on-Live-Only
- [ ] Test exists for sound playing only on live notifications
- [ ] Test verifies sound doesn't play on page load
- [ ] Test verifies throttling (max once per 3 seconds)

## Part 17: Build & Type Checking

### TypeScript
- [ ] `npm run build` passes without errors
- [ ] No TypeScript errors
- [ ] All types are properly defined

### Linting
- [ ] `npm run lint` passes without errors
- [ ] No linting warnings

### Production Build
- [ ] Build completes successfully
- [ ] All routes are generated
- [ ] Static pages are pre-rendered correctly
