'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { DashboardStats } from '@/components/admin/DashboardStats'
// import { PendingTutorsList } from '@/components/admin/PendingTutorsList'
import { UnmatchedEnrollmentsList } from '@/components/admin/UnmatchedEnrollmentsList'
import { FailedPaymentsList } from '@/components/admin/FailedPaymentsList'
import { Button } from '@/components/ui/button'
import { RefreshCw, Shield, Users, GraduationCap, CreditCard } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    try {
      const user = getUser()
      if (!user || getUserRole() !== 'ADMIN') {
        router.push('/login')
        return
      }

      setLoading(false)
    } catch (err) {
      console.error('Error in admin dashboard useEffect:', err)
      setError('Failed to initialize dashboard')
      setLoading(false)
    }
  }, [])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    toast({
      title: "Refreshed",
      description: "Dashboard data has been refreshed",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center max-w-md">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-4">
              <p className="font-medium">Failed to load dashboard</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const adminActions = [
    // {
    //   label: 'Pending Tutors',
    //   description: 'Review and approve tutor applications',
    //   icon: GraduationCap,
    //   href: '/admin/tutors',
    //   color: 'text-blue-600',
    //   bgColor: 'bg-blue-100',
    // },
    {
      label: 'All Tutors',
      description: 'View all tutors across the platform',
      icon: GraduationCap,
      href: '/admin/all-tutors',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    {
      label: 'Manage Enrollments',
      description: 'Assign tutors to unmatched enrollments',
      icon: Users,
      href: '/admin/enrollments',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'All Students',
      description: 'View all enrolled students',
      icon: Users,
      href: '/admin/students',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Failed Payments',
      description: 'Review and handle payment issues',
      icon: CreditCard,
      href: '#',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Platform overview and management</p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="default" 
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {adminActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="bg-card rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`${action.bgColor} ${action.color} p-3 rounded-lg flex-shrink-0`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{action.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
        
        {/* Main Content */}
        <div className="space-y-8">
          <DashboardStats />
          
          <div className="grid gap-8 lg:grid-cols-2">
            {/* <PendingTutorsList onUpdate={handleRefresh} refreshTrigger={refreshTrigger} /> */}
            <UnmatchedEnrollmentsList onUpdate={handleRefresh} refreshTrigger={refreshTrigger} />
          </div>
          
          <FailedPaymentsList />
        </div>
      </div>
    </div>
  )
}