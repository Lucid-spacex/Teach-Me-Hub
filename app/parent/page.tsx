'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { StudentList } from '@/components/parent/StudentList'
import { EnrollmentList } from '@/components/parent/EnrollmentList'
import { SessionList } from '@/components/parent/SessionList'
import { ProgressReports } from '@/components/parent/ProgressReports'
import { AddStudentModal } from '@/components/parent/AddStudentModal'
import { EnrollStudentModal } from '@/components/parent/EnrollStudentModal'
import { Student, Enrollment } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  Plus,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ParentDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [userName, setUserName] = useState<string>('')
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

      setUserName(user.fullName || user.email?.split('@')[0] || 'Parent')
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
        api.getEnrollments(),
      ])
      setStudents(studentsData || [])
      setEnrollments(enrollmentsData || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      toast({
        title: 'Dashboard Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
    loadInitialData()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-brand-gold/20 border-t-brand-gold animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Preparing your family learning hub...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full bg-card border-red-500/30 rounded-2xl shadow-xl">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Failed to Load Dashboard</h3>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              onClick={handleRefresh}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold rounded-xl"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE').length
  const pendingEnrollments = enrollments.filter((e) => e.status === 'PENDING_PAYMENT').length

  const quickStats = [
    {
      label: 'Registered Children',
      value: students.length,
      icon: Users,
      desc: 'Active student profiles',
      href: '/parent/students',
    },
    {
      label: 'Active Enrollments',
      value: activeEnrollments,
      icon: GraduationCap,
      desc: `${pendingEnrollments} pending match`,
      href: '/parent/enrollments',
    },
    {
      label: 'Live Tutoring Sessions',
      value: activeEnrollments,
      icon: Calendar,
      desc: 'Scheduled weekly classes',
      href: '/parent/sessions',
    },
    {
      label: 'Progress Reports',
      value: enrollments.length,
      icon: FileText,
      desc: 'Teacher evaluations',
      href: '/parent/grades',
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-subtle via-brand-dark to-brand-card border border-brand-border p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-xs font-semibold text-brand-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parent Portal Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Welcome back, <span className="text-brand-gold">{userName}</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Track your children&apos;s academic journey, monitor live sessions, review tutor evaluations, and manage enrollment fees all in one place.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setAddStudentModalOpen(true)}
              className="bg-gradient-to-r from-brand-gold to-brand-goldLight hover:from-brand-goldLight hover:to-brand-goldAccent text-brand-dark font-bold h-11 px-4 rounded-xl shadow-[0_4px_20px_rgba(212,160,23,0.25)] transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Add Child
            </Button>
            <Button
              onClick={() => setEnrollStudentModalOpen(true)}
              variant="outline"
              className="border-brand-gold/40 bg-brand-subtle text-brand-goldLight hover:bg-brand-gold/10 hover:border-brand-gold font-semibold h-11 px-4 rounded-xl transition-all flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Enroll Subject
            </Button>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-white/5 h-11 px-3 rounded-xl"
              title="Refresh Dashboard"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="group block">
              <Card className="bg-card/90 border border-brand-border hover:border-brand-gold/40 rounded-2xl transition-all duration-200 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(212,160,23,0.06)] group-hover:-translate-y-0.5 overflow-hidden">
                <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle border border-brand-border text-brand-gold flex items-center justify-center group-hover:border-brand-gold/40 group-hover:bg-brand-gold/10 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Links Row: Payments, Assignments, Messages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/parent/payments"
          className="p-4 rounded-2xl bg-gradient-to-b from-brand-subtle to-brand-dark border border-brand-border hover:border-brand-gold/40 transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground group-hover:text-brand-gold transition-colors">
                Payment Center
              </p>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground truncate">Pay tuition fees & check invoices</p>
          </div>
        </Link>

        <Link
          href="/parent/assignments"
          className="p-4 rounded-2xl bg-gradient-to-b from-brand-subtle to-brand-dark border border-brand-border hover:border-brand-gold/40 transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground group-hover:text-brand-gold transition-colors">
                Assignments & Homework
              </p>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground truncate">Review completed and pending tasks</p>
          </div>
        </Link>

        <Link
          href="/parent/messages"
          className="p-4 rounded-2xl bg-gradient-to-b from-brand-subtle to-brand-dark border border-brand-border hover:border-brand-gold/40 transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground group-hover:text-brand-gold transition-colors">
                Teacher Messages
              </p>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground truncate">Direct communication with tutors</p>
          </div>
        </Link>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* Children List */}
        <section className="space-y-4">
          <StudentList
            onAddStudent={() => setAddStudentModalOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        </section>

        {/* Enrollments */}
        <section className="space-y-4">
          <EnrollmentList
            students={students}
            onEnrollStudent={() => setEnrollStudentModalOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        </section>

        {/* Upcoming Sessions */}
        <section className="space-y-4">
          <SessionList enrollments={enrollments} refreshTrigger={refreshTrigger} />
        </section>

        {/* Academic Progress */}
        <section className="space-y-4">
          <ProgressReports enrollments={enrollments} refreshTrigger={refreshTrigger} />
        </section>
      </div>

      {/* Interactive Modals */}
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