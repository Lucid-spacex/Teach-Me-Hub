# Session Visibility Issue - Backend API Problem

## Problem Summary

Sessions created by tutors are not visible to parents and students, even though they appear in the tutor's session list. This creates a disconnect where:
- Tutors can see and manage sessions they create
- Parents cannot see sessions for their children
- Students cannot see their scheduled sessions

## Current Behavior

### Tutor Experience (Working)
- Tutors can create sessions via `POST /tutor/sessions`
- Sessions appear in tutor's "My Sessions" page
- Sessions show correct Zoom links and scheduling details
- Tutors can reschedule and manage sessions

### Parent Experience (Broken)
- Parents navigate to child's profile
- See "Upcoming Sessions (0)" even when tutor has created sessions
- Query `GET /sessions?enrollmentId=X` returns empty results
- No way to view child's scheduled sessions

### Student Experience (Broken)
- Students navigate to "My Schedule" page
- See no upcoming sessions even when tutor has scheduled them
- Query `GET /student/me/schedule` returns empty results
- Cannot see Zoom links or session details

## Technical Analysis

### Frontend Implementation

**Tutor Session Creation:**
```typescript
// app/tutor/students/[id]/page.tsx line 165
await api.createTutorSession({
  enrollmentId: scheduleEnrollmentId,
  scheduledAt: scheduledDateObj.toISOString(),
  durationMinutes: parseInt(scheduleDuration, 10) || 60,
})
```

**Parent Session Query:**
```typescript
// app/parent/students/[id]/page.tsx line 98
const sessionPromises = childEnrollments.map(e => api.getSessions(e.id).catch(() => []))
// Calls: GET /sessions?enrollmentId=X
```

**Student Session Query:**
```typescript
// app/student/schedule/page.tsx line 34
const data = await api.getStudentSchedule()
// Calls: GET /student/me/schedule
```

### API Endpoints Involved

1. **POST /tutor/sessions** - Creates sessions (tutor-only)
2. **GET /sessions?enrollmentId=X** - Queries sessions by enrollment (general)
3. **GET /student/me/schedule** - Queries student's schedule (student-only)
4. **GET /tutor/sessions** - Queries tutor's sessions (tutor-only)

## Root Cause

The backend has separate session storage or permission models for different user roles:

1. **Tutor-specific endpoint** (`/tutor/sessions`) stores sessions in a tutor-scoped context
2. **General endpoint** (`/sessions`) cannot access sessions created via tutor endpoint
3. **Student endpoint** (`/student/me/schedule`) cannot access sessions created via tutor endpoint

This suggests the backend either:
- Has separate database tables/collections for different user role sessions
- Lacks proper permission bridges between role-specific endpoints
- Does not properly link sessions to enrollments in a shared data model

## Required Backend Changes

### 1. Unified Session Data Model

**Option A: Single Session Table with Role-Based Access**
- All sessions stored in one `sessions` table/collection
- Each session has: `id`, `enrollmentId`, `scheduledAt`, `durationMinutes`, `status`, `zoomLink`, `tutorId`
- Role-based permissions control who can query which sessions
- All endpoints query the same data source with different filters

**Option B: Session Synchronization**
- Keep separate storage if needed for performance
- Implement synchronization logic to copy sessions from tutor context to general context
- Ensure enrollment linkage is maintained across all contexts

### 2. API Endpoint Fixes

#### Fix POST /tutor/sessions
```http
POST /tutor/sessions
Content-Type: application/json

{
  "enrollmentId": "string",
  "scheduledAt": "ISO8601 datetime",
  "durationMinutes": number
}

Response: Session object (stored in unified session table)
```

**Requirements:**
- Store session in unified session table accessible by all roles
- Link session to enrollment via `enrollmentId`
- Include `tutorId` from authenticated tutor context
- Generate Zoom link with tutor as host
- Set initial status to "SCHEDULED"

#### Fix GET /sessions?enrollmentId=X
```http
GET /sessions?enrollmentId=X&status=SCHEDULED

Response: Array of sessions for that enrollment
```

**Requirements:**
- Query unified session table
- Filter by `enrollmentId` parameter
- Apply role-based permissions:
  - Parents: Only return sessions for their children's enrollments
  - Tutors: Only return sessions for their assigned enrollments
  - Admins: Return all sessions
- Support optional status filter

#### Fix GET /student/me/schedule
```http
GET /student/me/schedule

Response: Array of sessions for student's enrollments
```

**Requirements:**
- Get student's enrollments from authenticated context
- Query unified session table for all those enrollment IDs
- Return sessions sorted by `scheduledAt` ascending
- Include all session details (Zoom link, status, etc.)

#### Fix GET /tutor/sessions
```http
GET /tutor/sessions

Response: Array of sessions for tutor's enrollments
```

**Requirements:**
- Get tutor's assigned enrollments from authenticated context
- Query unified session table for those enrollment IDs
- Return sessions sorted by `scheduledAt` ascending
- This should return the same data as GET /sessions with proper filters

### 3. Permission Model Updates

**Session Read Permissions:**
| Role | Can Read | Filter |
|------|----------|--------|
| Student | Own sessions | Filter by student's enrollment IDs |
| Parent | Children's sessions | Filter by children's enrollment IDs |
| Tutor | Assigned sessions | Filter by tutor's enrollment IDs |
| Admin | All sessions | No filter |

**Session Write Permissions:**
| Role | Can Create | Can Update | Can Delete |
|------|------------|------------|------------|
| Student | No | No | No |
| Parent | No | No | No |
| Tutor | Yes (for assigned enrollments) | Yes (own sessions) | No |
| Admin | Yes | Yes | Yes |

### 4. Database Schema Requirements

