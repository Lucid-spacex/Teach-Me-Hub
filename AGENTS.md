<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Recent Fixes

## 1. Grades Endpoint Fixed
**Issue:** Frontend was calling `/tutor/grades` but backend expects `/grades`
**Fix:** Updated all API calls and routes to use `/grades` instead of `/tutor/grades`
**Files Changed:**
- lib/api.ts - All grade compilation endpoints now use `/grades`
- components/shared/NotificationBell.tsx - Updated notification link
- components/shared/Sidebar.tsx - Updated sidebar link
- components/shared/DashboardNav.tsx - Updated nav link
- app/tutor/grades/page.tsx - Moved to app/grades/page.tsx
- app/tutor/students/[id]/page.tsx - Updated navigation link

## 1.5. Grade Preview Endpoint Fixed
**Issue:** Frontend was calling `POST /grades/preview` with data, but backend expects `GET /grades/:id/preview`
**Fix:** Changed to call GET with grade ID instead of POST with full data
**Files Changed:**
- lib/api.ts - Changed previewCompiledGrade to take gradeId and use GET
- components/tutor/GradeCompileWizard.tsx - Now passes draftGrade.id to preview

## 2. Notifications API Response Fixed
**Issue:** Backend returns `{ data: [], total: 7 }` but frontend expected `{ notifications: [], total: 7 }`
**Fix:** Updated getNotifications to map `data` to `notifications`
**File Changed:** lib/api.ts line 684-699

## 3. Notifications Property Names Fixed
**Issue:** Backend uses `isRead` and `body` but frontend expected `read` and `message`
**Fix:** Updated to handle both property names
**File Changed:** app/admin/notifications/page.tsx

## 4. Refresh Token Error Handling Improved
**Issue:** When refresh token is invalid/expired, tokens weren't being cleared properly
**Fix:** Added token clearing in refresh() method when refresh fails
**File Changed:** lib/api.ts line 420-448

# Admin Dashboard API Endpoints

## Overview Data Sources

The admin dashboard uses these backend API endpoints:

### 1. Admin Overview Statistics
**Endpoint:** `GET /admin/reports/overview`
**Frontend Call:** `api.getAdminOverview()`
**Returns:**
- totalUsers: number
- totalStudents: number
- totalTutors: number
- totalParents: number
- activeEnrollments: number
- pendingTutors: number
- totalRevenue: number
- failedPayments: number

### 2. Payment Summary & Revenue Charts
**Endpoint:** `GET /admin/payments/summary`
**Frontend Call:** `api.getAdminPaymentSummary({ from, to, currency })`
**Query Parameters:**
- from: ISO date string (optional)
- to: ISO date string (optional)
- currency: string (optional, e.g., 'USD', 'NGN')

**Returns (AdminPaymentSummary):**
- byCurrency: Record of currency data (collectedTotal, pendingTotal, failedTotal, count, successRate, averagePayment)
- totalCollectedNGNEquivalent: number
- changePercent: number (vs previous period)
- dailySeries: Array of daily revenue data { date, collected: { USD, NGN, ... } }
- monthlySeries: Array of monthly revenue data (optional)
- bySubject: Array of revenue by subject { subjectName, collected, count }
- byStatus: Array of payment status counts { status, count }

### 3. Payment Transactions List
**Endpoint:** `GET /admin/payments`
**Frontend Call:** `api.getTransactions({ status, currency, provider, parentId, from, to, search, page, limit })`
**Returns:** Paginated list of payments with parent, student, and subject details

### 4. Failed Payments
**Endpoint:** `GET /admin/payments/failed`
**Frontend Call:** `api.getFailedPayments()`
**Returns:** List of failed payments

### 5. Outstanding Payments
**Endpoint:** GET /admin/enrollments/unmatched
**Frontend Call:** `api.getOutstandingPayments({ page, limit, sort })`
**Returns:** Enrollments awaiting payment with days waiting

## Payment Database Storage

Payments ARE saved to the database with:
- Receipt numbers (unique per payment)
- Transaction history (timeline events)
- Parent and student information linked
- NGN equivalent amounts and exchange rates
- Failure reasons for failed payments
- Admin notes and audit logs

## Why Charts Show "No Data Available"

If you're seeing "No revenue data available for this period", it means:
1. No payments have been made in the selected time range (7d/30d/90d)
2. The backend API is returning empty data
3. The payment summary endpoint may not be implemented yet in the backend

To verify, check the browser console when loading the admin page - it logs the payment summary data returned by the API.

## Backend Implementation Required

The backend MUST implement these endpoints:
- `/api/admin/reports/overview` - for basic stats
- `/api/admin/payments/summary` - for revenue charts
- `/api/admin/payments` - for transaction list
- `/api/admin/payments/failed` - for failed payments

These are documented in ENDPOINT.md and the frontend expects them to return the data structures defined in lib/types.ts.
