'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { UnreadCountResponse } from '@/lib/types'
import { getUserRole } from '@/lib/auth'

export interface BadgeCounts {
  // Notification category counts (all roles)
  ASSIGNMENTS?: number
  GRADES?: number
  SESSIONS?: number
  MESSAGES?: number
  USERS?: number
  ENROLLMENT?: number
  PAYMENTS?: number
  PRICING?: number
  COMPLAINTS?: number
  QUIZZES?: number
  SCHEDULE?: number
  // Parent-specific
  unpaidEnrollments?: number
  upcomingSessions24h?: number
  // Tutor-specific
  sessionsNeedingScheduling?: number
  classesWithin24h?: number
  draftOrRejectedGrades?: number
  unmarkedAttendance?: number
  submissionsToScore?: number
  // Student-specific
  pendingAssignments?: number
  // Admin-specific (from /admin/badge-counts in addition to /badge-counts)
  unreadNewParents?: number
  unreadNewTutors?: number
  pendingTutorApplications?: number
  openComplaints?: number
  unreadMessages?: number
  unmatchedPaidEnrollments?: number
  failedPayments?: number
  outstandingEnrollments?: number
  pendingGrades?: number
  pendingChangeRequests?: number
  unscheduledWithin24h?: number
  attendanceUnmarkedSessions?: number
}

export function useBadgeCounts() {
  const [counts, setCounts] = useState<BadgeCounts>({})
  const [loading, setLoading] = useState(true)
  const role = getUserRole()

  const loadCounts = useCallback(async () => {
    try {
      setLoading(true)
      const merged: BadgeCounts = {}

      // Only call GET /admin/badge-counts for ADMIN users
      // Do NOT call GET /badge-counts as it's not being used
      if (role === 'ADMIN') {
        const adminBadgeCounts = await api.getAdminBadgeCounts().catch(() => ({}))
        
        // Merge admin-specific fields from /admin/badge-counts
        const adminData = adminBadgeCounts as any
        const sources = [adminData, adminData?.byCategory, adminData?.counts, adminData?.data]
        const adminKeys: (keyof BadgeCounts)[] = [
          'unreadNewParents', 'unreadNewTutors', 'pendingTutorApplications',
          'openComplaints', 'unreadMessages', 'unmatchedPaidEnrollments',
          'failedPayments', 'outstandingEnrollments', 'pendingGrades',
          'pendingChangeRequests', 'unscheduledWithin24h', 'attendanceUnmarkedSessions',
        ]
        for (const key of adminKeys) {
          for (const src of sources) {
            if (src && typeof src[key] === 'number') {
              ;(merged as any)[key] = src[key]
              break
            }
          }
        }
      }

      setCounts(merged)
    } catch (error) {
      console.error('Failed to load badge counts:', error)
      setCounts({})
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    loadCounts()

    // Refresh every 30 seconds
    const interval = setInterval(loadCounts, 30000)

    return () => clearInterval(interval)
  }, [loadCounts])

  // Function to trigger refresh (called on SSE events and route changes)
  const refresh = useCallback(() => {
    loadCounts()
  }, [loadCounts])

  return { counts, loading, refresh }
}

// Helper to format badge count with 99+ cap
export function formatBadgeCount(count?: number): string {
  if (count === undefined || count === null) return ''
  return count > 99 ? '99+' : count.toString()
}

// Helper to check if badge should be shown
export function hasBadge(count?: number): boolean {
  return count !== undefined && count > 0
}
