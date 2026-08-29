'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { PendingTutor } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Check, X, GraduationCap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PendingTutorsListProps {
  onUpdate: () => void
  refreshTrigger?: number
}

export function PendingTutorsList({ onUpdate, refreshTrigger }: PendingTutorsListProps) {
  const { toast } = useToast()
  const [tutors, setTutors] = useState<PendingTutor[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadTutors()
  }, [refreshTrigger])

  const loadTutors = async () => {
    try {
      const data = await api.getPendingTutors()
      setTutors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load pending tutors:', err)
      setTutors([])
    } finally {
      setLoading(false)
    }
  }

  const handleVetting = async (tutorId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!tutorId) {
      toast({
        title: "Error",
        description: "Tutor profile ID is missing",
        variant: "destructive",
      })
      return
    }

    setActionLoading(tutorId)
    try {
      await api.updateTutorVetting(tutorId, { vettingStatus: status })
      toast({
        title: `Tutor ${status.toLowerCase()}`,
        description: `Tutor has been ${status.toLowerCase()} successfully`,
      })
      loadTutors()
      onUpdate()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update vetting status',
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (item: PendingTutor) => (
        <div className="font-medium">{item.user?.fullName || 'N/A'}</div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (item: PendingTutor) => item.user?.email || 'N/A',
    },
    {
      key: 'subjects',
      header: 'Subjects',
      cell: (item: PendingTutor) => {
        const subjects = item.tutorProfile?.subjects || []
        return Array.isArray(subjects) ? subjects.join(', ') : 'N/A'
      },
    },
    {
      key: 'rate',
      header: 'Hourly Rate',
      cell: (item: PendingTutor) => `$${item.tutorProfile?.hourlyRate || 0}/hr`,
    },
    {
      key: 'bio',
      header: 'Bio',
      cell: (item: PendingTutor) => (
        <div className="max-w-xs truncate text-sm">{item.tutorProfile?.bio || 'N/A'}</div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (item: PendingTutor) => {
        const tutorProfileId = item.tutorProfile?.id
        if (!tutorProfileId) {
          return <span className="text-sm text-muted-foreground">No profile ID</span>
        }

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleVetting(tutorProfileId, 'APPROVED')}
              disabled={actionLoading === tutorProfileId}
              className="gap-1"
            >
              {actionLoading === tutorProfileId ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleVetting(tutorProfileId, 'REJECTED')}
              disabled={actionLoading === tutorProfileId}
              className="gap-1"
            >
              {actionLoading === tutorProfileId ? (
                <LoadingSpinner size="sm" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pending Tutors</h2>

      <DataTable
        data={tutors}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: GraduationCap,
          title: "No tutors pending vetting",
          description: "Tutors awaiting approval will appear here",
        }}
      />
    </div>
  )
}
