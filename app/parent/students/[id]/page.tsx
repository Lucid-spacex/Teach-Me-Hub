'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Student, Enrollment, Session, ProgressReport, Grade } from '@/lib/types'
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  Key,
  RefreshCw,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  School,
  User,
  Shield,
  ExternalLink,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

interface AssignedTutorInfo {
  id: string
  fullName: string
  email?: string
  bio?: string
  subjects: string[]
  sessions: Session[]
}

export default function ParentStudentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const studentId = resolvedParams.id
  const router = useRouter()
  const { toast } = useToast()

  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [regeneratingPin, setRegeneratingPin] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'sessions' | 'academics'>('overview')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'PARENT') {
      router.push('/login')
      return
    }

    loadStudentData()
  }, [studentId, router])

  const loadStudentData = async () => {
    setLoading(true)
    try {
      // 1. Fetch parent's students to locate this child
      const studentsData = await api.getStudents()
      const foundStudent = studentsData.find(s => s.id === studentId)

      if (!foundStudent) {
        toast({
          title: 'Student Not Found',
          description: 'The requested child profile was not found in your account.',
          variant: 'destructive',
        })
        router.push('/parent/students')
        return
      }

      setStudent(foundStudent)

      // 2. Fetch all enrollments and filter for this child
      const allEnrollments = await api.getEnrollments().catch(() => [])
      const childEnrollments = allEnrollments.filter(e => e.studentId === studentId)
      setEnrollments(childEnrollments)

      // 3. For each enrollment, fetch sessions, progress reports, and grades
      const sessionPromises = childEnrollments.map(e => api.getSessions(e.id).catch(() => []))
      const reportPromises = childEnrollments.map(e => api.getProgressReports(e.id).catch(() => []))
      const gradePromises = childEnrollments.map(e => api.getGrades(e.id).catch(() => []))

      const [allSessionArrays, allReportArrays, allGradeArrays] = await Promise.all([
        Promise.all(sessionPromises),
        Promise.all(reportPromises),
        Promise.all(gradePromises),
      ])

      setSessions(allSessionArrays.flat())
      setProgressReports(allReportArrays.flat())
      setGrades(allGradeArrays.flat())
    } catch (err) {
      console.error('Failed to load child details:', err)
      toast({
        title: 'Error',
        description: 'Failed to load details for this child.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegeneratePin = async () => {
    if (!student) return
    setRegeneratingPin(true)
    try {
      await api.regenerateStudentPin(student.id)
      toast({
        title: 'PIN Regenerated',
        description: `A new student access PIN for ${student.fullName} has been sent to your email.`,
      })
    } catch (err: any) {
      toast({
        title: 'Failed to Regenerate PIN',
        description: err instanceof Error ? err.message : 'An error occurred.',
        variant: 'destructive',
      })
    } finally {
      setRegeneratingPin(false)
    }
  }

  // Extract assigned tutors from this child's enrollments
  const assignedTutors: AssignedTutorInfo[] = []
  const seenTutorIds = new Set<string>()

  enrollments.forEach(enrollment => {
    if (!enrollment.tutorId) return

    const anyEnrollment = enrollment as any
    const tutorObj = anyEnrollment.tutor || anyEnrollment.assignedTutor
    const tutorId = enrollment.tutorId
    const tutorName = tutorObj?.fullName || tutorObj?.user?.fullName || 'Assigned Tutor'
    const tutorBio = tutorObj?.bio || tutorObj?.profile?.bio || 'Certified academic educator assigned through Teachmenest.'
    const subjectName = enrollment.subject?.name || 'Academic Subject'
    const tutorSessions = sessions.filter(s => s.enrollmentId === enrollment.id)

    if (!seenTutorIds.has(tutorId)) {
      seenTutorIds.add(tutorId)
      assignedTutors.push({
        id: tutorId,
        fullName: tutorName,
        email: tutorObj?.email || tutorObj?.user?.email,
        bio: tutorBio,
        subjects: [subjectName],
        sessions: tutorSessions,
      })
    } else {
      const existing = assignedTutors.find(t => t.id === tutorId)
      if (existing) {
        if (!existing.subjects.includes(subjectName)) {
          existing.subjects.push(subjectName)
        }
        // Merge sessions
        tutorSessions.forEach(s => {
          if (!existing.sessions.some(es => es.id === s.id)) {
            existing.sessions.push(s)
          }
        })
      }
    }
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <LoadingSpinner size="lg" className="text-brand-gold mb-3" />
        <p className="text-sm text-zinc-400">Loading child details...</p>
      </div>
    )
  }

  if (!student) {
    return null
  }

  const upcomingSessions = sessions
    .filter(s => s.status === 'SCHEDULED' && new Date(s.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const completedSessions = sessions
    .filter(s => s.status === 'COMPLETED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/parent/students')}
          className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Children
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={loadStudentData}
          className="border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Child Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-muted via-muted to-muted border border-brand-gold/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 border border-brand-gold/40 text-brand-gold flex items-center justify-center text-2xl font-bold font-serif shrink-0 shadow-inner">
              {student.fullName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  {student.fullName}
                </h1>
                <Badge variant="outline" className="border-brand-gold/40 text-brand-gold bg-brand-gold/10">
                  {student.actualGrade?.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-400">
                {student.school && (
                  <span className="flex items-center gap-1.5">
                    <School className="h-4 w-4 text-zinc-500" />
                    {student.school}
                  </span>
                )}
                {student.dateOfBirth && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-mono text-brand-gold font-medium">
                  <Key className="h-3.5 w-3.5" />
                  Code: {(student as any).studentCode || '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegeneratePin}
              disabled={regeneratingPin}
              className="border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 text-xs gap-2 h-10 px-4 rounded-xl"
            >
              <Key className="h-4 w-4" />
              {regeneratingPin ? 'Regenerating...' : 'Regenerate Access PIN'}
            </Button>
            <Button
              onClick={() => router.push('/parent/enrollments')}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-bold text-xs gap-1.5 h-10 px-4 rounded-xl"
            >
              <BookOpen className="h-4 w-4" />
              Enroll Subject
            </Button>
          </div>
        </div>

        {student.notes && (
          <div className="mt-5 pt-5 border-t border-white/10 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Learning Notes: </span>
            {student.notes}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 space-x-1 sm:space-x-4 overflow-x-auto pb-px">
        {[
          { key: 'overview', label: 'Overview', icon: BookOpen },
          { key: 'tutors', label: `Assigned Tutors (${assignedTutors.length})`, icon: GraduationCap },
          { key: 'sessions', label: `Sessions (${sessions.length})`, icon: Calendar },
          { key: 'academics', label: `Academics & Reports (${progressReports.length + grades.length})`, icon: Award },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
                  : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-brand-gold/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Active Subjects</p>
                  <p className="text-2xl font-bold text-white">
                    {enrollments.filter(e => e.status === 'ACTIVE').length}
                  </p>
                  <p className="text-[11px] text-zinc-500">{enrollments.length} total enrolled</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-brand-gold/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Assigned Tutors</p>
                  <p className="text-2xl font-bold text-white">{assignedTutors.length}</p>
                  <p className="text-[11px] text-zinc-500">Dedicated subject specialists</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-brand-gold/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Upcoming Sessions</p>
                  <p className="text-2xl font-bold text-white">{upcomingSessions.length}</p>
                  <p className="text-[11px] text-zinc-500">Next classes scheduled</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-brand-gold/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Completed Classes</p>
                  <p className="text-2xl font-bold text-white">{completedSessions.length}</p>
                  <p className="text-[11px] text-zinc-500">Sessions finished</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Assigned Tutors Spotlight (with prompt requirement: explicitly without message button) */}
          <Card className="bg-card border-brand-gold/25">
            <CardHeader className="pb-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-brand-gold" />
                  Assigned Instructors
                </CardTitle>
                <span className="text-xs text-zinc-400">
                  Vetted and assigned by Teachmenest Academic Team
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {assignedTutors.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-zinc-300">No tutor assigned yet</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                    Once our academic coordinators match your child&apos;s enrollment with an expert tutor, their profile details and schedule will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedTutors.map(tutor => (
                    <div
                      key={tutor.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-brand-gold/20 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-gold flex items-center justify-center font-bold">
                          {tutor.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-white text-base truncate">{tutor.fullName}</h4>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {tutor.subjects.map(s => (
                              <span key={s} className="text-[10px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full border border-brand-gold/25">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                        {tutor.bio}
                      </p>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-brand-gold" />
                          {tutor.sessions.length} sessions scheduled
                        </span>
                        {/* Explicit note indicating communications go through platform support per policy */}
                        <span className="text-[11px] text-zinc-500 italic">
                          Academic coordination managed by Teachmenest
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Active Enrollments */}
          <Card className="bg-card border-brand-gold/25">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-gold" />
                Enrolled Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {enrollments.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-sm">
                  No subjects enrolled yet. Click &quot;Enroll Subject&quot; above to register.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {enrollments.map(e => (
                    <div key={e.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white text-sm">
                            {e.subject?.name || e.subjectId}
                          </h4>
                          <StatusBadge status={e.status} />
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Frequency: <span className="text-zinc-300">{e.sessionFrequency || 'WEEKLY'}</span> • 
                          Billing: <span className="text-zinc-300">{e.billingFrequency || 'MONTHLY'}</span> • 
                          Started: <span className="text-zinc-300">{new Date(e.startDate).toLocaleDateString()}</span>
                        </p>
                      </div>

                      <div className="text-xs text-right">
                        {e.tutorId ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1 sm:justify-end">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Tutor Assigned
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium flex items-center gap-1 sm:justify-end">
                            <Clock className="h-3.5 w-3.5" /> Matching Tutor...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Assigned Tutors (Dedicated View) */}
      {activeTab === 'tutors' && (
        <div className="space-y-6">
          <div className="bg-brand-subtle/40 border border-brand-gold/20 rounded-xl p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 leading-relaxed">
              <span className="font-semibold text-white">Parent Tutor Policy: </span>
              To maintain academic integrity and child safety, parents view tutor credentials, bios, and session logs here. Direct parent messaging to tutors is handled through the Teachmenest Support &amp; Complaints portal to ensure all communications are officially recorded.
            </div>
          </div>

          {assignedTutors.length === 0 ? (
            <Card className="bg-card border-dashed border-zinc-800 text-center py-16">
              <CardContent>
                <GraduationCap className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">No Assigned Tutors Yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
                  Once your enrollment is matched, your child&apos;s assigned tutor&apos;s credentials and session schedules will appear here.
                </p>
                <Button
                  onClick={() => router.push('/parent/enrollments')}
                  variant="outline"
                  size="sm"
                  className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                >
                  View Enrollments
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignedTutors.map(tutor => (
                <Card key={tutor.id} className="bg-card border-brand-gold/25 overflow-hidden">
                  <CardHeader className="bg-white/[0.015] border-b border-white/5 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold/30 to-brand-gold/10 border border-brand-gold/40 text-brand-gold flex items-center justify-center text-xl font-bold font-serif shrink-0">
                          {tutor.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{tutor.fullName}</h3>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                              Verified Instructor
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {tutor.subjects.map(sub => (
                              <span key={sub} className="text-xs px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold font-medium border border-brand-gold/30">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Explicitly no message button per user requirement */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                          Teachmenest Certified Educator
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        About the Instructor
                      </h4>
                      <p className="text-sm text-zinc-300 leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/5">
                        {tutor.bio}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        Sessions for {student.fullName} ({tutor.sessions.length})
                      </h4>
                      {tutor.sessions.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">No sessions logged for this tutor yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {tutor.sessions.map(s => (
                            <div
                              key={s.id}
                              className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-brand-gold shrink-0" />
                                <div>
                                  <span className="font-semibold text-white">
                                    {new Date(s.scheduledAt).toLocaleDateString(undefined, {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                  <span className="text-zinc-400 ml-2">
                                    {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.durationMinutes} mins)
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={s.status} />
                                {s.zoomLink && s.status === 'SCHEDULED' && (
                                  <a
                                    href={s.zoomLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-gold hover:text-brand-goldLight flex items-center gap-1 font-medium ml-2"
                                  >
                                    Zoom Class <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: All Sessions */}
      {activeTab === 'sessions' && (
        <Card className="bg-card border-brand-gold/25">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-gold" />
              Class Sessions for {student.fullName}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Complete log of scheduled, upcoming, and completed tutoring sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {sessions.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm">
                No sessions have been scheduled yet for this child.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-zinc-400">
                          at {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <StatusBadge status={session.status} />
                      </div>
                      <p className="text-xs text-zinc-400">
                        Duration: {session.durationMinutes} minutes
                        {session.homeworkAssigned && (
                          <span className="ml-3 text-brand-gold">
                            • Homework: {session.homeworkAssigned}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {session.zoomLink && session.status === 'SCHEDULED' && (
                        <a
                          href={session.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold/15 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/25 font-semibold text-xs transition-colors"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Join Zoom Meeting
                        </a>
                      )}
                      {session.recordingLink && (
                        <a
                          href={session.recordingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-zinc-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Recording
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Academics, Progress Reports & Grades */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          {/* Progress Reports */}
          <Card className="bg-card border-brand-gold/25">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-gold" />
                Progress Reports ({progressReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {progressReports.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-sm">
                  No progress reports have been filed by the tutor yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {progressReports.map(report => (
                    <div
                      key={report.id}
                      className="p-5 rounded-xl bg-white/[0.02] border border-brand-gold/20 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-semibold text-brand-gold text-sm">
                          Period: {report.period}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300">{report.summary}</p>
                      <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          <span className="font-bold block mb-1">Strengths:</span>
                          {report.strengths}
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          <span className="font-bold block mb-1">Areas to Improve:</span>
                          {report.areasToImprove}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grades */}
          <Card className="bg-card border-brand-gold/25">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-gold" />
                Grades &amp; Assessments ({grades.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {grades.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-sm">
                  No assessment grades recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {grades.map(grade => (
                    <div
                      key={grade.id}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4 text-xs sm:text-sm"
                    >
                      <div>
                        <h4 className="font-semibold text-white">
                          {grade.assignment?.title || 'Assignment Evaluation'}
                        </h4>
                        {grade.feedback && (
                          <p className="text-xs text-zinc-400 mt-0.5 italic">
                            Feedback: &quot;{grade.feedback}&quot;
                          </p>
                        )}
                        <span className="text-[11px] text-zinc-500">
                          Graded on {new Date(grade.gradedAt || grade.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-brand-gold">
                          {grade.score} / {grade.maxScore}
                        </span>
                        <span className="block text-[11px] text-zinc-400 font-medium">
                          {Math.round((grade.score / grade.maxScore) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}