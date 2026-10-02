'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { TutorWithProfile } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { GraduationCap, UserCheck } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AllTutorsListProps {
  refreshTrigger?: number
}

export function AllTutorsList({ refreshTrigger }: AllTutorsListProps) {
  const { toast } = useToast()
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
      const data = await api.getTutors(params)
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
        const status = tutor.tutorProfile?.vettingStatus || 'NO_PROFILE'
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            status === 'APPROVED' 
              ? 'bg-green-100 text-green-800' 
              : status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : status === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status === 'NO_PROFILE' ? 'No Profile' : status}
          </span>
        )
      },
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
              <SelectItem value="PENDING">Pending</SelectItem>
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
