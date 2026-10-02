'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Complaint, ComplaintAboutType, TutorStudent } from '@/lib/types'
import {
  AlertCircle,
  Plus,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  ShieldAlert,
} from 'lucide-react'

export default function TutorComplaintsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [aboutType, setAboutType] = useState<ComplaintAboutType>('GENERAL')
  const [aboutId, setAboutId] = useState<string>('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadComplaints()
    loadStudents()
  }, [router])

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const data = await api.getComplaints()
      setComplaints(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load complaints:', err)
      toast({
        title: 'Error',
        description: 'Failed to load complaints',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const data = await api.getTutorStudents()
      setStudents(Array.isArray(data) ? data : [])
    } catch {
      // Ignore if student lookup fails
    }
  }

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please describe the issue in detail.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const payload: { aboutType: ComplaintAboutType; aboutId?: string; description: string } = {
        aboutType,
        description: description.trim(),
      }
      if (aboutType === 'STUDENT' && aboutId) {
        payload.aboutId = aboutId
      }

      await api.fileComplaint(payload)
      toast({
        title: 'Complaint Submitted',
        description: 'Your report has been received. Our admin team will investigate and respond.',
      })
      setModalOpen(false)
      setDescription('')
      setAboutId('')
      setAboutType('GENERAL')
      loadComplaints()
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err instanceof Error ? err.message : 'Could not submit complaint',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                <ShieldAlert className="h-6 w-6 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Complaints & Disputes</h1>
                <p className="text-sm text-muted-foreground">
                  Report student behavior, session irregularities, or platform support issues to administration.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadComplaints}
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
              File Complaint
            </Button>
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" className="text-brand-gold mb-3" />
            <p className="text-sm text-muted-foreground">Loading your reports...</p>
          </div>
        ) : complaints.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-brand-gold/80" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No complaints recorded</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-5">
                You have not filed any complaints or disputes. If you experience issues with a student or session, submit a report below.
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" />
                File a Complaint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="border-border/60 bg-card/60 hover:bg-card transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {complaint.aboutType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Filed on {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-foreground pt-1">
                        Report #{complaint.id.slice(-6).toUpperCase()}
                      </h4>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
                        complaint.status === 'RESOLVED'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {complaint.status === 'RESOLVED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          Under Review
                        </>
                      )}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="bg-background/60 p-3.5 rounded-xl border border-border/40">
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                      Description
                    </p>
                    <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  {complaint.adminReply ? (
                    <div className="bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Admin Resolution Note</span>
                        {complaint.resolvedAt && (
                          <span className="text-muted-foreground font-normal ml-auto text-[11px]">
                            {new Date(complaint.resolvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {complaint.adminReply}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Administration is reviewing this report. You will receive an update here once resolved.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* File Complaint Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="File a Complaint"
      >
        <form onSubmit={handleFileComplaint} className="space-y-4 pt-2">
          {/* Issue Type */}
          <div className="space-y-2">
            <Label htmlFor="aboutType">What is this issue regarding? *</Label>
            <Select
              value={aboutType}
              onValueChange={(val) => setAboutType(val as ComplaintAboutType)}
            >
              <SelectTrigger id="aboutType">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General Platform or Support Issue</SelectItem>
                <SelectItem value="STUDENT">Student or Attendance Concern</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Student selection if type is STUDENT */}
          {aboutType === 'STUDENT' && (
            <div className="space-y-2">
              <Label htmlFor="aboutStudent">Select Related Student (Optional)</Label>
              <Select value={aboutId} onValueChange={setAboutId}>
                <SelectTrigger id="aboutStudent">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.student.id} value={s.student.id}>
                      {s.student.fullName} ({s.enrollment.subject?.name || 'Subject'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what occurred, dates, and any relevant details..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Modal Actions */}
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
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
