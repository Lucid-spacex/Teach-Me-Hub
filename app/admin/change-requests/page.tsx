'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, Filter, ArrowLeft, Calendar, User } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { EnrollmentChangeRequest, ChangeRequestStatus } from '@/lib/types'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function AdminChangeRequestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<EnrollmentChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ChangeRequestStatus | ''>('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadRequests()
  }, [router, statusFilter])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const response = await api.getAdminChangeRequests({
        status: statusFilter || undefined,
      })
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to load change requests:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load change requests',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!confirm('Approving this change request will update the enrollment schedule. Future sessions that no longer fit the new schedule will be flagged. Continue?')) {
      return
    }

    try {
      await api.approveChangeRequest(requestId)
      toast({
        title: 'Request Approved',
        description: 'The schedule change has been approved',
      })
      loadRequests()
    } catch (error) {
      console.error('Failed to approve request:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve request',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (requestId: string) => {
    const reason = prompt('Enter rejection reason (required):')
    if (!reason || !reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      })
      return
    }

    try {
      await api.rejectChangeRequest(requestId, reason.trim())
      toast({
        title: 'Request Rejected',
        description: 'The schedule change has been rejected',
      })
      loadRequests()
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

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="gap-2 text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Enrollment Change Requests</h1>
            <p className="text-muted-foreground mt-2">Review and approve schedule change requests from parents</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-card border-brand-gold/30 mb-6">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5 text-brand-gold" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ChangeRequestStatus | '')}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No change requests found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              There are no change requests matching your current filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-card border-brand-gold/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-foreground">
                          {request.studentName} - {request.subjectName}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block">Requested By</span>
                            <p className="text-foreground font-medium">{request.requestedByName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground block">Requested</span>
                            <p className="text-foreground font-medium">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {request.rejectionReason && (
                        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded mb-4">
                          <p className="text-sm text-red-400">
                            <span className="font-semibold">Rejection Reason:</span> {request.rejectionReason}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/change-requests/${request.id}`)}
                          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                        >
                          View Details
                        </Button>
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                              className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
