# Admin Portal Issues and Required Backend APIs

## Summary of Issues Found

### 1. 404 Errors for Admin Pages
**Pages Affected:**
- `/admin/messages`
- `/admin/suspended`
- `/admin/complaints`

**Current Status:**
- All three pages exist in the codebase at:
  - `app/admin/messages/page.tsx`
  - `app/admin/suspended/page.tsx`
  - `app/admin/complaints/page.tsx`
- Pages are using the admin layout correctly
- Likely cause: Backend API endpoints returning errors or not implemented

**Backend APIs Needed:**
- `GET /api/messages/threads` - For admin messages page
- `GET /api/admin/users/suspended` - For suspended users page
- `GET /api/complaints` - For complaints page

---

### 2. "Cannot read properties of undefined (reading length)" Errors

#### Admin Parents Page (`/admin/parents`)
**Error Location:** `app/admin/parents/page.tsx` line 49
```typescript
setParents(Array.isArray(data?.parents) ? data.parents : [])
setTotal(data?.total || 0)
```

**Expected API Response:**
```typescript
{
  parents: ParentDirectoryEntry[],
  total: number,
  page: number,
  limit: number
}
```

**Current API Call:**
```typescript
api.getParentDirectory({
  search: search || undefined,
  status: statusFilter !== 'ALL' ? statusFilter : undefined,
  page,
  limit,
})
```

**Backend API Needed:**
- `GET /api/admin/parents?search={search}&status={status}&page={page}&limit={limit}`
- Must return the structured response with `parents`, `total`, `page`, `limit`

**Additional APIs Needed for Parent Detail View:**
- `GET /api/admin/parents/{parentId}` - Get detailed parent profile including:
  - Parent information (name, email, phone, status)
  - Children list with student codes and grades
  - Enrollments for each child
  - Payment history
  - Complaint count
  - Total paid amount (NGN)
- `POST /api/messages` - Send message to parent
- `PATCH /api/admin/enrollments/{enrollmentId}/pricing` - Update enrollment pricing
- `PATCH /api/admin/payments/{paymentId}` - Modify payment details

---

#### Admin Transactions Page (`/admin/transactions`)
**Error Location:** `app/admin/transactions/page.tsx` line 55
```typescript
setPayments(Array.isArray(data?.payments) ? data.payments : [])
setTotal(data?.total || 0)
```

**Expected API Response:**
```typescript
{
  payments: PaymentDetail[],
  total: number,
  page: number,
  limit: number
}
```

**Current API Call:**
```typescript
api.getTransactions({
  search: search || undefined,
  status: statusFilter !== 'ALL' ? statusFilter : undefined,
  currency: currencyFilter !== 'ALL' ? currencyFilter : undefined,
  provider: providerFilter !== 'ALL' ? providerFilter : undefined,
  page,
  limit,
})
```

**Backend API Needed:**
- `GET /api/admin/payments?search={search}&status={status}&currency={currency}&provider={provider}&page={page}&limit={limit}`
- Must return structured response with `payments`, `total`, `page`, `limit`

**Additional APIs Needed:**
- `GET /api/admin/payments/{paymentId}` - Get payment details
- `GET /api/admin/payments/summary?from={date}&to={date}` - Get payment summary statistics

---

### 3. Admin Overview Page Showing Undefined/Zero Data

**Page:** `/admin` (`app/admin/page.tsx`)

**Current API Call:**
```typescript
const overviewData = await api.getAdminOverview()
```

**Expected API Response:**
```typescript
{
  totalUsers: number,
  totalStudents: number,
  totalTutors: number,
  pendingTutors: number,
  totalRevenue: number,
  failedPayments: number,
  unmatchedEnrollments: number
}
```

**Backend API Needed:**
- `GET /api/admin/reports/overview`
- Must return all statistics mentioned above

---

### 4. Admin Tutors Page Showing Pending Tutors Instead of All Tutors

