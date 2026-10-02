# Assignment Creation and Visibility Issues - Backend API Requirements

## Problem Summary

Tutors cannot create assignments for their assigned students, and there's no frontend UI for assignment creation. Additionally, assignment visibility may be inconsistent across user roles.

## Current Behavior

### Tutor Experience (Limited)
- Tutors can view existing assignments via `/tutor/assignments`
- Tutors can manage quiz questions for existing TEST-type assignments
- **No UI for creating new assignments**
- API method `createAssignment()` exists but is not used in tutor interface
- Assignments are filtered by tutor's enrollments but may not show all relevant assignments

### Student Experience (Working with caveats)
- Students can view assignments via `/student/assignments`
- Students call `getStudentAssignments()` which calls `/student/me/assignments`
- Students can take quizzes for TEST-type assignments
- Assignment submission flow appears to exist

### Parent Experience (Working with caveats)
- Parents can view assignments via `/parent/assignments`
- Parents call `getAssignments()` which calls `/assignments`
- Parents can filter assignments by student and status
- May not see all assignments if permission model is restrictive

## Technical Analysis

### Frontend Implementation

**Assignment Creation API (Exists but unused):**
```typescript
// lib/api.ts line 624
async createAssignment(data: {
  enrollmentId: string
  title: string
  description: string
  type: AssignmentType
  dueDate: string
}): Promise<Assignment> {
  return this.request<Assignment>('/assignments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

**Tutor Assignment Viewing:**
```typescript
// app/tutor/assignments/page.tsx line 39
const [assignmentsData, enrollmentsData] = await Promise.all([
  api.getAssignments(),
  api.getEnrollments()
])
// Filter assignments for this tutor's enrollments
const tutorEnrollments = enrollmentsData.filter(e => e.tutorId !== null)
const tutorAssignmentIds = tutorEnrollments.map(e => e.id)
const tutorAssignments = assignmentsData.filter(a => tutorAssignmentIds.includes(a.enrollmentId))
```

**Student Assignment Viewing:**
```typescript
// app/student/assignments/page.tsx line 39
const data = await api.getStudentAssignments()
// Calls: GET /student/me/assignments
```

**Parent Assignment Viewing:**
```typescript
// app/parent/assignments/page.tsx line 38
const [assignmentsData, studentsData, enrollmentsData] = await Promise.all([
  api.getAssignments().catch(() => []),
  api.getStudents().catch(() => []),
  api.getEnrollments().catch(() => []),
])
// Calls: GET /assignments
```

### API Endpoints Involved

1. **POST /assignments** - Create assignment (exists but may have permission issues)
2. **GET /assignments** - Query all assignments (general)
3. **GET /assignments?enrollmentId=X** - Query assignments by enrollment
4. **GET /student/me/assignments** - Query student's assignments (student-only)
5. **PATCH /assignments/:id** - Update assignment status

## Root Causes

### 1. Missing Frontend UI for Assignment Creation
- The `createAssignment()` API method exists but there's no UI component for tutors to create assignments
- Tutors can only view and manage existing assignments
- No assignment creation form or modal in the tutor interface

### 2. Backend Permission Model Issues
- `POST /assignments` may not allow tutors to create assignments for their enrollments
- `GET /assignments` may not return all assignments that tutors should see
- Permission model may not properly link tutors to their assigned students' assignments

### 3. Inconsistent Assignment Visibility
- Different endpoints (`/assignments` vs `/student/me/assignments`) may return different data
- Enrollment-based filtering may not work correctly across user roles
- Assignment-to-enrollment relationship may not be properly maintained

## Required Backend Changes

### 1. Fix Assignment Creation Permissions

#### POST /assignments
```http
POST /assignments
Authorization: Bearer <tutor-token>
Content-Type: application/json

{
  "enrollmentId": "enr_1234567890",
  "title": "Chapter 5 Homework",
  "description": "Complete exercises 1-10 from Chapter 5",
  "type": "HOMEWORK",
  "dueDate": "2026-10-15T23:59:59Z"
}

