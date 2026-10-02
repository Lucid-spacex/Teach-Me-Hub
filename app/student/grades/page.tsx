'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Grade, Assignment } from '@/lib/types'
import { BarChart3, Award, ArrowLeft, RefreshCw, MessageSquare, BookOpen } from 'lucide-react'

export default function StudentGradesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grades, setGrades] = useState<Grade[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadGrades()
  }, [router])

  const loadGrades = async () => {
    setLoading(true)
    try {
      const [gradesData, assignmentsData] = await Promise.all([
        api.getStudentGrades().catch(() => []),
        api.getStudentAssignments().catch(() => []),
      ])

      // Only show approved grades per specification
      const approvedOnly = Array.isArray(gradesData)
        ? gradesData.filter(g => g.status === 'APPROVED')
        : []

      setGrades(approvedOnly)
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
    } catch (err) {
      console.error('Failed to load grades:', err)
      toast({
        title: 'Error',
        description: 'Failed to load grades',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getAssignmentTitle = (assignmentId: string) => {
    return assignments.find(a => a.id === assignmentId)?.title || 'Class Assessment'
  }

  // Calculate overall performance
  const totalScore = grades.reduce((acc, g) => acc + g.score, 0)
  const totalMax = grades.reduce((acc, g) => acc + (g.maxScore || 100), 0)
  const averagePercentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null

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
              <h1 className="text-3xl font-serif font-bold text-white">My Grades</h1>
              <p className="text-sm text-gray-400">View official approved scores and teacher feedback</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadGrades}
            disabled={loading}
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Summary Card */}
        {averagePercentage !== null && (
          <Card className="bg-gradient-to-r from-brand-dark to-card border-brand-gold/40">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-brand-gold/20 p-4 rounded-full text-brand-gold">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Overall Performance</h3>
                  <p className="text-xs text-gray-400">Based on {grades.length} approved grade{grades.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Average Score</span>
                <span className={`text-3xl font-extrabold ${
                  averagePercentage >= 70 ? 'text-green-400' : averagePercentage >= 50 ? 'text-brand-gold' : 'text-red-400'
                }`}>
                  {averagePercentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : grades.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-12">
            <CardContent>
              <Award className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No Approved Grades Yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Once your submitted tests and assignments are reviewed and approved by your tutor, your grades will be displayed here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {grades.map((item) => {
              const percentage = Math.round((item.score / (item.maxScore || 100)) * 100)
              const title = getAssignmentTitle(item.assignmentId)
              return (
                <Card key={item.id} className="bg-card border-brand-gold/25 hover:border-brand-gold/40 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">
                        Approved
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-white font-semibold line-clamp-1">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-baseline justify-between p-3 rounded-lg bg-brand-dark/70 border border-brand-gold/15">
                      <div>
                        <span className="text-xs text-gray-400">Score</span>
                        <div className="text-2xl font-bold text-white">
                          {item.score} <span className="text-sm text-gray-400 font-normal">/ {item.maxScore}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">Percentage</span>
                        <div className={`text-xl font-bold ${
                          percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-brand-gold' : 'text-red-400'
                        }`}>
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    {item.feedback ? (
                      <div className="text-xs text-gray-300 bg-brand-dark/40 p-3 rounded border border-brand-gold/10">
                        <span className="text-brand-gold font-medium block mb-1 flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> Tutor Feedback:
                        </span>
                        <p className="italic">"{item.feedback}"</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
  )
}
