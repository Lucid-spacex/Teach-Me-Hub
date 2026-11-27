'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { ProgressReportModal } from '@/components/tutor/ProgressReportModal'
import { ProgressReport, Enrollment, Student, TutorStudent } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText, ArrowLeft, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function TutorProgressReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [tutorStudents, setTutorStudents] = useState<TutorStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [reportsData, studentsData] = await Promise.all([
        api.getProgressReports(),
        api.getTutorStudentsDetailed().catch(() => [])
      ])
      setReports(reportsData)
      setTutorStudents(studentsData)
      // Extract enrollments from tutor students response
      const enrollmentsFromStudents = studentsData
        .filter(s => s.enrollment)
        .map(s => s.enrollment!)
      setEnrollments(enrollmentsFromStudents)
      setStudents(studentsData.map(s => s.student))
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

  const refreshReports = () => {
    loadData()
  }

  const getStudentNameForReport = (enrollmentId: string) => {
    const tutorStudent = tutorStudents.find(ts => ts.enrollment?.id === enrollmentId)
    return tutorStudent?.student?.fullName || 'Unknown Student'
  }

  const getSubjectNameForReport = (enrollmentId: string) => {
    const tutorStudent = tutorStudents.find(ts => ts.enrollment?.id === enrollmentId)
    return tutorStudent?.subject?.name || tutorStudent?.enrollment?.subject?.name || 'Unknown Subject'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" text="Loading progress reports..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center max-w-md">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg mb-4">
              <p className="font-medium">Failed to load progress reports</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button onClick={refreshReports} className="gap-2">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tutor')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <div className="bg-brand-gold/20 p-2 rounded-lg border border-brand-gold/30">
                <FileText className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Progress Reports</h1>
                <p className="text-sm text-muted-foreground">View and submit student progress reports</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setReportModalOpen(true)}
            className="w-full gap-2 bg-brand-gold hover:bg-brand-goldLight text-brand-dark sm:w-auto"
            disabled={enrollments.length === 0}
          >
            <Plus className="h-4 w-4" />
            Submit Report
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Previous Reports</h2>
          {reports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No progress reports yet"
              description="Your submitted progress reports will appear here"
            />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-card border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{report.period}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Student:</span>{' '}
                      <span className="text-foreground">{getStudentNameForReport(report.enrollmentId)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Subject:</span>{' '}
                      <span className="text-muted-foreground">{getSubjectNameForReport(report.enrollmentId)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Summary:</span>{' '}
                      <span className="text-muted-foreground">{report.summary}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProgressReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        enrollments={enrollments}
        students={students}
        tutorStudents={tutorStudents}
        onSuccess={refreshReports}
      />
    </div>
  )
}