Response 201:
{
  "id": "assign_9876543210",
  "enrollmentId": "enr_1234567890",
  "title": "Chapter 5 Homework",
  "description": "Complete exercises 1-10 from Chapter 5",
  "type": "HOMEWORK",
  "status": "PENDING",
  "dueDate": "2026-10-15T23:59:59Z",
  "createdAt": "2026-09-28T10:00:00Z",
  "updatedAt": "2026-09-28T10:00:00Z"
}
```

**Requirements:**
- Allow tutors to create assignments for enrollments where they are the assigned tutor
- Validate that the tutor is assigned to the enrollment
- Set initial status to "PENDING"
- Return the created assignment with all details
- Support assignment types: HOMEWORK, TEST, PROJECT, QUIZ

### 2. Fix Assignment Query Permissions

#### GET /assignments
```http
GET /assignments
Authorization: Bearer <tutor-token>

Response 200:
[
  {
    "id": "assign_9876543210",
    "enrollmentId": "enr_1234567890",
    "title": "Chapter 5 Homework",
    "description": "Complete exercises 1-10 from Chapter 5",
    "type": "HOMEWORK",
    "status": "PENDING",
    "dueDate": "2026-10-15T23:59:59Z",
    "createdAt": "2026-09-28T10:00:00Z",
    "updatedAt": "2026-09-28T10:00:00Z"
  }
]
```

**Requirements:**
- For tutors: Return assignments for enrollments where they are the assigned tutor
- For parents: Return assignments for their children's enrollments
- For students: Redirect to `/student/me/assignments` or return their own assignments
- For admins: Return all assignments
- Support optional `enrollmentId` query parameter for filtering

#### GET /assignments?enrollmentId=X
```http
GET /assignments?enrollmentId=enr_1234567890
Authorization: Bearer <tutor-token>

Response 200:
[
  {
    "id": "assign_9876543210",
    "enrollmentId": "enr_1234567890",
    "title": "Chapter 5 Homework",
    "description": "Complete exercises 1-10 from Chapter 5",
    "type": "HOMEWORK",
    "status": "PENDING",
    "dueDate": "2026-10-15T23:59:59Z",
    "createdAt": "2026-09-28T10:00:00Z",
    "updatedAt": "2026-09-28T10:00:00Z"
  }
]
```

**Requirements:**
- Return assignments for the specified enrollment
- Apply role-based permissions:
  - Tutors: Only if they are assigned to that enrollment
  - Parents: Only if it's their child's enrollment
  - Students: Only if it's their own enrollment
  - Admins: All enrollments

#### GET /student/me/assignments
```http
GET /student/me/assignments
Authorization: Bearer <student-token>

Response 200:
[
  {
    "id": "assign_9876543210",
    "enrollmentId": "enr_1234567890",
    "title": "Chapter 5 Homework",
    "description": "Complete exercises 1-10 from Chapter 5",
    "type": "HOMEWORK",
    "status": "PENDING",
    "dueDate": "2026-10-15T23:59:59Z",
    "createdAt": "2026-09-28T10:00:00Z",
    "updatedAt": "2026-09-28T10:00:00Z"
  }
]
```

**Requirements:**
- Get student's enrollments from authenticated context
- Return all assignments for those enrollments
- Include enrollment details (subject, tutor, etc.)
- Support optional status filtering

### 3. Database Schema Requirements

**Assignment Table Structure:**
```sql
assignments
├── id (primary key)
├── enrollmentId (foreign key to enrollments)
├── title (string)
├── description (text)
├── type (enum: HOMEWORK, TEST, PROJECT, QUIZ)
├── status (enum: PENDING, SUBMITTED, GRADED, CANCELLED)
├── dueDate (datetime)
├── createdAt (datetime)
├── updatedAt (datetime)
└── metadata (json)

