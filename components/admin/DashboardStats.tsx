'use client'

import { AdminOverview } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Wallet, ClipboardList, Clock, UserCheck, AlertCircle, DollarSign } from 'lucide-react'

interface DashboardStatsProps {
  overview: AdminOverview | null
}

export function DashboardStats({ overview }: DashboardStatsProps) {
  if (!overview) return null

  const statCards = [
    {
      title: 'Total Users',
      value: overview.totalUsers,
      icon: Users,
    },
    {
      title: 'Total Students',
      value: overview.totalStudents,
      icon: GraduationCap,
    },
    {
      title: 'Total Tutors',
      value: overview.totalTutors,
      icon: UserCheck,
    },
    {
      title: 'Total Parents',
      value: overview.totalParents,
      icon: Users,
    },
    {
      title: 'Active Enrollments',
      value: overview.activeEnrollments,
      icon: ClipboardList,
    },
    {
      title: 'Pending Tutors',
      value: overview.pendingTutors,
      icon: Clock,
    },
    {
      title: 'Total Revenue',
      value: `$${overview.totalRevenue}`,
      icon: DollarSign,
    },
    {
      title: 'Failed Payments',
      value: overview.failedPayments || 0,
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
