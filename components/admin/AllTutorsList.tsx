'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { TutorWithProfile } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { GraduationCap, Eye } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AllTutorsListProps {
  refreshTrigger?: number
}

export function AllTutorsList({ refreshTrigger }: AllTutorsListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [tutors, setTutors] = useState<TutorWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadTutors()
  }, [refreshTrigger, statusFilter])

  const loadTutors = async () => {
    setLoading(true)
    try {
      const params = statusFilter === 'ALL' ? undefined : statusFilter
      const response = await api.getTutors(params)
      // API returns { data: [...], page, limit, total }
      const data = (response as any)?.data || response
      setTutors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load tutors:', err)
      setTutors([])
      toast({
        title: "Error",
        description: "Failed to load tutors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTutors = tutors

  const columns = [
    {
      key: 'tutorName',
      header: 'Tutor Name',
      cell: (tutor: TutorWithProfile) => (
        <div className="flex items-center gap-3">
          <Avatar
            fullName={tutor.fullName}
            profilePictureUrl={tutor.profilePictureUrl}
            size="sm"
          />
          <div className="font-medium">{tutor.fullName}</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (tutor: TutorWithProfile) => tutor.email || 'N/A',
    },
    {
      key: 'subjects',
      header: 'Subjects',
      cell: (tutor: TutorWithProfile) => {
        if (!tutor.tutorProfile || !Array.isArray(tutor.tutorProfile.subjects)) {
          return <span className="text-muted-foreground">No profile</span>
        }
        return tutor.tutorProfile.subjects.join(', ')
      },
    },
    {
      key: 'hourlyRate',
      header: 'Hourly Rate',
      cell: (tutor: TutorWithProfile) => {
        if (!tutor.tutorProfile) return <span className="text-muted-foreground">N/A</span>
        return `$${tutor.tutorProfile.hourlyRate || 0}/hr`
      },
    },
    {
      key: 'vettingStatus',
      header: 'Status',
      cell: (tutor: TutorWithProfile) => {
        // User status determines if tutor is active (APPROVED), not vettingStatus
        const userStatus = tutor.status || 'NO_STATUS'
        const vettingStatus = tutor.tutorProfile?.vettingStatus || 'NO_PROFILE'
        // Treat APPROVED as "active" in every badge, filter, and check
        const status = userStatus === 'APPROVED' ? 'APPROVED' : vettingStatus
        const statusStr = String(status)
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            statusStr === 'APPROVED'
              ? 'bg-green-100 text-green-800'
              : statusStr === 'PENDING' || statusStr === 'PENDING_VETTING'
              ? 'bg-yellow-100 text-yellow-800'
              : statusStr === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : statusStr === 'NO_PROFILE'
              ? 'bg-orange-100 text-orange-800'
              : statusStr === 'SUSPENDED'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {statusStr === 'NO_PROFILE' ? 'No Profile' : statusStr}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (tutor: TutorWithProfile) => (
        <Button
          size="sm"
          onClick={() => router.push(`/admin/tutors/${tutor.id}`)}
          className="gap-2 bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Tutors</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter:</label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING_VETTING">Pending Vetting</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={filteredTutors}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: GraduationCap,
          title: "No tutors found",
          description: "Tutors will appear here once they register and create profiles",
        }}
      />
    </div>
  )
}