Indexes:
- idx_enrollment_id (enrollmentId)
- idx_status (status)
- idx_due_date (dueDate)
- idx_type (type)
```

**Enrollment Relationship:**
```sql
enrollments
├── id (primary key)
├── studentId (foreign key to users/students)
├── tutorId (foreign key to users/tutors)
├── subjectId (foreign key to subjects)
├── status (enum: ACTIVE, INACTIVE, COMPLETED)
├── sessionFrequency (enum: ONCE, WEEKLY, TWICE_WEEKLY, CUSTOM)
├── startDate (date)
└── ... other fields
```

## Required Frontend Changes

### 1. Add Assignment Creation UI for Tutors

**Create Assignment Modal Component:**
```typescript
// components/tutor/CreateAssignmentModal.tsx
interface CreateAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollments: Enrollment[]
  onSuccess: () => void
}

// Features:
- Select enrollment (student + subject)
- Enter assignment title
- Enter assignment description
- Select assignment type (HOMEWORK, TEST, PROJECT, QUIZ)
- Set due date
- Submit button calls api.createAssignment()
```

**Update Tutor Assignments Page:**
```typescript
// app/tutor/assignments/page.tsx
// Add "Create Assignment" button
// Add CreateAssignmentModal component
// Handle assignment creation success
```

### 2. Improve Assignment Visibility

**Update Tutor Assignment Filtering:**
```typescript
// Better filtering logic to ensure all relevant assignments are shown
// Consider assignment status, due dates, and enrollment status
```

**Add Assignment Status Management:**
```typescript
// Allow tutors to update assignment status (PENDING -> SUBMITTED -> GRADED)
// Add UI for grading student submissions
```

## Permission Model Updates

**Assignment Read Permissions:**
| Role | Can Read | Filter |
|------|----------|--------|
| Student | Own assignments | Filter by student's enrollment IDs |
| Parent | Children's assignments | Filter by children's enrollment IDs |
| Tutor | Assigned assignments | Filter by tutor's enrollment IDs |
| Admin | All assignments | No filter |

**Assignment Write Permissions:**
| Role | Can Create | Can Update | Can Delete |
|------|------------|------------|------------|
| Student | No | No | No |
| Parent | No | No | No |
| Tutor | Yes (for assigned enrollments) | Yes (own assignments) | No |
| Admin | Yes | Yes | Yes |

## Testing Requirements

### Test Case 1: Tutor Creates Assignment
1. Login as tutor
2. Navigate to assignments page
3. Click "Create Assignment"
4. Select enrollment (student + subject)
5. Enter assignment details
6. Submit
7. **Expected:** Assignment created successfully
8. **Expected:** Assignment appears in tutor's assignment list

### Test Case 2: Student Views Assignment
1. Tutor creates assignment for Student A
2. Login as Student A
3. Navigate to assignments page
4. **Expected:** Assignment created by tutor is visible
5. **Expected:** Assignment details are correct

### Test Case 3: Parent Views Child's Assignment
1. Tutor creates assignment for Student A
2. Login as Parent of Student A
3. Navigate to assignments page
4. Filter by Student A
5. **Expected:** Assignment is visible
6. **Expected:** Assignment details match tutor's view

### Test Case 4: Assignment Status Updates
1. Student submits assignment
2. Login as tutor
3. View assignment status
4. **Expected:** Status shows "SUBMITTED"
5. Tutor grades assignment
6. **Expected:** Status shows "GRADED"
7. Student views assignment
8. **Expected:** Status shows "GRADED" with grade details

## Implementation Priority

### High Priority (Critical)
1. **Fix POST /assignments permissions** - Enable tutor assignment creation
2. **Fix GET /assignments permissions** - Ensure proper assignment visibility
3. **Add frontend assignment creation UI** - Enable tutors to create assignments

### Medium Priority
1. **Add assignment status management** - Enable grading workflow
2. **Improve assignment filtering** - Better UX for assignment management
3. **Add assignment notifications** - Notify students/parents of new assignments

### Low Priority
1. **Add assignment templates** - Pre-built assignment types
2. **Implement assignment analytics** - Track completion rates
3. **Add bulk assignment creation** - Create assignments for multiple students

## API Contract Examples

### Create Assignment (Tutor)
```http
POST /assignments
Authorization: Bearer <tutor-token>
Content-Type: application/json

