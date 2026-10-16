# Backend API Requirements & Fixes

## Critical Issues Requiring Immediate Fixes

### 1. Email Service - Resend API Error (BLOCKING)
**Error:** `Resend API error: 405 - Method POST is not allowed for the requested path`

**Issue:** The backend is calling the wrong Resend API endpoint. The error occurs when sending student credentials emails.

**Fix Required:**
```javascript
// WRONG (current implementation)
await resend.emails.send({
  from: '...',
  to: '...',
  subject: '...',
  html: '...'
})

// CORRECT
await resend.emails.create({
  from: '...',
  to: '...',
  subject: '...',
  html: '...'
})
```

**Location:** `src/utils/email.util.js` - `sendEmail` function

---

### 2. Prisma Schema Error - Subject Creation (BLOCKING)
**Error:** `Unknown argument 'updatedBy'. Did you mean 'updatedAt'?`

**Issue:** The `SubjectPrice` model doesn't have an `updatedBy` field but the code is trying to use it.

**Prisma Schema Fix Required:**
```prisma
model SubjectPrice {
  id            String   @id @default(uuid())
  subjectId     String
  subject       Subject  @relation(fields: [subjectId], references: [id])
  gradeBandTier GradeBandTier
  yearlyPriceNGN Int
  yearlyPriceUSD Int
  updatedAt     DateTime @updatedAt
  updatedBy     String?  // ADD THIS FIELD
  updater       User?    @relation("SubjectPriceUpdater", fields: [updatedBy], references: [id])
  
  @@index([subjectId, gradeBandTier])
}
```

**Backend Code Fix:**
```javascript
// In AdminSubjectsController.createSubject
// Ensure updatedBy is included in the create data
subjectPrices: {
  create: gradeBands.map(band => ({
    gradeBandTier: band.gradeBandTier,
    yearlyPriceNGN: band.yearlyPriceNGN,
    yearlyPriceUSD: band.yearlyPriceUSD,
    updatedBy: req.user.id,  // Admin creating the subject
    updater: {
      connect: { id: req.user.id }
    }
  }))
}
```

---

### 3. Payment Summary API Route Conflict (BLOCKING)
**Error:** `{"error":"Invalid id format"}` when calling `/api/admin/payments/summary`

**Issue:** Route order conflict. Backend is matching `/api/admin/payments/summary` to the `/:id` route pattern.

**Fix Required in Route Definition:**
```javascript
// WRONG ORDER (current)
app.get('/api/admin/payments/:id', getPaymentDetail)
app.get('/api/admin/payments/summary', getPaymentSummary)

// CORRECT ORDER (specific routes first)
app.get('/api/admin/payments/summary', getPaymentSummary)  // Must be first
app.get('/api/admin/payments/:id', getPaymentDetail)
```

**Location:** Route configuration file (likely `src/routes/admin.routes.js` or similar)

---

### 4. Access Token Duration
**Requirement:** Increase access token expiry to 1 day (24 hours)

**Fix Required in JWT Configuration:**
```javascript
// Current (likely 1 hour)
const ACCESS_TOKEN_EXPIRY = '1h'

// Change to 1 day
const ACCESS_TOKEN_EXPIRY = '1d'  // or '24h' or 86400 seconds
```

**Location:** `src/config/jwt.config.js` or wherever JWT expiry is configured

---

## New API Endpoints Required

### 5. Comprehensive Student Detail API
**Endpoint:** `GET /api/admin/students/:studentId`

**Purpose:** Get complete student profile including parent info, tutor info, enrollments, sessions, grades, attendance, reports, and performance data.

**Expected Response:**
```json
{
  "student": {
    "id": "string",
    "fullName": "string",
    "studentCode": "string",
    "dateOfBirth": "string",
    "actualGrade": "string",
    "gradeLevel": "string",
    "gradeBandTier": "string",
    "gender": "string",
    "school": "string | null",
    "notes": "string | null",
    "status": "ACTIVE | SUSPENDED",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "parent": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string | null",
    "status": "ACTIVE | SUSPENDED",
    "timezone": "string | null"
  },
  "enrollments": [
    {
      "id": "string",
      "subject": {
        "id": "string",
        "name": "string",
        "category": "CORE | ENRICHMENT | TEST_PREP"
      },
      "tutor": {
        "id": "string",
        "fullName": "string",
        "email": "string",
        "phone": "string | null",
        "tutorProfile": {
          "availabilityStatus": "AVAILABLE | BUSY | UNAVAILABLE",
          "hourlyRate": "number",
          "subjects": ["string"]
        }
      },
      "status": "ACTIVE | PENDING | COMPLETED",
      "startDate": "string",
      "endDate": "string | null",
      "sessionFrequency": "string",
      "availableDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      "billingFrequency": "string"
    }
  ],
  "sessions": [
    {
      "id": "string",
      "scheduledAt": "string",
      "durationMinutes": "number",
      "status": "SCHEDULED | COMPLETED | CANCELLED",
      "notes": "string | null",
      "zoomLink": "string | null"
    }
  ],
  "grades": [
    {
      "id": "string",
      "subject": "string",
      "score": "number",
      "maxScore": "number",
      "percentage": "number",
      "gradedAt": "string",
      "feedback": "string | null"
    }
  ],
  "attendance": [
    {
      "id": "string",
      "sessionId": "string",
      "date": "string",
      "status": "PRESENT | ABSENT | LATE",
      "notes": "string | null"
    }
  ],
  "progressReports": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "createdAt": "string",
      "createdBy": {
        "id": "string",
        "fullName": "string",
        "role": "TUTOR | ADMIN"
      }
    }
  ],
  "performanceOverview": {
    "totalSessions": "number",
    "attendanceRate": "number",
    "averageGrade": "number",
    "completedAssignments": "number",
    "activeEnrollments": "number"
  }
}
```

