'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, ArrowLeft, FileText, User, Calendar, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { CompiledGrade, GradeStatus, GradeComponent } from '@/lib/types'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'
import { useEntityNotification } from '@/hooks/useEntityNotification'

export default function AdminGradeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [grade, setGrade] = useState<CompiledGrade | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Mark notifications as read when viewing this grade
  useEntityNotification('GRADE', params.id as string)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadGrade()
  }, [router, params.id])

  const loadGrade = async () => {
    setLoading(true)
    try {
      const data = await api.getCompiledGradeDetail(params.id as string)
      setGrade(data)
    } catch (error) {
      console.error('Failed to load grade:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load grade',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      await api.approveCompiledGrade(params.id as string)
      toast({
        title: 'Grade Approved',
        description: 'The grade has been approved successfully',
      })
      loadGrade()
    } catch (error) {
      console.error('Failed to approve grade:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve grade',
        variant: 'destructive',
      })
    } finally {
      setApproving(false)
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

    setRejecting(true)
    try {
      await api.rejectCompiledGrade(params.id as string, rejectionReason.trim())
      toast({
        title: 'Grade Rejected',
        description: 'The grade has been rejected',
      })
      setRejectionReason('')
      loadGrade()
    } catch (error) {
      console.error('Failed to reject grade:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject grade',
        variant: 'destructive',
      })
    } finally {
      setRejecting(false)
    }
  }

  const getStatusBadge = (status: GradeStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      case 'PENDING_APPROVAL':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending Approval</Badge>
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

  if (!grade) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">Grade not found</div>
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
              onClick={() => router.push('/admin/grades')}
              className="gap-2 text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Grade Details</h1>
              <p className="text-muted-foreground mt-2">Review the full grade breakdown</p>
            </div>
          </div>
          <div className="flex gap-2">
            {grade.status === 'PENDING_APPROVAL' && (
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
                  disabled={approving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Rejection Banner */}
        {grade.status === 'REJECTED' && grade.rejectionReason && (
          <Card className="bg-red-500/10 border-red-500/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-400">Grade Rejected</p>
                  <p className="text-sm text-red-300 mt-1">{grade.rejectionReason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Input */}
        {grade.status === 'PENDING_APPROVAL' && rejectionReason !== undefined && (
          <Card className="bg-card border-brand-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">Reject Grade</CardTitle>
              <CardDescription className="text-muted-foreground">
                Provide a reason for rejecting this grade (required)
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
                    disabled={rejecting || !rejectionReason.trim()}
                  >
                    {rejecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Reject Grade'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grade Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-gold" />
                Grade Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(grade.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period</span>
                <span className="text-foreground font-medium">{grade.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student ID</span>
                <span className="text-foreground font-medium">{grade.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tutor ID</span>
                <span className="text-foreground font-medium">{grade.tutorId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attendance Rate</span>
                <span className="text-foreground font-medium">{grade.attendanceRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-brand-gold" />
                Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Computed Score</span>
                <span className="text-foreground font-bold text-lg">{grade.computedScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Final Score</span>
                <span className="text-foreground font-bold text-lg">
                  {grade.finalScore ? grade.finalScore.toFixed(1) + '%' : 'N/A'}
                </span>
              </div>
              {grade.overrideReason && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm block mb-1">Override Reason</span>
                  <p className="text-foreground text-sm">{grade.overrideReason}</p>
                </div>
              )}
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
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground font-medium">
                  {new Date(grade.createdAt).toLocaleDateString()}
                </span>
              </div>
              {grade.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="text-foreground font-medium">
                    {new Date(grade.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {grade.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="text-foreground font-medium">
                    {new Date(grade.approvedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {grade.rejectedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rejected</span>
                  <span className="text-foreground font-medium">
                    {new Date(grade.rejectedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Component Breakdown */}
        <Card className="bg-card border-brand-gold/30 mb-6">
          <CardHeader>
            <CardTitle className="text-foreground">Component Breakdown</CardTitle>
            <CardDescription className="text-muted-foreground">
              Grade components with weights and item counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grade.components.map((component, index) => (
                <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{component.type}</h4>
                    <Badge variant="outline">{component.weight}% weight</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Items</span>
                      <p className="text-foreground font-medium">{component.itemCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Component %</span>
                      <p className="text-foreground font-medium">{component.componentPercentage?.toFixed(1) || 0}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tutor Comment */}
        {grade.tutorComment && (
          <Card className="bg-card border-brand-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-brand-gold" />
                Tutor Comment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{grade.tutorComment}</p>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {grade.attachments && grade.attachments.length > 0 && (
          <Card className="bg-card border-brand-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {grade.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold hover:underline"
                    >
                      {attachment.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Frozen Snapshot Items */}
        {grade.frozenSnapshotItems && grade.frozenSnapshotItems.length > 0 && (
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground">Frozen Snapshot Items</CardTitle>
              <CardDescription className="text-muted-foreground">
                Items included in this grade at the time of submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grade.frozenSnapshotItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <div>
                      <p className="text-foreground font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">
                        {item.tutorScore !== null ? item.tutorScore : item.autoScore} / {item.maxScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
