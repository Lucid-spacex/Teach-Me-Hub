# Backend API Documentation

This document outlines the backend API requirements and implementation details for the Teach-Me-Hub platform.

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Student Management](#student-management)
3. [Tutor Management](#tutor-management)
4. [Parent Management](#parent-management)
5. [Subject & Pricing](#subject--pricing)
6. [Enrollment & Sessions](#enrollment--sessions)
7. [Messaging System](#messaging-system)
8. [Payments](#payments)
9. [Email Service](#email-service)
10. [Admin Operations](#admin-operations)

---

## Authentication & Authorization

### Token Configuration
- **Access Token Expiry**: 1 day (86400 seconds)
- **Refresh Token Expiry**: 7 days (604800 seconds)
- **Token Storage**: HTTP-only cookies with SameSite=Strict

### Registration Endpoints

#### Parent Registration
**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "PARENT"
}
```

**Notes**:
- Password must be at least 8 characters with at least one uppercase letter
- Email verification via OTP required
- Profile picture is optional (can be uploaded later in settings)

#### Tutor Registration
**Endpoint**: `POST /auth/register`

**Request Body** (Stage 1 - Basic Account):
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "TUTOR"
}
```

**Multi-Stage Registration Flow**:
1. **Stage 1**: Basic account creation (above)
2. **Stage 2**: Profile completion (after approval) - See Tutor Profile section

**Notes**:
- Tutors cannot login until approved by admin
- Initial status should be `PENDING_VETTING`
- Full profile details stored separately (see Tutor Profile section)

#### Login
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "PARENT|TUTOR|ADMIN|STUDENT",
    "status": "UNVERIFIED|ACTIVE|PENDING_VETTING|APPROVED|REJECTED|SUSPENDED",
    "profilePictureUrl": "string|null"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

#### Student Login
**Endpoint**: `POST /auth/student-login`

**Request Body**:
```json
{
  "parentEmail": "string",
  "studentCode": "string",
  "studentPin": "string"
}
```

**Notes**:
- Student code and PIN should be emailed to parent when student is created
- Student should not have direct login access to parent account

---

## Student Management

### Student Detail View

**Endpoint**: `GET /admin/students/{studentId}/detail`

**Response**:
```json
{
  "id": "string",
  "parentId": "string",
  "fullName": "string",
  "dateOfBirth": "string",
  "actualGrade": "PRESCHOOL|KINDERGARTEN|GRADE_1|...|GRADE_12",
  "gender": "MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY",
  "school": "string|null",
  "notes": "string|null",
  "email": "string|null",
  "preferredStartDate": "string|null",
  "studentCode": "string",
  "timezone": "string|null",
  "profilePictureUrl": "string|null",
  "createdAt": "string",

  // Parent Information
  "parent": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "profilePictureUrl": "string|null"
  },

  // Assigned Tutors with Details
  "tutors": [
    {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "profilePictureUrl": "string|null",
      "bio": "string",
      "subjects": ["string"],
      "availabilityStatus": "AVAILABLE|LIMITED|UNAVAILABLE",
      "hourlyRate": number
    }
  ],

  // Sessions
  "sessions": [
    {
      "id": "string",
      "enrollmentId": "string",
      "scheduledAt": "string",
      "durationMinutes": number,
      "zoomLink": "string|null",
      "status": "SCHEDULED|COMPLETED|MISSED|CANCELLED",
      "recordingStatus": "NOT_AVAILABLE|PROCESSING|AVAILABLE",
      "recordingLink": "string|null",
      "tutorNotes": "string|null",
      "homeworkAssigned": "string|null",
      "createdAt": "string"
    }
  ],

  // Grades
  "grades": [
    {
      "id": "string",
      "enrollmentId": "string",
      "assignmentId": "string",
      "score": number,
      "maxScore": number,
      "feedback": "string|null",
      "status": "PENDING_APPROVAL|APPROVED|REJECTED",
      "gradedAt": "string"
    }
  ],

  // Attendance
  "attendance": [
    {
      "sessionId": "string",
      "sessionDate": "string",
      "attended": boolean,
      "status": "string"
    }
  ],

  // Progress Reports
  "progressReports": [
    {
      "id": "string",
      "enrollmentId": "string",
      "period": "string",
      "summary": "string",
      "strengths": "string",
      "areasToImprove": "string",
      "createdBy": "string",
      "createdAt": "string"
    }
  ],

  // Performance Overview
  "performance": {
    "averageGrade": {
      "percentage": number|null,
      "gradedCount": number,
      "trend": number|null
    },
    "gradesBySubject": [
      {
        "subjectName": "string",
        "averagePercentage": number,
        "gradedCount": number
      }
    ],
    "gradeTimeline": [
      {
        "period": "string",
        "averagePercentage": number,
        "gradedCount": number
      }
    ],
    "attendance": {
      "rate": number,
      "attended": number,
      "missed": number,
      "trend": number|null,
      "timeline": [...]
    },
    "assignments": {
      "total": number,
      "completed": number,
      "pending": number,
      "overdue": number,
      "submittedLate": number,
      "completionRate": number
    },
    "quizzes": {
      "attempts": number,
      "averagePercentage": number
    },
    "recentGrades": [...],
    "period": "week|month|quarter|year|all",
    "studentId": "string"
  }
}
```

### Create Student
**Endpoint**: `POST /students`

**Request Body**:
```json
{
  "fullName": "string",
  "dateOfBirth": "string",
  "actualGrade": "PRESCHOOL|KINDERGARTEN|GRADE_1|...|GRADE_12",
  "gradeLevel": "string",
  "gender": "MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY",
  "school": "string (optional)",
  "notes": "string (optional)",
  "email": "string (optional)",
  "preferredStartDate": "string (optional)"
}
```

**Response**:
- Student credentials (studentCode and studentPin) should be emailed to parent
- **DO NOT** return student PIN in API response

### Regenerate Student PIN
**Endpoint**: `POST /students/{studentId}/regenerate-pin` (Parent)
**Endpoint**: `PATCH /admin/students/{studentId}/regenerate-pin` (Admin)

**Response**:
```json
{
  "message": "string",
  "studentCode": "string"
}
```

**Notes**:
- New PIN should be emailed to parent
- **DO NOT** return PIN in API response

---

## Tutor Management

### Tutor Profile Extended Fields

**Endpoint**: `GET /admin/tutors/{tutorId}`

**Response** (TutorWithProfile):
```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "TUTOR",
  "status": "ACTIVE|PENDING_VETTING|APPROVED|REJECTED|SUSPENDED",
  "createdAt": "string",
  "updatedAt": "string",
  "profilePictureUrl": "string|null",

  // Registration fields
  "firstName": "string",
  "lastName": "string",
  "middleName": "string|null",
  "address": "string|null",
  "birthday": "string|null",
  "country": "string|null",
  "city": "string|null",
  "highestQualification": "string|null",
  "testPreparation": ["string"],
  "levels": ["string"],
  "yearsOfExperience": number|null,
  "whyTeach": "string|null",
  "howHeard": "string|null",
  "interests": "string|null",
  "documents": ["string"], // URLs to uploaded documents

  "tutorProfile": {
    "id": "string",
    "userId": "string",
    "subjects": ["string"],
    "bio": "string",
    "credentialsUrl": "string|null",
    "vettingStatus": "PENDING|APPROVED|REJECTED",
    "hourlyRate": number,
    "availability": {},
    "availabilityStatus": "AVAILABLE|LIMITED|UNAVAILABLE",
    "maxStudents": number|null,
    "statusNote": "string|null",
    "statusUpdatedAt": "string|null",
    "createdAt": "string"
  }
}
```

### Tutor Approval Workflow

#### Get Pending Tutors
**Endpoint**: `GET /admin/tutors?status=PENDING`

**Response**:
```json
{
  "data": [TutorWithProfile[]],
  "page": number,
  "limit": number,
  "total": number
}
```

#### Approve/Reject Tutor
**Endpoint**: `PATCH /admin/tutors/{tutorId}/vetting`

**Request Body**:
```json
{
  "vettingStatus": "APPROVED|REJECTED"
}
```

**Response**: Updated TutorProfile

**Notes**:
- When approved, tutor status should change to `ACTIVE`
- When rejected, tutor status should change to `REJECTED`
- Send email notification to tutor about approval/rejection
- Approved tutors can now login

### Tutor Availability Status

**Endpoint**: `PATCH /tutor-profile/availability-status`

**Request Body**:
```json
{
  "availabilityStatus": "AVAILABLE|LIMITED|UNAVAILABLE",
  "maxStudents": number (optional),
  "statusNote": "string (optional)"
}
```

**Response**: Updated TutorProfile

---

## Parent Management

### Parent Directory
**Endpoint**: `GET /admin/parents`

**Query Parameters**:
- `search`: string (optional)
- `status`: UserStatus (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "status": "ACTIVE|UNVERIFIED|SUSPENDED",
      "childrenCount": number,
      "activeEnrollments": number,
      "pendingPayments": number,
      "totalPaidNGN": number,
      "totalPaidUSD": number,
      "complaintCount": number,
      "createdAt": "string"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

### Parent Detail View
**Endpoint**: `GET /admin/parents/{parentId}`

**Response**:
```json
{
  "parent": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "string",
    "timezone": "string|null",
    "profilePicture": "string|null",
    "createdAt": "string",
    "updatedAt": "string",
    "childrenCount": number,
    "activeEnrollments": number,
    "pendingPayments": number,
    "totalPaidNGN": number,
    "totalPaidUSD": number,
    "complaintCount": number
  },
  "children": [
    {
      "id": "string",
      "parentId": "string",
      "userId": "string",
      "fullName": "string",
      "dateOfBirth": "string",
      "actualGrade": "string",
      "gradeLevel": "string",
      "gradeBandTier": "string",
      "gender": "string",
      "school": "string|null",
      "notes": "string|null",
      // studentCode is HIDDEN from parent view for security
      "studentStatus": "string",
      "createdAt": "string",
      "enrollments": [...]
    }
  ],
  "enrollments": [...],
  "recentPayments": [...]
}
```

**IMPORTANT**: Student code should NOT be included in parent detail view for security reasons.

---

## Subject & Pricing

### Create Subject with Per-Grade Pricing
**Endpoint**: `POST /admin/subjects`

**Request Body**:
```json
{
  "name": "string",
  "category": "CORE|ENRICHMENT|TEST_PREP",
  "prices": [
    {
      "gradeBandTier": "PRESCHOOL_TO_G1|G2_TO_G4|G5_TO_G8|G9_TO_G12",
      "priceNGN": number,
      "priceUSD": number
    }
  ]
}
```

**Notes**:
- Category must be uppercase enum value
- Price fields are `priceNGN` and `priceUSD` (NOT `yearlyPriceNGN` or `yearlyPriceUSD`)
- Do NOT include `updatedBy` field in Prisma create operations
- All 4 grade bands must have prices

### Update Subject Price
**Endpoint**: `PUT /admin/subjects/{subjectId}/prices/{gradeBandTier}`

**Request Body**:
```json
{
  "priceNGN": number,
  "priceUSD": number
}
```

---

## Enrollment & Sessions

### Create Enrollment
**Endpoint**: `POST /enrollments`

**Request Body**:
```json
{
  "studentId": "string",
  "subjectIds": ["string"],
  "sessionFrequency": "TWICE_WEEKLY|THRICE_WEEKLY|FIVE_TIMES_WEEKLY",
  "availableDays": ["Monday", "Tuesday", ...],
  "preferredStartHour": number,
  "preferredEndHour": number,
  "billingFrequency": "WEEKLY|MONTHLY|YEARLY",
  "startDate": "string"
}
```

**Response**:
```json
{
  "enrollments": [Enrollment[]],
  "enrollmentGroupId": "string"
}
```

---

## Messaging System

### Message Threads
**Endpoint**: `GET /messages/threads`

**Response**:
```json
[
  {
    "threadId": "string",
    "otherParticipant": {
      "id": "string",
      "fullName": "string",
      "role": "PARENT|TUTOR|ADMIN",
      "profilePictureUrl": "string|null"
    },
    "lastMessage": {
      "id": "string",
      "body": "string",
      "createdAt": "string",
      "senderId": "string",
      "readAt": "string|null"
    },
    "unreadCount": number
  }
]
```

**IMPORTANT**:
- When a PARENT messages the ADMIN, any user with ADMIN role should be able to see and reply
- When a TUTOR messages the ADMIN, any user with ADMIN role should be able to see and reply
- Admin messages should be shared across all admin users (not tied to a specific admin ID)

### Send Message
**Endpoint**: `POST /messages`

**Request Body**:
```json
{
  "recipientId": "string",
  "body": "string"
}
```

**Response**:
```json
{
  "id": "string",
  "threadId": "string",
  "senderId": "string",
  "content": "string",
  "body": "string",
  "createdAt": "string",
  "read": boolean
}
```

### Get Admin Contact
**Endpoint**: `GET /messages/admin-contact`

**Response**:
```json
{
  "recipientId": "string"
}
```

**Notes**:
- Should return a generic admin recipient ID that routes to all admin users
- Or return a list of admin users and let frontend pick one

---

## Payments

### Payment Summary
**Endpoint**: `GET /admin/payments/summary`

**Query Parameters**:
- `from`: date string (optional)
- `to`: date string (optional)

**Response**:
```json
{
  "totalRevenueNGN": number,
  "totalRevenueUSD": number,
  "totalCount": number,
  "statusCounts": {
    "PENDING": number,
    "SUCCESS": number,
    "FAILED": number,
    "REFUNDED": number,
    "EXPIRED": number
  },
  "successRate": number,
  "dailyRevenue": [
    {
      "date": "string",
      "revenueNGN": number,
      "revenueUSD": number,
      "count": number
    }
  ]
}
```

**IMPORTANT**: Do not require an ID parameter. This endpoint should return overall summary.

---

## Email Service

### Email Configuration Issues

**Current Error**:
```
Resend API error: 405 - Method POST is not allowed for the requested path.
```

**Fix Required**:
- Check Resend API endpoint configuration
- Ensure correct HTTP method and path
- Verify API key and permissions

### Student Credentials Email
**Endpoint**: Triggered when student is created

**Email Content**:
- Student code
- Student PIN
- Login instructions
- Security reminder

**Notes**:
- Email should be sent to parent's email
- PIN should NEVER be returned in API response
- Only sent via email for security

---

## Admin Operations

### Admin Overview
**Endpoint**: `GET /admin/reports/overview`

**Response**:
```json
{
  "totalUsers": number,
  "totalStudents": number,
  "totalTutors": number,
  "totalParents": number,
  "activeEnrollments": number,
  "pendingTutors": number,
  "totalRevenue": number,
  "failedPayments": number
}
```

---

## Database Schema Changes Required

### Users Table
Add fields for tutor registration:
- `firstName` (string, nullable)
- `lastName` (string, nullable)
- `middleName` (string, nullable)
- `address` (string, nullable)
- `birthday` (date, nullable)
- `country` (string, nullable)
- `city` (string, nullable)
- `highestQualification` (string, nullable)
- `testPreparation` (string array, nullable)
- `levels` (string array, nullable)
- `yearsOfExperience` (integer, nullable)
- `whyTeach` (text, nullable)
- `howHeard` (string, nullable)
- `interests` (text, nullable)
- `documents` (string array, nullable) - URLs to uploaded documents

### TutorProfile Table
Add fields:
- `availabilityStatus` (enum: AVAILABLE, LIMITED, UNAVAILABLE)
- `maxStudents` (integer, nullable)
- `statusNote` (text, nullable)
- `statusUpdatedAt` (timestamp, nullable)

### SubjectPrice Table
**Important**: Do NOT include `updatedBy` field. Use Prisma's built-in `updatedAt` and relation to `updater` user.

### Messaging
Ensure admin messages are shared across all admin users:
- Either use a special "admin" recipient ID
- Or query all messages where recipient role is ADMIN
- Return messages from any admin to any admin user

---

## Frontend Changes Summary

### Completed
1. ✅ Fixed subject creation validation (category enum case, price field names)
2. ✅ Fixed Prisma error (removed updatedBy field)
3. ✅ Increased access token expiry to 1 day
4. ✅ Created separate multi-step tutor registration page
5. ✅ Updated parent registration (removed mandatory profile picture, added first/last/middle name fields)
6. ✅ Implemented tutor approval workflow UI
7. ✅ Hidden student code from parent detail view
8. ✅ Updated types for comprehensive student detail view
9. ✅ Updated types for extended tutor profile
10. ✅ Added API methods for student detail and tutor detail

### Backend Implementation Required
1. ✅ Implement student detail endpoint with all related data
2. ✅ Implement tutor detail endpoint with extended profile fields
3. ✅ Fix email service (Resend API 405 error)
4. ✅ Fix admin messaging to show messages from parents/tutors
5. ✅ Ensure tutor registration stores extended profile fields
6. ✅ Implement tutor approval status change
7. ✅ Fix payment summary endpoint (remove ID requirement)
8. ✅ Ensure student code is hidden from parent detail view
9. ✅ Update subject price creation to use correct field names
10. ✅ Remove updatedBy from Prisma operations

---

## Testing Checklist

### Authentication
- [ ] Parent registration works with first/last/middle name
- [ ] Tutor registration works with multi-step form
- [ ] Tutor cannot login until approved
- [ ] Access token expires after 1 day
- [ ] Refresh token works correctly

### Student Management
- [ ] Student detail view returns parent, tutor, sessions, grades, attendance, reports, performance
- [ ] Student code is hidden from parent view
- [ ] Student PIN is emailed to parent (not returned in API)
- [ ] PIN regeneration works and emails new PIN

### Tutor Management
- [ ] Extended profile fields are stored correctly
- [ ] Pending tutors are listed correctly
- [ ] Tutor approval changes status to ACTIVE
- [ ] Tutor rejection changes status to REJECTED
- [ ] Email notification sent on approval/rejection
- [ ] Availability status can be updated

### Subject & Pricing
- [ ] Subject creation uses uppercase category enum
- [ ] Subject creation uses priceNGN/priceUSD (not yearlyPrice*)
- [ ] All 4 grade bands are required
- [ ] Price updates work correctly

### Messaging
- [ ] Admin sees messages from parents
- [ ] Admin sees messages from tutors
- [ ] Admin can reply to messages
- [ ] Messages are shared across all admin users

### Payments
- [ ] Payment summary works without ID parameter
- [ ] Summary returns correct totals and breakdowns

### Email
- [ ] Student credentials email is sent correctly
- [ ] Resend API 405 error is fixed
