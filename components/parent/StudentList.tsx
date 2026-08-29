'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Student } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

interface StudentListProps {
  onAddStudent?: () => void
  refreshTrigger?: number
}

export function StudentList({ onAddStudent, refreshTrigger }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [refreshTrigger])

  const loadStudents = async () => {
    try {
      const data = await api.getStudents()
      setStudents(data)
    } catch (err) {
      console.error('Failed to load students:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (student: Student) => (
        <div className="font-medium">{student.fullName}</div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      cell: (student: Student) => student.gradeLevel,
    },
    {
      key: 'school',
      header: 'School',
      cell: (student: Student) => student.school || '—',
    },
    {
      key: 'dob',
      header: 'Date of Birth',
      cell: (student: Student) => new Date(student.dateOfBirth).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">My Children</h2>

      {students.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full border p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No students yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Add your first child to get started with tutoring
          </p>
          {onAddStudent && (
            <Button onClick={onAddStudent} className="mt-4 gap-2">
              <Users className="h-4 w-4" />
              Add Your First Child
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          data={students}
          columns={columns}
          loading={loading}
        />
      )}
    </div>
  )
}
