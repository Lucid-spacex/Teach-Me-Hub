'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { StudentList } from '@/components/parent/StudentList'
import { EnrollmentList } from '@/components/parent/EnrollmentList'
import { SessionList } from '@/components/parent/SessionList'
import { ProgressReports } from '@/components/parent/ProgressReports'
import { AddStudentModal } from '@/components/parent/AddStudentModal'
import { EnrollStudentModal } from '@/components/parent/EnrollStudentModal'
import { Student, Enrollment } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users, GraduationCap, Calendar, FileText, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function ParentDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false)
  const [enrollStudentModalOpen, setEnrollStudentModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    try {
      const user = getUser()
      if (!user || getUserRole() !== 'PARENT') {
        router.push('/login')
        return
      }

      loadInitialData()
    } catch (err) {
      console.error('Error in parent dashboard useEffect:', err)
      setError('Failed to initialize dashboard')
      setLoading(false)
    }
  }, [router])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [studentsData, enrollmentsData] = await Promise.all([
        api.getStudents(),
        api.getEnrollments()
      ])
      setStudents(studentsData)
      setEnrollments(enrollmentsData)
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
            <div className="bg-destructive/10 text-destructive p-6 rounded-2xl mb-4 border border-destructive/20">
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

  const quickStats = [
    {
      label: 'Children',
      value: students.length,
      icon: Users,
      color: 'text-sky-700',
      bgColor: 'bg-sky-100',
      ring: 'ring-sky-200/60',
    },
    {
      label: 'Active Enrollments',
      value: enrollments.filter(e => e.status === 'ACTIVE').length,
      icon: GraduationCap,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      ring: 'ring-emerald-200/60',
    },
    {
      label: 'Upcoming Sessions',
      value: enrollments.filter(e => e.status === 'ACTIVE').length, // Placeholder
      icon: Calendar,
      color: 'text-violet-700',
      bgColor: 'bg-violet-100',
      ring: 'ring-violet-200/60',
    },
    {
      label: 'Progress Reports',
      value: enrollments.length, // Placeholder
      icon: FileText,
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      ring: 'ring-amber-200/60',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-background to-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-r from-sky-500/10 via-amber-200/20 to-amber-100/30 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 ring-1 ring-sky-200/60">
                Parent Portal
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-2 max-w-md text-muted-foreground leading-relaxed">
                Follow along with your children&apos;s tutoring journey — sessions, progress, and everything in between.
              </p>
            </div>
            <div className="flex gap-2 self-start sm:self-auto">
              <Button
                onClick={() => setAddStudentModalOpen(true)}
                variant="default"
                size="sm"
                className="gap-2 bg-background/70 backdrop-blur"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
              <Button
                onClick={handleRefresh}
                variant="default"
                size="sm"
                className="gap-2 bg-background/70 backdrop-blur"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} rounded-2xl p-3 ring-4 ${stat.ring} transition-transform group-hover:scale-105`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <StudentList
            onAddStudent={() => setAddStudentModalOpen(true)}
            refreshTrigger={refreshTrigger}
          />

          <EnrollmentList
            students={students}
            onEnrollStudent={() => setEnrollStudentModalOpen(true)}
            refreshTrigger={refreshTrigger}
          />

          <SessionList
            enrollments={enrollments}
            refreshTrigger={refreshTrigger}
          />

          <ProgressReports
            enrollments={enrollments}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      <AddStudentModal
        open={addStudentModalOpen}
        onOpenChange={setAddStudentModalOpen}
        onSuccess={handleRefresh}
      />

      <EnrollStudentModal
        open={enrollStudentModalOpen}
        onOpenChange={setEnrollStudentModalOpen}
        students={students}
        onSuccess={handleRefresh}
      />
    </div>
  )
}