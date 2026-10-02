'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Grade, TutorStudent, Assignment } from '@/lib/types'
import {
  BarChart3,
  Plus,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  BookOpen,
  Award,
  Users,
  Filter,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
} from 'lucide-react'

export default function TutorGradesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [deletingGrade, setDeletingGrade] = useState<string | null>(null)

  // Filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formEnrollmentId, setFormEnrollmentId] = useState('')
  const [formAssignmentId, setFormAssignmentId] = useState('')
  const [formScore, setFormScore] = useState<number | ''>('')
  const [formMaxScore, setFormMaxScore] = useState<number | ''>(100)
  const [formFeedback, setFormFeedback] = useState('')
  const [feedbackAttachment, setFeedbackAttachment] = useState<File | null>(null)

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
      const [gradesData, studentsData, assignmentsData] = await Promise.all([
        api.getGrades().catch(() => []),
        api.getTutorStudents().catch(() => []),
        api.getAssignments().catch(() => []),
      ])

      setGrades(Array.isArray(gradesData) ? gradesData : [])
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
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

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formEnrollmentId) {
      toast({ title: 'Validation Error', description: 'Please select a student/enrollment.', variant: 'destructive' })
      return
    }
    if (!formAssignmentId) {
      toast({ title: 'Validation Error', description: 'Please select an assignment.', variant: 'destructive' })
      return
    }
    if (formScore === '' || formScore < 0) {
      toast({ title: 'Validation Error', description: 'Please enter a valid non-negative score.', variant: 'destructive' })
      return
    }
    if (formMaxScore === '' || formMaxScore <= 0) {
      toast({ title: 'Validation Error', description: 'Max score must be greater than zero.', variant: 'destructive' })
      return
    }
    if (Number(formScore) > Number(formMaxScore)) {
      toast({ title: 'Validation Error', description: 'Score cannot exceed maximum score.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      if (editingGrade) {
        const updatedGrade = await api.updateGrade(editingGrade.id, {
          score: Number(formScore),
          maxScore: Number(formMaxScore),
          feedback: formFeedback.trim() || undefined,
        })
        setGrades(prev => prev.map(g => g.id === editingGrade.id ? updatedGrade : g))
        toast({
          title: 'Grade Updated',
          description: 'Grade has been updated successfully.',
        })
      } else {
        const newGrade = await api.submitGrade({
          enrollmentId: formEnrollmentId,
          assignmentId: formAssignmentId,
          score: Number(formScore),
          maxScore: Number(formMaxScore),
          feedback: formFeedback.trim() || undefined,
          feedbackAttachment: feedbackAttachment || undefined,
        })
        setGrades(prev => [newGrade, ...prev])
        toast({
          title: 'Grade Submitted',
          description: 'Grade recorded successfully and submitted for admin review.',
        })
      }

      // Reset form & close modal
      setModalOpen(false)
      setEditingGrade(null)
      setFeedbackAttachment(null)
      setFormEnrollmentId('')
      setFormAssignmentId('')
      setFormScore('')
      setFormMaxScore(100)
      setFormFeedback('')
    } catch (err) {
      toast({
        title: editingGrade ? 'Update Failed' : 'Submission Failed',
        description: err instanceof Error ? err.message : 'Could not save grade',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditGrade = (grade: Grade) => {
    if (grade.status === 'APPROVED') {
      toast({
        title: 'Cannot Edit',
        description: 'Approved grades cannot be modified.',
        variant: 'destructive',
      })
      return
    }
    setEditingGrade(grade)
    setFormEnrollmentId(grade.enrollmentId)
    setFormAssignmentId(grade.assignmentId)
    setFormScore(grade.score)
    setFormMaxScore(grade.maxScore)
    setFormFeedback(grade.feedback || '')
    setFeedbackAttachment(null)
    setModalOpen(true)
  }

  const handleFeedbackAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image (JPEG, PNG, GIF, WebP) or PDF file',
        variant: 'destructive',
      })
      return
    }

    // Max 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      })
      return
    }

    setFeedbackAttachment(file)
  }

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
      return
    }

    setDeletingGrade(gradeId)
    try {
      await api.deleteGrade(gradeId)
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

  // Available assignments for selected enrollment in modal
  const eligibleAssignments = formEnrollmentId
    ? assignments.filter(a => a.enrollmentId === formEnrollmentId)
    : assignments

  // Helper lookups
  const getEnrollmentStudent = (enrollmentId: string) => {
    const item = students.find(s => s.enrollment?.id === enrollmentId)
    return item?.student
  }

  const getAssignmentTitle = (assignmentId: string) => {
    const a = assignments.find(x => x.id === assignmentId)
    return a?.title || 'Coursework Assessment'
  }

  // Filtered grades list
  const filteredGrades = grades.filter((g) => {
    if (selectedStatus !== 'ALL' && g.status !== selectedStatus) return false
    if (selectedStudentId !== 'ALL') {
      const student = getEnrollmentStudent(g.enrollmentId)
      if (student?.id !== selectedStudentId) return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const student = getEnrollmentStudent(g.enrollmentId)
      const assignmentTitle = getAssignmentTitle(g.assignmentId).toLowerCase()
      const studentName = (student?.fullName || '').toLowerCase()
      if (!assignmentTitle.includes(q) && !studentName.includes(q)) return false
    }
    return true
  })

  // Calculations for stats
  const totalGraded = grades.length
  const approvedCount = grades.filter(g => g.status === 'APPROVED').length
  const pendingCount = grades.filter(g => g.status === 'PENDING_APPROVAL').length
  const avgPercentage = totalGraded > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / (g.maxScore || 100)) * 100, 0) / totalGraded)
    : 0

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
                <h1 className="text-2xl font-bold text-foreground">Grades & Submissions</h1>
                <p className="text-sm text-muted-foreground">
                  Record assignment marks, give student feedback, and review academic grading.
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
              onClick={() => setModalOpen(true)}
              className="gap-2 bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
            >
              <Plus className="h-4 w-4" />
              Submit Grade
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Recorded</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalGraded}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                <BookOpen className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Average Score</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalGraded > 0 ? `${avgPercentage}%` : '--'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                <Award className="w-5 h-5" />
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
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Under Review</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/50 p-4 rounded-xl border border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or assignment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/80"
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
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" className="text-brand-gold mb-3" />
            <p className="text-sm text-muted-foreground">Loading submitted grades...</p>
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
                  ? 'You have not submitted any assignment marks yet. Click below to grade your first student task.'
                  : 'No grades match your current filters. Try changing or clearing your search.'}
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Submit New Grade
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrades.map((grade) => {
              const student = getEnrollmentStudent(grade.enrollmentId)
              const assignmentTitle = getAssignmentTitle(grade.assignmentId)
              const percentage = Math.round((grade.score / (grade.maxScore || 100)) * 100)

              return (
                <Card
                  key={grade.id}
                  className="border-border/60 bg-card/60 hover:bg-card hover:border-brand-gold/40 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-base">
                          {student?.fullName || 'Enrolled Student'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {assignmentTitle}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          grade.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {grade.status === 'APPROVED' ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-baseline justify-between bg-brand-dark/40 p-3 rounded-lg border border-border/40">
                      <div>
                        <p className="text-xs text-muted-foreground">Awarded Score</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">
                          {grade.score}{' '}
                          <span className="text-xs font-normal text-muted-foreground">/ {grade.maxScore}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold ${
                            percentage >= 80
                              ? 'text-emerald-400'
                              : percentage >= 60
                              ? 'text-brand-gold'
                              : 'text-amber-400'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {grade.feedback && (
                      <div className="text-xs text-muted-foreground bg-card/80 p-2.5 rounded-lg border border-border/30 italic">
                        &quot;{grade.feedback}&quot;
                      </div>
                    )}

                    {/* Action buttons - only for PENDING_APPROVAL or REJECTED */}
                    {(grade.status === 'PENDING_APPROVAL' || grade.status === 'REJECTED') && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleEditGrade(grade)}
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteGrade(grade.id)}
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                          disabled={deletingGrade === grade.id}
                        >
                          {deletingGrade === grade.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/30">
                      <span>Submitted on {new Date(grade.createdAt).toLocaleDateString()}</span>
                      {student?.actualGrade && (
                        <span className="font-medium text-brand-gold">{student.actualGrade}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Submit Grade Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingGrade(null)
        }}
        title={editingGrade ? 'Edit Grade' : 'Submit Student Grade'}
      >
        <form onSubmit={handleSubmitGrade} className="space-y-4 pt-2">
          {/* Select Student / Enrollment */}
          <div className="space-y-2">
            <Label htmlFor="student-enrollment">Student & Subject *</Label>
            <Select 
              value={formEnrollmentId} 
              onValueChange={setFormEnrollmentId}
              disabled={!!editingGrade}
            >
              <SelectTrigger id="student-enrollment" className="w-full">
                <SelectValue placeholder="Select student enrollment" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.enrollment.id} value={s.enrollment.id}>
                    {s.student.fullName} ({s.enrollment.subject?.name || 'General Course'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Assignment */}
          <div className="space-y-2">
            <Label htmlFor="assignment">Assignment / Coursework *</Label>
            <Select 
              value={formAssignmentId} 
              onValueChange={setFormAssignmentId}
              disabled={!!editingGrade}
            >
              <SelectTrigger id="assignment" className="w-full">
                <SelectValue placeholder="Select assignment to grade" />
              </SelectTrigger>
              <SelectContent>
                {eligibleAssignments.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No assignments found for this student
                  </SelectItem>
                ) : (
                  eligibleAssignments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title} ({a.type})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Score & Max Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Earned Score *</Label>
              <Input
                id="score"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 85"
                value={formScore}
                onChange={(e) => setFormScore(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxScore">Maximum Score *</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 100"
                value={formMaxScore}
                onChange={(e) => setFormMaxScore(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Constructive Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Add qualitative comments, areas of strength, and tips for improvement..."
              rows={3}
              value={formFeedback}
              onChange={(e) => setFormFeedback(e.target.value)}
            />
          </div>

          {/* Feedback Attachment */}
          <div className="space-y-2">
            <Label htmlFor="feedbackAttachment">Feedback Attachment (Optional)</Label>
            <Input
              id="feedbackAttachment"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFeedbackAttachmentSelect}
              className="cursor-pointer"
              disabled={!!editingGrade}
            />
            <p className="text-xs text-muted-foreground">
              Upload an image or PDF with feedback (max 10MB)
            </p>
            {feedbackAttachment && (
              <div className="flex items-center gap-2 text-sm text-brand-gold">
                <CheckCircle2 className="h-4 w-4" />
                {feedbackAttachment.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFeedbackAttachment(null)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
            >
              {submitting ? 'Saving...' : editingGrade ? 'Update Grade' : 'Record Grade'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