{
  "enrollmentId": "enr_1234567890",
  "title": "Chapter 5 Homework",
  "description": "Complete exercises 1-10 from Chapter 5 of the textbook",
  "type": "HOMEWORK",
  "dueDate": "2026-10-15T23:59:59Z"
}

Response 201:
{
  "id": "assign_9876543210",
  "enrollmentId": "enr_1234567890",
  "title": "Chapter 5 Homework",
  "description": "Complete exercises 1-10 from Chapter 5 of the textbook",
  "type": "HOMEWORK",
  "status": "PENDING",
  "dueDate": "2026-10-15T23:59:59Z",
  "createdAt": "2026-09-28T10:00:00Z",
  "updatedAt": "2026-09-28T10:00:00Z"
}
```

### Query Assignments by Enrollment (Parent)
```http
GET /assignments?enrollmentId=enr_1234567890
Authorization: Bearer <parent-token>

Response 200:
[
  {
    "id": "assign_9876543210",
    "enrollmentId": "enr_1234567890",
    "title": "Chapter 5 Homework",
    "description": "Complete exercises 1-10 from Chapter 5 of the textbook",
    "type": "HOMEWORK",
    "status": "PENDING",
    "dueDate": "2026-10-15T23:59:59Z",
    "createdAt": "2026-09-28T10:00:00Z",
    "updatedAt": "2026-09-28T10:00:00Z"
  }
]
```

### Query Student Assignments (Student)
```http
GET /student/me/assignments
Authorization: Bearer <student-token>

Response 200:
[
  {
    "id": "assign_9876543210",
    "enrollmentId": "enr_1234567890",
    "title": "Chapter 5 Homework",
    "description": "Complete exercises 1-10 from Chapter 5 of the textbook",
    "type": "HOMEWORK",
    "status": "PENDING",
    "dueDate": "2026-10-15T23:59:59Z",
    "createdAt": "2026-09-28T10:00:00Z",
    "updatedAt": "2026-09-28T10:00:00Z"
  }
]
```

## Error Handling

### Permission Errors
```http
POST /assignments
Authorization: Bearer <tutor-token>
Content-Type: application/json

{
  "enrollmentId": "enr_9999999999",
  "title": "Test Assignment",
  "description": "Test",
  "type": "HOMEWORK",
  "dueDate": "2026-10-15T23:59:59Z"
}

Response 403:
{
  "error": "PERMISSION_DENIED",
  "message": "You are not assigned to this enrollment and cannot create assignments for it"
}
```

### Validation Errors
```http
POST /assignments
Authorization: Bearer <tutor-token>
Content-Type: application/json

{
  "enrollmentId": "enr_1234567890",
  "title": "",
  "description": "Test",
  "type": "HOMEWORK",
  "dueDate": "2026-10-15T23:59:59Z"
}

Response 400:
{
  "error": "VALIDATION_ERROR",
  "message": "Assignment title is required"
}
```

## Success Criteria

- [ ] Tutors can create assignments for their assigned students
- [ ] Tutors can view all assignments for their enrollments
- [ ] Students can view assignments created by their tutors
- [ ] Parents can view assignments for their children
- [ ] Assignment status updates work correctly
- [ ] All user roles see consistent assignment data
- [ ] Permission model prevents unauthorized access
- [ ] Assignment creation UI is intuitive and functional

## Related Issues

- Session visibility issues (see SESSION_VISIBILITY_ISSUE.md)
- Messaging permission issues (see MESSAGING_PERMISSIONS_ISSUE.md)
- Enrollment-tutor relationship verification
- Student assignment submission workflow

## Contact

For questions or clarifications about this issue, contact:
- Frontend Team: Assignment creation UI and API integration
- Backend Team: Permission model and data model implementation
- DevOps Team: Database schema changes and deployment