'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { TutorStudentList } from '@/components/tutor/StudentList'
import { TutorSessionList } from '@/components/tutor/SessionList'
import { ProgressReportModal } from '@/components/tutor/ProgressReportModal'
import { TutorProfileModal } from '@/components/tutor/TutorProfileModal'
import { Enrollment, TutorProfile } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { FileText, UserCircle, RefreshCw, Users, Calendar, Clock, AlertCircle, Sparkles, ArrowUpRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TutorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    try {
      const user = getUser()
      if (!user || getUserRole() !== 'TUTOR') {
        router.push('/login')
        return
      }

      loadInitialData()
    } catch (err) {
      console.error('Error in tutor dashboard useEffect:', err)
      setError('Failed to initialize dashboard')
      setLoading(false)
    }
  }, [router])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [enrollmentsData] = await Promise.all([
        api.getEnrollments()
      ])
      setEnrollments(enrollmentsData.filter(e => e.tutorId !== null))

      // Try to load tutor profile
      try {
        const profileData = await api.getTutorStudents()
        if (profileData.length > 0) {
          // Create a minimal valid profile if students exist
          setTutorProfile({
            id: 'temp',
            userId: 'temp',
            subjects: [],
            bio: '',
            credentialsUrl: null,
            vettingStatus: 'PENDING',
            hourlyRate: 0,
            availability: {},
            createdAt: new Date().toISOString()
          })
        }
      } catch {
        setTutorProfile(null)
      }
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
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

  const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE')
  const quickStats = [
    {
      label: 'Assigned Students',
      value: activeEnrollments.length,
      icon: Users,
    },
    {
      label: 'Active Enrollments',
      value: activeEnrollments.length,
      icon: Calendar,
    },
    {
      label: 'Upcoming Sessions',
      value: activeEnrollments.length,
      icon: Clock,
    },
    {
      label: 'Profile Status',
      value: tutorProfile ? 'Complete' : 'Incomplete',
      icon: UserCircle,
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
              <span>Tutor Portal Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Welcome back, <span className="text-brand-gold">Tutor</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Manage your tutoring sessions, monitor student progress, submit reports, and track your active assignments.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setProfileModalOpen(true)}
              className="bg-brand-gold hover:bg-brand-goldLight text-black font-bold h-11 px-5 rounded-xl shadow-[0_4px_16px_rgba(243,195,63,0.35)] transition-all flex items-center gap-2"
            >
              <UserCircle className="h-4 w-4" />
              {tutorProfile ? 'Edit Availability' : 'Create Profile'}
            </Button>
            <Button
              onClick={() => setReportModalOpen(true)}
              variant="outline"
              className="border-brand-gold text-brand-gold bg-transparent hover:bg-brand-gold/10 font-semibold h-11 px-5 rounded-xl transition-all flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Submit Report
            </Button>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground h-11 px-3 rounded-xl"
              title="Refresh Dashboard"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Warning */}
      {!tutorProfile && (
        <Card className="bg-amber-50 dark:bg-brand-gold/10 border-amber-300 dark:border-brand-gold/30 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-brand-gold flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Profile Incomplete</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please complete your tutor profile to start receiving student assignments.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setProfileModalOpen(true)}
                className="bg-brand-gold hover:bg-brand-goldLight text-black rounded-xl shrink-0"
              >
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="group border border-border hover:border-brand-gold/50 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
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

      {/* Main Content */}
      <div className="space-y-8">
        <TutorStudentList refreshTrigger={refreshTrigger} />
        <TutorSessionList refreshTrigger={refreshTrigger} />
      </div>

      <ProgressReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        enrollments={enrollments}
        onSuccess={handleRefresh}
      />

      <TutorProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        existingProfile={tutorProfile}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
