'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/shared/Modal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Assignment, AssignmentSubmission } from '@/lib/types'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  User,
  School,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Paperclip,
  Calendar,
  Star,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TutorAssignmentDetailPage({ params }: PageProps) {
  const { id: assignmentId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [context, setContext] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)
  const [submissionDetails, setSubmissionDetails] = useState<Record<string, any>>({})
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null)

  // "Add to grade pool" — manual scored item for submissions the backend
  // didn't auto-convert (backend gap: submissions should create scored items)
  const [gradePoolOpen, setGradePoolOpen] = useState(false)
  const [gradePoolSubmission, setGradePoolSubmission] = useState<any>(null)
  const [gradePoolForm, setGradePoolForm] = useState({ maxScore: 100, score: '', comment: '' })
  const [creatingItem, setCreatingItem] = useState(false)
  const [addedToPool, setAddedToPool] = useState<Set<string>>(new Set())

  // Score submission - new backend endpoint
  const [scoreModalOpen, setScoreModalOpen] = useState(false)
  const [scoreSubmission, setScoreSubmission] = useState<any>(null)
  const [scoreForm, setScoreForm] = useState({ score: '', maxScore: 100, comment: '' })
  const [scoring, setScoring] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }
    loadData()
  }, [assignmentId, router])

  const loadData = async () => {
    setLoading(true)
    try {
      // GET /assignments/:id/schema returns the assignment plus enrollment
      // context (subject, student). Fall back to the assignments list.
      const [schema, subs] = await Promise.all([
        api.getAssignmentSchema(assignmentId).catch(() => null),
        api.getAssignmentSubmissions(assignmentId).catch(() => []),
      ])

      let found: Assignment | null = null
      if (schema) {
        setContext(schema)
        const a = schema.assignment ?? schema
        if (a?.id) found = a as Assignment
      }

      if (!found) {
        const all = await api.getAssignments().catch(() => [])
        found = all.find((a: Assignment) => a.id === assignmentId) ?? null
      }
      setAssignment(found)

      setSubmissions(Array.isArray(subs) ? subs : [])
    } catch (err) {
      console.error('Failed to load assignment:', err)
      toast({
        title: 'Error',
        description: 'Failed to load assignment details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSubmissionDetail = async (submissionId: string) => {
    if (expandedSubmission === submissionId) {
      setExpandedSubmission(null)
      return
    }
    setExpandedSubmission(submissionId)
    if (!submissionDetails[submissionId]) {
      setLoadingDetail(submissionId)
      try {
        const detail = await api.getAssignmentSubmissionDetail(assignmentId, submissionId)
        setSubmissionDetails(prev => ({ ...prev, [submissionId]: detail }))
      } catch {
        // Detail endpoint optional — list data already shown
      } finally {
        setLoadingDetail(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-brand-gold" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Assignment Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This assignment doesn&apos;t exist or isn&apos;t assigned to your students.
          </p>
          <Button onClick={() => router.push('/tutor/assignments')} className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark">
            Back to Assignments
          </Button>
        </div>
      </div>
    )
  }

  // Schema nests enrollment { subject, student }; tolerate flat shapes too
  const enrollment = context?.enrollment ?? context?.assignment?.enrollment ?? null
  const student = enrollment?.student ?? null
  const subject = enrollment?.subject ?? null
  const studentName = student?.fullName ?? student?.name ?? 'Student'
  const subjectName = subject?.name ?? 'Subject'

  const getField = (obj: any, ...keys: string[]) => {
    for (const k of keys) {
      const v = k.split('.').reduce((o: any, part) => o?.[part], obj)
      if (v !== undefined && v !== null && v !== '') return v
    }
    return null
  }

  const studentIdForItem = student?.id
  const enrollmentIdForItem = enrollment?.id

  const openGradePool = (sub: any) => {
    setGradePoolSubmission(sub)
    setGradePoolForm({ maxScore: 100, score: '', comment: '' })
    setGradePoolOpen(true)
  }

  const openScoreModal = (sub: any) => {
    setScoreSubmission(sub)
    setScoreForm({ score: '', maxScore: 100, comment: '' })
    setScoreModalOpen(true)
  }

  const handleScoreSubmission = async () => {
    if (!scoreSubmission?.id || !assignmentId) {
      toast({ title: 'Missing data', description: 'Cannot score submission', variant: 'destructive' })
      return
    }
    const scoreValue = Number(scoreForm.score)
    if (isNaN(scoreValue) || scoreValue < 0) {
      toast({ title: 'Validation Error', description: 'Score must be a non-negative number', variant: 'destructive' })
      return
    }
    if (scoreForm.maxScore <= 0) {
      toast({ title: 'Validation Error', description: 'Max score must be greater than 0', variant: 'destructive' })
      return
    }
    setScoring(true)
    try {
      await api.scoreAssignmentSubmission(assignmentId, scoreSubmission.id, {
        score: scoreValue,
        maxScore: scoreForm.maxScore,
        comment: scoreForm.comment || undefined,
      })
      toast({
        title: 'Submission Scored',
        description: 'The submission has been scored successfully',
      })
      setScoreModalOpen(false)
      loadData() // Refresh to show updated status
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to score submission',
        variant: 'destructive',
      })
    } finally {
      setScoring(false)
    }
  }

  const handleCreateScoredItem = async () => {
    if (!studentIdForItem || !enrollmentIdForItem || !gradePoolSubmission?.id || !assignment) {
      toast({ title: 'Missing data', description: 'Cannot create scored item — student or enrollment info unavailable', variant: 'destructive' })
      return
    }
    if (gradePoolForm.maxScore <= 0) {
      toast({ title: 'Validation Error', description: 'Max score must be greater than 0', variant: 'destructive' })
      return
    }
    setCreatingItem(true)
    try {
      await api.createScoredItem(studentIdForItem, {
        enrollmentId: enrollmentIdForItem,
        type: 'ASSIGNMENT_SUBMISSION',
        title: assignment.title,
        maxScore: gradePoolForm.maxScore,
        score: gradePoolForm.score !== '' ? Number(gradePoolForm.score) : undefined,
        comment: gradePoolForm.comment || undefined,
        assignmentId: assignment.id,
        submissionId: gradePoolSubmission.id,
      })
      setAddedToPool(prev => new Set(prev).add(gradePoolSubmission.id))
      toast({
        title: 'Added to grade pool',
        description: 'This submission can now be selected in Compile New Grade',
      })
      setGradePoolOpen(false)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create scored item',
        variant: 'destructive',
      })
    } finally {
      setCreatingItem(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tutor/assignments')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Button>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Assignment card */}
        <Card className="bg-card border-brand-gold/30">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl text-foreground">{assignment.title}</CardTitle>
                  <StatusBadge status={assignment.status} />
                  <Badge variant="outline" className="border-brand-gold/40 text-brand-gold">
                    {assignment.type}
                  </Badge>
                </div>
                <CardDescription className="text-base text-foreground/80">
                  {assignment.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-brand-gold" />
                Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-brand-gold" />
                Created: {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 text-brand-gold" />
                {assignment.attachmentUrl ? (
                  <a href={assignment.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                    View attachment
                  </a>
                ) : 'No attachment'}
              </div>
            </div>

            {/* Student / subject context from schema */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-gold/5 border border-brand-gold/20">
                <User className="h-5 w-5 text-brand-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="font-medium text-foreground">{studentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-gold/5 border border-brand-gold/20">
                <School className="h-5 w-5 text-brand-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="font-medium text-foreground">{subjectName}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card className="bg-card border-brand-gold/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-gold" />
              Submissions ({submissions.length})
            </CardTitle>
            <CardDescription>
              Student work submitted for this assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium">No submissions yet</p>
                <p className="text-xs mt-1">The student hasn&apos;t submitted this assignment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: any, idx: number) => {
                  const subId = getField(sub, 'id', 'submissionId') ?? `sub-${idx}`
                  const submitterName = getField(sub, 'student.fullName', 'studentName', 'fullName') ?? studentName
                  const submittedAt = getField(sub, 'submittedAt', 'gradedAt', 'createdAt')
                  const textAnswer = getField(sub, 'textAnswer', 'answer', 'content')
                  const attachments = getField(sub, 'attachments')
                  const attachmentUrl = getField(sub, 'attachmentUrl') ?? (Array.isArray(attachments) ? attachments[0]?.url ?? attachments[0] : attachments)
                  const feedback = getField(sub, 'tutorFeedback', 'feedback', 'comments')
                  const feedbackAttachment = getField(sub, 'tutorFeedbackAttachmentUrl', 'feedbackAttachmentUrl')
                  const isExpanded = expandedSubmission === subId
                  const detail = submissionDetails[subId]

                  return (
                    <div key={subId} className="rounded-lg border border-border/50 bg-card/50">
                      <button
                        type="button"
                        onClick={() => sub.id && toggleSubmissionDetail(sub.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gold/5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-brand-gold" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{submitterName}</p>
                            <p className="text-xs text-muted-foreground">
                              {submittedAt ? `Submitted ${new Date(submittedAt).toLocaleString()}` : 'Submitted'}
                              {sub.status ? ` • ${sub.status}` : ''}
                              {sub.scoredItem && (
                                <span className="ml-2 text-brand-gold">• Scored: {sub.scoredItem.score}/{sub.scoredItem.maxScore}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {sub.id && (isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />)}
                      </button>

                      <div className="px-4 pb-4 space-y-3">
                        {textAnswer && (
                          <div className="bg-background/60 p-3 rounded-md border border-border/30">
                            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Student Answer
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{textAnswer}</p>
                          </div>
                        )}
                        {attachmentUrl && (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:underline"
                          >
                            <Paperclip className="h-3 w-3" /> View attachment
                          </a>
                        )}
                        {feedback && (
                          <div className="bg-brand-gold/10 p-3 rounded-md border border-brand-gold/30">
                            <p className="text-xs font-medium text-brand-gold mb-1">Feedback</p>
                            <p className="text-sm text-foreground italic">{feedback}</p>
                          </div>
                        )}
                        {feedbackAttachment && (
                          <a
                            href={feedbackAttachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:underline"
                          >
                            <FileText className="h-3 w-3" /> View feedback attachment
                          </a>
                        )}

                        {sub.id && studentIdForItem && enrollmentIdForItem && (
                          <>
                            {sub.status === 'SUBMITTED' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openScoreModal(sub)}
                                className="gap-1.5 text-xs bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                              >
                                <Star className="h-3 w-3" />
                                Score
                              </Button>
                            )}
                            {sub.status === 'GRADED' && (
                              <p className="text-xs text-green-500 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3 w-3" /> Graded
                              </p>
                            )}
                            {sub.status !== 'GRADED' && !addedToPool.has(sub.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openGradePool(sub)}
                                className="gap-1.5 text-xs border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                              >
                                <Star className="h-3 w-3" />
                                Add to Grade Pool
                              </Button>
                            )}
                            {addedToPool.has(sub.id) && (
                              <p className="text-xs text-green-500 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3 w-3" /> Added to grade pool
                              </p>
                            )}
                          </>
                        )}

                        {/* Expanded detail from GET /assignments/:id/submissions/:submissionId */}
                        {isExpanded && (
                          <div className="pt-2 border-t border-border/30">
                            {loadingDetail === subId ? (
                              <LoadingSpinner size="sm" className="text-brand-gold" />
                            ) : detail ? (
                              <div className="space-y-2 text-xs text-muted-foreground">
                                {getField(detail, 'gradedAt') && (
                                  <p>Graded: {new Date(getField(detail, 'gradedAt')).toLocaleString()}</p>
                                )}
                                {getField(detail, 'status') && <p>Status: {getField(detail, 'status')}</p>}
                                {getField(detail, 'score') != null && <p>Score: {getField(detail, 'score')}</p>}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No additional details available.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Submission modal */}
      <Modal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        title="Score Submission"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Score this submission for <span className="font-medium text-foreground">{assignment.title}</span>.
          </p>
          <div className="space-y-2">
            <Label htmlFor="scoreValue">Score *</Label>
            <Input
              id="scoreValue"
              type="number"
              min="0"
              max={scoreForm.maxScore}
              value={scoreForm.score}
              onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })}
              placeholder={`0 - ${scoreForm.maxScore}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scoreMaxScore">Maximum Score *</Label>
            <Input
              id="scoreMaxScore"
              type="number"
              min="1"
              value={scoreForm.maxScore}
              onChange={(e) => setScoreForm({ ...scoreForm, maxScore: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scoreComment">Comment (optional)</Label>
            <Textarea
              id="scoreComment"
              value={scoreForm.comment}
              onChange={(e) => setScoreForm({ ...scoreForm, comment: e.target.value })}
              placeholder="Add feedback for the student..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setScoreModalOpen(false)}
              disabled={scoring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScoreSubmission}
              disabled={scoring}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {scoring ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {scoring ? 'Scoring...' : 'Score Submission'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add to Grade Pool modal */}
      <Modal
        isOpen={gradePoolOpen}
        onClose={() => setGradePoolOpen(false)}
        title="Add Submission to Grade Pool"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Creates a scored item for <span className="font-medium text-foreground">{assignment.title}</span> so it can be selected in Compile New Grade.
          </p>
          <div className="space-y-2">
            <Label htmlFor="gpMaxScore">Maximum Score *</Label>
            <Input
              id="gpMaxScore"
              type="number"
              min="1"
              value={gradePoolForm.maxScore}
              onChange={(e) => setGradePoolForm({ ...gradePoolForm, maxScore: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gpScore">Score (optional)</Label>
            <Input
              id="gpScore"
              type="number"
              min="0"
              max={gradePoolForm.maxScore}
              value={gradePoolForm.score}
              onChange={(e) => setGradePoolForm({ ...gradePoolForm, score: e.target.value })}
              placeholder={`0 - ${gradePoolForm.maxScore}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gpComment">Comment (optional)</Label>
            <Textarea
              id="gpComment"
              value={gradePoolForm.comment}
              onChange={(e) => setGradePoolForm({ ...gradePoolForm, comment: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setGradePoolOpen(false)} disabled={creatingItem}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateScoredItem}
              disabled={creatingItem}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {creatingItem ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Add to Grade Pool
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
