# Backend API Prompt: Admin Payment Summary and Revenue

## Overview
The admin dashboard requires payment summary and revenue data APIs to display charts and statistics. Currently, the frontend shows "No data available" because these endpoints are not implemented or return empty data.

## Required Endpoints

### 1. GET /api/admin/reports/overview
**Purpose:** Basic platform statistics for the admin overview dashboard

**Response:**
```json
{
  "totalUsers": 150,
  "totalStudents": 120,
  "totalTutors": 25,
  "totalParents": 95,
  "activeEnrollments": 85,
  "pendingTutors": 3,
  "totalRevenue": 2500000,
  "failedPayments": 5
}
```

### 2. GET /api/admin/payments/summary
**Purpose:** Payment summary data for revenue charts and breakdown

**Query Parameters:**
- `from` (optional): ISO date string for start date
- `to` (optional): ISO date string for end date
- `currency` (optional): Currency code (e.g., 'USD', 'NGN')

**Response:**
```json
{
  "byCurrency": {
    "NGN": {
      "collectedTotal": 2500000,
      "pendingTotal": 500000,
      "failedTotal": 100000,
      "count": 85,
      "successRate": 94.1,
      "averagePayment": 29411.76
    },
    "USD": {
      "collectedTotal": 15000,
      "pendingTotal": 3000,
      "failedTotal": 600,
      "count": 85,
      "successRate": 94.1,
      "averagePayment": 176.47
    }
  },
  "totalCollectedNGNEquivalent": 2650000,
  "changePercent": 12.5,
  "dailySeries": [
    {
      "date": "2024-01-01",
      "collected": {
        "NGN": 150000,
        "USD": 900
      }
    },
    {
      "date": "2024-01-02",
      "collected": {
        "NGN": 200000,
        "USD": 1200
      }
    }
  ],
  "monthlySeries": [
    {
      "month": "2024-01",
      "collected": {
        "NGN": 5500000,
        "USD": 33000
      }
    }
  ],
  "bySubject": [
    {
      "subjectName": "Mathematics",
      "collected": 1000000,
      "count": 35
    },
    {
      "subjectName": "English",
      "collected": 800000,
      "count": 28
    }
  ],
  "byStatus": [
    {
      "status": "COMPLETED",
      "count": 80
    },
    {
      "status": "PENDING",
      "count": 5
    }
  ]
}
```

### 3. GET /api/admin/payments
**Purpose:** Paginated list of payment transactions

**Query Parameters:**
- `status` (optional): Filter by payment status
- `currency` (optional): Filter by currency
- `provider` (optional): Filter by payment provider
- `parentId` (optional): Filter by parent ID
- `from` (optional): ISO date string for start date
- `to` (optional): ISO date string for end date
- `search` (optional): Search term (receipt number, parent name, student name)
- `page` (optional): Page number (default 1)
- `limit` (optional): Items per page (default 20, max 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "receiptNumber": "PAY-2024-001",
      "amount": 50000,
      "currency": "NGN",
      "ngnEquivalent": 50000,
      "status": "COMPLETED",
      "provider": "FLUTTERWAVE",
      "parent": {
        "id": "uuid",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "student": {
        "id": "uuid",
        "fullName": "Jane Doe",
        "gradeLevel": "G5_TO_G8"
      },
      "subject": {
        "id": "uuid",
        "name": "Mathematics"
      },
      "enrollmentId": "uuid",
      "transactionReference": "FLW-123456",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 85
}
```

### 4. GET /api/admin/payments/failed
**Purpose:** List of failed payments for admin review

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "receiptNumber": "PAY-2024-002",
      "amount": 30000,
      "currency": "NGN",
      "ngnEquivalent": 30000,
      "status": "FAILED",
      "provider": "FLUTTERWAVE",
      "failureReason": "Insufficient funds",
      "parent": {
        "id": "uuid",
        "fullName": "Jane Smith",
        "email": "jane@example.com"
      },
      "student": {
        "id": "uuid",
        "fullName": "Bob Smith",
        "gradeLevel": "G9_TO_G12"
      },
      "transactionReference": "FLW-789012",
      "createdAt": "2024-01-16T14:20:00Z",
      "failedAt": "2024-01-16T14:20:00Z"
    }
  ],
  "total": 5
}
```

### 5. GET /api/admin/enrollments/unmatched
**Purpose:** Enrollments awaiting payment with days waiting

**Query Parameters:**
- `page` (optional): Page number (default 1)
- `limit` (optional): Items per page (default 20)
- `sort` (optional): Sort order (default: 'daysWaiting:desc')

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "enrollmentId": "uuid",
      "student": {
        "id": "uuid",
        "fullName": "Alice Johnson",
        "gradeLevel": "G5_TO_G8"
      },
      "parent": {
        "id": "uuid",
        "fullName": "Bob Johnson",
        "email": "bob@example.com"
      },
      "subject": {
        "id": "uuid",
        "name": "Physics"
      },
      "tutor": {
        "id": "uuid",
        "fullName": "Dr. Smith"
      },
      "enrolledAt": "2024-01-01T00:00:00Z",
      "daysWaiting": 15,
      "paymentStatus": "PENDING"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 10
}
```

## Implementation Notes

1. **Payment Storage:** Payments should be stored in the database with:
   - Unique receipt numbers
   - Transaction history/timeline
   - Links to parent, student, and enrollment
   - NGN equivalent amounts and exchange rates
   - Failure reasons for failed payments
   - Admin notes and audit logs

2. **Currency Conversion:** When payments are made in different currencies, convert to NGN equivalent using current exchange rates for accurate revenue totals.

3. **Date Filtering:** The `from` and `to` parameters should filter payments by their `createdAt` timestamp.

4. **Empty Data Handling:** If no payments exist in the time range, return empty arrays for series data and zero values for totals.

5. **Authentication:** All endpoints require ADMIN role authentication.

6. **Error Handling:** Return appropriate HTTP status codes:
   - 401: Unauthorized
   - 403: Forbidden (not admin)
   - 400: Invalid query parameters
   - 500: Server error

## Frontend Integration

The frontend is already configured to call these endpoints via:
- `api.getAdminOverview()` → `/api/admin/reports/overview`
- `api.getAdminPaymentSummary({ from, to, currency })` → `/api/admin/payments/summary`
- `api.getTransactions({ ... })` → `/api/admin/payments`
- `api.getFailedPayments()` → `/api/admin/payments/failed`
- `api.getOutstandingPayments({ ... })` → `/api/admin/enrollments/unmatched`

Type definitions are already defined in `lib/types.ts` for:
- `AdminOverview`
- `AdminPaymentSummary`
- `Payment`
- `FailedPayment`
- `OutstandingEnrollment`

## Known Backend Bugs to Fix

### 1. Admin Badge Counts Incorrect
**Issue:** The `/api/admin/badge-counts` endpoint is returning incorrect data.
- The frontend shows "3" for tutors when there is only 1 tutor in the database
- No new tutor has registered, so the count should be 0
- This is a backend data query bug, not a frontend display issue

**Required Fix:** Debug the `/api/admin/badge-counts` endpoint to ensure:
- `pendingTutorApplications` returns the actual count of tutors with status `PENDING_VETTING`
- `unreadNewTutors` returns the actual count of newly registered tutors
- Counts are based on real database queries, not cached or hardcoded values
- All other badge counts are accurate