**Current Issue:**
- `/admin/tutors` page is using `PendingTutorsList` component
- Should show ALL tutors (active and inactive), not just pending
- Separate page `/admin/tutors/pending` already exists for pending tutors

**Required Changes:**

#### Backend APIs Needed:
- `GET /api/admin/tutors?status={status}` - Get all tutors with optional status filter
  - Status options: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `ALL`
  - Response should include:
    ```typescript
    {
      tutors: TutorWithProfile[],
      total: number,
      page: number,
      limit: number
    }
    ```

- `GET /api/admin/tutors/{tutorId}` - Get detailed tutor profile including:
  - Tutor personal information
  - Tutor profile (subjects, bio, credentials, hourly rate)
  - Availability schedule
  - Vetting status
  - Current status (active/inactive/suspended)
  - List of assigned students
  - Session history
  - Grades given to students
  - Progress reports submitted
  - Performance metrics

- `GET /api/admin/tutors/{tutorId}/students` - Get all students assigned to tutor
- `GET /api/admin/tutors/{tutorId}/sessions` - Get tutor's session history
- `GET /api/admin/tutors/{tutorId}/grades` - Get grades given by tutor
- `GET /api/admin/tutors/{tutorId}/progress-reports` - Get progress reports by tutor
- `PATCH /api/admin/tutors/{tutorId}/status` - Update tutor status (activate/suspend)

---

### 5. Admin Students Page Enhancements

**Current Page:** `/admin/students` (`app/admin/students/page.tsx`)
- Currently uses `AllStudentsList` component
- Needs to show ALL students (enrolled or not, assigned or not)
- Needs filtering capabilities
- Needs detailed student profile view

**Required Backend APIs:**

- `GET /api/admin/students?status={status}&assigned={boolean}&page={page}&limit={limit}`
  - Get all students with filters
  - Response should include:
    ```typescript
    {
      students: AdminStudent[],
      total: number,
      page: number,
      limit: number
    }
    ```

- `GET /api/admin/students/{studentId}` - Get detailed student profile including:
  - Student personal information
  - Parent information
  - Enrollment history
  - Current tutor assignment
  - Active enrollments
  - Grades and progress reports
  - Attendance records
  - Assignment history
  - Session history

- `GET /api/admin/students/{studentId}/enrollments` - Get student enrollments
- `GET /api/admin/students/{studentId}/grades` - Get student grades
- `GET /api/admin/students/{studentId}/attendance` - Get student attendance
- `GET /api/admin/students/{studentId}/sessions` - Get student sessions
- `PATCH /api/admin/students/{studentId}/assign-tutor` - Assign tutor to student
- `PATCH /api/admin/students/{studentId}/regenerate-pin` - Regenerate student PIN

---

### 6. Admin Parents Page Enhancements

**Current Page:** `/admin/parents` (`app/admin/parents/page.tsx`)
- Has basic listing and detail view
- Missing: Direct messaging from admin, payment management, tutor assignment

**Required Backend APIs:**

- `GET /api/admin/parents` - Parent directory with pagination (already implemented in frontend)
- `GET /api/admin/parents/{parentId}` - Parent detail view (already implemented in frontend)
- `POST /api/messages` - Send message to parent directly from admin panel
- `PATCH /api/admin/enrollments/{enrollmentId}/pricing` - Update payment amount for specific subject
- `PATCH /api/admin/payments/{paymentId}` - Modify payment details
- `GET /api/admin/parents/{parentId}/children` - Get parent's children
- `GET /api/admin/parents/{parentId}/payments` - Get parent's payment history
- `GET /api/admin/parents/{parentId}/enrollments` - Get parent's enrollments

---

### 7. Admin Messages Page

**Current Page:** `/admin/messages` (`app/admin/messages/page.tsx`)
- Uses messaging system
- Needs backend support for admin-specific messaging

**Required Backend APIs:**

