'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { UnreadCountResponse } from '@/lib/types'
import { getUserRole } from '@/lib/auth'

export interface BadgeCounts {
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
  // Admin-specific badges
  unreadNewParents?: number
  unreadNewTutors?: number
  pendingTutorApplications?: number
  openComplaints?: number
  unreadMessages?: number
  unmatchedPaidEnrollments?: number
  failedPayments?: number
  pendingGrades?: number
  pendingChangeRequests?: number
  unscheduledWithin24h?: number
}

export function useBadgeCounts() {
  const [counts, setCounts] = useState<BadgeCounts>({})
  const [loading, setLoading] = useState(true)
  const role = getUserRole()

  const loadCounts = useCallback(async () => {
    try {
      setLoading(true)

      if (role === 'ADMIN') {
        // Admin: combine notification counts with admin badge counts
        const [notificationCounts, adminBadgeCounts] = await Promise.all([
          api.getUnreadCount().catch(() => ({ byCategory: {} })),
          api.getAdminBadgeCounts().catch(() => ({ byCategory: {} }))
        ])

        const merged: BadgeCounts = {
          ...notificationCounts.byCategory,
          ...adminBadgeCounts.byCategory,
        }

        // Map admin-specific fields from response (if available)
        const adminData = adminBadgeCounts as any
        if (adminData.unreadNewParents !== undefined) merged.unreadNewParents = adminData.unreadNewParents
        if (adminData.unreadNewTutors !== undefined) merged.unreadNewTutors = adminData.unreadNewTutors
        if (adminData.pendingTutorApplications !== undefined) merged.pendingTutorApplications = adminData.pendingTutorApplications
        if (adminData.openComplaints !== undefined) merged.openComplaints = adminData.openComplaints
        if (adminData.unmatchedPaidEnrollments !== undefined) merged.unmatchedPaidEnrollments = adminData.unmatchedPaidEnrollments
        if (adminData.failedPayments !== undefined) merged.failedPayments = adminData.failedPayments
        if (adminData.pendingGrades !== undefined) merged.pendingGrades = adminData.pendingGrades
        if (adminData.pendingChangeRequests !== undefined) merged.pendingChangeRequests = adminData.pendingChangeRequests
        if (adminData.unscheduledWithin24h !== undefined) merged.unscheduledWithin24h = adminData.unscheduledWithin24h

        setCounts(merged)
      } else {
        // Parent, Tutor, Student: use notification counts only
        const notificationCounts = await api.getUnreadCount().catch(() => ({ byCategory: {} }))
        setCounts(notificationCounts.byCategory || {})
      }
    } catch (error) {
      console.error('Failed to load badge counts:', error)
      // If admin badge counts fail, fall back to notification counts alone
      if (role === 'ADMIN') {
        try {
          const notificationCounts = await api.getUnreadCount().catch(() => ({ byCategory: {} }))
          setCounts(notificationCounts.byCategory || {})
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          setCounts({})
        }
      } else {
        setCounts({})
      }
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
