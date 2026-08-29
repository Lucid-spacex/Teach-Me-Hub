'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Enrollment, Student } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { GraduationCap } from 'lucide-react'

interface EnrollmentListProps {
  students: Student[]
  onEnrollStudent: () => void
  refreshTrigger?: number
}

export function EnrollmentList({ students, onEnrollStudent, refreshTrigger }: EnrollmentListProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnrollments()
  }, [refreshTrigger])

  const loadEnrollments = async () => {
    try {
      const data = await api.getEnrollments()
      setEnrollments(data)
    } catch (err) {
      console.error('Failed to load enrollments:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    return student?.fullName || 'Unknown'
  }

  const columns = [
    {
      key: 'student',
      header: 'Student',
      cell: (enrollment: Enrollment) => (
        <div className="font-medium">{getStudentName(enrollment.studentId)}</div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject ID',
      cell: (enrollment: Enrollment) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{enrollment.subjectId}</code>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      cell: (enrollment: Enrollment) => enrollment.frequency,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (enrollment: Enrollment) => (
        <StatusBadge status={enrollment.status} />
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      cell: (enrollment: Enrollment) => new Date(enrollment.startDate).toLocaleDateString(),
    },
    {
      key: 'tutor',
      header: 'Tutor',
      cell: (enrollment: Enrollment) => (
        enrollment.tutorId ? (
          <span className="text-sm">Assigned</span>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Enrollments</h2>
        <Button onClick={onEnrollStudent} size="sm" className="gap-2">
          <GraduationCap className="h-4 w-4" />
          Enroll Student
        </Button>
      </div>

      <DataTable
        data={enrollments}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: GraduationCap,
          title: "No enrollments yet",
          description: "Create your first enrollment to start tutoring",
        }}
      />
    </div>
  )
}