- `GET /api/messages/threads` - Get admin's message threads
- `GET /api/messages/threads/{threadId}` - Get messages in a thread
- `POST /api/messages` - Send message to any user
- `GET /api/messages/admin-contact` - Get admin's contact ID for initiating conversations

---

### 8. Admin Suspended Users Page

**Current Page:** `/admin/suspended` (`app/admin/suspended/page.tsx`)
- Shows suspended users
- Has reactivate functionality

**Required Backend APIs:**

- `GET /api/admin/users/suspended` - Get all suspended users
- `PATCH /api/admin/users/{userId}/reactivate` - Reactivate a suspended user

---

### 9. Admin Complaints Page

**Current Page:** `/admin/complaints` (`app/admin/complaints/page.tsx`)
- Shows complaints
- Has resolve functionality

**Required Backend APIs:**

- `GET /api/complaints` - Get all complaints
- `PATCH /api/complaints/{complaintId}/resolve` - Resolve a complaint with admin reply

---

## Summary of Required Backend API Endpoints

### Admin Overview
- ✅ `GET /api/admin/reports/overview` - Get dashboard statistics

### Tutors Management
- ✅ `GET /api/admin/tutors/pending` - Get pending tutors
- ❌ `GET /api/admin/tutors?status={status}` - Get all tutors with filtering
- ❌ `GET /api/admin/tutors/{tutorId}` - Get detailed tutor profile
- ❌ `GET /api/admin/tutors/{tutorId}/students` - Get tutor's students
- ❌ `GET /api/admin/tutors/{tutorId}/sessions` - Get tutor's sessions
- ❌ `GET /api/admin/tutors/{tutorId}/grades` - Get grades given by tutor
- ❌ `GET /api/admin/tutors/{tutorId}/progress-reports` - Get tutor's progress reports
- ❌ `PATCH /api/admin/tutors/{tutorId}/status` - Update tutor status
- ✅ `PATCH /api/admin/tutors/{id}/vetting` - Update tutor vetting status

### Students Management
- ❌ `GET /api/admin/students?status={status}&assigned={boolean}` - Get all students with filtering
- ❌ `GET /api/admin/students/{studentId}` - Get detailed student profile
- ❌ `GET /api/admin/students/{studentId}/enrollments` - Get student enrollments
- ❌ `GET /api/admin/students/{studentId}/grades` - Get student grades
- ❌ `GET /api/admin/students/{studentId}/attendance` - Get student attendance
- ❌ `GET /api/admin/students/{studentId}/sessions` - Get student sessions
- ❌ `PATCH /api/admin/students/{studentId}/assign-tutor` - Assign tutor to student
- ✅ `PATCH /api/admin/students/{studentId}/regenerate-pin` - Regenerate student PIN

### Parents Management
- ❌ `GET /api/admin/parents?search={search}&status={status}&page={page}&limit={limit}` - Parent directory with pagination
- ❌ `GET /api/admin/parents/{parentId}` - Parent detail profile
- ❌ `GET /api/admin/parents/{parentId}/children` - Get parent's children
- ❌ `GET /api/admin/parents/{parentId}/payments` - Get parent's payment history
- ❌ `GET /api/admin/parents/{parentId}/enrollments` - Get parent's enrollments

### Transactions/Payments
- ❌ `GET /api/admin/payments?search={search}&status={status}&currency={currency}&provider={provider}&page={page}&limit={limit}` - Transactions with filtering
- ❌ `GET /api/admin/payments/{paymentId}` - Get payment details
- ❌ `GET /api/admin/payments/summary?from={date}&to={date}` - Payment summary statistics
- ❌ `PATCH /api/admin/payments/{paymentId}` - Modify payment details
- ✅ `GET /api/admin/payments/failed` - Get failed payments

### Enrollments
- ✅ `GET /api/admin/enrollments/unmatched?includeUnpaid={boolean}` - Get unmatched enrollments
- ✅ `PATCH /api/admin/enrollments/{enrollmentId}/assign-tutor` - Assign tutor to enrollment
- ✅ `GET /api/admin/enrollments/{enrollmentId}/suggested-tutors` - Get suggested tutors
- ❌ `PATCH /api/admin/enrollments/{enrollmentId}/pricing` - Update enrollment pricing

