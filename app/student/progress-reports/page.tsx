'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { ProgressReport } from '@/lib/types'
import { FileText, ArrowLeft, RefreshCw, ThumbsUp, Target, Calendar } from 'lucide-react'

export default function StudentProgressReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadReports()
  }, [router])

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await api.getStudentProgressReports()
      setReports(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load progress reports:', err)
      toast({
        title: 'Error',
        description: 'Failed to load progress reports',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Progress Reports</h1>
              <p className="text-sm text-gray-400">Periodic learning evaluations and growth recommendations from your tutor</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            disabled={loading}
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No Progress Reports Yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Your tutor writes periodic progress reports to summarize your development, strengths, and goals. Your first report will appear here once published.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="bg-card border-brand-gold/30 overflow-hidden shadow-sm">
                <CardHeader className="bg-brand-dark/50 border-b border-brand-gold/15 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-xl text-white font-serif flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-brand-gold" />
                      {report.period || 'Monthly Evaluation'}
                    </CardTitle>
                    <span className="text-xs text-gray-400">
                      Published on {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-gold mb-1.5">
                      Executive Summary
                    </h4>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {report.summary}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-lg bg-green-950/20 border border-green-500/20">
                      <h4 className="text-xs font-semibold text-green-400 flex items-center gap-1.5 mb-2">
                        <ThumbsUp className="h-4 w-4" /> Key Strengths
                      </h4>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {report.strengths || 'Consistent participation and diligence.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/20">
                      <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                        <Target className="h-4 w-4" /> Areas for Growth
                      </h4>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {report.areasToImprove || 'Continue revision on complex concepts.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  )
}
