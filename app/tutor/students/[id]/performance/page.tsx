'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { PerformanceOverview, PeriodFilter, TutorStudent, Student } from '@/lib/types'
import { ArrowLeft, RefreshCw, TrendingUp, Award, BookOpen, CheckCircle, BarChart3, Calendar, Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TutorStudentPerformancePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [performance, setPerformance] = useState<PerformanceOverview | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodFilter>('month')
  const studentId = params.id as string

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadPerformance()
  }, [router, studentId, period])

  const loadPerformance = async () => {
    setLoading(true)
    try {
      const [perfData, studentsData] = await Promise.all([
        api.getTutorStudentPerformance(studentId, period),
        api.getTutorStudents().catch(() => []),
      ])

      setPerformance(perfData)
      const foundStudent = Array.isArray(studentsData)
        ? studentsData.find(s => s.student.id === studentId)?.student || null
        : null
      setStudent(foundStudent)
    } catch (err) {
      console.error('Failed to load performance data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load performance data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: number | null) => {
    if (trend === null) return null
    const isPositive = trend >= 0
    return (
      <span className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/tutor/students/${studentId}`)}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">
              {student?.fullName || 'Student'} Performance
            </h1>
            <p className="text-sm text-gray-400">Track academic progress, attendance, and achievements</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: PeriodFilter) => setPeriod(value)}>
            <SelectTrigger className="w-[140px] bg-card border-brand-gold/30 text-white h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPerformance}
            disabled={loading}
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : !performance ? (
        <Card className="bg-card border-brand-gold/30 text-center py-12">
          <CardContent>
            <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Performance Data</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Performance data will appear here once the student has grades, attendance records, or completed assignments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Grade */}
            <Card className="bg-card border-brand-gold/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Average Grade</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {performance.averageGrade.percentage !== null
                        ? `${performance.averageGrade.percentage.toFixed(1)}%`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {performance.averageGrade.gradedCount} grade{performance.averageGrade.gradedCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-brand-gold/20 p-3 rounded-full text-brand-gold">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
                {getTrendIcon(performance.averageGrade.trend)}
              </CardContent>
            </Card>

            {/* Attendance Rate */}
            <Card className="bg-card border-brand-gold/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Attendance</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {performance.attendance.rate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {performance.attendance.attended} attended / {performance.attendance.attended + performance.attendance.missed} total
                    </p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-full text-green-400">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
                {getTrendIcon(performance.attendance.trend)}
              </CardContent>
            </Card>

            {/* Assignment Completion */}
            <Card className="bg-card border-brand-gold/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Assignments</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {performance.assignments.completionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {performance.assignments.completed} / {performance.assignments.total} completed
                    </p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Performance */}
            <Card className="bg-card border-brand-gold/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Quiz Average</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {performance.quizzes.attempts > 0
                        ? `${performance.quizzes.averagePercentage.toFixed(1)}%`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {performance.quizzes.attempts} attempt{performance.quizzes.attempts !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Grades Warning */}
          {performance.averageGrade.gradedCount === 0 && (
            <Card className="bg-amber-950/20 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-400">No Approved Grades Yet</h4>
                    <p className="text-sm text-gray-300 mt-1">
                      This student has not yet had any grades approved by admin. Grade averages are calculated only from approved grades.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grades by Subject */}
          {performance.gradesBySubject.length > 0 && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Grades by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performance.gradesBySubject.map((subject) => (
                    <div key={subject.subjectName} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{subject.subjectName}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-brand-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-gold"
                            style={{ width: `${subject.averagePercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {subject.averagePercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">({subject.gradedCount})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Grades */}
          {performance.recentGrades.length > 0 && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performance.recentGrades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-brand-dark/40 border border-brand-gold/10"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{grade.assignmentTitle}</p>
                        <p className="text-xs text-gray-400">{grade.subjectName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {grade.score} / {grade.maxScore}
                        </p>
                        <p className="text-xs text-gray-400">{grade.percentage.toFixed(1)}%</p>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 ml-4">
                        <Calendar className="h-3 w-3" />
                        {new Date(grade.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignment Breakdown */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-white">Assignment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 rounded-lg bg-brand-dark/40 border border-brand-gold/10">
                  <p className="text-2xl font-bold text-white">{performance.assignments.total}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-950/20 border border-green-500/20">
                  <p className="text-2xl font-bold text-green-400">{performance.assignments.completed}</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-950/20 border border-blue-500/20">
                  <p className="text-2xl font-bold text-blue-400">{performance.assignments.pending}</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
                  <p className="text-2xl font-bold text-amber-400">{performance.assignments.overdue}</p>
                  <p className="text-xs text-gray-400">Overdue</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-950/20 border border-red-500/20">
                  <p className="text-2xl font-bold text-red-400">{performance.assignments.submittedLate}</p>
                  <p className="text-xs text-gray-400">Late</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