### Users
- ❌ `GET /api/admin/users/suspended` - Get suspended users
- ❌ `PATCH /api/admin/users/{userId}/reactivate` - Reactivate user

### Messages
- ✅ `GET /api/messages/threads` - Get message threads
- ✅ `GET /api/messages/threads/{threadId}` - Get messages in thread
- ✅ `POST /api/messages` - Send message
- ✅ `GET /api/messages/admin-contact` - Get admin contact ID

### Complaints
- ✅ `GET /api/complaints` - Get complaints
- ✅ `POST /api/complaints` - File complaint
- ✅ `PATCH /api/complaints/{complaintId}/resolve` - Resolve complaint

### Subjects & Pricing
- ✅ `GET /api/admin/subjects` - Get subjects
- ✅ `POST /api/admin/subjects` - Create subject
- ✅ `PATCH /api/admin/subjects/{id}` - Update subject
- ✅ `DELETE /api/admin/subjects/{id}` - Delete subject
- ✅ `PUT /api/admin/subjects/{subjectId}/prices/{gradeBandTier}` - Update subject price
- ✅ `GET /api/admin/pricing-tiers` - Get pricing tiers
- ✅ `PATCH /api/admin/pricing-tiers/{tierId}` - Update pricing tier
- ✅ `GET /api/admin/exchange-rate/current` - Get current exchange rate

## Legend
- ✅ API endpoint exists in frontend (`lib/api.ts`)
- ❌ API endpoint needs to be implemented in backend

## Priority Implementation Order

### High Priority (Critical for basic admin functionality)
1. `GET /api/admin/reports/overview` - Fix overview page
2. `GET /api/admin/parents` with proper response structure - Fix parents page
3. `GET /api/admin/payments` with proper response structure - Fix transactions page
4. `GET /api/admin/tutors?status={status}` - Fix all tutors page
5. `GET /api/admin/students?status={status}&assigned={boolean}` - Fix all students page

### Medium Priority (Enhanced functionality)
6. `GET /api/admin/tutors/{tutorId}` - Detailed tutor profiles
7. `GET /api/admin/students/{studentId}` - Detailed student profiles
8. `GET /api/admin/parents/{parentId}` - Detailed parent profiles
9. `GET /api/admin/payments/{paymentId}` - Payment details
10. `GET /api/admin/payments/summary` - Payment summary

### Low Priority (Nice-to-have features)
11. Tutor student assignment management
12. Parent direct messaging
13. Payment modification
14. Tutor status management
15. Advanced filtering and search

## Frontend Code Changes Needed

### 1. Fix `/admin/tutors` Page
- Replace `PendingTutorsList` component with `AllTutorsList` component
- Create new `AllTutorsList` component that:
  - Fetches all tutors (not just pending)
  - Shows tutor status (active/inactive/suspended)
  - Allows filtering by status
  - Shows tutor summary (name, subjects, students count)
  - Click to view detailed tutor profile

### 2. Fix `/admin/students` Page
- Update `AllStudentsList` component to:
  - Fetch all students (not just enrolled)
  - Show student status (enrolled/not enrolled, assigned/not assigned)
  - Allow filtering by status and assignment
  - Show student summary (name, grade, parent, tutor)
  - Click to view detailed student profile

### 3. Add Error Handling
- All admin pages need better error handling for API responses
- Add null checks for array operations
- Add fallback empty states when data is undefined

### 4. Add Loading States
- Ensure all pages show loading spinners while fetching data
- Prevent rendering until data is loaded

## Notes

- All API endpoints require JWT authentication
- Admin role verification should be enforced on backend
- Pagination should be implemented for all list endpoints
- Search and filter parameters should be optional
- Response structures should be consistent across all endpoints
