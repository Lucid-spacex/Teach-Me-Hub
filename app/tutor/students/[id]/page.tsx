'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { TutorStudent, Session, ProgressReport, Grade, Enrollment } from '@/lib/types'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Plus,
  RefreshCw,
  MessageSquare,
  FileText,
  Award,
  ExternalLink,
  BookOpen,
  School,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Trash2,
  Loader2,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TutorStudentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const studentId = resolvedParams.id
  const router = useRouter()
  const { toast } = useToast()

  const [tutorStudent, setTutorStudent] = useState<TutorStudent | null>(null)
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  // Scheduling modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduleEnrollmentId, setScheduleEnrollmentId] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleDuration, setScheduleDuration] = useState('60')

  // Rescheduling modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [sessionToReschedule, setSessionToReschedule] = useState<Session | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleDuration, setRescheduleDuration] = useState('60')

  // Delete session state
  const [deletingSession, setDeletingSession] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadData()
  }, [studentId, router])

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Get tutor's assigned students
      const assigned = await api.getTutorStudents().catch(() => [])
      const matches = assigned.filter(item => item.student?.id === studentId)

      if (matches.length === 0) {
        toast({
          title: 'Student Not Found',
          description: 'This student is not assigned to your tutor account.',
          variant: 'destructive',
        })
        router.push('/tutor/students')
        return
      }

      setTutorStudent(matches[0])
      const enrollmentsList = matches.map(m => m.enrollment).filter(Boolean)
      setAllEnrollments(enrollmentsList)
      if (enrollmentsList.length > 0 && !scheduleEnrollmentId) {
        setScheduleEnrollmentId(enrollmentsList[0].id)
      }

      // 2. Fetch sessions for tutor and filter for this student's enrollments
      const enrollmentIds = new Set(enrollmentsList.map(e => e.id))
      const allSessions = await api.getTutorSessions().catch(() => [])
      const studentSessions = allSessions.filter(s => enrollmentIds.has(s.enrollmentId))
      setSessions(studentSessions)

      // 3. Fetch progress reports and grades for these enrollments
      const reportPromises = enrollmentsList.map(e => api.getProgressReports(e.id).catch(() => []))
      const gradePromises = enrollmentsList.map(e => api.getGrades(e.id).catch(() => []))

      const [reportsArrays, gradesArrays] = await Promise.all([
        Promise.all(reportPromises),
        Promise.all(gradePromises),
      ])

      setProgressReports(reportsArrays.flat())
      setGrades(gradesArrays.flat())
    } catch (err) {
      console.error('Failed to load student details:', err)
      toast({
        title: 'Error',
        description: 'Failed to load student details and sessions.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle scheduling a new session via POST /tutor/sessions
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!scheduleEnrollmentId) {
      toast({
        title: 'Validation Error',
        description: 'Please select an enrollment/subject.',
        variant: 'destructive',
      })
      return
    }

    if (!scheduleDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select a date and time for the session.',
        variant: 'destructive',
      })
      return
    }

    const scheduledDateObj = new Date(scheduleDate)
    if (isNaN(scheduledDateObj.getTime())) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid date and time.',
        variant: 'destructive',
      })
      return
    }

    setScheduling(true)
    try {
      await api.createTutorSession({
        enrollmentId: scheduleEnrollmentId,
        scheduledAt: scheduledDateObj.toISOString(),
        durationMinutes: parseInt(scheduleDuration, 10) || 60,
      })

      toast({
        title: 'Session Scheduled',
        description: 'New session scheduled successfully with Zoom meeting details.',
      })

      setScheduleModalOpen(false)
      setScheduleDate('')
      await loadData()
    } catch (err: any) {
      console.error('Schedule error:', err)
      toast({
        title: 'Scheduling Failed',
        description: err instanceof Error ? err.message : 'Could not schedule session.',
        variant: 'destructive',
      })
    } finally {
      setScheduling(false)
    }
  }

  // Handle opening reschedule modal
  const openRescheduleModal = (session: Session) => {
    setSessionToReschedule(session)
    // Pre-populate with current scheduled date formatted for datetime-local
    try {
      const dt = new Date(session.scheduledAt)
      const pad = (n: number) => n.toString().padStart(2, '0')
      const formatted = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
      setRescheduleDate(formatted)
      setRescheduleDuration(session.durationMinutes.toString())
    } catch {
      setRescheduleDate('')
      setRescheduleDuration('60')
    }
    setRescheduleModalOpen(true)
  }

  // Handle rescheduling existing session via PATCH /tutor/sessions/:id/reschedule
  const handleRescheduleSession = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionToReschedule) return

    if (!rescheduleDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select the new date and time for the session.',
        variant: 'destructive',
      })
      return
    }

    const newDateObj = new Date(rescheduleDate)
    if (isNaN(newDateObj.getTime())) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid date and time.',
        variant: 'destructive',
      })
      return
    }

    setRescheduling(true)
    try {
      await api.rescheduleTutorSession(sessionToReschedule.id, {
        scheduledAt: newDateObj.toISOString(),
        durationMinutes: parseInt(rescheduleDuration, 10) || 60,
      })

      toast({
        title: 'Session Rescheduled',
        description: 'The session has been updated and the student notified.',
      })

      setRescheduleModalOpen(false)
      setSessionToReschedule(null)
      await loadData()
    } catch (err: any) {
      console.error('Reschedule error:', err)
      toast({
        title: 'Rescheduling Failed',
        description: err instanceof Error ? err.message : 'Could not reschedule session.',
        variant: 'destructive',
      })
    } finally {
      setRescheduling(false)
    }
  }

  // Handle deleting session (only if created by tutor)
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }

    setDeletingSession(sessionId)
    try {
      await api.deleteSession(sessionId)
      toast({
        title: 'Session Deleted',
        description: 'The session has been deleted successfully.',
      })
      await loadData()
    } catch (error) {
      console.error('Failed to delete session:', error)
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete session',
        variant: 'destructive',
      })
    } finally {
      setDeletingSession(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
                <div className="flex flex-col items-center justify-center min-h-[450px]">
          <LoadingSpinner size="lg" className="text-brand-gold mb-3" />
          <p className="text-sm text-muted-foreground">Loading student profile &amp; sessions...</p>
        </div>
      </div>
    )
  }

  if (!tutorStudent) return null

  const student = tutorStudent.student
  const upcomingSessions = sessions
    .filter(s => s.status === 'SCHEDULED' && new Date(s.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const pastSessions = sessions
    .filter(s => s.status !== 'SCHEDULED' || new Date(s.scheduledAt) < new Date())
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tutor/students')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assigned Students
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              onClick={() => setScheduleModalOpen(true)}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-bold gap-1.5"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Schedule Session
            </Button>
          </div>
        </div>

        {/* Student Profile Card */}
        <Card className="bg-card border-brand-gold/30 overflow-hidden shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 border border-brand-gold/40 text-brand-gold flex items-center justify-center text-2xl font-bold font-serif shrink-0">
                  {student.fullName.charAt(0)}
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {student.fullName}
                    </h1>
                    <Badge variant="outline" className="border-brand-gold/40 text-brand-gold bg-brand-gold/10">
                      {student.actualGrade?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                    {student.school && (
                      <span className="flex items-center gap-1.5">
                        <School className="h-4 w-4 text-brand-gold" />
                        {student.school}
                      </span>
                    )}
                    {student.dateOfBirth && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-brand-gold" />
                        DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/tutor/messages')}
                  className="gap-1.5 text-xs h-9"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Messages
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/tutor/grades')}
                  className="gap-1.5 text-xs h-9"
                >
                  <Award className="h-3.5 w-3.5" />
                  Grades
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/tutor/progress-reports')}
                  className="gap-1.5 text-xs h-9"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Progress Report
                </Button>
              </div>
            </div>

            {student.notes && (
              <div className="mt-5 pt-5 border-t border-border/40 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Learning Notes: </span>
                {student.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrolled Subjects with this Tutor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allEnrollments.map(enrollment => (
            <Card key={enrollment.id} className="bg-card border-brand-gold/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-brand-gold" />
                    {enrollment.subject?.name || 'Assigned Subject'}
                  </h4>
                  <StatusBadge status={enrollment.status} />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Frequency: <span className="text-foreground">{enrollment.sessionFrequency}</span></p>
                  <p>Started: <span className="text-foreground">{new Date(enrollment.startDate).toLocaleDateString()}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Sessions Section with Reschedule */}
        <Card className="bg-card border-brand-gold/30">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-gold" />
                  Upcoming Sessions ({upcomingSessions.length})
                </CardTitle>
                <CardDescription>
                  Sessions scheduled with Zoom meetings. You can reschedule or adjust timings anytime.
                </CardDescription>
              </div>
              <Button
                onClick={() => setScheduleModalOpen(true)}
                size="sm"
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-bold text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                New Session
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            {upcomingSessions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-3">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-medium">No upcoming sessions scheduled</p>
                <Button
                  onClick={() => setScheduleModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                >
                  Schedule First Session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-brand-gold/25 bg-brand-gold/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          at {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <StatusBadge status={session.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Duration: {session.durationMinutes} minutes
                        {session.homeworkAssigned && (
                          <span className="ml-3 text-brand-gold font-medium">
                            • Homework: {session.homeworkAssigned}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {session.zoomLink && (
                        <a
                          href={session.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/25 font-semibold text-xs transition-colors"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Start Zoom
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRescheduleModal(session)}
                        className="text-xs h-8 border-border hover:bg-accent"
                      >
                        <Clock className="h-3.5 w-3.5 mr-1 text-brand-gold" />
                        Reschedule
                      </Button>
                      {/* Only show delete for tutor-created sessions */}
                      {session.createdBy !== 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSession(session.id)}
                          disabled={deletingSession === session.id}
                          className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {deletingSession === session.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Sessions History */}
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Past &amp; Completed Sessions ({pastSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {pastSessions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No past sessions recorded yet for this student.
              </div>
            ) : (
              <div className="space-y-3">
                {pastSessions.map(session => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-lg border border-border/50 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {new Date(session.scheduledAt).toLocaleDateString()}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.durationMinutes} mins)
                        </span>
                        <StatusBadge status={session.status} />
                      </div>
                      {session.tutorNotes && (
                        <p className="text-muted-foreground mt-1 italic">
                          Notes: {session.tutorNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {session.recordingLink && (
                        <a
                          href={session.recordingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-gold hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Recording
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule New Session Modal */}
      <Modal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title="Schedule New Session"
        description="Select the subject and scheduled time. Zoom meeting link will be automatically generated."
      >
        <form onSubmit={handleScheduleSession} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="enrollment">Enrolled Subject *</Label>
            <Select
              value={scheduleEnrollmentId}
              onValueChange={setScheduleEnrollmentId}
            >
              <SelectTrigger id="enrollment">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {allEnrollments.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.subject?.name || e.subjectId} ({e.sessionFrequency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date &amp; Time *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Minutes)</Label>
            <Select
              value={scheduleDuration}
              onValueChange={setScheduleDuration}
            >
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                <SelectItem value="90">90 minutes (1.5 hours)</SelectItem>
                <SelectItem value="120">120 minutes (2 hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setScheduleModalOpen(false)}
              disabled={scheduling}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={scheduling}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-bold"
            >
              {scheduling ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Scheduling...
                </>
              ) : (
                'Confirm & Create Session'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Session Modal */}
      <Modal
        open={rescheduleModalOpen}
        onOpenChange={setRescheduleModalOpen}
        title="Reschedule Session"
        description="Choose a new date and time for this tutoring session."
      >
        <form onSubmit={handleRescheduleSession} className="space-y-4 pt-2">
          {sessionToReschedule && (
            <div className="p-3 rounded-lg bg-brand-subtle/50 text-xs text-muted-foreground border border-brand-gold/20">
              <span className="font-semibold text-foreground">Current Time: </span>
              {new Date(sessionToReschedule.scheduledAt).toLocaleString()}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rescheduleAt">New Date &amp; Time *</Label>
            <Input
              id="rescheduleAt"
              type="datetime-local"
              value={rescheduleDate}
              onChange={e => setRescheduleDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rescheduleDuration">Duration (Minutes)</Label>
            <Select
              value={rescheduleDuration}
              onValueChange={setRescheduleDuration}
            >
              <SelectTrigger id="rescheduleDuration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                <SelectItem value="90">90 minutes (1.5 hours)</SelectItem>
                <SelectItem value="120">120 minutes (2 hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRescheduleModalOpen(false)}
              disabled={rescheduling}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={rescheduling}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-bold"
            >
              {rescheduling ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Save New Time'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
