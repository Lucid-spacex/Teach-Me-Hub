'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { QuizQuestionsModal } from '@/components/tutor/QuizQuestionsModal'
import { Assignment, Enrollment, AssignmentType, AssignmentSubmission } from '@/lib/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { ArrowLeft, FileText, Plus, Clock, CheckCircle, AlertCircle, Edit, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function TutorAssignmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission>>({})
  const [loading, setLoading] = useState(true)
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  
  // Assignment form state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    enrollmentId: '',
    title: '',
    description: '',
    type: 'ASSIGNMENT' as AssignmentType,
    dueDate: ''
  })

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [assignmentsData, enrollmentsData] = await Promise.all([
        api.getAssignments(),
        api.getEnrollments()
      ])
      // Filter assignments for this tutor's enrollments
      const tutorEnrollments = enrollmentsData.filter(e => e.tutorId !== null)
      const tutorAssignmentIds = tutorEnrollments.map(e => e.id)
      const tutorAssignments = assignmentsData.filter(a => tutorAssignmentIds.includes(a.enrollmentId))
      setAssignments(tutorAssignments)
      setEnrollments(tutorEnrollments)

      // Load submissions for each assignment
      const submissionPromises = tutorAssignments.map(async (assignment: Assignment) => {
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

  const handleOpenQuizModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setQuizModalOpen(true)
  }

  const handleOpenCreateModal = () => {
    setEditingAssignment(null)
    setAttachmentFile(null)
    setUploadProgress(0)
    setFormData({
      enrollmentId: '',
      title: '',
      description: '',
      type: 'ASSIGNMENT',
      dueDate: ''
    })
    setAssignmentModalOpen(true)
  }

  const handleOpenEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setAttachmentFile(null)
    setUploadProgress(0)
    setFormData({
      enrollmentId: assignment.enrollmentId,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : ''
    })
    setAssignmentModalOpen(true)
  }

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setAttachmentFile(file)
  }

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.enrollmentId || !formData.title || !formData.description) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    setUploadProgress(0)
    try {
      if (editingAssignment) {
        await api.updateAssignment(editingAssignment.id, {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          attachment: attachmentFile || undefined,
        })
        toast({
          title: 'Assignment updated',
          description: 'Assignment has been updated successfully',
        })
      } else {
        await api.createAssignment({
          enrollmentId: formData.enrollmentId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          attachment: attachmentFile || undefined,
        })
        toast({
          title: 'Assignment created',
          description: 'Assignment has been created successfully',
        })
      }
      setAssignmentModalOpen(false)
      setAttachmentFile(null)
      loadData()
    } catch (error) {
      console.error('Failed to save assignment:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save assignment',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return
    }

    setDeleting(assignmentId)
    try {
      await api.deleteAssignment(assignmentId)
      toast({
        title: 'Assignment deleted',
        description: 'Assignment has been deleted successfully',
      })
      loadData()
    } catch (error) {
      console.error('Failed to delete assignment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete assignment'
      toast({
        title: 'Delete failed',
        description: errorMessage.includes('submission') 
          ? "Can't delete — the student has already submitted work for this assignment"
          : errorMessage,
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" text="Loading assignments..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tutor')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="bg-brand-gold/20 p-2 rounded-lg border border-brand-gold/30">
                <FileText className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
                <p className="text-sm text-muted-foreground">Manage assignments and quiz questions</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Assignment
          </Button>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <Card className="bg-card border-brand-gold/30">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assignments found</p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => {
              const enrollment = enrollments.find(e => e.id === assignment.enrollmentId)
              const student = enrollment?.student
              const submission = submissions[assignment.id]

              return (
                <Card key={assignment.id} className="bg-card border-brand-gold/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-foreground">{assignment.title}</CardTitle>
                          <StatusBadge status={assignment.status} />
                          <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-1 rounded">
                            {assignment.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}
                          </span>
                          {student && (
                            <span>Student: {student.fullName}</span>
                          )}
                        </div>
                        {submission && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-brand-gold" />
                              <span className="text-brand-gold font-medium">
                                Submitted on {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {submission.textAnswer && (
                              <div className="bg-card/80 p-2 rounded-lg border border-border/30">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Student Answer:</p>
                                <p className="text-xs text-foreground line-clamp-2">{submission.textAnswer}</p>
                              </div>
                            )}
                            {submission.attachmentUrl && (
                              <div className="flex items-center gap-2 text-xs text-brand-gold">
                                <FileText className="h-3 w-3" />
                                <a href={submission.attachmentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  View student attachment
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.type === 'TEST' && (
                          <Button
                            onClick={() => handleOpenQuizModal(assignment)}
                            className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Quiz
                          </Button>
                        )}
                        <Button
                          onClick={() => handleOpenEditModal(assignment)}
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deleting === assignment.id}
                        >
                          {deleting === assignment.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })
          )}
        </div>

        {/* Quiz Questions Modal */}
        {selectedAssignment && (
          <QuizQuestionsModal
            open={quizModalOpen}
            onOpenChange={setQuizModalOpen}
            assignmentId={selectedAssignment.id}
            assignmentTitle={selectedAssignment.title}
            onSuccess={loadData}
          />
        )}

        {/* Assignment Create/Edit Modal */}
        <Modal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          title={editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
        >
          <form onSubmit={handleSaveAssignment} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="enrollmentId">Student/Enrollment *</Label>
              <Select
                value={formData.enrollmentId}
                onValueChange={(value) => setFormData({ ...formData, enrollmentId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map((enrollment) => (
                    <SelectItem key={enrollment.id} value={enrollment.id}>
                      {enrollment.student?.fullName || 'Unknown'} - {enrollment.subject?.name || 'Unknown Subject'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Assignment title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Assignment description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: AssignmentType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  <SelectItem value="CLASSWORK">Classwork</SelectItem>
                  <SelectItem value="TEST">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment (Optional)</Label>
              <Input
                id="attachment"
                type="file"
                accept="image/*,.pdf"
                onChange={handleAttachmentSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Upload an image or PDF (max 10MB)
              </p>
              {attachmentFile && (
                <div className="flex items-center gap-2 text-sm text-brand-gold">
                  <CheckCircle2 className="h-4 w-4" />
                  {attachmentFile.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachmentFile(null)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {editingAssignment?.attachmentUrl && !attachmentFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Current: {editingAssignment.attachmentUrl.split('/').pop()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignmentModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingAssignment ? 'Update Assignment' : 'Create Assignment'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
