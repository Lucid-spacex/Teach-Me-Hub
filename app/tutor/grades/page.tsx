'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { CompiledGrade, GradeStatus, TutorStudent } from '@/lib/types'
import { GradeCompileWizard } from '@/components/tutor/GradeCompileWizard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  BarChart3,
  Plus,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  Award,
  Edit,
  Trash2,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react'

export default function TutorGradesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grades, setGrades] = useState<CompiledGrade[]>([])
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<CompiledGrade | null>(null)
  const [deletingGrade, setDeletingGrade] = useState<string | null>(null)

  // Filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadInitialData()
  }, [router])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [gradesData, studentsData] = await Promise.all([
        api.getTutorCompiledGrades().catch(() => []),
        api.getTutorStudents().catch(() => []),
      ])

      setGrades(gradesData)
      setStudents(studentsData)
    } catch (err) {
      console.error('Failed to load grades data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load grades and student data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditGrade = (grade: CompiledGrade) => {
    if (grade.status === 'APPROVED') {
      toast({
        title: 'Cannot Edit',
        description: 'Approved grades cannot be modified.',
        variant: 'destructive',
      })
      return
    }
    setEditingGrade(grade)
    setWizardOpen(true)
  }

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
      return
    }

    setDeletingGrade(gradeId)
    try {
      await api.deleteCompiledGrade(gradeId)
      setGrades(prev => prev.filter(g => g.id !== gradeId))
      toast({
        title: 'Grade Deleted',
        description: 'Grade has been deleted successfully.',
      })
    } catch (error) {
      console.error('Failed to delete grade:', error)
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete grade',
        variant: 'destructive',
      })
    } finally {
      setDeletingGrade(null)
    }
  }

  const handleWithdrawGrade = async (grade: CompiledGrade) => {
    if (!confirm('Are you sure you want to withdraw this grade from admin review?')) {
      return
    }

    try {
      await api.withdrawCompiledGrade(grade.id)
      setGrades(prev => prev.map(g => g.id === grade.id ? { ...g, status: 'DRAFT' } : g))
      toast({
        title: 'Grade Withdrawn',
        description: 'Grade has been withdrawn and is now a draft.',
      })
    } catch (error) {
      console.error('Failed to withdraw grade:', error)
      toast({
        title: 'Withdraw Failed',
        description: error instanceof Error ? error.message : 'Failed to withdraw grade',
        variant: 'destructive',
      })
    }
  }

  const getStudent = (studentId: string) => {
    const studentEnrollment = students.find(s => s.student.id === studentId)
    return studentEnrollment?.student
  }

  const getEnrollment = (enrollmentId: string) => {
    const studentEnrollment = students.find(s => s.enrollment?.id === enrollmentId)
    return studentEnrollment?.enrollment
  }

  // Filtered grades list
  const filteredGrades = grades.filter((g) => {
    if (selectedStatus !== 'ALL' && g.status !== selectedStatus) return false
    if (selectedStudentId !== 'ALL' && g.studentId !== selectedStudentId) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const student = getStudent(g.studentId)
      const enrollment = getEnrollment(g.enrollmentId)
      const studentName = (student?.fullName || '').toLowerCase()
      const subject = (enrollment?.subject?.name || '').toLowerCase()
      const period = g.period.toLowerCase()
      if (!studentName.includes(q) && !subject.includes(q) && !period.includes(q)) return false
    }
    return true
  })

  // Calculations for stats
  const totalGrades = grades.length
  const approvedCount = grades.filter(g => g.status === 'APPROVED').length
  const pendingCount = grades.filter(g => g.status === 'PENDING_APPROVAL').length
  const draftCount = grades.filter(g => g.status === 'DRAFT').length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tutor')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/20 p-2.5 rounded-xl border border-brand-gold/30">
                <BarChart3 className="h-6 w-6 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Grade Compilation</h1>
                <p className="text-sm text-muted-foreground">
                  Create period-based grades with weighted components
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadInitialData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingGrade(null)
                setWizardOpen(true)
              }}
              className="gap-2 bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
            >
              <Plus className="h-4 w-4" />
              Compile Grade
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Grades</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalGrades}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                <FileText className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Drafts</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{draftCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                <Award className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/50 p-4 rounded-xl border border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by student, subject, or period..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-background/80 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Student:</span>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="w-[180px] bg-background/80 text-xs">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Students</SelectItem>
                  {students.map((s) => (
                    <SelectItem key={s.student.id} value={s.student.id}>
                      {s.student.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Status:</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px] bg-background/80 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" className="text-brand-gold mb-3" />
            <p className="text-sm text-muted-foreground">Loading grades...</p>
          </div>
        ) : filteredGrades.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-brand-gold/80" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No grades found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-5">
                {grades.length === 0
                  ? 'You have not compiled any grades yet. Click below to create your first period-based grade.'
                  : 'No grades match your current filters. Try changing or clearing your search.'}
              </p>
              <Button
                onClick={() => {
                  setEditingGrade(null)
                  setWizardOpen(true)
                }}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Compile New Grade
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrades.map((grade) => {
              const student = getStudent(grade.studentId)
              const enrollment = getEnrollment(grade.enrollmentId)
              const score = grade.finalScore ?? grade.computedScore

              return (
                <Card
                  key={grade.id}
                  className="border-border/60 bg-card/60 hover:bg-card hover:border-brand-gold/40 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-base">
                          {student?.fullName || 'Student'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {enrollment?.subject?.name} • {grade.period}
                        </p>
                      </div>
                      <StatusBadge status={grade.status} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-baseline justify-between bg-brand-dark/40 p-3 rounded-lg border border-border/40">
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">
                          {score.toFixed(1)}%
                        </p>
                      </div>
                      {grade.finalScore !== null && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Computed</p>
                          <p className="text-sm text-brand-gold">
                            {grade.computedScore.toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Attendance:</span>
                        <span className="text-foreground">{grade.attendanceRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Components:</span>
                        <span className="text-foreground">{grade.components.length}</span>
                      </div>
                    </div>

                    {grade.rejectionReason && (
                      <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                        <p className="text-xs text-red-400 flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                          {grade.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {grade.status === 'DRAFT' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditGrade(grade)}
                            className="flex-1 gap-1 text-xs"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGrade(grade.id)}
                            disabled={deletingGrade === grade.id}
                            className="text-xs text-destructive hover:text-destructive"
                          >
                            {deletingGrade === grade.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                      {grade.status === 'PENDING_APPROVAL' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdrawGrade(grade)}
                          className="flex-1 gap-1 text-xs"
                        >
                          <Clock className="h-3 w-3" />
                          Withdraw
                        </Button>
                      )}
                      {grade.status === 'REJECTED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGrade(grade)}
                          className="flex-1 gap-1 text-xs"
                        >
                          <Edit className="h-3 w-3" />
                          Edit & Resubmit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <GradeCompileWizard
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open)
          if (!open) setEditingGrade(null)
        }}
        onSuccess={loadInitialData}
        editingGrade={editingGrade}
      />
    </div>
  )
}
