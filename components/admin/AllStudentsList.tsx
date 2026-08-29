'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { AdminStudent } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Users, GraduationCap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AllStudentsListProps {
  refreshTrigger?: number
}

export function AllStudentsList({ refreshTrigger }: AllStudentsListProps) {
  const { toast } = useToast()
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [refreshTrigger])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminStudents()
      setStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load students:', err)
      setStudents([])
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'studentName',
      header: 'Student Name',
      cell: (student: AdminStudent) => (
        <div className="font-medium">{student.fullName}</div>
      ),
    },
    {
      key: 'gradeLevel',
      header: 'Grade Level',
      cell: (student: AdminStudent) => student.gradeLevel,
    },
    {
      key: 'school',
      header: 'School',
      cell: (student: AdminStudent) => student.school || '-',
    },
    {
      key: 'parentName',
      header: 'Parent Name',
      cell: (student: AdminStudent) => student.parentName,
    },
    {
      key: 'dateAdded',
      header: 'Date Added',
      cell: (student: AdminStudent) => new Date(student.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">All Students</h2>

      <DataTable
        data={students}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: Users,
          title: "No students found",
          description: "Students will appear here once parents enroll them",
        }}
      />
    </div>
  )
}
