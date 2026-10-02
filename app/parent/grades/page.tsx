'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Grade, Student, Enrollment, Assignment } from '@/lib/types'
import { BarChart3, ArrowLeft, RefreshCw, Award, BookOpen } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ParentGradesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
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
      const [gradesData, studentsData, enrollmentsData, assignmentsData] = await Promise.all([
        api.getGrades().catch(() => []),
        api.getStudents().catch(() => []),
        api.getEnrollments().catch(() => []),
        api.getAssignments().catch(() => []),
      ])

      // Only display approved grades per backend policy
      const approvedGrades = Array.isArray(gradesData) 
        ? gradesData.filter(g => g.status === 'APPROVED') 
        : []

      setGrades(approvedGrades)
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])
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

  const getGradeContext = (grade: Grade) => {
    const enrollment = enrollments.find(e => e.id === grade.enrollmentId)
    const student = enrollment ? students.find(s => s.id === enrollment.studentId) : null
    const assignment = assignments.find(a => a.id === grade.assignmentId)
    return {
      studentName: student?.fullName || 'Child',
      subjectName: enrollment?.subject?.name || 'Subject',
      assignmentTitle: assignment?.title || 'Assignment Test',
      assignmentType: assignment?.type || 'TEST',
    }
  }

  const filtered = grades.filter((g) => {
    if (studentFilter === 'ALL') return true
    const enrollment = enrollments.find(e => e.id === g.enrollmentId)
    return enrollment?.studentId === studentFilter
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
              <h1 className="text-3xl font-serif font-bold text-white">Academic Grades</h1>
              <p className="text-sm text-gray-400">View officially approved scores and tutor feedback for your children</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
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
        ) : filtered.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-12">
            <CardContent>
              <Award className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No Approved Grades Yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Once tests and assignments are completed and approved by tutors, official scores and feedback will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const ctx = getGradeContext(item)
              const percentage = Math.round((item.score / (item.maxScore || 100)) * 100)
              return (
                <Card key={item.id} className="bg-card border-brand-gold/25 hover:border-brand-gold/40 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold">
                        {ctx.assignmentType}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">
                        Approved
                      </span>
                    </div>
                    <CardTitle className="text-lg text-white font-semibold line-clamp-1">
                      {ctx.assignmentTitle}
                    </CardTitle>
                    <p className="text-xs text-gray-400">
                      {ctx.studentName} • <span className="text-brand-gold font-medium">{ctx.subjectName}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
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
                      <div className="text-xs text-gray-300 bg-brand-dark/40 p-2.5 rounded border border-brand-gold/10">
                        <span className="text-brand-gold font-medium block mb-0.5">Tutor Feedback:</span>
                        <p className="italic">"{item.feedback}"</p>
                      </div>
                    ) : null}

                    <div className="text-right text-xs text-gray-500">
                      Graded on {new Date(item.createdAt).toLocaleDateString()}
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
