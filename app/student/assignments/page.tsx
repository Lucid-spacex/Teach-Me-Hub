'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/shared/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { QuizTakingModal } from '@/components/student/QuizTakingModal'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Assignment, AssignmentSubmission } from '@/lib/types'
import { BookOpen, ArrowLeft, RefreshCw, PlayCircle, Upload, FileText, CheckCircle2, Trash2, Loader2 } from 'lucide-react'

export default function StudentAssignmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL')

  // Quiz state
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  // Submission modal state
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission>>({})

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadAssignments()
  }, [router])

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const data = await api.getStudentAssignments()
      setAssignments(Array.isArray(data) ? data : [])
      
      // Load submissions for each assignment
      const submissionPromises = data.map(async (assignment: Assignment) => {
        try {
          const submission = await api.getAssignmentSubmission(assignment.id)
          return { assignmentId: assignment.id, submission }
        } catch {
          return { assignmentId: assignment.id, submission: null }
        }
      })
      
      const submissionResults = await Promise.all(submissionPromises)
      const submissionsMap: Record<string, AssignmentSubmission> = {}
      submissionResults.forEach(({ assignmentId, submission }) => {
        if (submission) {
          submissionsMap[assignmentId] = submission
        }
      })
      setSubmissions(submissionsMap)
    } catch (err) {
      console.error('Failed to load assignments:', err)
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setQuizModalOpen(true)
  }

  const handleOpenSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setSubmissionText('')
    setSubmissionFile(null)
    setSubmissionModalOpen(true)
  }

  const handleSubmissionFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image (JPEG, PNG, GIF, WebP) or PDF file',
        variant: 'destructive',
      })
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      })
      return
    }

    setSubmissionFile(file)
  }

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    if (!submissionText.trim() && !submissionFile) {
      toast({
        title: 'Missing content',
        description: 'Please provide a text answer or attach a file',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      await api.submitAssignment(selectedAssignment.id, {
        textAnswer: submissionText.trim() || undefined,
        attachment: submissionFile || undefined,
      })
      toast({
        title: 'Assignment submitted',
        description: 'Your assignment has been submitted successfully',
      })
      setSubmissionModalOpen(false)
      setSubmissionText('')
      setSubmissionFile(null)
      loadAssignments()
    } catch (error) {
      console.error('Failed to submit assignment:', error)
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Failed to submit assignment',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = assignments.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Assignments & Quizzes</h1>
              <p className="text-sm text-muted-foreground">Complete tasks, practice exercises, and online test quizzes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-card border border-brand-gold/20 p-1">
              {(['ALL', 'PENDING', 'SUBMITTED', 'GRADED'] as const).map(st => (
                <Button
                  key={st}
                  variant={statusFilter === st ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(st)}
                  className={statusFilter === st ? 'bg-brand-gold text-brand-dark text-xs font-semibold' : 'text-muted-foreground text-xs'}
                >
                  {st}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAssignments}
              disabled={loading}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              <RefreshCw className="h-4 w-4" />
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
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Assignments Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {statusFilter === 'ALL'
                  ? 'Your tutor has not posted any assignments or tests yet.'
                  : `No assignments with status "${statusFilter}".`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const isTest = item.type === 'TEST'
              const submission = submissions[item.id]
              const hasSubmitted = item.status === 'SUBMITTED' || item.status === 'GRADED'
              return (
                <Card key={item.id} className="bg-card border-brand-gold/25 hover:border-brand-gold/40 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                        isTest ? 'bg-purple-500/20 text-purple-300' : 'bg-brand-gold/20 text-brand-gold'
                      }`}>
                        {item.type}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        item.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        item.status === 'SUBMITTED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-foreground font-semibold line-clamp-1">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs">
                      Due: {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.description || 'No additional instructions.'}
                    </p>

                    {item.attachmentUrl && (
                      <div className="flex items-center gap-2 text-xs text-brand-gold">
                        <FileText className="h-3 w-3" />
                        <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View attachment
                        </a>
                      </div>
                    )}

                    {submission?.tutorFeedback && (
                      <div className="bg-card/80 p-2 rounded-lg border border-border/30">
                        <p className="text-xs font-medium text-brand-gold mb-1">Tutor Feedback:</p>
                        <p className="text-xs text-muted-foreground italic">{submission.tutorFeedback}</p>
                      </div>
                    )}

                    {isTest && item.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        onClick={() => handleStartQuiz(item)}
                        className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold mt-2 gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Take Quiz Now
                      </Button>
                    ) : !isTest && !hasSubmitted ? (
                      <Button
                        size="sm"
                        onClick={() => handleOpenSubmitModal(item)}
                        className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold mt-2 gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Submit Assignment
                      </Button>
                    ) : hasSubmitted ? (
                      <div className="text-xs text-muted-foreground text-center mt-2">
                        Submitted on {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      {/* Quiz Taking Modal */}
      {selectedAssignment && (
        <QuizTakingModal
          open={quizModalOpen}
          onOpenChange={setQuizModalOpen}
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
          onSuccess={loadAssignments}
        />
      )}

      {/* Assignment Submission Modal */}
      <Modal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        title="Submit Assignment"
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="submissionText">Text Answer</Label>
            <Textarea
              id="submissionText"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionFile">Attachment (Optional)</Label>
            <Input
              id="submissionFile"
              type="file"
              accept="image/*,.pdf"
              onChange={handleSubmissionFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Upload an image or PDF (max 10MB)
            </p>
            {submissionFile && (
              <div className="flex items-center gap-2 text-sm text-brand-gold">
                <CheckCircle2 className="h-4 w-4" />
                {submissionFile.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubmissionFile(null)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubmissionModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Assignment'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
