'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Assignment, Student, Enrollment, AssignmentSubmission } from '@/lib/types'
import { FileText, ArrowLeft, RefreshCw, BookOpen, Clock, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ParentAssignmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL')
  const [studentFilter, setStudentFilter] = useState<string>('ALL')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'PARENT') {
      router.push('/login')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [assignmentsData, studentsData, enrollmentsData] = await Promise.all([
        api.getAssignments().catch(() => []),
        api.getStudents().catch(() => []),
        api.getEnrollments().catch(() => []),
      ])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])

      // Load submissions for each assignment
      const submissionPromises = assignmentsData.map(async (assignment: Assignment) => {
        try {
          const submission = await api.getAssignmentSubmission(assignment.id)
          return { assignmentId: assignment.id, submission }
        } catch {
          return { assignmentId: assignment.id, submission: null }
        }
      })

      const submissionResults = await Promise.all(submissionPromises)
      const submissionsMap: Record<string, AssignmentSubmission> = {}
      submissionResults.forEach(({ assignmentId, submission }) => {
        if (submission) {
          submissionsMap[assignmentId] = submission
        }
      })
      setSubmissions(submissionsMap)
    } catch (err) {
      console.error('Failed to load assignments:', err)
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getEnrollmentInfo = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId)
    const student = enrollment ? students.find(s => s.id === enrollment.studentId) : null
    return {
      studentName: student?.fullName || 'Child',
      subjectName: enrollment?.subject?.name || 'Subject',
    }
  }

  const filtered = assignments.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false
    if (studentFilter !== 'ALL') {
      const enrollment = enrollments.find(e => e.id === item.enrollmentId)
      if (enrollment?.studentId !== studentFilter) return false
    }
    return true
  })

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/parent')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Children's Assignments</h1>
              <p className="text-sm text-gray-400">Track tasks, classwork, and tests assigned to your children</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {students.length > 0 && (
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-[180px] bg-card border-brand-gold/30 text-white h-9 text-xs">
                  <SelectValue placeholder="All Children" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Children</SelectItem>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex rounded-lg bg-card border border-brand-gold/20 p-1">
              {(['ALL', 'PENDING', 'SUBMITTED', 'GRADED'] as const).map(st => (
                <Button
                  key={st}
                  variant={statusFilter === st ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(st)}
                  className={statusFilter === st ? 'bg-brand-gold text-brand-dark text-xs h-7' : 'text-gray-400 text-xs h-7'}
                >
                  {st}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No Assignments Found</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                No assignments match the selected filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const info = getEnrollmentInfo(item.enrollmentId)
              const submission = submissions[item.id]
              return (
                <Card key={item.id} className="bg-card border-brand-gold/25 hover:border-brand-gold/40 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold">
                        {item.type}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        item.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        item.status === 'SUBMITTED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-white font-semibold line-clamp-1">
                      {item.title}
                    </CardTitle>
                    <p className="text-xs text-gray-400">
                      {info.studentName} • <span className="text-brand-gold font-medium">{info.subjectName}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                      {item.description || 'No instructions provided.'}
                    </p>

                    {submission && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-brand-gold" />
                          <span className="text-brand-gold font-medium">
                            Submitted on {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {submission.textAnswer && (
                          <div className="bg-card/80 p-2 rounded-lg border border-border/30">
                            <p className="text-xs font-medium text-gray-400 mb-1">Student Answer:</p>
                            <p className="text-xs text-white line-clamp-2">{submission.textAnswer}</p>
                          </div>
                        )}
                        {submission.attachmentUrl && (
                          <div className="flex items-center gap-2 text-xs text-brand-gold">
                            <FileText className="h-3 w-3" />
                            <a href={submission.attachmentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              View attachment
                            </a>
                          </div>
                        )}
                        {submission.tutorFeedback && (
                          <div className="bg-brand-gold/10 p-2 rounded-lg border border-brand-gold/30">
                            <p className="text-xs font-medium text-brand-gold mb-1">Tutor Feedback:</p>
                            <p className="text-xs text-gray-300 italic">{submission.tutorFeedback}</p>
                          </div>
                        )}
                        {submission.tutorFeedbackAttachmentUrl && (
                          <div className="flex items-center gap-2 text-xs text-brand-gold">
                            <Download className="h-3 w-3" />
                            <a href={submission.tutorFeedbackAttachmentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              View feedback attachment
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-brand-gold/10 flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
  )
}
