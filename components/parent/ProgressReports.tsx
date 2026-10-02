'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { ProgressReport, Enrollment } from '@/lib/types'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    return <div className="text-sm text-gray-400">Loading progress reports...</div>
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
    <Card className="bg-card border-brand-gold/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-gold" />
          Progress Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enrollments.map((enrollment) => {
          const enrollmentReports = reports[enrollment.id] || []
          const isExpanded = expandedEnrollments.has(enrollment.id)
          const subjectName = enrollment.subject?.name || enrollment.subjectId

          return (
            <div key={enrollment.id} className="border border-brand-gold/20 rounded-lg mb-2">
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-3 hover:bg-brand-gold/10 text-white"
                onClick={() => toggleEnrollment(enrollment.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{subjectName}</div>
                  <div className="text-sm text-gray-400">
                    {enrollmentReports.length} report{enrollmentReports.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <FileText className={`h-4 w-4 transition-transform text-brand-gold ${isExpanded ? 'rotate-90' : ''}`} />
              </Button>

              {isExpanded && (
                <div className="border-t border-brand-gold/20 p-4">
                  {enrollmentReports.length === 0 ? (
                    <p className="text-sm text-gray-400">No progress reports yet</p>
                  ) : (
                    <div className="space-y-4">
                      {enrollmentReports.map((report) => (
                        <div key={report.id} className="border border-brand-gold/20 rounded-lg p-4 bg-brand-dark/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{report.period}</h4>
                            <span className="text-xs text-gray-400">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-brand-gold">Summary:</span>
                              <p className="text-gray-300">{report.summary}</p>
                            </div>
                            <div>
                              <span className="font-medium text-brand-gold">Strengths:</span>
                              <p className="text-gray-300">{report.strengths}</p>
                            </div>
                            <div>
                              <span className="font-medium text-brand-gold">Areas to Improve:</span>
                              <p className="text-gray-300">{report.areasToImprove}</p>
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
      </CardContent>
    </Card>
  )
}