**Implementation Notes:**
- Join with Parent table
- Join with Enrollments → Subject and Tutor
- Join with Sessions
- Join with Grades
- Join with Attendance
- Join with ProgressReports
- Calculate performance metrics

---

### 6. Tutor Profile with Availability API
**Endpoint:** `GET /api/admin/tutors/:tutorId`

**Note:** This endpoint should already exist but needs to include availability status.

**Ensure Response Includes:**
```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string | null",
  "status": "APPROVED | PENDING | REJECTED | SUSPENDED",
  "tutorProfile": {
    "id": "string",
    "subjects": ["string"],
    "bio": "string",
    "credentialsUrl": "string | null",
    "vettingStatus": "APPROVED | PENDING | REJECTED",
    "hourlyRate": "number",
    "availability": {
      "MON": ["09:00-12:00", "14:00-17:00"],
      "TUE": ["09:00-12:00"],
      // ... other days
    },
    "availabilityStatus": "AVAILABLE | BUSY | UNAVAILABLE",
    "maxStudents": "number | null",
    "statusNote": "string | null"
  },
  "currentStudentCount": "number"
}
```

---

## Registration Form Changes

### 7. Multi-Step Tutor Registration

**New Registration Flow:**

**Step 1: Basic Information**
- First name (required)
- Last name (required)
- Middle name (optional)
- Email (required)
- Phone number (required)
- Password (required)
- Confirm password (required)

**Step 2: Personal Details**
- Address
- Birthday (day and month only - for celebration)
- Country (required)
- City (required)
- Highest qualification (required)
  - Options: SSCE/WAEC, OND/NCE, HND, Bachelor's degree, B.Ed/PGDE, Master's degree, PhD, Other

**Step 3: Teaching Information**
- What you can teach (Academic subjects)
  - Multi-select: Math, Language Arts, Geography, Science, Biology, Physics, Chemistry, Microbiology
- Test preparation (multi-select - optional)
- Extracurricular (multi-select - optional)
- Levels you can teach (multi-select)
  - Preschool to Grade 1
  - Grade 2 to 4
  - Grade 5 to 8
  - Grade 9 to 12
  - Exam levels
- Years of teaching experience (required)
- Why do you want to teach with Blooming Kids House? (required - text)
- How did you hear about Blooming Kids House? (required - select)
  - Options: Current BKH tutor/staff, Parent/family with BKH, Friend/family, Instagram, Facebook, LinkedIn, WhatsApp group, Google search, Job board, Other

**Step 4: Tutor Profile**
- Your photo (required - upload)
  - Requirements: Clear head-and-shoulders photo, facing camera, plain background, no sunglasses, square works best
- A little about you (required - max 180 words)
  - Interests, hobbies, what you're learning yourself
- CV and certificates (required - up to 5 documents, max 5MB each)
  - PDF, Word, or clear photograph
  - Private: only people reviewing applications can open

**Important Notes:**
- Everything saves as you go (auto-save)
- Tutors cannot login until approved by admin
- Admin should see unapproved tutors in pending list
- Admin can approve/reject tutors

**API Changes Required:**

**New Endpoint:** `POST /api/auth/tutor-register-step1`
```json
{
  "firstName": "string",
  "lastName": "string",
  "middleName": "string | null",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```

**New Endpoint:** `POST /api/auth/tutor-register-step2`
```json
{
  "address": "string",
  "birthday": "string", // Format: "MM-DD"
  "country": "string",
  "city": "string",
  "highestQualification": "string"
}
```

**New Endpoint:** `POST /api/auth/tutor-register-step3`
```json
{
  "subjects": ["string"],
  "testPrepSubjects": ["string"],
  "extracurricularSubjects": ["string"],
  "gradeBands": ["string"],
  "yearsOfExperience": "number",
  "whyTeach": "string",
  "howHeard": "string"
}
```

**New Endpoint:** `POST /api/auth/tutor-register-step4`
```json
{
  "profilePhoto": "string (base64 or file path)",
  "bio": "string",
  "credentials": ["string (file paths)"]
}
```

**Modified Endpoint:** `POST /api/auth/tutor-register`
- Should combine all steps or be deprecated in favor of step-by-step flow

