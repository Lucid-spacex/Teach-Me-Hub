'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { AdminOverview } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Wallet, ClipboardList, Clock, UserCheck, AlertCircle, DollarSign } from 'lucide-react'
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
        <LoadingSpinner className="text-brand-gold" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-400">Dashboard stats not available yet</p>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
    },
    {
      title: 'Total Tutors',
      value: stats.totalTutors,
      icon: UserCheck,
    },
    {
      title: 'Total Parents',
      value: stats.totalParents,
      icon: Users,
    },
    {
      title: 'Active Enrollments',
      value: stats.activeEnrollments,
      icon: ClipboardList,
    },
    {
      title: 'Pending Tutors',
      value: stats.pendingTutors,
      icon: Clock,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
    },
    {
      title: 'Failed Payments',
      value: stats.failedPayments,
      icon: AlertCircle,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-card border-brand-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <div className="bg-brand-gold/20 p-3 rounded-full">
                <stat.icon className="h-6 w-6 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
