'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, Filter, ArrowLeft, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { CompiledGrade, GradeStatus } from '@/lib/types'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'

export default function AdminGradesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [grades, setGrades] = useState<CompiledGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'PENDING_APPROVAL' as GradeStatus | '',
    tutorId: '',
    studentId: '',
    subject: '',
  })
  const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set())
  const [bulkApproving, setBulkApproving] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadGrades()
  }, [router, filters])

  const loadGrades = async () => {
    setLoading(true)
    try {
      const response = await api.getGrades()
      setGrades(response.filter(g => g.status === 'PENDING_APPROVAL'))
    } catch (error) {
      console.error('Failed to load grades:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load grades',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (gradeId: string) => {
    try {
      await api.approveCompiledGrade(gradeId)
      toast({
        title: 'Grade Approved',
        description: 'The grade has been approved successfully',
      })
      loadGrades()
    } catch (error) {
      console.error('Failed to approve grade:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve grade',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (gradeId: string, reason: string) => {
    try {
      await api.rejectCompiledGrade(gradeId, reason)
      toast({
        title: 'Grade Rejected',
        description: 'The grade has been rejected',
      })
      loadGrades()
    } catch (error) {
      console.error('Failed to reject grade:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject grade',
        variant: 'destructive',
      })
    }
  }

  const handleBulkApprove = async () => {
    if (selectedGrades.size === 0) {
      toast({
        title: 'No grades selected',
        description: 'Please select at least one grade to approve',
        variant: 'destructive',
      })
      return
    }

    setBulkApproving(true)
    try {
      const gradeIds = Array.from(selectedGrades)
      const response = await api.bulkApproveCompiledGrades(gradeIds)

      const successCount = response.results.filter(r => r.success).length
      const failCount = response.results.filter(r => !r.success).length

      toast({
        title: 'Bulk Approval Complete',
        description: `${successCount} grades approved, ${failCount} failed`,
      })

      setSelectedGrades(new Set())
      loadGrades()
    } catch (error) {
      console.error('Failed to bulk approve grades:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to bulk approve grades',
        variant: 'destructive',
      })
    } finally {
      setBulkApproving(false)
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

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              <h1 className="text-3xl font-bold text-foreground">Grade Review Queue</h1>
              <p className="text-muted-foreground mt-2">Review and approve tutor-submitted grades</p>
            </div>
          </div>
          {selectedGrades.size > 0 && (
            <Button
              onClick={handleBulkApprove}
              disabled={bulkApproving}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {bulkApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Selected ({selectedGrades.size})
                </>
              )}
            </Button>
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value as GradeStatus | '' })}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tutor ID</label>
                <Input
                  placeholder="Enter tutor ID"
                  value={filters.tutorId}
                  onChange={(e) => setFilters({ ...filters, tutorId: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Student ID</label>
                <Input
                  placeholder="Enter student ID"
                  value={filters.studentId}
                  onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Subject</label>
                <Input
                  placeholder="Enter subject name"
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades List */}
        {grades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No grades found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              There are no grades matching your current filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {grades.map((grade) => (
              <Card key={grade.id} className="bg-card border-brand-gold/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedGrades.has(grade.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedGrades)
                          if (e.target.checked) {
                            newSelected.add(grade.id)
                          } else {
                            newSelected.delete(grade.id)
                          }
                          setSelectedGrades(newSelected)
                        }}
                        className="mt-1 h-4 w-4 rounded border-input"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            Grade for {grade.period}
                          </h3>
                          {getStatusBadge(grade.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Student ID:</span>
                            <p className="text-foreground font-medium">{grade.studentId}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tutor ID:</span>
                            <p className="text-foreground font-medium">{grade.tutorId}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Computed Score:</span>
                            <p className="text-foreground font-medium">{grade.computedScore.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Final Score:</span>
                            <p className="text-foreground font-medium">
                              {grade.finalScore ? grade.finalScore.toFixed(1) + '%' : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {grade.overrideReason && (
                          <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                            <p className="text-sm text-yellow-400">
                              <span className="font-semibold">Override Reason:</span> {grade.overrideReason}
                            </p>
                          </div>
                        )}
                        {grade.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                            <p className="text-sm text-red-400">
                              <span className="font-semibold">Rejection Reason:</span> {grade.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/grades/${grade.id}`)}
                        className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                      >
                        View Details
                      </Button>
                      {grade.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (required):')
                              if (reason && reason.trim()) {
                                handleReject(grade.id, reason.trim())
                              }
                            }}
                            className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(grade.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}
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
