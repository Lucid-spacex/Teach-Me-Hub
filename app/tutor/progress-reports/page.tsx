'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { ProgressReportModal } from '@/components/tutor/ProgressReportModal'
import { ProgressReport, Enrollment } from '@/lib/types'
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
      const [reportsData, enrollmentsData] = await Promise.all([
        api.getProgressReports(),
        api.getEnrollments()
      ])
      setReports(reportsData)
      setEnrollments(enrollmentsData.filter(e => e.tutorId !== null))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" text="Loading progress reports..." />
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tutor')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Progress Reports</h1>
                <p className="text-sm text-muted-foreground">View and submit student progress reports</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setReportModalOpen(true)} 
            className="gap-2"
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
                      <span className="font-medium text-foreground">Enrollment ID:</span>{' '}
                      <code className="text-xs bg-muted px-2 py-1 rounded">{report.enrollmentId}</code>
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
        onSuccess={refreshReports}
      />
    </div>
  )
}