**Unified Session Table Structure:**
```sql
sessions
├── id (primary key)
├── enrollmentId (foreign key to enrollments)
├── tutorId (foreign key to users/tutors)
├── scheduledAt (datetime)
├── durationMinutes (integer)
├── status (enum: SCHEDULED, COMPLETED, MISSED, CANCELLED)
├── zoomLink (string)
├── zoomMeetingId (string)
├── zoomPassword (string)
├── createdAt (datetime)
├── updatedAt (datetime)
└── metadata (json)

Indexes:
- idx_enrollment_id (enrollmentId)
- idx_tutor_id (tutorId)
- idx_scheduled_at (scheduledAt)
- idx_status (status)
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

## Testing Requirements

### Test Case 1: Tutor Creates Session
1. Login as tutor
2. Navigate to assigned student
3. Create new session with enrollmentId
4. Verify session appears in tutor's session list
5. **Expected:** Session appears with correct details

### Test Case 2: Parent Views Child's Sessions
1. Login as parent
2. Navigate to child's profile
3. Check "Upcoming Sessions" section
4. **Expected:** Sessions created by tutor are visible
5. **Current:** Shows "No upcoming sessions scheduled"

### Test Case 3: Student Views Schedule
1. Login as student
2. Navigate to "My Schedule" page
3. Check upcoming sessions
4. **Expected:** Sessions created by assigned tutor are visible
5. **Current:** Shows no sessions

### Test Case 4: Cross-Role Session Visibility
1. Tutor creates session for Student A
2. Parent of Student A views sessions
3. Student A views schedule
4. **Expected:** All three see the same session
5. **Current:** Only tutor sees the session

## Implementation Priority

### High Priority (Critical)
1. **Unify session storage** - Ensure all endpoints access the same session data
2. **Fix GET /sessions?enrollmentId=X** - Enable parent session visibility
3. **Fix GET /student/me/schedule** - Enable student session visibility

### Medium Priority
1. **Update permission model** - Document and implement role-based access
2. **Add database indexes** - Optimize session queries
3. **Implement caching** - Improve performance for frequent queries

### Low Priority
1. **Add session analytics** - Track session creation and attendance
2. **Implement session reminders** - Email/push notifications
3. **Add session history** - Long-term session tracking

## API Contract Examples

### Create Session (Tutor)
```http
POST /tutor/sessions
Authorization: Bearer <tutor-token>
Content-Type: application/json

{
  "enrollmentId": "enr_1234567890",
  "scheduledAt": "2026-09-27T18:00:00Z",
  "durationMinutes": 60
}

Response 201:
{
  "id": "sess_9876543210",
  "enrollmentId": "enr_1234567890",
  "tutorId": "tutor_111222333",
  "scheduledAt": "2026-09-27T18:00:00Z",
  "durationMinutes": 60,
  "status": "SCHEDULED",
  "zoomLink": "https://zoom.us/j/123456789",
  "zoomMeetingId": "123456789",
  "zoomPassword": "abc123",
  "createdAt": "2026-09-27T10:00:00Z",
  "updatedAt": "2026-09-27T10:00:00Z"
}
```

### Query Sessions by Enrollment (Parent)
```http
GET /sessions?enrollmentId=enr_1234567890&status=SCHEDULED
Authorization: Bearer <parent-token>

Response 200:
[
  {
    "id": "sess_9876543210",
    "enrollmentId": "enr_1234567890",
    "tutorId": "tutor_111222333",
    "scheduledAt": "2026-09-27T18:00:00Z",
    "durationMinutes": 60,
    "status": "SCHEDULED",
    "zoomLink": "https://zoom.us/j/123456789",
    "zoomMeetingId": "123456789",
    "zoomPassword": "abc123",
    "createdAt": "2026-09-27T10:00:00Z",
    "updatedAt": "2026-09-27T10:00:00Z"
  }
]
```

### Query Student Schedule (Student)
```http
GET /student/me/schedule
Authorization: Bearer <student-token>

Response 200:
[
  {
    "id": "sess_9876543210",
    "enrollmentId": "enr_1234567890",
    "tutorId": "tutor_111222333",
    "scheduledAt": "2026-09-27T18:00:00Z",
    "durationMinutes": 60,
    "status": "SCHEDULED",
    "zoomLink": "https://zoom.us/j/123456789",
    "zoomMeetingId": "123456789",
    "zoomPassword": "abc123",
    "createdAt": "2026-09-27T10:00:00Z",
    "updatedAt": "2026-09-27T10:00:00Z"
  }
]
```

## Error Handling

### Permission Errors
```http
GET /sessions?enrollmentId=enr_9999999999
Authorization: Bearer <parent-token>

Response 403:
{
  "error": "PERMISSION_DENIED",
  "message": "You do not have permission to access sessions for this enrollment"
}
```

### Not Found Errors
```http
GET /sessions?enrollmentId=invalid_id
Authorization: Bearer <parent-token>

Response 404:
{
  "error": "NOT_FOUND",
  "message": "Enrollment not found"
}
```

## Success Criteria

- [ ] Tutors can create sessions that are immediately visible to parents
- [ ] Parents can view all sessions for their children's enrollments
- [ ] Students can view all sessions for their enrollments
- [ ] All three roles see the same session data (consistent view)
- [ ] Session creation, updates, and deletions are properly synchronized
- [ ] Permission model prevents unauthorized access
- [ ] API responses include all required session details
- [ ] Zoom links are correctly generated and accessible

## Related Issues

- Zoom meeting host configuration (see BACKEND_PERMISSIONS_NEEDED.md)
- Student enrollment access permissions
- Parent child relationship verification
- Tutor assignment visibility

## Contact

For questions or clarifications about this issue, contact:
- Frontend Team: Session visibility and API contract
- Backend Team: Data model and permission implementation
- DevOps Team: Database schema changes and deployment