'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { ProgressReport, Enrollment } from '@/lib/types'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'

interface ProgressReportsProps {
  enrollments: Enrollment[]
  refreshTrigger?: number
}

export function ProgressReports({ enrollments, refreshTrigger }: ProgressReportsProps) {
  const [reports, setReports] = useState<Record<string, ProgressReport[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedEnrollments, setExpandedEnrollments] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadReports()
  }, [refreshTrigger])

  const loadReports = async () => {
    try {
      const reportsByEnrollment: Record<string, ProgressReport[]> = {}
      
      // Load reports for each enrollment
      for (const enrollment of enrollments) {
        const data = await api.getProgressReports(enrollment.id)
        reportsByEnrollment[enrollment.id] = data
      }
      
      setReports(reportsByEnrollment)
    } catch (err) {
      console.error('Failed to load progress reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleEnrollment = (enrollmentId: string) => {
    const newExpanded = new Set(expandedEnrollments)
    if (newExpanded.has(enrollmentId)) {
      newExpanded.delete(enrollmentId)
    } else {
      newExpanded.add(enrollmentId)
    }
    setExpandedEnrollments(newExpanded)
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading progress reports...</div>
  }

  if (enrollments.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No progress reports"
        description="Progress reports will appear here once you have active enrollments"
      />
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Progress Reports</h2>
      
      {enrollments.map((enrollment) => {
        const enrollmentReports = reports[enrollment.id] || []
        const isExpanded = expandedEnrollments.has(enrollment.id)

        return (
          <div key={enrollment.id} className="border rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between px-4 py-3 hover:bg-muted"
              onClick={() => toggleEnrollment(enrollment.id)}
            >
              <div className="text-left">
                <div className="font-medium">Subject: {enrollment.subjectId}</div>
                <div className="text-sm text-muted-foreground">
                  {enrollmentReports.length} report{enrollmentReports.length !== 1 ? 's' : ''}
                </div>
              </div>
              <FileText className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
            
            {isExpanded && (
              <div className="border-t p-4">
                {enrollmentReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No progress reports yet</p>
                ) : (
                  <div className="space-y-4">
                    {enrollmentReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{report.period}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Summary:</span>
                            <p className="text-muted-foreground">{report.summary}</p>
                          </div>
                          <div>
                            <span className="font-medium">Strengths:</span>
                            <p className="text-muted-foreground">{report.strengths}</p>
                          </div>
                          <div>
                            <span className="font-medium">Areas to Improve:</span>
                            <p className="text-muted-foreground">{report.areasToImprove}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
