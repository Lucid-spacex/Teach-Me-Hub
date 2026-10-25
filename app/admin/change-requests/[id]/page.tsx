'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, ArrowLeft, Calendar, User, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { EnrollmentChangeRequest, ChangeRequestStatus } from '@/lib/types'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'
import { useEntityNotification } from '@/hooks/useEntityNotification'

export default function AdminChangeRequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [request, setRequest] = useState<EnrollmentChangeRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')

  // Mark notifications as read when viewing this request
  useEntityNotification('CHANGE_REQUEST', params.id as string)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadRequest()
  }, [router, params.id])

  const loadRequest = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminChangeRequestDetail(params.id as string)
      setRequest(data)
    } catch (error) {
      console.error('Failed to load change request:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load change request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Approving this change request will update the enrollment schedule. Future sessions that no longer fit the new schedule will be flagged. Continue?')) {
      return
    }

    try {
      await api.approveChangeRequest(params.id as string)
      toast({
        title: 'Request Approved',
        description: 'The schedule change has been approved',
      })
      loadRequest()
    } catch (error) {
      console.error('Failed to approve request:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve request',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      })
      return
    }

    try {
      await api.rejectChangeRequest(params.id as string, rejectionReason.trim())
      toast({
        title: 'Request Rejected',
        description: 'The schedule change has been rejected',
      })
      setRejectionReason('')
      loadRequest()
    } catch (error) {
      console.error('Failed to reject request:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject request',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: ChangeRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">Change request not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/change-requests')}
              className="gap-2 text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Change Request Details</h1>
              <p className="text-muted-foreground mt-2">Review the before and after schedule changes</p>
            </div>
          </div>
          <div className="flex gap-2">
            {request.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setRejectionReason('')}
                  className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Rejection Banner */}
        {request.status === 'REJECTED' && request.rejectionReason && (
          <Card className="bg-red-500/10 border-red-500/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-400">Request Rejected</p>
                  <p className="text-sm text-red-300 mt-1">{request.rejectionReason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Input */}
        {request.status === 'PENDING' && rejectionReason !== undefined && (
          <Card className="bg-card border-brand-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">Reject Request</CardTitle>
              <CardDescription className="text-muted-foreground">
                Provide a reason for rejecting this change request (required)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full min-h-[100px] bg-background border-input rounded-md p-3 text-foreground"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setRejectionReason('')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                  >
                    Reject Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-brand-gold" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(request.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="text-foreground font-medium">{request.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject</span>
                <span className="text-foreground font-medium">{request.subjectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested By</span>
                <span className="text-foreground font-medium">{request.requestedByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested</span>
                <span className="text-foreground font-medium">
                  {new Date(request.requestedAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-gold" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested At</span>
                <span className="text-foreground font-medium">
                  {new Date(request.requestedAt).toLocaleString()}
                </span>
              </div>
              {request.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewed At</span>
                  <span className="text-foreground font-medium">
                    {new Date(request.reviewedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {request.reviewedBy && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewed By</span>
                  <span className="text-foreground font-medium">{request.reviewedBy}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Before and After Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground">Current Schedule (Before)</CardTitle>
              <CardDescription className="text-muted-foreground">
                The existing enrollment schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Start Date</span>
                <p className="text-foreground font-medium">{new Date(request.before.startDate).toLocaleDateString()}</p>
              </div>
              {request.before.endDate && (
                <div>
                  <span className="text-muted-foreground text-sm block mb-1">End Date</span>
                  <p className="text-foreground font-medium">{new Date(request.before.endDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Session Frequency</span>
                <p className="text-foreground font-medium">{request.before.sessionFrequency}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Available Days</span>
                <p className="text-foreground font-medium">{request.before.availableDays.join(', ')}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Time Range</span>
                <p className="text-foreground font-medium">
                  {request.before.preferredStartHour}:00 - {request.before.preferredEndHour}:00
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground">Requested Schedule (After)</CardTitle>
              <CardDescription className="text-muted-foreground">
                The proposed new schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Start Date</span>
                <p className="text-foreground font-medium">{new Date(request.after.startDate).toLocaleDateString()}</p>
              </div>
              {request.after.endDate && (
                <div>
                  <span className="text-muted-foreground text-sm block mb-1">End Date</span>
                  <p className="text-foreground font-medium">{new Date(request.after.endDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Session Frequency</span>
                <p className="text-foreground font-medium">{request.after.sessionFrequency}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Available Days</span>
                <p className="text-foreground font-medium">{request.after.availableDays.join(', ')}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm block mb-1">Time Range</span>
                <p className="text-foreground font-medium">
                  {request.after.preferredStartHour}:00 - {request.after.preferredEndHour}:00
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
