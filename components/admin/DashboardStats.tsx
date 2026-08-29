'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { AdminOverview } from '@/lib/types'
import { StatCard } from '@/components/shared/StatCard'
import { Users, GraduationCap, Wallet, ClipboardList, Clock } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function DashboardStats() {
  const [stats, setStats] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await api.getAdminOverview()
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid admin overview response')
      }
      setStats(data)
    } catch (err) {
      console.error('Failed to load admin stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Dashboard stats not available yet</p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Active Students"
        value={stats.activeStudents}
        icon={Users}
      />
      <StatCard
        title="Active Tutors"
        value={stats.activeTutors}
        icon={GraduationCap}
      />
      <StatCard
        title="Revenue This Month"
        value={`$${stats.revenueThisMonth}`}
        icon={Wallet}
      />
      <StatCard
        title="Total Enrollments"
        value={stats.totalEnrollments}
        icon={ClipboardList}
      />
      <StatCard
        title="Pending Vetting"
        value={stats.pendingVetting}
        icon={Clock}
      />
    </div>
  )
}
