# Backend API Requirements

This document lists the backend APIs that need to be implemented or verified for the enhanced admin features.

## Currently Working APIs
- ✅ GET /admin/overview - Admin dashboard stats
- ✅ GET /admin/tutors/pending - Pending tutor applications
- ✅ GET /admin/tutors - All tutors (with optional status filter)
- ✅ PATCH /admin/tutors/:id/vetting - Approve/reject tutor
- ✅ GET /admin/enrollments/unmatched - Unmatched enrollments
- ✅ GET /admin/enrollments/:id/suggested-tutors - Suggested tutors for assignment
- ✅ PATCH /admin/enrollments/:id/assign-tutor - Assign tutor to enrollment
- ✅ GET /admin/parents - Parent directory with search/filters
- ✅ GET /admin/parents/:id - Parent detail profile
- ✅ GET /admin/payments/failed - Failed payments
- ✅ GET /admin/students - All students
- ✅ GET /admin/subjects - Subjects with per-grade pricing
- ✅ POST /admin/subjects - Create subject
- ✅ PUT /admin/subjects/:id/prices/:gradeBandTier - Update subject price
- ✅ PATCH /admin/subjects/:id - Update subject metadata
- ✅ DELETE /admin/subjects/:id - Delete subject
- ✅ GET /admin/transactions - Transaction list with filters
- ✅ GET /admin/payments/:id - Payment detail
- ✅ GET /admin/payments/summary - Transaction summary
- ✅ GET /admin/users/suspended - Suspended users
- ✅ PATCH /admin/users/:id/reactivate - Reactivate user
- ✅ GET /tutor/students - Tutor's assigned students
- ✅ GET /tutor/sessions - Tutor's sessions
- ✅ GET /complaints - Complaints list
- ✅ PATCH /complaints/:id/resolve - Resolve complaint
- ✅ GET /messages/threads - Message threads
- ✅ GET /messages/threads/:id - Messages in thread
- ✅ POST /messages - Send message

## Missing or Needs Verification APIs

### 1. Admin All Students Detail View
**Endpoint**: `GET /admin/students/:id`

**Purpose**: Get detailed information about a specific student including:
- Student profile (name, grade, school, etc.)
- Parent information (without contact details per security spec)
- Enrollments (active and historical)
- Assigned tutors with profiles
- Progress reports
- Attendance records
- Grades (only approved ones)

**Expected Response**:
```typescript
{
  student: StudentProfile,
  parent: {
    id: string,
    fullName: string,
    // No email/phone for security
  },
  enrollments: Enrollment[],
  assignedTutors: Array<{
    tutor: TutorWithProfile,
    subject: Subject,
    enrollment: Enrollment
  }>,
  progressReports: ProgressReport[],
  attendance: StudentAttendance[],
  grades: Grade[] // Only approved grades
}
```

### 2. Admin All Tutors Enhanced Detail View
**Endpoint**: `GET /admin/tutors/:id`

**Purpose**: Get comprehensive tutor information including:
- Tutor profile and user info
- All assigned students (past and present)
- All sessions conducted
- Grades submitted by this tutor
- Subject linking via TutorSubject
- Availability status and schedule
- Performance metrics (optional)

**Expected Response**:
```typescript
{
  tutor: TutorWithProfile,
  students: Array<{
    student: Student,
    enrollment: Enrollment,
    subject: Subject,
    startDate: string,
    endDate?: string
  }>,
  sessions: Session[],
  grades: Grade[],
  subjects: TutorSubject[],
  availabilityStatus: TutorAvailabilityStatus,
  availabilitySchedule?: Record<string, any>
}
```

### 3. Parent Directory Enhanced Features

#### 3.1 Direct Messaging from Parent Directory
**Endpoint**: `POST /messages` (already exists)
- Use existing message API
- Get admin contact ID from `GET /messages/admin-contact` (already exists)

#### 3.2 Change Pricing from Parent Directory
**Endpoint**: `PATCH /admin/enrollments/:id/pricing` (already exists)
- Use existing pricing override API
- Add optional `note` field for change logging

#### 3.3 Assign Tutor from Parent Directory
**Endpoint**: `PATCH /admin/enrollments/:id/assign-tutor` (already exists)
- Use existing assignment API
- Could add suggested tutors dropdown in parent detail view

### 4. Admin Students List with Filters
**Endpoint**: `GET /admin/students?search=&status=&enrolled=&assigned=&page=&limit=`

**Purpose**: Get all students with advanced filtering options:
- Search by name, student code
- Filter by status (ACTIVE, SUSPENDED, etc.)
- Filter by enrollment status (enrolled, not enrolled)
- Filter by assignment status (assigned, not assigned)
- Pagination

**Expected Response**:
```typescript
{
  students: AdminStudent[],
  total: number,
  page: number,
  limit: number
}
```

### 5. Admin All Tutors List with Filters
**Endpoint**: `GET /admin/tutors?search=&status=&availability=&hasCapacity=&page=&limit=`

**Purpose**: Get all tutors with advanced filtering:
- Search by name, email
- Filter by vetting status (APPROVED, PENDING, REJECTED)
- Filter by availability status (AVAILABLE, LIMITED, UNAVAILABLE)
- Filter by capacity (hasCapacity=true)
- Pagination

**Expected Response**:
```typescript
{
  tutors: TutorWithProfile[],
  total: number,
  page: number,
  limit: number
}
```

### 6. Admin Notifications List
**Endpoint**: `GET /admin/notifications` (already exists but verify)

**Purpose**: Get all admin notifications for the platform

### 7. Admin Failed Payments List
**Endpoint**: `GET /admin/payments/failed` (already exists but verify)

**Purpose**: Get all failed payment attempts

## Security Notes

- **Student Detail View**: Must NOT expose parent contact details (email, phone) per IDOR protection rules
- **Tutor Detail View**: Must NOT expose parent information when showing student enrollments
- **Pricing Changes**: Must log all changes to PriceChangeLog table
- **Tutor Assignment**: Must verify capacity and availability before assignment (unless force=true)

## Priority Implementation Order

1. **High Priority**:
   - GET /admin/students/:id (Student detail view)
   - GET /admin/students with filters (Enhanced students list)
   - GET /admin/tutors/:id (Tutor detail view)
   - GET /admin/tutors with filters (Enhanced tutors list)

2. **Medium Priority**:
   - GET /admin/notifications (Verify and enhance if needed)
   - GET /admin/payments/failed (Verify and enhance if needed)

3. **Low Priority**:
   - Additional analytics/metrics APIs
   - Bulk operations APIs
