'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { UnmatchedEnrollmentsList } from '@/components/admin/UnmatchedEnrollmentsList'
import { FailedPaymentsList } from '@/components/admin/FailedPaymentsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Shield, Users, GraduationCap, CreditCard, AlertCircle, Sparkles, ArrowUpRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { api } from '@/lib/api'

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [overview, setOverview] = useState<any>(null)

  useEffect(() => {
    try {
      const user = getUser()
      if (!user || getUserRole() !== 'ADMIN') {
        router.push('/login')
        return
      }

      loadInitialData()
    } catch (err) {
      console.error('Error in admin dashboard useEffect:', err)
      setError('Failed to initialize dashboard')
      setLoading(false)
    }
  }, [router])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const overviewData = await api.getAdminOverview()
      setOverview(overviewData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    loadInitialData()
    toast({
      title: "Refreshed",
      description: "Dashboard data has been refreshed",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-destructive p-6 rounded-2xl mb-4 border border-destructive/20">
              <p className="font-medium">Failed to load dashboard</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button onClick={handleRefresh} className="gap-2 bg-brand-gold hover:bg-brand-goldLight text-black">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quickStats = [
    {
      label: 'Total Users',
      value: overview?.totalUsers || 0,
      icon: Users,
    },
    {
      label: 'Total Students',
      value: overview?.totalStudents || 0,
      icon: GraduationCap,
    },
    {
      label: 'Total Tutors',
      value: overview?.totalTutors || 0,
      icon: Shield,
    },
    {
      label: 'Pending Vetting',
      value: overview?.pendingTutors || 0,
      icon: AlertCircle,
    },
  ]

  const adminActions = [
    {
      label: 'Pending Tutors',
      description: 'Review and approve tutor applications',
      icon: GraduationCap,
      href: '/admin/tutors/pending',
    },
    {
      label: 'All Tutors',
      description: 'View all tutors across the platform',
      icon: Users,
      href: '/admin/tutors',
    },
    {
      label: 'Manage Enrollments',
      description: 'Assign tutors to unmatched enrollments',
      icon: Users,
      href: '/admin/enrollments',
    },
    {
      label: 'Pricing Tiers',
      description: 'Manage pricing and exchange rates',
      icon: CreditCard,
      href: '/admin/pricing',
    },
  ]

  return (
    <div className="space-y-8 pb-12">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-subtle to-brand-card border border-brand-border p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-xs font-semibold text-brand-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Portal Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Welcome back, <span className="text-brand-gold">Admin</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Platform overview and management — monitor users, students, and enrollments across the entire system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-brand-gold text-brand-gold bg-transparent hover:bg-brand-gold/10 font-semibold h-11 px-5 rounded-xl transition-all flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="group border border-border hover:border-primary/50 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminActions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="group block bg-card border border-border hover:border-primary/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors flex-shrink-0">
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{action.label}</h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <DashboardStats />

        <div className="grid gap-8 lg:grid-cols-2">
          <UnmatchedEnrollmentsList onUpdate={handleRefresh} refreshTrigger={refreshTrigger} />
        </div>

        <FailedPaymentsList />
      </div>
    </div>
  )
}