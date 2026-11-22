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

      // Call GET /badge-counts for all roles (role-aware, own data only)
      const roleBadgeCounts = await api.getBadgeCounts().catch(() => ({}))
      const merged: BadgeCounts = {}

      // Map unreadNotifications categories
      if (roleBadgeCounts.unreadNotifications) {
        Object.assign(merged, roleBadgeCounts.unreadNotifications)
      }

      // Map role-specific fields
      if (role === 'PARENT') {
        merged.unpaidEnrollments = roleBadgeCounts.unpaidEnrollments
        merged.upcomingSessions24h = roleBadgeCounts.upcomingSessions24h
        merged.unreadMessages = roleBadgeCounts.unreadMessages
      } else if (role === 'TUTOR') {
        merged.sessionsNeedingScheduling = roleBadgeCounts.sessionsNeedingScheduling
        merged.classesWithin24h = roleBadgeCounts.classesWithin24h
        merged.draftOrRejectedGrades = roleBadgeCounts.draftOrRejectedGrades
        merged.unmarkedAttendance = roleBadgeCounts.unmarkedAttendance
        merged.submissionsToScore = roleBadgeCounts.submissionsToScore
        merged.unreadMessages = roleBadgeCounts.unreadMessages
      } else if (role === 'STUDENT') {
        merged.pendingAssignments = roleBadgeCounts.pendingAssignments
        merged.classesWithin24h = roleBadgeCounts.classesWithin24h
      } else if (role === 'ADMIN') {
        // Admin: also call GET /admin/badge-counts for additional admin-specific counts
        const adminBadgeCounts = await api.getAdminBadgeCounts().catch(() => ({}))
        
        // Merge role badge counts
        Object.assign(merged, {
          pendingTutorApplications: roleBadgeCounts.pendingTutorApplications,
          pendingGrades: roleBadgeCounts.pendingGrades,
          openComplaints: roleBadgeCounts.openComplaints,
          unmatchedPaidEnrollments: roleBadgeCounts.unmatchedPaidEnrollments,
          pendingChangeRequests: roleBadgeCounts.pendingChangeRequests,
          unscheduledWithin24h: roleBadgeCounts.unscheduledWithin24h,
          failedPayments: roleBadgeCounts.failedPayments,
          outstandingEnrollments: roleBadgeCounts.outstandingEnrollments,
          unreadMessages: roleBadgeCounts.unreadMessages,
          attendanceUnmarkedSessions: roleBadgeCounts.attendanceUnmarkedSessions,
        })

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