**Database Schema Changes:**
```prisma
model User {
  // ... existing fields
  firstName    String?
  lastName     String?
  middleName   String?
  // fullName should be computed from firstName + lastName
}

model TutorProfile {
  // ... existing fields
  address           String?
  birthday          String? // Format: "MM-DD"
  country           String?
  city              String?
  highestQualification String?
  yearsOfExperience Int?
  whyTeach          String?
  howHeard          String?
  profilePhoto      String?
  bio               String  @db.Text
  credentials       String[] // Array of file paths
  testPrepSubjects  String[]
  extracurricularSubjects String[]
}
```

---

### 8. Simplified Parent Registration

**New Registration Form:**
- First name (required)
- Last name (required)
- Middle name (optional)
- Email (required)
- Phone number (required)
- Password (required)
- Confirm password (required)

**Note:** Photos can be uploaded later in settings

**API Changes Required:**

**Modified Endpoint:** `POST /api/auth/register` (for parents)
```json
{
  "firstName": "string",
  "lastName": "string",
  "middleName": "string | null",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "PARENT"
}
```

**Database Schema Changes:**
```prisma
model User {
  // ... existing fields
  firstName    String?
  lastName     String?
  middleName   String?
  // fullName should be computed from firstName + lastName
}
```

---

## Admin Messaging

### 9. Admin Role Messaging
**Current Status:** ✅ Already working correctly

**Behavior:** When a parent or tutor messages the admin, ALL users with the ADMIN role should be able to see and reply to the message.

**No changes required** - the current implementation is correct. The admin messages page already fetches all message threads and any admin user can view and reply.

---

## Frontend Fixes Already Applied

### 10. Hide Student Codes from Admin
**Status:** ✅ Fixed

Removed student code display from parent detail page for admin users. Admins can now see parent and child information but not the sensitive student codes.

### 11. Tutor Availability Status Display
**Status:** ✅ Fixed

Added StatusBadge component to display tutor availability status (AVAILABLE, BUSY, UNAVAILABLE) with proper styling.

### 12. Subject Creation Validation
**Status:** ✅ Fixed (Frontend)

Frontend now:
- Converts category to uppercase before sending
- Maps priceNGN to yearlyPriceNGN
- Maps priceUSD to yearlyPriceUSD
- Uses dropdown for category selection

**Backend still needs Prisma schema fix** (see issue #2)

---

## Additional Backend Requirements

### 13. Tutor Approval Workflow
**Endpoint:** `GET /api/admin/tutors/pending`

**Purpose:** Get list of tutors pending approval

**Expected Response:**
```json
{
  "data": [
    {
      "id": "string",
      "user": {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string"
      },
      "tutorProfile": {
        "id": "string",
        "subjects": ["string"],
        "bio": "string",
        "credentialsUrl": "string",
        "vettingStatus": "PENDING",
        "hourlyRate": "number",
        "availability": {},
        "availabilityStatus": "AVAILABLE",
        "maxStudents": "number",
        "profilePhoto": "string"
      }
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 10
}
```

**Endpoint:** `PATCH /api/admin/tutors/:tutorId/vetting`
```json
{
  "vettingStatus": "APPROVED | REJECTED"
}
```

**Endpoint:** `PATCH /api/admin/tutors/:tutorId/status`
```json
{
  "status": "APPROVED | REJECTED | SUSPENDED"
}
```

---

## Route Priority Rules

When defining routes, always place specific/static routes BEFORE dynamic routes:

```javascript
// ✅ CORRECT ORDER
app.get('/api/admin/payments/summary', getPaymentSummary)  // Static route first
app.get('/api/admin/payments/:id', getPaymentDetail)         // Dynamic route after

app.get('/api/admin/tutors/pending', getPendingTutors)      // Static route first
app.get('/api/admin/tutors/:id', getTutorDetail)            // Dynamic route after

// ❌ WRONG ORDER
app.get('/api/admin/payments/:id', getPaymentDetail)
app.get('/api/admin/payments/summary', getPaymentSummary)  // Will never match!
```

---

## Summary of Priority Fixes

### IMMEDIATE (Blocking Issues)
1. ✅ Email service - Fix Resend API call (POST → create)
2. ✅ Prisma schema - Add `updatedBy` field to SubjectPrice
3. ✅ Payment summary - Fix route order
4. ✅ Access token - Increase to 1 day

### HIGH PRIORITY (Required Features)
5. ✅ Student detail API - Comprehensive endpoint
6. ✅ Tutor profile API - Ensure availability status included
7. ✅ Multi-step tutor registration - New flow
8. ✅ Simplified parent registration - Modified form
9. ✅ Tutor approval workflow - Pending/approve/reject endpoints

### LOW PRIORITY (Already Working)
10. ✅ Admin messaging - No changes needed
11. ✅ Student code hiding - Frontend fix applied
12. ✅ Tutor availability display - Frontend fix applied

---

## Testing Checklist

After implementing these fixes, test:

- [ ] Email sending works when adding a student
- [ ] Subject creation saves correctly with prices
- [ ] Payment summary API returns data without errors
- [ ] Access tokens last for 24 hours
- [ ] Student detail page shows all information
- [ ] Tutor profile shows availability status
- [ ] Multi-step tutor registration saves progress
- [ ] Simplified parent registration works
- [ ] Admin can approve/reject pending tutors
- [ ] Admin messaging works for all admin users
