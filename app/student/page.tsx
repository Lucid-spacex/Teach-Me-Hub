'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Calendar,
  BookOpen,
  BarChart3,
  Clock,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  Video,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { api } from '@/lib/api'

export default function StudentDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [studentName, setStudentName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextClass, setNextClass] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [schedule, setSchedule] = useState<any[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    try {
      const user = getUser()
      if (!user || getUserRole() !== 'STUDENT') {
        router.push('/student-login')
        return
      }

      setStudentName(user.fullName || user.email?.split('@')[0] || 'Student')
      loadInitialData()
    } catch (err) {
      console.error('Error in student dashboard useEffect:', err)
      setError('Failed to initialize dashboard')
      setLoading(false)
    }
  }, [router])

  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextClassData, assignmentsData, attendanceDataRes, scheduleData] = await Promise.all([
        api.getStudentNextClass().catch(() => null),
        api.getStudentAssignments().catch(() => []),
        api.getStudentAttendanceSummary().catch(() => null),
        api.getStudentSchedule().catch(() => []),
      ])

      setNextClass(nextClassData)
      setAssignments(assignmentsData || [])
      setAttendanceData(attendanceDataRes)
      setSchedule(scheduleData || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load student data'
      setError(errorMessage)
      toast({
        title: 'Error',
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

  const getCountdown = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) return { text: 'Starting now / In progress', urgent: true }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return { text: `${days}d ${hours}h ${minutes}m`, urgent: false }
    if (hours > 0) return { text: `${hours}h ${minutes}m`, urgent: hours < 2 }
    return { text: `${minutes}m`, urgent: true }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-brand-gold/20 border-t-brand-gold animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Entering your classroom...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full bg-card border-red-500/30 rounded-2xl shadow-xl">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
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

  const pendingTasks = assignments.filter((a) => a.status === 'PENDING').length
  const submittedTasks = assignments.filter((a) => a.status === 'SUBMITTED' || a.status === 'GRADED').length
  const attendanceRate = attendanceData?.attendanceRate || 100

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-subtle via-brand-dark to-brand-card border border-brand-border p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-xs font-semibold text-brand-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Classroom Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Hello, <span className="text-brand-gold">{studentName}</span> 👋
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Check your next live tutoring class, complete your assignments, and review teacher feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/student/schedule">
              <Button
                variant="outline"
                className="border-brand-gold/40 bg-brand-subtle text-brand-goldLight hover:bg-brand-gold/10 hover:border-brand-gold font-semibold h-11 px-4 rounded-xl transition-all"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Full Schedule
              </Button>
            </Link>
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

      {/* Next Live Class Card */}
      {nextClass && nextClass.session ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-goldDark/20 via-brand-subtle to-brand-card border-2 border-brand-gold/40 p-6 shadow-[0_8px_30px_rgba(212,160,23,0.1)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-gold text-brand-dark text-xs font-bold uppercase tracking-wider">
                  Up Next
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  Starts in{' '}
                  <span className="font-semibold text-foreground">
                    {getCountdown(nextClass.session.scheduledAt).text}
                  </span>
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-brand-gold" />
                {nextClass.enrollment?.subject || nextClass.subject || 'Live Tutoring Session'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {new Date(nextClass.session.scheduledAt).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                • {nextClass.session.durationMinutes} Minutes Session
              </p>
            </div>

            {nextClass.session.zoomLink ? (
              <a
                href={nextClass.session.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-gold to-brand-goldLight hover:from-brand-goldLight hover:to-brand-goldAccent text-brand-dark font-bold text-sm shadow-[0_4px_20px_rgba(212,160,23,0.3)] transition-all transform active:scale-95"
              >
                <Video className="w-4 h-4 fill-black" />
                Join Live Classroom
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            ) : (
              <span className="text-xs text-muted-foreground italic">Link will be posted before class</span>
            )}
          </div>
        </div>
      ) : (
        <Card className="bg-card/70 border border-brand-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-subtle border border-brand-border flex items-center justify-center text-muted-foreground">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No Live Classes Scheduled Today</p>
              <p className="text-xs text-muted-foreground">
                You&apos;re all caught up! Check your schedule for upcoming sessions this week.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance */}
        <Link href="/student/attendance" className="block group">
          <Card className="bg-card/90 border border-brand-border hover:border-brand-gold/40 rounded-2xl transition-all duration-200 group-hover:-translate-y-0.5 overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Attendance Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-subtle border border-brand-border text-brand-gold flex items-center justify-center group-hover:border-brand-gold/40 group-hover:bg-brand-gold/10 transition-colors">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-foreground tracking-tight">{attendanceRate}%</p>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Excellent class attendance</p>
            </CardContent>
          </Card>
        </Link>

        {/* Pending Assignments */}
        <Link href="/student/assignments" className="block group">
          <Card className="bg-card/90 border border-brand-border hover:border-brand-gold/40 rounded-2xl transition-all duration-200 group-hover:-translate-y-0.5 overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Due Assignments
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-subtle border border-brand-border text-brand-gold flex items-center justify-center group-hover:border-brand-gold/40 group-hover:bg-brand-gold/10 transition-colors">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-foreground tracking-tight">{pendingTasks}</p>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Pending submission</p>
            </CardContent>
          </Card>
        </Link>

        {/* Completed Work */}
        <Link href="/student/assignments" className="block group">
          <Card className="bg-card/90 border border-brand-border hover:border-brand-gold/40 rounded-2xl transition-all duration-200 group-hover:-translate-y-0.5 overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Submitted Work
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-subtle border border-brand-border text-brand-gold flex items-center justify-center group-hover:border-brand-gold/40 group-hover:bg-brand-gold/10 transition-colors">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-foreground tracking-tight">{submittedTasks}</p>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Assignments evaluated</p>
            </CardContent>
          </Card>
        </Link>

        {/* Academic Grades */}
        <Link href="/student/grades" className="block group">
          <Card className="bg-card/90 border border-brand-border hover:border-brand-gold/40 rounded-2xl transition-all duration-200 group-hover:-translate-y-0.5 overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Performance
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-subtle border border-brand-border text-brand-gold flex items-center justify-center group-hover:border-brand-gold/40 group-hover:bg-brand-gold/10 transition-colors">
                <BarChart3 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-brand-gold tracking-tight">Active</p>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-gold transition-colors" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">View grade breakdown</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid: Schedule & Assignments */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <Card className="bg-card border border-brand-border rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-brand-subtle pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-gold" />
              Weekly Class Schedule
            </CardTitle>
            <Link
              href="/student/schedule"
              className="text-xs text-brand-gold hover:text-brand-goldLight font-medium flex items-center gap-1"
            >
              See All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {schedule.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">No classes scheduled for this period.</p>
              </div>
            ) : (
              schedule.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl bg-brand-subtle border border-brand-border flex items-center justify-between hover:border-brand-gold/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      {session.enrollment?.subject || session.subject || 'Live Class Session'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      session.status === 'SCHEDULED'
                        ? 'bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30'
                        : session.status === 'COMPLETED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card className="bg-card border border-brand-border rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-brand-subtle pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-gold" />
              Recent Homework & Assignments
            </CardTitle>
            <Link
              href="/student/assignments"
              className="text-xs text-brand-gold hover:text-brand-goldLight font-medium flex items-center gap-1"
            >
              See All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {assignments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">No active assignments assigned yet.</p>
              </div>
            ) : (
              assignments.slice(0, 4).map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-xl bg-brand-subtle border border-brand-border flex items-center justify-between hover:border-brand-gold/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                      {assignment.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Due:{' '}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : 'No deadline'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      assignment.status === 'PENDING'
                        ? 'bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30'
                        : assignment.status === 'SUBMITTED'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}