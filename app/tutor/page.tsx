'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { TutorStudentList } from '@/components/tutor/StudentList'
import { TutorSessionList } from '@/components/tutor/SessionList'
import { ProgressReportModal } from '@/components/tutor/ProgressReportModal'
import { TutorProfileModal } from '@/components/tutor/TutorProfileModal'
import { Enrollment, TutorProfile } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { FileText, UserCircle, RefreshCw, Users, Calendar, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
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

  const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE')
  const quickStats = [
    {
      label: 'Assigned Students',
      value: activeEnrollments.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Enrollments',
      value: activeEnrollments.length,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Upcoming Sessions',
      value: activeEnrollments.length, // Placeholder
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Profile Status',
      value: tutorProfile ? 'Complete' : 'Incomplete',
      icon: UserCircle,
      color: tutorProfile ? 'text-green-600' : 'text-orange-600',
      bgColor: tutorProfile ? 'bg-green-100' : 'bg-orange-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tutor Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your tutoring sessions and students</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setProfileModalOpen(true)}
              className="gap-2"
            >
              <UserCircle className="h-4 w-4" />
              {tutorProfile ? 'Edit Availability' : 'Create Profile'}
            </Button>
            <Button
              size="sm"
              onClick={() => setReportModalOpen(true)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Submit Report
            </Button>
          </div>
        </div>

        {/* Profile Warning */}
        {!tutorProfile && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-900">Profile Incomplete</p>
              <p className="text-sm text-orange-700 mt-1">
                Please complete your tutor profile to start receiving student assignments.
              </p>
            </div>
            <Button 
              size="sm" 
              onClick={() => setProfileModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Complete Profile
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main Content */}
        <div className="space-y-8">
          <TutorStudentList refreshTrigger={refreshTrigger} />
          <TutorSessionList refreshTrigger={refreshTrigger} />
        </div>
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
