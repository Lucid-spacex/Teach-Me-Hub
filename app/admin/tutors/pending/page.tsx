'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { TutorWithProfile, VettingStatus } from '@/lib/types'
import { UserCheck, ArrowLeft, RefreshCw, Users, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'NONE'

// The tutor list response nests application data differently across
// endpoints — check top-level and nested locations tolerantly.
function getApplicationStatus(tutor: any): ApplicationStatus {
  const raw =
    tutor?.applicationStatus ??
    tutor?.application?.applicationStatus ??
    tutor?.application?.status ??
    tutor?.tutorApplication?.applicationStatus ??
    tutor?.tutorApplication?.status ??
    tutor?.user?.applicationStatus ??
    tutor?.user?.application?.status ??
    'NONE'
  return raw === 'DRAFT' || raw === 'SUBMITTED' ? raw : 'NONE'
}

function getSubmittedAt(tutor: any): string | undefined {
  return (
    tutor?.submittedAt ??
    tutor?.application?.submittedAt ??
    tutor?.tutorApplication?.submittedAt ??
    tutor?.user?.application?.submittedAt ??
    undefined
  )
}

export default function AdminPendingTutorsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTutorId, setRejectTutorId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadTutors()
  }, [router, applicationStatusFilter])

  const loadTutors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', 'PENDING_VETTING')
      if (applicationStatusFilter !== 'ALL') {
        params.append('applicationStatus', applicationStatusFilter)
      }

      const response = await api.getTutors(params.toString())
      const data = (response as any)?.data || response
      const tutorsArray = Array.isArray(data) ? data : []
      if (tutorsArray.length > 0) {
        console.log('Pending tutors raw row:', tutorsArray[0])
      }

      // Sort SUBMITTED first, then others
      const sortedTutors = tutorsArray.sort((a: any, b: any) => {
        const aStatus = getApplicationStatus(a)
        const bStatus = getApplicationStatus(b)
        if (aStatus === 'SUBMITTED' && bStatus !== 'SUBMITTED') return -1
        if (aStatus !== 'SUBMITTED' && bStatus === 'SUBMITTED') return 1
        return 0
      })

      setTutors(sortedTutors)
    } catch (err) {
      console.error('Failed to load pending tutors:', err)
      setTutors([])
      toast({
        title: 'Error',
        description: 'Failed to load pending tutors',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVetting = async (tutorId: string, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED') {
      setRejectTutorId(tutorId)
      setRejectDialogOpen(true)
      return
    }

    setActionLoading(tutorId)
    try {
      await api.updateTutorVetting(tutorId, { vettingStatus: status })
      toast({
        title: 'Success',
        description: `Tutor ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`,
      })
      loadTutors()
    } catch (err) {
      console.error('Failed to update vetting:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update vetting status',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTutorId || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Rejection reason is required',
        variant: 'destructive',
      })
      return
    }

    setActionLoading(rejectTutorId)
    try {
      await api.updateTutorVetting(rejectTutorId, { vettingStatus: 'REJECTED', rejectionReason: rejectionReason.trim() })
      toast({
        title: 'Success',
        description: 'Tutor rejected successfully',
      })
      setRejectDialogOpen(false)
      setRejectionReason('')
      setRejectTutorId(null)
      loadTutors()
    } catch (err) {
      console.error('Failed to reject tutor:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to reject tutor',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="gap-2 text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold/20 p-2 rounded-lg border border-brand-gold/30">
              <UserCheck className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Pending Tutors</h1>
              <p className="text-sm text-muted-foreground">Review and approve tutor applications</p>
            </div>
          </div>
        </div>
        <Button
          onClick={loadTutors}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={applicationStatusFilter} onValueChange={(value: ApplicationStatus | 'ALL') => setApplicationStatusFilter(value)}>
            <SelectTrigger className="w-[180px] bg-card border-brand-gold/30 text-white">
              <SelectValue placeholder="Application Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-brand-gold/30">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="NONE">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tutors List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : tutors.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Pending Tutors</h3>
            <p className="text-sm text-muted-foreground">All tutor applications have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tutors.map((tutor) => {
            const applicationStatus = getApplicationStatus(tutor)
            const submittedAt = getSubmittedAt(tutor)
            const isSubmitted = applicationStatus === 'SUBMITTED'
            const tutorId = tutor.id || tutor.tutorProfile?.id || ''

            return (
              <Card key={tutorId} className="bg-card border-brand-gold/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white">{tutor.fullName || (tutor as any).user?.fullName || 'Tutor'}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{tutor.email || (tutor as any).user?.email || 'No email'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isSubmitted
                            ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40'
                            : 'bg-gray-700/50 text-muted-foreground border border-gray-600/40'
                        }`}
                      >
                        {applicationStatus}
                      </span>
                      <StatusBadge status={tutor.tutorProfile?.vettingStatus || tutor.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submittedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted At</p>
                        <p className="text-white text-sm">{new Date(submittedAt).toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Subjects</p>
                      <p className="text-white">{tutor.tutorProfile?.subjects?.join(', ') || 'No subjects listed'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bio</p>
                      <p className="text-white text-sm">{tutor.tutorProfile?.bio || 'No bio provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="text-white">${tutor.tutorProfile?.monthlySalaryNGN || 0}/hour</p>
                    </div>
                    {tutor.tutorProfile?.credentialsUrl && (
                      <div>
                        <p className="text-sm text-muted-foreground">Credentials</p>
                        <a
                          href={tutor.tutorProfile.credentialsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-gold hover:underline text-sm"
                        >
                          View credentials
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleVetting(tutorId, 'APPROVED')}
                        disabled={actionLoading === tutorId || !isSubmitted}
                        className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                      >
                        {actionLoading === tutorId ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button
                        onClick={() => handleVetting(tutorId, 'REJECTED')}
                        disabled={actionLoading === tutorId}
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        {actionLoading === tutorId ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Reject'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="modal-split w-[calc(100%-2rem)] md:max-w-5xl">
          <DialogHeader className="modal-split__aside">
            <DialogTitle>Reject Tutor Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this tutor application. This will be sent to the tutor.
            </DialogDescription>
          </DialogHeader>
          <div className="modal-split__main">
            <div className="modal-split__scroll">
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="rejectionReason" className="text-sm font-medium text-foreground">
                    Rejection Reason <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="modal-split__footer">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false)
                  setRejectionReason('')
                  setRejectTutorId(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading !== null || !rejectionReason.trim()}
              >
                {actionLoading !== null ? <LoadingSpinner size="sm" /> : 'Reject Application'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
